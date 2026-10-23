# گزارش جامع بررسی معماری تمیز و اعتبارسنجی مبتنی بر آزمون (R3 & R4)
## پلتفرم جامع علمی و پژوهشی حجت الاسلام دکتر زنجیر زن حسینی
**شناسه کاوشگر:** `explorer_survey_arch_1`  
**تاریخ گزارش:** ۷ اکتبر ۲۰۲۶ (۱۶ مهر ۱۴۰۵)  
**مسیر خروجی:** `.agents/teamwork/explorer_survey_arch_1/report.md`

---

## ۱. خلاصه اجرایی (Executive Summary)

این گزارش به بررسی عمیق دو محور بنیادین پروژه یعنی **معماری تمیز فرانت‌اند (Clean Architecture - R3)** و **اعتبارسنجی رفتاری و خطوط قرمز کیفیت (Test-Driven Verification - R4)** می‌پردازد.

### وضعیت فعلی دروازه کیفیت (Quality Gate Status):
1. **پایپ‌لاین ارزیابی خودکار (`audit_pipeline.py`):** با اجرای مفسر پایتون محیط مجازی (`backend/.venv/Scripts/python.exe audit_pipeline.py`) امتیاز کامل **۱۰۰ از ۱۰۰** را در ۸ شاخه کیفی کسب می‌کند.
2. **آزمون‌های یکپارچگی بک‌اند (`backend/tests/test_in_memory.py`):** آزمون‌های ۹‌گانه احراز هویت، کنترل دسترسی RBAC، شیلد امنیتی DRM، استریم جزئی صوت (RFC 7233 Range Requests)، کاتالوگ و دستیار هوشمند RAG با **۱۰۰٪ موفقیت** پاس می‌شوند.
3. **وضعیت کامپایل فرانت‌اند (`npm run build`):** در حال حاضر فرآیند ساخت با یک خطای تایپ‌اسکریپت در کامپوننت `AdminStatsTab.tsx:25` مواجه است (`Type error: comparison between '"مسدود‌شده"' and '"Active"' has no overlap`) که نیازمند اصلاح فوری در فاز اول بازسازی است.
4. **معماری ساختار فایل‌ها:** هم‌اکنون ۴۰۴۵ سطر داده و دیکشنری زبان‌ها در یک فایل متورم (`frontend/src/lib/data.ts`) تجمیع شده است. تفکیک لایه‌ای کامپوننت‌ها به Primitives، Shell، Features و ایجاد مخزن مستقل دیکشنری‌های چندزبانه تایپ‌شده (`messages/fa.ts`، `messages/ar.ts`، `messages/en.ts`) کاملاً ضروری و امکان‌پذیر است.

---

## ۲. کالبدشکافی دقیق `audit_pipeline.py` (اسکن‌ها، فایل‌ها و خطوط قرمز)

اسکریپت `audit_pipeline.py` به عنوان مرجع قطعی کیفیت پروژه، ۸ مرحله را ارزیابی می‌کند. کوچک‌ترین تغییر ناآگاهانه در ساختار فایل‌ها می‌تواند امتیاز را تخریب کند:

