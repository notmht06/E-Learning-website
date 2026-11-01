"""
Promotional Coupons & Voucher Service.
Complies with Clean Architecture and BACKEND_SYSTEM_DESIGN.md.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
logger = logging.getLogger("platform.coupon")
from backend.app.core.exceptions import InvalidCouponException


class CouponService:
    def __init__(self):
        self.coupons: Dict[str, Dict[str, Any]] = {
            "HEKMAT1403": {
                "discount_percent": 20,
                "is_active": True,
                "expires_at": "2027-12-30T23:59:59"
            },
            "TALABE50": {
                "discount_percent": 50,
                "is_active": True,
                "expires_at": "2027-12-30T23:59:59"
            },
            "NOROOZ": {
                "discount_percent": 15,
                "is_active": True,
                "expires_at": "2027-12-30T23:59:59"
            },
            "ZANJIRZAN": {
                "discount_percent": 25,
                "is_active": True,
                "expires_at": "2027-12-30T23:59:59"
            },
            "HAYAT": {
                "discount_percent": 30,
                "is_active": True,
                "expires_at": "2027-12-30T23:59:59"
            },
            "DARALHIKMAH": {
                "discount_percent": 30,
                "is_active": True,
                "expires_at": "2027-12-30T23:59:59"
            },
            "EXPIRED1402": {
                "discount_percent": 40,
                "is_active": True,
                "expires_at": "2024-01-01T00:00:00"
            },
            "INACTIVE10": {
                "discount_percent": 10,
                "is_active": False,
                "expires_at": "2027-12-30T23:59:59"
            }
        }

    def validate_coupon(self, code: str, cart_total: int) -> Dict[str, Any]:
        """Validates coupon code, expiration date, active state, and calculates promotional discount amount."""
        code_upper = code.strip().upper()
        if code_upper not in self.coupons:
            raise InvalidCouponException(message=f"کد تخفیف «{code}» نامعتبر است.")

        coupon_entry = self.coupons[code_upper]
        if isinstance(coupon_entry, dict):
            if not coupon_entry.get("is_active", True):
                raise InvalidCouponException(message=f"کد تخفیف «{code}» غیرفعال شده است.")

            expires_at_str = coupon_entry.get("expires_at")
            if expires_at_str:
                try:
                    exp_date = datetime.fromisoformat(expires_at_str)
                    if exp_date < datetime.utcnow():
                        raise InvalidCouponException(message=f"مهلت استفاده از کد تخفیف «{code}» به پایان رسیده و منقضی شده است.")
                except InvalidCouponException:
                    raise
                except Exception as exc:
                    logger.warning("Could not parse coupon expiration date: %s", exc)
            discount_percent = int(coupon_entry.get("discount_percent", 0))
        else:
            discount_percent = int(coupon_entry)

        discount_amount = int((cart_total * discount_percent) / 100)
        final_total = max(0, cart_total - discount_amount)

        return {
            "code": code_upper,
            "valid": True,
            "discount_percent": discount_percent,
            "discount_amount": discount_amount,
            "final_total": final_total,
            "message": f"کد تخفیف اعمال شد: {discount_percent} درصد تخفیف ویژه منظور شد."
        }

    def add_coupon(
        self,
        code: str,
        discount_percent: int,
        expires_at: Optional[str] = None,
        is_active: bool = True
    ) -> Dict[str, Any]:
        """Creates or updates a promotional coupon code."""
        code_upper = code.strip().upper()
        self.coupons[code_upper] = {
            "discount_percent": discount_percent,
            "is_active": is_active,
            "expires_at": expires_at or "2027-12-30T23:59:59"
        }
        return {
            "code": code_upper,
            "discount_percent": discount_percent,
            "active": is_active,
            "expires_at": self.coupons[code_upper]["expires_at"]
        }

    def list_coupons(self) -> List[Dict[str, Any]]:
        """Returns all configured promotional coupons."""
        result = []
        for k, v in self.coupons.items():
            if isinstance(v, dict):
                result.append({
                    "code": k,
                    "discount_percent": v.get("discount_percent", 0),
                    "active": v.get("is_active", True),
                    "expires_at": v.get("expires_at")
                })
            else:
                result.append({
                    "code": k,
                    "discount_percent": int(v),
                    "active": True
                })
        return result

    async def list_coupons_async(self, db: Optional[Any] = None) -> List[Dict[str, Any]]:
        """Returns all promotional coupons from database if db is available, falling back to memory."""
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import Coupon
            try:
                res = await db.execute(select(Coupon).order_by(Coupon.created_at.asc()))
                models = res.scalars().all()
                if models:
                    return [
                        {
                            "code": m.code,
                            "discount_percent": m.discount_percent,
                            "active": m.is_active,
                            "expires_at": m.expires_at,
                        }
                        for m in models
                    ]
            except Exception:
                pass
        return self.list_coupons()

    async def validate_coupon_async(self, code: str, cart_total: int, db: Optional[Any] = None) -> Dict[str, Any]:
        """Validates coupon in database or memory."""
        code_upper = code.strip().upper()
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import Coupon
            try:
                res = await db.execute(select(Coupon).where(Coupon.code == code_upper))
                db_coupon = res.scalar_one_or_none()
                if db_coupon:
                    if not db_coupon.is_active:
                        raise InvalidCouponException(message=f"کد تخفیف «{code}» غیرفعال شده است.")
                    if db_coupon.expires_at:
                        try:
                            exp_date = datetime.fromisoformat(db_coupon.expires_at)
                            if exp_date < datetime.utcnow():
                                raise InvalidCouponException(message=f"مهلت استفاده از کد تخفیف «{code}» به پایان رسیده و منقضی شده است.")
                        except InvalidCouponException:
                            raise
                        except Exception:
                            pass
                    discount_amount = int((cart_total * db_coupon.discount_percent) / 100)
                    final_total = max(0, cart_total - discount_amount)
                    return {
                        "code": code_upper,
                        "valid": True,
                        "discount_percent": db_coupon.discount_percent,
                        "discount_amount": discount_amount,
                        "final_total": final_total,
                        "message": f"کد تخفیف اعمال شد: {db_coupon.discount_percent} درصد تخفیف ویژه منظور شد."
                    }
            except InvalidCouponException:
                raise
            except Exception:
                pass
        return self.validate_coupon(code=code, cart_total=cart_total)

    def toggle_coupon(self, code: str) -> Dict[str, Any]:
        """Toggles active state of coupon."""
        code_upper = code.strip().upper()
        if code_upper not in self.coupons:
            raise InvalidCouponException(message=f"کد تخفیف «{code}» یافت نشد.")
        entry = self.coupons[code_upper]
        if isinstance(entry, dict):
            entry["is_active"] = not entry.get("is_active", True)
            curr = entry["is_active"]
        else:
            self.coupons[code_upper] = {
                "discount_percent": int(entry),
                "is_active": False,
                "expires_at": "2027-12-30T23:59:59"
            }
            curr = False
        return {
            "code": code_upper,
            "active": curr,
            "message": f"وضعیت کد تخفیف به {'فعال' if curr else 'غیرفعال'} تغییر یافت."
        }

    async def toggle_coupon_async(self, code: str, db: Optional[Any] = None) -> Dict[str, Any]:
        """Toggles active state of coupon in database and memory."""
        res_mem = self.toggle_coupon(code)
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import Coupon
            res = await db.execute(select(Coupon).where(Coupon.code == code.strip().upper()))
            db_c = res.scalar_one_or_none()
            if db_c:
                db_c.is_active = not db_c.is_active
                await db.flush()
                return {
                    "code": db_c.code,
                    "active": db_c.is_active,
                    "message": f"وضعیت کد تخفیف به {'فعال' if db_c.is_active else 'غیرفعال'} تغییر یافت."
                }
        return res_mem

    def delete_coupon(self, code: str) -> bool:
        """Deletes coupon from system."""
        code_upper = code.strip().upper()
        if code_upper not in self.coupons:
            raise InvalidCouponException(message=f"کد تخفیف «{code}» یافت نشد.")
        del self.coupons[code_upper]
        return True

    async def delete_coupon_async(self, code: str, db: Optional[Any] = None) -> bool:
        """Deletes coupon in database and memory."""
        deleted = False
        code_upper = code.strip().upper()
        if code_upper in self.coupons:
            del self.coupons[code_upper]
            deleted = True

        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import Coupon
            res = await db.execute(select(Coupon).where(Coupon.code == code_upper))
            db_c = res.scalar_one_or_none()
            if db_c:
                await db.delete(db_c)
                await db.flush()
                return True

        if not deleted:
            raise InvalidCouponException(message=f"کد تخفیف «{code}» یافت نشد.")
        return True

    async def add_coupon_async(
        self,
        code: str,
        discount_percent: int,
        expires_at: Optional[str] = None,
        is_active: bool = True,
        db: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """Creates or updates a coupon in database and memory."""
        mem_res = self.add_coupon(code, discount_percent, expires_at, is_active)
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import Coupon
            code_upper = code.strip().upper()
            res = await db.execute(select(Coupon).where(Coupon.code == code_upper))
            db_c = res.scalar_one_or_none()
            if db_c:
                db_c.discount_percent = discount_percent
                db_c.expires_at = expires_at or "2027-12-30T23:59:59"
                db_c.is_active = is_active
            else:
                db_c = Coupon(
                    code=code_upper,
                    discount_percent=discount_percent,
                    expires_at=expires_at or "2027-12-30T23:59:59",
                    is_active=is_active,
                )
                db.add(db_c)
            await db.flush()
        return mem_res


coupon_service = CouponService()
