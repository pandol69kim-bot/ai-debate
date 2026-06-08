from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AI Arena"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://arena:arena_pass@postgres:5432/arena_db"
    DATABASE_URL_SYNC: str = "postgresql://arena:arena_pass@postgres:5432/arena_db"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Security
    SECRET_KEY: str = "change-me-in-production-secret-key-at-least-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # AI API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # AI Models
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_MODEL: str = "claude-opus-4-8"
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"
    JUDGE_MODEL: str = "gpt-4o"

    # Debate Settings
    MAX_DEBATE_ROUNDS: int = 3
    MAX_TOKENS_PER_RESPONSE: int = 1000
    DEBATE_TIMEOUT_SECONDS: int = 120

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://frontend:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
