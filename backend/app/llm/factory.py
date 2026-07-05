"""
Factory for constructing LLM providers, plus the automatic fallback chain.

Reads `LLM_PROVIDER` (openai | groq | ollama) from configuration to decide
which provider is preferred, then builds a resilient chain:

    <preferred provider> -> groq -> openai -> ollama -> rule-based

(deduplicated, preferred first). If a provider fails at call time, the next
one in the chain is tried transparently — the application never crashes
purely because an LLM backend is unavailable.

Adding a new provider only requires calling `register_provider()`; no
existing code needs to change.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Type

from functools import lru_cache
from app.config import LLMConfig, get_llm_config
from app.llm.base import BaseLLMProvider
from app.llm.exceptions import AllProvidersUnavailableError, LLMError
from app.llm.groq_provider import GroqProvider
from app.llm.ollama_provider import OllamaProvider
from app.llm.openai_provider import OpenAIProvider
from app.llm.rule_based_provider import RuleBasedProvider

logger = logging.getLogger("app.llm.factory")

_PROVIDER_REGISTRY: Dict[str, Type[BaseLLMProvider]] = {
    "openai": OpenAIProvider,
    "groq": GroqProvider,
    "ollama": OllamaProvider,
    "rule_based": RuleBasedProvider,
}


def register_provider(name: str, provider_cls: Type[BaseLLMProvider]) -> None:
    """Register a new provider implementation without modifying this file's
    body — enables painless addition of future providers (e.g. Anthropic,
    Azure OpenAI, Bedrock)."""
    _PROVIDER_REGISTRY[name.lower()] = provider_cls


def _build_provider(name: str, settings: LLMConfig) -> BaseLLMProvider:
    name = name.lower().strip()
    provider_cls = _PROVIDER_REGISTRY.get(name)
    if provider_cls is None:
        raise ValueError(f"Unknown LLM provider '{name}'. Available: {sorted(_PROVIDER_REGISTRY)}")

    if provider_cls is OpenAIProvider:
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            top_p=settings.top_p,
            timeout=settings.request_timeout,
        )
    if provider_cls is GroqProvider:
        return GroqProvider(
            api_key=settings.groq_api_key,
            model=settings.groq_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            top_p=settings.top_p,
            timeout=settings.request_timeout,
        )
    if provider_cls is OllamaProvider:
        return OllamaProvider(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            top_p=settings.top_p,
            timeout=settings.request_timeout,
        )
    # Any custom/registered provider is assumed to accept the common kwargs.
    return provider_cls(
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
        top_p=settings.top_p,
    )


class FallbackLLMProvider(BaseLLMProvider):
    """Wraps an ordered chain of providers. Every high-level call tries each
    provider in turn until one succeeds; if all fail, the last exception is
    raised (in practice the chain always ends with RuleBasedProvider, which
    never fails, so callers should never see this bubble up)."""

    def __init__(self, providers: List[BaseLLMProvider]):
        if not providers:
            raise ValueError("FallbackLLMProvider requires at least one provider")
        primary = providers[0]
        super().__init__(
            model="fallback-chain",
            temperature=primary.temperature,
            max_tokens=primary.max_tokens,
            top_p=primary.top_p,
            timeout=primary.timeout,
        )
        self._providers = providers

    @property
    def provider_name(self) -> str:
        return "fallback(" + "->".join(p.provider_name for p in self._providers) + ")"

    async def is_available(self) -> bool:
        for provider in self._providers:
            if await provider.is_available():
                return True
        return False

    async def _run_with_fallback(self, method_name: str, *args, **kwargs):
        last_error: Optional[Exception] = None
        for index, provider in enumerate(self._providers):
            try:
                if not await provider.is_available():
                    continue
                method = getattr(provider, method_name)
                result = await method(*args, **kwargs)
                if index > 0:
                    logger.warning(
                        "llm_fallback_engaged served_by=%s after %d earlier provider(s) failed",
                        provider.provider_name,
                        index,
                    )
                return result
            except LLMError as error:
                logger.error(
                    "llm_provider_failed provider=%s operation=%s error=%s",
                    provider.provider_name,
                    method_name,
                    error,
                )
                last_error = error
                continue
        raise last_error or AllProvidersUnavailableError()

    # -- Low-level primitives (required for ABC compliance / direct use) --
    async def _generate_text(self, system_prompt, user_prompt, temperature=None, max_tokens=None):
        return await self._run_with_fallback(
            "_generate_text", system_prompt, user_prompt, temperature=temperature, max_tokens=max_tokens
        )

    async def _generate_structured(self, system_prompt, user_prompt, schema, temperature=None):
        return await self._run_with_fallback(
            "_generate_structured", system_prompt, user_prompt, schema, temperature=temperature
        )

    async def embed(self, text: str):
        return await self._run_with_fallback("embed", text)

    # -- High-level overrides (route through the chain, not through this
    #    class's own base-class implementation, so each provider's own
    #    prompt/parsing logic is used) --------------------------------
    async def chat(self, message: str, system_prompt: Optional[str] = None, temperature: Optional[float] = None):
        return await self._run_with_fallback("chat", message, system_prompt=system_prompt, temperature=temperature)

    async def summarize(self, text: str, max_sentences: int = 3):
        return await self._run_with_fallback("summarize", text, max_sentences=max_sentences)

    async def generate_digest(self, title: str, content: str, article_type: str):
        return await self._run_with_fallback("generate_digest", title, content, article_type)

    async def rank_articles(self, digests: List[dict], user_profile: dict):
        return await self._run_with_fallback("rank_articles", digests, user_profile)

    async def generate_email_introduction(self, user_profile: dict, ranked_articles: List):
        return await self._run_with_fallback("generate_email_introduction", user_profile, ranked_articles)

    async def classify(self, text: str, categories: List[str]):
        return await self._run_with_fallback("classify", text, categories)

    async def generate_chat_response(self, user_profile: dict, context_items: List[dict], message: str):
        return await self._run_with_fallback("generate_chat_response", user_profile, context_items, message)


def create_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    """Build a single provider instance directly (no fallback chain)."""
    settings = get_llm_config()
    name = (provider_name or settings.provider.value).lower()
    return _build_provider(name, settings)


def create_provider_with_fallback(order: Optional[List[str]] = None) -> BaseLLMProvider:
    """
    Build the resilient chain described in the architecture spec:
    <preferred> -> groq -> openai -> ollama -> rule-based (deduplicated).
    """
    settings = get_llm_config()
    default_order = ["groq", "openai", "ollama"]
    chain_names: List[str] = []

    preferred = settings.provider.value
    if preferred and preferred in _PROVIDER_REGISTRY and preferred != "rule_based":
        chain_names.append(preferred)

    for name in (order or default_order):
        if name not in chain_names:
            chain_names.append(name)

    providers: List[BaseLLMProvider] = []
    for name in chain_names:
        try:
            providers.append(_build_provider(name, settings))
        except Exception as error:  # noqa: BLE001
            logger.warning("Skipping provider '%s' while building fallback chain: %s", name, error)

    providers.append(_build_provider("rule_based", settings))
    return FallbackLLMProvider(providers)


def get_default_provider() -> BaseLLMProvider:
    """The provider every service/agent should use by default: the
    configured provider, wrapped in the automatic fallback chain."""
    return create_provider_with_fallback()
