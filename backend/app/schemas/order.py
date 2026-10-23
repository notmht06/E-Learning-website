"""
Shopping cart, coupon engine, order processing, and Shaparak gateway models.
"""
from typing import List, Optional, Any
from pydantic import BaseModel, Field, model_validator


class CartItemSchema(BaseModel):
    item_id: str = Field(..., example="course-ishraq")
    item_type: str = Field(..., example="course")  # course | book_digital | book_print
    title: str = Field(..., example="Advanced Commentary on Hikmat al-Ishraq")
    price: int = Field(..., example=890000)
    quantity: int = Field(default=1, ge=1)
    cover_image: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_item_type(cls, data: Any) -> Any:
        if isinstance(data, dict):
            it = data.get("item_type")
            if isinstance(it, str) and it.strip().lower() in ("book_physical", "physical"):
                data["item_type"] = "book_print"
        elif hasattr(data, "item_type"):
            it = getattr(data, "item_type")
            if isinstance(it, str) and it.strip().lower() in ("book_physical", "physical"):
                setattr(data, "item_type", "book_print")
        return data


class CartResponse(BaseModel):
    items: List[CartItemSchema]
    items_count: int
    subtotal: int
    discount: int
    total: int


class CouponValidateRequest(BaseModel):
    code: str = Field(..., example="HEKMAT1403")
    cart_total: int = Field(..., ge=0, example=890000)


class CouponValidateResponse(BaseModel):
    code: str
    valid: bool
    discount_percent: int
    discount_amount: int
    final_total: int
    message: str


class CreateOrderRequest(BaseModel):
    items: List[CartItemSchema]
    shipping_address: Optional[str] = Field(None, example="Tehran, Enghelab Sq, Faculty of Letters")
    postal_code: Optional[str] = Field(None, pattern=r"^[0-9]{10}$", example="1417466191")
    recipient_name: Optional[str] = Field(None, example="Ali Mousavi")
    recipient_phone: Optional[str] = Field(None, example="09123456789")
    coupon_code: Optional[str] = None


class OrderSummaryResponse(BaseModel):
    order_id: str = Field(..., example="ORD-140309-8812")
    user_id: Optional[str] = None
    tracking_number: str = Field(..., example="TRK-78912")
    status: str = Field(..., example="processing")
    total_amount: int = Field(..., example=890000)
    items_count: int = Field(..., example=1)
    created_at: str
    postal_barcode_24digit: Optional[str] = Field(None, example="109827364519283746501928")


class PaymentInitRequest(BaseModel):
    order_id: str = Field(..., example="ORD-140309-8812")
    gateway: str = Field(default="zarinpal", example="zarinpal")  # zarinpal | saman | behpardakht
    return_url: str = Field(..., example="http://localhost:3000/checkout/callback")


class PaymentInitResponse(BaseModel):
    payment_token: str
    gateway_redirect_url: str
    order_id: str
    amount: int


class PaymentVerifyRequest(BaseModel):
    authority: str = Field(..., example="AU0000000000000000000000000000000123")
    status: str = Field(..., example="OK")
    tracking_code: Optional[str] = None


class PaymentVerifyResponse(BaseModel):
    success: bool
    reference_id: str
    amount: int
    order_id: str
    card_mask: str
    paid_at: str
