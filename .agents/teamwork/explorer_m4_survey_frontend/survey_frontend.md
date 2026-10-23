# گزارش جامع بررسی فنی فرانت‌اند (Frontend Technical Survey)
## ثبت‌نام برخط دوره‌ها، بازگشایی جلسات در پلیر آموزشی و یکپارچه‌سازی سبد خرید
### پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**تاریخ تحلیل:** ۲۱ مهر ۱۴۰۵ (2026-10-13)  
**کاوشگر:** کاوشگر پیمایش فرانت‌اند (`explorer_m4_survey_frontend`)  
**محیط کاری:** `.agents/teamwork/explorer_m4_survey_frontend`  

---

## ۱. خلاصه اجرایی (Executive Summary)

این گزارش حاصل تحلیل موشکافانه و خط‌به‌خط اجزای فرانت‌اند در لایه‌های رابط کاربری (`app/courses/[id]`, `app/courses/[id]/learn`), ماژول‌های سبد خرید (`CartModal.tsx`), کلاینت شبکه (`apiClient.ts`)، بافت‌های سراسری حالت (`AuthContext.tsx`, `CartContext.tsx`) و گونه‌های داده‌ای (`types/index.ts`) است.

### نتایج کلیدی پیمایش:
۱. **صفحه جزئیات دوره (`frontend/src/app/courses/[id]/page.tsx`):**
   - دارای ۳۵۸ خط کد است و سقف ۲۰۰ خط را نقض کرده است. ساختار فعلی مونولیتیک است.
   - دکمه ثبت‌نام (`handleEnroll`) در خطوط ۵۷ تا ۶۶ منحصراً تابع ماک محلی `enrollCourse` در `AuthContext` را صدا می‌زند و بدون ارسال درخواست شبکه به بک‌اند، یک آیتم به استیت محلی اضافه کرده و `CartModal` را باز می‌کند.
   - شرط نمایش دکمه در خط ۴۸ (`user?.enrolledCourseIds.includes(course.id)`) بر پایه داده‌های هاردکدشده در فرانت‌اند است.

۲. **بافت هویت و احراز کاربر (`frontend/src/context/AuthContext.tsx`):**
   - در خط ۴۵، آرایه دوره‌های ثبت‌نام‌شده برای دانشجویان روی `['course1']` و برای مدیر روی `['course1', 'course2', 'course3']` هاردکد شده است.
   - متد `enrollCourse` در خطوط ۱۲۴ تا ۱۲۹ کاملاً همگام (Synchronous) و درون‌حافظه‌ای است؛ هیچ اتصال زنده‌ای با اندپوینت بک‌اند ندارد.
   - هنگام بارگذاری مجدد صفحه (`hydrateSession`)، دوره‌های ثبت‌نام‌شده با دریافت پاسخ `/auth/me` دوباره با مقدار هاردکدشده جایگزین شده و ثبت‌نام‌های انجام‌شده از بین می‌روند.

۳. **مودال سبد خرید (`frontend/src/components/CartModal.tsx`):**
   - دارای ۱۱۸ خط کد (زیر سقف ۲۰۰ خط) است، اما فرآیند تسویه‌حساب در خطوط ۱۰۰ تا ۱۰۶ صرفاً اقلام را در `localStorage` نوشته و کاربر را به `/checkout` هدایت می‌کند و هیچ جهش زنده از طریق `apiClient` انجام نمی‌دهد.

۴. **محیط یادگیری و پلیر درسی (`frontend/src/app/courses/[id]/learn/page.tsx` و `CoursePlaylistSidebar.tsx`):**
   - کامپوننت `CourseLearnTheaterPage` دارای ۱۵۹ خط و کامپوننت `CoursePlaylistSidebar` دارای ۱۳۱ خط کد است.
   - این صفحه اساساً از `useAuth()` استفاده نمی‌کند و هیچ‌گونه اعتبارسنجی برای بررسی ثبت‌نام دانش‌پژوه انجام نمی‌دهد.
   - تمامی جلسات در سایدبار جلسات (`CoursePlaylistSidebar`) بدون بررسی وضعیت ثبت‌نام، برای همه کاربران قابل کلیک و پخش هستند و قفل جلسات غیرپیش‌نمایش برای کاربران ثبت‌نام‌نشده پیاده‌سازی نشده است.

