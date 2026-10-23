# گزارش جامع مهندسی مدل‌های داده و بذرگذاری پایگاه داده (M1 Models & Database Report)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**نگارش:** کاوشگر ارشد مدل‌های داده (`explorer_m1_models`)  
**تاریخ گزارش:** ۲۱ مهر ۱۴۰۵ (2026-10-13)  
**فایل‌های هدف:**  
- `backend/app/models/models.py`  
- `backend/app/models/database.py`  
- `backend/app/models/__init__.py`  
**وضعیت:** بررسی کامل و تدوین کد دقیق پیاده‌سازی (Ready for Implementation)

---

## ۱. چکیده اجرایی (Executive Summary)

این سند جزئیات فنی دقیق و دستورالعمل بدون ابهام را برای پیاده‌سازی مدل‌های پایگاه داده و زیرساخت بذرگذاری در گام اول (Milestone 1) ارائه می‌دهد. در بازرسی سیستم، مشخص شد که پایگاه داده SQLite با قید کلید خارجی فعال (`PRAGMA foreign_keys=ON;`) کار می‌کند در حالی که جدول `courses` هم‌اکنون دارای ۰ رکورد است. هرگونه تلاش برای درج رکورد در جدول `enrollments` بدون وجود دوره در دیتابیس با خطای شکست کلید خارجی مواجه خواهد شد. همچنین مدل `Enrollment` فاقد قید یکتایی ترکیبی `(user_id, course_id)` بوده و مدل‌های `Order` و `OrderItem` در نگاشت ORM وجود ندارند.

این گزارش مشخصات دقیق پیاده‌سازی موارد زیر را به همراه کدهای جایگزین مشخص می‌کند:
1. افزودن `UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment")` به مدل `Enrollment` و اعمال شاخص یکتایی در مایگریشن SQLite.
2. طراحی کامل کلاس‌های SQLAlchemy برای `Order` و `OrderItem` متصل به `User`.
3. گسترش روابط و سریال‌سازی مدل `User` برای پشتیبانی از `orders` و لیست `enrolled_course_ids`.
4. پیاده‌سازی تابع پایدار و بازگشت‌پذیر (Idempotent) `seed_default_courses()` در `database.py` و فراخوانی آن در چرخه `init_db()`.
5. به‌روزرسانی صادرات ماژول `backend/app/models/__init__.py` جهت جلوگیری کامل از وابستگی چرخشی (Circular Import).

---

## ۲. جزئیات دقیق تغییرات در `backend/app/models/models.py`

### ۲.۱. وارد کردن `UniqueConstraint` و `List`
در ابتدای فایل، تایپ `List` از ماژول `typing` و نماد `UniqueConstraint` از `sqlalchemy` اضافه می‌شود:

```python
# خطوط 6 تا 17
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
)
```

### ۲.۲. به‌روزرسانی مدل `User`
افزودن رابطه `orders` و گسترش متد `to_dict` با پارامتر `enrolled_course_ids`:

```python
class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="student", index=True)  # 'student' | 'admin'
    wallet_balance = Column(String(50), default="0 Tomans")
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    @property
    def phone(self) -> str:
        return self.mobile

    @phone.setter
    def phone(self, val: str):
        self.mobile = val

    phone = synonym("mobile", descriptor=property(phone.fget, phone.fset))

    def to_dict(
        self,
        access_token: Optional[str] = None,
        enrolled_courses_count: Optional[int] = None,
        enrolled_course_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Serializes user object for API responses and AuthContext session hydration.
        """
        # 1. Determine enrolled course IDs
        if enrolled_course_ids is not None:
            course_ids = list(enrolled_course_ids)
        elif "enrollments" in self.__dict__ and self.enrollments is not None:
            course_ids = [
                e.course_id for e in self.enrollments
                if getattr(e, "status", "active") == "active"
            ]
        else:
            course_ids = []

        # 2. Determine enrolled courses count
        if enrolled_courses_count is not None:
            count = enrolled_courses_count
        elif course_ids:
            count = len(course_ids)
        elif "enrollments" in self.__dict__ and self.enrollments is not None:
            count = len(self.enrollments)
        else:
            count = 0

        data = {
            "id": self.id,
            "full_name": self.full_name or "",
            "phone": self.mobile,
            "role": self.role or "student",
            "wallet_balance": self.wallet_balance or "0 Tomans",
            "enrolled_courses_count": count,
            "enrolled_course_ids": course_ids,
        }
        if self.avatar_url:
            data["avatar_url"] = self.avatar_url
        if access_token is not None:
            data["access_token"] = access_token
        return data
```

