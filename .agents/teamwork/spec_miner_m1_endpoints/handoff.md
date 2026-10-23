# Handoff Report — M1 Endpoints & Services Specification Mining
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**Agent:** `spec_miner_m1_endpoints`  
**Milestone:** M1 (Backend Persistent Course Enrollment, Orders & SQLite Models)  
**Date:** 2026-10-13T03:20:00Z  
**Type:** Hard Handoff (Task Complete)

---

### ۱. Observation (مشاهدات عینی)

1. **Missing Endpoints in `backend/app/api/v1/endpoints/courses.py`:**
   - Lines 18–49: Currently contains only `GET /`, `GET /{course_id}`, and `POST /{course_id}/progress`.
   - `POST /{course_id}/enroll` and `GET /enrolled` are completely absent.
   - Route ordering critical path: Line 26 defines `@router.get("/{course_id}")`. If `GET /enrolled` is registered after this line, FastAPI matches `/enrolled` against `/{course_id}` with `course_id="enrolled"`, throwing a 404 `EntityNotFoundException`.

2. **Missing Async & DB Integration in `backend/app/api/v1/endpoints/orders.py`:**
   - Lines 11–24: `def create_order(req: CreateOrderRequest):` is synchronous `def` (violating `BACKEND_SYSTEM_DESIGN.md` Performance Engine async requirement).
   - `create_order` lacks `user: Optional[dict] = Depends(get_optional_user)` and `db: AsyncSession = Depends(get_db)`.
   - It delegates only to in-memory `order_service.create_order` without writing to SQLite `orders` or `enrollments` tables.

3. **Missing Service Enrollment Operations in `backend/app/services/course_service.py`:**
   - Lines 116–198: Contains only in-memory course operations and playback progress sync.
   - Lacks `enroll_student(db, user_id, course_id)` and `get_enrolled_courses_for_user(db, user_id)`.

4. **Foreign Key Integrity Prerequisite in SQLite:**
   - `backend/app/models/database.py` line 30 executes `cursor.execute("PRAGMA foreign_keys=ON")`.
   - `backend/app/models/models.py` line 136 defines `course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)`.
   - The SQLite `courses` table in `zanjirzan_platform.db` is currently empty. Inserting into `enrollments` without ensuring the course exists in the `courses` table results in a `FOREIGN KEY constraint failed` IntegrityError.

5. **Profile Hydration Gap in `backend/app/schemas/auth.py` and `backend/app/services/auth_service.py`:**
   - `schemas/auth.py` lines 34–42: `UserResponse` has `enrolled_courses_count: int` but lacks `enrolled_course_ids: List[str]`.
   - `auth_service.py` lines 220–249: `get_user_by_id` fetches `User` but does not query `Enrollment` table, leaving `enrolled_course_ids` empty and `enrolled_courses_count` as 0.

6. **Central Exception Handler in `backend/app/core/exceptions.py` & `main.py`:**
   - `exceptions.py` lines 8–15: `AppException(message, code, status_code)` is the foundational exception.
   - `main.py` line 53: `app.add_exception_handler(AppException, app_exception_handler)` is actively registered.
   - Raising `AppException(message=..., code="DUPLICATE_ENROLLMENT", status_code=400)` yields JSON `{"success": false, "error_code": "DUPLICATE_ENROLLMENT", "message": "...", "path": "..."}` with status code 400.

7. **Baseline Test Suite Status:**
   - Execution of `backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py` exited with code 0 (all 11 test suites passed).

---

### ۲. Logic Chain (زنجیره استدلال و نتیجه‌گیری)

1. **از مشاهده ۱ و ۶:**
   - چون کاربر در صفحه دوره دکمه ثبت‌نام را کلیک می‌کند، نیاز به ارسال درخواست به `POST /api/v1/courses/{course_id}/enroll` با سرآیند توکن دارد.
   - اگر کاربر پیش‌تر در دوره ثبت‌نام کرده باشد، اندپوینت باید `AppException` با کد `DUPLICATE_ENROLLMENT`، وضعیت ۴۰۰، و پیام مشخص فارسی صادر کند تا گرداننده مرکزی آن را به صورت JSON ساختاریافته به کلاینت تحویل دهد.
   - اگر اندپوینت `GET /api/v1/courses/enrolled` بعد از `/{course_id}` در فایل `courses.py` قرار گیرد، کلاینت با خطای ۴۰۴ مواجه می‌شود. بنابراین این اندپوینت موکداً باید پیش از `/{course_id}` تعریف شود.

