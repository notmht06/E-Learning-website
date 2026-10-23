# گزارش جامع فنی: معماری احراز هویت پایدار و ماندگاری داده‌ها در دیتابیس SQLite
## سامانه نشر آثار علمی و دروس حجت الاسلام دکتر زنجیر زن حسینی

**تاریخ تحلیل:** ۲۰۲۶-۱۰-۱۲  
**نقش تحلیل‌گر:** کاوشگر احراز هویت بک‌اند و ماندگاری دیتابیس (Backend Auth & Database Persistence Explorer)  
**مسیر کاری:** `.agents/teamwork/teamwork_preview_explorer_survey_backend`  
**مخاطب:** orchestrator_3 (شناسه مکالمه: `174180af-6f26-480c-bb80-0a02fcfc7785`)

---

## ۱. خلاصه مدیریتی و فنی (Executive Summary)

سامانه فعلی بک‌اند در مسیر `backend/app` دارای ساختار پایه متناسب با استاندارد SQLAlchemy ۲.۰ ناهمگام (Async) و دیتابیس SQLite در فایل `zanjirzan_platform.db` است. جدول `users` با فیلدهای ضروری ایجاد شده است، اما سرویس احراز هویت (`auth_service.py`) در حال حاضر به صورت موقت (Mock) بر پایه یک دیکشنری درون‌حافظه‌ای (`self.users`) فعالیت می‌کند و کاربران ثبت‌نام‌شده را در دیتابیس ذخیره نمی‌کند.

هدف این پژوهش، تدوین نقشه راه مهندسی دقیق جهت گذار کامل از احراز هویت موقت درون‌حافظه‌ای به احراز هویت واقعی، پایدار و امن مبتنی بر تراکنش‌های ACID دیتابیس SQLite با نشست‌های ناهمگام (`AsyncSession`)، رعایت اصل یکتایی شماره همراه، هشینگ رمز عبور با bcrypt، ساختاردهی خطاهای فارسی با `AppException` و بازیابی مشخصات کاربر در اندپوینت `/api/v1/auth/me` است.

---

## ۲. کالبدشکافی وضعیت موجود کدهای بک‌اند (Current Architecture Survey)

### ۲.۱. بررسی `backend/app/services/auth_service.py`
- **ساختار فعلی:**
  - کلاس `AuthService` در متد سازنده (`__init__`) یک دیکشنری درون‌حافظه‌ای با دو کاربر اولیه (`09123456789` برای نقش دانشجو و `09120000000` برای نقش مدیر با نام رسمی «حجت الاسلام دکتر زنجیر زن حسینی») نگه می‌دارد.
  - متدهای `register_user`, `authenticate_user`, `get_user_by_id`, `update_profile` همگی همگام (`def` سنکرون) هستند و مستقیماً با `self.users` کار می‌کنند.
- **ایرادات و گپ‌های شناسایی‌شده:**
  1. **عدم پایداری داده‌ها:** با ریستارت شدن سرور، کاربر ثبت‌نام‌شده پاک می‌شود.
  2. **تولید خودکار غیرمجاز کاربر در لاگین (Auto-provisioning):** در خطوط ۵۹-۷۰ متد `authenticate_user`، چنانچه کاربری با شماره تلفن ارائه‌شده وجود نداشته باشد، به صورت خودکار ثبت‌نام می‌شود! در حالی که لاگین با اطلاعات ناموجود باید خطای احراز هویت (۴۰۰ یا ۴۰۱) صادر کند.
  3. **عدم تعامل با دیتابیس:** هیچ تزریق وابستگی نشست (`AsyncSession`) به متدها وجود ندارد و کوئری‌های SQLAlchemy به جدول `users` ارسال نمی‌شوند.

### ۲.۲. بررسی مدل داده `backend/app/models/models.py`
- **مدل `User`:**
  ```python
  class User(Base):
      __tablename__ = "users"

      id = Column(String(50), primary_key=True, index=True)
      mobile = Column(String(20), unique=True, index=True, nullable=False)
      email = Column(String(100), unique=True, index=True, nullable=True)
      full_name = Column(String(100), nullable=True)
      hashed_password = Column(String(255), nullable=False)
      role = Column(String(20), default="student", index=True)  # 'student' | 'admin'
      is_active = Column(Boolean, default=True)
      created_at = Column(DateTime, default=datetime.utcnow)

      enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
  ```
- **نقاط افتراق با اسکیمای پاسخ (`UserResponse`):**
  - فیلد ذخیره‌سازی شماره تماس در جدول `mobile` نام دارد، اما در اسکیمای ورودی و خروجی `phone` نامیده شده است.
  - جدول `users` فیلدهای `wallet_balance` و `avatar_url` را در بر ندارد، در حالی که اسکیمای پاسخ `UserResponse` در `schemas/auth.py` فیلد الزامی `wallet_balance: str` و `enrolled_courses_count: int` دارد و رابط کاربری فرانت‌اند به این مقادیر وابسته است.

