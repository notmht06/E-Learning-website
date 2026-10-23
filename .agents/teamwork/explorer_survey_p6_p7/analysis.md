# گزارش تحلیلی و بازرسی معماری بک‌اند و پایگاه داده (فازهای ۶ و ۷)
## سامانه جامع علمی حجت الاسلام دکتر زنجیر زن حسینی

**تاریخ بازرسی:** ۱۴ اکتبر ۲۰۲۶  
**دامنه بررسی:**
- فاز ۶: Event Loop Optimization، مدل‌های پایگاه داده، بهینه‌سازی کوئری‌ها با `selectinload`، مدل و جدول `UserFavorite`، و استریم صوت طبق استاندارد RFC 7233 Range.
- فاز ۷: امنیت پیشرفته پرداخت و مقابله با Replay Attack، اعتبارسنجی قیمت‌گذاری سمت سرور، استریم نمادین هوش مصنوعی با SSE (`text/event-stream`)، و کنترل دسترسی نقش‌محور (RBAC) با `get_current_admin`.

---

## ۱. ارزیابی مدل‌های پایگاه داده و تعامل با AsyncSession

### ۱.۱. وضعیت مدل `Enrollment` و نمایه‌های ترکیبی (Composite Indexes)
- **مسیر فایل:** `backend/app/models/models.py:155-179`
- **وضعیت فعلی:**
  در حال حاضر مدل `Enrollment` دارای قید یکتایی `UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment")` است و هر فیلد `user_id` و `course_id` به صورت مجزا دارای `index=True` است.
  در `backend/app/models/database.py:205` نیز کوئری `CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_enrollment ON enrollments (user_id, course_id)` اجرا می‌شود.
- **یافته و توصیه مهندسی:**
  برای ارتقای کارایی و سرعت در کوئری‌های بررسی وضعیت ثبت‌نام مانند:
  ```python
  select(Enrollment).where(Enrollment.user_id == user_id, Enrollment.course_id == course_id, Enrollment.status == "active")
  ```
  لازم است نمایه ترکیبی صریح در `__table_args__` تعریف شود:
  ```python
  __table_args__ = (
      UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),
      Index("ix_enrollments_user_course", "user_id", "course_id"),
      Index("ix_enrollments_user_course_status", "user_id", "course_id", "status"),
  )
  ```
  و در متد `check_and_migrate` در `backend/app/models/database.py` نیز تضمین شود:
  ```python
  sync_conn.execute(text("CREATE INDEX IF NOT EXISTS ix_enrollments_user_course ON enrollments (user_id, course_id)"))
  ```

---

### ۱.۲. وضعیت مدل و جدول `UserFavorite` (علاقه‌مندی‌ها)
- **مسیر فایل:** `backend/app/models/models.py`
- **یافته:**
  جدول یا مدل `UserFavorite` در کل پروژه وجود ندارد. این جدول برای پشتیبانی از زبانه علاقه‌مندی‌ها (Dribbble Favourite Tab) و نشانه‌گذاری دوره‌ها الزامی است.
- **طراحی پیشنهادی مدل `UserFavorite`:**
  ```python
  class UserFavorite(Base):
      __tablename__ = "user_favorites"
      __table_args__ = (
          UniqueConstraint("user_id", "course_id", name="uq_user_course_favorite"),
          Index("ix_user_favorites_user_course", "user_id", "course_id"),
      )

      id = Column(String(50), primary_key=True, index=True)
      user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
      course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
      created_at = Column(DateTime, default=datetime.utcnow)

      user = relationship("User", back_populates="favorites")
      course = relationship("Course", back_populates="favorited_by")

      def to_dict(self) -> Dict[str, Any]:
          return {
              "id": self.id,
              "user_id": self.user_id,
              "course_id": self.course_id,
              "created_at": self.created_at.isoformat() if self.created_at else None,
          }
  ```
- **روابط متقابل در سایر مدل‌ها:**
  - در کلاس `User`:
    ```python
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    ```
  - در کلاس `Course`:
    ```python
    favorited_by = relationship("UserFavorite", back_populates="course", cascade="all, delete-orphan")
    ```
