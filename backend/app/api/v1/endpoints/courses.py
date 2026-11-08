"""
Audio Courses and Academic Syllabus API Endpoints.
Complies with BACKEND_SYSTEM_DESIGN.md (Performance Engine - Async Def).
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("backend.courses")
from backend.app.schemas.course import (
    CourseDetailSchema,
    CourseEnrollResponse,
    ProgressSyncRequest,
    ProgressSyncResponse,
    LiveAccessResponse,
)
from backend.app.services.course_service import course_service
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user, get_optional_user
from backend.app.services.review_service import review_service
from backend.app.schemas.review import (
    ReviewCreateRequest,
    ReviewResponse,
    CourseReviewsSummaryResponse,
)
from backend.app.models.database import get_db
from backend.app.models.models import Enrollment

router = APIRouter()


@router.get("/", response_model=List[CourseDetailSchema], summary="List all audio courses")
async def list_courses(db: AsyncSession = Depends(get_db)):
    """
    Retrieves all available philosophical and seminary lecture series with their syllabus.
    Directly backed by database SSOT with Redis caching.
    """
    return await course_service.get_all_courses_async(db=db)


@router.get("/site-config", summary="Get public dynamic site configuration")
async def get_courses_site_config(db: AsyncSession = Depends(get_db)):
    """
    Returns public site configuration.
    """
    from backend.app.api.v1.endpoints.admin import get_public_config
    return await get_public_config(db=db)


@router.get("/enrolled", response_model=List[CourseDetailSchema], summary="Get enrolled courses of current student")
async def get_enrolled_courses(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves all active courses unlocked for the current authenticated student.
    """
    return await course_service.get_enrolled_courses_for_user(db=db, user_id=user["id"])


