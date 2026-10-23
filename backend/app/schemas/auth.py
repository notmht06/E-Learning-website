"""
Authentication and user identity Pydantic models.
"""
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator


def normalize_phone_digits(val: Any) -> str:
    if not val:
        return ""
    trans = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
    cleaned = str(val).strip().translate(trans)
    if cleaned.startswith("+98"):
        cleaned = "0" + cleaned[3:]
    elif cleaned.startswith("0098"):
        cleaned = "0" + cleaned[4:]
    return cleaned


def normalize_code_digits(val: Any) -> str:
    if not val:
        return ""
    trans = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
    return str(val).strip().translate(trans)


class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., example="Ali Mousavi")
    phone: str = Field(..., pattern=r"^09[0-9]{9}$", example="09123456789")
    password: str = Field(..., min_length=6, example="Secret1234")

    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v: Any) -> str:
        return normalize_phone_digits(v)


class UserLoginRequest(BaseModel):
    phone: str = Field(..., example="09123456789")
    password: str = Field(..., example="Secret1234")

    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v: Any) -> str:
        return normalize_phone_digits(v)


class OTPRequest(BaseModel):
    phone: str = Field(..., pattern=r"^09[0-9]{9}$", example="09123456789")

    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v: Any) -> str:
        return normalize_phone_digits(v)


class OTPVerifyRequest(BaseModel):
    phone: str = Field(..., example="09123456789")
    code: str = Field(..., min_length=4, max_length=6, example="123456")

    @field_validator("phone", mode="before")
    @classmethod
    def clean_phone(cls, v: Any) -> str:
        return normalize_phone_digits(v)

    @field_validator("code", mode="before")
    @classmethod
    def clean_code(cls, v: Any) -> str:
        return normalize_code_digits(v)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, example="Ali Mousavi")
    email: Optional[str] = Field(None, example="ali@example.com")
    avatar_url: Optional[str] = Field(None, example="https://api.zanjirzan.ir/avatars/user.jpg")


class UserResponse(BaseModel):
    id: str = Field(..., example="usr-140301")
    full_name: str = Field(..., example="Ali Mousavi")
    phone: str = Field(..., example="09123456789")
    role: str = Field(..., example="student")
    wallet_balance: str = Field(..., example="350,000 Tomans")
    enrolled_courses_count: int = Field(0, example=2)
    enrolled_course_ids: List[str] = Field(default_factory=list, example=["course-mabadi-mantiq"])
    access_token: Optional[str] = None
    avatar_url: Optional[str] = Field(None, example="https://api.zanjirzan.ir/avatars/user.jpg")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 604800