- **همگام‌سازی DDL در `database.py`:**
  در تابع `init_db()` و بخش `check_and_migrate`:
  ```python
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
  ```
- **اندپوینت‌های تکمیلی مورد نیاز:**
  - `POST /api/v1/courses/{course_id}/favorite`: افزودن یا جابجایی وضعیت نشانه‌گذاری
  - `DELETE /api/v1/courses/{course_id}/favorite`: حذف از نشانه‌گذاری‌ها
  - `GET /api/v1/courses/favorites`: بازخوانی دوره‌های مورد علاقه دانش‌پژوه جاری

---

### ۱.۳. پایش پاکیزگی Event Loop و فراخوانی‌های همگام در اندپوینت‌ها
تمام ۱۲ فایل اندپوینت در `backend/app/api/v1/endpoints/` مورد ارزیابی قرار گرفتند:

| فایل اندپوینت | نوع تعریف توابع | وضعیت تعامل با دیتابیس / Event Loop | ملاحظات اصلاحی |
|---|---|---|---|
| `auth.py` | `async def` | ناهمگام کامل (`await db.execute`, `asyncio.to_thread` برای bcrypt) | کاملاً استاندارد و غیرمسدودکننده |
| `courses.py` | `async def` | تلفیق کاتالوگ حافظه و `AsyncSession` در متدهای ثبت‌نام | کاملاً ناهمگام، نیاز به `selectinload` در واکشی دوره‌ها |
| `orders.py` | `async def` (در `create_order`), `def` در بقیه | `create_order` کاملاً ناهمگام با `AsyncSession` است | تبدیل `get_order` و `track_order` به `async def` جهت تعامل با DB |
| `stream.py` | `async def` | جنریتور خواندن فایل `iter_file` در حال حاضر همگام است | اصلاح جنریتور با `async def` جهت استریم چانک‌ها بر روی Event Loop |
| `ai.py` | `async def` | فراخوانی همگام سرویس پردازش متن `ai_service.chat` | تجهیز به استریم SSE ناهمگام و محدودکننده نرخ توکن |
| `admin.py` | `async def` | فراخوانی‌های منطقی حافظه با `admin_service` | حفظ الگوی ناهمگام در صورت اتصال به دیتابیس |
| `payment.py` | `def` | عملیات همگام روی دیکشنری حافظه‌ای | تبدیل قطعی به `async def` همراه با تزریق `db: AsyncSession` و تراکنش دیتابیس |
| `books.py`, `cart.py`, `coupons.py`, `notes.py`, `qa.py` | `def` | در تردپول مجزا توسط استارلت اجرا می‌شوند | بدون مسدودسازی Event Loop، اما برای دسترسی‌های دیتابیس باید به `async def` مهاجرت کنند |

---

## ۲. ارزیابی بهینه‌سازی کوئری‌ها و کاربست `selectinload`

### ۲.۱. چالش N+1 Queries در روابط ORM
در SQLAlchemy 2.0 در محیط ناهمگام (`AsyncSession`)، فراخوانی روابط Lazy Loading منجر به خطای `MissingGreenlet` یا ایجاد کوئری‌های تکراری در حلقه (N+1 Queries) می‌شود.

### ۲.۲. موارد مشخص جهت اعمال `selectinload`:

1. **مدل `Course` و رابطه `lessons` / `category`:**
   - **فایل هدف:** `backend/app/services/course_service.py`
   - **محل اعمال:** هنگام واکشی دوره از دیتابیس یا واکشی دوره‌های ثبت‌نام‌شده:
     ```python
     from sqlalchemy.orm import selectinload

     stmt = (
         select(Course)
         .options(
             selectinload(Course.lessons),
             selectinload(Course.category),
         )
         .where(Course.id == course_id)
     )
     ```
   - **فایده:** تمام درس‌ها و دسته‌بندی در یک کوئری موازی و بهینه واکشی شده و از بارگذاری سرفصل‌ها به ازای هر درس جلوگیری می‌شود.

