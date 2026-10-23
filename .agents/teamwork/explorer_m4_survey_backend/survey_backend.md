# گزارش جامع بررسی زیرسیستم بک‌اند: ثبت‌نام دوره‌ها و سفارش‌ها (Backend Survey Report)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**نگارش:** کاوشگر ارشد بک‌اند (`explorer_m4_survey_backend`)  
**تاریخ ارزیابی:** ۲۱ مهر ۱۴۰۵ (2026-10-13)  
**محدوده بررسی:** مدل‌های داده، نشست‌های پایگاه داده، مسیریاب‌های API، سرویس‌ها، مدیریت خطاها و آزمون‌های یکپارچگی  

---

## ۱. چکیده مدیریتی (Executive Summary)

این سند تحلیل فنی و کالبدشکافی دقیق زیرسیستم بک‌اند پلتفرم را برای پیاده‌سازی ثبت‌نام پایدار دوره‌ها (Course Enrollment) و پردازش سفارش‌های سبد خرید (Orders) ارائه می‌دهد. در حال حاضر، احراز هویت پایدار دانشجویان در دیتابیس SQLite (`zanjirzan_platform.db`) فعال است، اما تراکنش‌های ثبت‌نام دوره‌ها و سفارش‌ها همچنان در فرانت‌اند وابسته به مقادیر پیش‌فرض `localStorage` بوده و اندپوینت‌های ثبت‌نام (`/enroll`) و دریافت دوره‌های ثبت‌نام‌شده (`/enrolled`) در لایه بک‌اند غایب هستند. علاوه بر این، یک تله ساختاری کلیدی در پایگاه داده شناسایی شد: جدول `courses` در دیتابیس با وجود ایجاد اسکیما، فاقد رکوردهای پیش‌فرض است؛ بنابراین به دلیل فعال بودن قید کلید خارجی SQLite (`PRAGMA foreign_keys=ON;`)، هرگونه درج مستقیم در جدول `enrollments` با خطای یکپارچگی مواجه خواهد شد مگر اینکه همگام‌سازی و بذرگذاری دوره‌ها هم‌زمان در `init_db()` مستقر شود.

---

## ۲. تحلیل وضعیت فعلی کدها و مولفه‌ها (Current State Architectural Audit)

### ۲.۱. مدل‌های داده (`backend/app/models/models.py`)

1. **مدل `User`:**
   - فیلدهای `id`, `mobile` (با نام مترادف `phone`), `email`, `full_name`, `hashed_password`, `role` (`student` | `admin`), `wallet_balance`, `avatar_url`, `is_active`, `created_at`.
   - رابطه `enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")`.
   - متد `to_dict()`: تعداد دوره‌ها (`enrolled_courses_count`) را در صورت لود بودن محاسبه می‌کند، اما شناسه دوره‌های ثبت‌نام‌شده (`enrolled_course_ids`) را برنمی‌گرداند.
   - **نقص:** رابطه با سفارش‌ها (`orders`) تعریف نشده است.

2. **مدل `Course`:**
   - فیلدهای `id`, `category_id`, `title_fa`, `slug`, `course_type`, `desc_fa`, `author_name`, `level`, `capacity`, `enrolled_count`, `skyroom_url`, `schedule`, `cover_image`, `total_duration_hours`, `is_published`, `created_at`.
   - روابط: `category`, `lessons`, `enrollments`.
   - **وضعیت در دیتابیس:** جدول `courses` در دیتابیس `zanjirzan_platform.db` دقیقاً ۰ رکورد دارد (خالی است).

3. **مدل `Lesson`:**
   - فیلدهای `id`, `course_id`, `session_number`, `title_fa`, `audio_url`, `duration_seconds`, `audio_size_mb`, `is_free_sample`, `created_at`.
   - رابطه: `course = relationship("Course", back_populates="lessons")`.

4. **مدل `Enrollment`:**
   - فیلدهای `id`, `user_id` (کلید خارجی به `users.id`), `course_id` (کلید خارجی به `courses.id`), `enrolled_at`, `status` (پیش‌فرض: `active`).
   - روابط: `user`, `course`.
   - **نقص:** قید یکتایی ترکیبی `UniqueConstraint("user_id", "course_id")` در سطح `__table_args__` تعریف نشده است که می‌تواند در شرایط همروندی (Concurrency) ریسک درج تکراری ایجاد کند.

5. **مدل‌های `Order` و `OrderItem`:**
   - **غایب کامل در ORM:** هیچ کلاسی برای `Order` یا `OrderItem` در `models.py` تعریف نشده است و جدول `orders` در دیتابیس وجود ندارد.