| مرحله ارزیابی | مسیرهای اسکن‌شده | الگوها و رجکس‌های کنترلی | شرایط قبولی (۱۰۰/۱۰۰) | ملاحظات معماری تمیز |
| :--- | :--- | :--- | :--- | :--- |
| **۱. تثبیت نام رسمی استاد** (`check_scholar_identity`) | • `frontend/src/lib/data.ts`<br>• `frontend/src/app/page.tsx`<br>• `frontend/src/components/Navbar.tsx`<br>• `backend/app/core/config.py`<br>• `backend/app/main.py`<br>• `frontend/public/llms.txt` | حساس به وجود «دکتر میثم زنجیرزن» یا «دکتر زنجیرزن حسینی» بدون قید پیشوند کامل. نام دقیق: **«حجت الاسلام دکتر زنجیر زن حسینی»** | عدم وجود مغایرت در فایل‌های هدف. | فایل‌های `data.ts`، `page.tsx` و `Navbar.tsx` باید نام رسمی را به صورت کامل و بدون شکستگی حفظ کنند. |
| **۲. مانیفست ضد اسلاپ** (`check_anti_slop_rules`) | • `frontend/src/app/**/*.tsx`<br>• `frontend/src/components/**/*.tsx` | • `blur-3xl\s+bg-(?:amber\|emerald\|purple\|indigo)-500/10`<br>• `bg-clip-text\s+text-transparent\s+bg-gradient`<br>• `w-2\s+h-2\s+rounded-full\s+bg-emerald-500\s+animate-pulse` | هیچ کامپوننتی نباید از این کلاس‌های کلیشه‌ای هوش مصنوعی استفاده کند. | تمامی کامپوننت‌های جدید یا منتقل‌شده در `components/` باید ۱۰۰٪ تابع پالت ابسیدین/کاغذ کهن و بدون گرادیان یا پالس باشند. |
| **۳. آزمون‌های بک‌اند و DRM** (`check_backend_tests`) | • `backend/tests/test_in_memory.py`<br>اجرا با `backend/.venv/Scripts/python.exe` | اجرای ۹ ماژول تستی و اعتبارسنجی بازگشت کد ۰ | بدون خروجی خطا (returncode == 0) | هیچ مسیر یا هدر ارتباطی بین فرانت‌اند و بک‌اند نباید رفتار متفاوتی نشان دهد. |
| **۴. آرتیفکت‌های سئو** (`check_seo_artifacts`) | • `frontend/src/app/sitemap.ts`<br>• `frontend/src/app/robots.ts`<br>• `frontend/public/llms.txt`<br>• `SEO_STANDARDS.md` | بررسی وجود فیزیکی فایل‌ها (`fpath.exists()`) | وجود تمامی ۴ فایل الزامی است. | فایل‌های `sitemap.ts` و `robots.ts` نباید از پوشه `app/` جابجا یا حذف شوند. |
| **۵. نوتبوک‌های پردازش صوت** (`check_audio_processing_assets`) | • `audio_enhance_colab.ipynb`<br>• `audio_enhance_kaggle.ipynb` | بررسی وجود کلمه کلیدی `"ProcessPoolExecutor"` | وجود نوتبوک‌ها و پردازش چندرشته‌ای صوت | خارج از محدوده تغییرات فرانت‌اند؛ دست‌نخورده باقی بماند. |
| **۶. اسناد حافظه و قوانین** (`check_root_standards`) | ۷ سند در ریشه پروژه (`DESIGN.md`, `GEMINI.md`, قواعد ضد اسلاپ و نگارش فارسی) | بررسی وجود فیزیکی فایل‌ها | وجود تمام اسناد الزامی است. | نباید اسناد ریشه دستخوش حذف شوند. |
| **۷. نگارش فارسی اصیل** (`check_persian_writing_quality`) | تمام فایل‌های `.ts`, `.tsx`, `.js`, `.jsx` در:<br>• `frontend/src/app`<br>• `frontend/src/lib`<br>• `frontend/src/components`<br>• `frontend/src/context` | • `می‌باشد\|می باشد`<br>• `می‌باشند\|می باشند`<br>• `(?<![بازبر])گردید`<br>• `(?<![بازبر])می‌گردد`<br>• `لازم به ذکر است`<br>• `شایان ذکر است`<br>• `نقش بسزایی`<br>• `از اهمیت ویژه‌ای برخوردار`<br>• `سپری نمودن` | عدم وجود حتی یک مورد از افعال و عبارات ممنوعه اداری/رباتیک | **بسیار حیاتی:** فایل‌های دیکشنری زبان (`fa.ts`) و هرگونه کامپوننت جدید در این پوشه‌ها باید ۱۰۰٪ عاری از افعال اداری باشند. |
| **۸. رعایت مشخصات Spec Kit** (`check_spec_kit_compliance`) | • `specs/constitution.md`<br>• `specs/001-bespoke-editorial-experience/*`<br>• **`frontend/src/components/motion/MotionPrimitives.tsx`** | بررسی وجود فیزیکی فایل‌ها و تطابق متن قانون اساسی | وجود تمام فایل‌ها از جمله ماژول موشن | **بسیار حیاتی:** فایل `MotionPrimitives.tsx` دقیقاً در مسیر `components/motion/MotionPrimitives.tsx` تعریف شده است و نباید به هیچ وجه جابجا یا حذف شود! |