2. **مدل `Order` و رابطه `items`:**
   - **فایل هدف:** `backend/app/services/order_service.py`
   - **محل اعمال:** در متدهای پیگیری سفارش، دریافت جزئیات، یا بازخوانی سفارشات دانش‌پژوه:
     ```python
     stmt = (
         select(Order)
         .options(
             selectinload(Order.items),
             selectinload(Order.user),
         )
         .where(Order.id == order_id)
     )
     ```
   - **فایده:** متد `Order.to_dict()` مستقیماً بدون تأخیر و بدون کوئری‌های ثانویه، اقلام سبد خرید را سریالایز می‌کند.

3. **مدل `User` و رابطه `enrollments`:**
   - **فایل هدف:** `backend/app/services/auth_service.py`
   - **محل فعلی:** در متد `_fetch_user_with_enrollments` (خطوط ۲۵۸ تا ۲۷۴) دو کوئری مجزا اجرا می‌شود: یکی برای `User` و دیگری برای `Enrollment`.
   - **اصلاح با `selectinload`:**
     ```python
     stmt = (
         select(User)
         .options(selectinload(User.enrollments))
         .where(User.id == uid)
     )
     res = await session.execute(stmt)
     user = res.scalar_one_or_none()
     ```
   - **فایده:** کد درون `user.to_dict()` به طور خودکار `self.enrollments` را خوانده و نیاز به کوئری دوم را به کل منتفی می‌سازد.

4. **مدل `Enrollment` و دوره متناظر (`course`):**
   - **فایل هدف:** `backend/app/services/course_service.py:get_enrolled_courses_for_user`
   - **اصلاح پیشنهادی:**
     ```python
     stmt = (
         select(Enrollment)
         .options(
             selectinload(Enrollment.course).selectinload(Course.lessons)
         )
         .where(Enrollment.user_id == user_id, Enrollment.status == "active")
         .order_by(Enrollment.enrolled_at.desc())
     )
     ```

---

## ۳. امنیت پرداخت، محافظت در برابر Replay Attack و اعتبارسنجی قیمت‌گذاری

### ۳.۱. آسیب‌پذیری‌های شناسایی‌شده در `payment_service.py` و `payment.py`
1. **حملات بازپخش (Replay Attacks):**
   - در خطوط ۳۵ تا ۵۶ فایل `payment_service.py`، چنانچه تابعی با یک `authority` یکسان چندین بار فراخوانی شود، بدون بررسی وضعیت `paid` بودن قبلی، هر بار وضعیت را `paid` کرده و کد پیگیری جدید صادر می‌کند!
   - علاوه بر این، در صورت ارسال شناسه `authority` ساختگی و ناموجود، تابع یک سفارش تأییدشده موهومی (`ORD-CONFIRMED-...`) ساخته و پاسخ موفقیت (`success: True`) برمی‌گرداند!
2. **فقدان قفل پایگاه داده (Database Locking):**
   - هیچ جدول یا قفل سطری برای تراکنش‌های پرداخت وجود ندارد و همه چیز روی دیکشنری حافظه‌ای نگهداری می‌شود.
3. **قیمت‌گذاری سمت کاربر در سفارشات (`order_service.py`):**
   - در خطوط ۸۵ فایل `order_service.py`، قیمت مستقیماً از اقلام ارسالی کلاینت (`item.get("price", 0)`) خوانده می‌شود که امکان دستکاری قیمت توسط کلاینت را فراهم می‌کند.

### ۳.۲. معماری و راهکار مهندسی فاز ۷
1. **جدول و مدل `PaymentTransaction` در دیتابیس:**
   ```python
   class PaymentTransaction(Base):
       __tablename__ = "payment_transactions"
       __table_args__ = (
           UniqueConstraint("authority", name="uq_payment_authority"),
           UniqueConstraint("tracking_code", name="uq_payment_tracking_code"),
           Index("ix_payment_authority", "authority"),
       )

       id = Column(String(50), primary_key=True)
       order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
       authority = Column(String(100), unique=True, nullable=False)
       tracking_code = Column(String(100), unique=True, nullable=True)
       amount = Column(Integer, nullable=False)
       gateway = Column(String(50), default="zarinpal")
       status = Column(String(20), default="pending", index=True)  # pending | paid | failed
       reference_id = Column(String(100), nullable=True)
       created_at = Column(DateTime, default=datetime.utcnow)
       paid_at = Column(DateTime, nullable=True)
   ```