---

### ۲.۲. مدیریت نشست و راه‌اندازی دیتابیس (`backend/app/models/database.py`)

- **موتور و ارتباط:** موتور ناهمگام SQLAlchemy (`AsyncSession`) روی دیتابیس SQLite (`zanjirzan_platform.db`) با پیکربندی WAL:
  ```python
  PRAGMA journal_mode=WAL;
  PRAGMA foreign_keys=ON;
  ```
- **تزریق وابستگی `get_db`:** نشست را باز کرده، در پایان بلاک تراکنش را `commit` و در صورت بروز استثنا `rollback` می‌کند.
- **راه‌اندازی اولیه (`init_db`):** جداول با `Base.metadata.create_all` ایجاد می‌شوند و سپس متد `seed_default_users()` اجرا می‌شود (حساب دانشجویی `09123456789` و حساب استاد/مدیر `09120000000`).
- **یافته حیاتی:** متد `seed_default_courses()` در این فایل وجود ندارد؛ بنابراین جدول `courses` خالی می‌ماند.

---

### ۲.۳. اندپوینت‌های دوره‌ها (`backend/app/api/v1/endpoints/courses.py`)

- اندپوینت‌های موجود:
  - `GET /api/v1/courses/`: دریافت لیست تمام دوره‌ها از حافظه موقت `course_service`.
  - `GET /api/v1/courses/{course_id}`: دریافت جزئیات دوره بر اساس شناسه.
  - `POST /api/v1/courses/{course_id}/progress`: همگام‌سازی پیشرفت پخش صوت دانشجو.
- **وضعیت ثبت‌نام:**
  - آیا `POST /api/v1/courses/{course_id}/enroll` وجود دارد؟ **خیر.**
  - آیا `GET /api/v1/courses/enrolled` وجود دارد؟ **خیر.**

---

### ۲.۴. اندپوینت‌های سفارش‌ها (`backend/app/api/v1/endpoints/orders.py`)

- اندپوینت‌های موجود:
  - `POST /api/v1/orders/create`: ثبت سفارش و تولید بارکد ۲۴ رقمی پست پیشتاز.
  - `GET /api/v1/orders/{order_id}`: رهگیری سفارش با شناسه.
  - `GET /api/v1/orders/track/{tracking_code}`: رهگیری سفارش با کد رهگیری یا بارکد.
- **مشکلات اساسی:**
  1. تابع `create_order` به صورت همگام (`def`) نوشته شده و اصل `async def` (قانون عملکرد) را نقض کرده است.
  2. فاقد وابستگی احراز هویت دانشجو (`get_current_user` یا `get_optional_user`) است؛ بنابراین سفارش به کاربر جاری متصل نمی‌شود.
  3. فاقد وابستگی `db: AsyncSession` است و منحصراً سفارش را در یک دیکشنری در حافظه رَم (`order_service.orders`) ذخیره می‌کند.
  4. هیچ رکوردی در جدول `enrollments` برای دوره‌های خریداری‌شده ثبت نمی‌کند.

---

### ۲.۵. سرویس احراز هویت و نمایه کاربر (`backend/app/services/auth_service.py` و `auth.py`)

- متد `get_user_by_id(user_id, db)`: کاربر را از دیتابیس واکشی و `user.to_dict()` را بازمی‌گرداند.
- متد `to_dict()` در مدل `User`:
  ```python
  if "enrollments" in self.__dict__ and self.enrollments is not None:
      count = len(self.enrollments)
  else:
      count = 0
  ```
- چون کوئری `select(User).where(User.id == actual_user_id)` بدون `selectinload(User.enrollments)` اجرا می‌شود، رابطه `enrollments` لود نشده و مقدار `enrolled_courses_count` همواره عدد ۰ بازگردانده می‌شود.
- در اندپوینت `GET /api/v1/auth/me`، هیچ لیستی از `enrolled_course_ids` وجود ندارد.

---

### ۲.۶. مدیریت استثناها و ساختار پیام‌های فارسی (`backend/app/core/exceptions.py`)

- کلاس پایه `AppException(message, code, status_code)`.
- گرداننده مرکزی `app_exception_handler` در `main.py` رجیستر شده است:
  ```json
  {
    "success": false,
    "error_code": "...",
    "message": "...",
    "path": "/api/v1/..."
  }
  ```
- پیام خطای ثبت‌نام مجدد در دوره باید با کد وضعیت HTTP 400 و به صورت ساختاریافته مطابق با مانیفست نگارش فارسی بازگردانده شود:
  «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.»

---

## ۳. یافته‌های کالبدشکافی و آسیب‌پذیری‌های پنهان (Forensic Findings)