### ۲.۳. بررسی اندپوینت‌های روتر `backend/app/api/v1/endpoints/auth.py`
- متدهای `/register`, `/login`, `/otp/send`, `/otp/verify`, `/me`, `/profile` به صورت سنکرون (`def`) تعریف شده‌اند و وابستگی نشست دیتابیس `db: AsyncSession = Depends(get_db)` را دریافت نمی‌کنند.
- در بلوک `try ... except`، استثناهای پیش‌آمده به صورت سراسری به `HTTPException(status_code=400, detail=str(e))` تبدیل می‌شوند که این امر مانع از پردازش مستقیم `AppException` توسط هندلر یکپارچه `app_exception_handler` در `main.py` می‌شود.

### ۲.۴. بررسی هسته اتصال دیتابیس `backend/app/models/database.py`
- موتور ناهمگام با `create_async_engine(settings.DATABASE_URL)` و `async_sessionmaker` با کلاس `AsyncSession` پیکربندی شده است.
- متد تزریق وابستگی `get_db()` با الگوی `AsyncGenerator[AsyncSession, None]` پیاده‌سازی شده و فرآیند `commit` و `rollback` خودکار را پوشش می‌دهد.
- متد `init_db()` جداول را از روی `Base.metadata.create_all` می‌سازد، اما هنوز داده‌های پیش‌فرض کاربران (دانشجو و مدیر) را درون جدول `users` درج (Seed) نمی‌کند؛ از این رو جدول `users` در حال حاضر خالی است (۰ رکورد).

### ۲.۵. بررسی ماژول امنیت `backend/app/core/security.py`
- توابع استاندارد `hash_password` و `verify_password` با استفاده از کتابخانه `bcrypt` و نمک (Salt) پویا به طور کامل پیاده‌سازی شده‌اند.
- تابع `create_access_token` توکن استاندارد JWT الگوریتم HS256 را با کلید رمزنگاری و مدت انقضای ۷ روز تولید می‌کند و تابع `decode_access_token` اعتبارسنجی امضا را انجام می‌دهد.

### ۲.۶. بررسی مدیریت استثناها `backend/app/core/exceptions.py`
- کلاس `AppException` با آرگومان‌های `message`, `code`, `status_code` پیاده‌سازی شده است.
- هندلر مرکزی `app_exception_handler` ساختار خروجی استاندارد با فیلدهای `success: False`, `error_code`, `message`, `path` تولید می‌کند.

### ۲.۷. بررسی توابع وابستگی نشست `backend/app/api/deps.py`
- وابستگی `get_current_user` هدر `Authorization: Bearer <TOKEN>` را اعتبارسنجی می‌کند، اما در خط ۴۵ متد سنکرون `auth_service.get_user_by_id(user_id)` را بدون دسترسی به دیتابیس فراخوانی می‌کند.
- وابستگی `get_current_admin` نقش کاربر را بررسی کرده و در صورت مغایرت، خطای ۴۰۳ صادر می‌کند.

### ۲.۸. بررسی آزمون‌های موجود `backend/tests/test_in_memory.py`
- آزمون `test_auth_endpoints` لاگین دانشجو با شماره `09123456789` و رمز `pass`، لاگین ناموفق با رمز اشتباه، و لاگین مدیر با شماره `09120000000` و رمز `admin_secret_2026` را ارزیابی می‌کند.
- در حال حاضر آزمون مستقیمی برای اندپوینت `/api/v1/auth/register` (درج در دیتابیس و بررسی شماره تکراری) و اندپوینت `/api/v1/auth/me` در این فایل قرار ندارد.

---

## ۳. تحلیل گپ‌ها و نیازمندی‌های گذار به دیتابیس واقعی (Gap Analysis)