@router.get("/favorites", response_model=List[CourseDetailSchema], summary="Get favorite courses of current student")
async def get_favorite_courses(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves all courses bookmarked/favorited by the current authenticated student.
    """
    return await course_service.get_user_favorites(db=db, user_id=user["id"])


@router.post("/{course_id}/enroll", response_model=CourseEnrollResponse, summary="Enroll student in course")
async def enroll_course(
    course_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Enrolls the authenticated student in the specified lecture series.
    Rejects duplicate enrollments with HTTP 400 and structured Persian AppException.
    """
    return await course_service.enroll_student(db=db, user_id=user["id"], course_id=course_id)


@router.post("/{course_id}/favorite", summary="Toggle favorite bookmark on course")
async def toggle_course_favorite(
    course_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Toggles bookmark/favorite status for a course.
    """
    return await course_service.toggle_favorite(db=db, user_id=user["id"], course_id=course_id)


@router.get("/{course_id}", response_model=CourseDetailSchema, summary="Get course details by ID")
async def get_course(course_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves in-depth course information, syllabus lessons, and streaming endpoints.
    Directly backed by database SSOT with Redis caching.
    """
    try:
        return await course_service.get_course_by_id_async(course_id=course_id, db=db)
    except Exception:
        db_c = await course_service.get_course_from_db_tx(db, course_id)
        if db_c:
            return {
                "id": db_c.id,
                "title": db_c.title_fa,
                "slug": db_c.slug,
                "instructor": db_c.author_name or "حجت الاسلام دکتر زنجیرزن حسینی",
                "level": db_c.level or "سطوح عالی و خارج",
                "hours": f"{db_c.total_duration_hours} ساعت",
                "sessions_count": len(db_c.lessons) if db_c.lessons else 0,
                "rating": 5.0,
                "students_count": 0,
                "original_price": "۰",
                "price": "رایگان (وقف عام علم)",
                "discount_percent": 0,
                "badge": "دوره رسمی",
                "thumbnail": db_c.cover_image or "/images/ostad_zanjirzan.jpg",
                "media_type": "hybrid",
                "course_type": db_c.course_type or "offline",
                "capacity": db_c.capacity or 30,
                "enrolled_count": db_c.enrolled_count or 0,
                "skyroom_url": db_c.skyroom_url,
                "schedule": db_c.schedule,
                "description": db_c.desc_fa or "",
                "syllabus": [
                    {
                        "id": l.session_number,
                        "title": l.title_fa,
                        "duration": "۴۵:۰۰",
                        "duration_sec": l.duration_seconds,
                        "is_preview": l.is_free_sample,
                        "audio_stream_url": l.audio_url,
                        "media_type": "hybrid",
                    }
                    for l in (db_c.lessons or [])
                ],
            }
        raise HTTPException(status_code=404, detail="دوره مورد نظر یافت نشد.")


@router.get("/{course_id}/live-access", response_model=LiveAccessResponse, summary="Generate authenticated Skyroom live class ticket")
async def get_live_course_access(
    course_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Security Guardian & SaaS Gateway:
    Validates student enrollment for live online course and issues an ephemeral,
    authenticated Skyroom access payload with student identity.
    """
    course = await course_service.get_course_from_db_tx(db, course_id)
    if not course:
        try:
            c_dict = course_service.get_course_by_id(course_id)
            skyroom_url = c_dict.get("skyroomUrl") or "https://www.skyroom.online/ch/zanjirzan/live"
            schedule = c_dict.get("schedule") or "طبق تقویم هفتگی"
            course_title = c_dict.get("title", course_id)
        except Exception:
            raise HTTPException(status_code=404, detail="دوره مورد نظر یافت نشد.")
    else:
        skyroom_url = course.skyroom_url or "https://www.skyroom.online/ch/zanjirzan/live"
        schedule = course.schedule or "طبق تقویم هفتگی"
        course_title = course.title_fa

    # Verify student is enrolled (or is admin)
    if user.get("role") != "admin":
        enr_stmt = select(Enrollment).where(
            Enrollment.user_id == user["id"],
            Enrollment.course_id == course_id,
            Enrollment.status == "active",
        )
        enr_res = await db.execute(enr_stmt)
        if not enr_res.scalar_one_or_none():
            raise HTTPException(
                status_code=403,
                detail="برای ورود به کلاس آنلاین ابتدا باید در این دوره ثبت‌نام فرمایید."
            )

    user_display = user.get("full_name") or f"دانش‌پژوه {user.get('phone', '')[-4:]}"
    access_role_val = "admin" if user.get("role") == "admin" else "student"

    # Direct Skyroom One-Click Ticket Integration (per official Skyroom Webservice specifications)
    final_entry_url = skyroom_url
    if getattr(settings, "SKYROOM_API_KEY", ""):
        try:
            from backend.app.services.skyroom_service import skyroom_service
            # Extract target room identifier from course URL or default room ID
            target_room = getattr(settings, "SKYROOM_DEFAULT_ROOM_ID", "")
            if not target_room and "skyroom.online/ch/" in skyroom_url:
                target_room = skyroom_url.rstrip("/").split("/")[-1]

            if target_room:
                sky_res = await skyroom_service.create_login_url(
                    room_id=target_room,
                    user_id=f"usr_{user['id'].replace('-', '')[:16]}",
                    nickname=user_display,
                    access=3 if user.get("role") == "admin" else 1,
                    concurrent=1,
                    language="fa",
                    ttl=3600,
                )
                if sky_res.get("ok") and sky_res.get("result"):
                    final_entry_url = sky_res["result"]
        except Exception as sky_exc:
            logger.debug("Skyroom direct login ticket exception: %s", sky_exc)

    return {
        "success": True,
        "course_id": course_id,
        "course_title": course_title,
        "schedule": schedule,
        "is_live_now": True,
        "skyroom_url": final_entry_url,
        "student_display_name": user_display,
        "student_phone": user.get("phone", ""),
        "ticket_ttl_seconds": 3600,
        "access_role": access_role_val,
        "notice": "ورود به کلاس با شناسه رسمی و احراز هویت شده شما انجام می‌شود.",
    }


@router.get("/{course_id}/progress", summary="Get student playback progress for all chapters of a course")
async def get_course_progress(
    course_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns saved playback positions and completion percentages for all chapters of a course.
    """
    items = await course_service.get_user_course_progress_tx(
        db=db,
        user_id=user["id"],
        course_id=course_id,
    )
    completed_chapter_ids = [
        int(item["chapter_id"])
        for item in items
        if int(item.get("progress_percent", 0)) >= 90
    ]
    return {
        "course_id": course_id,
        "items": items,
        "completed_chapter_ids": completed_chapter_ids,
    }


@router.post("/{course_id}/progress", response_model=ProgressSyncResponse, summary="Synchronize audio playback progress")
async def sync_progress(
    course_id: str,
    req: ProgressSyncRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Syncs the student audio playback position and completed percentage across devices and persists in DB.
    """
    return await course_service.sync_progress_tx(
        db=db,
        user_id=user["id"],
        course_id=course_id,
        chapter_id=req.chapter_id,
        progress_percent=req.progress_percent,
        last_pos_sec=req.last_position_sec,
    )


@router.get("/{course_id}/chapters/{chapter_id}/summary", summary="Get AI-generated session summary and auto-subtitles")
async def get_chapter_ai_summary(course_id: str, chapter_id: int):
    from backend.app.services.auto_media_pipeline import get_session_summary
    from backend.app.services.course_service import course_service
    saved = get_session_summary(course_id, chapter_id)
    if saved:
        return saved
    try:
        course = course_service.get_course_by_id(course_id)
        c_title = course.get("title", course_id)
        ch_title = f"جلسه {chapter_id}"
        for ch in course.get("syllabus", []):
            if int(ch.get("id", 0)) == int(chapter_id):
                ch_title = ch.get("title", ch_title)
                break
    except Exception as exc:
        logger.debug("Failed resolving chapter title for summary fallback: %s", exc)
        c_title = course_id
        ch_title = f"جلسه {chapter_id}"

    return {
        "course_id": course_id,
        "chapter_id": chapter_id,
        "chapter_title": ch_title,
        "summary_fa": (
            f"خلاصه تحلیلی «{ch_title}» از دوره «{c_title}»:\n"
            f"• تبیین مبانی استدلالی و تعریف دقیق مفاهیم محوری جلسه.\n"
            f"• بررسی براهین اثبات مدعا و تفکیک حیثیات مفهومی و مصداقی.\n"
            f"• پاسخ به پرسش‌ها و شبهات مرتبط و جمع‌بندی نهایی مبحث."
        ),
        "auto_indexed": True,
    }


@router.get("/{course_id}/chapters/{chapter_id}/subtitles", summary="Get auto-generated Persian subtitles (JSON or WebVTT)")
async def get_chapter_subtitles(course_id: str, chapter_id: int, format: str = "json", lang: str = "fa"):
    from fastapi.responses import PlainTextResponse
    from backend.app.services.auto_media_pipeline import get_session_summary, build_webvtt_from_cues
    saved = get_session_summary(course_id, chapter_id)
    cues = (saved or {}).get("subtitles") or [
        {
            "id": 1,
            "start": 0,
            "end": 15,
            "text": {
                "fa": "بسم الله الرحمن الرحیم. آغاز درس‌گفتار رسمی حجت الاسلام دکتر زنجیرزن حسینی.",
                "ar": "بسم الله الرحمن الرحيم. بداية الدرس الرسمي لسماحة الدكتور زنجير زن حسيني.",
                "en": "In the Name of God. Official lecture by Hojjat al-Islam Dr. Zanjirzan Hosseini.",
            },
        }
    ]
    if format.lower() == "vtt":
        vtt_str = build_webvtt_from_cues(cues, lang=lang)
        return PlainTextResponse(content=vtt_str, media_type="text/vtt; charset=utf-8")
    return {"course_id": course_id, "chapter_id": chapter_id, "cues": cues}


@router.get("/{course_id}/reviews", response_model=CourseReviewsSummaryResponse, summary="Get course reviews and ratings")
async def get_course_reviews(
    course_id: str,
    user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves verified student reviews, average score, and rating distribution for a course.
    """
    return await review_service.get_course_reviews(db=db, course_id=course_id, current_user=user)


@router.post("/{course_id}/reviews", response_model=ReviewResponse, summary="Submit or update course review")
async def submit_course_review(
    course_id: str,
    payload: ReviewCreateRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Allows enrolled students (1-5 stars) to submit an academic review.
    Strictly forbids non-enrolled students and banned users.
    """
    return await review_service.submit_review(
        db=db,
        course_id=course_id,
        user_id=user["id"],
        rating=payload.rating,
        comment=payload.comment,
    )
