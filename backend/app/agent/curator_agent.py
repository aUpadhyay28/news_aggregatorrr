"""
CuratorAgent — ranks digests for a user profile.

Refactored to depend on `BaseLLMProvider` via dependency injection instead of
importing the OpenAI SDK directly. All prompt text and ranking logic now
lives in `app.llm.base.BaseLLMProvider.rank_articles` (LLM-backed providers)
and `app.llm.rule_based_provider.RuleBasedProvider.rank_articles` (fallback),
so this class is now a thin, synchronous facade kept for backwards
compatibility with `process_curator.py` / `process_email.py`.
"""

import asyncio
from typing import List, Optional

from app.llm.base import BaseLLMProvider
from app.llm.factory import get_default_provider
from app.llm.models import RankedArticle

# Re-exported for backwards compatibility with any code importing these names
# from `app.agent.curator_agent`.
__all__ = ["CuratorAgent", "RankedArticle"]


class CuratorAgent:
    def __init__(self, user_profile: dict, provider: Optional[BaseLLMProvider] = None):
        self.user_profile = user_profile
        self.provider: BaseLLMProvider = provider or get_default_provider()

    def rank_digests(self, digests: List[dict]) -> List[RankedArticle]:
        if not digests:
            return []
        return asyncio.run(self.provider.rank_articles(digests, self.user_profile))