2. **محافظت قطعی در برابر Replay Attack با قفل سطری:**
   - در زمان تأیید پرداخت (`verify_payment`):
     ```python
     # ۱. واکشی تراکنش با قفل سطری
     stmt = select(PaymentTransaction).where(PaymentTransaction.authority == authority).with_for_update()
     tx = (await db.execute(stmt)).scalar_one_or_none()
     if not tx:
         raise AppException(message="شناسه پرداخت (Authority) یافت نشد.", code="PAYMENT_NOT_FOUND", status_code=400)

     # ۲. بررسی Replay Attack
     if tx.status == "paid":
         raise AppException(message="این تراکنش قبلاً تأیید و تسویه شده است. امکان پردازش مجدد وجود ندارد.", code="PAYMENT_REPLAY_ATTACK", status_code=400)

     # ۳. بررسی یکتایی tracking_code
     if tracking_code:
         dup_chk = await db.execute(select(PaymentTransaction).where(PaymentTransaction.tracking_code == tracking_code, PaymentTransaction.id != tx.id))
         if dup_chk.scalar_one_or_none():
             raise AppException(message="کد پیگیری ارائه شده قبلاً ثبت شده است.", code="DUPLICATE_TRACKING_CODE", status_code=400)
     ```
3. **محاسبه ۱۰۰٪ سمت سرور قیمت اقلام در `order_service.py`:**
   - پیش از درج سفارش، قیمت تک‌تک اقلام بر مبنای کاتالوگ رسمی پایگاه محاسبه شود:
     - دوره‌ها: واکشی از `course_service` یا جدول `courses` (دوره‌های وقفی/رایگان = ۰، دوره‌های تخصصی = نرخ معین سرور).
     - کتب چاپی و دیجیتال: واکشی از `book_service` (استخراج عدد ریالی/تومانی از فیلدهای رسمی کتاب).
     - قیمت ادعایی کاربر در فرانت‌اند نادیده گرفته شده و قیمت تصدیق‌شده سرور درج گردد.
4. **اعتبارسنجی کوپن‌ها و رد کوپن منقضی‌شده:**
   - در `coupon_service.py` کوپن‌ها به ساختار دارای تاریخ انقضا (`expires_at`) و وضعیت فعال بودن (`is_active`) مجهز شوند.
   - چنانچه کوپنی منقضی یا غیرفعال باشد، استثنای `InvalidCouponException` با کد `COUPON_EXPIRED` و پیام فارسی منزه از اسلاپ پرتاب شود.
   - اصلاح عبارت «منظور گردید» به «منظور شد» جهت انطباق با دستورالعمل نگارش فارسی.

---

## ۴. استریم صوت DRM و پشتیبانی کامل از استاندارد RFC 7233 Range

### ۴.۱. تحلیل فایل `stream.py` و `drm_service.py`
- **مسیر فایل:** `backend/app/api/v1/endpoints/stream.py:83-168`
- **وضعیت فعلی:**
  تابع `stream_audio_range` سرآیند `Range` را بررسی می‌کند و در صورت وجود فایل در `DEFAULT_AUDIO_PATH`، پاسخ با کد وضعیت `206 Partial Content` و سرآیندهای `Content-Range: bytes {start}-{end}/{file_size}` و `Accept-Ranges: bytes` ارسال می‌کند.