| ردیف | موضوع | وضعیت فعلی | پیامد و ریسک در صورت عدم اصلاح | راهکار الزامی |
|:---:|:---|:---|:---|:---|
| ۱ | **قید کلید خارجی دوره‌ها** | جدول `courses` در SQLite خالی است. | درج رکورد در `enrollments` خطای `FOREIGN KEY constraint failed` می‌دهد. | افزودن متد بذرگذاری `seed_default_courses` در `init_db`. |
| ۲ | **قید یکتایی ثبت‌نام** | فاقد UniqueConstraint روی `(user_id, course_id)`. | امکان ثبت‌نام تکراری در شرایط درخواست‌های هم‌زمان. | افزودن قید یکتایی به مدل و بررسی در سطح سرویس با کد ۴۰۰. |
| ۳ | **اندپوینت `/enroll`** | در `courses.py` وجود ندارد. | فرانت‌اند امکان ثبت‌نام زنده ندارد. | ایجاد اندپوینت `POST /api/v1/courses/{course_id}/enroll`. |
| ۴ | **اندپوینت `/enrolled`** | در `courses.py` وجود ندارد. | داشبورد دانشجو دوره‌های فعال را دریافت نمی‌کند. | ایجاد اندپوینت `GET /api/v1/courses/enrolled`. |
| ۵ | **ناهمگام نبودن `/orders/create`** | تابع `def` همگام بدون اتصال به دیتابیس و بدون کاربر. | عدم ثبت دوره‌های سبد خرید در ثبت‌نام‌های کاربر. | تبدیل به `async def`، دریافت کاربر و درج در جدول `enrollments`. |
| ۶ | **همگام‌سازی نمایه در `/me`** | مدل `UserResponse` فاقد `enrolled_course_ids` است. | فرانت‌اند پس از رفرش صفحه وضعیت ثبت‌نام را از دست می‌دهد. | افزودن `enrolled_course_ids` به اسکیما و کوئری `/me`. |

---

## ۴. طرح تفصیلی پیاده‌سازی گام‌به‌گام (Concrete Implementation Blueprint)

### گام اول: اصلاح و تکمیل مدل‌های داده (`backend/app/models/models.py`)

1. **افزودن قید یکتایی به `Enrollment`:**
   ```python
   from sqlalchemy import UniqueConstraint

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
   ```

2. **تعریف مدل‌های `Order` و `OrderItem`:**
   ```python
   class Order(Base):
       __tablename__ = "orders"

       id = Column(String(50), primary_key=True, index=True)
       user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
       tracking_number = Column(String(50), unique=True, index=True, nullable=False)
       status = Column(String(30), default="processing")
       total_amount = Column(Integer, default=0)
       items_count = Column(Integer, default=1)
       shipping_address = Column(Text, nullable=True)
       postal_code = Column(String(20), nullable=True)
       recipient_name = Column(String(100), nullable=True)
       recipient_phone = Column(String(20), nullable=True)
       postal_barcode_24digit = Column(String(50), nullable=True)
       created_at = Column(DateTime, default=datetime.utcnow)

       items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
       user = relationship("User", back_populates="orders")


   class OrderItem(Base):
       __tablename__ = "order_items"

       id = Column(String(50), primary_key=True, index=True)
       order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
       item_id = Column(String(50), nullable=False)
       item_type = Column(String(30), default="course")
       title = Column(String(255), nullable=False)
       price = Column(Integer, default=0)
       quantity = Column(Integer, default=1)

       order = relationship("Order", back_populates="items")
   ```

3. **به‌روزرسانی روابط مدل `User`:**
   ```python
   orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
   ```

---

### گام دوم: بذرگذاری خودکار دوره‌ها در دیتابیس (`backend/app/models/database.py`)

افزودن تابع `seed_default_courses(session)` برای تضمین وجود دوره‌های اصلی در دیتابیس پیش از هر ثبت‌نام:
```python
async def seed_default_courses(db: Optional[AsyncSession] = None):
    """
    Seeds baseline catalog courses from CourseService into SQLite database to satisfy FK constraints.
    Idempotent: skips existing courses.
    """
    from backend.app.models.models import Course
    from backend.app.services.course_service import course_service

    async def _seed_courses_tx(session: AsyncSession):
        for c in course_service.courses:
            res = await session.execute(select(Course).where(Course.id == c["id"]))
            if not res.scalar_one_or_none():
                new_c = Course(
                    id=c["id"],
                    title_fa=c["title"],
                    slug=c["slug"],
                    course_type="offline",
                    desc_fa=c.get("description", ""),
                    author_name=c.get("instructor", "حجت الاسلام دکتر زنجیر زن حسینی"),
                    level=c.get("level", "سطوح عالی و خارج"),
                    is_published=True,
                )
                session.add(new_c)

    if db is None:
        async with async_session() as session:
            await _seed_courses_tx(session)
            await session.commit()
    else:
        await _seed_courses_tx(db)
        await db.flush()
```
فراخوانی `await seed_default_courses()` در انتهای متد `init_db()`.

