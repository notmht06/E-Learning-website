"""
Banking Gateway and Shaparak Settlement Service.
Complies with Clean Architecture, Security Guardian, and Reliability Engine.
Prevents payment replay attacks with atomic state tracking and authority uniqueness.
"""
from typing import Dict, Any, Optional, Set
import random
import threading
from datetime import datetime
from backend.app.core.exceptions import AppException


class PaymentService:
    def __init__(self):
        self.transactions: Dict[str, Dict[str, Any]] = {}
        self.used_tracking_codes: Set[str] = set()
        self._lock = threading.Lock()

    def initiate_payment(self, order_id: str, gateway: str, return_url: str, amount: int = 890000) -> Dict[str, Any]:
        """Initializes Shaparak gateway redirect simulation with unique authority token."""
        with self._lock:
            token = f"SHAPARAK_AUTH_{random.randint(10000000, 99999999)}"
            while token in self.transactions:
                token = f"SHAPARAK_AUTH_{random.randint(10000000, 99999999)}"

            tx_data = {
                "payment_token": token,
                "order_id": order_id,
                "gateway": gateway,
                "amount": amount,
                "return_url": return_url,
                "status": "pending",
                "reference_id": None,
                "tracking_code": None,
                "created_at": datetime.now().isoformat(),
                "paid_at": None,
            }
            self.transactions[token] = tx_data

        return {
            "payment_token": token,
            "gateway_redirect_url": f"https://gateway.shaparak.ir/payment/process?token={token}&redirect={return_url}",
            "order_id": order_id,
            "amount": amount
        }

    def verify_payment(self, authority: str, status: str = "OK", tracking_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Verifies Shaparak bank payment and generates digital receipt.
        Strictly prevents replay attacks by rejecting already-paid transactions with HTTP 400.
        Enforces authority and tracking code uniqueness atomically.
        """
        with self._lock:
            if authority not in self.transactions:
                raise AppException(
                    message="شناسه پرداخت (Authority) یافت نشد.",
                    code="PAYMENT_NOT_FOUND",
                    status_code=400
                )

            tx = self.transactions[authority]

            # Replay attack prevention: if already verified as paid, reject
            if tx.get("status") == "paid":
                raise AppException(
                    message="این تراکنش قبلاً تایید شده است و امکان استفاده مجدد از آن وجود ندارد.",
                    code="PAYMENT_REPLAY_ATTACK",
                    status_code=400
                )

            # Prevent resurrection of failed transactions
            if tx.get("status") == "failed":
                raise AppException(
                    message="این تراکنش قبلاً ناموفق ثبت شده است و امکان تغییر وضعیت یا استفاده مجدد از آن وجود ندارد.",
                    code="PAYMENT_ALREADY_FAILED",
                    status_code=400
                )

            # Strict terminal state handling: only 'pending' transactions can be processed
            if tx.get("status") != "pending":
                raise AppException(
                    message="این تراکنش در وضعیت قابل پردازش قرار ندارد.",
                    code="INVALID_PAYMENT_STATE",
                    status_code=400
                )

            # Enforce tracking code uniqueness if provided
            if tracking_code:
                if tracking_code in self.used_tracking_codes:
                    raise AppException(
                        message="کد پیگیری ارائه شده قبلاً ثبت شده است.",
                        code="DUPLICATE_TRACKING_CODE",
                        status_code=400
                    )
                self.used_tracking_codes.add(tracking_code)

            is_success = (str(status).strip().upper() == "OK")
            ref_id = f"REF-{random.randint(1000000000, 9999999999)}"
            paid_timestamp = datetime.now().isoformat()

            if is_success:
                tx["status"] = "paid"
                tx["reference_id"] = ref_id
                tx["tracking_code"] = tracking_code
                tx["paid_at"] = paid_timestamp
                return {
                    "success": True,
                    "reference_id": ref_id,
                    "amount": tx["amount"],
                    "order_id": tx["order_id"],
                    "card_mask": "6037-99**-****-1403",
                    "paid_at": paid_timestamp
                }
            else:
                tx["status"] = "failed"
                return {
                    "success": False,
                    "reference_id": "",
                    "amount": tx["amount"],
                    "order_id": tx["order_id"],
                    "card_mask": "6037-99**-****-1403",
                    "paid_at": paid_timestamp
                }


payment_service = PaymentService()
