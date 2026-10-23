# Handoff Report: QA Verification & Pipeline Survey
## کاوشگر ارزیابی کیفیت، خط لوله آزمون و معیارهای پذیرش سامانه

---

### ۱. مشاهدات عینی (Observation)

1. **خط لوله ممیزی خودکار (`audit_pipeline.py:207-230`):**
   - اسکریپت شامل ۸ گام مستقل با وزن یکسان ۱۲.۵٪ است: `check_scholar_identity`، `check_anti_slop_rules`، `check_backend_tests`، `check_seo_artifacts`، `check_audio_processing_assets`، `check_root_standards`، `check_persian_writing_quality`، `check_spec_kit_compliance`.
   - اجرای مستقیم با `& "backend\.venv\Scripts\python.exe" audit_pipeline.py` خروجی زیر را با کد خروج ۰ ثبت کرد:
     ```
     📊 امتیاز نهایی کیفیت سامانه: 100 از ۱۰۰
     🏆 وضعیت: تراز اول، کاملاً بهینه‌سازی‌شده و آماده بهره‌برداری پروداکشن!
     ```
2. **آزمون‌های یکپارچگی بک‌اند (`backend/tests/test_in_memory.py:21-52`):**
   - نمونه‌سازی با `client = TestClient(app)` خارج از کانتکست منیجر انجام شده است.
   - تابع `test_auth_endpoints` ورود کاربر با تلفن `"09123456789"` و کلمه عبور `"pass"` (نقش student) و کاربر `"09120000000"` با کلمه عبور `"admin_secret_2026"` (نقش admin) را به صورت صریح تست می‌کند:
     ```python
     res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
     assert res.status_code == 200
     assert data["role"] == "student"
     ```
   - توکن‌های بازگردانده شده مستقیماً به تست‌های `test_rbac_security_shield` و `test_admin_course_management` تزریق می‌شوند.
   - اجرای مستقیم با `& "backend\.venv\Scripts\python.exe" backend\tests\test_in_memory.py` با کد ۰ و چاپ `🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!` پایان یافت.
3. **وضعیت جدول دیتابیس (`zanjirzan_platform.db`):**
   - استخراج اطلاعات ساختار جدول: `PRAGMA table_info(users)` فیلدهای `id (VARCHAR(50))`, `mobile (VARCHAR(20) NOT NULL)`, `email (VARCHAR(100))`, `full_name (VARCHAR(100))`, `hashed_password (VARCHAR(255) NOT NULL)`, `role (VARCHAR(20))`, `is_active (BOOLEAN)`, `created_at (DATETIME)` را تایید کرد.
   - استخراج داده‌های موجود: `SELECT id, mobile, full_name, role FROM users` مقدار تهی بازگرداند: `Users: []`.
4. **سرویس احراز هویت فعلی (`backend/app/services/auth_service.py:14-34`):**
   - کاربران درون یک دیکشنری درون‌حافظه‌ای مقیم هستند:
     ```python
     self.users: Dict[str, Dict[str, Any]] = {
         "09123456789": { "id": "usr-140301", "role": "student", ... },
         "09120000000": { "id": "adm-001", "role": "admin", ... }
     }
     ```
5. **رفتار چرخه حیات (Lifespan) در FastAPI (`backend/app/main.py:23-32`):**
   - تابع `init_db()` صرفاً درون کانتکست منیجر `lifespan` قرار دارد. اجرای آزمایشی `TestClient(app)` نشان داد که بدون کانتکست منیجر `with TestClient(app):`، دستورات درون `lifespan` اجرا نمی‌شوند و عبارت `[INFO] Database tables initialized successfully.` چاپ نمی‌گردد.
6. **آزمون انطباق لغت‌نامه‌ها (`backend/tests/test_i18n_parity.py:40-44`):**
   - خروجی فرمان: `Total keys - FA: 676, AR: 676, EN: 676` و `✅ All i18n parity, typing, and compliance checks PASSED!`.
   - الزام صریح برابری و ترتیب کلیدها: `assert fa_keys == ar_keys == en_keys`.
