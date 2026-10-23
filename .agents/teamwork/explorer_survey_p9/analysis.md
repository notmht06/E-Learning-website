# گزارش ارزیابی فنی و تحلیل جامع آزمون‌های لبه و پایپ‌لاین کیفیت (فاز ۹)
## Technical Analysis & Survey Report: Edge-Case Test Suites & Quality Pipeline (Phase 9)

**نویسنده:** عامل کاوشگر (Explorer Subagent)  
**تاریخ ارزیابی:** ۱۴ اکتبر ۲۰۲۶ (2026-10-14)  
**مسیر کاری:** `.agents/teamwork/explorer_survey_p9`  
**پایگاه:** پایگاه رسمی نشر آثار و دروس علمی حجت الاسلام دکتر زنجیر زن حسینی  

---

### ۱. چکیده اجرایی (Executive Summary)
بررسی جامع کدهای موجود در بک‌اند، سوئیت‌های آزمون (`backend/tests/test_in_memory.py` و `backend/tests/test_api_v1.py`) و پایپ‌لاین ارزیابی خودکار کیفیت (`audit_pipeline.py`) نشان می‌دهد که زیرساخت پایه احراز هویت، استریم DRM و رول‌های دسترسی پایدار است؛ اما **شکاف‌های مهمی در پوشش سناریوهای لبه (Edge Cases) مطابق با فاز ۹ مندرج در `ORIGINAL_REQUEST.md`** وجود دارد:
1. دسترسی غیرمجاز دانشجو به روت‌های جهش‌دهنده پنل مدیریت (`/api/v1/admin`) در آزمون‌ها ارزیابی نشده است (صرفاً متد خواندنی `/analytics` پوشش داده شده است).
2. استریم صوتی RFC 7233 صرفاً برای بایت‌های اولیه (`0-1023`) تست شده و سناریوهای پیمایش میانی (Scrubbing)، بازه‌های نامعتبر (HTTP 416) و تست‌های `test_api_v1.py` کاملاً غایب هستند.
3. در سرویس پرداخت (`payment_service.py`)، آسیب‌پذیری حمله تکرار (Replay Attack) وجود دارد؛ زیرا تایید مجدد توکن قبلاً تسویه‌شده بدون خطا انجام می‌شود و در روت تخفیف (`coupon_service.py`) فیلد و مکانیزم رد کوپن منقضی پیش‌بینی نشده است.
4. ماژول یادداشت‌های مطالعاتی زمانی (`/api/v1/notes`) و تالار گفتگوی علمی (`/api/v1/qa`) در سوئیت `test_in_memory.py` دارای **پوشش صفر درصد (۰٪)** هستند و در `test_api_v1.py` صرفاً ایجاد تکی تست شده و چرخه‌های CRUD، ایزولاسیون داده‌ها بین کاربران و ممانعت از پاسخ دانشجو به پرسش‌ها تست نشده است.
5. اجرای پایپ‌لاین `audit_pipeline.py` در حالت ایزوله ۱۰۰/۱۰۰ است، اما به وضعیت پایگاه‌داده فیزیکی `zanjirzan_platform.db` وابسته است و در صورت تداخل حالت بین آزمون‌ها با افت شدید به ۳۰/۱۰۰ مواجه می‌شود.

---

### ۲. بررسی وضعیت موجود سوئیت‌های آزمون (Test Suites Audit)