### نکته فنی حیاتی پیرامون اجرای پایپ‌لاین در ویندوز:
دستور خام `python audit_pipeline.py` در شل ویندوز ممکن است به میانبر استور مایکروسافت برخورد کرده و کد خطای ۱ برگرداند. برای اجرای مطمئن باید منحصراً از مفسر محیط مجازی پروژه استفاده شود:
```powershell
backend\.venv\Scripts\python.exe audit_pipeline.py
```

---

## ۳. بررسی رفتار آزمون‌های موجود (Test-Driven Behavioral Verification)

### ۳.۱. آزمون‌های بک‌اند (`backend/tests/test_in_memory.py`)
این سوییت تستی شامل ۹ سناریوی رفتاری کلیدی است که فرانت‌اند مستقیماً با آن‌ها تعامل دارد:
1. **Root Health & Scholar Identity:** تطابق نام رسمی در پاسخ ریشه (`/`).
2. **Auth Endpoints:** ورود با تلفن/رمز و صدور توکن‌های JWT با سطوح دسترسی `student` و `admin`، رد گذرواژه اشتباه.
3. **RBAC Security Shield:** اعتبارسنجی کدهای وضعیت ۴۰۱ برای کاربران ناشناس و ۴۰۳ برای دانشجویانی که به اندپوینت‌های ادمین (`/api/v1/admin/analytics`) دسترسی پیدا می‌کنند.
4. **DRM Stream Shield:** صدور توکن امضاشده منقضی‌شونده (`/api/v1/stream/token`) و احراز اصالت ضربان قلب (`/api/v1/stream/heartbeat`) و رد دستکاری‌های هدر.
5. **HTTP Range Audio Streaming:** پشتیبانی از درخواست‌های بایت‌محور RFC 7233 و بازگشت وضعیت `206 Partial Content` همراه با هدرهای `Content-Range`.
6. **Courses Catalog & Rate Limiting:** لود لیست دوره‌ها و اعتبارسنجی هدرهای `X-RateLimit-Limit`.
7. **AI Scholarly Assistant RAG Chat:** اندپوینت پرسش و پاسخ فلسفی بر مبنای اسفار اربعه و حفظ هویت رسمی استاد در متادیتا.
8. **AI Document Analysis:** تحلیل و استخراج گزاره‌های دیالکتیکی رسالات فلسفی.
9. **Admin Course & Chapter Management CRUD:** ایجاد، ویرایش و حذف دوره‌ها و سرفصل‌ها با توکن معتبر ادمین.

**نتیجه:** هیچ تغییری در معماری فرانت‌اند نباید قراردادهای ارتباطی با این اندپوینت‌ها (به ویژه ساختار توکن‌ها، هدر `Range` برای پلیر و شناسه دوره‌ها) را مخدوش سازد.

### ۳.۲. آسیب‌شناسی کامپایل و تایپ‌های فرانت‌اند (`npm run build`)
بررسی اجرای دستور `npm run build` و `npx tsc --noEmit` نشان داد که کدهای پروژه در سلامت فنی ۹۹٪ قرار دارند، اما یک خطای تایپ‌اسکریپت حیاتی در کامپایل مانع ایجاد بیلد پروداکشن می‌شود:

```
src/components/admin/tabs/AdminStatsTab.tsx:25:75
Type error: This comparison appears to be unintentional because the types '"مسدود‌شده"' and '"Active"' have no overlap.
src/components/admin/tabs/AdminStatsTab.tsx:25:100
Type error: This comparison appears to be unintentional because the types '"مسدود‌شده"' and '"نشط"' have no overlap.
```

**علت ریشه‌ای:** در `DataContext.tsx` تایپ `DrmSessionRecord.status` به صورت `'فعال' | 'مسدود‌شده'` تعریف شده است. بررسی مقایسه با `'Active'` یا `'نشط'` توسط تایپ‌اسکریپت غیرممکن شناخته شده و خطا ایجاد می‌کند.  
**راهکار اصلاحی در فاز بازسازی:**
```typescript
// اصلاح خط ۲۵ در AdminStatsTab.tsx:
const activeDrmCount = drmSessions.filter((s) => s.status === 'فعال').length;
```
این اصلاح دقیقاً مشابه پیاده‌سازی تمیز در `components/dashboard/AdminStatsTab.tsx:107` و `components/admin/tabs/AdminDrmTab.tsx:20` است.

