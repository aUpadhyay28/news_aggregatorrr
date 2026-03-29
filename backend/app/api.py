import os
import threading
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.database.models import Base
from app.database.connection import engine
from app.profiles.profile_store import get_user_profile, save_user_profile
from app.services.feed_service import (
    generate_chat_response,
    get_article,
    get_feed,
    get_notifications,
    get_stats,
)
from app.services.pipeline_service import refresh_news_pipeline


ROOT_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIST_DIR = ROOT_DIR / "frontend" / "dist"
FRONTEND_ASSETS_DIR = FRONTEND_DIST_DIR / "assets"
AUTO_REFRESH_ON_EMPTY = os.getenv("AUTO_REFRESH_ON_EMPTY", "true").lower() == "true"
_auto_refresh_attempted = False
_refresh_in_progress = False
_refresh_lock = threading.Lock()


app = FastAPI(title="The Curator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProfilePayload(BaseModel):
    name: str
    title: str
    background: str
    interests: list[str] = Field(default_factory=list)
    expertise_level: str = "Advanced"
    preferences: dict = Field(default_factory=dict)


class RefreshPayload(BaseModel):
    hours: int = 72
    mode: str = "quick"


class ChatPayload(BaseModel):
    message: str
    article_id: Optional[str] = None


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def _run_background_refresh(hours: int) -> None:
    global _refresh_in_progress

    try:
        refresh_news_pipeline(hours=hours, mode="quick")
    except RuntimeError:
        pass
    finally:
        _refresh_in_progress = False


def _kickoff_background_refresh(hours: int) -> None:
    global _refresh_in_progress

    with _refresh_lock:
        if _refresh_in_progress:
            return
        _refresh_in_progress = True

    thread = threading.Thread(target=_run_background_refresh, args=(hours,), daemon=True)
    thread.start()


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "frontendBuilt": FRONTEND_DIST_DIR.exists(),
        "database": engine.url.render_as_string(hide_password=True),
    }


@app.get("/api/feed")
def feed(
    hours: int = Query(default=168, ge=1, le=1440),
    limit: int = Query(default=24, ge=1, le=100),
    source: str = Query(default="all"),
) -> dict:
    global _auto_refresh_attempted

    items = get_feed(hours=hours, limit=limit, source=source)

    if not items and AUTO_REFRESH_ON_EMPTY and not _auto_refresh_attempted:
        _auto_refresh_attempted = True
        _kickoff_background_refresh(hours=min(hours, 72))

    return {
        "items": items,
        "stats": get_stats(hours=hours),
        "profile": get_user_profile(),
        "bootstrapInProgress": _refresh_in_progress,
    }


@app.get("/api/articles/{article_id:path}")
def article_detail(article_id: str) -> dict:
    article = get_article(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@app.get("/api/search")
def search(
    q: str = Query(min_length=1),
    source: str = Query(default="all"),
    limit: int = Query(default=24, ge=1, le=100),
) -> dict:
    items = get_feed(hours=336, limit=limit, source=source, query=q)
    return {
        "query": q,
        "items": items,
        "count": len(items),
    }


@app.get("/api/notifications")
def notifications(limit: int = Query(default=6, ge=1, le=20)) -> dict:
    return {"items": get_notifications(limit=limit)}


@app.get("/api/profile")
def profile() -> dict:
    return get_user_profile()


@app.put("/api/profile")
def update_profile(payload: ProfilePayload) -> dict:
    return save_user_profile(payload.model_dump())


@app.post("/api/pipeline/refresh")
def refresh(payload: RefreshPayload) -> dict:
    try:
        return refresh_news_pipeline(hours=payload.hours, mode=payload.mode)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.post("/api/chat")
def chat(payload: ChatPayload) -> dict:
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")
    return generate_chat_response(message=payload.message.strip(), article_id=payload.article_id)


if FRONTEND_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="assets")


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not found")

    if not FRONTEND_DIST_DIR.exists():
        raise HTTPException(status_code=404, detail="Frontend build not found. Run `npm run build` in `frontend` first.")

    requested = FRONTEND_DIST_DIR / full_path
    if full_path and requested.exists() and requested.is_file():
        return FileResponse(requested)

    index_file = FRONTEND_DIST_DIR / "index.html"
    return FileResponse(index_file)
