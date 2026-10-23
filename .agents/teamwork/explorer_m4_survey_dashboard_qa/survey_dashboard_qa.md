# گزارش جامع پیمایش داشبورد دانش‌پژوه و تضمین کیفیت (Survey: Student Dashboard & QA Gate)
## پلتفرم جامع علمی و آموزشی حجت الاسلام دکتر زنجیر زن حسینی

- **مأموریت:** بررسی ساختار زبانه‌ها و جداول داشبورد، اتصال داده‌های برخط ثبت‌نام، آزمون‌های یکپارچگی بک‌اند، و اعتبارسنجی خط لوله ممیزی خودکار.
- **کاوشگر:** `explorer_m4_survey_dashboard_qa`
- **تاریخ ارزیابی:** اکتبر ۲۰۲۶ (۱۴۰۵ هـ.ش)
- **وضعیت بررسی:** تکمیل‌شده و آماده اجرا

---

## ۱. خلاصه مدیریتی (Executive Summary)

پیمایش جامع انجام‌شده بر روی زیرسیستم‌های فرانت‌اند داشبورد (`/dashboard`)، کلاینت ارتباطی (`apiClient`)، پایگاه‌داده و مدل‌های SQLAlchemy بک‌اند، و ابزارهای سنجش کیفیت نشان می‌دهد:

۱. **ناهمخوانی وضعیت فعلی داشبورد با دیتابیس برخط:**
   در کامپوننت‌های `DashboardOverviewTab.tsx` و `DashboardCoursesTab.tsx`، فهرست دوره‌های در حال گذراندن از مقادیر ماک درون‌حافظه‌ای (`Object.values(courses)`) و برش‌های فرضی (`slice(0, 4)`) تغذیه می‌شود. کاربر در هر دوره‌ای که ثبت‌نام کند، داشبورد آن را منعکس نمی‌کند زیرا هیچ پالایشی بر مبنای `user.enrolledCourseIds` یا فراخوانی اندپوینت `/api/v1/courses/enrolled` انجام نمی‌شود.

۲. **نقض سقف ۲۰۰ خطی در کامپوننت مرور کلی داشبورد:**
   فایل `frontend/src/components/dashboard/tabs/DashboardOverviewTab.tsx` با ۲۴۴ خط کد، سقف مجاز معماری REA (حداکثر ۲۰۰ خط در هر فایل) را نقض کرده است و باید با استخراج داده‌ها و تعاریف به یک فایل کمکی ماژولار تجزیه شود.

۳. **نیاز به اندپوینت‌های پایدار ثبت‌نام در بک‌اند:**
   جدول `enrollments` در اسکیمای پایگاه‌داده SQLite موجود است، اما اندپوینت‌های `POST /api/v1/courses/{course_id}/enroll` و `GET /api/v1/courses/enrolled` هنوز در `backend/app/api/v1/endpoints/courses.py` پیاده‌سازی نشده‌اند.

۴. **آزمون‌های یکپارچگی بک‌اند:**
   مجموعه آزمون‌های `backend/tests/test_in_memory.py` دارای ۱۰ آزمون موفق است که همگی پاس می‌شوند. برای تأیید ملزومات مأموریت M4، باید ۴ تست یکپارچگی جدید برای ثبت‌نام در دوره، رد ثبت‌نام تکراری با خطای فارسی، استخراج دوره‌های کاربر، و ثبت سفارش متصل به پایگاه‌داده اضافه شود.

۵. **خط لوله ممیزی خودکار (`audit_pipeline.py`):**
   خط لوله ممیزی با نمره ۱۰۰/۱۰۰ پاس می‌شود و شامل ۸ مرحله بررسی دقیق است. هرگونه تغییر در کامپوننت‌های فرانت‌اند و بک‌اند باید به این قواعد (تثبیت نام استاد، منع اسلاپ هوش مصنوعی، و نگارش فارسی اصیل بدون افعال اداری) پایبند باشد.

---

## ۲. کالبدشکافی ساختار داشبورد دانش‌پژوه (Dashboard Architecture Survey)