---

## ۴. طراحی معماری تمیز فرانت‌اند (Clean Architecture Folder Structure)

برای تضمین مقیاس‌پذیری، استقلال لایه‌ها، تفکیک دغدغه‌ها (Separation of Concerns) و توسعه‌پذیری آتی، ساختار پیشنهادی زیر طراحی شده است:

```
frontend/src/
├── app/                                 # [Next.js App Router] لایه مسیریابی و صفحات
│   ├── (public)/                        # صفحات عمومی
│   │   ├── page.tsx                     # صفحه نخست (شامل متادیتای استاد)
│   │   ├── courses/                     # کاتالوگ و نمایش دوره‌ها
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── learn/page.tsx       # سالن پخش و پلیر آموزشی
│   │   ├── books/                       # کتب و رحل ۳بعدی
│   │   ├── articles/                    # مقالات پژوهشی
│   │   ├── roadmap/                     # سیر مطالعاتی
│   │   └── search/                      # جستجوی سریع
│   ├── (auth)/                          # احراز هویت
│   │   ├── login/page.tsx
│   │   └── checkout/page.tsx
│   ├── (dashboard)/                     # پرتال دانشجو و پنل مدیریت
│   │   ├── dashboard/page.tsx
│   │   └── admin/page.tsx
│   ├── layout.tsx                       # پوسته اصلی، فونت دانا و Providerها
│   ├── robots.ts                        # متادیتای سئو (محفوظ در audit_pipeline)
│   └── sitemap.ts                       # نقشه سایت پویا (محفوظ در audit_pipeline)
│
├── components/                          # [لایه نمایش - Presentation Layer]
│   ├── ui/                              # ۱. اجزای پایه و اتمیک (Primitives & Atoms)
│   │   ├── SquircleCard.tsx             # کارت‌های اسکویرکل ضد اسلاپ
│   │   ├── StatSquircle.tsx
│   │   ├── ShadcnBadge.tsx
│   │   ├── CategoryTabStrip.tsx
│   │   ├── MinimalCourseCard.tsx
│   │   ├── CompactHorizontalCard.tsx
│   │   ├── CourseCard.tsx
│   │   └── BookCard.tsx
│   │
│   ├── shell/                           # ۲. پوسته و ناوبری سراسری (Shell & Layout)
│   │   ├── ShellLayout.tsx
│   │   ├── ShellHeader.tsx
│   │   ├── ShellSidebar.tsx
│   │   ├── ShellAuthGate.tsx
│   │   ├── GlobalOverlays.tsx           # مدیریت سراسری پلیر شناور و دستیار صوتی
│   │   ├── PWARegistration.tsx          # ثبت‌کننده کلاینت سرویس‌ورکر PWA
│   │   └── CommandPalette.tsx           # پالت جستجوی سریع (Ctrl+K)
│   │
│   ├── motion/                          # ۳. ماژول‌های حرکتی و فیزیک فنر (Motion Physics)
│   │   └── MotionPrimitives.tsx         # [بسیار حیاتی - تطابق ۱۰۰٪ با audit_pipeline.py]
│   │
│   ├── features/                        # ۴. کامپوننت‌های حوزه‌محور (Feature Modules)
│   │   ├── admin/                       # ماژول پنل مدیریت
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminCharts.tsx
│   │   │   └── tabs/                    # تب‌های آمار، دوره‌ها، DRM و کتب
│   │   ├── dashboard/                   # ماژول پرتال دانشجو
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── shared/ (KpiMetricStrip, MinimalistBarChart, OngoingCoursesTable)
│   │   │   └── tabs/
│   │   ├── learn/                       # ماژول سالن آموزش و استریم
│   │   │   ├── AudioVideoPlayerEngine.tsx
│   │   │   ├── CoursePlaylistSidebar.tsx
│   │   │   ├── CourseQaAccordion.tsx
│   │   │   └── CourseHandoutsTab.tsx
│   │   ├── player/                      # ماژول پلیر شناور صوتی و آپلودر
│   │   │   ├── AudioPlayerIsland.tsx
│   │   │   └── AudioUploaderModal.tsx
│   │   ├── reader/                      # ماژول رحل مطالعه ۳بعدی کتب
│   │   │   └── BookReader3D.tsx
│   │   ├── catalog/                     # ماژول بنتو و کاتالوگ صفحه نخست
│   │   │   ├── BentoHero.tsx
│   │   │   ├── CourseCatalogBento.tsx
│   │   │   └── ScholarDispatchBento.tsx
│   │   ├── cart/                        # ماژول سبد سفارشات
│   │   │   └── CartModal.tsx
│   │   ├── roadmap/                     # ماژول نقشه راه و سیر علمی
│   │   │   └── CurriculumRoadmap.tsx
│   │   └── ai/                          # ماژول دستیار هوشمند فلسفی
│   │       └── ScholarlyAIAssistant.tsx
│   │
│   └── Navbar.tsx                       # [فاساد / ارجاع سازگار برای audit_pipeline.py]
│
├── messages/                            # [لایه چندزبانه سازمانی - Enterprise i18n]
│   ├── fa.ts                            # دیکشنری پایه و مرجع زبان فارسی (اصیل و پیراسته)
│   ├── ar.ts                            # دیکشنری زبان عربی (تطابق کامل کلیدها با fa)
│   ├── en.ts                            # دیکشنری زبان انگلیسی (تطابق کامل کلیدها با fa)
│   └── index.ts                         # اکسپورت تجمیعی، تایپ‌های قوی (`TranslationKey`, `Messages`)
│
├── context/                             # [لایه مدیریت حالت - State & Context Layer]
│   ├── AuthContext.tsx                  # وضعیت احراز هویت و توکن کاربر
│   ├── DataContext.tsx                  # پایگاه داده کلاینت و هماهنگی داده‌ها
│   ├── LanguageContext.tsx              # سوئیچر زبان، جهت راست‌چین و تایپ‌سیف t()
│   └── PlayerContext.tsx                # وضعیت پخش صوت، سرعت و امنیت DRM
│
├── hooks/                               # [لایه هوک‌های سفارشی - Custom Hooks]
│   ├── useBookmarks.ts                  # مدیریت نشانک‌های دوره‌ها و کتب
│   ├── useLanguage.ts                   # هوک دسترسی سریع به مترجم تایپ‌سیف
│   ├── useAudioPlayer.ts                # دسترسی به متدهای پلیر DRM
│   └── usePWA.ts                        # تشخیص نصب‌پذیری PWA و مدیریت آپدیت‌ها
│
├── services/                            # [لایه زیرساخت و ارتباط با سرور - Infrastructure Services]
│   └── apiClient.ts                     # کلاینت تایپ‌شده FastAPI با هدرهای توکن و خطا
│
├── types/                               # [لایه تایپ‌های دامنه - Domain Models & Interfaces]
│   └── index.ts                         # مدل‌های مشترک User, Course, Chapter, Book, Order
│
├── lib/                                 # [لایه ابزارهای خالص و داده‌های کلاینت - Pure Lib & Mock Data]
│   ├── data.ts                          # داده‌های اولیه ماک (سبک‌شده بدون i18nDict + حفظ نام استاد)
│   ├── localization.ts                  # توابع تبدیل ارقام فارسی و فیلدهای چندزبانه موجودیت‌ها
│   └── utils.ts                         # هلپر کلاس‌های استایل (cn)
│
└── styles/                              # [لایه استایل‌ها و فونت‌ها]
    └── globals.css                      # فونت دانا، پالت ابسیدین/کاغذ کهن و توکن‌های CSS
```

