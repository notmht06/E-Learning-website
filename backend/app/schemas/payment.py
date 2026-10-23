"""
Payment initiation and transaction settlement Pydantic v2 schemas.
"""
from typing import Optional
from pydantic import BaseModel, Field


class PaymentInitRequest(BaseModel):
    order_id: str = Field(..., example="ORD-1710000000-1234")
    gateway: str = Field(default="shaparak_sep", example="shaparak_sep")
    return_url: str = Field(default="https://zanjirzan.ir/checkout/callback", example="https://zanjirzan.ir/checkout/callback")


class PaymentInitResponse(BaseModel):
    payment_token: str
    gateway_redirect_url: str
    order_id: str
    amount: int


class PaymentVerifyRequest(BaseModel):
    authority: str = Field(..., example="SHAPARAK_AUTH_12345678")
    status: str = Field(default="OK", example="OK")
    tracking_code: Optional[str] = Field(None, example="TRK-98124")


class PaymentVerifyResponse(BaseModel):
    success: bool
    reference_id: str
    amount: int
    order_id: str
    card_mask: str
    paid_at: str