| مؤلفه | وضعیت جاری (Mock) | وضعیت هدف (Persistent SQLite) | اقدامات ضروری |
|---|---|---|---|
| **ذخیره‌سازی کاربران** | متغیر `self.users` در حافظه RAM | جدول `users` در فایل `zanjirzan_platform.db` | کوئری‌های `select(User)` و `db.add(new_user)` با تراکنش ناهمگام |
| **کاربران پایه سامانه** | هاردکد در دیکشنری `AuthService` | رکورد دیتابیس درج‌شده در `init_db()` | سیدینگ خودکار حساب‌های دانشجو و مدیر هنگام شروع سرور |
| **بررسی شماره تکراری** | بررسی کلید در دیکشنری پایتون | قید یکتایی `UNIQUE` در دیتابیس + ولیدیشن پیش از درج | صدور خطای ۴۰۰ با کد `USER_ALREADY_EXISTS` و پیام فارسی شایسته |
| **بررسی رمز عبور** | تطبیق با `verify_password` در دیکشنری | واکشی هش ذخیره‌شده از دیتابیس و تطبیق امن | حذف Auto-provisioning و صدور خطای ۴۰۱ در صورت عدم تطابق |
| **تزریق وابستگی نشست** | فراخوانی مستقیم بدون ورودی `db` | تزریق `db: AsyncSession = Depends(get_db)` | تغییر امضای متدها در `auth_service.py`، روترها و `deps.py` |
| **بازیابی هویت (`/me`)** | خواندن از دیکشنری یا کلیم‌های توکن | کوئری به دیتابیس با شناسه `sub` توکن JWT | هایدریشن مشخصات واقعی کاربر همراه با تعداد دوره‌های ثبت‌نامی |

---

## ۴. استراتژی فنی و اجرایی تحول لایه احراز هویت (Technical Strategy)

### ۴.۱. گام اول: اصلاح و توسعه مدل داده `User` در `backend/app/models/models.py`
1. افزودن ستون‌های کمکی به کلاس `User`:
   - `wallet_balance = Column(String(100), default="50,000 Tomans (Welcome Bonus)")`
   - `avatar_url = Column(String(500), nullable=True)`
2. افزودن پراپرتی سازگارکننده نام فیلد شماره همراه:
   ```python
   @property
   def phone(self) -> str:
       return self.mobile

   @phone.setter
   def phone(self, value: str):
       self.mobile = value
   ```
3. افزودن متد مبدل شیء دیتابیس به ساختار استاندارد پاسخ (`to_dict`):
   ```python
   def to_dict(self, access_token: Optional[str] = None) -> Dict[str, Any]:
       return {
           "id": self.id,
           "full_name": self.full_name or "کاربر گرامی",
           "phone": self.mobile,
           "email": self.email,
           "avatar_url": getattr(self, "avatar_url", None),
           "role": self.role or "student",
           "wallet_balance": getattr(self, "wallet_balance", "50,000 Tomans (Welcome Bonus)") or "50,000 Tomans (Welcome Bonus)",
           "enrolled_courses_count": len(self.enrollments) if self.enrollments is not None else 0,
           "access_token": access_token,
       }
   ```

### ۴.۲. گام دوم: سیدینگ کاربران پایه در `backend/app/models/database.py` (`init_db`)
در متد `init_db()`، پس از اجرای `Base.metadata.create_all`، باز کردن یک نشست ناهمگام و بررسی وجود کاربران پایه:
1. کاربر دانشجو:
   - شناسه: `usr-140301`
   - شماره همراه: `09123456789`
   - نام: `Ali Mousavi`
   - هش رمز عبور: `hash_password("pass")`
   - نقش: `student`
   - موجودی کیف پول: `350,000 Tomans`
2. کاربر مدیر ارشد (پایبندی کامل به قانون نام رسمی استاد):
   - شناسه: `adm-001`
   - شماره همراه: `09120000000`
   - نام: **«حجت الاسلام دکتر زنجیر زن حسینی»**
   - هش رمز عبور: `hash_password("admin_secret_2026")`
   - نقش: `admin`
   - موجودی کیف پول: `0 Tomans`

### ۴.۳. گام سوم: بازنویسی سرویس احراز هویت `backend/app/services/auth_service.py`
تبدیل تمام متدها به ناهمگام با دریافت آرگومان `db: AsyncSession`:
1. **ثبت‌نام (`register_user`):**
   - جستجوی شماره همراه: `select(User).where(User.mobile == phone)`.
   - در صورت وجود رکورد، پرتاب استثنای:
     ```python
     raise AppException(
         message=f"شماره تماس «{phone}» قبلاً در سامانه ثبت شده است.",
         code="USER_ALREADY_EXISTS",
         status_code=400,
     )
     ```
   - تولید شناسه یکتا (مانند `usr-{uuid.uuid4().hex[:8]}`).
   - هش کردن کلمه عبور با `hash_password(password)`.
   - ساخت شیء `User`، افزودن به سشن با `db.add(new_user)`، ثبت تراکنش با `await db.commit()` و واکشی با `await db.refresh(new_user)`.
   - تولید توکن JWT و بازگرداندن داده‌ها از طریق `new_user.to_dict(access_token=token)`.
