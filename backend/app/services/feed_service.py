import asyncio
import re
from datetime import datetime, timezone
from math import ceil
from typing import Any, Iterable, Optional

from app.database.repository import Repository
from app.llm.factory import get_default_provider
from app.profiles.profile_store import get_user_profile


SOURCE_LABELS = {
    "youtube": "YouTube",
    "openai": "OpenAI",
    "anthropic": "Anthropic",
}


def _ensure_utc(value: Optional[datetime]) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _clean_text(value: Optional[str]) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def _truncate(value: str, limit: int = 240) -> str:
    text = _clean_text(value)
    if not text:
        return ""
    if len(text) <= limit:
        return text
    return text[: limit - 3].rsplit(" ", 1)[0] + "..."


def _relative_time(value: datetime) -> str:
    delta = datetime.now(timezone.utc) - _ensure_utc(value)
    seconds = max(int(delta.total_seconds()), 0)

    if seconds < 60:
        return "Just now"
    if seconds < 3600:
        return f"{seconds // 60}m ago"
    if seconds < 86400:
        return f"{seconds // 3600}h ago"
    if seconds < 604800:
        return f"{seconds // 86400}d ago"
    return _ensure_utc(value).strftime("%b %d")


def _estimate_read_time(text: str) -> str:
    words = max(len(_clean_text(text).split()), 80)
    return f"{max(1, ceil(words / 220))} min"


def _fallback_ai_insight(source_type: str, title: str, content: str, category: str) -> str:
    source_name = SOURCE_LABELS.get(source_type, source_type.title())
    return _truncate(
        f"{source_name} signal: {title}. This {category.lower()} update is worth tracking for AI builders, "
        f"operators, and researchers because it may shift product direction, model capability, or ecosystem momentum. "
        f"{content}",
        limit=260,
    )


def _build_item_from_source(source_type: str, source_item: Any, digest: Optional[Any] = None) -> dict:
    article_id = getattr(source_item, "video_id", None) or getattr(source_item, "guid", None)
    published_at = _ensure_utc(getattr(source_item, "published_at", None))
    raw_title = _clean_text(getattr(source_item, "title", "Untitled"))
    raw_description = _clean_text(getattr(source_item, "description", ""))
    raw_markdown = _clean_text(getattr(source_item, "markdown", ""))
    raw_transcript = _clean_text(getattr(source_item, "transcript", ""))
    if raw_transcript == "__UNAVAILABLE__":
        raw_transcript = ""
    content = raw_markdown or raw_transcript or raw_description

    category = _clean_text(getattr(source_item, "category", "")) or SOURCE_LABELS.get(source_type, source_type.title())
    source_name = SOURCE_LABELS.get(source_type, source_type.title())
    digest_title = _clean_text(getattr(digest, "title", "")) if digest else ""
    digest_summary = _clean_text(getattr(digest, "summary", "")) if digest else ""

    display_title = digest_title or raw_title
    summary = digest_summary or _truncate(content or raw_title, limit=260) or "Summary pending."
    ai_insight = _fallback_ai_insight(source_type, raw_title, content, category)

    return {
        "id": getattr(digest, "id", None) or f"{source_type}:{article_id}",
        "articleId": article_id,
        "articleType": source_type,
        "source": source_name,
        "category": category,
        "title": display_title,
        "originalTitle": raw_title,
        "summary": summary,
        "aiInsight": ai_insight,
        "url": getattr(source_item, "url", ""),
        "publishedAt": published_at.isoformat(),
        "timeAgo": _relative_time(published_at),
        "readTime": _estimate_read_time(content or summary),
        "hasDigest": digest is not None,
        "content": content or summary,
    }


