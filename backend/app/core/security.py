"""
Security utility functions for password hashing, JWT tokens, and DRM stream protection.
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian).
"""
import hmac
import hashlib
import time
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError

from backend.app.core.config import settings


def hash_password(password: str) -> str:
    """
    Hashes a password using bcrypt with standard work factor salt.
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against the hashed password.
    Supports backward-compatible fallback for development passwords.
    """
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        # Fallback for plain demo passwords during transition
        return hmac.compare_digest(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta_minutes: Optional[int] = None) -> str:
    """
    Generates a cryptographically signed JWT access token (HS256) with role and expiry claims.
    """
    to_encode = data.copy()
    expire_minutes = expires_delta_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and cryptographically validates a JWT token.
    Returns claims dict or None if invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_drm_token(user_id: str, course_id: str, chapter_id: int) -> dict:
    """
    Generates a secure, short-lived DRM streaming token.
    Prevents direct MP3 downloads and unauthorized URL sharing.
    Uses HMAC-SHA256 signature over user_id, course_id, chapter_id and expiration timestamp.
    """
    timestamp = int(time.time())
    expires_at = timestamp + (settings.DRM_TOKEN_EXPIRE_MINUTES * 60)
    raw_payload = f"{user_id}:{course_id}:{chapter_id}:{expires_at}"
    b64_payload = base64.urlsafe_b64encode(raw_payload.encode("utf-8")).decode("utf-8").rstrip("=")

    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        b64_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    token = f"{b64_payload}.{signature}"
    masked_user = user_id if len(user_id) <= 4 else f"{user_id[:4]}***{user_id[-2:]}"
    forensic_watermark = f"UID: {masked_user} • DRM-{signature[:8].upper()}"

    return {
        "token": token,
        "expires_in_seconds": settings.DRM_TOKEN_EXPIRE_MINUTES * 60,
        "forensic_watermark": forensic_watermark,
        "stream_url": f"/api/v1/stream/hls/{course_id}/{chapter_id}/master.m3u8?token={token}"
    }


def decode_drm_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Cryptographically validates HMAC signature and decodes a DRM streaming token.
    Extracts user_id, course_id, chapter_id, exp, and signature.
    Returns None if signature is invalid or payload is corrupted.
    """
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        b64_payload, signature = parts

        expected_signature = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            b64_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_signature):
            return None

        padding = "=" * (4 - (len(b64_payload) % 4)) if len(b64_payload) % 4 != 0 else ""
        raw_payload = base64.urlsafe_b64decode((b64_payload + padding).encode("utf-8")).decode("utf-8")
        token_uid, token_cid, token_chid, token_exp = raw_payload.split(":")

        return {
            "user_id": token_uid,
            "course_id": token_cid,
            "chapter_id": int(token_chid),
            "exp": int(token_exp),
            "signature": signature,
        }
    except Exception:
        return None


def verify_drm_token(token: str, course_id: str, chapter_id: int, user_id: Optional[str] = None) -> bool:
    """
    Cryptographically verifies that the DRM token:
    1. Has a valid HMAC-SHA256 signature matching SECRET_KEY.
    2. Has not expired.
    3. Matches the requested course_id and chapter_id.
    4. Matches the user_id (if supplied).
    """
    try:
        payload = decode_drm_token(token)
        if not payload:
            return False

        if time.time() > payload["exp"]:
            return False

        if str(payload["course_id"]) != str(course_id) or str(payload["chapter_id"]) != str(chapter_id):
            return False

        if user_id and str(payload["user_id"]) != str(user_id):
            return False

        return True
    except Exception:
        return False
