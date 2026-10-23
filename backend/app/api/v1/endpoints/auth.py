"""
Authentication & User Identity API Endpoints with Live DB Transactions.
Complies with BACKEND_SYSTEM_DESIGN.md (Performance Engine & Security Guardian).
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import logging
logger = logging.getLogger("platform.auth")

from backend.app.models.database import get_db
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    OTPRequest,
    OTPVerifyRequest,
    UserResponse,
    UserProfileUpdate,
)
from backend.app.services.auth_service import auth_service
from backend.app.api.deps import get_current_user
from backend.app.core.exceptions import AppException

router = APIRouter()


@router.post("/register", response_model=UserResponse, summary="Register a new student account")
async def register(req: UserRegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Registers a new student account in the persistent SQLite database.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    try:
        return await auth_service.register_user(
            full_name=req.full_name,
            phone=req.phone,
            password=req.password,
            db=db,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="شماره تماس قبلاً در سامانه ثبت شده است.")


@router.post("/login", response_model=UserResponse, summary="Log in with phone and password")
async def login(req: UserLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Authenticates user credentials and issues a secure JWT bearer session.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    try:
        return await auth_service.authenticate_user(
            phone=req.phone,
            password=req.password,
            db=db,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/otp/send", summary="Request OTP verification code")
async def send_otp(req: OTPRequest):
    """
    Dispatches a 6-digit one-time password code to the specified Iranian mobile number.
    """
    clean_phone = auth_service.normalize_phone(req.phone)
    res = auth_service.request_otp(phone=clean_phone)
    raw_code = auth_service.pending_otps.get(clean_phone)
    if not raw_code:
        raise HTTPException(status_code=500, detail="خطا در تولید کد تأیید")
    code = raw_code[0] if isinstance(raw_code, tuple) else str(raw_code)
    from backend.app.core.redis_client import redis_service
    from backend.app.core.config import settings
    await redis_service.set(f"otp:{clean_phone}", code, ex=settings.OTP_EXPIRE_SECONDS)
    await redis_service.delete(f"otp_attempts:{clean_phone}")
    from backend.app.core.sms_provider import sms_provider
    await sms_provider.send_otp_sms(clean_phone, code)
    return res


@router.post("/otp/verify", response_model=UserResponse, summary="Verify OTP and establish session")
async def verify_otp(req: OTPVerifyRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Validates the submitted OTP and returns user profile with JWT access token.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    try:
        return await auth_service.verify_otp(
            phone=req.phone,
            code=req.code,
            db=db,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="خطا در یکپارچگی داده‌های کاربر.")


@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
async def get_me(user: dict = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user session.
    """
    return user


@router.put("/profile", response_model=UserResponse, summary="Update user profile")
async def update_profile(
    req: UserProfileUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates profile details including full name, email, and avatar URI.
    """
    try:
        return await auth_service.update_profile(
            user_id=user["id"],
            full_name=req.full_name,
            email=req.email,
            avatar_url=req.avatar_url,
            db=db,
        )
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="ایمیل یا مشخصات وارد شده تکراری است.")


import uuid
from pydantic import BaseModel, Field
from sqlalchemy import select
from backend.app.models.models import Subscriber


class SubscribeRequest(BaseModel):
    contact: str = Field(..., min_length=3, max_length=120, example="09123456789")


@router.post("/subscribe", summary="Subscribe phone or email to lecture notifications")
async def subscribe_dispatch(req: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    clean_contact = req.contact.strip()
    stmt = select(Subscriber).where(Subscriber.contact == clean_contact)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if not existing:
        try:
            sub = Subscriber(
                id=f"sub-{uuid.uuid4().hex[:8]}",
                contact=clean_contact,
            )
            db.add(sub)
            await db.flush()
        except IntegrityError as exc:
            logger.info("Subscriber already registered during concurrent request: %s", exc)
    return {
        "success": True,
        "contact": clean_contact,
        "message": "اطلاعات شما با موفقیت در خبرنامه علمی حیات ثبت شد.",
    }


from backend.app.services.session_service import session_service


@router.get("/sessions", summary="List active concurrent devices for current user")
async def get_active_sessions(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.core.config import settings
    sessions = await session_service.get_user_active_sessions(db=db, user_id=user["id"])
    current_jti = user.get("jti")
    for s in sessions:
        s["is_current"] = (s.get("token_jti") == current_jti) if current_jti else False
        s.pop("token_jti", None)
    return {
        "max_concurrent_devices": settings.MAX_CONCURRENT_DEVICES,
        "active_count": len(sessions),
        "sessions": sessions,
    }


@router.delete("/sessions/{session_id}", summary="Revoke a specific device session")
async def revoke_session(
    session_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    revoked = await session_service.revoke_user_session(
        db=db, user_id=user["id"], session_id=session_id
    )
    if not revoked:
        raise HTTPException(status_code=404, detail="نشست مورد نظر یافت نشد.")
    return {"success": True, "session_id": session_id}