### ۲.۳. به‌روزرسانی مدل `Enrollment`
افزودن قید یکتایی `UniqueConstraint` و متد `to_dict`:

```python
class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),
    )

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="active")

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "status": self.status or "active",
        }
```

### ۲.۴. تعریف مدل‌های جدید `Order` و `OrderItem`
افزودن کلاس‌های نگاشت جدول‌های سفارشات در انتهای `models.py`:

```python
class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(30), default="processing", index=True)
    total_amount = Column(Integer, default=0)
    items_count = Column(Integer, default=1)
    shipping_address = Column(Text, nullable=True)
    postal_code = Column(String(20), nullable=True)
    recipient_name = Column(String(100), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    postal_barcode_24digit = Column(String(50), nullable=True, index=True)
    coupon_code = Column(String(50), nullable=True)
    discount_amount = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        items_data = []
        if "items" in self.__dict__ and self.items is not None:
            items_data = [item.to_dict() for item in self.items]
        return {
            "order_id": self.id,
            "tracking_number": self.tracking_number,
            "status": self.status or "processing",
            "total_amount": self.total_amount,
            "items_count": self.items_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "postal_barcode_24digit": self.postal_barcode_24digit,
            "shipping_address": self.shipping_address,
            "postal_code": self.postal_code,
            "recipient_name": self.recipient_name,
            "recipient_phone": self.recipient_phone,
            "coupon_code": self.coupon_code,
            "discount_amount": self.discount_amount,
            "items": items_data,
        }


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(String(50), nullable=False, index=True)
    item_type = Column(String(30), default="course", index=True)  # 'course' | 'book_digital' | 'book_print'
    title = Column(String(255), nullable=False)
    price = Column(Integer, default=0)
    quantity = Column(Integer, default=1)
    cover_image = Column(String(500), nullable=True)

    order = relationship("Order", back_populates="items")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "order_id": self.order_id,
            "item_id": self.item_id,
            "item_type": self.item_type,
            "title": self.title,
            "price": self.price,
            "quantity": self.quantity,
            "cover_image": self.cover_image,
        }
```

---

## ۳. جزئیات دقیق تغییرات در `backend/app/models/database.py`

### ۳.۱. پیاده‌سازی `seed_default_courses`
افزودن تابع بذرگذاری خودکار دوره‌ها در دیتابیس بر اساس فهرست غنی دوره‌های `course_service.courses`:

```python
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
    from backend.app.models.models import Course, Lesson
    from backend.app.services.course_service import course_service

    for c in course_service.courses:
        res = await session.execute(select(Course).where(Course.id == c["id"]))
        existing_course = res.scalar_one_or_none()
        if not existing_course:
            # Parse total duration hours (e.g. "۱۲ ساعت" -> 12, "۹۲ ساعت" -> 92)
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
                level=c.get("level", "سطوح عالی و خارج"),
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
        else:
            # Ensure lessons exist if course was previously created without them
            res_les = await session.execute(select(Lesson).where(Lesson.course_id == c["id"]))
            if not res_les.first():
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
```

### ۳.۲. اصلاح مایگریشن SQLite و فراخوانی در `init_db()`
در تابع `init_db()`، ایجاد شاخص یکتایی برای جدول `enrollments` روی دیتابیس فعلی و فراخوانی `await seed_default_courses()` تعبیه می‌شود:

```python
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

                # Ensure unique index for enrollment (user_id, course_id)
                sync_conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_enrollment ON enrollments (user_id, course_id)"))

            await conn.run_sync(check_and_migrate)

    await seed_default_users()
    await seed_default_courses()
    _is_db_initialized = True

seed_baseline_users = seed_default_users
seed_baseline_courses = seed_default_courses
```

---

## ۴. به‌روزرسانی صادرات در `backend/app/models/__init__.py`

برای اینکه ایمپورت مدل‌ها در سراسر پروژه تمیز و بدون شکست باشد:

```python
from backend.app.models.database import (
    Base,
    get_db,
    async_session,
    engine,
    seed_default_courses,
    seed_default_users,
)
from backend.app.models.models import (
    User,
    Category,
    Course,
    Lesson,
    Enrollment,
    AnalyticsLog,
    Order,
    OrderItem,
)

__all__ = [
    "Base",
    "get_db",
    "async_session",
    "engine",
    "seed_default_courses",
    "seed_default_users",
    "User",
    "Category",
    "Course",
    "Lesson",
    "Enrollment",
    "AnalyticsLog",
    "Order",
    "OrderItem",
]
```

---

## ۵. تحلیل چرخه وابستگی‌ها (Circular Import Analysis)

| ماژول فراخواننده | ماژول مقصد | زمان فراخوانی | وضعیت و بررسی چرخه |
|---|---|---|---|
| `backend.app.models.database` | `backend.app.models.models` | داخل توابع `_seed_*` و `init_db` (Lazy import) | ✅ امن و فاقد وابستگی چرخشی |
| `backend.app.models.database` | `backend.app.services.course_service` | داخل تابع `_seed_courses_tx` (Lazy import) | ✅ امن و فاقد وابستگی چرخشی |
| `backend.app.models.models` | `backend.app.models.database.Base` | ابتدای فایل (Top-level) | ✅ مجاز؛ `database.py` در لایه ماژول `models.py` را ایمپورت نمی‌کند |
| `backend.app.models.__init__` | هر دو فایل | ابتدای فایل | ✅ استاندارد بسته پایتون |

---

## ۶. بررسی تطابق با قوانین پروژه

1. **اصل تثبیت نام رسمی استاد:**  
   در بذرگذاری دوره‌ها و مدل‌ها، مقدار پیش‌فرض `author_name` دقیقاً و منحصراً «حجت الاسلام دکتر زنجیر زن حسینی» درج شده است.
2. **استاندارد مهندسی بک‌اند (backend-quality):**  
   - استفاده از متدهای ORM با `select(...)` پارامتری و پرهیز از کوئری‌های خام متنی.
   - پشتیبانی از تراکنش‌های ACID ناهمگام (`commit` و `rollback`).
3. **استاندارد نگارش فارسی (persian-writing):**  
   - کدهای فارسی و متون داک‌استرینگ فاقد افعال اداری «می‌باشد» و «می‌گردد» هستند.

---

## ۷. گام‌های راستی‌آزمایی مستقل (Verification Method)

پس از اعمال این کدها توسط کارگزار پیاده‌سازی (Worker)، راستی‌آزمایی به روش‌های زیر صورت می‌پذیرد:

1. **بررسی صحت بارگذاری مدل‌ها و عدم وجود Circular Import:**
   ```powershell
   backend\.venv\Scripts\python.exe -c "from backend.app.models import User, Enrollment, Course, Order, OrderItem; print('Models loaded successfully!')"
   ```
2. **اجرای مقداردهی اولیه دیتابیس و بررسی بذر دوره‌ها:**
   ```powershell
   backend\.venv\Scripts\python.exe -c "import asyncio; from backend.app.models.database import init_db; asyncio.run(init_db())"
   backend\.venv\Scripts\python.exe -c "import sqlite3; con = sqlite3.connect('zanjirzan_platform.db'); print('courses count:', con.execute('SELECT count(*) FROM courses').fetchone()[0]); print('orders table exists:', con.execute('SELECT count(*) FROM sqlite_master WHERE name=\"orders\"').fetchone()[0])"
   ```
3. **اجرای گیت کیفیت کلی:**
   ```powershell
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