۵. **کلاینت شبکه (`frontend/src/services/apiClient.ts`):**
   - ماژول `courses` فاقد متدهای ثبت‌نام زنده (`enroll`) و دریافت دوره‌های فعال دانش‌پژوه (`getEnrolled`) است.

---

## ۲. زنجیره شواهد و تحلیل دقیق اجزا (Evidence Chain & Inspection)

### الف) تحلیل صفحه جزئیات دوره (`frontend/src/app/courses/[id]/page.tsx`)
- **طول فایل:** ۳۵۸ خط کد (نیاز به تفکیک ماژولار جهت رعایت سقف ۲۰۰ خط).
- **مشاهده در کد:**
  ```tsx
  // خطوط ۴۸: وضعیت ثبت‌نام بر پایه آرایه محلی کاربر
  const isEnrolled = user?.enrolledCourseIds.includes(course.id);
  
  // خطوط ۵۷-۶۶: اکشن ثبت‌نام کنونی (فاقد فراخوانی API)
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
- **استدلال:** در حال حاضر، کلیک روی دکمه ثبت‌نام نه تنها توکن احراز هویت را به بک‌اند نمی‌فرستد، بلکه داده را در دیتابیس ثبت نمی‌کند. همچنین کاربر ثبت‌نام‌نشده به صفحه لاگین هدایت نمی‌شود.
- **طراحی بهینه R2:**
  - تفکیک صفحه به ۳ جزء ماژولار زیر سقف ۱۲۰ خط:
    1. `CourseDetailHero.tsx` (~۸۰ خط): سربرگ، تصویر و مشخصات رسمی استاد «حجت الاسلام دکتر زنجیر زن حسینی»، مدت و تعداد جلسات.
    2. `CourseSyllabusList.tsx` (~۸۵ خط): فهرست جلسات با دکمه پخش نمونه رایگان و نشانگرهای استودیویی.
    3. `CourseEnrollmentCard.tsx` (~۱۱۰ خط): کارت چسبان ثبت‌نام شامل شهریه، وضعیت ثبت‌نام‌شده با نشان «ثبت‌نام شده»، دکمه برجسته «ورود به محیط یادگیری و پخش دوره» متصل به `/courses/[id]/learn`، و پیوندهای مخازن رسمی صوت.
    4. هوک اختصاصی `useCourseEnrollment.ts` (~۶۰ خط): مدیریت فراخوانی ناهمگام `apiClient.courses.enroll`، نمایش وضعیت بارگذاری، و جهش وضعیت سراسری کاربر.

---

### ب) تحلیل هویت و احراز هویت (`frontend/src/context/AuthContext.tsx`)
- **طول فایل:** ۱۶۴ خط کد.
- **مشاهده در کد:**
  ```typescript
  // خطوط ۴۴-۴۸ در تابع mapUserResponseToProfile:
  enrolledCourseIds: role === 'ADMIN' ? ['course1', 'course2', 'course3'] : ['course1'],
  purchasedBookIds: role === 'ADMIN' ? ['book1', 'book2', 'book3', 'book4'] : ['book1'],
  enrolled_courses_count: userRes.enrolled_courses_count || (role === 'ADMIN' ? 3 : 1),

  // خطوط ۱۲۴-۱۲۹ در متد enrollCourse:
  const enrollCourse = (courseId: string) => {
    if (!user || user.enrolledCourseIds.includes(courseId)) return;
    const updated = { ...user, enrolledCourseIds: [...user.enrolledCourseIds, courseId] };
    setUser(updated);
    localStorage.setItem('zanjirzan_user', JSON.stringify(updated));
  };
  ```
- **استدلال:**
  ۱. تابع تبدیل پاسخ (`mapUserResponseToProfile`) مقادیر `enrolledCourseIds` را به صورت ثابت روی `['course1']` تنظیم می‌کند. اگر کاربری دوره دیگری مانند `course2` را ثبت‌نام کند، با رفرش صفحه و اجرای `hydrateSession`، دوره‌های وی با مقدار پیش‌فرض جایگزین می‌شوند.
  ۲. متد `enrollCourse` ناهمگام (Async) نیست و هیچ ارتباطی با اندپوینت شبکه برقرار نمی‌کند.
- **طراحی بهینه R2:**
  - افزودن فیلد `enrolled_course_ids?: string[]` به تایپ `User` در `types/index.ts`.
  - تبدیل `enrollCourse` به متد ناهمگام:
    ```typescript
    enrollCourse: async (courseId: string): Promise<boolean> => {
      if (!user) throw new Error('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      if (user.enrolledCourseIds.includes(courseId)) return true;
      
      const res = await apiClient.courses.enroll(courseId);
      const nextIds = [...user.enrolledCourseIds, courseId];
      const updated: UserProfile = {
        ...user,
        enrolledCourseIds: nextIds,
        enrolled_courses_count: nextIds.length,
      };
      setUser(updated);
      localStorage.setItem('zanjirzan_user', JSON.stringify(updated));
      return true;
    };
    ```
  - در `hydrateSession`، فراخوانی `apiClient.courses.getEnrolled()` یا خواندن `enrolled_course_ids` از پاسخ `/auth/me` جهت تضمین پایایی وضعیت دسترسی حتی پس از بستن و باز کردن مرورگر.

---

### ج) تحلیل کلاینت ارتباط با سرور (`frontend/src/services/apiClient.ts`)
- **طول فایل:** ۲۹۶ خط کد.
- **وضعیت کنونی ماژول courses (خطوط ۸۴-۹۳):**
  ```typescript
  courses = {
    getAll: () => this.request<Course[]>('/courses/'),
    getById: (courseId: string) => this.request<Course>(`/courses/${courseId}`),
    syncProgress: (courseId: string, chapterId: number, progressPercent: number, lastPosSec: number) =>
      this.request('/courses/' + courseId + '/progress', {
        method: 'POST',
        body: JSON.stringify({ chapter_id: chapterId, progress_percent: progressPercent, last_position_sec: lastPosSec }),
      }),
  };
  ```
- **نیازهای تکمیلی:**
  ۱. افزودن متد ثبت‌نام در دوره:
     ```typescript
     enroll: (courseId: string) =>
       this.request<{ success: boolean; course_id: string; message: string; enrolled_at: string }>(
         `/courses/${courseId}/enroll`,
         { method: 'POST' }
       ),
     ```
  ۲. افزودن متد دریافت دوره‌های ثبت‌نام‌شده:
     ```typescript
     getEnrolled: () => this.request<Course[]>('/courses/enrolled'),
     ```

---

### د) تحلیل سبد خرید و تسویه‌حساب (`frontend/src/components/CartModal.tsx`)
- **طول فایل:** ۱۱۸ خط کد.
- **مشاهده در کد (خطوط ۹۹-۱۱۳):**
  ```tsx
  <button
    onClick={() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zan_cart', JSON.stringify(items));
        window.location.href = '/checkout';
      }
      onClose();
    }}
    className="..."
  >
    <CheckCircle className="w-4 h-4" />
    <span>{dict.cart_checkout_btn}</span>
  </button>
  ```
- **استدلال:** در پنجره سبد خرید، دکمه تسویه‌حساب صرفاً آیتم‌ها را در استوریج مرورگر ذخیره می‌کند و هدایت انجام می‌دهد.
- **طراحی بهینه R2:**
  - هنگامی که سبد خرید شامل یک دوره آموزشی است و دانش‌پژوه لاگین کرده است، اکشن تسویه‌حساب می‌تواند علاوه بر هدایت به صفحه فاکتور، امکان «ثبت‌نام مستقیم و فعال‌سازی فوری دوره» را با فراخوانی `apiClient.courses.enroll` یا `apiClient.orders.create` فراهم آورد.
  - پس از ثبت‌نام موفق، اقلام ثبت‌نام‌شده از سبد حذف شده، `AuthContext` به‌روزرسانی گشته و دکمه ورود مستقیم به پلیر به کاربر ارائه می‌شود.

---

### هـ) تحلیل پلیر آموزشی و قفل جلسات (`frontend/src/app/courses/[id]/learn/page.tsx` و اجزا)
- **طول فایل صفحه:** ۱۵۹ خط کد.
- **طول سایدبار جلسات (`CoursePlaylistSidebar.tsx`):** ۱۳۱ خط کد.
- **وضعیت کنونی کنترل دسترسی:**
  - صفحه `CourseLearnTheaterPage` متغیر احراز هویت `user` را بررسی نمی‌کند.
  - سایدبار جلسات در خطوط ۶۵ تا ۱۲۶ تمام جلسات را بدون در نظر گرفتن وضعیت ثبت‌نام به عنوان دکمه‌های فعال رندر می‌کند:
  ```tsx
  <button
    type="button"
    onClick={() => onSelectChapter(idx)}
    className="..."
  >
  ```
- **طراحی بهینه R2:**
  ۱. دریافت وضعیت دانش‌پژوه در `CourseLearnTheaterPage`:
     ```typescript
     const { user } = useAuth();
     const isEnrolled = !!user && (user.role === 'ADMIN' || user.enrolledCourseIds.includes(courseId));
     ```
  ۲. ارسال `isEnrolled` به `CoursePlaylistSidebar`.
  ۳. در سایدبار جلسات:
     - اگر `!isEnrolled` باشد و جلسه جاری پیش‌نمایش رایگان نباشد (`!ch.isFreePreview` و `idx > 0`):
       - آیکون قفل (`Lock` از `lucide-react`) نمایش داده شود.
       - متن وضعیت: «نیازمند ثبت‌نام در دوره».
       - با کلیک روی جلسه قفل‌شده، پیام هشدار وزین و لینک هدایت به صفحه ثبت‌نام دوره نمایش یابد.
     - هنگامی که دانش‌پژوه ثبت‌نام کرده است (`isEnrolled === true`):
       - تمامی جلسات ۱۰۰٪ بازگشایی شوند و قابلیت پخش کامل بدون وقفه داشته باشند.

---

## ۳. بررسی انطباق با قواعد و استانداردها (Compliance Matrix)

| استاندارد | الزامات | وضعیت در معماری پیشنهادی |
| :--- | :--- | :--- |
| **سقف ۲۰۰ خط کد (LOC Ceiling)** | هر فایل کامپوننت کمتر از ۲۰۰ خط | تفکیک `courses/[id]/page.tsx` (۳۵۸ خط) به ۳ کامپوننت زیر ۱۱۰ خط و ۱ هوک ۶۰ خطی. تمامی فایل‌های جدید زیر ۱۵۰ خط خواهند بود. |
| **تثبیت نام رسمی استاد** | «حجت الاسلام دکتر زنجیر زن حسینی» | رعایت دقیق در تمام متون، هدرها، کارت‌ها و سربرگ‌های جدید بدون هرگونه تلخیص یا تغییر. |
| **مانیفست ضد اسلاپ (Anti-Slop)** | عدم استفاده از `blur-3xl`, گرادیان متن، نقاط سبز چشمک‌زن | پالت رنگی استاندارد ابسیدین `#0C0D0E`, کاغذ کهن `#FAF8F5`, رنگ مسین `#8A532B` و بردرهای دقیق ۱ پیکسلی. |
| **سامانه فاصله‌گذاری ۴ پیکسلی** | مقادیر `p-1` تا `p-8` | رعایت ۱۰۰٪ فواصل گرید ۴ پیکسلی. |
| **ویژگی‌های منطقی تیل‌ویند (Logical Properties)** | استفاده از `ps-`, `pe-`, `ms-`, `me-`, `text-start` | عدم استفاده از جهت‌های چپ/راست مطلق، سازگاری کامل با RTL. |
| **نگارش فارسی اصیل** | حذف «می‌باشد/می‌گردد»، رعایت نیم‌فاصله، گیومه فارسی و اعداد فارسی | اعمال سخت‌گیرانه طبق استاندارد مخزن `persian-writing`. |

