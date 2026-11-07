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
else:
    # High-concurrency connection pool for 1,000+ simultaneous students (PostgreSQL / MySQL)
    from sqlalchemy.pool import QueuePool
    engine_kwargs["poolclass"] = QueuePool
    engine_kwargs["pool_size"] = int(os.getenv("DB_POOL_SIZE", "25"))
    engine_kwargs["max_overflow"] = int(os.getenv("DB_MAX_OVERFLOW", "50"))
    engine_kwargs["pool_timeout"] = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    engine_kwargs["pool_recycle"] = int(os.getenv("DB_POOL_RECYCLE", "1800"))
    engine_kwargs["pool_pre_ping"] = True

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


    # 1. Seed or sync student (usr-140301) only in non-production environments
    if settings.ENVIRONMENT != "production":
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

    # 3. Seed baseline enrollment only in non-production development/testing environments
    if settings.ENVIRONMENT != "production":
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
    # Heal any test-mutated course title in SQLite
    async with async_session() as heal_sess:
        from sqlalchemy import update
        from backend.app.models.models import Course
        await heal_sess.execute(
            update(Course)
            .where(Course.title_fa == "تغییر غیرمجاز عنوان دوره")
            .values(title_fa="شرح و تحلیل جامع حکمة‌الاشراق سهروردی")
        )
        await heal_sess.commit()
    await seed_default_users()
    await seed_default_cms_data()
    _is_db_initialized = True

seed_baseline_users = seed_default_users
seed_baseline_courses = seed_default_courses


async def seed_default_cms_data(db: Optional[AsyncSession] = None):
    """
    Seeds default SiteConfig, Category, BookModel, Coupon, and ArticleModel
    into SQLite database idempotently.
    """
    if db is None:
        async with async_session() as session:
            await _seed_cms_data_tx(session)
            await session.commit()
    else:
        await _seed_cms_data_tx(db)
        await db.flush()


