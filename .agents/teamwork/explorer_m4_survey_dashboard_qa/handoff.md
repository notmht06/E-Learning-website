# Handoff Report — Dashboard & QA Survey Explorer
## پلتفرم جامع علمی و آموزشی حجت الاسلام دکتر زنجیر زن حسینی

- **Agent:** `explorer_m4_survey_dashboard_qa`
- **Role:** Teamwork Explorer (Read-only investigation & synthesis)
- **Directory:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_dashboard_qa`
- **Target Report:** `survey_dashboard_qa.md`

---

### ۱. مشاهدات مستقیم (Observation)

۱. **کدهای رندرینگ و منبع داده تب‌های داشبورد:**
   - فایل `frontend/src/components/dashboard/tabs/DashboardOverviewTab.tsx`:
     - خط ۸۱: `const { courses, orders } = useData();`
     - خط ۸۸: `const courseList = Object.values(courses);`
     - خط ۸۹: `const firstCourse = courseList[0];`
     - خط ۱۶۶: `const ongoingCourses: OngoingCourseItem[] = courseList.slice(0, 4).map((c, idx) => { ... });`
     - حجم فایل: ۲۴۴ خط (فراتر از حد مجاز ۲۰۰ خطی REA).
   - فایل `frontend/src/components/dashboard/tabs/DashboardCoursesTab.tsx`:
     - خط ۱۷: `const { courses, enrolledOnlineIds } = useData();`
     - خط ۲۰: `const enrolledList = Object.values(courses);`
     - حجم فایل: ۸۵ خط.
     - خط ۵۵: «مدرس: حجت الاسلام دکتر زنجیر زن حسینی» درج شده است.
   - فایل `frontend/src/components/dashboard/shared/OngoingCoursesTable.tsx`:
     - حجم فایل: ۱۴۴ خط.
     - خط ۹۷: `toLocale(course.completedChapters)} {dict.ongoing_session_of} {toLocale(course.totalChapters)}`
     - خط ۱۰۵: `<div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">`
     - خط ۱۲۷: `<Link href={`/courses/${course.id}/learn`} ...>` با دکمه ادامه استماع و آیکون Play.
     - خط ۶۱: وضعیت خالی با `dict.ongoing_no_courses` («هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید»).
   - فایل `frontend/src/context/AuthContext.tsx`:
     - خط ۴۵: `enrolledCourseIds: role === 'ADMIN' ? ['course1', 'course2', 'course3'] : ['course1'],`
     - خط ۱۲۴: تابع `enrollCourse` صرفاً آرایه محلی را تغییر داده و در `localStorage` می‌نویسد.
   - فایل `frontend/src/services/apiClient.ts`:
     - متدهای `courses` شامل `getAll`, `getById`, `syncProgress` است؛ متدهای `enroll` و `getEnrolled` موجود نیستند.

۲. **پایگاه‌داده بک‌اند و مدل‌ها:**
   - جدول `enrollments` در `backend/app/models/models.py` (خط ۱۳۱) و در فایل پایگاه‌داده `zanjirzan_platform.db` با فیلدهای `id`, `user_id`, `course_id`, `enrolled_at`, `status` موجود است.
   - اجرای دستور SQLite نشان داد که هم‌اکنون `courses` و `enrollments` در دیتابیس ۰ رکورد دارند و سرویس کاتالوگ دوره‌ها به شکل درون‌حافظه‌ای در `course_service.py` اداره می‌شود.
   - در `backend/app/api/v1/endpoints/courses.py` هیچ اندپوینتی برای `/courses/{course_id}/enroll` یا `/courses/enrolled` وجود ندارد.

۳. **آزمون‌های یکپارچگی بک‌اند (`backend/tests/test_in_memory.py`):**
   - دستور `backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py` با کد خروج صفر اجرا شد:
     `🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!`
   - ۱۰ آزمون شامل بررسی سلامت و نام استاد، احراز هویت با bcrypt، شیلد امنیتی RBAC، استریم صوتی DRM، کاتالوگ دوره‌ها، دستیار هوش مصنوعی، مدیریت دوره‌ها توسط ادمین و پایداری ثبت‌نام در SQLite اجرا شدند.
   - آزمون‌های یکپارچگی ثبت‌نام دوره، رد ثبت‌نام تکراری، استخراج دوره‌های کاربر و ثبت سفارش متصل به پایگاه‌داده در این فایل حضور ندارند.

۴. **پایپ‌لاین ممیزی خودکار (`audit_pipeline.py`):**
   - اجرای دستور `backend\.venv\Scripts\python.exe audit_pipeline.py` با نمره ۱۰۰/۱۰۰ کامل شد:
     `📊 امتیاز نهایی کیفیت سامانه: 100 از ۱۰۰`
     `🏆 وضعیت: تراز اول، کاملاً بهینه‌سازی‌شده و آماده بهره‌برداری پروداکشن!`
   - کلیه ۸ مرحله (تثبیت نام استاد، ضد اسلاپ، تست‌های بک‌اند، سئو، پردازش صوت، استانداردهای مخزن، نگارش فارسی اصیل، انطباق Spec Kit) موفقیت‌آمیز بودند.

۵. **بیلد پروژه فرانت‌اند (`npm run build`):**
   - دستور `npm run build` در پوشه `frontend` با خروج کد صفر به پایان رسید و ۱۵ مسیر استاتیک/داینامیک کامپایل شدند.

---

### ۲. زنجیره منطقی استنتاج (Logic Chain)