### ۲.۱. ساختار سلسله‌مراتبی فایل‌های داشبورد
```
frontend/src/app/dashboard/
└── page.tsx                                  # شل اصلی، بررسی احراز هویت، سوئیچر ۷ زبانه (۱۸۵ خط)

frontend/src/components/dashboard/
├── shared/
│   ├── KpiMetricStrip.tsx                    # نوار ۴تایی شاخص‌های کلیدی عملکرد (۷۸ خط)
│   ├── MinimalistBarChart.tsx                # نمودار میله‌ای ساعت‌های استماع و پژوهش (۱۴۲ خط)
│   └── OngoingCoursesTable.tsx               # جدول دوره‌های در حال گذراندن (۱۴۴ خط)
└── tabs/
    ├── DashboardOverviewTab.tsx              # تب میز کار پژوهشی (۲۴۴ خط - نیازمند ماژولارسازی)
    ├── DashboardCoursesTab.tsx               # تب درس‌گفتارهای من (۸۵ خط)
    ├── DashboardBooksTab.tsx                 # کتابخانه و کتب (۷۵ خط)
    ├── DashboardNotesTab.tsx                 # یادداشت‌ها و حواشی پژوهشی (۱۸۸ خط)
    ├── DashboardOrdersTab.tsx                # سفارش‌های پستی و رهگیری مرسولات (۷۶ خط)
    ├── DashboardCertificatesTab.tsx          # گواهی‌نامه‌های پایان دوره (۷۶ خط)
    ├── DashboardSupportTab.tsx               # ارتباط و پرسش و پاسخ علمی (۱۳۸ خط)
    └── DashboardEnrollmentsTab.tsx           # پوسته ریدایرکت به تب دوره‌ها (۱۳ خط)
```

### ۲.۲. بررسی صفحه اصلی داشبورد (`frontend/src/app/dashboard/page.tsx`)
- **حجم فایل:** ۱۸۵ خط (کاملاً زیر سقف ۲۰۰ خط).
- **گیت دسترسی:** در صورت نامعتبر بودن نشست (`!user`)، کامپوننت `ShellAuthGate` رندر می‌شود که دکمه ورود دمو و هدایت به `/login` را فراهم می‌کند.
- **زبانه‌های هفت‌گانه:** با استفاده از شناسه `activeTab`، کامپوننت متناظر را در قالب `ShellLayout` جای‌گذاری می‌کند.

### ۲.۳. کالبدشکافی `DashboardOverviewTab.tsx` (اشکالات و نیازهای بازطراحی)
- **حجم فایل فعلی:** ۲۴۴ خط (⚠️ فراتر از سقف ۲۰۰ خطی).
- **منبع داده فعلی:**
  ```tsx
  const { courses, orders } = useData();
  const courseList = Object.values(courses);
  const firstCourse = courseList[0];
  const ongoingCourses: OngoingCourseItem[] = courseList.slice(0, 4).map((c, idx) => { ... });
  ```
- **نقاط ضعف شناسایی‌شده:**
  ۱. به جای استخراج دوره‌هایی که دانش‌پژوه واقعاً در آن‌ها ثبت‌نام کرده، ۴ دوره اول کاتالوگ عمومی را برمی‌دارد.
  ۲. درصد پیشرفت و جلسات گذرانده‌شده به صورت محاسبات ساختگی (`completed = idx === 0 ? 4 : ...`) ایجاد می‌شود.
  ۳. بنر ادامه استماع بالای صفحه همیشه اولین دوره کاتالوگ عمومی را نشان می‌دهد، حتی اگر دانشجو در آن ثبت‌نام نکرده باشد.
- **طرح اصلاحی و شکستن فایل:**
  - استخراج دیکشنری متون و داده‌های نمودار به فایل کمکی `DashboardOverviewConfig.ts` یا هوک اختصاصی.
  - فیلتر کردن فهرست دوره‌ها بر مبنای `user?.enrolledCourseIds` یا داده‌های برخط `apiClient.courses.getEnrolled()`.
  - کاهش حجم فایل به زیر ۱۴۰ خط.

### ۲.۴. کالبدشکافی `DashboardCoursesTab.tsx`
- **حجم فایل فعلی:** ۸۵ خط (زیر سقف ۲۰۰ خط).
- **منبع داده فعلی:**
  ```tsx
  const { courses } = useData();
  const enrolledList = Object.values(courses);
  ```