---

### گام سوم: ارتقای اسکیماها (`backend/app/schemas/`)

1. **در `backend/app/schemas/course.py`:**
   ```python
   class CourseEnrollResponse(BaseModel):
       success: bool = True
       message: str
       enrollment_id: str
       course_id: str
       enrolled_at: str
       status: str = "active"


   class EnrolledCoursesResponse(BaseModel):
       total: int
       items: List[CourseDetailSchema]
   ```

2. **در `backend/app/schemas/auth.py`:**
   افزودن فیلد `enrolled_course_ids` به اسکیما:
   ```python
   class UserResponse(BaseModel):
       id: str = Field(..., example="usr-140301")
       full_name: str = Field(..., example="Ali Mousavi")
       phone: str = Field(..., example="09123456789")
       role: str = Field(..., example="student")
       wallet_balance: str = Field(..., example="350,000 Tomans")
       enrolled_courses_count: int = Field(..., example=2)
       enrolled_course_ids: List[str] = Field(default_factory=list, example=["course-mabadi-mantiq"])
       access_token: Optional[str] = None
   ```

---

### گام چهارم: پیاده‌سازی متدهای ثبت‌نام در لایه سرویس (`course_service.py` و `auth_service.py`)

1. **در `CourseService`:**
   ```python
   async def enroll_student(self, db: AsyncSession, user_id: str, course_id: str) -> Dict[str, Any]:
       # ۱. بررسی وجود دوره در کاتالوگ
       course = self.get_course_by_id(course_id)
       course_title = course.get("title", course_id)

       # ۲. اطمینان از وجود دوره در جدول دیتابیس جهت برقراری قید کلید خارجی
       course_row = await db.execute(select(Course).where(Course.id == course_id))
       if not course_row.scalar_one_or_none():
           db_course = Course(
               id=course_id,
               title_fa=course_title,
               slug=course.get("slug", course_id),
               author_name=course.get("instructor", "حجت الاسلام دکتر زنجیر زن حسینی"),
               desc_fa=course.get("description", ""),
               level=course.get("level", "سطوح عالی و خارج"),
               is_published=True,
           )
           db.add(db_course)
           await db.flush()

       # ۳. بررسی ثبت‌نام قبلی فعال
       res = await db.execute(
           select(Enrollment).where(
               Enrollment.user_id == user_id,
               Enrollment.course_id == course_id,
               Enrollment.status == "active"
           )
       )
       existing = res.scalar_one_or_none()
       if existing:
           raise AppException(
               message=f"شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.",
               code="DUPLICATE_ENROLLMENT",
               status_code=400,
           )

       # ۴. ثبت رکورد جدید در دیتابیس
       enrollment_id = f"enr-{uuid.uuid4().hex[:8]}"
       now = datetime.utcnow()
       enrollment = Enrollment(
           id=enrollment_id,
           user_id=user_id,
           course_id=course_id,
           status="active",
           enrolled_at=now,
       )
       db.add(enrollment)
       await db.flush()

       return {
           "success": True,
           "message": f"ثبت‌نام شما در دوره «{course_title}» با موفقیت انجام شد.",
           "enrollment_id": enrollment_id,
           "course_id": course_id,
           "enrolled_at": now.isoformat(),
           "status": "active",
       }

   async def get_enrolled_courses_for_user(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
       res = await db.execute(
           select(Enrollment.course_id).where(
               Enrollment.user_id == user_id,
               Enrollment.status == "active"
           )
       )
       enrolled_ids = [row[0] for row in res.fetchall()]
       enrolled_courses = []
       for cid in enrolled_ids:
           try:
               enrolled_courses.append(self.get_course_by_id(cid))
           except Exception:
               pass
       return enrolled_courses
   ```

2. **در `AuthService.get_user_by_id`:**
   کوئری را به گونه‌ای ارتقا می‌دهیم که `enrolled_course_ids` را همراه با پروفایل استخراج کند:
   ```python
   enr_res = await actual_db.execute(
       select(Enrollment.course_id).where(
           Enrollment.user_id == actual_user_id,
           Enrollment.status == "active"
       )
   )
   enrolled_ids = [row[0] for row in enr_res.fetchall()]
   user_data = user.to_dict(enrolled_courses_count=len(enrolled_ids))
   user_data["enrolled_course_ids"] = enrolled_ids
   return user_data
   ```

