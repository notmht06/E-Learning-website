"""
DRM Audio Shield Service.
Issues secure streaming tokens, monitors heartbeats, and embeds forensic watermarks.
"""
import time
from typing import Dict, Any, Optional
from backend.app.core.security import generate_drm_token, verify_drm_token, decode_drm_token
from backend.app.core.exceptions import DRMVerificationException


class DRMService:
    def issue_token(self, user_id: str, course_id: str, chapter_id: int) -> Dict[str, Any]:
        """Generates a secure DRM streaming token."""
        return generate_drm_token(user_id=user_id, course_id=course_id, chapter_id=chapter_id)

    def verify_heartbeat(
        self,
        token: str,
        user_id: Optional[str] = None,
        course_id: str = "",
        chapter_id: int = 0,
        pos_sec: int = 0
    ) -> Dict[str, Any]:
        """Validates playback heartbeat and ensures user has not tampered with token."""
        decoded = decode_drm_token(token)
        if not decoded:
            raise DRMVerificationException(message="DRM stream session expired or invalid.")

        if course_id and str(decoded["course_id"]) != str(course_id):
            raise DRMVerificationException(message="DRM stream session expired or invalid.")
        if chapter_id and str(decoded["chapter_id"]) != str(chapter_id):
            raise DRMVerificationException(message="DRM stream session expired or invalid.")

        if time.time() > decoded["exp"]:
            raise DRMVerificationException(message="DRM stream session expired or invalid.")

        actual_uid = decoded["user_id"]
        masked_user = actual_uid if len(actual_uid) <= 4 else f"{actual_uid[:4]}***{actual_uid[-2:]}"
        return {
            "valid": True,
            "next_heartbeat_in_seconds": 30,
            "watermark": f"AUD-SEC • {masked_user} • Pos: {pos_sec}s"
        }


drm_service = DRMService()
