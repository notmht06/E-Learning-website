"""
Enterprise FastAPI Application Entrypoint.
Complies with BACKEND_SYSTEM_DESIGN.md (backend-skill quality standards).
Official Platform: حجت الاسلام دکتر زنجیرزن حسینی
"""
import sys
from contextlib import asynccontextmanager

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.exceptions import AppException, app_exception_handler
from backend.app.core.rate_limiter import RateLimitMiddleware
from backend.app.api.v1.router import api_router
from backend.app.models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite/PostgreSQL tables on startup with fail-fast validation in production
    try:
        await init_db()
        print("[INFO] Database tables initialized successfully.")
    except RuntimeError as e:
        print(f"[FATAL] Critical startup configuration failure: {e}")
        raise e
    except Exception as e:
        if settings.ENVIRONMENT == "production":
            print(f"[FATAL] Production database initialization failed: {e}")
            raise e
        print(f"[WARNING] Note on database init: {e}")
    yield


app = FastAPI(
    title="Academic and Wisdom Platform of حجت الاسلام دکتر زنجیرزن حسینی",
    version=settings.VERSION,
    description="""
## Enterprise Scholarly Publishing and Audio Discourse Platform of حجت الاسلام دکتر زنجیرزن حسینی

Architected adhering to core **backend-skill** engineering principles and 4 quality engines:
* **Security Guardian:** JWT bearer authentication, argon2/bcrypt password hashing, and DRM-protected signed media stream tokens.
* **Simplicity Governor:** Robust modular architecture powered by SQLAlchemy ORM with ACID transaction integrity.
* **Performance Engine:** Pure async runtime, HTTP Range requests for seamless audio seeking, and low-latency caching.
* **Reliability Engine:** Centralized AppException handling, structured observability, and system health telemetry.
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)

from starlette.exceptions import HTTPException as StarletteHTTPException
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    detail = getattr(exc, "detail", "مسیر یا منبع درخواستی در سامانه یافت نشد.")
    msg = detail if detail and detail != "Not Found" else "مسیر یا منبع درخواستی در سامانه یافت نشد."
    headers = getattr(exc, "headers", None)
    return JSONResponse(
        status_code=404,
        headers=headers,
        content={
            "success": False,
            "error_code": "NOT_FOUND",
            "message": msg,
            "detail": msg,
            "path": str(request.url.path),
        },
    )

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
        "service": "پایگاه علمی و معرفتی حجت الاسلام دکتر زنجیرزن حسینی",
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
