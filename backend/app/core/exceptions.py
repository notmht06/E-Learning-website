"""
Domain-specific custom exceptions and central exception handlers.
"""
from typing import Optional
from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""
    def __init__(self, message: str, code: str = "BAD_REQUEST", status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class EntityNotFoundException(AppException):
    def __init__(
        self,
        entity: Optional[str] = None,
        identifier: Optional[str] = None,
        message: Optional[str] = None,
        **kwargs
    ):
        if not message:
            if entity and identifier:
                message = f"موجودیت «{entity}» با شناسه «{identifier}» یافت نشد."
            elif entity:
                message = f"موجودیت «{entity}» یافت نشد."
            elif identifier:
                message = f"موجودیت با شناسه «{identifier}» یافت نشد."
            else:
                message = "موجودیت مورد نظر یافت نشد."

        self.entity = entity
        self.identifier = identifier
        super().__init__(
            message=message,
            code="ENTITY_NOT_FOUND",
            status_code=404
        )


class AuthenticationException(AppException):
    def __init__(self, message: str = "Invalid credentials or session expired."):
        super().__init__(
            message=message,
            code="AUTHENTICATION_FAILED",
            status_code=401
        )


class PermissionDeniedException(AppException):
    def __init__(self, message: str = "Access denied: insufficient permissions."):
        super().__init__(
            message=message,
            code="PERMISSION_DENIED",
            status_code=403
        )


class DRMVerificationException(AppException):
    def __init__(self, message: str = "DRM token verification failed or token has expired."):
        super().__init__(
            message=message,
            code="DRM_SECURITY_BREACH",
            status_code=403
        )


class InvalidCouponException(AppException):
    def __init__(self, message: str = "The provided coupon is invalid or has expired."):
        super().__init__(
            message=message,
            code="INVALID_COUPON",
            status_code=400
        )


async def app_exception_handler(request: Request, exc: AppException):
    """Central FastAPI JSON exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error_code": exc.code,
            "message": exc.message,
            "detail": exc.message,
            "path": str(request.url.path)
        }
    )