---

## ۵. ماتریس انتقال و تثبیت فایل‌ها (File Movement & Preservation Matrix)

برای جلوگیری از هرگونه شکست در `audit_pipeline.py`، جدول زیر استراتژی جابجایی و تثبیت تک‌تک فایل‌ها را مشخص می‌کند:

| مسیر فعلی | مسیر هدف | نوع عملیات | وضعیت در `audit_pipeline.py` | تمهیدات تضمین ۱۰۰/۱۰۰ |
| :--- | :--- | :--- | :--- | :--- |
| `src/components/motion/MotionPrimitives.tsx` | `src/components/motion/MotionPrimitives.tsx` | **تثبیت مطلق (عدم جابجایی)** | **الزامی در سطر ۱۹۰** | این فایل به هیچ عنوان نباید جابجا شود زیرا کد پایپ‌لاین صراحتاً وجود آن را بررسی می‌کند. |
| `src/components/Navbar.tsx` | `src/components/Navbar.tsx` | **حفظ در ریشه کامپوننت‌ها** (یا فاساد با نام کامل) | **اسکن در سطر ۴۲** | حفظ نام «حجت الاسلام دکتر زنجیر زن حسینی» در متادیتا یا کامپوننت. |
| `src/lib/data.ts` | `src/lib/data.ts` | **پالایش و سبک‌سازی** | **اسکن در سطر ۴۰** | استخراج `i18nDict` به `messages/` و ری‌اکسپورت آن در `data.ts` برای سازگاری عقب‌رو؛ حفظ نام کامل استاد در فیلدهای استاد. |
| `src/app/sitemap.ts` | `src/app/sitemap.ts` | **تثبیت مطلق** | **الزامی در سطر ۱۰۱** | نباید تغییر مسیر دهد. |
| `src/app/robots.ts` | `src/app/robots.ts` | **تثبیت مطلق** | **الزامی در سطر ۱۰۲** | نباید تغییر مسیر دهد. |
| `public/llms.txt` | `public/llms.txt` | **تثبیت مطلق** | **الزامی در سطر ۴۵ و ۱۰۳** | نباید تغییر مسیر دهد؛ نام استاد در آن تثبیت شده است. |
| `src/components/AdminCharts.tsx` | `src/components/features/admin/AdminCharts.tsx` | انتقال به Feature | اسکن عمومی رگولار | ایجاد ری‌اکسپورت در مسیر قبلی برای سازگاری. |
| `src/components/AudioPlayerIsland.tsx` | `src/components/features/player/AudioPlayerIsland.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/AudioPlayerIsland.tsx`. |
| `src/components/BookReader3D.tsx` | `src/components/features/reader/BookReader3D.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/BookReader3D.tsx`. |
| `src/components/CartModal.tsx` | `src/components/features/cart/CartModal.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/CartModal.tsx`. |
| `src/components/CourseCatalogBento.tsx` | `src/components/features/catalog/CourseCatalogBento.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/CourseCatalogBento.tsx`. |
| `src/components/CurriculumRoadmap.tsx` | `src/components/features/roadmap/CurriculumRoadmap.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/CurriculumRoadmap.tsx`. |
| `src/components/BentoHero.tsx` | `src/components/features/catalog/BentoHero.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/BentoHero.tsx`. |
| `src/components/ScholarDispatchBento.tsx` | `src/components/features/catalog/ScholarDispatchBento.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/ScholarDispatchBento.tsx`. |
| `src/components/ScholarlyAIAssistant.tsx` | `src/components/features/ai/ScholarlyAIAssistant.tsx` | انتقال به Feature | اسکن عمومی رگولار | ری‌اکسپورت در `components/ScholarlyAIAssistant.tsx`. |
| `src/components/admin/tabs/*` | `src/components/features/admin/tabs/*` | سازماندهی ساختار | اسکن عمومی رگولار | حفظ پیوندهای ورودی در `admin/page.tsx`. |
| `src/components/dashboard/tabs/*` | `src/components/features/dashboard/tabs/*` | سازماندهی ساختار | اسکن عمومی رگولار | حفظ پیوندهای ورودی در `dashboard/page.tsx`. |
| `src/components/learn/*` | `src/components/features/learn/*` | سازماندهی ساختار | اسکن عمومی رگولار | حفظ پیوندهای ورودی در `courses/[id]/learn/page.tsx`. |

