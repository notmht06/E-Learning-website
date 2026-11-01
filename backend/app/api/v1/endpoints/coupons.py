"""
Promotional Coupons Engine Endpoints.
Complies with Clean Architecture and BACKEND_SYSTEM_DESIGN.md.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.exceptions import AppException
from backend.app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from backend.app.services.coupon_service import coupon_service
from backend.app.models.database import get_db

router = APIRouter()


@router.post("/validate", response_model=CouponValidateResponse, summary="Validate promotion or student coupon")
async def validate_coupon(req: CouponValidateRequest, db: AsyncSession = Depends(get_db)):
    """
    Validates coupon eligibility and calculates promotional discount amount using database.
    """
    try:
        return await coupon_service.validate_coupon_async(code=req.code, cart_total=req.cart_total, db=db)
    except AppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/list", summary="List active promotional coupons (public or marketing)")
async def list_coupons(db: AsyncSession = Depends(get_db)):
    """
    Retrieves available promotional coupons from database.
    """
    return await coupon_service.list_coupons_async(db=db)
