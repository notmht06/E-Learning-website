# سند مهندسی و معماری سیستم بک‌اند («BACKEND_SYSTEM_DESIGN.md»)
## انطباق کامل با استانداردهای دانش‌بنیان «backend-skill»
### سامانه علمی و آموزشی حجت الاسلام دکتر زنجیر زن حسینی

---

## ۱. موتورهای چهارگانه کیفیت (The 4 Quality Engines)

این سامانه مهندسی بر پایه متدولوژی عصبی `mobinhasanghasemi/backend-skill` طراحی شده و چهار موتور کیفیت زیر بر تمام ماژول‌های بک‌اند حاکم هستند:

### ۱. موتور امنیت (Security Guardian Engine)
- **احراز هویت و نشست‌ها:** استفاده از توکن‌های JWT با الگوریتم `HS256` / `RS256`، زمان انقضای معین و هشینگ امن گذرواژه‌ها با `bcrypt` / `argon2`.
- **سپر استریم صوت (DRM Streaming Shield):** تمامی درخواست‌های صوت دروس باید از طریق آدرس‌های امضاشده کوتاه‌مدت (`/api/v1/stream/play/{lesson_id}?token=...`) انجام شوند. توکن شامل شناسه کاربر، شناسه درس، آی‌پی، و زمان انقضا (TTL = 300s) است تا امکان اسکرپ فله‌ای یا اشتراک‌گذاری عمومی لینک مستقیم صوت ناممکن شود.
- **مصونیت تزریق داده (Injection Immunity):** تمام تعاملات با دیتابیس منحصراً از طریق SQLAlchemy ORM و کوئری‌های پارامتریزه انجام شده و کوئری‌های خام متنی ممنوع هستند.
- **کنترل دسترسی نقشی (RBAC):** تفکیک سطح دسترسی دانشجو (`Student`) و مدیر سامانه (`Admin`).
- **مدیریت CORS:** محدودسازی دقیق مبداهای مجاز در محیط پروداکشن.

### ۲. فرماندار سادگی و کارایی (Simplicity Governor Engine)
- **معماری ماژولار یکپارچه (Modular Monolith First):** پرهیز از ریزسرویس‌های (Microservices) غیرضروری؛ تمام دامنه‌ها در قالب یک سرویس FastAPI با ساختار لایه‌ای منسجم پیاده‌سازی می‌شوند:
  - `models/`: ساختار پایگاه داده با SQLAlchemy
  - `schemas/`: مدل‌های اعتبارسنجی ورودی/خروجی با Pydantic v2
  - `services/`: منطق بیزینس و محاسبات
  - `api/v1/endpoints/`: مسیرهای RESTful
- **پایگاه داده پایدار:** استفاده پیش‌فرض از SQLite با امکان تعویض سریع به PostgreSQL از طریق متغیر محیطی `DATABASE_URL`.

### ۳. موتور کارایی و مقیاس‌پذیری (Performance Engine)
- **ورودی/خروجی ناهمگام (Async I/O):** تمام اندپوینت‌های ترافیک بالا به صورت `async def` با بهره‌گیری از `aiosqlite` و استریم چانک‌بندی‌شده صوت (`StreamingResponse` با پشتیبانی از `Range Header` برای پیمایش سریع صوت در پلیر).
- **ایندکس‌گذاری بهینه دیتابیس:** ایندکس روی کلیدهای خارجی، اسلاگ‌ها (`slug`) و وضعیت انتشار دوره‌ها (`is_published`).
- **سرآیندهای کش (HTTP Caching Headers):** تنظیم `Cache-Control: public, max-age=3600` برای متادیتای دوره‌ها و کاتالوگ ۸ موضوع اصلی.

### ۴. موتور پایداری و تاب‌آوری (Reliability Engine)
- **مدیریت ساختاریافته خطاها:** تمام استثناها به صورت فرمت استاندارد `AppException` با کد خطای معین و پیام خطای دوزبانه بازگردانده می‌شوند.
- **تراکنش‌های امن دیتابیس (ACID Transactions):** استفاده از الگوهای Context Manager جهت Commit خودکار و Rollback در صورت بروز استثنا.
- **پایش سلامت (Liveness & Readiness Healthcheck):** اندپوینت `/` و `/api/v1/health` برای مانیتورینگ سلامت سرویس.

---

## ۲. مدل پایگاه داده (Data Models Schema)

```
[Categories] 1 ----- N [Courses] 1 ----- N [Lessons]
    |                       |
    |                       +----- N [Enrollments] M ----- 1 [Users]
    +--- (8 Disciplines)
```

1. **User:** `id`, `mobile`, `email`, `hashed_password`, `full_name`, `role` (student/admin), `is_active`, `created_at`
2. **Category:** `id`, `name`, `slug`, `description`, `icon_name`, `display_order`
3. **Course:** `id`, `category_id`, `title_fa`, `slug`, `course_type` (offline/online), `desc_fa`, `capacity`, `enrolled_count`, `skyroom_url`, `schedule`, `cover_image`, `is_published`
4. **Lesson:** `id`, `course_id`, `session_number`, `title_fa`, `audio_url`, `duration_seconds`, `audio_size_mb`, `is_free_sample`, `created_at`
5. **Enrollment:** `id`, `user_id`, `course_id`, `enrolled_at`, `status`
6. **AnalyticsLog:** `id`, `event_type`, `resource_id`, `user_id`, `ip_address`, `timestamp`

---

## ۳. قوانین معماری سیستم (ARCH Linter Directives)

- **ARCH001:** هیچ اندپوینتی نباید مستقیماً با مدل دیتابیس پاسخ دهد؛ حتماً از شمای Pydantic خروجی استفاده شود.
- **ARCH002:** تمامی آدرس‌های استریم صوت باید دارای توکن امنیتی DRM منقضی‌شونده باشند.
- **ARCH003:** نام رسمی استاد در متادیتا و پاسخ‌های سرور همواره باید **«حجت الاسلام دکتر زنجیر زن حسینی»** درج گردد.
- **ARCH004:** رمز عبور هرگز نباید به صورت متن خام در لاگ‌ها یا پاسخ‌ها نشت کند.
