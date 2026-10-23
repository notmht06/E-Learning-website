"""
Rate Limiting Middleware for Security Guardian.
Protects the platform against DDoS, brute force attacks, and abusive scraping.
"""
import os
import time
import threading
from typing import Dict, List, Tuple, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from backend.app.core.config import settings


class TokenBucketRateLimiter:
    """
    Token Bucket Rate Limiter supporting burst capacity and steady replenishment.
    Protects compute-heavy AI streaming and inference endpoints per user or IP.
    """
    def __init__(self, capacity: int = 10, refill_rate_per_sec: float = 1.0):
        self.capacity = float(capacity)
        self.refill_rate = float(refill_rate_per_sec)
        # key -> (tokens: float, last_updated: float)
        self.buckets: Dict[str, Tuple[float, float]] = {}
        self._lock = threading.Lock()

    def _get_tokens(self, key: str, now: float) -> float:
        if key not in self.buckets:
            return self.capacity
        tokens, last_time = self.buckets[key]
        elapsed = max(0.0, now - last_time)
        return min(self.capacity, tokens + (elapsed * self.refill_rate))

    def consume(self, key: str, tokens: int = 1) -> Tuple[bool, int, int]:
        """
        Attempts to consume 'tokens' from bucket.
        Returns:
            allowed (bool): True if consumed, False if limit exceeded
            remaining (int): count of remaining tokens in bucket
            retry_after (int): estimated seconds until next token is available
        """
        now = time.time()
        with self._lock:
            current = self._get_tokens(key, now)
            if current >= tokens:
                new_tokens = current - tokens
                self.buckets[key] = (new_tokens, now)
                return True, int(new_tokens), 0
            else:
                deficit = float(tokens) - current
                retry_after = max(1, int(deficit / self.refill_rate) + (1 if (deficit % self.refill_rate) > 0 else 0))
                return False, int(current), retry_after

    def reset(self, key: Optional[str] = None):
        """Resets bucket state for testing or administrative purposes."""
        with self._lock:
            if key:
                self.buckets.pop(key, None)
            else:
                self.buckets.clear()


ai_token_bucket_limiter = TokenBucketRateLimiter(capacity=10, refill_rate_per_sec=1.0)


class InMemoryRateLimiter:
    def __init__(self, default_limit: int = 300, window_seconds: int = 60):
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        # In-memory storage: ip -> list of timestamps
        self.requests: Dict[str, List[float]] = {}
        # Sensitive endpoint overrides (endpoint prefix -> max requests per window)
        self.sensitive_limits = {
            "/api/v1/auth/login": 15,
            "/api/v1/auth/otp/request": 6,
            "/api/v1/auth/otp/send": 6,
            "/api/v1/ai/chat": 30,
            "/api/v1/ai/analyze-document": 15,
        }

    def _cleanup(self, now: float):
        """Cleans up expired timestamps to prevent memory leakage."""
        cutoff = now - self.window_seconds
        for ip in list(self.requests.keys()):
            self.requests[ip] = [ts for ts in self.requests[ip] if ts > cutoff]
            if not self.requests[ip]:
                del self.requests[ip]

    def is_allowed(self, ip: str, path: str) -> Tuple[bool, int, int]:
        now = time.time()
        self._cleanup(now)

        limit = self.default_limit
        for prefix, lim in self.sensitive_limits.items():
            if path.startswith(prefix):
                limit = lim
                break

        key = f"{ip}:{path}" if limit < self.default_limit else ip
        timestamps = self.requests.get(key, [])
        cutoff = now - self.window_seconds
        valid_timestamps = [ts for ts in timestamps if ts > cutoff]

        if len(valid_timestamps) >= limit:
            reset_in = int(self.window_seconds - (now - valid_timestamps[0]))
            return False, 0, max(reset_in, 1)

        valid_timestamps.append(now)
        self.requests[key] = valid_timestamps
        remaining = limit - len(valid_timestamps)
        reset_in = self.window_seconds
        return True, remaining, reset_in


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, default_limit: int = 300, window_seconds: int = 60):
        super().__init__(app)
        self.limiter = InMemoryRateLimiter(default_limit=default_limit, window_seconds=window_seconds)

    async def dispatch(self, request: Request, call_next):
        # Whitelist health checks and documentation endpoints
        path = request.url.path
        if path in ["/", "/docs", "/redoc", "/openapi.json", "/api/v1/openapi.json"]:
            return await call_next(request)

        # Bypass rate limiter during testing while preserving rate limit response headers
        if settings.TESTING or os.getenv("TESTING") == "1":
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(self.limiter.default_limit)
            response.headers["X-RateLimit-Remaining"] = str(self.limiter.default_limit)
            response.headers["X-RateLimit-Reset"] = str(self.limiter.window_seconds)
            return response

        # Extract client IP (handling X-Forwarded-For if behind reverse proxy/Nginx)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"

        allowed, remaining, reset_seconds = self.limiter.is_allowed(client_ip, path)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "تعداد درخواست‌های ارسالی بیش از حد مجاز است. لطفاً اندکی صبر فرمایید.",
                        "retry_after_seconds": reset_seconds,
                    }
                },
                headers={
                    "X-RateLimit-Limit": str(self.limiter.default_limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_seconds),
                    "Retry-After": str(reset_seconds),
                }
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limiter.default_limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_seconds)
        return response
