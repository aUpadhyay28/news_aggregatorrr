"""
Provider-agnostic LLM abstraction layer.

Business logic (agents, services, pipelines) should ONLY depend on
`BaseLLMProvider` and the factory functions exposed here. No module outside
this package should import the `openai` SDK or make raw HTTP calls to Ollama.
"""

from app.llm.base import BaseLLMProvider
from app.llm.exceptions import (
    LLMAPIError,
    LLMAuthenticationError,
    LLMConnectionError,
    LLMError,
    LLMRateLimitError,
    LLMTimeoutError,
)
from app.llm.factory import (
    create_provider,
    create_provider_with_fallback,
    get_default_provider,
    register_provider,
)
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

__all__ = [
    "BaseLLMProvider",
    "LLMError",
    "LLMAPIError",
    "LLMAuthenticationError",
    "LLMConnectionError",
    "LLMRateLimitError",
    "LLMTimeoutError",
    "create_provider",
    "create_provider_with_fallback",
    "get_default_provider",
    "register_provider",
    "ChatResult",
    "ClassificationResult",
    "DigestOutput",
    "EmailIntroduction",
    "EmbeddingResult",
    "LLMUsage",
    "RankedArticle",
    "RankedDigestList",
]
