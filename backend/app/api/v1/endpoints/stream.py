"""
DRM Audio Stream Protection API Endpoints.
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian & Performance Engine).
Supports token generation, heartbeat tracking, HLS manifests, and HTTP Range partial requests.
"""
import os
import logging
import hmac
import hashlib
import time
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, Response, Request, Header, Query, Depends
from starlette.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.schemas.stream import (
    DRMTokenRequest,
    DRMTokenResponse,
    DRMHeartbeatRequest,
    DRMHeartbeatResponse,
)
from backend.app.services.drm_service import drm_service
from backend.app.core.security import verify_drm_token, decode_drm_token
from backend.app.api.deps import get_current_user, get_optional_user
from backend.app.models.database import get_db
from backend.app.models.models import AnalyticsLog, Enrollment

logger = logging.getLogger("platform.stream")
router = APIRouter()

# Default physical sample audio file path
DEFAULT_AUDIO_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../../frontend/public/audio/sample_lecture.wav")
)


@router.post("/token", response_model=DRMTokenResponse, summary="Issue secure DRM streaming token")
async def issue_stream_token(
    req: DRMTokenRequest,
    request: Request,
    user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates an encrypted, time-limited playback token with forensic student watermark
    and records the playback audit log in SQLite/PostgreSQL.
    Requires authentication and active course enrollment (or admin role).
    """
    is_admin = bool(user and user.get("role") == "admin")
    if not is_admin:
        # Check if the requested chapter is an open free preview
        is_preview_chapter = False
        try:
            from backend.app.services.course_service import course_service
            course_data = course_service.get_course_by_id(req.course_id)
            if course_data and "syllabus" in course_data:
                for ch in course_data["syllabus"]:
                    if ch.get("id") == req.chapter_id:
                        if ch.get("is_preview") or ch.get("is_free_sample"):
                            is_preview_chapter = True
                        break
        except Exception:
            course_data = None

        if not is_preview_chapter:
            from backend.app.models.models import Lesson
            try:
                res_lesson = await db.execute(
                    select(Lesson).where(
                        Lesson.course_id == req.course_id,
                        Lesson.session_number == req.chapter_id,
                    )
                )
                lesson_obj = res_lesson.scalar_one_or_none()
                if lesson_obj and lesson_obj.is_free_sample:
                    is_preview_chapter = True
            except Exception as exc:
                logger.debug("Failed querying Lesson for preview check: %s", exc)

        if not is_preview_chapter:
            if not user:
                raise HTTPException(
                    status_code=401,
                    detail="سرآیند احراز هویت (Authorization) یافت نشد."
                )
            from backend.app.services.course_service import course_service
            candidate_ids = [req.course_id]
            alias_id = course_service.COURSE_ID_ALIASES.get(req.course_id)
            if alias_id:
                candidate_ids.append(alias_id)

            res_enr = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == user["id"],
                    Enrollment.course_id.in_(candidate_ids),
                    Enrollment.status == "active",
                )
            )
            enrollment = res_enr.scalar_one_or_none()
            if not enrollment:
                raise HTTPException(
                    status_code=403,
                    detail="شما در این دوره ثبت‌نام نکرده‌اید. دسترسی به استریم صوت نیازمند ثبت‌نام در دوره است."
                )

    effective_user_id = user["id"] if user else (req.user_id or "usr-preview")
    token_data = drm_service.issue_token(
        user_id=effective_user_id,
        course_id=req.course_id,
        chapter_id=req.chapter_id,
    )

    try:
        client_ip = request.client.host if request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "browser")[:250]
        db.add(
            AnalyticsLog(
                event_type="play_audio",
                resource_id=f"{req.course_id}:ch-{req.chapter_id}",
                user_id=effective_user_id,
                ip_address=client_ip,
                user_agent=user_agent,
            )
        )
        await db.flush()
    except Exception as exc:
        logger.warning("Failed to record analytics log: %s", exc)

    return token_data


@router.post("/heartbeat", response_model=DRMHeartbeatResponse, summary="Playback security heartbeat")
async def verify_heartbeat(req: DRMHeartbeatRequest):
    """
    Verifies active playback session every 30 seconds to prevent concurrent stream abuse.
    """
    try:
        return drm_service.verify_heartbeat(
            token=req.token,
            user_id=req.user_id,
            course_id=req.course_id,
            chapter_id=req.chapter_id,
            pos_sec=req.playback_position_sec
        )
    except Exception as e:
        logger.warning("Heartbeat verification rejected: %s", e)
        raise HTTPException(status_code=403, detail="نشست پخش DRM منقضی شده یا نامعتبر است.")


@router.get("/hls/{course_id}/{chapter_id}/master.m3u8", summary="HLS master playlist descriptor")
async def get_hls_playlist(course_id: str, chapter_id: int, token: str):
    """
    Serves standard HLS M3U8 manifest with AES-128 segment protection headers.
    """
    if not verify_drm_token(token, course_id, chapter_id):
        raise HTTPException(status_code=403, detail="توکن استریم DRM نامعتبر یا منقضی شده است.")

    playlist = f"""#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-KEY:METHOD=AES-128,URI="/api/v1/stream/key?token={token}"
#EXTINF:10.0,
segment0.ts
#EXTINF:10.0,
segment1.ts
#EXT-X-ENDLIST
"""
    headers = {
        "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache"
    }
    return Response(content=playlist, media_type="application/vnd.apple.mpegurl", headers=headers)


@router.get("/key", summary="DRM AES-128 encryption key service")
async def get_stream_key(token: str = Query(..., description="Encrypted DRM playback token")):
    """
    Security Guardian: Serves 16-byte AES-128 encryption key required to decrypt HLS media segments.
    Strictly verifies token signature and expiration before releasing the key.
    Enforces no-store caching headers to prevent disk persistence.
    """
    try:
        parts = token.split(".")
        if len(parts) != 2:
            raise HTTPException(status_code=403, detail="فرمت توکن امنیتی DRM نامعتبر است.")
        b64_payload, signature = parts

        expected_sig = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            b64_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            raise HTTPException(status_code=403, detail="امضای امنیتی توکن DRM معتبر نیست.")

        padding = "=" * (4 - (len(b64_payload) % 4)) if len(b64_payload) % 4 != 0 else ""
        raw_payload = base64.urlsafe_b64decode((b64_payload + padding).encode("utf-8")).decode("utf-8")
        token_uid, token_cid, token_chid, token_exp = raw_payload.split(":")

        if time.time() > int(token_exp):
            raise HTTPException(status_code=403, detail="توکن استریم DRM منقضی شده است.")

        key_material = f"{settings.SECRET_KEY}:{token_cid}:{token_chid}:AES128_DRM"
        key_bytes = hashlib.sha256(key_material.encode("utf-8")).digest()[:16]

        headers = {
            "Content-Type": "application/octet-stream",
            "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
        }
        return Response(content=key_bytes, media_type="application/octet-stream", headers=headers)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"خطا در صدور کلید امنیتی استریم: {str(e)}")


def parse_rfc7233_range(range_header: str, total_len: int) -> tuple[int, int, int]:
    """
    Parses RFC 7233 Range header and returns (start, end, chunk_size).
    Raises HTTPException(416) with Content-Range header if not satisfiable.
    """
    if not range_header.startswith("bytes="):
        raise HTTPException(
            status_code=416,
            detail="Range Not Satisfiable",
            headers={"Content-Range": f"bytes */{total_len}"}
        )

    range_spec = range_header[len("bytes="):].strip()
    if not range_spec or "," in range_spec:
        raise HTTPException(
            status_code=416,
            detail="Range Not Satisfiable",
            headers={"Content-Range": f"bytes */{total_len}"}
        )

    parts = range_spec.split("-", 1)
    if len(parts) != 2:
        raise HTTPException(
            status_code=416,
            detail="Range Not Satisfiable",
            headers={"Content-Range": f"bytes */{total_len}"}
        )

    part0, part1 = parts[0].strip(), parts[1].strip()

    try:
        if part0 == "":
            # Suffix range: bytes=-500 -> last 500 bytes
            suffix_len = int(part1)
            if suffix_len <= 0:
                raise ValueError("Suffix length must be positive")
            start = max(0, total_len - suffix_len)
            end = total_len - 1
        elif part1 == "":
            # Open-ended range: bytes=500- -> from 500 to end
            start = int(part0)
            end = total_len - 1
        else:
            # Explicit range: bytes=100-200
            start = int(part0)
            end = int(part1)
    except ValueError:
        raise HTTPException(
            status_code=416,
            detail="Range Not Satisfiable",
            headers={"Content-Range": f"bytes */{total_len}"}
        )

    if start < 0 or start >= total_len or start > end:
        raise HTTPException(
            status_code=416,
            detail="Range Not Satisfiable",
            headers={"Content-Range": f"bytes */{total_len}"}
        )

    end = min(end, total_len - 1)
    chunk_size = (end - start) + 1
    return start, end, chunk_size


@router.get("/audio/{course_id}/{chapter_id}", summary="Stream audio chunk with HTTP Range header support")
async def stream_audio_range(
    course_id: str,
    chapter_id: int,
    token: str = Query(..., description="Cryptographically signed DRM token"),
    range_header: Optional[str] = Header(None, alias="Range"),
    db: AsyncSession = Depends(get_db),
):
    """
    Performance Engine: Streams protected lecture audio supporting HTTP Range requests (RFC 7233).
    Enables low-latency seek buffering and playback scrubbing without downloading the full audio file.
    """
    # 1. Verify DRM Security Shield
    decoded = decode_drm_token(token)
    if not decoded:
        raise HTTPException(
            status_code=403,
            detail="توکن استریم DRM نامعتبر یا منقضی شده است. دسترسی به رسانه صوتی رد شد."
        )

    if not verify_drm_token(token, course_id, chapter_id, user_id=decoded["user_id"]):
        raise HTTPException(
            status_code=403,
            detail="توکن استریم DRM نامعتبر یا منقضی شده است. دسترسی به رسانه صوتی رد شد."
        )

    # 2. Locate actual uploaded chapter audio/video file from DB or memory catalog
    file_path = DEFAULT_AUDIO_PATH
    media_url_candidate = None
    try:
        from backend.app.models.models import Lesson
        from backend.app.services.course_service import course_service
        res_l = await db.execute(
            select(Lesson).where(Lesson.course_id == course_id, Lesson.session_number == chapter_id)
        )
        lesson_row = res_l.scalar_one_or_none()
        if lesson_row and lesson_row.audio_url:
            media_url_candidate = lesson_row.audio_url
        if not media_url_candidate:
            c_dict = course_service.get_course_by_id(course_id)
            for ch in c_dict.get("syllabus", []):
                if int(ch.get("id", 0)) == int(chapter_id):
                    media_url_candidate = ch.get("audio_stream_url") or ch.get("video_stream_url")
                    break
    except Exception:
        pass

    if media_url_candidate and "/static/uploads/" in str(media_url_candidate):
        fname = str(media_url_candidate).split("/static/uploads/")[-1].split("?")[0]
        uploads_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../static/uploads")
        )
        cand_path = os.path.join(uploads_dir, fname)
        if os.path.exists(cand_path):
            file_path = cand_path

    if os.path.exists(file_path):
        file_size = os.path.getsize(file_path)
        ext = os.path.splitext(file_path)[1].lower()
        media_type = (
            "audio/mpeg" if ext == ".mp3"
            else "audio/mp4" if ext == ".m4a"
            else "audio/ogg" if ext == ".ogg"
            else "video/mp4" if ext == ".mp4"
            else "video/webm" if ext == ".webm"
            else "audio/wav"
        )

        # Handle Range Header
        if range_header:
            start, end, chunk_size = parse_rfc7233_range(range_header, file_size)

            def iter_file():
                with open(file_path, "rb") as f:
                    f.seek(start)
                    bytes_left = chunk_size
                    while bytes_left > 0:
                        read_len = min(64 * 1024, bytes_left)
                        data = f.read(read_len)
                        if not data:
                            break
                        bytes_left -= len(data)
                        yield data

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
                "Content-Type": media_type,
                "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
                "Pragma": "no-cache",
            }
            return StreamingResponse(iter_file(), status_code=206, headers=headers)

        # Full content response
        def iter_full_file():
            with open(file_path, "rb") as f:
                while chunk := f.read(64 * 1024):
                    yield chunk

        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": media_type,
            "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
        }
        return StreamingResponse(iter_full_file(), status_code=200, headers=headers)
    else:
        # Fallback synthetic buffer for testing
        synthetic_payload = b"RIFF____WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data" + (b"\x00" * 4096)
        total_len = len(synthetic_payload)

        if range_header:
            start, end, chunk_size = parse_rfc7233_range(range_header, total_len)
            chunk = synthetic_payload[start:end+1]
            headers = {
                "Content-Range": f"bytes {start}-{end}/{total_len}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(len(chunk)),
                "Content-Type": "audio/wav",
                "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
                "Pragma": "no-cache",
            }
            return Response(content=chunk, status_code=206, headers=headers)

        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(total_len),
            "Content-Type": "audio/wav",
            "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
        }
        return Response(content=synthetic_payload, status_code=200, headers=headers)


# ============================================================================
# REAL VIDEO QUALITY TRANSCODING & COMPRESSION ENDPOINT (360p / 480p / 720p)
# ============================================================================
import subprocess
from pathlib import Path
from fastapi.responses import RedirectResponse

QUALITY_PRESETS = {
    "360p": {"height": 360, "crf": "34", "bv": "280k", "ba": "64k"},
    "480p": {"height": 480, "crf": "29", "bv": "600k", "ba": "96k"},
    "720p": {"height": 720, "crf": "24", "bv": "1400k", "ba": "128k"},
    "1080p": {"height": 1080, "crf": "20", "bv": "3000k", "ba": "192k"},
}


def _resolve_local_video_path(src: str) -> Optional[Path]:
    if not src:
        return None
    clean_src = src.split("?")[0].strip()
    root_dir = Path(__file__).resolve().parents[5]

    # 1. Check frontend public videos
    if "/videos/" in clean_src:
        fname = clean_src.split("/videos/")[-1]
        cand = root_dir / "frontend" / "public" / "videos" / fname
        if cand.exists():
            return cand

    # 2. Check uploads
    if "/static/uploads/" in clean_src:
        fname = clean_src.split("/static/uploads/")[-1]
        cand = root_dir / "backend" / "app" / "static" / "uploads" / fname
        if cand.exists():
            return cand

    # 3. Direct path
    try:
        direct = Path(clean_src)
        if direct.exists() and direct.is_file():
            return direct
    except Exception:
        pass

    return None


def _get_or_transcode_video_rendition(source_path: Path, quality: str) -> Path:
    """
    Uses FFmpeg to compress and downscale the video if ffmpeg binary is present,
    otherwise caches and returns the file with quality indicators.
    """
    if quality not in QUALITY_PRESETS or quality in ("auto", "1080p"):
        return source_path

    preset = QUALITY_PRESETS[quality]
    renditions_dir = source_path.parent / "renditions"
    renditions_dir.mkdir(parents=True, exist_ok=True)

    file_hash = hashlib.md5(f"{source_path.name}:{source_path.stat().st_mtime}".encode()).hexdigest()[:10]
    out_path = renditions_dir / f"{source_path.stem}_{file_hash}_{quality}.mp4"

    if out_path.exists() and out_path.stat().st_size > 0:
        return out_path

    try:
        cmd = [
            "ffmpeg", "-y", "-i", str(source_path),
            "-vf", f"scale=-2:{preset['height']}",
            "-c:v", "libx264",
            "-b:v", preset["bv"],
            "-crf", preset["crf"],
            "-preset", "ultrafast",
            "-movflags", "+faststart",
            "-c:a", "aac",
            "-b:a", preset["ba"],
            str(out_path),
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60, check=True)
        if out_path.exists() and out_path.stat().st_size > 0:
            return out_path
    except Exception as exc:
        logger.debug("FFmpeg transcoding skipped or not available: %s", exc)

    return source_path


@router.get(
    "/video-quality",
    summary="Stream video at specific compressed quality (360p, 480p, 720p, 1080p) with HTTP 206 Range",
)
async def stream_video_with_quality(
    request: Request,
    src: str = Query(..., description="Original video URL or /videos/ path"),
    quality: str = Query("auto", description="Target quality: auto, 1080p, 720p, 480p, 360p"),
    range_header: Optional[str] = Header(None, alias="Range"),
    user: Optional[dict] = Depends(get_optional_user),
):
    """
    Performance Engine: Streams multi-rendition video with RFC 7233 partial content support (HTTP 206).
    Applies FFmpeg downscaled compression if available or serves source with proper range headers.
    """
    local_path = _resolve_local_video_path(src)
    if not local_path or not local_path.exists():
        if src.startswith("http://") or src.startswith("https://") or src.startswith("/"):
            return RedirectResponse(url=src)
        raise HTTPException(status_code=404, detail="فایل ویدیو یافت نشد.")

    target_file = _get_or_transcode_video_rendition(local_path, quality.lower().strip())
    file_size = target_file.stat().st_size

    if range_header:
        start, end, chunk_size = parse_rfc7233_range(range_header, file_size)

        def iter_file():
            with open(target_file, "rb") as f:
                f.seek(start)
                bytes_left = chunk_size
                while bytes_left > 0:
                    read_len = min(64 * 1024, bytes_left)
                    data = f.read(read_len)
                    if not data:
                        break
                    bytes_left -= len(data)
                    yield data

        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Content-Type": "video/mp4",
            "X-Video-Quality": quality,
            "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
        }
        return StreamingResponse(iter_file(), status_code=206, headers=headers)

    def iter_full_file():
        with open(target_file, "rb") as f:
            while chunk := f.read(64 * 1024):
                yield chunk

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": "video/mp4",
        "X-Video-Quality": quality,
        "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
    }
    return StreamingResponse(iter_full_file(), status_code=200, headers=headers)

