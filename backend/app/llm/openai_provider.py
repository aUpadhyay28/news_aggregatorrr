"""
OpenAI provider.

This is the ONLY module in the entire codebase permitted to `import openai`.
All previous direct SDK usage from curator_agent.py, digest_agent.py,
email_agent.py and feed_service.py has been consolidated here.
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

DEFAULT_MODEL = "gpt-4.1"
DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"


class OpenAIProvider(BaseLLMProvider):
    def __init__(
        self,
        api_key: Optional[str],
        model: str = DEFAULT_MODEL,
        embedding_model: str = DEFAULT_EMBEDDING_MODEL,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 1.0,
        timeout: float = 30.0,
    ):
        super().__init__(model=model, temperature=temperature, max_tokens=max_tokens, top_p=top_p, timeout=timeout)
        self.api_key = api_key
        self.embedding_model = embedding_model
        self._client: Optional[AsyncOpenAI] = (
            AsyncOpenAI(api_key=api_key, timeout=timeout) if api_key else None
        )

    async def is_available(self) -> bool:
        return self._client is not None

    def _require_client(self) -> AsyncOpenAI:
        if self._client is None:
            raise LLMAuthenticationError("OPENAI_API_KEY is not configured", provider=self.provider_name)
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

    async def _generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResult:
        client = self._require_client()
        with self._timed_call("generate_text") as info:
            try:
                response = await client.responses.create(
                    model=self.model,
                    instructions=system_prompt,
                    input=user_prompt,
                    temperature=temperature if temperature is not None else self.temperature,
                )
            except Exception as error:  # noqa: BLE001
                raise self._translate_error(error) from error

            usage = getattr(response, "usage", None)
            info["total_tokens"] = getattr(usage, "total_tokens", None)

            return ChatResult(
                content=(getattr(response, "output_text", "") or "").strip(),
                provider=self.provider_name,
                model=self.model,
                latency_ms=0.0,  # patched below via _timed_call info
                usage=LLMUsage(
                    prompt_tokens=getattr(usage, "input_tokens", 0) or 0,
                    completion_tokens=getattr(usage, "output_tokens", 0) or 0,
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
        client = self._require_client()
        with self._timed_call("generate_structured") as info:
            try:
                response = await client.responses.parse(
                    model=self.model,
                    instructions=system_prompt,
                    input=user_prompt,
                    temperature=temperature if temperature is not None else self.temperature,
                    text_format=schema,
                )
            except Exception as error:  # noqa: BLE001
                raise self._translate_error(error) from error

            usage = getattr(response, "usage", None)
            info["total_tokens"] = getattr(usage, "total_tokens", None)

            parsed = response.output_parsed
            if parsed is None:
                raise LLMAPIError("OpenAI returned no parsed structured output", provider=self.provider_name)
            return parsed

    async def embed(self, text: str) -> EmbeddingResult:
        client = self._require_client()
        with self._timed_call("embed") as info:
            try:
                response = await client.embeddings.create(model=self.embedding_model, input=text)
            except Exception as error:  # noqa: BLE001
                raise self._translate_error(error) from error

            usage = getattr(response, "usage", None)
            info["total_tokens"] = getattr(usage, "total_tokens", None)
            vector = response.data[0].embedding
            return EmbeddingResult.from_vector(vector, provider=self.provider_name, model=self.embedding_model)