- **اشکال اصلی:** تمام دوره‌های موجود در سامانه را به عنوان دوره‌های ثبت‌نام‌شده دانشجو نمایش می‌دهد!
- **طرح اصلاحی:**
  - تغییر منبع داده به:
    ```tsx
    const enrolledList = Object.values(courses).filter(c => user?.enrolledCourseIds?.includes(c.id));
    ```
  - در صورت خالی بودن (`enrolledList.length === 0`)، رندر کردن وضعیت خالی محترمانه همراه با پیوند به کاتالوگ دوره‌ها (`/courses`).
  - هر کارت شامل عنوان دقیق دوره، برچسب مدرس («مدرس: حجت الاسلام دکتر زنجیر زن حسینی»)، تعداد جلسات و دکمه مستقیم «ورود به پلیر» به نشانی `/courses/[id]/learn` است.

### ۲.۵. تحلیل دقیق `OngoingCoursesTable.tsx`
- **حجم فایل فعلی:** ۱۴۴ خط (زیر سقف ۲۰۰ خط).
- **اینترفیس ورودی:**
  ```tsx
  export interface OngoingCourseItem {
    id: string;
    title: string;
    subject: string;
    currentChapterTitle: string;
    completedChapters: number;
    totalChapters: number;
    progressPercent: number; // 0 to 100
    courseType?: 'offline' | 'online';
    lastPlayedAt?: string;
  }
  ```
- **ستون‌های جدول:**
  ۱. **عنوان دوره و موضوع:** برچسب موضوع، عنوان دوره و نام رسمی استاد.
  ۲. **جلسه جاری:** عنوان مبحث همراه با شمارنده جلسات به عدد فارسی (`toLocale(completed) از toLocale(total)`).
  ۳. **ردیف پیشرفت باریک:** نوار افقی با استایل دیزاین سیستم (`w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800` پرشده با رنگ مس/تراکوتا `#8A532B` / `#C58B43`) و نمایش درصد فارسی.
  ۴. **برچسب کیفیت صوتی:** بج مونو با متن `۴۸kHz Studio`.
  ۵. **عملیات پیگیری:** دکمه با پیوند مستقیم به `/courses/${course.id}/learn` و آیکون Play.
- **وضعیت تهی (Empty State):** در صورتی که ورودی `courses` آرایه خالی باشد، پیام مناسب `dict.ongoing_no_courses` («هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید») را نمایش می‌دهد.

---

## ۳. اتصال داده‌های زنده و سنکرون‌سازی ثبت‌نام (Live Data Synchronization)

### ۳.۱. گره‌های فعلی معماری کلاینت
در فایل `frontend/src/context/AuthContext.tsx`:
```tsx
enrolledCourseIds: role === 'ADMIN' ? ['course1', 'course2', 'course3'] : ['course1'],
```
مقادیر شناسه‌های ثبت‌نام به صورت هاردکد تنظیم شده‌اند. تابع `enrollCourse` نیز صرفاً آرایه درون‌حافظه‌ای را تغییر داده و در `localStorage` ذخیره می‌کرد.

### ۳.۲. زنجیره تعاملی جدید مورد نیاز
```
[کاربر روی دکمه ثبت‌نام کلیک می‌کند]
       │
       ▼
[courses/[id]/page.tsx یا CartModal.tsx]
       │
       ▼ فراخوانی متد apiClient.courses.enroll(courseId)
[POST /api/v1/courses/{course_id}/enroll] (با توکن Bearer کاربر)
       │
       ├─► بررسی پایگاه‌داده (جدول enrollments): آیا کاربر قبلاً ثبت‌نام کرده؟
       │     ├─ بله: بازگرداندن HTTP 400 با پیام فارسی «شما قبلاً در این دوره ثبت‌نام کرده‌اید.»
       │     └─ خیر: درج رکورد جدید در جدول enrollments با وضعیت active و شناسه کاربر
       │
       ▼ بازگشت پاسخ موفق HTTP 200
[بروزرسانی AuthContext و ذخیره شناسه در user.enrolledCourseIds]
       │
       ├─► دکمه صفحه دوره بدون رفرش به «ورود به محیط یادگیری و پخش دوره» تغییر می‌یابد
       ├─► تمامی جلسات قفل‌شده در پلیر بازگشایی می‌شوند
       └─► در صفحه /dashboard دوره بلافاصله در OngoingCoursesTable و تب دوره‌ها نمایش داده می‌شود
```