7. **بیلد پروداکشن فرانت‌اند (`frontend/package.json`, `next.config.js`):**
   - اجرای `npx tsc --noEmit` در `frontend/` با کد ۰ پایان یافت (بدون خطای تایپ).
   - اجرای `npm run build` در `frontend/` هر ۱۵ روت و سرویس ورکر PWA (`sw.js` و `workbox-4aca9c00.js`) را با کد ۰ با موفقیت کامپایل کرد.
8. **ساختار کلاینت API در فرانت‌اند (`frontend/src/services/apiClient.ts:50-76`):**
   - ماژول `apiClient.auth` شامل توابع `login`, `register`, `sendOtp`, `verifyOtp`, `getMe` است که توکن نشست را از `localStorage.getItem('zanjirzan_token')` می‌خواند.

---

### ۲. زنجیره منطقی (Logic Chain)

1. بر اساس مشاهده ۱، نمره کل ممیزی میانگین ریاضی ۸ گام است. گام ۳ مستقیماً به خروجی موفقیت‌آمیز `test_in_memory.py` وابسته است.
2. بر اساس مشاهده ۲، آزمون `test_in_memory.py` منحصراً به صحت ورود دو کاربر با شماره تلفن‌های `09123456789` و `09120000000` متکی است و توکن آن‌ها برای آزمون‌های متعاقب RBAC و CRUD ادمین حیاتی است.
3. بر اساس مشاهده ۳ و ۴، این دو کاربر هم‌اکنون تنها در متغیر حافظه‌ای `self.users` در پایتون وجود دارند و جدول `users` در دیتابیس SQLite کاملاً خالی است.
4. بر اساس مشاهده ۵، اگر پیاده‌ساز صرفاً دیکشنری حافظه‌ای را با کوئری‌های دیتابیس جایگزین کند و به اجرای `lifespan` برای سیدینگ اتکا نماید، `test_in_memory.py` به دلیل اجرا نشدن `lifespan` در TestClient، کاربران را در دیتابیس نمی‌یابد و در گام دوم با خطای ۴۰۰/۴۰۱ کرش می‌کند. در نتیجه گام ۳ ممیزی نمره ۳۰ می‌گیرد و امتیاز کل به زیر ۱۰۰ سقوط می‌کند.
5. بر اساس مشاهده ۶، هرگونه پیام خطای جدید برای فرم لاگین/ثبت‌نام که در لغت‌نامه فارسی (`fa.ts`) اضافه شود، باید متناظراً و با ترتیب یکسان در `ar.ts` و `en.ts` درج گردد؛ در غیر این صورت `test_i18n_parity.py` شکسته خواهد شد.
6. بر اساس مشاهده ۷ و ۸، فرانت‌اند دارای زیرساخت کامل تایپ‌اسکریپت و کلاینت API است. پیاده‌سازی فرم لاگین/ثبت‌نام زنده و رعایت سقف ۲۰۰ خط مستلزم تفکیک فرم‌ها و استخراج منطق جهش به هوک `useAuthForm.ts` است.

---

### ۳. محدودیت‌ها و حوزه‌های بررسی‌نشده (Caveats)

1. **نصب نبودن Pytest:** ابزار `pytest` در محیط مجازی `backend/.venv` نصب نیست. آزمون‌ها مستقیماً به صورت اسکریپت پایتون اجرا می‌شوند و هرگونه ابزار CI/CD یا راهنما نباید از فرمان `pytest` استفاده کند.
2. **پایداری SQLite در چند ترد هم‌زمان:** از آنجا که SQLite به صورت فایل تک‌کاربره روی دیسک کار می‌کند، تست‌های موازی چندنخی ممکن است با خطای قفل دیتابیس مواجه شوند؛ بنابراین تست‌ها باید تک‌رشته‌ای اجرا شوند.
3. **فرمان `next lint`:** دستور `next lint` به صورت تعاملی درخواست کانفیگ می‌دهد (به دلیل تغییرات Next.js 15)؛ لذا معیار سنجش کامپایل و تایپ در فرانت‌اند منحصراً فرامین `npm run build` و `npx tsc --noEmit` هستند.