---

### گام پنجم: استقرار اندپوینت‌ها در روترها (`courses.py` و `orders.py`)

1. **در `backend/app/api/v1/endpoints/courses.py`:**
   - افزودن اندپوینت ثبت‌نام دوره:
     ```python
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
     ```
   - افزودن اندپوینت دوره‌های فعال دانشجو:
     ```python
     @router.get("/enrolled", response_model=List[CourseDetailSchema], summary="Get enrolled courses of current student")
     async def get_enrolled_courses(
         user: dict = Depends(get_current_user),
         db: AsyncSession = Depends(get_db),
     ):
         """
         Retrieves all active courses unlocked for the current student.
         """
         return await course_service.get_enrolled_courses_for_user(db=db, user_id=user["id"])
     ```

2. **در `backend/app/api/v1/endpoints/orders.py`:**
   - تبدیل `create_order` به `async def` و پذیرش وابستگی کاربر اختیاری:
     ```python
     @router.post("/create", response_model=OrderSummaryResponse, summary="Create a new order")
     async def create_order(
         req: CreateOrderRequest,
         user: Optional[dict] = Depends(get_optional_user),
         db: AsyncSession = Depends(get_db),
     ):
         raw_items = [i.model_dump() for i in req.items]
         return await order_service.create_order_tx(
             items=raw_items,
             shipping_address=req.shipping_address,
             postal_code=req.postal_code,
             recipient_name=req.recipient_name,
             recipient_phone=req.recipient_phone,
             coupon_code=req.coupon_code,
             user=user,
             db=db,
         )
     ```
   - در صورت وجود آیتم‌های دوره (`item_type == "course"` یا شناسه دارای پیشوند `course-`) و حضور کاربر احراز هویت شده، ثبت‌نام‌های دوره بلافاصله در جدول `enrollments` درج و فعال می‌شوند.

---

## ۵. راهبرد اعتبارسنجی و آزمون‌های یکپارچگی (Verification & Test Strategy)

برای حصول اطمینان ۱۰۰٪ از صحت پیاده‌سازی و عدم رگرسیون، آزمون‌های زیر در `backend/tests/test_in_memory.py` تعبیه خواهند شد:

1. **تست `test_course_enrollment_persistence()`:**
   - ورود به عنوان دانشجو با توکن معتبر.
   - پاکسازی رکوردهای احتمالی قبلی برای دوره `course-mabadi-mantiq`.
   - فراخوانی `POST /api/v1/courses/course-mabadi-mantiq/enroll` و بررسی کد ۲۰۰ و درج در دیتابیس SQLite.
   - فراخوانی مجدد همان اندپوینت و بررسی بازگشت کد ۴۰۰ با پیام خطای فارسی `DUPLICATE_ENROLLMENT`.
   - بررسی عدم افزایش رکوردهای جدول `enrollments` در دیتابیس (عدم ثبت تکراری).
   - فراخوانی `GET /api/v1/courses/enrolled` و اطمینان از بازگشت دوره ثبت‌نام‌شده.
   - فراخوانی `GET /api/v1/auth/me` و تایید بازگشت شناسه دوره در `enrolled_course_ids` و عدد صحیح در `enrolled_courses_count`.

2. **تست `test_checkout_order_auto_enrollment()`:**
   - فراخوانی `POST /api/v1/orders/create` با توکن کاربر و آیتم دوره‌ای `course-bidayat`.
   - بررسی کد ۲۰۰، تولید شماره سفارش و درج هم‌زمان در جدول `enrollments`.
   - تایید آنی دسترسی کاربر به دوره `course-bidayat` در `/api/v1/courses/enrolled`.

3. **اجرای گیت کیفیت کلی:**
   - `& backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py` -> پاس شدن ۱۰۰٪
   - `& backend/.venv/Scripts/python.exe audit_pipeline.py` -> نمره ۱۰۰ از ۱۰۰

---

## ۶. نتیجه‌گیری و گام‌های بعدی
تمامی اجزا، مدل‌ها، وابستگی‌ها، مسیرها و تله‌های سیستمی تحلیل و مستند شدند. با اجرای طرح فوق در فاز پیاده‌سازی، ارتباط فرانت‌اند و بک‌اند به صورت کاملاً پایدار، اتمیک (ACID) و منطبق با استانداردهای ضد اسلاپ و مهندسی پروژه برقرار خواهد شد.
