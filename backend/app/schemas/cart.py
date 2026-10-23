"""
Shopping cart management Pydantic v2 schemas.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class CartItemSchema(BaseModel):
    item_id: str = Field(..., example="course-ishraq")
    item_type: str = Field(default="course", example="course")
    title: str = Field(..., example="شرح و تحلیل جامع حکمة‌الاشراق سهروردی")
    price: int = Field(..., ge=0, example=890000)
    quantity: int = Field(default=1, ge=1, example=1)
    cover_image: Optional[str] = Field(None, example="/images/ostad_zanjirzan.jpg")


class CartAddRequest(BaseModel):
    item_id: str = Field(..., example="course-ishraq")
    item_type: str = Field(default="course", example="course")
    title: str = Field(..., example="شرح و تحلیل جامع حکمة‌الاشراق سهروردی")
    price: int = Field(..., ge=0, example=890000)
    quantity: int = Field(default=1, ge=1, example=1)
    cover_image: Optional[str] = Field(None, example="/images/ostad_zanjirzan.jpg")


class CartRemoveRequest(BaseModel):
    item_id: str = Field(..., example="course-ishraq")


class CartResponse(BaseModel):
    items: List[CartItemSchema] = Field(default_factory=list)
    items_count: int = Field(default=0, ge=0)
    subtotal: int = Field(default=0, ge=0)
    discount: int = Field(default=0, ge=0)
    total: int = Field(default=0, ge=0)
