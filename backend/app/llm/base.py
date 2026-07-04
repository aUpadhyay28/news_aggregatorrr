"""
Abstract base class every LLM provider must implement.

Design notes
------------
- Callers (agents/services) only ever talk to `BaseLLMProvider`. They never
  know whether the concrete instance is OpenAI, Groq, Ollama, a fallback
  chain, or the rule-based provider.
- High-level, business-facing methods (`chat`, `summarize`, `rank_articles`,
  `generate_digest`, `generate_email_introduction`, `classify`) are
  implemented ONCE here as template methods. They build prompts (via
  `app.llm.prompts`) and delegate to two low-level primitives that each
  concrete provider must supply:
    * `_generate_text`       -> free-form text completion
    * `_generate_structured` -> completion parsed into a Pydantic model
  This is what prevents prompt/parsing logic from being duplicated across
  provider subclasses.
- `embed` is a separate low-level primitive since not all providers/models
  support it identically.
"""

from __future__ import annotations

import json
import logging
import re
import time
from abc import ABC, abstractmethod
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Dict, List, Optional, Type, TypeVar

from pydantic import BaseModel, ValidationError

from app.llm.exceptions import LLMParsingError
from app.llm.models import (
    ChatResult,
    ClassificationResult,
    DigestOutput,
    EmailIntroduction,
    EmbeddingResult,
    LLMUsage,
    RankedArticle,
    RankedDigestList,
)
from app.llm.prompts import (
    CHAT_SYSTEM_PROMPT,
    build_chat_user_prompt,
    build_classification_user_prompt,
    build_curator_system_prompt,
    build_digest_user_prompt,
    build_email_intro_user_prompt,
    build_rank_articles_user_prompt,
    DIGEST_SYSTEM_PROMPT,
    EMAIL_SYSTEM_PROMPT,
)

logger = logging.getLogger("app.llm")

T = TypeVar("T", bound=BaseModel)