#### ۲.۱. فایل `backend/tests/test_in_memory.py`
- **روش فراخوانی و کلاینت:** از `TestClient(app)` کتابخانه `fastapi.testclient` به صورت سنکرون در حافظه استفاده می‌کند. نیازی به اجرای سرور مجزا ندارد.
- **محیط مفسر پایتون:** در محیط مجازی اختصاصی `backend/.venv/Scripts/python.exe` مستقر است که تمام وابستگی‌های `fastapi`, `starlette`, `httpx`, `sqlalchemy` را داراست.
- **پایگاه‌داده هدف:** فایل فیزیکی `zanjirzan_platform.db` با ارتباط مستقیم `sqlite3`.
- **آزمون‌های کنونی (۱۴ آزمون):**
  1. `test_root_health`: سلامت ریشه و نام رسمی استاد «حجت الاسلام دکتر زنجیر زن حسینی».
  2. `test_auth_endpoints`: لاگین دانشجو، رد پسورد اشتباه و صدور توکن ادمین.
  3. `test_rbac_security_shield`: دسترسی ۴۰۱ ناشناس، ۴۰۳ دانشجو و ۲۰۰ ادمین به روت `/api/v1/admin/analytics`.
  4. `test_drm_stream_shield`: صدور توکن DRM، ضربان قلب (Heartbeat) و کشف دستکاری توکن (۴۰۳).
  5. `test_audio_range_streaming`: استریم با سرآیند `Range: bytes=0-1023` و بازگشت ۲۰۶.
  6. `test_courses_catalog`: لیست دوره‌ها و سرآیندهای RateLimit.
  7. `test_ai_chat_assistant`: چت هوشمند فلسفی RAG و تحلیل اسناد.
  8. `test_admin_course_management`: ایجاد، ویرایش و حذف دوره با توکن ادمین.
  9. `test_persistent_sqlite_auth_and_registration`: ثبت‌نام کاربر، رد شماره تکراری با ۴۰۰، اعتبارسنجی bcrypt.
  10. `test_registration_persistence_and_duplicate_error`: ماندگاری داده در جدول `users` و خطای فارسی تکراری.
  11. `test_course_enrollment_persistence`: ثبت‌نام دوره در جدول `enrollments` و رد ناشناس (۴۰۱).
  12. `test_duplicate_course_enrollment_rejection`: رد ثبت‌نام تکراری دوره با HTTP 400.
  13. `test_enrolled_courses_retrieval`: دریافت دوره‌های ثبت‌نام‌شده و همگام‌سازی با `/auth/me`.
  14. `test_orders_checkout_persistence`: ثبت سفارش و ثبت‌نام خودکار دروس سبد خرید در جدول `enrollments`.

#### ۲.۲. فایل `backend/tests/test_api_v1.py`
- **روش فراخوانی و کلاینت:** از کتابخانه استاندارد `urllib.request` پایتون استفاده کرده و درخواست‌های مستقیم HTTP به سرور در حال اجرا روی پورت ۸۰۰۰ (`http://127.0.0.1:8000`) ارسال می‌کند.
- **پوشش کنونی (۱۹ سناریو):**
  شامل تست‌های Root Health, Auth Login, OTP, Courses Catalog, Course Detail, Books, Fidibo Sample, DRM Token, Heartbeat, Cart, Coupon Validate, Order Create (24-digit barcode), Postal Track, Payment Init, Payment Verify, Note Create, QA Ask, Admin Analytics.
- **نقاط ضعف بحرانی:**
  - وابستگی مطلق به اجرای زنده سرور روی پورت ۸۰۰۰.
  - هیچ بررسی امنیتی برای سناریوی عدم دسترسی دانشجو به پنل ادمین (۴۰۳) ندارد.
  - هیچ تستی برای استریم Range صوتی (RFC 7233) و کدهای ۲۰۶ ندارد.
  - هیچ تستی برای حمله تکرار در پرداخت و کوپن منقضی ندارد.
  - یادداشت‌ها را فقط ایجاد می‌کند؛ خواندن و حذف و ایزولاسیون را تست نمی‌کند.
  - پرسش Q&A را فقط ثبت می‌کند؛ ثبت پاسخ رسمی توسط ادمین و رد پاسخ‌دهی دانشجو را تست نمی‌کند.

---

