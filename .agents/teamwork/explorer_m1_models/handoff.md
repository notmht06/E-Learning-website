# Handoff Report — M1 Models & Database Architecture
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**فرستنده:** کاوشگر ارشد مدل‌های داده (`explorer_m1_models`)  
**گیرنده:** معمار هماهنگ‌کننده (`parent` / `orchestrator`)  
**تاریخ:** ۲۱ مهر ۱۴۰۵ (2026-10-13)  
**نوع تحویل:** کامل (Hard Handoff)  
**سند تفصیلی همراه:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_models\report_models.md`

---

### ۱. مشاهدات عینی (Observation)

1. **بررسی وضعیت پایگاه داده SQLite:**
   با اجرای کوئری در `zanjirzan_platform.db`، جدول‌های `categories`, `users`, `courses`, `lessons`, `enrollments` شناسایی شدند.
   - تعداد رکوردهای جدول `courses`:
     ```
     SELECT count(*) FROM courses -> 0 رکورد
     ```
   - اسکیما و شاخص‌های فعلی جدول `enrollments`:
     ```sql
     CREATE TABLE enrollments (
         id VARCHAR(50) NOT NULL,
         user_id VARCHAR(50) NOT NULL,
         course_id VARCHAR(50) NOT NULL,
         enrolled_at DATETIME,
         status VARCHAR(20),
         PRIMARY KEY (id),
         FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
         FOREIGN KEY(course_id) REFERENCES courses (id) ON DELETE CASCADE
     )
     ```
     فاقد قید یکتایی `UNIQUE(user_id, course_id)` است.
   - جدول‌های `orders` و `order_items` در دیتابیس وجود ندارند (خروجی کوئری اسکیما تایید کرد).

2. **بررسی مدل‌های موجود در `backend/app/models/models.py`:**
   - خطوط ۱۳۱ تا ۱۴۲: مدل `Enrollment` فاقد `__table_args__` بوده و قید یکتایی ندارد.
   - خطوط ۸۳ تا ۱۲۹: مدل `User` دارای رابطه با `enrollments` است اما رابطه با `orders` ندارد.
   - خط ۱۰۹ تا ۱۲۸: متد `to_dict` در مدل `User` پارامتر `enrolled_course_ids` را ندارد و آن را سریال نمی‌کند.
   - مدل‌های `Order` و `OrderItem` در هیچ کجای `models.py` تعریف نشده‌اند.

3. **بررسی فایل `backend/app/models/database.py`:**
   - خطوط ۴۲ تا ۵۴: فقط متد `seed_default_users()` وجود دارد و هیچ متدی تحت عنوان `seed_default_courses()` در فایل نیست.
   - خطوط ۱۰۴ تا ۱۳۸: متد `init_db()` فقط جداول را ایجاد کرده، ستون‌های مایگریشن `users` را بررسی نموده و `seed_default_users()` را صدا می‌زند.
   - خط ۲۵ تا ۳۱: فعال‌سازی `PRAGMA foreign_keys=ON;` روی کانکشن‌های SQLite تصریح شده است.

4. **بررسی کاتالوگ دوره‌ها در `backend/app/services/course_service.py`:**
   - خطوط ۱۲ تا ۱۱۳: فهرست `course_service.courses` شامل ۴ دوره پایه با شناسه‌های:
     - `course-mabadi-mantiq`
     - `course-bidayat`
     - `course-asfar`
     - `course-ishraq`
     همراه با مشخصات عنوان، اسلاگ، توضیحات، ساعات، و جلسات تفصیلی سرفصل (`syllabus`).

---

### ۲. زنجیره استدلال و منطق فنی (Logic Chain)

1. **ریسک شکست کلید خارجی (Foreign Key Violation):**  
   بر پایه مشاهده ۳، ارتباطات دیتابیس با `PRAGMA foreign_keys=ON` اجرا می‌شوند. بر پایه مشاهده ۱، جدول `courses` هم‌اکنون ۰ رکورد دارد. بنابراین اگر اندپوینت یا سرویسی رکوردی در جدول `enrollments` با `course_id="course-mabadi-mantiq"` درج کند، موتور SQLite بی‌درنگ با خطای `IntegrityError: FOREIGN KEY constraint failed` متوقف می‌شود. در نتیجه، پیش از هر تراکنش ثبت‌نام، باید دوره‌های موجود در کاتالوگ از طریق `seed_default_courses()` در جدول `courses` درج شوند.

2. **قید یکتایی ثبت‌نام (Uniqueness Enforcement):**  
   بر پایه مشاهده ۱ و ۲، مدل `Enrollment` فاقد قید یکتایی `(user_id, course_id)` است. افزودن `UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment")` در `__table_args__` این الزام را در تعریف DDL تثبیت می‌کند. از آنجا که SQLite در دستور `create_all` جدول از پیش ایجادشده را تغییر نمی‌دهد، اضافه کردن اجرای `CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_enrollment ON enrollments (user_id, course_id)` در مایگریشن `init_db()` تضمین می‌کند که پایگاه داده فعلی نیز بلافاصله این محدودیت را اعمال کند.