class BaseLLMProvider(ABC):
    """Provider-agnostic contract for every LLM backend."""

    def __init__(
        self,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        top_p: float = 1.0,
        timeout: float = 30.0,
    ):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.top_p = top_p
        self.timeout = timeout

    # ------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------
    @property
    def provider_name(self) -> str:
        return self.__class__.__name__.replace("Provider", "").lower()

    # ------------------------------------------------------------------
    # Low-level primitives — every concrete provider MUST implement these.
    # ------------------------------------------------------------------
    @abstractmethod
    async def is_available(self) -> bool:
        """Cheap check for whether this provider is usable right now
        (has credentials / is reachable)."""
        raise NotImplementedError

    @abstractmethod
    async def _generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResult:
        raise NotImplementedError

    @abstractmethod
    async def _generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[T],
        temperature: Optional[float] = None,
    ) -> T:
        raise NotImplementedError

    @abstractmethod
    async def embed(self, text: str) -> EmbeddingResult:
        raise NotImplementedError

    # ------------------------------------------------------------------
    # Shared helpers usable by every subclass (no duplication needed)
    # ------------------------------------------------------------------
    @contextmanager
    def _timed_call(self, operation: str):
        """Context manager that logs latency/errors consistently for every
        provider. Yields a mutable dict the caller can fill in with
        token/usage info before the block exits."""
        start = time.perf_counter()
        info: Dict = {}
        try:
            yield info
            latency_ms = (time.perf_counter() - start) * 1000
            logger.info(
                "llm_call provider=%s model=%s operation=%s latency_ms=%.1f tokens=%s",
                self.provider_name,
                self.model,
                operation,
                latency_ms,
                info.get("total_tokens", "n/a"),
            )
            info["latency_ms"] = latency_ms
        except Exception as error:  # noqa: BLE001 - re-raised after logging
            latency_ms = (time.perf_counter() - start) * 1000
            logger.error(
                "llm_call_failed provider=%s model=%s operation=%s latency_ms=%.1f error=%s",
                self.provider_name,
                self.model,
                operation,
                latency_ms,
                error,
            )
            raise

    @staticmethod
    def _json_schema_instructions(schema: Type[BaseModel]) -> str:
        """Appends machine-readable schema guidance for providers (Groq,
        Ollama) that don't have native structured-output parsing."""
        field_lines = []
        for name, field in schema.model_fields.items():
            type_name = getattr(field.annotation, "__name__", str(field.annotation))
            description = field.description or ""
            field_lines.append(f'  "{name}": <{type_name}> {("- " + description) if description else ""}')
        fields_block = "\n".join(field_lines)
        return (
            "\n\nRespond with ONLY a single valid JSON object (no markdown fences, no prose) "
            f"matching exactly this shape:\n{{\n{fields_block}\n}}"
        )

    @staticmethod
    def _parse_json_response(raw_text: str, schema: Type[T]) -> T:
        """Best-effort extraction + validation of a JSON object embedded in a
        raw LLM text response. Shared by Groq and Ollama providers."""
        cleaned = raw_text.strip()
        cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        json_str = match.group(0) if match else cleaned

        try:
            data = json.loads(json_str)
            return schema.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as error:
            raise LLMParsingError(
                f"Could not parse structured response into {schema.__name__}: {error}",
                provider="parser",
                original_error=error,
            ) from error

    # ------------------------------------------------------------------
    # High-level, business-facing API — implemented once, shared by all
    # ------------------------------------------------------------------
    async def chat(
        self,
        message: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> ChatResult:
        return await self._generate_text(
            system_prompt=system_prompt or CHAT_SYSTEM_PROMPT,
            user_prompt=message,
            temperature=temperature,
        )

    async def summarize(self, text: str, max_sentences: int = 3) -> str:
        system_prompt = (
            f"Summarize the given text in at most {max_sentences} sentences. "
            "Be concise and preserve the key facts. Respond with the summary only."
        )
        result = await self._generate_text(system_prompt=system_prompt, user_prompt=text[:8000])
        return result.content.strip()

    async def generate_digest(self, title: str, content: str, article_type: str) -> DigestOutput:
        user_prompt = build_digest_user_prompt(title=title, content=content, article_type=article_type)
        return await self._generate_structured(
            system_prompt=DIGEST_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            schema=DigestOutput,
            temperature=0.7,
        )

    async def rank_articles(self, digests: List[dict], user_profile: dict) -> List[RankedArticle]:
        if not digests:
            return []

        system_prompt = build_curator_system_prompt(user_profile)
        user_prompt = build_rank_articles_user_prompt(digests)

        result = await self._generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            schema=RankedDigestList,
            temperature=0.3,
        )
        return result.articles

    async def generate_email_introduction(
        self,
        user_profile: dict,
        ranked_articles: List,
    ) -> EmailIntroduction:
        current_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

        if not ranked_articles:
            return EmailIntroduction(
                greeting=(
                    f"Hey {user_profile.get('name')}, here is your daily digest of AI news for {current_date}."
                ),
                introduction="No articles were ranked today.",
            )

        user_prompt = build_email_intro_user_prompt(user_profile, ranked_articles, current_date)
        intro = await self._generate_structured(
            system_prompt=EMAIL_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            schema=EmailIntroduction,
            temperature=0.7,
        )

        expected_prefix = f"Hey {user_profile.get('name')}"
        if not intro.greeting.startswith(expected_prefix):
            intro.greeting = f"Hey {user_profile.get('name')}, here is your daily digest of AI news for {current_date}."
        return intro

    async def classify(self, text: str, categories: List[str]) -> ClassificationResult:
        system_prompt = "You are a precise text classifier."
        user_prompt = build_classification_user_prompt(text, categories)
        return await self._generate_structured(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            schema=ClassificationResult,
            temperature=0.0,
        )

    async def generate_chat_response(
        self,
        user_profile: dict,
        context_items: List[dict],
        message: str,
    ) -> ChatResult:
        user_prompt = build_chat_user_prompt(user_profile, context_items, message)
        return await self._generate_text(system_prompt=CHAT_SYSTEM_PROMPT, user_prompt=user_prompt)