- **ایرادات مرزی و سناریوهای Edge-Case نیازمند اصلاح:**
  1. **سناریوی عدم وجود فایل و بافر شبیه‌سازی‌شده (Fallback):**
     در خطوط ۱۵۵ تا ۱۶۷، اگر فایل واقعی روی دیسک نباشد، علی‌رغم دریافت سرآیند `Range`، کل بافر صوتی بدون برش ارسال می‌شود! باید `synthetic_payload[start:end+1]` برش داده شده و طول متناسب تنظیم شود.
  2. **سرآیندهای انتهای باز (Suffix Ranges):**
     مطابق استاندارد RFC 7233، اگر سرآیند به صورت `Range: bytes=-500` ارسال شود، به معنای ۵۰۰ بایت انتهایی فایل است (`start = file_size - 500` و `end = file_size - 1`). در کد فعلی `parts[0]` خالی فرض شده و `start = 0` قرار داده می‌شود که منجر به استریم ۵۰۰ بایت اول به جای ۵۰۰ بایت آخر خواهد شد!
  3. **اعتبارسنجی بازه‌های نامعتبر (HTTP 416 Range Not Satisfiable):**
     اگر `start >= file_size` یا `start > end` باشد، سرور باید با کد ۴۱۶ و سرآیند `Content-Range: bytes */{file_size}` پاسخ دهد:
     ```python
     if start >= file_size or start > end:
         raise HTTPException(
             status_code=416,
             detail="Range Not Satisfiable",
             headers={"Content-Range": f"bytes */{file_size}"}
         )
     ```
  4. **انتقال جنریتور خواندن فایل به حالت ناهمگام (`AsyncGenerator`):**
     استفاده از `aiofiles` یا خواندن چانک در ترد غیرمسدودکننده درون `StreamingResponse`.

---

## ۵. دستیار هوشمند، استریم توکن به توکن با SSE و محدودکننده نرخ مصرف

### ۵.۱. وضعیت کنونی اندپوینت هوش مصنوعی
- در `backend/app/api/v1/endpoints/ai.py`، متد `/chat` پاسخی یکجا در قالب JSON ارسال می‌کند.
- هیچ محدودیتی روی طول ورودی (`max_length`) در اسکیما یا کنترلر وجود ندارد.
- هیچ اتصال مستقیمی با `rate_limiter.py` برقرار نشده است.

### ۵.۲. طراحی استریم SSE (`text/event-stream`)
- **ایجاد اندپوینت جدید یا گسترش اندپوینت فعلی:**
  ایجاد اندپوینت اختصاصی:
  `POST /api/v1/ai/chat/stream`
  با استفاده از `StreamingResponse(..., media_type="text/event-stream")`.
- **ساختار جریان داده (SSE Protocol):**
  ارسال رویدادها در قالب JSON استاندارد:
  ```
  data: {"token": "بر ", "done": false}

  data: {"token": "اساس ", "done": false}

  ...
  data: {"token": "", "done": true, "citations": [...], "suggested_followups": [...]}

  ```
- **در سرویس `ai_service.py`:**
  پیاده‌سازی جنریتور ناهمگام `stream_chat(req: AIChatRequest)` که متن برهانی استخراج‌شده از درس‌گفتارهای «حجت الاسلام دکتر زنجیر زن حسینی» را به همراه ارجاعات و پرسش‌های تکمیلی به صورت توکن‌محور با فواصل زمانی ناهمگام (`asyncio.sleep`) استریم نماید.

### ۵.۳. اعتبارسنجی طول پرامپت (Prompt Length Validation)
- تعریف محدودیت ۲,۰۰۰ نویسه برای پیام کاربر:
  ```python
  MAX_PROMPT_CHARS = 2000
  if len(req.message.strip()) > MAX_PROMPT_CHARS:
      raise HTTPException(
          status_code=400,
          detail=f"طول متن پرسش ارسالی بیش از سقف مجاز است (حداکثر {MAX_PROMPT_CHARS} نویسه مجاز است)."
      )
  ```