---

## ۶. معماری چندزبانه سازمانی تایپ‌سیف (Enterprise i18n Architecture - R2)

### ۶.۱. تفکیک دیکشنری به فایل‌های اختصاصی
در حال حاضر کل شیء `i18nDict` در فایل `src/lib/data.ts` قرار دارد که بیش از ۱۹۵۰ سطر کد است. ساختار جدید به صورت زیر طراحی می‌شود:

1. **`frontend/src/messages/fa.ts`:**
   دیکشنری زبان فارسی به عنوان منبع حقیقت (Single Source of Truth).
   ```typescript
   export const fa = {
     dir: 'rtl',
     site_title: 'پایگاه نشر آثار حجت الاسلام دکتر زنجیر زن حسینی',
     scholar_name: 'حجت الاسلام دکتر زنجیر زن حسینی',
     nav_home: 'صفحه نخست',
     // ... تمام ۶۵۰ کلید استاندارد
   } as const;

   export type TranslationKey = keyof typeof fa;
   export type Messages = Record<TranslationKey, string>;
   ```

2. **`frontend/src/messages/ar.ts`:**
   ```typescript
   import type { Messages } from './fa';
   export const ar: Messages = {
     dir: 'rtl',
     site_title: 'موقع آثار حجة الإسلام الدكتور زنجير زن حسيني',
     scholar_name: 'حجة الإسلام الدكتور زنجير زن حسيني',
     // ... تطابق ۱۰۰٪ کلیدها با زبان فارسی
   };
   ```