### ۳. تحلیل تفصیلی ۴ دسته آزمون لبه مورد نیاز فاز ۹ (Phase 9 Edge-Case Deep Dive)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Phase 9 Edge-Case Requirements                        │
├──────────────────────────┬───────────────────────────┬───────────────────────┤
│ Edge-Case Domain         │ Current Implementation    │ Required Test Scope   │
├──────────────────────────┼───────────────────────────┼───────────────────────┤
│ 1. Admin RBAC 403        │ deps.py enforces 403 on   │ Test all mutation     │
│    (Student Forbidden)   │ non-admin, but only GET   │ endpoints with        │
│                          │ analytics was tested.     │ student token.        │
├──────────────────────────┼───────────────────────────┼───────────────────────┤
│ 2. RFC 7233 Audio Range  │ stream.py handles Range   │ Mid-seek (1024-2047), │
│    Streaming (206)       │ but test only checks      │ open-ended, 416 OOB,  │
│                          │ bytes=0-1023 in memory.   │ and test_api_v1 coverage│
├──────────────────────────┼───────────────────────────┼───────────────────────┤
│ 3. Payment Replay &      │ payment_service allows    │ Enforce replay 400    │
│    Expired Coupons       │ repeated verify. Coupons  │ and add expired coupon│
│                          │ have no expiry mechanism. │ validation.           │
├──────────────────────────┼───────────────────────────┼───────────────────────┤
│ 4. Notes CRUD &          │ Models exist in memory;   │ Full CRUD, unauth 401,│
│    Scholarly Q&A         │ zero tests in in_memory;  │ student answer 403,   │
│                          │ PUT update route missing. │ and data isolation.   │
└──────────────────────────┴───────────────────────────┴───────────────────────┘
```

#### ۳.۱. رول‌های دسترسی و مسدودسازی دانشجو در پنل مدیریت (Admin RBAC 403)
- **وضعیت پیاده‌سازی:**
  در `backend/app/api/deps.py`:
  ```python
  async def get_current_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
      if user.get("role") != "admin":
          raise HTTPException(
              status_code=status.HTTP_403_FORBIDDEN,
              detail="دسترسی به این بخش منحصراً در اختیار مدیر پایگاه است.",
          )
      return user
  ```
  تمام روت‌های `backend/app/api/v1/endpoints/admin.py` از `Depends(get_current_admin)` بهره می‌برند.
- **تست‌های لبه الزامی:**
  ۱. ارسال درخواست به تمامی متدهای جهش‌دهنده با توکن دانشجو باید دقیقاً HTTP 403 برگرداند:
     - `POST /api/v1/admin/courses/create` -> 403
     - `PUT /api/v1/admin/courses/{id}` -> 403
     - `POST /api/v1/admin/courses/{id}/chapters` -> 403
     - `PUT /api/v1/admin/courses/{id}/chapters/{chapter_id}` -> 403
     - `PUT /api/v1/admin/books/{id}` -> 403
     - `PUT /api/v1/admin/orders/{id}/status` -> 403
     - `DELETE /api/v1/admin/courses/{id}` -> 403
  ۲. ارسال درخواست بدون توکن به روت‌های فوق باید ۴۰۱ برگرداند.
  ۳. پیام خطای فارسی در بدنه پاسخ دقیقاً مطابق قوانین فارسی بدون افعال اداری بررسی گردد.

#### ۳.۲. استریم صوتی منطبق بر RFC 7233 و سرآیندهای Range (کد ۲۰۶ Partial Content)
- **وضعیت پیاده‌سازی:**
  در `backend/app/api/v1/endpoints/stream.py`:
  فایل واقعی `frontend/public/audio/sample_lecture.wav` به اندازه ۲,۸۲۲,۴۴۴ بایت وجود دارد و تابع `stream_audio_range` سرآیند `Range: bytes=start-end` را تجزیه می‌کند.
- **تست‌های لبه الزامی:**
  ۱. **اسلایس ابتدایی (Prefix Range):** `Range: bytes=0-1023` -> کد ۲۰۶، `Content-Range: bytes 0-1023/2822444`، طول بدنه ۱۰۲۴ بایت.
  ۲. **اسلایس پیمایش میانی (Mid-stream Scrubbing):** `Range: bytes=1024-2047` -> کد ۲۰۶، `Content-Range: bytes 1024-2047/2822444`، طول بدنه ۱۰۲۴ بایت.
  ۳. **اسلایس تا انتهای فایل (Open-ended Range):** `Range: bytes=2820000-` -> کد ۲۰۶، `Content-Range: bytes 2820000-2822443/2822444`، طول بدنه ۲۴۴۴ بایت.
  ۴. **بازه خارج از محدوده (Out-of-Bounds Range):** `Range: bytes=9999999-` -> باید طبق RFC 7233 وضعیت HTTP 416 Range Not Satisfiable دریافت کند.
  *(نکته فنی برای عامل پیاده‌ساز: در `stream.py` لازم است شرط `start >= file_size` بررسی شود تا به جای رشته خالی، خطای ۴۱۶ صادر گردد).*
  ۵. **سرآیندهای اجباری:** راستی‌آزمایی وجود `Accept-Ranges: bytes` و `Content-Range` در تمام پاسخ‌های ۲۰۶.
  ۶. **اولویت سپر DRM:** اگر توکن DRM نامعتبر یا منقضی باشد، حتی در صورت وجود سرآیند Range، پاسخ باید ۴۰۳ باشد نه ۲۰۶ یا ۴۱۶.

#### ۳.۳. رد حمله تکرار در پرداخت و کوپن‌های تخفیف منقضی‌شده (Replay Attack & Expired Coupons)
- **وضعیت پیاده‌سازی درگاه پرداخت:**
  در `backend/app/services/payment_service.py` متد `verify_payment` توکن `authority` را در دیکشنری `self.transactions` به وضعیت `paid` تغییر می‌دهد، اما فراخوانی دوباره همان توکن را رد نمی‌کند!
  همچنین اگر `authority` وجود نداشته باشد، تراکنش فیک تاییدشده می‌سازد.
- **اصلاح و تست‌های لبه الزامی پرداخت:**
  ۱. در `payment_service.py` یا روت `/verify`:
     اگر `self.transactions[authority]["status"] == "paid"` باشد، باید خطای HTTP 400 با پیام «این تراکنش قبلاً تایید و تسویه شده است. امکان پردازش مجدد وجود ندارد.» پرتاب کند.
  ۲. آزمون تایید مجدد (Replay Test):
     - فراخوانی `POST /api/v1/payment/init` -> دریافت `payment_token`.
     - فراخوانی اول `POST /api/v1/payment/verify` -> تایید موفق با کد ۲۰۰ و صدور کد رهگیری.
     - فراخوانی دوم `POST /api/v1/payment/verify` با همان توکن -> **رد قاطع با HTTP 400**.
- **وضعیت پیاده‌سازی کوپن‌ها:**
  در `backend/app/services/coupon_service.py` کوپن‌ها صرفاً به صورت `{"HEKMAT1403": 20, ...}` ذخیره شده‌اند و ساختار انقضا ندارند.
  همچنین در خط ۳۵ این فایل عبارت اداری `منظور گردید` وجود دارد که مغایر قوانین نگارش فارسی پروژه است.
- **اصلاح و تست‌های لبه الزامی کوپن:**
  ۱. افزودن کوپن منقضی پیش‌فرض در سرویس (مثلاً `EXPIRED1402` یا با فیلد `is_expired: True`).
  ۲. فراخوانی `POST /api/v1/coupons/validate` با کوپن منقضی -> بازگشت HTTP 400 با پیام فارسی «کد تخفیف منقضی شده است.»
  ۳. اصلاح متن پیام در `coupon_service.py`: تغییر «منظور گردید» به «منظور شد».

#### ۳.۴. عملیات کامل یادداشت‌های مطالعاتی (Notes CRUD) و تالار گفتگوی علمی (Scholarly Q&A)
- **وضعیت کنونی یادداشت‌ها (`/api/v1/notes`):**
  - اسکیماهای `StudyNoteCreate`, `StudyNoteUpdate`, `StudyNoteResponse` در `backend/app/schemas/note.py` تعریف شده‌اند.
  - اندپوینت‌های فعال در `notes.py`:
    - `GET /api/v1/notes/` (فهرست یادداشت‌ها بر اساس `user_id` توکن)
    - `POST /api/v1/notes/create` (ایجاد یادداشت با `timestamp_sec`)
    - `DELETE /api/v1/notes/{note_id}` (حذف یادداشت کاربر)
  - **شکاف:** روت ویرایش (`PUT /api/v1/notes/{note_id}`) با وجود داشتن اسکیما در روت اصلی رجیستر نشده است.
  - تست‌های لبه:
    ۱. دسترسی ناشناس به تمام روت‌ها -> HTTP 401.
    ۲. دانشجوی الف یادداشتی برای درس `course-ishraq` با ثانیه ۴۲۰ ثبت می‌کند -> کد ۲۰۰.
    ۳. دانشجوی الف یادداشت‌های خود را دریافت و فیلتر می‌کند -> کد ۲۰۰.
    ۴. دانشجوی ب لاگین کرده و یادداشت‌ها را درخواست می‌دهد -> یادداشت‌های دانشجوی الف نباید نمایش داده شود (ایزولاسیون کامل).
    ۵. دانشجوی ب اقدام به حذف یادداشت دانشجوی الف می‌کند -> باید ناموفق یا ۴۰۳/۴۰۴ باشد.
    ۶. دانشجوی الف یادداشت خود را حذف می‌کند -> کد ۲۰۰، بررسی عدم وجود در درخواست بعدی.
- **وضعیت کنونی تالار علمی (`/api/v1/qa`):**
  - اندپوینت‌های فعال در `qa.py`:
    - `GET /api/v1/qa/` (عمومی - دریافت مباحثات)
    - `POST /api/v1/qa/ask` (نیاز به توکن دانشجو - ثبت پرسش با `title` و `question_text`)
    - `POST /api/v1/qa/{question_id}/answer` (نیاز به **توکن ادمین** - ثبت پاسخ استاد)
  - تست‌های لبه:
    ۱. دریافت عمومی پرسش‌ها بدون توکن -> کد ۲۰۰.
    ۲. ارسال پرسش بدون توکن -> کد ۴۰۱.
    ۳. ارسال پرسش با توکن دانشجو -> کد ۲۰۰ و دریافت شناسه `qa-xxx` با وضعیت `is_resolved: False`.
    ۴. **تلاش دانشجو برای پاسخ به پرسش (`POST /{id}/answer` با توکن دانشجو):**
       باید توسط دیپندنسی `get_current_admin` با **HTTP 403 Forbidden** قاطعانه رد شود!
    ۵. پاسخ‌دهی توسط ادمین (`POST /{id}/answer` با توکن ادمین) -> کد ۲۰۰ و وضعیت `is_resolved: True`.
    ۶. تلاش ادمین برای پاسخ به پرسش ناموجود (`qa-fake-999`) -> کد ۴۰۴ Not Found.

---

### ۴. تحلیل پایپ‌لاین ارزیابی خودکار کیفیت (`audit_pipeline.py`)

پایپ‌لاین شامل ۸ مرحله ارزیابی وزنی است:

| گام | موضوع بررسی | وضعیت فعلی | ریسک‌ها و نکات مهندسی |
| :--- | :--- | :---: | :--- |
| **۱** | تثبیت نام رسمی استاد | ۱۰۰/۱۰۰ | بررسی تطابق دقیق «حجت الاسلام دکتر زنجیر زن حسینی» در ۶ فایل حیاتی. |
| **۲** | مانیفست ضد اسلاپ (Anti-AI-Slop) | ۱۰۰/۱۰۰ | بررسی عبارات `blur-3xl`, `text-transparent bg-clip-text`, `animate-pulse` در کامپوننت‌های فرانت‌اند. |
| **۳** | تست‌های خودکار بک‌اند و DRM | ۱۰۰/۱۰۰ | اجرای `test_in_memory.py` با مفسر `backend/.venv`. **ریسک بالا در صورت عدم ایزولاسیون دیتابیس SQLite.** |
| **۴** | استانداردهای سئو، نقشه سایت و llms.txt | ۱۰۰/۱۰۰ | وجود فایل‌های `sitemap.ts`, `robots.ts`, `llms.txt`, `SEO_STANDARDS.md`. |
| **۵** | زیرساخت پردازش موازی صوت | ۱۰۰/۱۰۰ | وجود نوتبوک‌های Colab و Kaggle با `ProcessPoolExecutor`. |
| **۶** | اسناد حافظه دائمی و قوانین پروژه | ۱۰۰/۱۰۰ | حضور ۷ فایل ریشه و قوانین `.agents/rules/`. |
| **۷** | نگارش فارسی اصیل (Persian Writing) | ۱۰۰/۱۰۰ | پاکیزگی فایل‌های فرانت‌اند از افعال اداری (`می‌باشد`, `گردید`) و کلیشه‌ها. |
| **۸** | استانداردهای Spec Kit | ۱۰۰/۱۰۰ | بررسی `specs/constitution.md` و ماژول‌های حرکتی. |

#### ریسک‌های شناسایی‌شده در پایپ‌لاین:
1. **آلودگی حالت پایگاه‌داده (Database State Contamination):**
   فایل `backend/tests/test_in_memory.py` مستقیماً روی `zanjirzan_platform.db` می‌نویسد. اگر تستی در میانه کار متوقف شود یا پیش‌شرط‌هایی مثل `count_before == 1` برقرار نباشد، بازگشت اسکریپت با `exit code != 0` باعث می‌شود نمره این مرحله به ۳۰ کاهش یافته و نمره کل سامانه به ۹۱ از ۱۰۰ سقوط کند.
   *راهکار:* کلیه توابع آزمون باید دارای `setup` و `teardown` مستقل بوده و برای شناسه‌ها از مقادیر یکتا (`uuid.uuid4()`) استفاده کنند.
2. **هشدار قدیمی بودن Starlette Deprecation Warning:**
   پکیج `starlette.testclient` هشدار می‌دهد که به جای `httpx` باید از `httpx2` استفاده شود. این هشدار در `stderr` چاپ می‌شود. اسکریپت `audit_pipeline.py` از `res.returncode == 0` استفاده می‌کند؛ لذا خروجی stderr مادامی که return code صفر باشد خللی در نمره ایجاد نمی‌کند، اما برای تمیزی لاگ‌ها بهتر است فیلتر شود (`warnings.filterwarnings("ignore")`).

---

### ۵. طرح پیاده‌سازی و ماتریس آزمون‌های تکمیلی برای سوئیت‌های بک‌اند

برای فاز بعد (پیاده‌سازی)، تغییرات و آزمون‌های زیر باید مستقر شوند:

```
                               ┌────────────────────────────────┐
                               │  Implementation Action Plan    │
                               └────────────────┬───────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         │                                      │                                      │
         ▼                                      ▼                                      ▼
