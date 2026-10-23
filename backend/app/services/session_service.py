"""
Multi-Device Concurrent Session Management Service.
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian).
Limits authenticated active devices to maximum 3 concurrent sessions per user.
Evicts the oldest session when a 4th device connects (FIFO policy), preventing account sharing.
Integrates with Redis distributed cache and persistent SQLite/PostgreSQL storage.
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.redis_client import redis_service
from backend.app.models.models import UserSession


class SessionService:
    def __init__(self, max_devices: int = 3):
        self.max_devices = max_devices or settings.MAX_CONCURRENT_DEVICES

    async def register_device_session(
        self,
        db: AsyncSession,
        user_id: str,
        device_name: str = "مرورگر وب",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> str:
        """
        Creates a new active session and enforces the max concurrent devices limit (default: 3).
        If user already has 3 active devices, evicts the oldest device session.
        Returns the unique session JTI to be embedded into the JWT token.
        """
        jti = f"sess-{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow()

        # 1. Fetch all currently active sessions for this user sorted by last_active_at ascending
        stmt = (
            select(UserSession)
            .where(UserSession.user_id == user_id, UserSession.is_active == True)
            .order_by(UserSession.last_active_at.asc())
        )
        res = await db.execute(stmt)
        active_sessions = list(res.scalars().all())

        # 2. If active sessions count reaches or exceeds limit, evict the oldest ones
        if len(active_sessions) >= self.max_devices:
            excess_count = len(active_sessions) - self.max_devices + 1
            for old_sess in active_sessions[:excess_count]:
                old_sess.is_active = False
                old_sess.last_active_at = now
                # Invalidate in Redis
                await redis_service.set(f"sess:{old_sess.token_jti}", "revoked", ex=3600)

        # 3. Create the new session record
        new_session = UserSession(
            id=f"sess-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            device_name=device_name or "دستگاه مجاز",
            ip_address=ip_address,
            user_agent=user_agent,
            token_jti=jti,
            created_at=now,
            last_active_at=now,
            is_active=True,
        )
        db.add(new_session)
        await db.flush()

        # 4. Cache active session token in Redis
        ttl = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        await redis_service.set(f"sess:{jti}", "active", ex=ttl)

        return jti

    async def is_session_active(self, db: AsyncSession, user_id: str, jti: str) -> bool:
        """
        Validates if the session JTI is active.
        First checks Redis; if cache miss, queries database.
        """
        # Fast path via Redis
        cached_status = await redis_service.get(f"sess:{jti}")
        if cached_status == "revoked":
            return False
        if cached_status == "active":
            return True

        # DB path
        stmt = select(UserSession).where(
            UserSession.user_id == user_id,
            UserSession.token_jti == jti,
            UserSession.is_active == True,
        )
        res = await db.execute(stmt)
        sess = res.scalar_one_or_none()
        if sess:
            await redis_service.set(f"sess:{jti}", "active", ex=3600)
            return True
        else:
            await redis_service.set(f"sess:{jti}", "revoked", ex=3600)
            return False

    async def get_user_active_sessions(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        """Lists all currently active devices for a user."""
        stmt = (
            select(UserSession)
            .where(UserSession.user_id == user_id, UserSession.is_active == True)
            .order_by(UserSession.last_active_at.desc())
        )
        res = await db.execute(stmt)
        return [s.to_dict() for s in res.scalars().all()]

    async def revoke_user_session(self, db: AsyncSession, user_id: str, session_id: str) -> bool:
        """Revokes a specific active device session belonging to the user."""
        stmt = select(UserSession).where(
            UserSession.id == session_id,
            UserSession.user_id == user_id,
        )
        res = await db.execute(stmt)
        sess = res.scalar_one_or_none()
        if not sess:
            return False
        sess.is_active = False
        sess.last_active_at = datetime.utcnow()
        await redis_service.set(f"sess:{sess.token_jti}", "revoked", ex=86400)
        await db.flush()
        return True


# Global Singleton
session_service = SessionService()
