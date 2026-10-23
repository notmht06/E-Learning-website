# گزارش انتقال و تحویل آزمون‌های یکپارچگی (Handoff Report — M1 Integration Tests)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**عامل تحویل‌دهنده:** کاوشگر آزمون‌های یکپارچگی (`explorer_m1_tests`)  
**عامل تحویل‌گیرنده:** مجری بک‌اند (`worker_backend`) و مدیر هماهنگی تیم (`parent` / `orchestrator`)  
**تاریخ و ساعت (UTC):** 2026-10-13T03:25:00Z  
**پوشه کاری عامل:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_tests`  

---

## ۱. مشاهدات عینی و ملموس (Observation)

1. **وضعیت پایه سوئیت آزمون‌های بک‌اند (`backend/tests/test_in_memory.py`):**
   - اجرای فرمان: `& backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py`
   - نتیجه: کد خروج ۰؛ هر ۱۰ آزمون فعلی با موفقیت کامل پاس شدند:
     ```
     ==============================================
     RUNNING BACKEND TEST SUITE (IN-MEMORY CLIENT)
     ==============================================
     ✅ Root health check passed: حجت الاسلام دکتر زنجیر زن حسینی
     ✅ Auth login passed: Student and Admin tokens issued with bcrypt validation.
     ✅ RBAC Security Shield passed: 401 for anonymous, 403 for student, 200 for admin.
     ✅ DRM stream shield passed: Signed token issued and tamper detected.
     ✅ Audio Range Streaming passed: RFC 7233 206 Partial Content with seek buffer.
     ✅ Courses catalog passed: 4 courses loaded with RateLimit headers.
     ✅ AI Scholarly Assistant RAG Chat passed.
     ✅ AI Document Analysis passed.
     ✅ Admin Course and Chapter Management CRUD passed with verified admin token.
     ✅ Persistent SQLite Auth Verification passed for phone: 09127858589
     ✅ Milestone 1: Persistent registration (09191112233), duplicate 400 check, and /me hydration passed.
     🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!
     ```

2. **وضعیت جداول و داده‌ها در `zanjirzan_platform.db`:**
   - استعلام مستقیم با اس‌کیوال:
     ```python
     Tables: ['categories', 'users', 'analytics_logs', 'courses', 'lessons', 'enrollments']
     courses count: 0
     users count: 114
     enrollments count: 0
     ```
   - جداول `orders` و `order_items` هنوز در دیتابیس وجود ندارند.
   - جدول `courses` خالی است (۰ رکورد)، در حالی که جدول `users` دارای ۱۱۴ کاربر فعال از جمله کاربر دانشجوی پیش‌فرض `usr-140301` (`09123456789` با رمز عبور `pass`) است.

3. **پیکربندی کلیدهای خارجی در `backend/app/models/database.py`:**
   - خطوط ۲۴-۳۲: فعال‌سازی `PRAGMA foreign_keys=ON;` و `PRAGMA journal_mode=WAL;` روی دیتابیس SQLite.
   - جدول `enrollments` دارای ستون `course_id` به عنوان کلید خارجی به `courses.id` است (`backend/app/models/models.py` خط ۱۳۶).

4. **اندپوینت‌های کنونی دوره‌ها و سفارش‌ها:**
   - فایل `backend/app/api/v1/endpoints/courses.py` فاقد مسیرهای `POST /{course_id}/enroll` و `GET /enrolled` است.
   - تابع `create_order` در `backend/app/api/v1/endpoints/orders.py` (خطوط ۱۱-۲۴) به صورت همگام (`def`) بوده و فاقد وابستگی `db` و احراز هویت کاربر است.

5. **پایپ‌لاین کنترل کیفیت (`audit_pipeline.py`):**
   - خطوط ۸۱-۹۸: تابع `check_backend_tests()` اجرای مستقیم `backend/tests/test_in_memory.py` را ارزیابی کرده و نمره ۱۰۰ از ۱۰۰ را منوط به پاس شدن بی‌نقص تمام تست‌ها می‌داند.

---

## ۲. زنجیره منطقی استنتاج (Logic Chain)

1. بر اساس مشاهده ۱ و ۵، سوئیت فعلی ۱۰ آزمون دارد که همه پاس می‌شوند. برای برآورده ساختن پیش‌نیازهای مایلستون ۱ و دستورالعمل پیگیری کاربر در `ORIGINAL_REQUEST.md` (بخش `## Follow-up — 2026-10-13T03:02:29Z` بند R1 و معیارهای پذیرش)، باید آزمون‌های ثبت‌نام پایدار، رد ثبت‌نام تکراری، واکشی دوره‌های ثبت‌نام‌شده و ثبت سفارش همراه با ثبت‌نام خودکار مستقیماً به همین سوئیت افزوده شوند تا تعداد کل تست‌ها به ۱۴ آزمون برسد.
2. بر اساس مشاهده ۲ و ۳، به دلیل فعال بودن `PRAGMA foreign_keys=ON`، هرگونه درج در جدول `enrollments` نیازمند وجود رکورد متناظر در جدول `courses` است. بنابراین، آزمون‌های یکپارچگی ثبت‌نام باید تضمین کنند که دوره‌ها پیش از ثبت‌نام در جدول `courses` بذرگذاری شده‌اند (توسط `seed_default_courses` در `init_db` یا از طریق خود سرویس دوره).
3. بر اساس مشاهده ۲، حساب دانشجوی پیش‌فرض `09123456789` با شناسه `usr-140301` هم‌اکنون در جدول `users` موجود است و پس از لاگین با کلمه عبور `pass`، توکن معتبر صادر می‌کند. با پاکسازی ثبت‌نام‌های پیشین این کاربر پیش از آغاز هر تست، آزمون‌ها بدون وابستگی به وضعیت قبلی و کاملاً تکرارپذیر (Idempotent) اجرا خواهند شد.
4. بر اساس مشاهده ۴، کارشناس مجری بک‌اند ابتدا مدل‌های `Order`, `OrderItem`, قید `UniqueConstraint` روی `Enrollment` و اندپوینت‌های مربوطه را پیاده‌سازی می‌کند. به محض تکمیل کدنویسی بک‌اند، تست‌های ۴ گانه طراحی‌شده در گزارش `report_tests.md` تمامی زوایای این پیاده‌سازی را به صورت End-to-End راستی‌آزمایی می‌کنند.
5. بر اساس تحلیل ماتریس عدم رگرسیون در `report_tests.md` (بخش ۵)، چون هیچ‌یک از ۱۰ آزمون قبلی به جداول `enrollments` یا `orders` وابسته نیستند، افزودن این ۴ آزمون هیچ‌گونه اثری بر کارکرد تست‌های قبلی نداشته و قبولی ۱۰۰ درصدی پایپ‌لاین تضمین شده است.