2. **ورود (`authenticate_user`):**
   - واکشی کاربر با `select(User).where(User.mobile == phone)`.
   - چنانچه کاربر یافت نشود:
     ```python
     raise AuthenticationException(message="شماره تماس یا رمز عبور وارد شده نادرست است.")
     ```
   - بررسی هش رمز عبور با `verify_password(password, user.hashed_password)`. در صورت عدم انطباق:
     ```python
     raise AuthenticationException(message="شماره تماس یا رمز عبور وارد شده نادرست است.")
     ```
   - بررسی فعال بودن حساب (`user.is_active`).
   - صدور توکن دسترسی JWT با اطلاعات شناسه، شماره همراه و نقش.
   - بازگرداندن خروجی هیدراته‌شده منطبق بر اسکیمای `UserResponse`.
3. **بازیابی کاربر با شناسه (`get_user_by_id`):**
   - واکشی ناهمگام رکورد کاربر با `select(User).options(selectinload(User.enrollments)).where(User.id == user_id)`.
   - بازگرداندن دیکشنری مشخصات کاربر یا `None`.

### ۴.۴. گام چهارم: به‌روزرسانی روتر احراز هویت `backend/app/api/v1/endpoints/auth.py`
- تبدیل هندلرها به `async def`.
- تزریق وابستگی `db: AsyncSession = Depends(get_db)` به اندپوینت‌های `/register`, `/login`, `/otp/verify`, `/profile`.
- مدیریت ساختاریافته خطاها: اجازه دادن به پرتاب مستقیم `AppException` به هندلر مرکزی یا هدایت پیام خطای فارسی به کلاینت.

### ۴.۵. گام پنجم: اصلاح وابستگی‌های نشست در `backend/app/api/deps.py`
- متد `get_current_user` ورودی `db: AsyncSession = Depends(get_db)` را دریافت می‌کند.
- پس از استخراج `user_id` از توکن معتبر، فراخوانی ناهمگام `user = await auth_service.get_user_by_id(db=db, user_id=user_id)` اجرا می‌شود.
- در صورت عدم یافتن کاربر در دیتابیس، خطای ۴۰۱ صادر می‌شود:
  ```python
  raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="کاربر در پایگاه داده یافت نشد یا نشست نامعتبر است."
  )
  ```

### ۴.۶. گام ششم: ارتقا و غنی‌سازی آزمون‌های یکپارچگی `backend/tests/test_in_memory.py`
افزودن سناریوهای جامع به متد `test_auth_endpoints`:
1. آزمون ثبت‌نام موفق یک دانشجوی جدید با شماره همراه منحصربه‌فرد (`09190001122`).
2. تایید ایجاد فیزیکی رکورد در جدول `users` دیتابیس SQLite.
3. آزمون تلاش برای ثبت‌نام مجدد با همان شماره همراه و اعتبارسنجی دریافت پاسخ ۴۰۰ با کد `USER_ALREADY_EXISTS`.
4. آزمون اعتبارسنجی اندپوینت `/api/v1/auth/me` با ارسال توکن صادرشده و بررسی انطباق مشخصات کاربر بازگشتی.
5. حفظ ۱۰۰٪ کارکرد آزمون‌های پیشین (لاگین با رمز اشتباه، سپر RBAC و استریم DRM).

---

## ۵. چک‌لیست قوانین بنیادین پروژه (Compliance Checklist)

1. **قانون تثبیت نام رسمی استاد (SCHOLAR IDENTITY):**
   - نام رسمی استاد در تمام سیدینگ‌ها و متادیتاها منحصراً **«حجت الاسلام دکتر زنجیر زن حسینی»** ثبت می‌شود.
2. **قانون ضد اسلاپ در دیزاین و معماری (ANTI-AI-SLOP):**
   - هیچ ساختار تصنعی یا فیلد بی‌معنا به جدول کاربران افزوده نمی‌شود.
3. **قانون مهندسی بک‌اند (BACKEND-SKILL ARCHITECTURE):**
   - **امنیت (Security Guardian):** کلمات عبور با bcrypt هش می‌شوند و توکن‌های JWT دارای امضای معتبر هستند.
   - **سادگی (Simplicity Governor):** استفاده از مدل‌های SQLAlchemy و کوئری‌های پارامتری؛ پرهیز کامل از SQL خام رشته‌ای.
   - **کارایی (Performance Engine):** کلیه متدهای سرویس و اندپوینت‌ها ناهمگام (`async def`) هستند.
   - **پایداری (Reliability Engine):** مدیریت تراکنش‌های ACID با Commit/Rollback خودکار و خطاهای استاندارد با `AppException`.
4. **قانون نگارش فارسی اصیل (PERSIAN-WRITING):**
   - پرهیز کامل از افعال اداری «می‌باشد/می‌باشند» و «می‌گردد/گردید».
   - رعایت دقیق نیم‌فاصله (ZWNJ) و گیومه‌های فارسی (« ») در تمامی پیام‌های خطا.