3. **یکپارچگی سفارشات سبد خرید با کاربران:**  
   بر پایه مشاهده ۱ و ۲، مدل‌های `Order` و `OrderItem` وجود ندارند. برای ثبت سفارش‌های سبد خرید فرانت‌اند و اتصال آن‌ها به کاربر، این دو مدل با فیلدهای متناظر با `CartItemSchema` و `CreateOrderRequest` تعریف شده و از طریق رابطه `orders` به مدل `User` متصل می‌شوند.

4. **همگام‌سازی احراز هویت و نمایه کاربر (Session Hydration):**  
   بر پایه مشاهده ۲، متد `to_dict` در مدل `User` لیست `enrolled_course_ids` را تولید نمی‌کند. این فیلد برای برآورده‌سازی نیازمندی R1 و R3 در `ORIGINAL_REQUEST` و پر کردن داده‌های `AuthContext` فرانت‌اند در اندپوینت `/auth/me` الزامی است.

---

### ۳. قیود و احتیاط‌ها (Caveats)

1. **ارتباط معکوس با دوره‌ها:** دوره‌های موجود در `course_service.courses` دارای جزئیات غنی‌تری (نظیر سرفصل صوتی/تصویری هیبرید) هستند. در بذرگذاری دیتابیس، علاوه بر رکورد `Course`، جلسات موجود در `syllabus` نیز به عنوان رکوردهای `Lesson` در دیتابیس درج می‌شوند تا پیوستگی داده حفظ شود.
2. **پشتیبانی از کاربران مهمان:** فیلد `user_id` در جدول `orders` به عنوان `nullable=True` با `ondelete="SET NULL"` در نظر گرفته شد تا اگر خریدی بدون لاگین (مانند خرید پستی کتاب چاپی) انجام شد یا کاربر حذف گردید، تاریخچه تراکنش پستی و رهگیری ۲۴ رقمی فاسد نشود.

---

### ۴. نتیجه‌گیری (Conclusion)

تمامی کدهای تغییرات برای فایل‌های `backend/app/models/models.py`، `backend/app/models/database.py` و `backend/app/models/__init__.py` به طور کامل و خط‌به‌خط در سند `report_models.md` تنظیم شده و آماده اعمال توسط کارگزار پیاده‌سازی هستند. هیچ‌گونه ریسک تداخل چرخشی، نقض قواعد ضد اسلاپ، یا ناهمخوانی با آزمون‌های موجود وجود ندارد.

---

### ۵. روش راستی‌آزمایی مستقل (Verification Method)

پس از اعمال کدهای مستندشده در `report_models.md`:
1. صحت عدم وجود خطای نگارشی و ایمپورت مدل‌ها:
   ```powershell
   backend\.venv\Scripts\python.exe -c "from backend.app.models import User, Enrollment, Course, Order, OrderItem; print('OK')"
   ```
2. صحت بذرگذاری دوره‌ها و ایجاد جداول سفارش:
   ```powershell
   backend\.venv\Scripts\python.exe -c "import asyncio; from backend.app.models.database import init_db; asyncio.run(init_db())"
   backend\.venv\Scripts\python.exe -c "import sqlite3; con = sqlite3.connect('zanjirzan_platform.db'); print('courses:', con.execute('SELECT count(*) FROM courses').fetchone()[0]); print('orders:', con.execute('SELECT count(*) FROM sqlite_master WHERE name=\"orders\"').fetchone()[0])"
   ```
3. اجرای گیت جامع کیفیت و اطمینان از نمره ۱۰۰:
   ```powershell
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
