"""
Single source of truth for every system/user prompt used across the app.

Nothing here is provider-specific. Providers call these builders and pass the
resulting strings into their own low-level completion methods, so the prompt
text is never duplicated between openai_provider.py / groq_provider.py /
ollama_provider.py.
"""

from __future__ import annotations

from typing import Dict, List

CURATOR_SYSTEM_PROMPT = """You are an expert AI news curator specializing in personalized content ranking for AI professionals.

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


DIGEST_SYSTEM_PROMPT = """You are an expert AI news analyst specializing in summarizing technical articles, research papers, and video content about artificial intelligence.

Your role is to create concise, informative digests that help readers quickly understand the key points and significance of AI-related content.

Guidelines:
- Create a compelling title (5-10 words) that captures the essence of the content
- Write a 2-3 sentence summary that highlights the main points and why they matter
- Focus on actionable insights and implications
- Use clear, accessible language while maintaining technical accuracy
- Avoid marketing fluff - focus on substance"""


EMAIL_SYSTEM_PROMPT = """You are an expert email writer specializing in creating engaging, personalized AI news digests.

Your role is to write a warm, professional introduction for a daily AI news digest email that:
- Greets the user by name
- Includes the current date
- Provides a brief, engaging overview of what's coming in the top ranked articles
- Highlights the most interesting or important themes
- Sets expectations for the content ahead

Keep it concise (2-3 sentences for the introduction), friendly, and professional."""


CHAT_SYSTEM_PROMPT = """You are "The Curator", a knowledgeable AI news assistant. Answer as a concise,
practical expert. Reference the available feed items when relevant, and be honest when the
provided context does not contain the answer."""


def build_curator_system_prompt(user_profile: Dict) -> str:
    interests = "\n".join(f"- {interest}" for interest in user_profile.get("interests", []))
    preferences = user_profile.get("preferences", {}) or {}
    pref_text = "\n".join(f"- {k}: {v}" for k, v in preferences.items())

    return f"""{CURATOR_SYSTEM_PROMPT}

User Profile:
Name: {user_profile.get("name")}
Background: {user_profile.get("background")}
Expertise Level: {user_profile.get("expertise_level")}

Interests:
{interests}

Preferences:
{pref_text}"""


def build_rank_articles_user_prompt(digests: List[dict]) -> str:
    digest_list = "\n\n".join(
        f"ID: {d['id']}\nTitle: {d['title']}\nSummary: {d['summary']}\nType: {d['article_type']}"
        for d in digests
    )
    return f"""Rank these {len(digests)} AI news digests based on the user profile:

{digest_list}

Provide a relevance score (0.0-10.0) and rank (1-{len(digests)}) for each article, ordered from most to least relevant."""


def build_digest_user_prompt(title: str, content: str, article_type: str) -> str:
    return f"Create a digest for this {article_type}: \n Title: {title} \n Content: {content[:8000]}"


def build_email_intro_user_prompt(user_profile: Dict, ranked_articles: List, current_date: str) -> str:
    top_articles = ranked_articles[:10]
    article_summaries = "\n".join(
        f"{idx + 1}. {getattr(a, 'title', None) or a.get('title', 'N/A')} "
        f"(Score: {getattr(a, 'relevance_score', None) if getattr(a, 'relevance_score', None) is not None else a.get('relevance_score', 0):.1f}/10)"
        for idx, a in enumerate(top_articles)
    )

    return f"""Create an email introduction for {user_profile.get("name")} for {current_date}.

Top ranked articles:
{article_summaries}

Generate a greeting and introduction that previews these articles."""


def build_chat_user_prompt(user_profile: Dict, context_items: List[dict], message: str) -> str:
    context_block = "\n\n".join(
        f"Title: {item['title']}\nSource: {item['source']}\nSummary: {item['summary']}\n"
        f"AI Insight: {item['aiInsight']}\nURL: {item['url']}"
        for item in context_items
    ) or "No matching articles were found."

    return f"""User profile: {user_profile.get("name")} | {user_profile.get("background")}
Interests: {', '.join(user_profile.get("interests", []))}

Available AI news context:
{context_block}

User question: {message}

Answer as The Curator in a concise, practical style. Reference the available feed items when relevant."""


def build_classification_user_prompt(text: str, categories: List[str]) -> str:
    categories_block = ", ".join(categories)
    return f"""Classify the following text into exactly one of these categories: {categories_block}

Text:
{text[:4000]}

Respond with the single best-fitting category, your confidence (0.0-1.0), and a one-sentence reason."""
