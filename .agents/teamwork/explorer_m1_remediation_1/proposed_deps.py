"""
FastAPI dependency injection utilities with async live database sessions.
Provides cryptographically verified authentication and role-based authorization dependencies.
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian & Performance Engine).
"""
from typing import Dict, Any, Optional
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.database import get_db
from backend.app.services.auth_service import auth_service
from backend.app.core.security import decode_access_token


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Dependency that extracts and cryptographically validates the user JWT token from the Authorization header.
    Retrieves fresh user from SQLite database via AsyncSession.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="سرآیند احراز هویت (Authorization) یافت نشد.",
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="قالب سرآیند احراز هویت نامعتبر است (الگوی استاندارد: Bearer <TOKEN>).",
        )

    token = parts[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن نشست نامعتبر یا منقضی شده است. لطفاً مجدداً وارد شوید.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.",
        )

    user = await auth_service.get_user_by_id(user_id=user_id, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.",
        )

    return user


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[Dict[str, Any]]:
    """
    Dependency for endpoints where authentication is optional.
    """
    if not authorization:
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except HTTPException:
        return None


async def get_current_admin(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Dependency that ensures the authenticated user strictly possesses admin privileges.
    Rejects any unauthenticated or non-admin attempts with 401 or 403.
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی به این بخش منحصراً در اختیار مدیر پایگاه است.",
        )
    return user
