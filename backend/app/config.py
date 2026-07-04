import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


YOUTUBE_CHANNELS = [
    # "UCn8ujwUInbJkBhffxqAPBVQ", # Dave Ebbelaar
    "UCawZsQWqfGSbCI5yjkdVkTA", # Matthew Berman
]


@dataclass(frozen=True)
class LLMSettings:
    provider: str
    openai_api_key: Optional[str]
    openai_model: str
    groq_api_key: Optional[str]
    groq_model: str
    ollama_base_url: str
    ollama_model: str
    temperature: float
    max_tokens: int
    top_p: float
    request_timeout: float


def get_llm_settings() -> LLMSettings:
    return LLMSettings(
        provider=os.getenv("LLM_PROVIDER", "openai").strip().lower(),
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1"),
        groq_api_key=os.getenv("GROQ_API_KEY") or None,
        groq_model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
        temperature=float(os.getenv("TEMPERATURE", "0.7")),
        max_tokens=int(os.getenv("MAX_TOKENS", "1024")),
        top_p=float(os.getenv("TOP_P", "1.0")),
        request_timeout=float(os.getenv("LLM_REQUEST_TIMEOUT", "30")),
    )