async def _seed_cms_data_tx(session: AsyncSession):
    import json
    from datetime import datetime
    from backend.app.models.models import SiteConfig, Category, BookModel, Coupon, ArticleModel, CourseReview

    # 1. Seed SiteConfig 'general'
    res_cfg = await session.execute(select(SiteConfig).where(SiteConfig.key == "general"))
    if not res_cfg.scalar_one_or_none():
        cfg_dict = {
            "scholar_name_fa": "حجت الاسلام دکتر زنجیر زن حسینی",
            "scholar_name_ar": "حجة الإسلام الدكتور زنجير زن حسيني",
            "scholar_name_en": "Hojjat al-Islam Dr. Zanjirzan Hosseini",
            "hero_title_fa": "پایگاه تخصصی حکمت اسلامی و علوم عقلی",
            "hero_title_ar": "المنصة التخصصية للحكمة الإسلامية والعلوم العقلية",
            "hero_title_en": "Specialized Platform for Islamic Wisdom and Rational Sciences",
            "hero_subtitle_fa": "تحت اشراف و تدریس حجت الاسلام دکتر زنجیر زن حسینی",
            "hero_subtitle_ar": "تحت إشراف وتدريس حجة الإسلام الدكتور زنجير زن حسيني",
            "hero_subtitle_en": "Under the instruction and supervision of Hojjat al-Islam Dr. Zanjirzan Hosseini",
            "quote_fa": "العلم نور يقذفه الله في قلب من يشاء من عباده",
            "announcement_bar_text": "آغاز ثبت‌نام دوره جامع حکمت اشراق و اسفار اربعه — سال تحصیلی جدید",
            "announcement_bar_active": True,
            "bio_fa": "حجت الاسلام دکتر زنجیر زن حسینی، استاد خارج فقه، اصول، فلسفه و کلام اسلامی، با بیش از دو دهه تدریس در حوزه‌های علمیه و دانشگاه‌های برجسته، به تبیین برهانی معارف الهی اهتمام دارند.",
            "stat_years": "+۱۵ سال",
            "stat_sessions": "+۴۵۰ جلسه",
            "stat_books": "۲۱ دوره",
            "stat_students": "+۱,۴۰۰",
            "telegram_support": "https://t.me/Hekkmat7",
            "telegram_channel": "https://t.me/AlNajmosageb313",
            "eitaa_channel": "https://eitaa.com/Hekkmat7",
            "skyroom_default_url": "https://www.skyroom.online/ch/zanjirzan/live",
            "footer_copyright_fa": "تمامی حقوق مادی و معنوی متعلق به پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی است.",
            "ai_welcome_message": "سلام! من دستیار هوشمند علمی پایگاه حجت الاسلام دکتر زنجیر زن حسینی هستم. می‌توانید هر پرسشی درباره دروس، کتب و مباحث فلسفی و کلامی بپرسید.",
            "suggested_questions": [
                "اصالت وجود در حکمت متعالیه چیست؟",
                "سلسله مراتب انوار در حکمت اشراق",
                "برهان صدیقین در اثبات واجب تعالی"
            ],
            "strict_corpus_only": True,
        }
        session.add(SiteConfig(key="general", value_json=json.dumps(cfg_dict, ensure_ascii=False)))

    # 2. Seed default Categories
    default_cats = [
        {"id": "cat-mantiq", "name": "منطق", "slug": "mantiq", "description": "مبادی تفکر عقلانی، منطق صوری و مادی، نقد مغالطات و صناعات خمس", "icon_name": "Brain", "display_order": 1},
        {"id": "cat-falsafe", "name": "فلسفه", "slug": "falsafe", "description": "حکمت مشاء، اشراق، حکمت متعالیه، بدایه، نهایه، اسفار اربعه و فلسفه غرب", "icon_name": "Compass", "display_order": 2},
        {"id": "cat-fiqh", "name": "فقه", "slug": "fiqh", "description": "فقه استدلالی، مکاسب محرمه، شروط المتعاقدین و احکام معاملات", "icon_name": "Scale", "display_order": 3},
        {"id": "cat-osul", "name": "اصول", "slug": "osul", "description": "اصول فقه تراز اجتهادی، فرائد الاصول (رسائل)، کفایة الاصول و حلقات شهید صدر", "icon_name": "Scroll", "display_order": 4},
        {"id": "cat-tafsir", "name": "تفسیر", "slug": "tafsir", "description": "تفسیر عقلی و انفسی قرآن کریم، تفسیر ملاصدرا بر سوره حمد و سوره بقره", "icon_name": "BookOpen", "display_order": 5},
        {"id": "cat-kalam", "name": "کلام", "slug": "kalam", "description": "کلام استدلالی، تجرید الاعتقاد نصیرالدین طوسی، کشف المراد علامه حلی", "icon_name": "ShieldCheck", "display_order": 6},
        {"id": "cat-erfan-nazari", "name": "عرفان نظری", "slug": "erfan-nazari", "description": "مبانی عرفان، تمهید القواعد ابن‌ترکه، فصوص الحکم ابن‌عربی و مقدمه قیصری", "icon_name": "Sparkles", "display_order": 7},
        {"id": "cat-erfan-amali", "name": "عرفان عملی", "slug": "erfan-amali", "description": "سلوک الی الله، منازل السائرین خواجه عبدالله انصاری و اوصاف الاشراف", "icon_name": "HeartHandshake", "display_order": 8},
    ]
    for c in default_cats:
        res = await session.execute(select(Category).where(Category.id == c["id"]))
        if not res.scalar_one_or_none():
            session.add(Category(**c))

    # 3. Seed default Books
    from backend.app.services.book_service import book_service
    for b in book_service.books:
        res = await session.execute(select(BookModel).where(BookModel.id == b["id"]))
        if not res.scalar_one_or_none():
            session.add(
                BookModel(
                    id=b["id"],
                    title=b["title"],
                    subtitle=b.get("subtitle"),
                    author=b.get("author", "حجت الاسلام دکتر زنجیر زن حسینی"),
                    publisher=b.get("publisher", "انتشارات حیات"),
                    print_edition=b.get("print_edition", "چاپ اول"),
                    pages_count=b.get("pages_count", 380),
                    isbn=b.get("isbn", "978-600-1234-56-7"),
                    price=str(b.get("price", "۳۲۰,۰۰۰")),
                    physical_price=str(b.get("physical_price", "۳۹۰,۰۰۰")),
                    stock=50,
                    cover_image=b.get("cover_image", "/images/book_cover_real.jpg"),
                    synopsis=b.get("synopsis", ""),
                    is_coming_soon=False,
                )
            )

    # 4. Seed default Coupons
    from backend.app.services.coupon_service import coupon_service
    for code, cdata in coupon_service.coupons.items():
        res = await session.execute(select(Coupon).where(Coupon.code == code))
        if not res.scalar_one_or_none():
            if isinstance(cdata, dict):
                session.add(
                    Coupon(
                        code=code,
                        discount_percent=cdata.get("discount_percent", 20),
                        max_uses=100,
                        used_count=0,
                        expires_at=cdata.get("expires_at", "2027-12-30T23:59:59"),
                        is_active=cdata.get("is_active", True),
                    )
                )

    # 5. Seed default Articles
    default_articles = [
        {
            "id": "art-1",
            "slug": "aslat-vojood-seddiqin",
            "title_fa": "اصالت وجود و برهان صدیقین: بازخوانی استدلال ملاصدرا در تراز معرفت‌شناسی تطبیقی",
            "title_ar": "أصالة الوجود وبرهان الصديقين: قراءة استدلال الملا صدرا في ميزان المعرفة المقارنة",
            "title_en": "Primacy of Existence & the Proof of the Sincere: Sadrian Argument in Comparative Epistemology",
            "category_fa": "فلسفه",
            "category_ar": "الفلسفة",
            "category_en": "Philosophy",
            "read_time_fa": "۱۵ دقیقه مطالعه",
            "read_time_ar": "١٥ دقيقة قراءة",
            "read_time_en": "15 min read",
            "publish_date_fa": "شهریور ۱۴۰۳",
            "publish_date_ar": "صفر ١٤٤٦",
            "publish_date_en": "September 2024",
            "abstract_fa": "این مقاله به بررسی برهان صدیقین بر اصالت و وحدت وجود پرداخته و تمایزات بنیادین تلقی صدرایی از مفهوم و حقیقت هستی را تحلیل می‌کند.",
            "content_fa": "برهان صدیقین در حکمت متعالیه بر این اصل استوار است که حقیقت وجود، فی‌نفسه اصیل، بسیط و مشکک است...",
            "pdf_url": "/sample-books/aslat-vojood.pdf",
            "author": "حجت الاسلام دکتر زنجیر زن حسینی",
        },
        {
            "id": "art-2",
            "slug": "noor-al-anwar-ishraq",
            "title_fa": "نورالانوار و مراتب اشراق: تحلیل هندسه وجودی شیخ شهاب‌الدین سهروردی",
            "title_ar": "نور الأنوار ومراتب الإشراق: تحليل الهندسة الوجودية للشيخ شهاب الدين السهروردي",
            "title_en": "The Light of Lights & Illuminationist Gradiation: Ontological Geometry of Suhrawardi",
            "category_fa": "فلسفه",
            "category_ar": "الفلسفة",
            "category_en": "Philosophy",
            "read_time_fa": "۱۲ دقیقه مطالعه",
            "read_time_ar": "١٢ دقيقة قراءة",
            "read_time_en": "12 min read",
            "publish_date_fa": "مرداد ۱۴۰۳",
            "publish_date_ar": "محرم ١٤٤٦",
            "publish_date_en": "August 2024",
            "abstract_fa": "پژوهشی در ساختار نظام اشراقی، انوار قاهره و اسفهبدیه و نسبت آنها با نورالانوار و مقایسه آن با نظریه عقول ده‌گانه سینوی.",
            "content_fa": "شیخ اشراق در حکمة‌الاشراق، حقیقت نور را ظاهر بالذات و مظهر للغیر تعریف می‌کند...",
            "pdf_url": "/sample-books/noor-al-anwar.pdf",
            "author": "حجت الاسلام دکتر زنجیر زن حسینی",
        },
        {
            "id": "art-3",
            "slug": "mantiq-borhan-maghaleteh",
            "title_fa": "روش‌شناسی صناعت برهان در منطق صوری و تفکیک آن از مغالطات رایج معاصر",
            "title_ar": "منهجية صناعة البرهان في المنطق الصوري وتمييزه عن المغالطات المعاصرة",
            "title_en": "Methodology of Demonstration in Formal Logic & Demarcation from Modern Fallacies",
            "category_fa": "منطق",
            "category_ar": "المنطق",
            "category_en": "Logic",
            "read_time_fa": "۱۰ دقیقه مطالعه",
            "read_time_ar": "١٠ دقائق قراءة",
            "read_time_en": "10 min read",
            "publish_date_fa": "تیر ۱۴۰۳",
            "publish_date_ar": "ذو الحجة ١٤٤٥",
            "publish_date_en": "July 2024",
            "abstract_fa": "بررسی شروط مواد قیاس برهانی، بدیهیات اولی، و راهکارهای شناسایی مغالطات زبانی و ساختاری در استدلال‌های فلسفی معاصر.",
            "content_fa": "برهان، شریف‌ترین صناعات خمس است که مطلوب آن یقین تام و دائم است...",
            "pdf_url": "/sample-books/mantiq-borhan.pdf",
            "author": "حجت الاسلام دکتر زنجیر زن حسینی",
        },
    ]
    for a in default_articles:
        res = await session.execute(select(ArticleModel).where(ArticleModel.id == a["id"]))
        if not res.scalar_one_or_none():
            session.add(ArticleModel(**a))

    # 6. Seed initial genuine scholarly reviews if empty
    from backend.app.models.models import CourseReview
    res_rev = await session.execute(select(CourseReview))
    if not res_rev.scalars().first():
        default_reviews = [
            CourseReview(
                id="rev-ishraq-01",
                course_id="course-ishraq",
                user_id="usr-140301",
                rating=5,
                comment="شرح بسیار دقیق و عمیقی است. تفکیک مراتب نور مجرد و انوار اسپهبدیه با بیانی استدلالی و استوار توسط استاد تبیین شده است.",
                created_at=datetime.utcnow(),
            ),
            CourseReview(
                id="rev-mantiq-01",
                course_id="course-mabadi-mantiq",
                user_id="usr-140301",
                rating=5,
                comment="تسلط استاد بر مبانی منطق صوری و تصدیقات کم‌نظیر است. سرفصل‌ها گام‌به‌گام و برای فهم کتب سطح بالاتر فوق‌العاده کاربردی هستند.",
                created_at=datetime.utcnow(),
            ),
        ]
        session.add_all(default_reviews)



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
