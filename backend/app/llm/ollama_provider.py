"""
Ollama provider.

Talks to a local Ollama daemon using its native REST API (`/api/chat`,
`/api/embeddings`) via `httpx`. Deliberately does NOT use the OpenAI SDK,
per architecture requirements, since Ollama's OpenAI-compatibility layer is
optional/partial and we want direct control over structured-output prompting.
"""

from __future__ import annotations

from typing import Optional, Type, TypeVar

import httpx
from pydantic import BaseModel

from app.llm.base import BaseLLMProvider
from app.llm.exceptions import (
    LLMAPIError,
    LLMConnectionError,
    LLMError,
    LLMTimeoutError,
)
from app.llm.models import ChatResult, EmbeddingResult, LLMUsage

T = TypeVar("T", bound=BaseModel)

DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama3.1:8b"


class OllamaProvider(BaseLLMProvider):
    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        model: str = DEFAULT_MODEL,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 1.0,
        timeout: float = 30.0,
    ):
        super().__init__(model=model, temperature=temperature, max_tokens=max_tokens, top_p=top_p, timeout=timeout)
        self.base_url = base_url.rstrip("/")

    def _translate_error(self, error: BaseException) -> LLMError:
        if isinstance(error, httpx.TimeoutException):
            return LLMTimeoutError(str(error), provider=self.provider_name, original_error=error)
        if isinstance(error, httpx.ConnectError):
            return LLMConnectionError(str(error), provider=self.provider_name, original_error=error)
        if isinstance(error, httpx.HTTPStatusError):
            return LLMAPIError(
                f"Ollama returned HTTP {error.response.status_code}: {error.response.text}",
                provider=self.provider_name,
                original_error=error,
            )
        return LLMAPIError(str(error), provider=self.provider_name, original_error=error)

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:  # noqa: BLE001
            return False

    async def _chat(self, system_prompt: str, user_prompt: str, temperature: Optional[float], json_format: bool) -> dict:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
            "options": {
                "temperature": temperature if temperature is not None else self.temperature,
                "top_p": self.top_p,
                "num_predict": self.max_tokens,
            },
        }
        if json_format:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as error:
            raise self._translate_error(error) from error
        except httpx.HTTPError as error:
            raise self._translate_error(error) from error

    async def _generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResult:
        with self._timed_call("generate_text") as info:
            data = await self._chat(system_prompt, user_prompt, temperature, json_format=False)
            prompt_tokens = data.get("prompt_eval_count", 0) or 0
            completion_tokens = data.get("eval_count", 0) or 0
            info["total_tokens"] = prompt_tokens + completion_tokens

            content = (data.get("message") or {}).get("content", "")
            return ChatResult(
                content=content.strip(),
                provider=self.provider_name,
                model=self.model,
                latency_ms=0.0,
                usage=LLMUsage(
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=prompt_tokens + completion_tokens,
                ),
            )

    async def _generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[T],
        temperature: Optional[float] = None,
    ) -> T:
        with self._timed_call("generate_structured") as info:
            schema_instructions = self._json_schema_instructions(schema)
            data = await self._chat(
                system_prompt,
                user_prompt + schema_instructions,
                temperature,
                json_format=True,
            )
            prompt_tokens = data.get("prompt_eval_count", 0) or 0
            completion_tokens = data.get("eval_count", 0) or 0
            info["total_tokens"] = prompt_tokens + completion_tokens

            raw_text = (data.get("message") or {}).get("content", "")
            return self._parse_json_response(raw_text, schema)

    async def embed(self, text: str) -> EmbeddingResult:
        with self._timed_call("embed") as info:
            payload = {"model": self.model, "prompt": text}
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(f"{self.base_url}/api/embeddings", json=payload)
                    response.raise_for_status()
                    data = response.json()
            except httpx.HTTPError as error:
                raise self._translate_error(error) from error

            vector = data.get("embedding", [])
            info["total_tokens"] = None
            return EmbeddingResult.from_vector(vector, provider=self.provider_name, model=self.model)
