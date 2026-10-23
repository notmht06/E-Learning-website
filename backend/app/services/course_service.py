"""
Audio Course and Academic Syllabus Service.
Manages course catalog, chapters, audio tracks, and student playback progress.
"""
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from backend.app.core.exceptions import EntityNotFoundException, AppException
from backend.app.models.models import Course, Enrollment, UserFavorite
from backend.app.schemas.admin import to_chapter_dict


class CourseService:
    def __init__(self):
        self.courses: List[Dict[str, Any]] = [
            {
                "id": "course-mabadi-mantiq",
                "title": "سلسله جلسات مبادی منطق و تفکر عقلانی",
                "slug": "foundations-of-logic-and-rational-thought",
                "instructor": "حجت الاسلام دکتر زنجیر زن حسینی",
                "level": "مقدماتی",
                "hours": "۱۲ ساعت",
                "sessions_count": 9,
                "rating": 5.0,
                "students_count": 3450,
                "original_price": "۰",
                "price": "رایگان",
                "discount_percent": 0,
                "badge": "دوره رسمی مبادی منطق",
                "thumbnail": "/images/ostad_zanjirzan.jpg",
                "media_type": "hybrid",
                "description": "تدریس تفصیلی و مهندسی‌شده اصول علم منطق، از تعریف علم و تصور و تصدیق تا کلیات خمس، تعریف، ساختار برهان و نقد مغالطات توسط حجت الاسلام دکتر زنجیر زن حسینی.",
                "tags": ["منطق", "مبادی منطق", "تفکر عقلانی", "فلسفه اسلامی", "حجت الاسلام دکتر زنجیر زن حسینی"],
                "syllabus": [
                    {"id": 1, "title": "جلسه ۰۱: تعریف علم و تقسیم به تصور و تصدیق", "duration": "۳۸:۴۰", "duration_sec": 2320, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "video_stream_url": "https://www.youtube.com/watch?v=V2QMmbJEBLc", "media_type": "hybrid"},
                    {"id": 2, "title": "جلسه ۰۲: مباحث الفاظ، دلالت و اقسام سه‌گانه آن", "duration": "۴۴:۱۵", "duration_sec": 2655, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "video_stream_url": "https://www.youtube.com/watch?v=KoOiRI_gt-k", "media_type": "hybrid"},
                    {"id": 3, "title": "جلسه ۰۳: نسبت‌های چهارگانه میان مفاهیم کلی", "duration": "۴۱:۲۰", "duration_sec": 2480, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 4, "title": "جلسه ۰۴: کلیات خمس (جنس، فصل، نوع، عرض عام و خاص)", "duration": "۴۹:۱۰", "duration_sec": 2950, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 5, "title": "جلسه ۰۵: معرف و شروط تعریف، حد تام و رسم تام", "duration": "۴۶:۳۵", "duration_sec": 2795, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 6, "title": "جلسه ۰۶: قضایا و ساختار تصدیقات (حملیه و شرطیه)", "duration": "۵۲:۰۰", "duration_sec": 3120, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 7, "title": "جلسه ۰۷: احکام قضایا، تناقض و عکس مستوی", "duration": "۴۷:20", "duration_sec": 2840, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 8, "title": "جلسه ۰۸: حجت و قیاس اقترانی، اشکال اربعه", "duration": "۵۰:۴۵", "duration_sec": 3045, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 9, "title": "جلسه ۰۹: صناعات خمس، تحلیل برهان و دفع مغالطات", "duration": "۵۵:۱۰", "duration_sec": 3310, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "video_stream_url": "https://www.youtube.com/watch?v=dpwVDaY_yT8", "media_type": "hybrid"},
                ]
            },
            {
                "id": "course-bidayat",
                "title": "دوره شرح بدایة الحکمة علامه طباطبایی",
                "slug": "commentary-bidayat-al-hikmah",
                "instructor": "حجت الاسلام دکتر زنجیر زن حسینی",
                "level": "متوسط",
                "hours": "۹۲ ساعت",
                "sessions_count": 120,
                "rating": 4.97,
                "students_count": 2850,
                "original_price": "۰",
                "price": "رایگان",
                "discount_percent": 0,
                "badge": "جامع‌ترین دوره بدایة الحکمة",
                "thumbnail": "/images/ostad_zanjirzan.jpg",
                "media_type": "hybrid",
                "description": "تدریس عمیق و برهانی مراحل دوازده‌گانه کتاب بدایة الحکمة شامل امور عامه، اصالت وجود، مواد ثلاث، علت و معلول، قوه و فعل و الهیات بالمعنی الاخص.",
                "tags": ["بدایة الحکمة", "علامه طباطبایی", "فلسفه اسلامی", "حکمت صدرایی"],
                "syllabus": [
                    {"id": 1, "title": "جلسه ۰۱: تعریف موضوع فلسفه اولی (موجود بما هو موجود)", "duration": "۴۵:۳۰", "duration_sec": 2730, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 2, "title": "جلسه ۰۲: براهین اصالت وجود و ابطال اعتباریت ماهیت", "duration": "۵۲:۱۰", "duration_sec": 3130, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 3, "title": "جلسه ۰۳: حقیقت تشکیک وجود و مراتب نوری هستی", "duration": "۴۸:۴۰", "duration_sec": 2920, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                ]
            },
            {
                "id": "course-asfar",
                "title": "اسفار اربعه: سفر اول، امور عامه و اصالت وجود",
                "slug": "asfar-arbaa-volume-one",
                "instructor": "حجت الاسلام دکتر زنجیر زن حسینی",
                "level": "پیشرفته",
                "hours": "۷۰ ساعت",
                "sessions_count": 84,
                "rating": 4.98,
                "students_count": 2100,
                "original_price": "۰",
                "price": "رایگان",
                "discount_percent": 0,
                "badge": "جامع‌ترین درس‌گفتار حکمت متعالیه",
                "thumbnail": "/images/ostad_zanjirzan.jpg",
                "media_type": "hybrid",
                "description": "تقریر دقیق براهین اصالت وجود، اعتباریت ماهیت، تشکیک وجود و وحدت وجود از منظر ملاصدرای شیرازی با تدقیق در عبارات صدرالمتألهین.",
                "tags": ["ملاصدرا", "حکمت متعالیه", "اصالت وجود", "اسفار"],
                "syllabus": [
                    {"id": 1, "title": "جلسه ۰۱: مقدمه ملاصدرا بر اسفار و غایت حکمت الهی", "duration": "۵۸:۳۰", "duration_sec": 3510, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                    {"id": 2, "title": "جلسه ۰۲: برهان اصالت وجود و ابطال اعتباریت ماهیت", "duration": "۵۲:۱۵", "duration_sec": 3135, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "hybrid"},
                ]
            },
            {
                "id": "course-ishraq",
                "title": "شرح و تحلیل جامع حکمة‌الاشراق سهروردی",
                "slug": "hikmat-al-ishraq-advanced",
                "instructor": "حجت الاسلام دکتر زنجیر زن حسینی",
                "level": "پیشرفته",
                "hours": "۳۶ ساعت",
                "sessions_count": 42,
                "rating": 4.95,
                "students_count": 1420,
                "original_price": "۰",
                "price": "رایگان",
                "discount_percent": 0,
                "badge": "دوره برگزیده حکمت اشراق",
                "thumbnail": "/images/ostad_zanjirzan.jpg",
                "media_type": "audio",
                "description": "بررسی دقیق هستی‌شناسی نور، مراتب انوار قاهره و اسپهبدیه، و تفاوت‌های بنیادین حکمت ذوقی با فلسفه مشاء بر اساس نص سهروردی و حواشی قطب‌الدین شیرازی.",
                "tags": ["حکمت اشراق", "سهروردی", "فلسفه اسلامی", "درس خارج"],
                "syllabus": [
                    {"id": 1, "title": "جلسه ۰۱: مدخل و روش‌شناسی حکمت اشراقی در برابر مشاء", "duration": "۴۵:۲۰", "duration_sec": 2720, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "audio"},
                    {"id": 2, "title": "جلسه ۰۲: تعریف نور و اصالت نور در نظام وجودی سهروردی", "duration": "۵۲:۱۰", "duration_sec": 3130, "is_preview": True, "audio_stream_url": "/audio/sample_lecture.wav", "media_type": "audio"},
                ]
            }
        ]
        self.user_progress: Dict[str, Dict[str, Any]] = {}
        self._load_seed_catalog()

    COURSE_ID_ALIASES: Dict[str, str] = {
        "course1": "course-mantiq-mabadi",
        "course2": "course-falsafe-bidayah",
        "course3": "course-falsafe-asfar-1",
        "course-mantiq-mabadi": "course-mabadi-mantiq",
        "course-falsafe-bidayah": "course-bidayat",
        "course-falsafe-asfar-1": "course-asfar",
        "course-falsafe-ishraq": "course-ishraq",
        "c1": "course-falsafe-asfar-1",
        "c2": "course-falsafe-bidayah",
        "c3": "course-mantiq-mabadi",
        "course-asfar": "course-falsafe-asfar-1",
        "course-asfar-1": "course-falsafe-asfar-1",
        "course-ishraq": "course-falsafe-ishraq",
    }

    def _load_seed_catalog(self) -> None:
        """Loads all 21 offline and online courses from seed_courses_data.json into memory catalog."""
        import json
        from pathlib import Path

        seed_path = Path(__file__).resolve().parent.parent / "models" / "seed_courses_data.json"
        if not seed_path.exists():
            return
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
            existing_ids = {c["id"] for c in self.courses}
            for cid, cdata in seed_data.items():
                if cid in existing_ids:
                    continue
                chapters = cdata.get("chapters", [])
                syllabus = [
                    {
                        "id": ch.get("id", idx + 1),
                        "title": ch.get("title_fa", f"جلسه {idx + 1}"),
                        "duration": ch.get("duration", "۴۵:۰۰"),
                        "duration_sec": 2700,
                        "is_preview": bool(ch.get("isFreePreview", idx == 0)),
                        "audio_stream_url": ch.get("audioUrl") or cdata.get("sampleAudioUrl") or "/audio/sample_lecture.wav",
                        "video_stream_url": ch.get("videoUrl"),
                        "media_type": ch.get("media_type", cdata.get("media_type", "audio")),
                    }
                    for idx, ch in enumerate(chapters)
                ]
                self.courses.append({
                    "id": cid,
                    "title": cdata.get("title_fa", cid),
                    "slug": cid,
                    "instructor": cdata.get("instructor_fa", "حجت الاسلام دکتر زنجیر زن حسینی"),
                    "level": cdata.get("level_fa", "سطح حوزوی و دانشگاهی"),
                    "hours": cdata.get("duration_fa", "۳۰ ساعت"),
                    "sessions_count": cdata.get("episodes_count", len(syllabus) or 1),
                    "rating": 5.0,
                    "students_count": cdata.get("enrolledCount", 120),
                    "original_price": "۰",
                    "price": cdata.get("price_fa", "رایگان"),
                    "discount_percent": 0,
                    "badge": cdata.get("subject", "دوره رسمی"),
                    "thumbnail": cdata.get("thumbnail") or "/images/ostad_zanjirzan.jpg",
                    "description": cdata.get("desc_fa", ""),
                    "tags": [cdata.get("subject", "فلسفه اسلامی")],
                    "syllabus": syllabus,
                    "media_type": cdata.get("media_type", "audio"),
                    "course_type": cdata.get("course_type", "offline"),
                    "platform": cdata.get("platform"),
                    "capacity": cdata.get("capacity"),
                    "enrolled_count": cdata.get("enrolledCount"),
                    "skyroom_url": cdata.get("skyroomUrl"),
                    "schedule": cdata.get("schedule"),
                })
        except Exception as exc:
            print(f"[WARNING] Failed to load seed catalog into CourseService: {exc}")

    def get_all_courses(self) -> List[Dict[str, Any]]:
        """Returns all available courses."""
        return self.courses

    def get_course_by_id(self, course_id: str) -> Dict[str, Any]:
        """Retrieves a single course by its unique ID or canonical alias."""
        for c in self.courses:
            if c["id"] == course_id:
                return c
        aliased_id = self.COURSE_ID_ALIASES.get(course_id)
        if aliased_id:
            for c in self.courses:
                if c["id"] == aliased_id:
                    return {**c, "id": course_id}
        raise EntityNotFoundException(entity="Course", identifier=course_id)

    def sync_progress(
        self,
        user_id: str,
        course_id: str,
        chapter_id: int,
        progress_percent: int,
        last_pos_sec: int,
    ) -> Dict[str, Any]:
        """Saves student playback progress and returns a valid ProgressSyncResponse dict."""
        now_iso = datetime.utcnow().isoformat()
        key = f"{user_id}:{course_id}:{chapter_id}"
        record = {
            "success": True,
            "user_id": user_id,
            "course_id": course_id,
            "chapter_id": int(chapter_id),
            "progress_percent": max(0, min(100, int(progress_percent))),
            "last_pos_sec": max(0, int(last_pos_sec)),
            "updated_at": now_iso,
        }
        self.user_progress[key] = record
        return record

    async def sync_progress_tx(
        self,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        chapter_id: int,
        progress_percent: int,
        last_pos_sec: int,
    ) -> Dict[str, Any]:
        """Persists student playback progress into SQLite/PostgreSQL LessonProgress table."""
        from backend.app.models.models import LessonProgress

        record = self.sync_progress(user_id, course_id, chapter_id, progress_percent, last_pos_sec)
        stmt = select(LessonProgress).where(
            LessonProgress.user_id == user_id,
            LessonProgress.course_id == course_id,
            LessonProgress.chapter_id == int(chapter_id),
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        now_dt = datetime.utcnow()
        if existing:
            existing.progress_percent = record["progress_percent"]
            existing.last_pos_sec = record["last_pos_sec"]
            existing.updated_at = now_dt
        else:
            db.add(
                LessonProgress(
                    id=f"prg-{uuid.uuid4().hex[:10]}",
                    user_id=user_id,
                    course_id=course_id,
                    chapter_id=int(chapter_id),
                    progress_percent=record["progress_percent"],
                    last_pos_sec=record["last_pos_sec"],
                    updated_at=now_dt,
                )
            )
        await db.flush()
        return record

    async def get_user_course_progress_tx(
        self,
        db: AsyncSession,
        user_id: str,
        course_id: str,
    ) -> List[Dict[str, Any]]:
        """Retrieves all chapter progress records for a student in a specific course from DB."""
        from backend.app.models.models import LessonProgress

        stmt = (
            select(LessonProgress)
            .where(
                LessonProgress.user_id == user_id,
                LessonProgress.course_id == course_id,
            )
            .order_by(LessonProgress.chapter_id.asc())
        )
        res = await db.execute(stmt)
        rows = [r.to_dict() for r in res.scalars().all()]
        if rows:
            return rows

        # Fallback to in-memory cache if DB has no rows yet
        prefix = f"{user_id}:{course_id}:"
        return [val for key, val in self.user_progress.items() if key.startswith(prefix)]

    def update_course(self, course_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates course fields dynamically."""
        for c in self.courses:
            if c["id"] == course_id:
                for k, v in updates.items():
                    if v is not None:
                        c[k] = v
                return c
        raise EntityNotFoundException(entity="Course", identifier=course_id)

    def delete_course(self, course_id: str) -> bool:
        """Deletes a course from the catalog."""
        for i, c in enumerate(self.courses):
            if c["id"] == course_id:
                self.courses.pop(i)
                return True
        raise EntityNotFoundException(entity="Course", identifier=course_id)

    def add_chapter(self, course_id: str, chapter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Adds a new session/chapter to a course."""
        course = self.get_course_by_id(course_id)
        syllabus = course.setdefault("syllabus", [])
        new_chapter_id = len(syllabus) + 1
        new_chapter = to_chapter_dict(chapter_data, chapter_id=new_chapter_id)
        syllabus.append(new_chapter)
        course["sessions_count"] = len(syllabus)
        return new_chapter

    def update_chapter(self, course_id: str, chapter_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates an existing session in a course."""
        course = self.get_course_by_id(course_id)
        for ch in course.get("syllabus", []):
            if ch.get("id") == chapter_id or str(ch.get("id")) == str(chapter_id):
                for k, v in updates.items():
                    if v is not None:
                        ch[k] = v
                return ch
        raise EntityNotFoundException(entity="Chapter", identifier=str(chapter_id))

    def delete_chapter(self, course_id: str, chapter_id: int) -> bool:
        """Deletes a session from a course."""
        course = self.get_course_by_id(course_id)
        syllabus = course.get("syllabus", [])
        for i, ch in enumerate(syllabus):
            if ch.get("id") == chapter_id or str(ch.get("id")) == str(chapter_id):
                syllabus.pop(i)
                course["sessions_count"] = len(syllabus)
                return True
        raise EntityNotFoundException(entity="Chapter", identifier=str(chapter_id))

    async def enroll_student(self, db: AsyncSession, user_id: str, course_id: str) -> Dict[str, Any]:
        """
        Enrolls a student in a course with DB persistence and duplicate check.
        """
        # ۱. واکشی اطلاعات دوره از کاتالوگ
        course = self.get_course_by_id(course_id)
        course_title = course.get("title", course_id)

        # ۲. تضمین وجود دوره در جدول دیتابیس برای ارضای کلید خارجی SQLite
        course_res = await db.execute(select(Course).where(Course.id == course_id))
        if not course_res.scalar_one_or_none():
            safe_slug = course_id
            existing_slug_res = await db.execute(select(Course).where(Course.slug == safe_slug))
            if existing_slug_res.scalar_one_or_none():
                safe_slug = f"{course_id}-{uuid.uuid4().hex[:6]}"

            db_course = Course(
                id=course_id,
                title_fa=course_title,
                slug=safe_slug,
                author_name=course.get("instructor", "حجت الاسلام دکتر زنجیر زن حسینی"),
                desc_fa=course.get("description", ""),
                level=course.get("level", "سطوح عالی و خارج"),
                is_published=True,
            )
            db.add(db_course)
            await db.flush()

        # ۳. بررسی ثبت‌نام قبلی فعال
        enr_stmt = select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == course_id,
            Enrollment.status == "active",
        )
        enr_res = await db.execute(enr_stmt)
        if enr_res.scalar_one_or_none():
            raise AppException(
                message=f"شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.",
                code="DUPLICATE_ENROLLMENT",
                status_code=400,
            )

        # ۴. ایجاد و ذخیره رکورد ثبت‌نام
        enrollment_id = f"enr-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        enrollment = Enrollment(
            id=enrollment_id,
            user_id=user_id,
            course_id=course_id,
            status="active",
            enrolled_at=now,
        )
        try:
            db.add(enrollment)
            await db.flush()
        except IntegrityError:
            await db.rollback()
            raise AppException(
                message=f"شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.",
                code="DUPLICATE_ENROLLMENT",
                status_code=400,
            )

        return {
            "success": True,
            "message": f"ثبت‌نام شما در دوره «{course_title}» با موفقیت انجام شد.",
            "enrollment_id": enrollment_id,
            "course_id": course_id,
            "enrolled_at": now.isoformat(),
            "status": "active",
        }

    async def get_enrolled_courses_for_user(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all active courses enrolled by the user using selectinload to eliminate N+1 queries.
        """
        stmt = (
            select(Enrollment)
            .options(
                selectinload(Enrollment.course).selectinload(Course.lessons)
            )
            .where(
                Enrollment.user_id == user_id,
                Enrollment.status == "active",
            )
            .order_by(Enrollment.enrolled_at.desc())
        )
        res = await db.execute(stmt)
        enrollments = res.scalars().all()

        enrolled_courses = []
        for enr in enrollments:
            try:
                enrolled_courses.append(self.get_course_by_id(enr.course_id))
            except EntityNotFoundException:
                if enr.course:
                    enrolled_courses.append({
                        "id": enr.course.id,
                        "title": enr.course.title_fa,
                        "slug": enr.course.slug,
                        "instructor": enr.course.author_name or "حجت الاسلام دکتر زنجیر زن حسینی",
                        "level": enr.course.level or "سطوح عالی و خارج",
                        "hours": f"{enr.course.total_duration_hours} ساعت",
                        "sessions_count": len(enr.course.lessons) if enr.course.lessons else 0,
                        "rating": 5.0,
                        "students_count": 0,
                        "original_price": "۰",
                        "price": "رایگان (وقف عام علم)",
                        "discount_percent": 0,
                        "badge": "دوره رسمی",
                        "thumbnail": enr.course.cover_image or "/images/ostad_zanjirzan.jpg",
                        "media_type": "hybrid",
                        "description": enr.course.desc_fa or "",
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
                            for l in (enr.course.lessons or [])
                        ],
                    })
        return enrolled_courses

    async def get_course_from_db_tx(self, db: AsyncSession, course_id: str) -> Optional[Course]:
        """
        Retrieves course from database with lessons eagerly loaded via selectinload to eliminate N+1 queries.
        """
        stmt = (
            select(Course)
            .options(
                selectinload(Course.lessons),
                selectinload(Course.category),
            )
            .where(Course.id == course_id)
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def toggle_favorite(self, db: AsyncSession, user_id: str, course_id: str) -> Dict[str, Any]:
        """
        Toggles favorite status for a course by the user.
        """
        course = self.get_course_by_id(course_id)
        course_title = course.get("title", course_id)

        stmt = select(UserFavorite).where(
            UserFavorite.user_id == user_id,
            UserFavorite.course_id == course_id,
        )
        res = await db.execute(stmt)
        fav = res.scalar_one_or_none()
        if fav:
            await db.delete(fav)
            await db.flush()
            return {
                "success": True,
                "is_favorite": False,
                "course_id": course_id,
                "message": f"دوره «{course_title}» از نشانه‌گذاری‌ها حذف شد.",
            }
        else:
            c_chk = await db.execute(select(Course).where(Course.id == course_id))
            if not c_chk.scalar_one_or_none():
                try:
                    async with db.begin_nested():
                        db_c = Course(
                            id=course_id,
                            title_fa=course_title,
                            slug=course.get("slug", course_id),
                            author_name=course.get("instructor", "حجت الاسلام دکتر زنجیر زن حسینی"),
                            desc_fa=course.get("description", ""),
                            level=course.get("level", "سطوح عالی و خارج"),
                            is_published=True,
                        )
                        db.add(db_c)
                        await db.flush()
                except Exception as exc:
                    logger.debug("Course row already exists or initialized concurrently: %s", exc)

            new_fav = UserFavorite(
                id=f"fav-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                course_id=course_id,
            )
            try:
                async with db.begin_nested():
                    db.add(new_fav)
                    await db.flush()
            except IntegrityError:
                return {
                    "success": True,
                    "is_favorite": True,
                    "course_id": course_id,
                    "message": f"دوره «{course_title}» پیش‌تر به نشانه‌گذاری‌ها افزوده شده است.",
                }
            return {
                "success": True,
                "is_favorite": True,
                "course_id": course_id,
                "message": f"دوره «{course_title}» به نشانه‌گذاری‌ها افزوده شد.",
            }

    async def get_user_favorites(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all favorited courses for the user with eager loading.
        """
        stmt = (
            select(UserFavorite)
            .options(
                selectinload(UserFavorite.course).selectinload(Course.lessons),
            )
            .where(UserFavorite.user_id == user_id)
            .order_by(UserFavorite.created_at.desc())
        )
        res = await db.execute(stmt)
        favorites = res.scalars().all()
        fav_courses = []
        for f in favorites:
            try:
                fav_courses.append(self.get_course_by_id(f.course_id))
            except EntityNotFoundException:
                if f.course:
                    fav_courses.append({
                        "id": f.course.id,
                        "title": f.course.title_fa,
                        "slug": f.course.slug,
                        "instructor": f.course.author_name or "حجت الاسلام دکتر زنجیر زن حسینی",
                        "level": f.course.level or "سطوح عالی و خارج",
                        "hours": f"{f.course.total_duration_hours} ساعت",
                        "sessions_count": len(f.course.lessons) if f.course.lessons else 0,
                        "rating": 5.0,
                        "students_count": 0,
                        "original_price": "۰",
                        "price": "رایگان (وقف عام علم)",
                        "discount_percent": 0,
                        "badge": "نشانه‌گذاری‌شده",
                        "thumbnail": f.course.cover_image or "/images/ostad_zanjirzan.jpg",
                        "media_type": "hybrid",
                        "description": f.course.desc_fa or "",
                        "syllabus": [],
                    })
        return fav_courses


course_service = CourseService()