### ۳.۳. تغییرات لازم در `apiClient.ts`
افزودن متدهای ثبت‌نام و دریافت دوره‌های ثبت‌نام‌شده:
```typescript
courses = {
  getAll: () => this.request<Course[]>('/courses/'),
  getById: (courseId: string) => this.request<Course>(`/courses/${courseId}`),
  enroll: (courseId: string) =>
    this.request<{ success: boolean; message: string; course_id: string }>(`/courses/${courseId}/enroll`, {
      method: 'POST',
    }),
  getEnrolled: () => this.request<Course[]>('/courses/enrolled'),
  syncProgress: ...
};
```

---

## ۴. اعتبارنامه‌های استاد و تثبیت نام رسمی (Scholar Credentials)

طبق بند ۱ قوانین بنیادین پروژه (`GEMINI.md`) و قاعده رسمی استاد:
- **نام یکتا و تغییرناپذیر:** منحصراً **«حجت الاسلام دکتر زنجیر زن حسینی»**.
- **ممنوعیت کامل:** هیچ‌گونه خلاصه‌سازی («دکتر زنجیرزن»، «استاد حسینی»، «دکتر میثم زنجیرزن») در هیچ بخشی از کد، جدول یا یوآی مجاز نیست.
- **اعتبارنامه‌های آکادمیک و حوزوی (Credentials):**
  - فارسی: «مدرس سطوح عالی حوزه • شارح حکمت متعالیه و اسفار»
  - عربی: «أستاذ السطوح العليا في الحوزة العلمية • شارح الأسفار الأربعة»
  - انگلیسی: «Lecturer of Advanced Seminary Studies • Commentator on Transcendent Philosophy»
- **استقرار در کامپوننت‌های داشبورد:**
  - در بنر ادامه استماع `DashboardOverviewTab`: خط مشخصات استاد (`text.scholar_line`) با نام کامل استاد.
  - در کارت‌های `DashboardCoursesTab`: فیلد `مدرس: حجت الاسلام دکتر زنجیر زن حسینی`.
  - در جدول `OngoingCoursesTable`: اضافه کردن خط زیرنویس مشخصات استاد ذیل عنوان هر درس‌گفتار.

---

## ۵. تحلیل آزمون‌های بک‌اند (`backend/tests/test_in_memory.py`)

### ۵.۱. وضعیت آزمون‌های فعلی
فایل `backend/tests/test_in_memory.py` با ۳۴۹ خط کد، آزمون‌های زیر را به شکل همزمان بر روی `TestClient` اجرا می‌کند:
۱. `test_root_health`: اعتبارسنجی سلامت سامانه و تطابق نام رسمی استاد.
۲. `test_auth_endpoints`: اعتبارسنجی ورود کاربر و مدیر با bcrypt و صدور توکن امضاشده.
۳. `test_rbac_security_shield`: اعمال سیاست امنیتی دسترسی به اندپوینت‌های ادمین (۴۰۱ و ۴۰۳).
۴. `test_drm_stream_shield`: صدور توکن استریم صوتی و رد دستکاری رمزنگاری.
۵. `test_audio_range_streaming`: پشتیبانی از درخواست‌های بازه‌ای صوت (RFC 7233).
۶. `test_courses_catalog`: کاتالوگ دوره‌ها و سرآیندهای RateLimit.
۷. `test_ai_chat_assistant`: دستیار هوش مصنوعی و تحلیل اسناد فلسفی.
۸. `test_admin_course_management`: مدیریت دوره‌ها و جلسات توسط ادمین.
۹. `test_persistent_sqlite_auth_and_registration`: ثبت‌نام پایدار کاربر در دیتابیس SQLite و رد موبایل تکراری.
۱۰. `test_registration_persistence_and_duplicate_error`: تایید فیزیکی فایل دیتابیس `zanjirzan_platform.db`.

### ۵.۲. آزمون‌های یکپارچگی جدید الزامی برای M4
جهت احراز معیارهای پذیرش M4، چهار تابع آزمون جدید باید به `test_in_memory.py` افزوده شوند:

#### ۱. آزمون پایداری ثبت‌نام دوره (`test_course_enrollment_persistence`)
```python
def test_course_enrollment_persistence():
    # ۱. ورود کاربر دانشجو و دریافت توکن
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ۲. فراخوانی اندپوینت ثبت‌نام در دوره
    course_id = "course-mabadi-mantiq"
    res = client.post(f"/api/v1/courses/{course_id}/enroll", headers=headers)
    assert res.status_code == 200, f"Enrollment failed: {res.text}"
    assert res.json()["success"] is True

    # ۳. تایید مستقیم درج فیزیکی در جدول enrollments در دیتابیس SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        row = con.execute("SELECT id, user_id, course_id, status FROM enrollments WHERE course_id = ?", (course_id,)).fetchone()
        assert row is not None, "Enrollment record not found in SQLite table!"
        assert row[2] == course_id
        assert row[3] == "active"
```

