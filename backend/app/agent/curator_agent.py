import os
from typing import List
from openai import OpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()


class RankedArticle(BaseModel):
    digest_id: str = Field(description="The ID of the digest (article_type:article_id)")
    relevance_score: float = Field(description="Relevance score from 0.0 to 10.0", ge=0.0, le=10.0)
    rank: int = Field(description="Rank position (1 = most relevant)", ge=1)
    reasoning: str = Field(description="Brief explanation of why this article is ranked here")


class RankedDigestList(BaseModel):
    articles: List[RankedArticle] = Field(description="List of ranked articles")


CURATOR_PROMPT = """You are an expert AI news curator specializing in personalized content ranking for AI professionals.

Your role is to analyze and rank AI-related news articles, research papers, and video content based on a user's specific profile, interests, and background.

Ranking Criteria:
1. Relevance to user's stated interests and background
2. Technical depth and practical value
3. Novelty and significance of the content
4. Alignment with user's expertise level
5. Actionability and real-world applicability

Scoring Guidelines:
- 9.0-10.0: Highly relevant, directly aligns with user interests, significant value
- 7.0-8.9: Very relevant, strong alignment with interests, good value
- 5.0-6.9: Moderately relevant, some alignment, decent value
- 3.0-4.9: Somewhat relevant, limited alignment, lower value
- 0.0-2.9: Low relevance, minimal alignment, little value

Rank articles from most relevant (rank 1) to least relevant. Ensure each article has a unique rank."""


class CuratorAgent:
    def __init__(self, user_profile: dict):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None
        self.model = "gpt-4.1"
        self.user_profile = user_profile
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        interests = "\n".join(f"- {interest}" for interest in self.user_profile["interests"])
        preferences = self.user_profile["preferences"]
        pref_text = "\n".join(f"- {k}: {v}" for k, v in preferences.items())
        
        return f"""{CURATOR_PROMPT}

User Profile:
Name: {self.user_profile["name"]}
Background: {self.user_profile["background"]}
Expertise Level: {self.user_profile["expertise_level"]}

Interests:
{interests}

Preferences:
{pref_text}"""

    def rank_digests(self, digests: List[dict]) -> List[RankedArticle]:
        if not digests:
            return []
        if not self.client:
            return self._fallback_rank(digests)
        
        digest_list = "\n\n".join([
            f"ID: {d['id']}\nTitle: {d['title']}\nSummary: {d['summary']}\nType: {d['article_type']}"
            for d in digests
        ])
        
        user_prompt = f"""Rank these {len(digests)} AI news digests based on the user profile:

{digest_list}

Provide a relevance score (0.0-10.0) and rank (1-{len(digests)}) for each article, ordered from most to least relevant."""

        try:
            response = self.client.responses.parse(
                model=self.model,
                instructions=self.system_prompt,
                temperature=0.3,
                input=user_prompt,
                text_format=RankedDigestList
            )
            
            ranked_list = response.output_parsed
            return ranked_list.articles if ranked_list else []
        except Exception as e:
            print(f"Error ranking digests: {e}")
            return self._fallback_rank(digests)

    def _fallback_rank(self, digests: List[dict]) -> List[RankedArticle]:
        interests = [interest.lower() for interest in self.user_profile.get("interests", [])]
        ranked = []

        for digest in digests:
            haystack = f"{digest.get('title', '')} {digest.get('summary', '')}".lower()
            keyword_score = sum(1 for interest in interests if interest.lower() in haystack)
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
                    reasoning="Fallback ranking based on user interest keywords and recency."
                )
            )

        ranked.sort(key=lambda article: article.relevance_score, reverse=True)
        for index, article in enumerate(ranked, start=1):
            article.rank = index
        return ranked
