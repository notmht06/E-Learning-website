"""
Promotional coupon and voucher Pydantic v2 schemas.
"""
from typing import Optional
from pydantic import BaseModel, Field


class CouponValidateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50, example="HEKMAT1403")
    cart_total: int = Field(..., ge=0, example=890000)


class CouponValidateResponse(BaseModel):
    code: str = Field(..., example="HEKMAT1403")
    valid: bool = Field(..., example=True)
    discount_percent: int = Field(default=0, ge=0, le=100, example=20)
    discount_amount: int = Field(default=0, ge=0, example=178000)
    final_total: int = Field(default=0, ge=0, example=712000)
    message: str = Field(..., example="Coupon applied: 20% discount granted.")


class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, example="SPECIAL50")
    discount_percent: int = Field(..., ge=1, le=100, example=50)
    max_uses: Optional[int] = Field(None, ge=1)
    description: Optional[str] = Field(None, max_length=255)
