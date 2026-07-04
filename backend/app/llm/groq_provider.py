"""
Groq provider.

Groq exposes an OpenAI-compatible Chat Completions API, so we reuse the
`openai` SDK purely as an HTTP client (pointed at Groq's base_url) rather than
depending on Groq's own SDK. Groq does not support OpenAI's newer "Responses"
API or native structured-output parsing, so structured responses are obtained
via JSON-mode prompting + shared JSON parsing/validation from `BaseLLMProvider`.
"""

from __future__ import annotations

from typing import Optional, Type, TypeVar

import openai
from openai import AsyncOpenAI
from pydantic import BaseModel

from app.llm.base import BaseLLMProvider
from app.llm.exceptions import (
    LLMAPIError,
    LLMAuthenticationError,
    LLMConnectionError,
    LLMError,
    LLMRateLimitError,
    LLMTimeoutError,
)
from app.llm.models import ChatResult, EmbeddingResult, LLMUsage

T = TypeVar("T", bound=BaseModel)

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
DEFAULT_MODEL = "llama-3.3-70b-versatile"


class GroqProvider(BaseLLMProvider):
    def __init__(
        self,
        api_key: Optional[str],
        model: str = DEFAULT_MODEL,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 1.0,
        timeout: float = 30.0,
    ):
        super().__init__(model=model, temperature=temperature, max_tokens=max_tokens, top_p=top_p, timeout=timeout)
        self.api_key = api_key
        self._client: Optional[AsyncOpenAI] = (
            AsyncOpenAI(api_key=api_key, base_url=GROQ_BASE_URL, timeout=timeout) if api_key else None
        )

    async def is_available(self) -> bool:
        return self._client is not None

    def _require_client(self) -> AsyncOpenAI:
        if self._client is None:
            raise LLMAuthenticationError("GROQ_API_KEY is not configured", provider=self.provider_name)
        return self._client

    def _translate_error(self, error: BaseException) -> LLMError:
        if isinstance(error, openai.APITimeoutError):
            return LLMTimeoutError(str(error), provider=self.provider_name, original_error=error)
        if isinstance(error, openai.AuthenticationError):
            return LLMAuthenticationError(str(error), provider=self.provider_name, original_error=error)
        if isinstance(error, openai.RateLimitError):
            return LLMRateLimitError(str(error), provider=self.provider_name, original_error=error)
        if isinstance(error, openai.APIConnectionError):
            return LLMConnectionError(str(error), provider=self.provider_name, original_error=error)
        if isinstance(error, openai.APIError):
            return LLMAPIError(str(error), provider=self.provider_name, original_error=error)
        return LLMAPIError(str(error), provider=self.provider_name, original_error=error)

    async def _chat_completion(self, system_prompt: str, user_prompt: str, temperature: Optional[float], json_mode: bool):
        client = self._require_client()
        kwargs = {}
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            return await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature if temperature is not None else self.temperature,
                max_tokens=self.max_tokens,
                top_p=self.top_p,
                **kwargs,
            )
        except Exception as error:  # noqa: BLE001
            raise self._translate_error(error) from error

    async def _generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResult:
        with self._timed_call("generate_text") as info:
            response = await self._chat_completion(system_prompt, user_prompt, temperature, json_mode=False)
            usage = getattr(response, "usage", None)
            info["total_tokens"] = getattr(usage, "total_tokens", None)

            content = response.choices[0].message.content or ""
            return ChatResult(
                content=content.strip(),
                provider=self.provider_name,
                model=self.model,
                latency_ms=0.0,
                usage=LLMUsage(
                    prompt_tokens=getattr(usage, "prompt_tokens", 0) or 0,
                    completion_tokens=getattr(usage, "completion_tokens", 0) or 0,
                    total_tokens=getattr(usage, "total_tokens", 0) or 0,
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
            response = await self._chat_completion(
                system_prompt,
                user_prompt + schema_instructions,
                temperature,
                json_mode=True,
            )
            usage = getattr(response, "usage", None)
            info["total_tokens"] = getattr(usage, "total_tokens", None)

            raw_text = response.choices[0].message.content or ""
            return self._parse_json_response(raw_text, schema)

    async def embed(self, text: str) -> EmbeddingResult:
        raise LLMAPIError(
            "Groq does not currently offer an embeddings endpoint; "
            "configure OpenAI or Ollama for embedding operations.",
            provider=self.provider_name,
        )