#### ۲. آزمون رد ثبت‌نام تکراری با خطای ساختاریافته فارسی (`test_duplicate_course_enrollment_rejection`)
```python
def test_duplicate_course_enrollment_rejection():
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    course_id = "course-mabadi-mantiq"

    # تلاش مجدد برای ثبت‌نام در دوره قبلاً ثبت‌نام‌شده
    dup_res = client.post(f"/api/v1/courses/{course_id}/enroll", headers=headers)
    assert dup_res.status_code == 400, f"Expected 400 for duplicate enrollment, got {dup_res.status_code}"
    err_text = dup_res.text
    assert ("قبلاً در این دوره ثبت‌نام" in err_text or "ALREADY_ENROLLED" in err_text), f"Expected Persian duplicate error, got: {err_text}"

    # تایید عدم ایجاد رکورد مضاعف در پایگاه‌داده
    with sqlite3.connect("zanjirzan_platform.db") as con:
        count = con.execute("SELECT count(*) FROM enrollments WHERE course_id = ?", (course_id,)).fetchone()[0]
        assert count == 1, f"Expected exactly 1 enrollment row, found {count}"
```

#### ۳. آزمون دریافت فهرست دوره‌های فعال دانشجو (`test_enrolled_courses_retrieval`)
```python
def test_enrolled_courses_retrieval():
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # ۱. دریافت دوره‌های ثبت‌نام‌شده با توکن معتبر
    enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert enrolled_res.status_code == 200
    courses = enrolled_res.json()
    assert isinstance(courses, list)
    assert any(c["id"] == "course-mabadi-mantiq" for c in courses)

    # ۲. درخواست بدون توکن باید با کد ۴۰۱ رد شود
    unauth_res = client.get("/api/v1/courses/enrolled")
    assert unauth_res.status_code == 401
```

#### ۴. آزمون ثبت سفارش و ثبت‌نام خودکار دوره (`test_orders_checkout_persistence`)
```python
def test_orders_checkout_persistence():
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    order_payload = {
        "items": [
            {"id": "course-bidayat", "title": "شرح بدایة الحکمة", "price": 0, "quantity": 1, "item_type": "course"},
            {"id": "book1", "title": "مبادی حکمت", "price": 385000, "quantity": 1, "item_type": "book"}
        ],
        "shipping_address": "قم، خیابان معلم، پلاک ۱۲",
        "postal_code": "3718912345",
        "recipient_name": "علی موسوی",
        "recipient_phone": "09123456789"
    }

    res = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert res.status_code == 200
    order_data = res.json()
    assert "order_id" in order_data
    assert order_data["postal_barcode_24digit"] is not None
    assert len(order_data["postal_barcode_24digit"]) == 24
```

---

## ۶. تفکیک دقیق آزمون‌های خط لوله ممیزی خودکار (`audit_pipeline.py`)

خط لوله `audit_pipeline.py` دروازه کنترل کیفیت نهایی سامانه است و از ۸ بررسی خودکار مجزا تشکیل شده است:

