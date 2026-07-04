"""
Rule-based provider.

This is the last link in the fallback chain (Groq -> OpenAI -> Ollama ->
rule-based). It never calls a network API and therefore can never fail —
guaranteeing the application never crashes purely because every LLM backend
is unavailable. It reimplements the original heuristic fallbacks that used
to live inline inside CuratorAgent/DigestAgent/EmailAgent.

Because this provider produces deterministic, non-LLM output, it overrides
the high-level template methods directly instead of the low-level
`_generate_text` / `_generate_structured` primitives (there is no "structured
completion" to make — the ranking/summary logic itself IS the fallback).
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional, Type, TypeVar

from pydantic import BaseModel

from app.llm.base import BaseLLMProvider
from app.llm.models import (
    ChatResult,
    ClassificationResult,
    DigestOutput,
    EmailIntroduction,
    EmbeddingResult,
    LLMUsage,
    RankedArticle,
)

T = TypeVar("T", bound=BaseModel)


class RuleBasedProvider(BaseLLMProvider):
    """Keyword/recency heuristics — no external calls, always available."""

    def __init__(self, temperature: float = 0.7, max_tokens: int = 1024, top_p: float = 1.0):
        super().__init__(model="rule-based", temperature=temperature, max_tokens=max_tokens, top_p=top_p, timeout=0.0)

    async def is_available(self) -> bool:
        return True

    # -- Low-level primitives (present for ABC compliance; the high-level
    #    methods below are overridden so these are not exercised in normal
    #    operation) ------------------------------------------------------
    async def _generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> ChatResult:
        return ChatResult(
            content=(
                "I couldn't reach any AI provider right now, so here is the most relevant context "
                "from your current feed instead:\n" + user_prompt[:500]
            ),
            provider=self.provider_name,
            model=self.model,
            latency_ms=0.0,
            usage=LLMUsage(),
            used_fallback=True,
        )

    async def _generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Type[T],
        temperature: Optional[float] = None,
    ) -> T:
        raise NotImplementedError(
            "RuleBasedProvider overrides high-level methods directly instead of "
            "using generic structured completion."
        )

    async def embed(self, text: str) -> EmbeddingResult:
        # Deterministic bag-of-characters pseudo-embedding so downstream code
        # that merely needs *some* fixed-length vector doesn't crash.
        buckets = [0.0] * 32
        for index, char in enumerate(text[:2048]):
            buckets[index % 32] += ord(char)
        norm = max(sum(buckets), 1.0)
        vector = [value / norm for value in buckets]
        return EmbeddingResult.from_vector(vector, provider=self.provider_name, model=self.model)

    # -- High-level overrides --------------------------------------------
    async def rank_articles(self, digests: List[dict], user_profile: dict) -> List[RankedArticle]:
        if not digests:
            return []

        interests = [interest.lower() for interest in user_profile.get("interests", [])]
        ranked: List[RankedArticle] = []

        for digest in digests:
            haystack = f"{digest.get('title', '')} {digest.get('summary', '')}".lower()
            keyword_score = sum(1 for interest in interests if interest in haystack)

            created_at = digest.get("created_at")
            recency_bonus = 0.0
            if created_at:
                created_at = created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc)
                hours_old = max((datetime.now(timezone.utc) - created_at).total_seconds() / 3600, 0)
                recency_bonus = max(0.0, 2.0 - min(hours_old / 24, 2.0))

            score = min(10.0, 5.0 + keyword_score + recency_bonus)
            ranked.append(
                RankedArticle(
                    digest_id=digest["id"],
                    relevance_score=round(score, 1),
                    rank=1,
                    reasoning="Fallback ranking based on user interest keywords and recency.",
                )
            )

        ranked.sort(key=lambda article: article.relevance_score, reverse=True)
        for index, article in enumerate(ranked, start=1):
            article.rank = index
        return ranked

    async def generate_digest(self, title: str, content: str, article_type: str) -> DigestOutput:
        clean_content = " ".join((content or "").split())
        excerpt = (
            clean_content[:320].rsplit(" ", 1)[0] + "..." if len(clean_content) > 320 else clean_content
        )
        if not excerpt:
            excerpt = "A new AI update was collected, but detailed source content is still being prepared."

        return DigestOutput(
            title=title[:90],
            summary=f"{article_type.title()} digest: {excerpt}",
        )

    async def generate_email_introduction(self, user_profile: dict, ranked_articles: List) -> EmailIntroduction:
        current_date = datetime.now(timezone.utc).strftime("%B %d, %Y")
        name = user_profile.get("name", "there")

        if not ranked_articles:
            return EmailIntroduction(
                greeting=f"Hey {name}, here is your daily digest of AI news for {current_date}.",
                introduction="No articles were ranked today.",
            )

        return EmailIntroduction(
            greeting=f"Hey {name}, here is your daily digest of AI news for {current_date}.",
            introduction="Here are the top AI news articles ranked by relevance to your interests.",
        )

    async def classify(self, text: str, categories: List[str]) -> ClassificationResult:
        lowered = text.lower()
        best_category = categories[0] if categories else "uncategorized"
        best_score = -1
        for category in categories:
            score = lowered.count(category.lower())
            if score > best_score:
                best_score = score
                best_category = category

        return ClassificationResult(
            label=best_category,
            confidence=0.3,
            reasoning="Fallback keyword-frequency classification (no LLM available).",
        )

    async def chat(
        self,
        message: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> ChatResult:
        return ChatResult(
            content=(
                "I couldn't reach any AI provider right now. Please try again shortly, "
                "or check that at least one LLM_PROVIDER is configured with valid credentials."
            ),
            provider=self.provider_name,
            model=self.model,
            latency_ms=0.0,
            usage=LLMUsage(),
            used_fallback=True,
        )