3. **`frontend/src/messages/en.ts`:**
   ```typescript
   import type { Messages } from './fa';
   export const en: Messages = {
     dir: 'ltr',
     site_title: 'Hujjat al-Islam Dr. Zanjirzan Hosseini Publications',
     scholar_name: 'Hujjat al-Islam Dr. Zanjirzan Hosseini',
     // ... تطابق ۱۰۰٪ کلیدها با زبان فارسی
   };
   ```

4. **`frontend/src/messages/index.ts`:**
   ```typescript
   import { fa, type TranslationKey, type Messages } from './fa';
   import { ar } from './ar';
   import { en } from './en';
   import type { SupportedLang } from '@/lib/data';

   export const messages: Record<SupportedLang, Messages> = {
     fa,
     ar,
     en,
   };

   export { fa, ar, en };
   export type { TranslationKey, Messages };
   ```

5. **سازگاری عقب‌رو در `src/lib/data.ts`:**
   برای اینکه کامپوننت‌هایی که `i18nDict` را از `@/lib/data` ایمپورت کرده‌اند نشکنند:
   ```typescript
   export { messages as i18nDict } from '@/messages';
   ```

### ۶.۲. ارتقای تایپ‌سیف هوک زبان در `LanguageContext.tsx`
با تعریف تایپ `TranslationKey`، تابع `t(key)` در کامپوننت‌ها به صورت کاملاً هوشمند اتوکامپلیت می‌شود و اگر کلیدی اشتباه تایپ شود، در زمان کامپایل هشدار داده خواهد شد:
```typescript
interface LanguageContextType {
  currentLang: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
  dict: Messages;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  toLocale: (num: number | string) => string;
  t: (key: TranslationKey | string, fallback?: string) => string;
}
```

---

## ۷. استراتژی استقرار و بهینه‌سازی PWA (R1)

### ۷.۱. فایل‌های موجود و وضعیت فعلی:
- `frontend/public/manifest.json`: به طور کامل با مشخصات دارالحکمة، رنگ‌های رسمی (`#0C0D0E` و `#8A532B`)، جهت RTL و آیکون‌ها پیکربندی شده است.
- `frontend/public/sw.js`: پیاده‌سازی سرویس‌ورکر با کش انتخابی فونت‌های دانا، تصاویر، فایل‌های استاتیک و نادیده گرفتن درخواست‌های استریم و API.
- `frontend/src/components/PWARegistration.tsx`: ثبت‌کننده کلاینت سرویس‌ورکر در حالت پروداکشن.

