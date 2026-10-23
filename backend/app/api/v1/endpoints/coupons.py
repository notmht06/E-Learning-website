"""
Promotional Coupons Engine Endpoints.
Complies with Clean Architecture and BACKEND_SYSTEM_DESIGN.md.
"""
from fastapi import APIRouter, HTTPException
from backend.app.core.exceptions import AppException
from backend.app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from backend.app.services.coupon_service import coupon_service

router = APIRouter()


@router.post("/validate", response_model=CouponValidateResponse, summary="Validate promotion or student coupon")
def validate_coupon(req: CouponValidateRequest):
    """
    Validates coupon eligibility and calculates promotional discount amount.
    """
    try:
        return coupon_service.validate_coupon(code=req.code, cart_total=req.cart_total)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/list", summary="List active promotional coupons (public or marketing)")
def list_coupons():
    """
    Retrieves available promotional coupons.
    """
    return coupon_service.list_coupons()
