import os
from functools import lru_cache

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "Purplexity API"
    app_version: str = "0.1.0"
    environment: str = Field(default="development")
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )


@lru_cache
def get_settings() -> Settings:
    cors_origins = os.getenv("CORS_ORIGINS")

    if not cors_origins:
        return Settings()

    return Settings(
        cors_origins=[
            origin.strip()
            for origin in cors_origins.split(",")
            if origin.strip()
        ]
    )
