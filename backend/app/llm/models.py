"""
Shared data contracts for the LLM abstraction layer.

These models are provider-agnostic: every provider (OpenAI, Groq, Ollama,
rule-based fallback) consumes and returns these same shapes so that callers
never need to know which provider produced the result.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class LLMUsage(BaseModel):
    """Token accounting for a single completion call."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class ChatResult(BaseModel):
    """Generic result of a text-generation call, used for logging/metrics too."""

    content: str
    provider: str
    model: str
    latency_ms: float
    usage: LLMUsage = Field(default_factory=LLMUsage)
    used_fallback: bool = False


class DigestOutput(BaseModel):
    """Structured summary of a single article/video."""

    title: str
    summary: str


class RankedArticle(BaseModel):
    digest_id: str = Field(description="The ID of the digest (article_type:article_id)")
    relevance_score: float = Field(description="Relevance score from 0.0 to 10.0", ge=0.0, le=10.0)
    rank: int = Field(description="Rank position (1 = most relevant)", ge=1)
    reasoning: str = Field(description="Brief explanation of why this article is ranked here")


class RankedDigestList(BaseModel):
    articles: List[RankedArticle] = Field(description="List of ranked articles")


class EmailIntroduction(BaseModel):
    greeting: str = Field(description="Personalized greeting with user's name and date")
    introduction: str = Field(description="2-3 sentence overview of what's in the top ranked articles")


class ClassificationResult(BaseModel):
    label: str = Field(description="The predicted category/label")
    confidence: float = Field(ge=0.0, le=1.0, description="Model confidence in the label")
    reasoning: Optional[str] = Field(default=None, description="Optional short justification")


class EmbeddingResult(BaseModel):
    vector: List[float]
    provider: str
    model: str
    dimensions: int

    @classmethod
    def from_vector(cls, vector: List[float], provider: str, model: str) -> "EmbeddingResult":
        return cls(vector=vector, provider=provider, model=model, dimensions=len(vector))


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