┌───────────────────┐                  ┌───────────────────┐                  ┌───────────────────┐
│ payment_service   │                  │ coupon_service    │                  │ Test Suites       │
│ & endpoints       │                  │ & endpoints       │                  │ Updates           │
├───────────────────┤                  ├───────────────────┤                  ├───────────────────┤
│ • Prevent replay  │                  │ • Add expired     │                  │ • test_in_memory: │
│   on verify (400) │                  │   coupon logic    │                  │   +6 edge tests   │
│ • Enforce status  │                  │ • Fix Persian     │                  │ • test_api_v1:    │
│   tracking        │                  │   tell (گردید)    │                  │   +5 edge steps   │
└───────────────────┘                  └───────────────────┘                  └───────────────────┘
```

#### تست‌های جدید برای `backend/tests/test_in_memory.py`:
1. `test_admin_rbac_forbidden_for_students(student_token: str)`:
   - تست تمام روت‌های جهش‌دهنده پنل ادمین (ایجاد دوره، ویرایش دوره، ایجاد فصل، ویرایش وضعیت سفارش، حذف دوره) با توکن دانشجو و بررسی دریافت HTTP 403.
2. `test_audio_range_streaming_advanced(drm_token: str)`:
   - تست بازه میانی (`Range: bytes=1024-2047`) -> HTTP 206.
   - تست بازه انتهای فایل (`Range: bytes=2820000-`) -> HTTP 206.
   - تست بازه خارج از محدوده (`Range: bytes=9999999-`) -> HTTP 416.
   - تست سرآیند Range با توکن دستکاری‌شده DRM -> HTTP 403.
3. `test_payment_replay_attack_rejection()`:
   - فراخوانی `/init` -> دریافت توکن.
   - فراخوانی اول `/verify` -> ۲۰۰.
   - فراخوانی دوم `/verify` -> HTTP 400 با پیام خطای تایید مجدد.
4. `test_expired_coupon_rejection()`:
   - ارسال کوپن `EXPIRED1402` به `/api/v1/coupons/validate` -> HTTP 400.
5. `test_study_notes_crud_and_isolation(student_token_a: str, student_token_b: str)`:
   - ایجاد یادداشت با `timestamp_sec` توسط کاربر A.
   - واکشی و فیلتر یادداشت‌ها توسط کاربر A.
   - واکشی توسط کاربر B و تایید عدم مشاهده یادداشت‌های کاربر A.
   - حذف یادداشت توسط کاربر A و تایید حذف.
   - بررسی رد درخواست‌های ناشناس با ۴۰۱.
6. `test_scholarly_qa_lifecycle_and_rbac(student_token: str, admin_token: str)`:
   - ثبت پرسش توسط دانشجو -> دریافت شناسه پرسش.
   - **تلاش دانشجو برای ثبت پاسخ -> رد با HTTP 403.**
   - ثبت پاسخ رسمی توسط ادمین -> ۲۰۰ و `is_resolved: True`.
   - پاسخ به شناسه ناموجود توسط ادمین -> ۴۰۴.

#### تست‌های متناظر برای `backend/tests/test_api_v1.py`:
- افزودن سناریوی ۲۰: رد دسترسی دانشجو به پنل ادمین (۴۰۳).
- افزودن سناریوی ۲۱: درخواست RFC 7233 Range صوت و اعتبارسنجی کد ۲۰۶ و `Content-Range`.
- افزودن سناریوی ۲۲: ممانعت از Replay Attack در تایید پرداخت (۴۰۰).
- افزودن سناریوی ۲۳: رد کوپن تخفیف منقضی‌شده با کد ۴۰۰.
- افزودن سناریوی ۲۴: چرخه کامل یادداشت‌ها (لیست و حذف پس از ایجاد).
- افزودن سناریوی ۲۵: چرخه تالار علمی (ممانعت از پاسخ دانشجو با ۴۰۳ و تایید پاسخ ادمین با ۲۰۰).

---

### ۶. جمع‌بندی
این ارزیابی فنی کلیه مؤلفه‌ها، فایل‌های سورس، اسکیماها و آزمون‌ها را شفاف کرد. سیستم آماده پیاده‌سازی گام‌های فاز ۹ بدون هیچ‌گونه ابهام، با رعایت کامل نام رسمی **«حجت الاسلام دکتر زنجیر زن حسینی»** و استانداردهای ضد اسلاپ و کیفیت مهندسی بک‌اند است.
