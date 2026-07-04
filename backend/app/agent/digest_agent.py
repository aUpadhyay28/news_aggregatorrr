"""
DigestAgent — summarizes a single article/video into a title + summary.

Refactored to depend on `BaseLLMProvider` via dependency injection instead of
importing the OpenAI SDK directly. Prompt text and structured-output parsing
now live in `app.llm.base.BaseLLMProvider.generate_digest`; the deterministic
fallback lives in `app.llm.rule_based_provider.RuleBasedProvider`.
"""

import asyncio
from typing import Optional

from app.llm.base import BaseLLMProvider
from app.llm.factory import get_default_provider
from app.llm.models import DigestOutput

__all__ = ["DigestAgent", "DigestOutput"]


class DigestAgent:
    def __init__(self, provider: Optional[BaseLLMProvider] = None):
        self.provider: BaseLLMProvider = provider or get_default_provider()

    def generate_digest(self, title: str, content: str, article_type: str) -> Optional[DigestOutput]:
        return asyncio.run(self.provider.generate_digest(title=title, content=content, article_type=article_type))