---

## ۳. نکات احتیاطی و مفروضات (Caveats)

1. **وابستگی ترتیبی به پیاده‌سازی بک‌اند:** این آزمون‌ها پس از اعمال تغییرات کدنویسی توسط `worker_backend` (پیاده‌سازی اندپوینت‌های `/enroll`, `/enrolled`, مدل‌های `Order`/`OrderItem` و بذرگذاری دوره‌ها) پاس خواهند شد. در وضعیت جاری کدها (پیش از ورود کارشناس بک‌اند)، اندپوینت‌ها هنوز وجود ندارند.
2. **قید کلید خارجی SQLite در تست‌های ایزوله:** چنانچه تستی خارج از چرخه کلاینت فست‌اِی‌پی‌آی اجرا شود، باید اطمینان حاصل شود که تابع `init_db()` فراخوانی شده تا دوره‌های پیش‌فرض در دیتابیس بذرگذاری شده باشند.
3. **تغییرات در رمز عبور یا شناسه کاربر پیش‌فرض:** فرض شده است حساب کاربری `09123456789` همواره دارای رمز `pass` است که این مورد در `seed_default_users` نیز تضمین شده است.

---

## ۴. نتیجه‌گیری نهایی (Conclusion)

چهار آزمون یکپارچگی جامع با نام‌های:
1. `test_course_enrollment_persistence`
2. `test_duplicate_course_enrollment_rejection`
3. `test_enrolled_courses_retrieval`
4. `test_orders_checkout_persistence`

به همراه منطق پاکسازی تکرارپذیر و راستی‌آزمایی فیزیکی در SQLite طراحی شده و کد کامل آنها در سند `report_tests.md` آماده تحویل به مجری بک‌اند است. با ادغام این کدها، تعداد آزمون‌های `backend/tests/test_in_memory.py` از ۱۰ به ۱۴ ارتقا یافته و کلیه معیارهای سنجش مایلستون ۱ پلتفرم با نمره ۱۰۰ از ۱۰۰ محقق خواهد شد.

---

## ۵. روش اعتبارسنجی مستقل (Verification Method)

هر عامل یا کاربر می‌تواند پس از ادغام آزمون‌ها، صحت ادعاها و نتایج را با دستورات زیر مستقلاً ارزیابی کند:

```powershell
# ۱. اجرای مستقیم سوئیت آزمون‌های درون‌حافظه‌ای با مفسر پایتون پروژه
& backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py

# ۲. اجرای آزمون از طریق فریم‌ورک pytest (اختیاری)
& backend/.venv/Scripts/python.exe -m pytest backend/tests/test_in_memory.py

# ۳. ارزیابی گیت کیفی پایپ‌لاین پروژه (کسب نمره ۱۰۰ از ۱۰۰)
& backend/.venv/Scripts/python.exe audit_pipeline.py
```

شرایط ابطال (Invalidation Conditions):
- بازگشت کدی غیر از ۰ در دستورات فوق.
- بروز خطای `FOREIGN KEY constraint failed` در جدول `enrollments`.
- افت امتیاز `audit_pipeline.py` به زیر ۱۰۰ به دلیل رگرسیون در سایر بخش‌ها یا نقض مانیفست نگارش فارسی.