---

## ۴. برنامه گام‌به‌گام پیاده‌سازی برای فاز R2 (Actionable Implementation Plan)

### گام ۱: به‌روزرسانی تایپ‌ها و کلاینت شبکه (`types/index.ts` و `apiClient.ts`)
- افزودن `enrolled_course_ids?: string[]` به مدل `User`.
- افزودن متدهای `apiClient.courses.enroll(courseId)` و `apiClient.courses.getEnrolled()` به `apiClient.ts`.

### گام ۲: ارتقای بافت احراز هویت (`AuthContext.tsx`)
- حذف آرایه هاردکدشده `enrolledCourseIds` در `mapUserResponseToProfile`.
- همگام‌سازی دوره‌های ثبت‌نام‌شده واقعی در فرآیند هیدراتاسیون نشست (`hydrateSession`) از طریق اندپوینت بک‌اند.
- تبدیل `enrollCourse` به متد ناهمگام متصل به `apiClient.courses.enroll`.

### گام ۳: ماژولارکردن صفحه معرفی دوره (`frontend/src/app/courses/[id]/`)
- ایجاد کامپوننت‌های:
  - `src/components/course/CourseDetailHero.tsx` (<۱۰۰ خط)
  - `src/components/course/CourseSyllabusList.tsx` (<۹۰ خط)
  - `src/components/course/CourseEnrollmentCard.tsx` (<۱۲۰ خط)
  - `src/components/course/useCourseEnrollment.ts` (<۷۰ خط)