### ۵.۴. معماری سطل توکن (Token Bucket Rate Limiter)
- در `backend/app/core/rate_limiter.py` کلاسی تحت عنوان `TokenBucketRateLimiter` ایجاد شود:
  - هر کاربر احرازهویت‌شده (با `user_id`) یا شناسه IP دارای سطلی با گنجایش معین (مثلاً ۲۰ درخواست در هر ۶۰ ثانیه) است.
  - نرخ بازیابی توکن مشخص (`refill_rate`).
  - متد `consume(key, tokens=1) -> Tuple[bool, int]` جهت بررسی موجودی.
  - در صورت اتمام توکن‌ها، پرتاب خطای HTTP 429 با سرآیند `Retry-After` و پیام خطای فارسی بدون اسلاپ.

---

## ۶. تفکیک نقش‌ها و کنترل دسترسی مدیر (RBAC) در اندپوینت‌های ادمین

### ۶.۱. وضعیت کنونی در `admin.py` و `deps.py`
- در `backend/app/api/deps.py` وابستگی `get_current_admin` به خوبی تعریف شده و در صورت نبود توکن ۴۰۱ و در صورت عدم تطابق نقش `admin` خطای ۴۰۳ برمی‌گرداند.
- اما در `backend/app/api/v1/endpoints/admin.py`، نمونه‌سازی روتر به صورت زیر انجام شده است:
  ```python
  router = APIRouter()
  ```
  و هیچ وابستگی روتر-محوری وجود ندارد.
- همچنین هیچ روت ریشه‌ای (`GET /api/v1/admin`) برای تست سلامت دسترسی ادمین تعریف نشده و درخواست به ریشه با ۴۰۴ مواجه می‌شود.

### ۶.۲. اقدامات اصلاحی الزامی:
1. **تزریق روتر-محور وابستگی `get_current_admin`:**
   ```python
   router = APIRouter(dependencies=[Depends(get_current_admin)])
   ```
   با این کار، کلیه مسیرهای فعلی و مسیرهایی که در آینده به روتر ادمین اضافه می‌شوند، بدون نیاز به تکرار در هر کنترلر، در برابر دسترسی کاربران عادی و غیرمجاز محافظت می‌شوند.
2. **افزودن اندپوینت ریشه برای روتر ادمین:**
   ```python
   @router.get("/", summary="Admin dashboard status check")
   async def admin_root(admin: dict = Depends(get_current_admin)):
       return {
           "status": "authorized",
           "role": "admin",
           "scholar_name": "حجت الاسلام دکتر زنجیر زن حسینی",
           "message": "پنل مدیریت سامانه جامع علمی و آموزشی"
       }
   ```
   این کار آزمون `Unauthorized student access to /api/v1/admin returns HTTP 403 Forbidden` در فاز ۹ را تضمین می‌کند.

---

## ۷. جمع‌بندی و جدول اولویت‌های پیاده‌سازی

| ردیف | مؤلفه معماری | هدف پیاده‌سازی | اولویت | پیچیدگی |
|---|---|---|---|---|
| ۱ | `models.py` & `database.py` | افزودن مدل `UserFavorite` و نمایه ترکیبی `(user_id, course_id)` برای `Enrollment` و `UserFavorite` | بسیار بالا (حیاتی) | متوسط |
| ۲ | `order_service.py` & `course_service.py` | به‌کارگیری `selectinload` برای اقلام سفارشات، دروس دوره، و ثبت‌نام‌ها جهت حذف N+1 Query | بسیار بالا | متوسط |
| ۳ | `payment_service.py` & `payment.py` | ایجاد مدل تراکنش دیتابیس، مقابله با Replay Attack، بررسی یکتایی Authority و محاسبه ۱۰۰٪ سروری قیمت | بحرانی (امنیتی) | بالا |
| ۴ | `stream.py` & `drm_service.py` | استانداردسازی کامل RFC 7233 Range (برش بافر، بازه‌های پسوندی، و کد ۴۱۶) | بالا | کم تا متوسط |
| ۵ | `ai.py` & `ai_service.py` | استریم SSE با فرمت `text/event-stream`، سقف طول پرامپت، و سطل توکن در `rate_limiter.py` | بالا | متوسط |
| ۶ | `admin.py` | تزریق `get_current_admin` در سطح روتر و اندپوینت ریشه ادمین جهت بازگشت قطعی ۴۰۳ برای دانشجویان | بسیار بالا | کم |
