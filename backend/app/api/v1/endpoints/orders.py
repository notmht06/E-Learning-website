"""
Order Processing and Iran Post Logistics API Endpoints.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.schemas.order import CreateOrderRequest, OrderSummaryResponse
from backend.app.services.order_service import order_service
from backend.app.api.deps import get_optional_user, get_current_user
from backend.app.models.database import get_db

router = APIRouter()


@router.post("/create", response_model=OrderSummaryResponse, summary="Create a new order")
async def create_order(
    req: CreateOrderRequest,
    user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a new order, optionally connects to student, records in database,
    and automatically enrolls the student in purchased courses.
    """
    raw_items = [i.model_dump() for i in req.items]
    return await order_service.create_order_tx(
        items=raw_items,
        shipping_address=req.shipping_address,
        postal_code=req.postal_code,
        recipient_name=req.recipient_name,
        recipient_phone=req.recipient_phone,
        coupon_code=req.coupon_code,
        user=user,
        db=db,
    )


@router.get("/{order_id}", response_model=OrderSummaryResponse, summary="Get order details by order ID")
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves order details, payment status, and shipping barcode using non-blocking AsyncSession.
    Requires authentication and order ownership (or admin role).
    """
    order = await order_service.get_order_by_id_tx(db, order_id)
    if not order:
        try:
            order = order_service.get_order_by_id(order_id)
        except Exception:
            order = None

    if not order:
        raise HTTPException(status_code=404, detail="سفارش مورد نظر یافت نشد.")

    order_uid = order.get("user_id") if isinstance(order, dict) else getattr(order, "user_id", None)
    if order_uid and current_user.get("role") != "admin" and order_uid != current_user.get("id"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز: شما مالک این سفارش نیستید.")

    return order


@router.get("/track/{tracking_code}", summary="Track parcel with 24-digit Iran Post barcode")
def track_shipment(tracking_code: str):
    """
    Provides real-time dispatch status via national Iran Post sorting hub simulation.
    """
    return order_service.track_order_by_code(tracking_code)
