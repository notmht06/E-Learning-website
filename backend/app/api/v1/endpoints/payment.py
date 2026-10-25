"""
Banking Gateway and Shaparak Settlement API Endpoints with Zarinpal Integration.
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Financial Security).
"""
import uuid
import random
import logging
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.schemas.payment import (
    PaymentInitRequest,
    PaymentInitResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)
from backend.app.services.payment_gateway_service import payment_gateway
from backend.app.services.order_service import order_service
from backend.app.services.course_service import course_service
from backend.app.models.models import Order, Enrollment, Course, PaymentTransaction
from backend.app.models.database import get_db
from backend.app.core.exceptions import AppException
from backend.app.api.deps import get_current_user

logger = logging.getLogger("platform.payment")
router = APIRouter()


async def _process_order_paid_and_enroll(db: AsyncSession, order_id: str, tx_user_id: str):
    """Marks order paid in database and enrolls student in all purchased course items."""
    if not order_id:
        return
    try:
        stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
        res = await db.execute(stmt)
        order_obj = res.scalar_one_or_none()
        if order_obj:
            order_obj.status = "paid"
            if not order_obj.user_id and tx_user_id:
                order_obj.user_id = tx_user_id
            effective_user_id = order_obj.user_id or tx_user_id
            items_to_process = order_obj.items
        else:
            effective_user_id = tx_user_id
            mem_order = order_service.orders.get(order_id)
            items_to_process = mem_order.get("items", []) if mem_order else []

        if effective_user_id and items_to_process:
            now = datetime.utcnow()
            for it in items_to_process:
                itype = str(getattr(it, "item_type", None) or (it.get("item_type") if isinstance(it, dict) else "")).lower()
                iid = str(getattr(it, "item_id", None) or (it.get("item_id") if isinstance(it, dict) else ""))
                if itype == "course" or iid.startswith("course-"):
                    enr_chk = await db.execute(
                        select(Enrollment).where(
                            Enrollment.user_id == effective_user_id,
                            Enrollment.course_id == iid,
                            Enrollment.status == "active",
                        )
                    )
                    if not enr_chk.scalar_one_or_none():
                        c_chk = await db.execute(select(Course).where(Course.id == iid))
                        if not c_chk.scalar_one_or_none():
                            try:
                                cat_c = course_service.get_course_by_id(iid)
                                ctitle = cat_c.get("title", iid)
                                cslug = cat_c.get("slug", iid)
                            except Exception:
                                ctitle = getattr(it, "title", None) or (it.get("title") if isinstance(it, dict) else iid) or iid
                                cslug = iid
                            db_c = Course(
                                id=iid,
                                title_fa=ctitle,
                                slug=cslug,
                                author_name="حجت الاسلام دکتر زنجیر زن حسینی",
                                desc_fa="",
                                level="سطوح عالی و خارج",
                                is_published=True,
                            )
                            db.add(db_c)
                            await db.flush()

                        auto_enr = Enrollment(
                            id=f"enr-{uuid.uuid4().hex[:8]}",
                            user_id=effective_user_id,
                            course_id=iid,
                            status="active",
                            enrolled_at=now,
                        )
                        db.add(auto_enr)

            await db.commit()
    except Exception as exc:
        await db.rollback()
        logger.error("Error processing order payment and enrollment for %s: %s", order_id, exc)
        raise exc

    if order_id in order_service.orders:
        order_service.orders[order_id]["status"] = "paid"


