# -*- coding: utf-8 -*-
"""
Skyroom Webservice Integration Service:
Complies with official Skyroom API documentation:
https://data.skyroom.online/help/webservice.html

Provides:
- Direct one-click authenticated room entry (createLoginUrl)
- Virtual classroom room inspection & listing (getRooms, getRoom)
- Automated student & admin access levels (1: student, 2: presenter, 3: operator/admin)
- Resilient network error & timeout handling with clean fallback
"""
import logging
from typing import Dict, Any, Optional, List, Union
import httpx

from backend.app.core.config import settings

logger = logging.getLogger("platform.skyroom")


class SkyroomService:
    BASE_URL = "https://www.skyroom.online/skyroom/api"

    @property
    def api_key(self) -> str:
        return (getattr(settings, "SKYROOM_API_KEY", "") or "").strip()

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 10)

    def _get_api_url(self) -> str:
        return f"{self.BASE_URL}/{self.api_key}"

    async def _post_action(self, action: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Sends a standard POST request to Skyroom API.
        All Skyroom responses return HTTP 200 with { ok: bool, result/error_message }.
        """
        if not self.is_configured:
            return {
                "ok": False,
                "error_code": 11,
                "error_message": "کلید وب‌سرویس اسکای‌روم در تنظیمات سامانه پیکربندی نشده است.",
            }

        payload: Dict[str, Any] = {"action": action}
        if params is not None:
            payload["params"] = params

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    self._get_api_url(),
                    json=payload,
                    headers={"Content-Type": "application/json", "Accept": "application/json"},
                )
                if res.status_code == 200:
                    data = res.json()
                    if not data.get("ok"):
                        logger.warning(
                            "Skyroom action '%s' failed: [%s] %s",
                            action,
                            data.get("error_code"),
                            data.get("error_message"),
                        )
                    return data
                else:
                    logger.error("Skyroom server returned HTTP %s for action %s", res.status_code, action)
                    return {
                        "ok": False,
                        "error_code": res.status_code,
                        "error_message": f"خطای سرور اسکای‌روم (کد وضعیت: {res.status_code})",
                    }
        except Exception as exc:
            logger.warning("Skyroom API connection error: %s", exc)
            return {
                "ok": False,
                "error_code": 500,
                "error_message": f"خطا در برقراری ارتباط با وب‌سرویس اسکای‌روم: {exc}",
            }

    async def create_login_url(
        self,
        room_id: Union[int, str],
        user_id: str,
        nickname: str,
        access: int = 1,
        concurrent: int = 1,
        language: str = "fa",
        ttl: int = 3600,
    ) -> Dict[str, Any]:
        """
        Generates direct one-click authenticated entry URL into the virtual classroom.
        Parameters per Skyroom specs:
        - room_id: ID (int) or unique name (str) of the target classroom
        - user_id: unique alphanumeric string without space (e.g. 'usr_1234')
        - nickname: student or professor Persian display name
        - access: 1 (normal student), 2 (presenter), 3 (operator/admin)
        - concurrent: 1 (single session per link to prevent link sharing)
        - language: 'fa'
        - ttl: lifetime in seconds (default 3600 = 1 hour)
        """
        clean_user_id = str(user_id).replace(" ", "_").replace("-", "")[:32]
        clean_nickname = (nickname or "دانش‌پژوه حیات").strip()[:128]

        # Convert room_id to integer if numeric
        parsed_room_id: Union[int, str] = int(room_id) if str(room_id).isdigit() else str(room_id)

        params: Dict[str, Any] = {
            "room_id": parsed_room_id,
            "user_id": clean_user_id,
            "nickname": clean_nickname,
            "access": access,
            "concurrent": concurrent,
            "language": language,
            "ttl": ttl,
        }
        return await self._post_action("createLoginUrl", params)

    async def get_rooms(self) -> Dict[str, Any]:
        """Returns list of all active virtual classrooms in Skyroom account."""
        return await self._post_action("getRooms")

    async def get_room(self, room_id: Optional[int] = None, name: Optional[str] = None) -> Dict[str, Any]:
        """Returns metadata for a specific virtual classroom by ID or Latin name."""
        params: Dict[str, Any] = {}
        if room_id is not None:
            params["room_id"] = room_id
        elif name:
            params["name"] = name
        return await self._post_action("getRoom", params)

    async def get_services(self) -> Dict[str, Any]:
        """Returns active Skyroom subscription services and quota usage."""
        return await self._post_action("getServices")


skyroom_service = SkyroomService()