- بازنویسی `frontend/src/app/courses/[id]/page.tsx` به صورت یک شل ارکستراسیون تمیز (<۸۰ خط).
- انتقال بلادرنگ دکمه ثبت‌نام به دکمه «ورود به محیط یادگیری و پخش دوره» متصل به `/courses/[id]/learn` با نشان «ثبت‌نام شده» بدون نیاز به رفرش صفحه.

### گام ۴: یکپارچه‌سازی تسویه‌حساب در سبد خرید (`CartModal.tsx`)
- اضافه کردن هندلر تسویه‌حساب زنده که در صورت وجود دوره‌های آموزشی در سبد، درخواست ثبت‌نام زنده را به بک‌اند ارسال کرده و کاربر را پس از موفقیت مطلع می‌سازد.

### گام ۵: پیاده‌سازی قفل و بازگشایی در پلیر یادگیری (`learn/page.tsx` و `CoursePlaylistSidebar.tsx`)
- بررسی وضعیت `isEnrolled` با استفاده از `useAuth()`.
- قفل کردن جلسات غیرپیش‌نمایش برای کاربران ثبت‌نام‌نشده و نمایش آیکون `Lock`.
- بازگشایی ۱۰۰٪ تمامی جلسات برای دانشجویان ثبت‌نام‌شده و مدیران، همراه با ماندگاری کامل پس از بارگذاری مجدد مرورگر.

---

## ۵. نتیجه‌گیری (Conclusion)
فرانت‌اند فعلی از نظر طراحی بصری بسیار پاکیزه و منطبق بر مانیفست ضد اسلاپ است، اما منطق ثبت‌نام و بررسی دسترسی در لایه‌های میانی به صورت ماک محلی پیاده‌سازی شده بود. اجرای گام‌های پنج‌گانه فوق در فاز کارگری (R2)، فرانت‌اند را به طور کامل به پایگاه داده پایدار SQLite و بک‌اند FastAPI متصل کرده و الزامات سقف ۲۰۰ خط، عدم اسلاپ و هویت رسمی استاد را به صورت صددرصدی محقق خواهد کرد.
