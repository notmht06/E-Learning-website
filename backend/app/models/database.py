"""
Database configuration and session management with SQLite WAL mode.
Supports async SQLAlchemy 2.0 with SQLite / PostgreSQL.
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Performance Engine).
"""
import os
from typing import AsyncGenerator, Optional
from sqlalchemy import select, event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from backend.app.core.config import settings

Base = declarative_base()

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine_kwargs = {"echo": False, "future": True, "connect_args": connect_args}
if "sqlite" in settings.DATABASE_URL:
    from sqlalchemy.pool import NullPool
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs,
)

# Enable SQLite WAL mode and foreign keys for high performance and concurrency
if "sqlite" in settings.DATABASE_URL:
    @event.listens_for(engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

_is_db_initialized = False


async def seed_default_users(db: Optional[AsyncSession] = None):
    """
    Seeds default student and admin accounts with bcrypt-hashed passwords in the persistent SQLite database.
    Idempotent: updates or creates accounts without breaking existing IDs or tests.
    """
    if db is None:
        async with async_session() as session:
            await _seed_users_tx(session)
            await session.commit()
    else:
        await _seed_users_tx(db)
        await db.flush()


async def _seed_users_tx(session: AsyncSession):
    from backend.app.models.models import User
    from backend.app.core.security import hash_password

    if settings.ENVIRONMENT == "production":
        admin_initial_password = os.getenv("ADMIN_INITIAL_PASSWORD")
        if not admin_initial_password or not admin_initial_password.strip() or admin_initial_password.strip() == "admin_secret_2026":
            raise RuntimeError("Production ADMIN_INITIAL_PASSWORD must be explicitly and securely set in the environment.")
        student_initial_password = os.getenv("STUDENT_INITIAL_PASSWORD", "Student_Secure_Pass_1403!")
    else:
        admin_initial_password = os.getenv("ADMIN_INITIAL_PASSWORD", "admin_secret_2026")
        student_initial_password = os.getenv("STUDENT_INITIAL_PASSWORD", "pass")


    # 1. Seed or sync student (usr-140301)
    res_stu = await session.execute(select(User).where(User.mobile == "09123456789"))
    student = res_stu.scalar_one_or_none()
    if not student:
        student = User(
            id="usr-140301",
            mobile="09123456789",
            full_name="Ali Mousavi",
            hashed_password=hash_password(student_initial_password),
            role="student",
            wallet_balance="350,000 Tomans",
            is_active=True,
        )
        session.add(student)
    else:
        student.role = "student"
        student.is_active = True
        if not student.id:
            student.id = "usr-140301"

    # 2. Seed or sync admin (adm-001 strictly named «حجت الاسلام دکتر زنجیر زن حسینی»)
    res_adm = await session.execute(select(User).where(User.mobile == "09120000000"))
    admin = res_adm.scalar_one_or_none()
    if not admin:
        admin = User(
            id="adm-001",
            mobile="09120000000",
            full_name="حجت الاسلام دکتر زنجیر زن حسینی",
            hashed_password=hash_password(admin_initial_password),
            role="admin",
            wallet_balance="0 Tomans",
            is_active=True,
        )
        session.add(admin)
    else:
        admin.role = "admin"
        admin.full_name = "حجت الاسلام دکتر زنجیر زن حسینی"
        admin.is_active = True
        if not admin.id:
            admin.id = "adm-001"

    # 3. Seed baseline enrollment for student usr-140301 in course-ishraq and course-mabadi-mantiq
    from backend.app.models.models import Enrollment
    for cid in ["course-ishraq", "course-mabadi-mantiq", "course-mantiq-mabadi"]:
        res_enr = await session.execute(
            select(Enrollment).where(
                Enrollment.user_id == "usr-140301",
                Enrollment.course_id == cid
            )
        )
        if not res_enr.scalar_one_or_none():
            session.add(
                Enrollment(
                    id=f"enr-seed-140301-{cid}",
                    user_id="usr-140301",
                    course_id=cid,
                    status="active"
                )
            )


async def seed_default_courses(db: Optional[AsyncSession] = None):
    """
    Seeds baseline catalog courses from CourseService into SQLite database to satisfy FK constraints.
    Idempotent: skips existing courses.
    """
    if db is None:
        async with async_session() as session:
            await _seed_courses_tx(session)
            await session.commit()
    else:
        await _seed_courses_tx(db)
        await db.flush()


async def _seed_courses_tx(session: AsyncSession):
    import json
    from pathlib import Path
    from backend.app.models.models import Course, Lesson
    from backend.app.services.course_service import course_service

    # 1. Baseline course_service courses
    for c in course_service.courses:
        res = await session.execute(select(Course).where(Course.id == c["id"]))
        existing_course = res.scalar_one_or_none()
        if not existing_course:
            hours_str = c.get("hours", "0")
            digits = "".join([ch for ch in hours_str if ch.isdigit()])
            hours_val = int(digits) if digits else 0

            new_c = Course(
                id=c["id"],
                title_fa=c["title"],
                slug=c["slug"],
                course_type="offline",
                desc_fa=c.get("description", ""),
                author_name=c.get("instructor", "حجت الاسلام دکتر زنجیر زن حسینی"),
                level=c.get("level", "مقدماتی"),
                cover_image=c.get("thumbnail", "/images/ostad_zanjirzan.jpg"),
                total_duration_hours=hours_val,
                is_published=True,
            )
            session.add(new_c)
            await session.flush()

            for s in c.get("syllabus", []):
                new_lesson = Lesson(
                    id=f"les-{c['id']}-{s['id']}",
                    course_id=c["id"],
                    session_number=s["id"],
                    title_fa=s.get("title", f"جلسه {s['id']}"),
                    audio_url=s.get("audio_stream_url", "/audio/sample_lecture.wav"),
                    duration_seconds=s.get("duration_sec", 0),
                    audio_size_mb="25",
                    is_free_sample=s.get("is_preview", False),
                )
                session.add(new_lesson)

    # 2. Comprehensive seeding from seed_courses_data.json (all offline & online courses)
    seed_json_path = Path(__file__).resolve().parent / "seed_courses_data.json"
    if seed_json_path.exists():
        try:
            with open(seed_json_path, "r", encoding="utf-8") as f:
                all_courses_dict = json.load(f)

            for cid, cdata in all_courses_dict.items():
                res = await session.execute(select(Course).where(Course.id == cid))
                existing_course = res.scalar_one_or_none()
                if not existing_course:
                    dur_str = cdata.get("duration_fa", "0")
                    digits = "".join([ch for ch in dur_str if ch.isdigit()])
                    dur_val = int(digits) if digits else 0

                    course_obj = Course(
                        id=cid,
                        title_fa=cdata.get("title_fa", cid),
                        slug=cid,
                        course_type=cdata.get("course_type", "offline"),
                        desc_fa=cdata.get("desc_fa", ""),
                        author_name=cdata.get("instructor_fa", "حجت الاسلام دکتر زنجیر زن حسینی"),
                        level=cdata.get("level_fa", "متوسط"),
                        cover_image=cdata.get("thumbnail") or "/images/ostad_zanjirzan.jpg",
                        total_duration_hours=dur_val,
                        capacity=cdata.get("capacity", 30),
                        enrolled_count=cdata.get("enrolledCount", 0),
                        skyroom_url=cdata.get("skyroomUrl"),
                        schedule=cdata.get("schedule"),
                        is_published=True,
                    )
                    session.add(course_obj)
                    await session.flush()

                    for idx, ch in enumerate(cdata.get("chapters", []), start=1):
                        ch_id = ch.get("id") or idx
                        lesson_obj = Lesson(
                            id=f"les-{cid}-{ch_id}",
                            course_id=cid,
                            session_number=ch_id,
                            title_fa=ch.get("title_fa", f"جلسه {ch_id}"),
                            audio_url=ch.get("audioUrl") or ch.get("videoUrl") or cdata.get("sampleAudioUrl", "/audio/sample_lecture.wav"),
                            duration_seconds=1800,
                            audio_size_mb="25",
                            is_free_sample=ch.get("isFreePreview", False),
                        )
                        session.add(lesson_obj)
        except Exception as e:
            print(f"[WARNING] Note on seed_courses_data: {e}")


async def init_db():
    """
    Initializes database tables, runs column migrations, and seeds default users and courses.
    Explicitly imports models to guarantee table registration before create_all.
    """
    global _is_db_initialized
    import backend.app.models.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # SQLite column migration safety check
        if "sqlite" in settings.DATABASE_URL:
            def check_and_migrate(sync_conn):
                from sqlalchemy import text
                from backend.app.models.models import User
                result = sync_conn.execute(text("PRAGMA table_info(users)")).fetchall()
                columns = {row[1] for row in result}
                if columns:
                    if "phone" not in columns:
                        sync_conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20)"))
                        columns.add("phone")
                    if "mobile" in columns:
                        sync_conn.execute(text("UPDATE users SET phone = mobile WHERE phone IS NULL AND mobile IS NOT NULL"))
                        sync_conn.execute(text("UPDATE users SET mobile = phone WHERE mobile IS NULL AND phone IS NOT NULL"))
                    for col in User.__table__.columns:
                        if col.name not in columns:
                            col_type = col.type.compile(dialect=engine.sync_engine.dialect)
                            sync_conn.execute(text(f"ALTER TABLE users ADD COLUMN {col.name} {col_type}"))

                # Ensure unique and composite indexes for enrollment (user_id, course_id)
                sync_conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_enrollment ON enrollments (user_id, course_id)"))
                sync_conn.execute(text("CREATE INDEX IF NOT EXISTS ix_enrollments_user_course ON enrollments (user_id, course_id)"))

                # Ensure user_favorites table and composite index
                sync_conn.execute(text(
                    "CREATE TABLE IF NOT EXISTS user_favorites ("
                    "id VARCHAR(50) PRIMARY KEY, "
                    "user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE, "
                    "course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE, "
                    "created_at DATETIME"
                    ")"
                ))
                sync_conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_favorite ON user_favorites (user_id, course_id)"))
                sync_conn.execute(text("CREATE INDEX IF NOT EXISTS ix_user_favorites_user_course ON user_favorites (user_id, course_id)"))

            await conn.run_sync(check_and_migrate)

    await seed_default_courses()
    await seed_default_users()
    _is_db_initialized = True

seed_baseline_users = seed_default_users
seed_baseline_courses = seed_default_courses


async def ensure_db_initialized():
    """Ensures database is initialized idempotently."""
    global _is_db_initialized
    if not _is_db_initialized:
        await init_db()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an async database session.
    Ensures tables and default users are initialized, and manages ACID commit/rollback.
    """
    global _is_db_initialized
    if not _is_db_initialized:
        await init_db()

    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
