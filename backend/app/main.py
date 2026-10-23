"""
Enterprise FastAPI Application Entrypoint.
Complies with BACKEND_SYSTEM_DESIGN.md (backend-skill quality standards).
Official Platform: حجت الاسلام دکتر زنجیر زن حسینی
"""
import sys
from contextlib import asynccontextmanager

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.exceptions import AppException, app_exception_handler
from backend.app.core.rate_limiter import RateLimitMiddleware
from backend.app.api.v1.router import api_router
from backend.app.models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite/PostgreSQL tables on startup
    try:
        await init_db()
        print("[INFO] Database tables initialized successfully.")
    except Exception as e:
        print(f"[WARNING] Note on database init: {e}")
    yield


app = FastAPI(
    title="پایگاه علمی و معرفتی حجت الاسلام دکتر زنجیر زن حسینی",
    version=settings.VERSION,
    description="""
## سامانه جامع مهندسی نشر آثار و دروس علمی حجت الاسلام دکتر زنجیر زن حسینی

توسعه‌یافته بر اساس اصول مهندسی **backend-skill** و شامل ۴ موتور کیفیت:
* **موتور امنیت (Security Guardian):** احراز هویت JWT، هشینگ کلمات عبور، و سپر استریم DRM با توکن‌های امضاشده.
* **فرماندار سادگی (Simplicity Governor):** معماری ماژولار پایدار بر پایه SQLAlchemy و SQLite/PostgreSQL.
* **موتور کارایی (Performance Engine):** ناهمگام (Async)، مدیریت چانک‌های صوتی با سرآیندهای Range و کشینگ بهینه.
* **موتور پایداری (Reliability Engine):** مدیریت یکپارچه استثناها و پایش وضعیت سامانه.
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)

# CORS Configuration
cors_origins = settings.ALLOWED_ORIGINS if settings.ENVIRONMENT == "production" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), geolocation=(), payment=()"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Security Guardian: Sliding Window Rate Limiter
app.add_middleware(RateLimitMiddleware, default_limit=300, window_seconds=60)

# Static Files Mount for Uploads & Media
from fastapi.staticfiles import StaticFiles
from pathlib import Path

static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount Unified API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["System Health & Overview"])
def root():
    """
    Health check and platform status endpoint.
    """
    return {
        "status": "healthy",
        "service": "پایگاه علمی و معرفتی حجت الاسلام دکتر زنجیر زن حسینی",
        "scholar_name": settings.SCHOLAR_NAME_FA,
        "version": settings.VERSION,
        "swagger_documentation": "/docs",
        "redoc_documentation": "/redoc",
        "api_v1_prefix": settings.API_V1_STR,
        "quality_engines": [
            "1. Security Guardian (JWT + DRM Stream Shield)",
            "2. Simplicity Governor (Async SQLAlchemy + Modular Monolith)",
            "3. Performance Engine (Async I/O + Audio Range Chunks)",
            "4. Reliability Engine (ACID Transactions + Structured Exceptions)"
        ]
    }
