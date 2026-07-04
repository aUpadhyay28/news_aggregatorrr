"""
Consistent exception hierarchy shared by every LLM provider.

Every provider MUST translate SDK/HTTP-specific errors into one of these
exceptions so that upstream code (the fallback chain, services, agents)
can handle failures uniformly regardless of which provider raised them.
"""

from __future__ import annotations

from typing import Optional


class LLMError(Exception):
    """Base class for all LLM-provider related errors."""

    def __init__(self, message: str, provider: str = "unknown", original_error: Optional[BaseException] = None):
        self.provider = provider
        self.original_error = original_error
        super().__init__(f"[{provider}] {message}")


class LLMTimeoutError(LLMError):
    """The provider did not respond within the configured timeout."""


class LLMConnectionError(LLMError):
    """A network-level failure occurred while reaching the provider."""


class LLMAuthenticationError(LLMError):
    """The provider rejected the request due to a missing/invalid API key."""


class LLMRateLimitError(LLMError):
    """The provider throttled the request (HTTP 429 or equivalent)."""


class LLMAPIError(LLMError):
    """A generic non-2xx response or SDK-level error from the provider."""


class LLMParsingError(LLMError):
    """The provider responded, but the output could not be parsed into the
    expected structured schema."""


class AllProvidersUnavailableError(LLMError):
    """Every provider in the fallback chain failed."""

    def __init__(self, message: str = "All configured LLM providers failed"):
        super().__init__(message, provider="fallback-chain")