---

### ۴. نتیجه‌گیری (Conclusion)

خط لوله تضمین کیفیت، آزمون‌های یکپارچگی بک‌اند، و بیلد فرانت‌اند در وضعیت فعلی در سلامت ۱۰۰٪ قرار دارند. برای موفقیت کامل در پیاده‌سازی «احراز هویت پایدار متصل به دیتابیس»، عامل‌های پیاده‌ساز باید دقیقاً سه الزام را رعایت کنند:
1. **تضمین سیدینگ خودکار دیتابیس:** کاربران پیش‌فرض دانشجو (`09123456789`) و مدیر ارشد (`09120000000`) با کلمات عبور مشخص باید در اولین فراخوانی سرویس یا دیتابیس در جدول `users` درج شوند تا آزمون‌های موجود بدون وقفه پاس شوند.
2. **گسترش آزمون‌های `test_in_memory.py`:** افزودن تست‌های صریح برای `register_user`، اعتبارسنجی رد شماره تکراری با خطای ۴۰۰ ساختاریافته فارسی، و هیدراسیون نشست `/api/v1/auth/me`.
3. **انضباط ماژولار و سه‌زبانه در فرانت‌اند:** تفکیک صفحه لاگین به هوک `useAuthForm.ts` و کامپوننت‌های کمتر از ۲۰۰ خط، و همگام‌سازی کلیدهای لغت‌نامه در `fa.ts`, `ar.ts`, `en.ts`.

---

### ۵. روش مستقل راستی‌آزمایی (Verification Method)

هر عامل پیاده‌ساز یا ناظر می‌تواند صحت نتایج را با اجرای ترتیبی ۵ فرمان زیر در ترمینال پاورشل ویندوز تایید کند:

```powershell
# ۱. اعتبارسنجی خط لوله ممیزی ۱۰۰ امتیازی
$env:PYTHONPATH="E:\personal\philosophy_zanjirzan_app"
$env:PYTHONIOENCODING="utf-8"
& "backend\.venv\Scripts\python.exe" audit_pipeline.py
# شرط قبولی: چاپ "📊 امتیاز نهایی کیفیت سامانه: 100 از ۱۰۰" و کد خروج ۰

# ۲. اعتبارسنجی تست‌های یکپارچگی بک‌اند
& "backend\.venv\Scripts\python.exe" backend\tests\test_in_memory.py
# شرط قبولی: چاپ "🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!" و کد خروج ۰

# ۳. اعتبارسنجی انطباق لغت‌نامه‌های سه‌زبانه
& "backend\.venv\Scripts\python.exe" backend\tests\test_i18n_parity.py
# شرط قبولی: چاپ "✅ All i18n parity, typing, and compliance checks PASSED!" و کد خروج ۰

# ۴. بررسی سلامت تایپ‌های تایپ‌اسکریپت فرانت‌اند
cd frontend
npx tsc --noEmit
# شرط قبولی: بدون هیچ خروجی خطا و کد خروج ۰

# ۵. کامپایل و بیلد نهایی Next.js و تولید دارایی‌های PWA
npm run build
# شرط قبولی: کامپایل تمامی ۱۵ صفحه و چاپ "✓ Generating static pages (15/15)" و کد خروج ۰
```

**شرایط ابطال (Invalidation Conditions):**
- افت امتیاز خط لوله ممیزی به کمتر از ۱۰۰ در هر مرحله.
- بروز خطای یکتایی (IntegrityError) درمان‌نشده در هنگام ثبت شماره تکراری در بک‌اند.
- نامتقارن شدن تعداد یا ترتیب کلیدها در لغت‌نامه‌های `locales/`.
- نقض سقف ۲۰۰ خطی در هر یک از کامپوننت‌های فرانت‌اند.