def get_feed(hours: int = 168, limit: int = 24, source: str = "all", query: Optional[str] = None) -> list[dict]:
    repo = Repository()
    digests = {digest.id: digest for digest in repo.get_all_digests()}
    source_articles = repo.get_recent_source_articles(hours=hours)

    items: list[dict] = []
    for source_type, records in source_articles.items():
        if source != "all" and source_type != source:
            continue

        for record in records:
            article_id = getattr(record, "video_id", None) or getattr(record, "guid", None)
            digest = digests.get(f"{source_type}:{article_id}")
            items.append(_build_item_from_source(source_type, record, digest=digest))

    if query:
        lowered = query.lower()
        items = [
            item for item in items
            if lowered in item["title"].lower()
            or lowered in item["summary"].lower()
            or lowered in item["content"].lower()
            or lowered in item["source"].lower()
            or lowered in item["category"].lower()
        ]

    items.sort(key=lambda item: item["publishedAt"], reverse=True)
    return items[:limit]


def get_article(article_id: str) -> Optional[dict]:
    article_type, _, source_id = article_id.partition(":")
    if not article_type or not source_id:
        return None

    repo = Repository()
    source_item = repo.get_source_article(article_type, source_id)
    if not source_item:
        return None

    digest = repo.get_digest_by_id(article_id)
    item = _build_item_from_source(article_type, source_item, digest=digest)
    item["fullContent"] = _clean_text(item["content"])
    item["profile"] = get_user_profile()
    return item


def get_notifications(limit: int = 6) -> list[dict]:
    feed_items = get_feed(hours=168, limit=limit)

    notifications = []
    for index, item in enumerate(feed_items, start=1):
        notifications.append(
            {
                "id": f"notif-{index}-{item['id']}",
                "title": item["title"],
                "message": f"New {item['source']} item in {item['category']}: {item['summary']}",
                "time": item["timeAgo"],
                "category": item["source"],
                "articleId": item["id"],
            }
        )

    return notifications


def get_stats(hours: int = 168) -> dict:
    items = get_feed(hours=hours, limit=200)
    source_breakdown = {"OpenAI": 0, "Anthropic": 0, "YouTube": 0}

    for item in items:
        source_breakdown[item["source"]] = source_breakdown.get(item["source"], 0) + 1

    return {
        "articles": len(items),
        "digests": sum(1 for item in items if item["hasDigest"]),
        "sourceBreakdown": source_breakdown,
    }


def _top_matches(items: Iterable[dict], message: str, limit: int = 3) -> list[dict]:
    terms = [term for term in re.split(r"\W+", message.lower()) if term]
    scored = []

    for item in items:
        haystack = " ".join([item["title"], item["summary"], item["content"], item["category"], item["source"]]).lower()
        score = sum(1 for term in terms if term in haystack)
        if score:
            scored.append((score, item))

    scored.sort(key=lambda entry: (-entry[0], entry[1]["publishedAt"]))
    return [item for _, item in scored[:limit]]


def generate_chat_response(message: str, article_id: Optional[str] = None) -> dict:
    profile = get_user_profile()
    feed_items = get_feed(hours=336, limit=20)
    focus_item = get_article(article_id) if article_id else None
    context_items = [focus_item] if focus_item else _top_matches(feed_items, message, limit=4)

    provider = get_default_provider()
    try:
        result = asyncio.run(
            provider.generate_chat_response(user_profile=profile, context_items=context_items, message=message)
        )
        if result.content and not result.used_fallback:
            return {
                "answer": result.content,
                "references": context_items,
            }
    except Exception:
        pass

    matches = [focus_item] if focus_item else _top_matches(feed_items, message, limit=3)
    if matches:
        bullet_points = "\n".join(
            [
                f"- {item['title']} ({item['source']}): {item['summary']}"
                for item in matches
            ]
        )
        answer = (
            "Here’s the most relevant context from your current AI news feed:\n"
            f"{bullet_points}\n\n"
            "If you want, I can help compare these updates, pull out product implications, or turn one into a deeper briefing."
        )
        return {
            "answer": answer,
            "references": matches,
        }

    return {
        "answer": (
            "I couldn’t find a close match in the current feed yet. Try refreshing the pipeline or ask about one of the "
            "tracked sources: OpenAI, Anthropic, or YouTube creator coverage."
        ),
        "references": [],
    }
