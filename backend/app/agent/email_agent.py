"""
EmailAgent — builds the personalized introduction and final email digest
payload.

Refactored to depend on `BaseLLMProvider` via dependency injection instead of
importing the OpenAI SDK directly. The LLM-backed introduction logic now
lives in `app.llm.base.BaseLLMProvider.generate_email_introduction`; the
deterministic fallback lives in `app.llm.rule_based_provider.RuleBasedProvider`.

The response/detail models (`EmailDigestResponse`, `RankedArticleDetail`,
`EmailDigest`) are kept here since they are email-formatting concerns, not
LLM concerns, and `EmailIntroduction` is re-exported from `app.llm.models`
for backwards compatibility.
"""

import asyncio
from typing import List, Optional

from pydantic import BaseModel, Field

from app.llm.base import BaseLLMProvider
from app.llm.factory import get_default_provider
from app.llm.models import EmailIntroduction

__all__ = [
    "EmailAgent",
    "EmailIntroduction",
    "RankedArticleDetail",
    "EmailDigestResponse",
    "EmailDigest",
]


class RankedArticleDetail(BaseModel):
    digest_id: str
    rank: int
    relevance_score: float
    title: str
    summary: str
    url: str
    article_type: str
    reasoning: Optional[str] = None


class EmailDigestResponse(BaseModel):
    introduction: EmailIntroduction
    articles: List[RankedArticleDetail]
    total_ranked: int
    top_n: int

    def to_markdown(self) -> str:
        markdown = f"{self.introduction.greeting}\n\n"
        markdown += f"{self.introduction.introduction}\n\n"
        markdown += "---\n\n"

        for article in self.articles:
            markdown += f"## {article.title}\n\n"
            markdown += f"{article.summary}\n\n"
            markdown += f"[Read more →]({article.url})\n\n"
            markdown += "---\n\n"

        return markdown


class EmailDigest(BaseModel):
    introduction: EmailIntroduction
    ranked_articles: List[dict] = Field(description="Top ranked articles with their details")


class EmailAgent:
    def __init__(self, user_profile: dict, provider: Optional[BaseLLMProvider] = None):
        self.user_profile = user_profile
        self.provider: BaseLLMProvider = provider or get_default_provider()

    def generate_introduction(self, ranked_articles: List) -> EmailIntroduction:
        return asyncio.run(self.provider.generate_email_introduction(self.user_profile, ranked_articles))

    def create_email_digest(self, ranked_articles: List[dict], limit: int = 10) -> EmailDigest:
        top_articles = ranked_articles[:limit]
        introduction = self.generate_introduction(top_articles)

        return EmailDigest(
            introduction=introduction,
            ranked_articles=top_articles,
        )

    def create_email_digest_response(
        self,
        ranked_articles: List[RankedArticleDetail],
        total_ranked: int,
        limit: int = 10,
    ) -> EmailDigestResponse:
        top_articles = ranked_articles[:limit]
        introduction = self.generate_introduction(top_articles)

        return EmailDigestResponse(
            introduction=introduction,
            articles=top_articles,
            total_ranked=total_ranked,
            top_n=limit,
        )
