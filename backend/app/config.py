from dataclasses import dataclass
from enum import Enum
from functools import lru_cache
from typing import Optional
import os


# -----------------------------
# Supported LLM Providers
# -----------------------------
class LLMProvider(str, Enum):
    OPENAI = "openai"
    GROQ = "groq"
    OLLAMA = "ollama"


# -----------------------------
# YouTube Channels
# -----------------------------
YOUTUBE_CHANNELS = [
    # "UCn8ujwUInbJkBhffxqAPBVQ",  # Dave Ebbelaar
    "UCawZsQWqfGSbCI5yjkdVkTA",   # Matthew Berman
]


# -----------------------------
# LLM Configuration
# -----------------------------
@dataclass(frozen=True)
class LLMConfig:
    provider: LLMProvider

    # OpenAI
    openai_api_key: Optional[str]
    openai_model: str
    openai_base_url: str

    # Groq
    groq_api_key: Optional[str]
    groq_model: str
    groq_base_url: str

    # Ollama
    ollama_base_url: str
    ollama_model: str

    # Generation Settings
    temperature: float
    max_tokens: int
    top_p: float
    stream: bool

    # Request Settings
    request_timeout: float
    retry_attempts: int
    retry_delay: float

    # Embeddings
    embedding_model: str

    # Logging
    log_level: str


# -----------------------------
# Configuration Loader
# -----------------------------
@lru_cache(maxsize=1)
def get_llm_config() -> LLMConfig:
    provider = os.getenv("LLM_PROVIDER", "groq").strip().lower()

    try:
        provider_enum = LLMProvider(provider)
    except ValueError:
        raise ValueError(
            f"Invalid LLM_PROVIDER '{provider}'. "
            "Supported providers: openai, groq, ollama."
        )

    return LLMConfig(
        provider=provider_enum,

        # OpenAI
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1"),
        openai_base_url=os.getenv(
            "OPENAI_BASE_URL",
            "https://api.openai.com/v1",
        ),

        # Groq
        groq_api_key=os.getenv("GROQ_API_KEY"),
        groq_model=os.getenv(
            "GROQ_MODEL",
            "llama-3.3-70b-versatile",
        ),
        groq_base_url=os.getenv(
            "GROQ_BASE_URL",
            "https://api.groq.com/openai/v1",
        ),

        # Ollama
        ollama_base_url=os.getenv(
            "OLLAMA_BASE_URL",
            "http://localhost:11434",
        ),
        ollama_model=os.getenv(
            "OLLAMA_MODEL",
            "llama3.1:8b",
        ),

        # Generation
        temperature=float(os.getenv("TEMPERATURE", "0.7")),
        max_tokens=int(os.getenv("MAX_TOKENS", "1024")),
        top_p=float(os.getenv("TOP_P", "1.0")),
        stream=os.getenv("LLM_STREAM", "false").lower() == "true",

        # Request
        request_timeout=float(
            os.getenv("LLM_REQUEST_TIMEOUT", "30")
        ),
        retry_attempts=int(
            os.getenv("LLM_RETRY_ATTEMPTS", "3")
        ),
        retry_delay=float(
            os.getenv("LLM_RETRY_DELAY", "2")
        ),

        # Embeddings
        embedding_model=os.getenv(
            "EMBEDDING_MODEL",
            "BAAI/bge-small-en-v1.5",
        ),

        # Logging
        log_level=os.getenv("LOG_LEVEL", "INFO"),
    )