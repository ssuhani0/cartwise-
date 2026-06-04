from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cartwise"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    JWT_SECRET: str = "super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE: int = 30
    REFRESH_TOKEN_EXPIRE: int = 7

    REDIS_URL: str = "redis://localhost:6379/0"
    UPSTASH_REDIS_URL: Optional[str] = None

    BREVO_API_KEY: Optional[str] = None
    BREVO_SENDER_EMAIL: Optional[str] = None

    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    GROK_API_KEY: Optional[str] = None

    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: Optional[str] = None

    FRONTEND_URL: str = "http://localhost:3000"

    ENVIRONMENT: str = "dev"

    GOOGLE_TESSERACT_PATH: Optional[str] = None


settings = Settings()
