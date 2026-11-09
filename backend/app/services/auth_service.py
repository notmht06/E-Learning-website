"""
Authentication and Identity Service with Live SQLAlchemy Async Sessions.
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian & Reliability Engine).
"""
import asyncio
import logging
logger = logging.getLogger("platform.auth_service")
import time
import uuid
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.exceptions import AuthenticationException, AppException
from backend.app.core.security import create_access_token, hash_password, verify_password
from backend.app.models.models import User, Enrollment
from backend.app.models.database import async_session
from backend.app.services.session_service import session_service


class ExpiringOtpDict(dict):
    """Dictionary supporting TTL expiration for pending OTPs."""
    def get(self, key, default=None):
        val = super().get(key, default)
        if val is None:
            return default
        if isinstance(val, tuple):
            code, exp = val
            if time.time() > exp:
                super().pop(key, None)
                return default
            return code
        return val

    def __getitem__(self, key):
        val = super().__getitem__(key)
        if isinstance(val, tuple):
            code, exp = val
            if time.time() > exp:
                super().pop(key, None)
                raise KeyError(key)
            return code
        return val


class AuthService:
    def __init__(self):
        self.pending_otps = ExpiringOtpDict()

    def get_pending_otp(self, phone: str) -> Optional[str]:
        clean_phone = self.normalize_phone(phone)
        return self.pending_otps.get(clean_phone)

    async def register_user(
        self,
        db_or_full_name: Any = None,
        full_name: Optional[str] = None,
        phone: str = "",
        password: str = "",
        role: str = "student",
        db: Optional[AsyncSession] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Registers a new student account in the SQLite database with bcrypt-hashed password.
        Supports both positional and keyword invocation styles.
        """
        actual_ip = ip_address or kwargs.get("ip_address")
        actual_ua = user_agent or kwargs.get("user_agent")
        if isinstance(db_or_full_name, AsyncSession):
            actual_db = db_or_full_name
            actual_name = full_name or kwargs.get("full_name") or "دانشجوی حکمت"
            actual_phone = phone or kwargs.get("phone", "")
            actual_password = password or kwargs.get("password", "")
            actual_role = role
        else:
            actual_db = db
            actual_name = full_name if full_name is not None else (str(db_or_full_name) if db_or_full_name else "دانشجوی حکمت")
            actual_phone = phone or kwargs.get("phone", "")
            actual_password = password or kwargs.get("password", "")
            actual_role = role

        if actual_db is None:
            async with async_session() as session:
                res = await self._register_user_tx(
                    session, actual_name, actual_phone, actual_password, actual_role,
                    ip_address=actual_ip, user_agent=actual_ua
                )
                await session.commit()
                return res
        return await self._register_user_tx(
            actual_db, actual_name, actual_phone, actual_password, actual_role,
            ip_address=actual_ip, user_agent=actual_ua
        )

    async def _register_user_tx(
        self,
        db: AsyncSession,
        full_name: str,
        phone: str,
        password: str,
        role: str = "student",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        clean_phone = self.normalize_phone(phone)
        result = await db.execute(select(User).where(User.mobile == clean_phone))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise AppException(
                message=f"شماره تماس «{phone}» قبلاً در سامانه ثبت شده است. لطفاً وارد شوید یا از شماره دیگری استفاده فرمایید.",
                code="USER_ALREADY_EXISTS",
                status_code=400,
            )

        # Offload CPU-intensive bcrypt hashing to worker thread pool
        hashed_pwd = await asyncio.to_thread(hash_password, password)

        user_id = f"usr-{uuid.uuid4().hex[:8]}"
        new_user = User(
            id=user_id,
            mobile=clean_phone,
            full_name=full_name or "دانشجوی حکمت",
            hashed_password=hashed_pwd,
            role=role or "student",
            wallet_balance="0 تومان",
            is_active=True,
        )
        db.add(new_user)
        try:
            await db.flush()
        except IntegrityError:
            await db.rollback()
            raise AppException(
                message=f"شماره تماس «{clean_phone}» قبلاً در سامانه ثبت شده است. لطفاً وارد شوید یا از شماره دیگری استفاده فرمایید.",
                code="USER_ALREADY_EXISTS",
                status_code=400,
            )

        jti = await session_service.register_device_session(
            db=db,
            user_id=user_id,
            device_name=user_agent[:60] if user_agent else "مرورگر وب",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        token = create_access_token(data={"sub": user_id, "phone": clean_phone, "role": new_user.role, "jti": jti})
        return new_user.to_dict(access_token=token)

    async def authenticate_user(
        self,
        db_or_phone: Any = None,
        phone: Optional[str] = None,
        password: str = "",
        db: Optional[AsyncSession] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Authenticates user credentials against the persistent SQLite database with bcrypt validation.
        Eliminates auto-provisioning: raises AuthenticationException on invalid credentials.
        """
        actual_ip = ip_address or kwargs.get("ip_address")
        actual_ua = user_agent or kwargs.get("user_agent")
        if isinstance(db_or_phone, AsyncSession):
            actual_db = db_or_phone
            actual_phone = phone or kwargs.get("phone", "")
            actual_password = password or kwargs.get("password", "")
        else:
            actual_db = db
            actual_phone = phone if phone is not None else (str(db_or_phone) if db_or_phone else "")
            actual_password = password or kwargs.get("password", "")

        if actual_db is None:
            async with async_session() as session:
                return await self._authenticate_user_tx(
                    session, actual_phone, actual_password,
                    ip_address=actual_ip, user_agent=actual_ua
                )
        return await self._authenticate_user_tx(
            actual_db, actual_phone, actual_password,
            ip_address=actual_ip, user_agent=actual_ua
        )

    async def _authenticate_user_tx(
        self,
        db: AsyncSession,
        phone: str,
        password: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Dict[str, Any]:
        clean_phone = self.normalize_phone(phone)
        result = await db.execute(
            select(User)
            .options(selectinload(User.enrollments))
            .where(User.mobile == clean_phone)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise AuthenticationException(message="شماره تماس یا کلمه عبور وارد شده نادرست است.")

        # Offload CPU-intensive bcrypt checkpw verification to worker thread pool
        is_valid = await asyncio.to_thread(verify_password, password, user.hashed_password)
        if not is_valid:
            raise AuthenticationException(message="شماره تماس یا کلمه عبور وارد شده نادرست است.")

        if not user.is_active:
            raise AppException(
                message="حساب کاربری شما غیرفعال شده است.",
                code="ACCOUNT_INACTIVE",
                status_code=403,
            )

        jti = await session_service.register_device_session(
            db=db,
            user_id=user.id,
            device_name=user_agent[:60] if user_agent else "مرورگر وب",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        token = create_access_token(data={"sub": user.id, "phone": user.mobile, "role": user.role, "jti": jti})
        return user.to_dict(access_token=token)

    @staticmethod
    def normalize_phone(phone: str) -> str:
        """Normalizes Persian/Arabic digits and international prefixes in phone numbers."""
        if not phone:
            return ""
        trans = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
        cleaned = str(phone).strip().translate(trans)
        if cleaned.startswith("+98"):
            cleaned = "0" + cleaned[3:]
        elif cleaned.startswith("0098"):
            cleaned = "0" + cleaned[4:]
        return cleaned

    def request_otp(self, phone: str, dispatch_sms: bool = False) -> Dict[str, Any]:
        """
        Generates a 6-digit OTP code using CSPRNG in production (or deterministic test code in dev)
        and stores it with TTL in Redis and fallback store.
        """
        import secrets
        from backend.app.core.config import settings
        from backend.app.core.redis_client import redis_service

        clean_phone = self.normalize_phone(phone)

        if settings.ENVIRONMENT == "production" or settings.OTP_MODE == "production":
            code = str(secrets.randbelow(900000) + 100000)
        else:
            code = "123456"

        self.pending_otps[clean_phone] = (code, time.time() + settings.OTP_EXPIRE_SECONDS)
        redis_service._fallback.set(f"otp:{clean_phone}", code, ex=settings.OTP_EXPIRE_SECONDS)
        redis_service._fallback.delete(f"otp_attempts:{clean_phone}")

        # Schedule async redis persistence and SMS dispatch if explicitly requested and an event loop is running
        if dispatch_sms:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(redis_service.set(f"otp:{clean_phone}", code, ex=settings.OTP_EXPIRE_SECONDS))
                loop.create_task(redis_service.delete(f"otp_attempts:{clean_phone}"))
                from backend.app.core.sms_provider import sms_provider
                loop.create_task(sms_provider.send_otp_sms(clean_phone, code))
            except RuntimeError as exc:
                logger.debug("No running asyncio event loop in thread; deferred background task: %s", exc)

        response: Dict[str, Any] = {
            "success": True,
            "phone": clean_phone,
            "expires_in_seconds": settings.OTP_EXPIRE_SECONDS,
            "message": "کد تأیید با موفقیت ارسال شد.",
        }
        if settings.OTP_MODE != "production" and settings.ENVIRONMENT != "production":
            response["mock_code"] = code
        return response

    async def verify_otp(
        self,
        phone_or_db: Any = None,
        code: str = "",
        phone: Optional[str] = None,
        db: Optional[AsyncSession] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        full_name: Optional[str] = None,
        password: Optional[str] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Verifies OTP with brute-force attempt limiting and establishes an authenticated session."""
        from backend.app.core.config import settings
        from backend.app.core.redis_client import redis_service

        actual_ip = ip_address or kwargs.get("ip_address")
        actual_ua = user_agent or kwargs.get("user_agent")
        actual_name = full_name or kwargs.get("full_name")
        actual_password = password or kwargs.get("password")
        digit_trans = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")

        if isinstance(phone_or_db, AsyncSession):
            actual_db = phone_or_db
            actual_phone = self.normalize_phone(phone or kwargs.get("phone", ""))
            actual_code = str(code or kwargs.get("code", "")).strip().translate(digit_trans)
        else:
            actual_db = db
            actual_phone = self.normalize_phone(phone if phone is not None else str(phone_or_db))
            actual_code = str(code).strip().translate(digit_trans)

        attempts_key = f"otp_attempts:{actual_phone}"
        raw_attempts = await redis_service.get(attempts_key)
        attempts = int(raw_attempts) if raw_attempts is not None and str(raw_attempts).isdigit() else 0
        if attempts >= settings.OTP_MAX_ATTEMPTS:
            raise AppException(
                message="تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً ۲ دقیقه دیگر مجدداً درخواست کد دهید.",
                code="OTP_MAX_ATTEMPTS_EXCEEDED",
                status_code=429,
            )

        cached_otp = await redis_service.get(f"otp:{actual_phone}")
        pending_entry = self.pending_otps.get(actual_phone)
        stored_from_pending = None
        if isinstance(pending_entry, tuple):
            code_val, exp_time = pending_entry
            if time.time() <= exp_time:
                stored_from_pending = code_val
            else:
                self.pending_otps.pop(actual_phone, None)
        elif isinstance(pending_entry, str):
            stored_from_pending = pending_entry

        stored = cached_otp or stored_from_pending
        if isinstance(stored, tuple):
            stored = stored[0]

        if not stored or actual_code != stored:
            await redis_service.set(attempts_key, str(attempts + 1), ex=settings.OTP_EXPIRE_SECONDS)
            raise AuthenticationException(message="کد تأیید نامعتبر یا منقضی شده است.")

        await redis_service.delete(f"otp:{actual_phone}")
        await redis_service.delete(attempts_key)
        self.pending_otps.pop(actual_phone, None)

        if actual_db is None:
            async with async_session() as session:
                res = await self._verify_otp_tx(
                    session, actual_phone, actual_code,
                    ip_address=actual_ip, user_agent=actual_ua,
                    full_name=actual_name, password=actual_password,
                )
                await session.commit()
                return res
        return await self._verify_otp_tx(
            actual_db, actual_phone, actual_code,
            ip_address=actual_ip, user_agent=actual_ua,
            full_name=actual_name, password=actual_password,
        )

    async def _verify_otp_tx(
        self,
        db: AsyncSession,
        phone: str,
        code: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        full_name: Optional[str] = None,
        password: Optional[str] = None,
    ) -> Dict[str, Any]:
        result = await db.execute(select(User).where(User.mobile == phone))
        user = result.scalar_one_or_none()

        import secrets
        if not user:
            user_id = f"usr-{uuid.uuid4().hex[:8]}"
            hashed_pwd = hash_password(password) if password else hash_password(secrets.token_urlsafe(32))
            user = User(
                id=user_id,
                mobile=phone,
                full_name=full_name or "دانشجوی حکمت",
                hashed_password=hashed_pwd,
                role="student",
                wallet_balance="0 تومان",
                is_active=True,
            )
            db.add(user)
            await db.flush()
        else:
            if full_name and (not user.full_name or user.full_name == "دانشجوی حکمت"):
                user.full_name = full_name
            if password and not user.hashed_password:
                user.hashed_password = hash_password(password)
            await db.flush()

        jti = await session_service.register_device_session(
            db=db,
            user_id=user.id,
            device_name=user_agent[:60] if user_agent else "مرورگر وب",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        token = create_access_token(data={"sub": user.id, "phone": user.mobile, "role": user.role, "jti": jti})
        return user.to_dict(access_token=token)

    async def get_user_by_id(
        self,
        user_id_or_db: Any = None,
        user_id: Optional[str] = None,
        db: Optional[AsyncSession] = None,
        **kwargs,
    ) -> Optional[Dict[str, Any]]:
        """Retrieves user profile by ID from the persistent SQLite database."""
        if isinstance(user_id_or_db, AsyncSession):
            actual_db = user_id_or_db
            actual_user_id = user_id or kwargs.get("user_id", "")
        else:
            actual_db = db
            if user_id is not None:
                actual_user_id = user_id
            elif user_id_or_db is not None:
                actual_user_id = str(user_id_or_db)
            else:
                actual_user_id = kwargs.get("user_id", "")

        if actual_db is None:
            async with async_session() as session:
                return await self._fetch_user_with_enrollments(session, actual_user_id)

        return await self._fetch_user_with_enrollments(actual_db, actual_user_id)

    async def _fetch_user_with_enrollments(self, session: AsyncSession, uid: str) -> Optional[Dict[str, Any]]:
        res = await session.execute(
            select(User)
            .options(selectinload(User.enrollments))
            .where(User.id == uid)
        )
        user = res.scalar_one_or_none()
        if not user:
            return None
        return user.to_dict()

    async def update_profile(
        self,
        user_id_or_db: Any = None,
        full_name: Optional[str] = None,
        email: Optional[str] = None,
        avatar_url: Optional[str] = None,
        password: Optional[str] = None,
        current_password: Optional[str] = None,
        user_id: Optional[str] = None,
        db: Optional[AsyncSession] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Updates user profile details in SQLite."""
        if isinstance(user_id_or_db, AsyncSession):
            actual_db = user_id_or_db
            actual_user_id = user_id or kwargs.get("user_id", "")
        else:
            actual_db = db
            actual_user_id = user_id if user_id is not None else str(user_id_or_db)

        if actual_db is None:
            async with async_session() as session:
                res = await self._update_profile_tx(session, actual_user_id, full_name, email, avatar_url, password, current_password)
                await session.commit()
                return res
        return await self._update_profile_tx(actual_db, actual_user_id, full_name, email, avatar_url, password, current_password)

    async def _update_profile_tx(
        self,
        db: AsyncSession,
        user_id: str,
        full_name: Optional[str],
        email: Optional[str],
        avatar_url: Optional[str],
        password: Optional[str] = None,
        current_password: Optional[str] = None,
    ) -> Dict[str, Any]:
        result = await db.execute(
            select(User)
            .options(selectinload(User.enrollments))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise AppException(message="کاربر مورد نظر یافت نشد.", code="USER_NOT_FOUND", status_code=404)

        if full_name is not None:
            user.full_name = full_name
        if email is not None:
            user.email = email
        if avatar_url is not None:
            user.avatar_url = avatar_url
        if password is not None and password.strip():
            clean_pass = password.strip()
            if len(clean_pass) < 6:
                raise AppException(message="کلمه عبور جدید باید حداقل ۶ کاراکتر باشد.", code="WEAK_PASSWORD", status_code=400)
            if user.hashed_password and current_password:
                from backend.app.core.security import verify_password
                if not verify_password(current_password, user.hashed_password):
                    raise AppException(message="کلمه عبور فعلی واردشده نادرست است.", code="INVALID_CURRENT_PASSWORD", status_code=400)
            elif user.hashed_password and not current_password:
                raise AppException(message="برای تغییر کلمه عبور، وارد کردن کلمه عبور فعلی الزامی است.", code="CURRENT_PASSWORD_REQUIRED", status_code=400)
            from backend.app.core.security import hash_password
            user.hashed_password = hash_password(clean_pass)
        await db.flush()

        return user.to_dict()


auth_service = AuthService()