| مرحله | عنوان بررسی | فایل‌های مورد بازرسی | شروط قبولی (۱۰۰/۱۰۰) |
|---|---|---|---|
| **۱** | تثبیت نام رسمی استاد | `data.ts`, `app/page.tsx`, `Navbar.tsx`, `config.py`, `main.py`, `llms.txt` | درج عبارت کامل «حجت الاسلام دکتر زنجیر زن حسینی» بدون تلخیص یا نام قبلی |
| **۲** | مانیفست ضد اسلاپ | کلیه فایل‌های `*.tsx` در `app` و `components` | صفر بودن الگوهای: `blur-3xl bg-*-500/10`، `bg-clip-text text-transparent`، `bg-emerald-500 animate-pulse` |
| **۳** | تست‌های خودکار بک‌اند | اجرای `backend/tests/test_in_memory.py` | خروج با کد صفر و قبولی ۱۰۰٪ کلیه تست‌های احراز هویت، DRM، و ثبت‌نام |
| **۴** | استانداردهای سئو | `sitemap.ts`, `robots.ts`, `llms.txt`, `SEO_STANDARDS.md` | وجود تمامی فایل‌های چهارگانه با خروجی معتبر |
| **۵** | پالایش موازی صوت | `audio_enhance_colab.ipynb`, `audio_enhance_kaggle.ipynb` | وجود `ProcessPoolExecutor` برای پردازش چندرشته‌ای صوت‌های درس خارج |
| **۶** | اسناد حافظه دائمی | `DESIGN.md`, `BACKEND_SYSTEM_DESIGN.md`, `GEMINI.md`, اسناد قوانین | وجود کلیه فایل‌های قواعد و طراحی |
| **۷** | نگارش فارسی اصیل | کلیه فایل‌های فرانت‌اند در `app`, `lib`, `components`, `context` | عدم استفاده از افعال اداری (`می‌باشد`, `گردید`), حذف کلیشه‌ها, رعایت نیم‌فاصله |
| **۸** | انطباق Spec Kit | فایل‌های `specs/*` و `MotionPrimitives.tsx` | وجود مشخصات نسخه Bespoke Editorial و نام رسمی استاد |

---

## ۷. نقشه راه پیاده‌سازی و گام‌های عملیاتی برای R3 و تضمین کیفیت

### فاز ۱: پیاده‌سازی بک‌اند (Backend Persistence & Endpoints)
۱. افزودن اندپوینت `POST /api/v1/courses/{course_id}/enroll` به `backend/app/api/v1/endpoints/courses.py` با تزریق وابستگی `get_current_user` و `get_db`.
۲. افزودن اندپوینت `GET /api/v1/courses/enrolled` جهت استخراج دوره‌های فعال کاربر از دیتابیس SQLite.
۳. ارتقای متد `create_order` در `order_service.py` تا در صورت وجود اقلام دوره آموزشی برای کاربر احرازشده، رکوردهای ثبت‌نام به طور خودکار در جدول `enrollments` درج شوند.
۴. بروزرسانی `backend/tests/test_in_memory.py` با افزودن آزمون‌های چهارگانه ثبت‌نام، تکراری، دریافت، و سفارش.

### فاز ۲: ارتقای لایه سرویس و کلاینت فرانت‌اند (apiClient & Context)
۱. افزودن متدهای `courses.enroll` و `courses.getEnrolled` به `frontend/src/services/apiClient.ts`.
۲. همگام‌سازی `enrolledCourseIds` در `AuthContext.tsx` با داده‌های زنده دریافتی از بک‌اند و ذخیره در سشن.
۳. ارتقای تابع `enrollCourse` در `AuthContext` جهت فراخوانی متد زنده بک‌اند و بروزرسانی بلادرنگ وضعیت دوره.

### فاز ۳: بازطراحی و ماژولارسازی تب‌های داشبورد (Frontend Dashboard Refactoring)
۱. **تجزیه `DashboardOverviewTab.tsx`:** استخراج متن‌ها و دیکشنری‌ها به `DashboardOverviewConfig.ts` جهت کاهش حجم فایل به زیر ۱۴۰ خط (رعایت خط‌کش ۲۰۰ LOC).
۲. **اتصال `OngoingCoursesTable` به دوره‌های ثبت‌نام‌شده واقعی:** فیلتر کردن فهرست دوره‌ها بر مبنای `user.enrolledCourseIds` یا `apiClient.courses.getEnrolled()`.
۳. **بروزرسانی `DashboardCoursesTab.tsx`:** نمایش کارت‌های دوره‌های ثبت‌نام‌شده دانشجو با دکمه مستقیم «ورود به پلیر» به نشانی `/courses/[id]/learn`.
۴. **درج اعتبارنامه رسمی استاد:** اطمینان از درج عبارت کامل «حجت الاسلام دکتر زنجیر زن حسینی» و اعتبارنامه حوزوی در تمام بخش‌ها.

### فاز ۴: اعتبارسنجی نهایی و اجرای پایپ‌لاین
۱. اجرای تست‌های بک‌اند: `python backend/tests/test_in_memory.py`.
۲. اجرای پایپ‌لاین ممیزی: `python audit_pipeline.py` جهت کسب نمره ۱۰۰/۱۰۰.
۳. اجرای بیلد فرانت‌اند: `npm run build` با خروج کد صفر.
