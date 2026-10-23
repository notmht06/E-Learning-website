"""
Iranian Payment Gateway Integration Service (Zarinpal / Zibal / Sandbox Fallback).
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Financial Security).
"""
import logging
import urllib.request
import json
import asyncio
import uuid
from typing import Dict, Any, Optional
from backend.app.core.config import settings

logger = logging.getLogger("platform.payment")


class PaymentGatewayService:
    @property
    def merchant_id(self) -> str:
        return getattr(settings, "ZARINPAL_MERCHANT_ID", "zarinpal-sandbox-merchant-1403")

    @property
    def is_sandbox(self) -> bool:
        return (
            getattr(settings, "PAYMENT_MODE", "sandbox") == "sandbox"
            and getattr(settings, "ENVIRONMENT", "development") != "production"
        )

    async def request_payment(
        self,
        amount_tomans: int,
        callback_url: str,
        description: str,
        mobile: Optional[str] = None
    ) -> Dict[str, Any]:
        """Requests a payment authority token from Zarinpal API."""
        amount_rials = amount_tomans * 10  # Zarinpal operates in Rials

        if not self.is_sandbox and self.merchant_id and self.merchant_id != "zarinpal-sandbox-merchant-1403":
            try:
                payload = {
                    "merchant_id": self.merchant_id,
                    "amount": amount_rials,
                    "callback_url": callback_url,
                    "description": description,
                    "metadata": {"mobile": mobile or ""}
                }
                res = await asyncio.to_thread(self._post_zarinpal, "request.json", payload)
                data = res.get("data", {})
                if res.get("errors") or data.get("code") != 100:
                    logger.error("Zarinpal payment request error: %s", res.get("errors"))
                    if not self.is_sandbox:
                        raise RuntimeError("خطا در ایجاد تراکنش درگاه زرین‌پال در محیط عملیاتی.")
                    return self._fallback_request(amount_tomans, callback_url)

                authority = data.get("authority")
                return {
                    "success": True,
                    "payment_token": authority,
                    "gateway_redirect_url": f"https://www.zarinpal.com/pg/StartPay/{authority}",
                    "amount": amount_tomans,
                }
            except Exception as exc:
                logger.error("Zarinpal API connection failed: %s. Falling back to sandbox.", exc)
                if not self.is_sandbox:
                    raise RuntimeError(f"خطا در ارتباط با درگاه پرداخت بانکی در محیط عملیاتی: {exc}")

        if not self.is_sandbox:
            raise RuntimeError("درگاه پرداخت عملیاتی پیکربندی نشده است و حالت سندباکس در محیط تولید غیرفعال است.")

        return self._fallback_request(amount_tomans, callback_url)

    async def verify_payment(self, authority: str, amount_tomans: int) -> Dict[str, Any]:
        """Verifies a payment authority upon return from the bank gateway."""
        if not authority or not isinstance(authority, str):
            return {
                "success": False,
                "reference_id": "",
                "amount": amount_tomans,
                "card_mask": "",
                "message": "شناسه پرداخت ارائه نشده یا نامعتبر است.",
            }

        amount_rials = amount_tomans * 10

        if authority.startswith("SBX-AUTH-"):
            if not self.is_sandbox:
                return {
                    "success": False,
                    "reference_id": "",
                    "amount": amount_tomans,
                    "card_mask": "",
                    "message": "استفاده از شناسه آزمایشی شبیه‌ساز در محیط عملیاتی مجاز نیست.",
                }
            return {
                "success": True,
                "reference_id": f"REF-{abs(hash(authority)) % 1000000000}",
                "amount": amount_tomans,
                "card_mask": "6037-99**-****-1403",
            }

        if not self.is_sandbox and self.merchant_id and self.merchant_id != "zarinpal-sandbox-merchant-1403":
            try:
                payload = {
                    "merchant_id": self.merchant_id,
                    "amount": amount_rials,
                    "authority": authority,
                }
                res = await asyncio.to_thread(self._post_zarinpal, "verify.json", payload)
                data = res.get("data", {})
                code = data.get("code")
                if code in (100, 101):
                    return {
                        "success": True,
                        "reference_id": str(data.get("ref_id", "14039821")),
                        "amount": amount_tomans,
                        "card_mask": data.get("card_hash", "6037-99**-****-1403"),
                    }
                logger.warning("Zarinpal payment verification rejected. Code: %s, Errors: %s", code, res.get("errors"))
                return {
                    "success": False,
                    "reference_id": "",
                    "amount": amount_tomans,
                    "card_mask": "",
                    "message": f"تراکنش توسط بانک تایید نشد (کد: {code}).",
                }
            except Exception as exc:
                logger.error("Zarinpal verify error: %s", exc)
                return {
                    "success": False,
                    "reference_id": "",
                    "amount": amount_tomans,
                    "card_mask": "",
                    "message": f"خطا در ارتباط با درگاه بانکی: {exc}",
                }

        if self.is_sandbox:
            return {
                "success": True,
                "reference_id": f"REF-FALLBACK-{abs(hash(authority)) % 1000000}",
                "amount": amount_tomans,
                "card_mask": "6037-99**-****-1403",
            }

        return {
            "success": False,
            "reference_id": "",
            "amount": amount_tomans,
            "card_mask": "",
            "message": "شناسه پرداخت برای محیط عملیاتی نامعتبر است.",
        }

    def _fallback_request(self, amount_tomans: int, callback_url: str) -> Dict[str, Any]:
        if not self.is_sandbox:
            raise RuntimeError("تولید توکن آزمایشی در محیط عملیاتی امکان‌پذیر نیست.")
        authority = f"SBX-AUTH-{uuid.uuid4().hex[:12]}"
        return {
            "success": True,
            "payment_token": authority,
            "gateway_redirect_url": f"https://gateway.shaparak.ir/payment/process?token={authority}&redirect={callback_url}&Authority={authority}&Status=OK",
            "amount": amount_tomans,
        }

    def _post_zarinpal(self, endpoint: str, payload: dict) -> dict:
        url = f"https://api.zarinpal.com/pg/v4/payment/{endpoint}"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            return json.loads(resp.read().decode("utf-8"))


payment_gateway = PaymentGatewayService()