۱. **بررسی عدم اتصال به داده‌های زنده:** بر اساس مشاهده ۱ (خطوط ۸۸ و ۱۶۶ `DashboardOverviewTab.tsx` و خط ۲۰ `DashboardCoursesTab.tsx`)، دوره‌ها مستقیماً از کل کاتالوگ ماک خوانده می‌شوند. بنابراین حتی اگر کاربر در بک‌اند ثبت‌نام کند، داشبورد دوره‌ها را نشان نخواهد داد مگر اینکه منبع داده بر اساس `user.enrolledCourseIds` فیلتر شود یا از `apiClient.courses.getEnrolled()` فراخوانی شود.
۲. **بررسی عدم وجود اندپوینت‌های ثبت‌نام:** بر اساس مشاهده ۲، جدول `enrollments` در پایگاه‌داده تعریف شده اما اندپوینتی برای ثبت در آن از طریق HTTP در `courses.py` در دسترس نیست؛ بنابراین پیاده‌سازی `POST /api/v1/courses/{course_id}/enroll` و `GET /api/v1/courses/enrolled` پیش‌نیاز قطعی تحقق نیاز R1 و R3 است.
۳. **بررسی سقف خطوط کد (LOC Ceiling):** بر اساس مشاهده ۱، فایل `DashboardOverviewTab.tsx` دارای ۲۴۴ خط است که نقض صریح قاعده معماری REA (حداکثر ۲۰۰ خط) محسوب می‌شود. شکستن این فایل به یک ماژول داده/کانفیگ (`DashboardOverviewConfig.ts`) و کامپوننت اصلی کامپایل‌پذیر، حجم آن را به زیر ۱۴۰ خط می‌رساند.
۴. **بررسی پوشش آزمون‌های بک‌اند:** بر اساس مشاهده ۳، برای پاسخگویی به معیارهای پذیرش کاربر (Acceptance Criteria)، افزودن ۴ آزمون یکپارچگی جدید به `test_in_memory.py` الزامی است تا درج فیزیکی در `enrollments`، رد تکرار با کد ۴۰۰ و متن فارسی، و احراز هویت اندپوینت‌های جدید را اثبات کند.
۵. **بررسی حفظ امتیاز ۱۰۰ خط لوله:** بر اساس مشاهده ۴ و ۵، سامانه اکنون در وضعیت سبز ۱۰۰٪ است؛ هرگونه کد جدید نباید از افعال اداری (`می‌باشد`/`می‌گردد`) استفاده کند، نام استاد را تلخیص کند، یا کلاس‌های گرادیان/نئونی اسلاپ بیافزاید.

---

### ۳. احتیاط‌ها و مفروضات (Caveats)

- در دیتابیس فعلی، جدول `courses` حاوی ۰ رکورد است؛ دوره‌ها در حافظه `course_service.py` با شناسه‌هایی مانند `course-mabadi-mantiq`, `course-bidayat`, `course-asfar` تعریف شده‌اند. بنابراین در زمان ثبت‌نام، رکوردهای `enrollment` به این شناسه‌ها ارجاع خواهند داد.
- در فرانت‌اند، کاتالوگ دوره‌ها در `coursesDatabase` شناسه‌های عددی/متنی مانند `course1`, `course2` دارد که در فایل `frontend/src/lib/data.ts` تعریف شده است. هماهنگی شناسه‌ها میان فرانت‌اند و بک‌اند باید با دقت در پیاده‌سازی نهایی رعایت شود.

---

### ۴. نتیجه‌گیری (Conclusion)

نیازمندی‌های مربوط به R3 (همگام‌سازی داشبورد دانش‌پژوه) و تضمین کیفیت (QA) کاملاً شفاف، قابل تفکیک و آماده پیاده‌سازی توسط مجریان تخصصی هستند:
۱. بک‌اند نیازمند افزودن ۲ اندپوینت پایدار برای ثبت‌نام و دریافت دوره‌های ثبت‌نام‌شده در `courses.py` و ثبت سفارش در `orders.py` است.
۲. فرانت‌اند نیازمند ارتقای `apiClient`، اتصال `AuthContext`، و پالایش `DashboardCoursesTab.tsx` و `DashboardOverviewTab.tsx` بر اساس دوره‌های واقعی است.
۳. کامپوننت `DashboardOverviewTab.tsx` باید به دو فایل زیر ۲۰۰ خط تفکیک شود.
۴. فایل `test_in_memory.py` باید با ۴ آزمون یکپارچگی جدید غنی شود و اجرای آن به همراه `audit_pipeline.py` و `npm run build` تأییدیه نهایی را صادر کند.

گزارش تفصیلی در سند `survey_dashboard_qa.md` ثبت شده است.

---

### ۵. روش مستقل راستی‌آزمایی (Verification Method)

هر نماینده یا مجری می‌تواند یافته‌های این گزارش را با دستورات زیر راستی‌آزمایی کند:

۱. **آزمون سلامت خط لوله ممیزی:**
   ```powershell
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *شرط ابطال:* امتیازی کمتر از ۱۰۰/۱۰۰ ثبت شود.

۲. **آزمون‌های یکپارچگی بک‌اند:**
   ```powershell
   backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
   ```
   *شرط ابطال:* بروز خطا یا Failure در اجرای هر یک از تست‌ها.

۳. **آزمون بیلد بدون خطای فرانت‌اند:**
   ```powershell
   cd frontend
   npm run build
   ```
   *شرط ابطال:* خطای تایپ‌اسکریپت، لینت یا شکست بیلد Next.js.

۴. **بازرسی خطوط کد کامپوننت‌ها:**
   ```powershell
   backend\.venv\Scripts\python.exe -c "from pathlib import Path; print([(f.name, len(f.read_text(encoding='utf-8').splitlines())) for f in Path('frontend/src/components/dashboard').rglob('*.tsx')])"
   ```
