import os
from pathlib import Path
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseModel, Field

PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseModel):
    app_name: str = "Purplexity API"
    app_version: str = "0.1.0"
    environment: str = Field(default="development")
    database_path: str = str(BACKEND_ROOT / "data" / "purplexity.sqlite3")
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    tavily_api_key: str | None = None
    tavily_max_results: int = 5
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )


@lru_cache
def get_settings() -> Settings:
    load_dotenv(PROJECT_ROOT / ".env")
    load_dotenv(BACKEND_ROOT / ".env", override=True)

    cors_origins = os.getenv("CORS_ORIGINS")
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    database_path = os.getenv("DATABASE_PATH", str(BACKEND_ROOT / "data" / "purplexity.sqlite3"))
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    tavily_max_results = int(os.getenv("TAVILY_MAX_RESULTS", "5"))

    settings_kwargs = {
        "database_path": database_path,
        "gemini_api_key": gemini_api_key,
        "gemini_model": gemini_model,
        "tavily_api_key": tavily_api_key,
        "tavily_max_results": tavily_max_results,
    }

    if not cors_origins:
        return Settings(**settings_kwargs)

    return Settings(
        **settings_kwargs,
        cors_origins=[
            origin.strip()
            for origin in cors_origins.split(",")
            if origin.strip()
        ]
    )