@router.post("/init", response_model=PaymentInitResponse, summary="Initiate real bank payment")
async def initiate_payment(
    req: PaymentInitRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Requests a payment authority token from Zarinpal / Sandbox gateway.
    Maintains thread-safe atomic transaction state tracking.
    Requires existing order owned by current user (or admin).
    """
    order = await order_service.get_order_by_id_tx(db, req.order_id)
    if not order:
        try:
            order = order_service.get_order_by_id(req.order_id)
        except Exception:
            order = None

    if not order:
        raise AppException(
            message="سفارش مورد نظر جهت پرداخت یافت نشد.",
            code="ORDER_NOT_FOUND",
            status_code=404
        )

    order_uid = order.get("user_id") if isinstance(order, dict) else getattr(order, "user_id", None)
    # Associate orphan order with authenticated user if unassigned
    if not order_uid and current_user and current_user.get("id"):
        if hasattr(order, "user_id"):
            order.user_id = current_user["id"]
            await db.commit()
        elif isinstance(order, dict):
            order["user_id"] = current_user["id"]
        order_uid = current_user["id"]

    if order_uid and current_user.get("role") != "admin" and order_uid != current_user.get("id"):
        raise AppException(
            message="دسترسی غیرمجاز: شما مالک این سفارش نیستید.",
            code="ORDER_FORBIDDEN",
            status_code=403
        )

    amount = int(order.get("total_amount", 0) if isinstance(order, dict) else getattr(order, "total_amount", 0))
    if amount <= 0:
        amount = 0
        token = f"FREE-AUTH-{uuid.uuid4().hex[:12]}"
        now_dt = datetime.utcnow()

        db_tx = PaymentTransaction(
            authority=token,
            order_id=req.order_id,
            user_id=current_user["id"],
            gateway=req.gateway,
            amount=0,
            return_url=req.return_url,
            status="pending",
            reference_id=None,
            card_mask="رایگان (بدون تراکنش بانکی)",
            created_at=now_dt,
            paid_at=None,
        )
        db.add(db_tx)
        await db.commit()

        await _process_order_paid_and_enroll(db, req.order_id, current_user["id"])

        sep = "&" if "?" in req.return_url else "?"
        return {
            "payment_token": token,
            "gateway_redirect_url": f"{req.return_url}{sep}Authority={token}&Status=OK",
            "order_id": req.order_id,
            "amount": 0,
        }

    res = await payment_gateway.request_payment(
        amount_tomans=amount,
        callback_url=req.return_url,
        description=f"پرداخت سفارش پستی و آموزشی حیات (فاکتور: {req.order_id})"
    )
    token = res["payment_token"]

    # Register in database PaymentTransaction table as single source of truth
    now_dt = datetime.utcnow()
    db_tx = PaymentTransaction(
        authority=token,
        order_id=req.order_id,
        user_id=current_user["id"],
        gateway=req.gateway,
        amount=amount,
        return_url=req.return_url,
        status="pending",
        created_at=now_dt,
    )
    db.add(db_tx)
    await db.commit()

    return {
        "payment_token": token,
        "gateway_redirect_url": res["gateway_redirect_url"],
        "order_id": req.order_id,
        "amount": amount,
    }


@router.post("/verify", response_model=PaymentVerifyResponse, summary="Verify bank transaction")
async def verify_payment(
    req: PaymentVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verifies bank callback authority with Zarinpal and updates order status.
    Strictly defends against replay attacks, duplicate tracking codes, and failed state resurrection.
    Requires authentication and transaction ownership (or admin role).
    Durable across multi-worker deployments via PaymentTransaction DB table.
    """
    # 1. Fetch transaction from DB (Single Source of Truth)
    tx_stmt = select(PaymentTransaction).where(PaymentTransaction.authority == req.authority)
    tx_res = await db.execute(tx_stmt)
    db_tx = tx_res.scalar_one_or_none()

    if not db_tx:
        raise AppException(
            message="شناسه پرداخت (Authority) یافت نشد.",
            code="PAYMENT_NOT_FOUND",
            status_code=400
        )

    # 2. Authorization check
    if current_user.get("role") != "admin" and db_tx.user_id and db_tx.user_id != current_user.get("id"):
        raise AppException(
            message="دسترسی غیرمجاز: شما مالک این تراکنش پرداخت نیستید.",
            code="PAYMENT_FORBIDDEN",
            status_code=403
        )

    # 3. Check tracking code uniqueness in DB
    if req.tracking_code:
        trk_stmt = select(PaymentTransaction).where(
            PaymentTransaction.tracking_code == req.tracking_code,
            PaymentTransaction.authority != req.authority
        )
        trk_res = await db.execute(trk_stmt)
        if trk_res.scalar_one_or_none():
            raise AppException(
                message="کد پیگیری ارائه شده قبلاً ثبت شده است.",
                code="DUPLICATE_TRACKING_CODE",
                status_code=400
            )

    # 4. Check already paid / replay attack
    if db_tx.status == "paid":
        raise AppException(
            message="این تراکنش قبلاً تایید شده است و امکان استفاده مجدد از آن وجود ندارد.",
            code="PAYMENT_REPLAY_ATTACK",
            status_code=400
        )
    if db_tx.status == "failed":
        raise AppException(
            message="این تراکنش قبلاً ناموفق ثبت شده است و امکان تغییر وضعیت یا استفاده مجدد از آن وجود ندارد.",
            code="PAYMENT_ALREADY_FAILED",
            status_code=400
        )

    is_success = (str(req.status).strip().upper() == "OK")
    paid_timestamp = datetime.now().isoformat()
    tx_amount = db_tx.amount or 0
    tx_order_id = db_tx.order_id or ""

    if not is_success:
        paid_dt_fail = datetime.utcnow()
        stmt_atomic_fail = (
            update(PaymentTransaction)
            .where(
                PaymentTransaction.authority == req.authority,
                PaymentTransaction.status == "pending"
            )
            .values(status="failed", paid_at=paid_dt_fail)
        )
        await db.execute(stmt_atomic_fail)
        await db.commit()
        return {
            "success": False,
            "reference_id": "",
            "amount": tx_amount,
            "order_id": tx_order_id,
            "card_mask": "6037-99**-****-1403",
            "paid_at": paid_dt_fail.isoformat()
        }

    # Atomic DB state transition from pending -> verifying to prevent multi-worker races
    stmt_atomic = (
        update(PaymentTransaction)
        .where(
            PaymentTransaction.authority == req.authority,
            PaymentTransaction.status == "pending"
        )
        .values(
            status="verifying",
            tracking_code=req.tracking_code if req.tracking_code else PaymentTransaction.tracking_code
        )
    )
    atomic_res = await db.execute(stmt_atomic)
    await db.commit()

    if atomic_res.rowcount == 0:
        # Re-fetch row to determine exact cause of transition failure
        refetch_stmt = select(PaymentTransaction).where(PaymentTransaction.authority == req.authority)
        refetch_res = await db.execute(refetch_stmt)
        latest_tx = refetch_res.scalar_one_or_none()
        if not latest_tx:
            raise AppException(
                message="شناسه پرداخت (Authority) یافت نشد.",
                code="PAYMENT_NOT_FOUND",
                status_code=400
            )
        if latest_tx.status == "paid":
            raise AppException(
                message="این تراکنش قبلاً تایید شده است و امکان استفاده مجدد از آن وجود ندارد.",
                code="PAYMENT_REPLAY_ATTACK",
                status_code=400,
            )
        if latest_tx.status == "failed":
            raise AppException(
                message="این تراکنش قبلاً ناموفق ثبت شده است و امکان تغییر وضعیت یا استفاده مجدد از آن وجود ندارد.",
                code="PAYMENT_ALREADY_FAILED",
                status_code=400,
            )
        if latest_tx.status == "verifying":
            raise AppException(
                message="این تراکنش در حال پردازش همزمان است. لطفاً شکیبا باشید.",
                code="PAYMENT_CONCURRENT_PROCESSING",
                status_code=400,
            )
        raise AppException(
            message="این تراکنش در وضعیت قابل پردازش قرار ندارد.",
            code="INVALID_PAYMENT_STATE",
            status_code=400,
        )

    # 5. Verify with banking gateway / Zarinpal (or bypass for free transactions)
    if tx_amount == 0 or str(req.authority).startswith("FREE-AUTH-"):
        is_verified = True
        verify_res = {
            "success": True,
            "reference_id": f"FREE-{uuid.uuid4().hex[:8]}",
            "card_mask": "رایگان (بدون تراکنش بانکی)",
        }
    else:
        try:
            verify_res = await payment_gateway.verify_payment(
                authority=req.authority,
                amount_tomans=tx_amount
            )
        except Exception as exc:
            logger.warning("Payment gateway network error: %s", exc)
            await db.execute(
                update(PaymentTransaction)
                .where(PaymentTransaction.authority == req.authority)
                .values(status="pending")
            )
            await db.commit()
            raise AppException(
                message="خطا در برقراری ارتباط با درگاه پرداخت بانکی. لطفاً دقایقی دیگر مجدداً تلاش فرمایید.",
                code="PAYMENT_GATEWAY_NETWORK_ERROR",
                status_code=502,
            )

        is_verified = verify_res.get("success", False)

    if not is_verified:
        paid_dt_fail = datetime.utcnow()
        await db.execute(
            update(PaymentTransaction)
            .where(PaymentTransaction.authority == req.authority)
            .values(status="failed", paid_at=paid_dt_fail)
        )
        await db.commit()
        return {
            "success": False,
            "reference_id": "",
            "amount": tx_amount,
            "order_id": tx_order_id,
            "card_mask": "6037-99**-****-1403",
            "paid_at": paid_dt_fail.isoformat()
        }

    ref_id = verify_res.get("reference_id") or f"REF-{random.randint(1000000000, 9999999999)}"
    card_mask = verify_res.get("card_mask") or "6037-99**-****-1403"
    paid_dt = datetime.utcnow()

    await db.execute(
        update(PaymentTransaction)
        .where(PaymentTransaction.authority == req.authority)
        .values(
            status="paid",
            tracking_code=req.tracking_code,
            paid_at=paid_dt,
            reference_id=ref_id,
            card_mask=card_mask,
        )
    )
    await db.commit()

    await _process_order_paid_and_enroll(db, tx_order_id, db_tx.user_id if db_tx else current_user["id"])

    return {
        "success": True,
        "reference_id": ref_id,
        "amount": tx_amount,
        "order_id": tx_order_id,
        "card_mask": card_mask,
        "paid_at": paid_dt.isoformat(),
    }