### ۷.۲. ملاحظات Next.js 15.1.7 و React 19:
پکیج قدیمی `next-pwa` در محیط‌های Next.js 15 و React 19 به دلیل تعارض `peerDependencies` پکیج Webpack با مشکل مواجه می‌شود. برای برآورده کردن کامل معیارهای پذیرش (تولید `sw.js` و فایل‌های `workbox-*.js` در `public/`):
- توصیه می‌شود از کتابخانه استاندارد سازگار با Next 15 یعنی `@ducanh2912/next-pwa` (یا اسکریپت بیلد اختصاصی Workbox CLI) در `next.config.js` استفاده شود.
- در غیر این صورت، تنظیم `next.config.js` به همراه `workbox-build` بیلد مطمئن و بدون خطای تایپ را تضمین می‌کند.

---

## ۸. تحلیل ریسک‌ها و نقشه راه پیشنهادی پیاده‌سازی (Migration Plan)

| ریسک بالقوه | شدت ریسک | پیامد | راهکار پیشگیری و مهار |
| :--- | :---: | :--- | :--- |
| **شکست سطر ۱۹۰ پایپ‌لاین کیفیت** | بحرانی (Critical) | افت امتیاز به ۴۰ از ۱۰۰ به دلیل مفقود شدن `MotionPrimitives.tsx` | **قانون طلایی:** فایل `frontend/src/components/motion/MotionPrimitives.tsx` به هیچ عنوان جابجا نشود. |
| **خطای تایپ‌اسکریپت در بیلد** | زیاد (High) | توقف اجرای `npm run build` به دلیل تایپ ناهمخوان در `AdminStatsTab.tsx:25` | اصلاح فوری فیلتر DRM به `s.status === 'فعال'` قبل از شروع جابجایی فایل‌ها. |
| **شکست سطر ۷ پایپ‌لاین کیفیت (کلمات ممنوعه فارسی)** | زیاد (High) | افت امتیاز به ۵۰ از ۱۰۰ به دلیل ورود افعالی مثل «می‌باشد» یا «گردید» | اجرای اسکریپت رگولار اکسپرشن روی فایل‌های `fa.ts` و کدهای جدید پیش از ثبت نهایی. |
| **شکستگی ایمپورت کامپوننت‌های قبلی** | متوسط (Medium) | خطای ماژول یافت نشد در صفحات Next.js | ایجاد فاسادها یا فایل‌های Re-export در مسیرهای قدیمی تا در صورت وجود ایمپورت‌های پنهان، خطایی رخ ندهد. |
| **تعارض پکیج PWA با React 19** | متوسط (Medium) | توقف فرآیند `npm install` | استفاده از `@ducanh2912/next-pwa` یا اجرای با فلگ `--legacy-peer-deps` و پیکربندی ایمن `next.config.js`. |

### گام‌های اجرایی پیشنهادی برای تیم پیاده‌سازی (Phased Roadmap):
1. **گام اول (رفع خطای تایپ کامپایل):** اصلاح خط ۲۵ در `AdminStatsTab.tsx` و ایجاد فایل `.eslintrc.json` جهت پاس شدن ۱۰۰٪ دستور `npx tsc --noEmit` و `npm run build`.
2. **گام دوم (تفکیک لایه دیکشنری چندزبانه R2):** ایجاد دایرکتوری `frontend/src/messages/` با فایل‌های `fa.ts`, `ar.ts`, `en.ts`, `index.ts` با تایپ قوی، اتصال به `LanguageContext.tsx` و ری‌اکسپورت در `data.ts`.
3. **گام سوم (سازماندهی تمیز کامپوننت‌ها R3):** سازماندهی کامپوننت‌های موجود در دایرکتوری‌های `components/ui/`, `components/shell/`, `components/features/` هم‌زمان با حفظ فاساد در مسیرهای قبلی و دست‌نزدن به `components/motion/MotionPrimitives.tsx`.
4. **گام چهارم (پیکربندی بیلد PWA - R1):** فعال‌سازی افزونه PWA در `next.config.js` جهت تولید آرتیفکت‌های کش در `public/`.
5. **گام پنجم (ارزیابی پایانی کیفیت R4):** اجرای هم‌زمان `npm run build` و `backend\.venv\Scripts\python.exe audit_pipeline.py` تا تاییدیه ۱۰۰/۱۰۰ ثبت شود.

---
**پایان گزارش کاوشگر معماری تمیز (`explorer_survey_arch_1`)**
