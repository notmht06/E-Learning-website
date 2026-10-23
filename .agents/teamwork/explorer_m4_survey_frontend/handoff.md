# Handoff Report — Frontend Survey Explorer (M4)

**Working Directory:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_frontend`  
**Sender:** `explorer_m4_survey_frontend`  
**Recipient:** Orchestrator (`6dcd4eed-9597-4cd0-8718-2e17657de9c5`)  
**Date:** 2026-10-13T03:13:00Z  

---

## ۱. مشاهدات عینی (Observation)

۱. **صفحه جزئیات دوره (`frontend/src/app/courses/[id]/page.tsx`):**
   - تعداد خطوط: ۳۵۸ خط کد.
   - خطوط ۴۸:
     ```tsx
     const isEnrolled = user?.enrolledCourseIds.includes(course.id);
     ```
   - خطوط ۵۷ تا ۶۶:
     ```tsx
     const handleEnroll = () => {
       enrollCourse(course.id);
       const item: CartItem = {
         id: course.id,
         title: `${dict.course_enroll_btn || 'ثبت‌نام'}: ${title}`,
         price,
       };
       setCartItems([item, ...cartItems]);
       setIsCartOpen(true);
     };
     ```
   - خطوط ۲۶۷ تا ۲۸۰: دکمه و نشان برای دوره‌های ثبت‌نام‌شده از پیش با متن زیر وجود دارد اما منحصراً به وضعیت استیت محلی وابسته است:
     ```tsx
     <Link
       href={`/courses/${course.id}/learn`}
       className="..."
     >
       <Play className="w-4 h-4 fill-current" />
       <span>{currentLang === 'en' ? 'Enter Course Player' : currentLang === 'ar' ? 'دخول بيئة التعلم (مشغل الدورة)' : 'ورود به محیط یادگیری و پخش دوره'}</span>
     </Link>
     ```

۲. **بافت هویت و احراز کاربر (`frontend/src/context/AuthContext.tsx`):**
   - تعداد خطوط: ۱۶۴ خط کد.
   - خط ۴۵ در `mapUserResponseToProfile`:
     ```typescript
     enrolledCourseIds: role === 'ADMIN' ? ['course1', 'course2', 'course3'] : ['course1'],
     ```
   - خطوط ۱۲۴ تا ۱۲۹ در `enrollCourse`:
     ```typescript
     const enrollCourse = (courseId: string) => {
       if (!user || user.enrolledCourseIds.includes(courseId)) return;
       const updated = { ...user, enrolledCourseIds: [...user.enrolledCourseIds, courseId] };
       setUser(updated);
       localStorage.setItem('zanjirzan_user', JSON.stringify(updated));
     };
     ```
   - در `hydrateSession` (خطوط ۵۷ تا ۸۶)، با فراخوانی `apiClient.auth.getMe()`، داده بازگشتی دوباره از فیلتر `mapUserResponseToProfile` عبور داده شده و دوره‌های ثبت‌نام‌شده با مقدار ثابت هاردکدشده جایگزین می‌شوند.

۳. **کلاینت شبکه (`frontend/src/services/apiClient.ts`):**
   - تعداد خطوط: ۲۹۶ خط کد.
   - در شیء `courses` (خطوط ۸۴-۹۳)، متدهای `getAll`، `getById` و `syncProgress` موجودند، اما متدهای `enroll` و `getEnrolled` وجود ندارند.

۴. **پلیر و سایدبار جلسات (`frontend/src/app/courses/[id]/learn/page.tsx` و `CoursePlaylistSidebar.tsx`):**
   - `page.tsx` دارای ۱۵۹ خط و `CoursePlaylistSidebar.tsx` دارای ۱۳۱ خط کد است.
   - هیچ ارتباطی با `useAuth()` در صفحه یادگیری وجود ندارد.
   - تمام جلسات در `CoursePlaylistSidebar` بدون توجه به وضعیت ثبت‌نام فعال و قابل کلیک هستند؛ هیچ آیکون یا بازدارنده قفلی برای جلسات غیرپیش‌نمایش تعبیه نشده است.

۵. **سبد خرید (`frontend/src/components/CartModal.tsx`):**
   - تعداد خطوط: ۱۱۸ خط کد.
   - دکمه تسویه‌حساب در خطوط ۱۰۰-۱۰۶ صرفاً اقلام را در `localStorage.setItem('zan_cart', ...)` می‌نویسد و کاربر را به `/checkout` هدایت می‌کند.

۶. **آزمون‌های اعتبارسنجی:**
   - دستور `npx tsc --noEmit` در پوشه `frontend` با کد خروجی ۰ و بدون هیچ‌گونه خطای تایپ‌اسکریپت اجرا شد.
   - دستور `.\backend\.venv\Scripts\python.exe audit_pipeline.py` با کد خروجی ۰ و امتیاز ۱۰۰/۱۰۰ (پاس شدن کامل قوانین نام استاد، ضد اسلاپ و نگارش فارسی) اجرا شد.

---

## ۲. زنجیره منطقی استنتاج (Logic Chain)

۱. **استنتاج اول (مبتنی بر مشاهدات ۱ و ۳):** دکمه ثبت‌نام در صفحه دوره منحصراً استیت محلی را تغییر می‌دهد زیرا در کلاینت شبکه `apiClient.ts` اندپوینتی برای ثبت‌نام دوره (`/courses/{course_id}/enroll`) تعریف نشده است.
۲. **استنتاج دوم (مبتنی بر مشاهده ۲):** دوره‌های ثبت‌نام‌شده پس از بارگذاری مجدد صفحه از دست می‌روند زیرا تابع `mapUserResponseToProfile` در هر بار هیدراتاسیون نشست، مقدار دوره‌ها را مجدداً به صورت هاردکد بازنویسی می‌کند.
۳. **استنتاج سوم (مبتنی بر مشاهده ۴):** در حال حاضر جلسات در محیط یادگیری قفل نیستند و هر کاربری می‌تواند تمامی جلسات را بشنود؛ در نتیجه باید شرط `isEnrolled` و نشانگرهای قفل (`Lock`) به سایدبار و پلیر افزوده شده و با ثبت‌نام موفق بازگشایی شوند.
۴. **استنتاج چهارم (مبتنی بر مشاهده ۱):** صفحه `frontend/src/app/courses/[id]/page.tsx` با ۳۵۸ خط، سقف ۲۰۰ خط را نقض کرده است و در فاز پیاده‌سازی (R2) باید به ۳ کامپوننت ماژولار زیر ۱۲۰ خط و یک هوک اختصاصی تفکیک شود.

---

## ۳. مفروضات و حوزه‌های بررسی‌نشده (Caveats)

۱. **طرح پاسخ اندپوینت بک‌اند:** جزئیات دقیق اسکیماهای بازگشتی اندپوینت‌های جدید `/api/v1/courses/{course_id}/enroll` و `/api/v1/courses/enrolled` توسط کاوشگر بک‌اند (`explorer_m4_survey_backend`) در حال تدوین است؛ فرانت‌اند آمادگی دریافت هم آرایه شناسه‌ها (`string[]`) و هم اشیای دوره (`Course[]`) را دارد.
۲. **پرداخت شبیه‌سازی‌شده شاپرک:** فرآیند پرداخت بانکی در `/checkout` شبیه‌سازی شده است؛ پیاده‌سازی ثبت‌نام بلادرنگ هم از طریق دکمه مستقیم ثبت‌نام دوره و هم از طریق تسویه‌حساب سبد خرید امکان‌پذیر است.

---

## ۴. جمع‌بندی و برنامه اجرایی (Conclusion)

تمام ابعاد فنی و معماری لازم برای اجرای فاز R2 شفاف و مدون است:
۱. افزودن متدهای `courses.enroll` و `courses.getEnrolled` به `apiClient.ts`.
۲. به‌روزرسانی `AuthContext.tsx` جهت ارسال درخواست زنده به بک‌اند و تثبیت ماندگار دوره‌های ثبت‌نام‌شده در نشست کاربر.
۳. تفکیک ماژولار `courses/[id]/page.tsx` به کامپوننت‌های زیر سقف ۲۰۰ خط (`CourseDetailHero`, `CourseSyllabusList`, `CourseEnrollmentCard`, `useCourseEnrollment`) و انتقال فوری دکمه به «ورود به محیط یادگیری و پخش دوره».
۴. اتصال سایدبار پلیر آموزشی (`CoursePlaylistSidebar.tsx`) به وضعیت `isEnrolled` جهت نمایش قفل روی جلسات غیرپیش‌نمایش برای کاربران عادی و بازگشایی کامل تمامی جلسات برای دانشجویان ثبت‌نام‌شده.

---

## ۵. روش اعتبارسنجی مستقل (Verification Method)

۱. **بررسی صحت تایپ‌ها و کامپایل:**
   ```bash
   cd frontend
   npx tsc --noEmit
   ```
   *شرط قبولی:* خروجی بدون هیچ خطای تایپ‌اسکریپت و کد خروجی ۰.

۲. **ارزیابی دروازه کیفیت و قوانین پروژه:**
   ```bash
   .\backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *شرط قبولی:* نمره ۱۰۰/۱۰۰ در تمامی ۸ گام اعتبارسنجی.

۳. **بررسی سقف خطوط کد (LOC Ceiling):**
   ```bash
   Get-Content frontend/src/app/courses/[id]/page.tsx | Measure-Object -Line
   ```
   *شرط قبولی:* تمامی فایل‌های بازطراحی‌شده یا جدید زیر ۲۰۰ خط کد باشند.
