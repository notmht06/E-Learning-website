"""
Application configuration module.
Loads environment variables and global settings using Pydantic.
Complies with BACKEND_SYSTEM_DESIGN.md (backend-skill quality standards).
"""
import os
import secrets
from typing import List, Any
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    PROJECT_NAME: str = "پایگاه علمی و معرفتی حجت الاسلام دکتر زنجیر زن حسینی"
    SCHOLAR_NAME_FA: str = "حجت الاسلام دکتر زنجیر زن حسینی"
    VERSION: str = "3.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # development | production
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET") or ""
    ALGORITHM: str = "HS256"
    TESTING: bool = os.getenv("TESTING", "0") in ("1", "true", "True")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DRM_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes short-lived tokens for DRM audio streaming
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./zanjirzan_platform.db")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", "sqlite:///./zanjirzan_platform.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    MAX_CONCURRENT_DEVICES: int = int(os.getenv("MAX_CONCURRENT_DEVICES", "3"))

    # OTP & SMS Gateway Settings
    OTP_MODE: str = "production" if os.getenv("ENVIRONMENT", "development") == "production" else os.getenv("OTP_MODE", "development")  # development | production
    OTP_EXPIRE_SECONDS: int = int(os.getenv("OTP_EXPIRE_SECONDS", "120"))
    OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "console")  # console | kavenegar
    KAVENEGAR_API_KEY: str = os.getenv("KAVENEGAR_API_KEY", "")
    KAVENEGAR_TEMPLATE: str = os.getenv("KAVENEGAR_TEMPLATE", "daralhikmah-verify")
    # Payment Gateway & Shaparak Settings
    PAYMENT_MODE: str = os.getenv("PAYMENT_MODE", "sandbox")  # sandbox | production
    ZARINPAL_MERCHANT_ID: str = os.getenv("ZARINPAL_MERCHANT_ID", "zarinpal-sandbox-merchant-1403")

    # AI Multi-Provider Router (DeepSeek 4.1 / V3-1017, OpenRouter Free, Gemini Flash Free, Groq Whisper) - Phase 7
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deepseek")  # deepseek | openrouter | gemini | groq | openai | local
    AI_API_KEY: str = os.getenv("AI_API_KEY") or os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENROUTER_API_KEY") or ""
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://api.deepseek.com/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "deepseek-chat")  # e.g. deepseek-chat (V4.1/1017), deepseek/deepseek-chat:free, gemini-2.5-flash
    AI_FALLBACK_FREE_MODEL: str = os.getenv("AI_FALLBACK_FREE_MODEL", "deepseek/deepseek-chat:free")
    AI_WHISPER_BASE_URL: str = os.getenv("AI_WHISPER_BASE_URL", "https://api.groq.com/openai/v1")
    AI_WHISPER_API_KEY: str = os.getenv("AI_WHISPER_API_KEY") or os.getenv("GROQ_API_KEY") or os.getenv("AI_API_KEY") or ""
    AI_WHISPER_MODEL: str = os.getenv("AI_WHISPER_MODEL", "whisper-large-v3-turbo")
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.1"))  # Low temperature for zero hallucination
    AI_STRICT_CORPUS_ONLY: bool = os.getenv("AI_STRICT_CORPUS_ONLY", "true").lower() == "true"
    AI_MIN_SIMILARITY_THRESHOLD: float = float(os.getenv("AI_MIN_SIMILARITY_THRESHOLD", "0.10"))

    # Media Upload Settings
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))

    # CORS Origins
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://zanjirzan.ir,https://www.zanjirzan.ir",
        ).split(",")
        if origin.strip()
    ]

    def model_post_init(self, __context: Any) -> None:
        if self.ENVIRONMENT == "production":
            sec = self.SECRET_KEY or ""
            sec_lower = sec.lower()
            weak_exact = {"secret", "mysecret", "jwt_secret", "supersecret", "password", "admin", "12345678", "dev", "test"}
            weak_substrings = ("illumination", "changeme", "default")
            if (
                not sec
                or len(sec) < 32
                or sec_lower in weak_exact
                or any(t in sec_lower for t in weak_substrings)
            ):
                raise RuntimeError("Production SECRET_KEY must be at least 32 characters and not contain default/weak values.")
            if self.OTP_MODE != "production":
                raise RuntimeError("Production OTP_MODE must be set to 'production'.")
        else:
            if not self.SECRET_KEY:
                self.SECRET_KEY = secrets.token_urlsafe(32)


settings = Settings()