2. **از مشاهده ۳ و ۴:**
   - هنگام فراخوانی `course_service.enroll_student`، برای جلوگیری از نقض قید کلید خارجی SQLite (`PRAGMA foreign_keys=ON;`)، سرویس باید وجود دوره در جدول دیتابیس `courses` را بررسی کرده و در صورت عدم وجود، آن را درج کند.
   - پس از بررسی عدم وجود ثبت‌نام فعال پیشین، یک رکورد در جدول `enrollments` با وضعیت `active` درج و `flush` می‌شود.

3. **از مشاهده ۲ و ۳:**
   - هنگام ثبت سفارش در سبد خرید (`POST /api/v1/orders/create`)، اندپوینت باید با تزریق `get_optional_user` و `get_db` به `async def` تبدیل شود.
   - اگر آیتم‌های سبد خرید شامل دوره باشد و کاربر احراز هویت شده باشد، سرویس باید تراکنش ثبت سفارش و ثبت‌نام در جدول `enrollments` را به صورت اتمیک انجام دهد تا پس از پرداخت، قفل دوره‌ها فوراً برای دانشجو باز شود.

4. **از مشاهده ۵:**
   - کلاینت در شروع کار و پس از رفرش، اندپوینت `GET /api/v1/auth/me` را صدا می‌زند تا بداند کاربر در کدام دوره‌ها ثبت‌نام کرده است.
   - ارتقای `UserResponse` با فیلد `enrolled_course_ids: List[str]` و اصلاح `auth_service.get_user_by_id` جهت واکشی رکوردهای فعال از جدول `enrollments`، همگام‌سازی دائمی و پایداری کلاینت را تضمین می‌کند.

---

### ۳. Caveats (ملاحظات، مفروضات و محدودیت‌ها)

- **دامنه کاری (Scope Limitation):** این مامور در نقش `specification_miner` منحصراً وظیفه کاوش و مستندسازی مشخصات فنی را بر عهده دارد و هیچ فایلی از کدهای اجرایی را تغییر نمی‌دهد. پیاده‌سازی بر عهده کارگر M1 (`worker_m1`) خواهد بود.
- **توابع موجود در سرویس سفارش:** متدهای دیگر در `order_service.py` (مانند شبیه‌ساز پست پیشتاز و نمرات دانشجو) نباید دچار شکست شوند؛ متد `create_order_tx` باید در کنار متد قدیمی یا به عنوان جایگزین سازگار با آن عمل کند.
- **بذرگذاری دوره‌ها:** مدل‌های دیتابیس و بذرگذاری `seed_default_courses` باید همگام با این اندپوینت‌ها در `models.py` و `database.py` اعمال گردند تا یکپارچگی ارجاعی حفظ شود.

---

### ۴. Conclusion (ارزیابی نهایی و نتیجه‌گیری)

تمامی مشخصات فنی، امضاهای متدها، مدل‌های Pydantic، نیازمندی‌های اولویت‌بندی روتینگ، ساختار خطای فارسی ثبت‌نام تکراری، و نحوه همگام‌سازی نمایه کاربر در فایل جامع `report_endpoints.md` استخراج و مستند شدند. سیستم آماده انتقال به کارگر پیاده‌سازی جهت اجرای گام‌به‌گام و آزمون‌های یکپارچگی است.

---

### ۵. Verification Method (روش اعتبارسنجی مستقل)

کارگر پیاده‌سازی پس از اعمال تغییرات می‌تواند صحت کار را با گام‌های زیر ارزیابی کند:

1. **اجرای آزمون‌های یکپارچگی بک‌اند:**
   ```powershell
   backend\.venv\Scripts\python.exe backend\tests\test_in_memory.py
   ```
   *شرط قبولی:* خروج با کد ۰ و تایید پاس شدن ۱۰۰٪ آزمون‌های موجود به همراه آزمون‌های جدید ثبت‌نام.

2. **اجرای خط لوله ممیزی کیفی و ضد اسلاپ:**
   ```powershell
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *شرط قبولی:* کسب نمره ۱۰۰ از ۱۰۰ بدون نقض قوانین نام استاد («حجت الاسلام دکتر زنجیر زن حسینی») یا لحن نگارش فارسی.

3. **بررسی ساختار پاسخ خطای ثبت‌نام تکراری:**
   ارسال درخواست مجدد برای ثبت‌نام در دوره فعال باید پاسخ زیر را با کد ۴۰۰ تولید کند:
   ```json
   {
     "success": false,
     "error_code": "DUPLICATE_ENROLLMENT",
     "message": "شما پیش از این در دوره «سلسله جلسات مبادی منطق و تفکر عقلانی» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است."
   }
   ```
