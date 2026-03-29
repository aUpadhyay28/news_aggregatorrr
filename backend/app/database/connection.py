import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()


def get_database_url() -> str:
    explicit_url = os.getenv("DATABASE_URL")
    if explicit_url:
        return explicit_url

    backend = os.getenv("DB_BACKEND", "sqlite").lower()
    if backend == "postgres":
        user = os.getenv("POSTGRES_USER", "postgres")
        password = os.getenv("POSTGRES_PASSWORD", "postgres")
        host = os.getenv("POSTGRES_HOST", "localhost")
        port = os.getenv("POSTGRES_PORT", "5432")
        db = os.getenv("POSTGRES_DB", "ai_news_aggregator")
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"

    project_root = Path(__file__).resolve().parents[2]
    sqlite_path = project_root / "ai_news_aggregator.db"
    return f"sqlite:///{sqlite_path.as_posix()}"


DATABASE_URL = get_database_url()
ENGINE_KWARGS = {"connect_args": {"check_same_thread": False}} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, **ENGINE_KWARGS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session():
    return SessionLocal()
