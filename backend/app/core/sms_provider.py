"""
Iranian SMS Gateway Provider Adapter (Kavenegar + Development Console Fallback).
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian & Reliability Engine).
"""
import logging
import urllib.request
import urllib.parse
import asyncio
from typing import Dict, Any
from backend.app.core.config import settings

logger = logging.getLogger("platform.sms")


class SMSProviderService:
    def __init__(self):
        self.last_sent: Dict[str, str] = {}
        self.send_count: Dict[str, int] = {}

    async def send_otp_sms(self, phone: str, code: str) -> Dict[str, Any]:
        """
        Dispatches a 6-digit verification code via Kavenegar Lookup API in production,
        or logs it cleanly in development mode.
        """
        self.last_sent[phone] = code
        self.send_count[phone] = self.send_count.get(phone, 0) + 1
        if settings.SMS_PROVIDER == "kavenegar" and settings.KAVENEGAR_API_KEY:
            return await asyncio.to_thread(self._send_kavenegar_lookup, phone, code)

        logger.info("[SMS-DEV] OTP code for %s is %s", phone, code)
        return {
            "dispatched": True,
            "provider": "console",
            "phone": phone,
        }

    def _send_kavenegar_lookup(self, phone: str, code: str) -> Dict[str, Any]:
        url = (
            f"https://api.kavenegar.com/v1/{settings.KAVENEGAR_API_KEY}"
            f"/verify/lookup.json"
        )
        params = urllib.parse.urlencode(
            {
                "receptor": phone,
                "token": code,
                "template": settings.KAVENEGAR_TEMPLATE,
            }
        )
        try:
            req = urllib.request.Request(f"{url}?{params}", method="GET")
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                status_code = resp.getcode()
                return {
                    "dispatched": status_code == 200,
                    "provider": "kavenegar",
                    "phone": phone,
                }
        except Exception as exc:
            logger.error("Kavenegar SMS dispatch error for %s: %s", phone, exc)
            return {
                "dispatched": False,
                "provider": "kavenegar",
                "error": str(exc),
            }


sms_provider = SMSProviderService()
