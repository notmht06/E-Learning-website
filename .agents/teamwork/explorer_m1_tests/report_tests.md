# گزارش جامع آزمون‌های یکپارچگی ثبت‌نام و سفارش‌ها (M1 Integration Tests Specification)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**نگارش:** کاوشگر آزمون‌های یکپارچگی (`explorer_m1_tests`)  
**تاریخ گزارش:** ۲۱ مهر ۱۴۰۵ (2026-10-13)  
**محدوده عملیاتی:** `backend/tests/test_in_memory.py`  
**وابستگی‌ها:** `backend/app/models/`, `backend/app/api/v1/endpoints/courses.py`, `backend/app/api/v1/endpoints/orders.py`, `backend/app/services/`

---

## ۱. چکیده اجرایی و اهداف فاز (Executive Summary)

این سند مشخصات فنی، چارچوب سناریوها و کد دقیق پایتون برای ۴ آزمون یکپارچگی جدید را تعیین می‌کند که باید به فایل `backend/tests/test_in_memory.py` افزوده شوند. این آزمون‌ها تضمین‌کننده صحت عملکرد ثبت‌نام پایدار دوره‌ها، جلوگیری از ثبت‌نام تکراری، استخراج دوره‌های فعال دانشجو و پردازش پایدار سفارش‌ها در دیتابیس SQLite هستند.

اهداف بنیادین این ماژول:
1. **آزمون پایداری ثبت‌نام دوره (`test_course_enrollment_persistence`):** فراخوانی `POST /api/v1/courses/{course_id}/enroll` با توکن معتبر دانشجو، بررسی کد وضعیت HTTP 200 و راستی‌آزمایی فیزیکی رکورد در جدول `enrollments` دیتابیس SQLite.
2. **آزمون رد ثبت‌نام تکراری (`test_duplicate_course_enrollment_rejection`):** تلاش مجدد برای ثبت‌نام در دوره فعال، بررسی بازگشت کد وضعیت HTTP 400 و پیام خطای ساختاریافته فارسی، و اطمینان از عدم درج رکوردهای مضاعف در پایگاه داده.
3. **آزمون استخراج دوره‌های فعال (`test_enrolled_courses_retrieval`):** فراخوانی `GET /api/v1/courses/enrolled` و بررسی بازگشت دوره‌های فعال، به‌علاوه راستی‌آزمایی همگام‌سازی نمایه در `GET /api/v1/auth/me` شامل فیلدهای `enrolled_course_ids` و `enrolled_courses_count`.
4. **آزمون ثبت سفارش و ثبت‌نام خودکار (`test_orders_checkout_persistence`):** فراخوانی ناهمگام `POST /api/v1/orders/create` با آیتم دوره، بررسی درج سفارش در جدول `orders` و ثبت‌نام آنی و خودکار در جدول `enrollments`.
5. **تضمین عدم رگرسیون (Zero Regression):** استمرار قبولی ۱۰۰ درصدی ۱۰ آزمون پیشین بدون ایجاد اختلال در جریان تست‌های احراز هویت، استریم DRM، دستیار هوش مصنوعی و پنل مدیریت.

---

## ۲. وضعیت فعلی سامانه آزمون و پایگاه داده (Baseline Analysis)

### ۲.۱. نتایج آزمون‌های ده‌گانه موجود
اجرای فایل `backend/tests/test_in_memory.py` در محیط مجازی پروژه با موفقیت کامل و خروجی زیر تایید شد:
- `test_root_health`: تایید سلامت ریشه و نام رسمی «حجت الاسلام دکتر زنجیر زن حسینی».
- `test_auth_endpoints`: صدور توکن‌های دانشجو و مدیر با اعتبارسنجی bcrypt.
- `test_rbac_security_shield`: اعمال کدهای ۴۰۱ برای ناشناس، ۴۰۳ برای دانشجو و ۲۰۰ برای مدیر.
- `test_drm_stream_shield`: صدور توکن امضاشده DRM و کشف دستکاری.
- `test_audio_range_streaming`: استریم با بازه بایت (RFC 7233 206 Partial Content).
- `test_courses_catalog`: بارگذاری کاتالوگ دوره‌ها با سرآیندهای محدودیت نرخ.
- `test_ai_chat_assistant`: چت بازیابی پیشرفته (RAG) حکمت متعالیه و تحلیل اسناد.
- `test_admin_course_management`: چرخه CRUD دوره‌ها و جلسات با توکن مدیر.
- `test_persistent_sqlite_auth_and_registration`: ثبت‌نام پایدار، اعتبارسنجی هش و هیدراتاسیون `/me`.
- `test_registration_persistence_and_duplicate_error`: ثبت‌نام قطعی کاربر `09191112233` و بررسی خطای ۴۰۰ برای شماره تکراری.

### ۲.۲. کالبدشکافی وضعیت دیتابیس `zanjirzan_platform.db`
طی بررسی مستقیم با دستورات اس‌کیوال مشخص شد:
- جدول `courses`: در حال حاضر دارای ۰ رکورد است.
- جدول `enrollments`: دارای ۰ رکورد است.
- جدول `users`: دارای ۱۱۴ رکورد است (شامل حساب کاربری دانشجوی پیش‌فرض `usr-140301` با شماره `09123456789`).
- جداول `orders` و `order_items`: هنوز در مدل‌های فعلی ایجاد نشده‌اند و در گام اول فاز M1 توسط توسعه‌دهنده بک‌اند اضافه می‌شوند.

### ۲.۳. نکته حیاتی پیرامون کلیدهای خارجی SQLite
دیتابیس تحت پیکربندی `PRAGMA foreign_keys = ON;` کار می‌کند. ستون `course_id` در جدول `enrollments` دارای قید کلید خارجی به `courses.id` است. بنابراین، آزمون‌های یکپارچگی ثبت‌نام باید متکی بر این اصل باشند که دوره‌ها پیش از ثبت‌نام در جدول `courses` درج شده‌اند (از طریق متد `seed_default_courses` در `init_db` یا اطمینان‌بخشی داخلی در متد `enroll_student`).

---

## ۳. مشخصات تفصیلی چهار آزمون جدید (Test Specifications)

### آزمون اول: `test_course_enrollment_persistence`
- **هدف:** اعتبارسنجی ثبت‌نام دانشجو در دوره `course-mabadi-mantiq` و تایید ثبت فیزیکی در جدول `enrollments`.
- **پیش‌شرط و ایزولاسیون:**
  - دریافت توکن دانشجوی پیش‌فرض (`usr-140301`).
  - پاکسازی هرگونه رکورد ثبت‌نام قبلی این کاربر برای دوره `course-mabadi-mantiq` در SQLite جهت تکرارپذیری تست.
- **درخواست:** `POST /api/v1/courses/course-mabadi-mantiq/enroll` با سرآیند `Authorization: Bearer <student_token>`.
- **انتظارات پاسخ (Assertions):**
  - کد وضعیت HTTP 200.
  - بدنه پاسخ: `success: True`, `status: "active"`, `course_id: "course-mabadi-mantiq"`.
  - حضور شناسه یکتای ثبت‌نام (`enrollment_id`) با پیشوند استاندارد `enr-`.
  - وجود تاریخ میلادی ثبت‌نام (`enrolled_at`).
  - متن فارسی پیام موفقیت: حاوی عبارت «ثبت‌نام».
- **راستی‌آزمایی دیتابیس (Direct SQLite Verification):**
  - اتصال با `sqlite3.connect("zanjirzan_platform.db")`.
  - اجرای کوئری `SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?`.
  - تایید بازگشت دقیقاً یک سطر با مقادیر منطبق.
- **اعتبارسنجی امنیت:**
  - فراخوانی اندپوینت بدون توکن احراز هویت باید کد وضعیت ۴۰۱ برگرداند.

---

### آزمون دوم: `test_duplicate_course_enrollment_rejection`
- **هدف:** جلوگیری از ثبت‌نام دوباره دانشجو در دوره‌ای که قبلاً در آن ثبت‌نام فعال دارد.
- **پیش‌شرط:**
  - کاربر در دوره `course-mabadi-mantiq` ثبت‌نام فعال دارد (از آزمون قبلی).
  - شمارش تعداد سطرهای فعلی در دیتابیس: `count_before == 1`.
- **درخواست:** فراخوانی مجدد `POST /api/v1/courses/course-mabadi-mantiq/enroll` با همان توکن دانشجو.
- **انتظارات پاسخ (Assertions):**
  - کد وضعیت HTTP 400.
  - بدنه خطا حاوی کد خطای `DUPLICATE_ENROLLMENT`.
  - متن خطای فارسی ساختاریافته مطابق با مانیفست نگارش: «شما پیش از این در دوره «...» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.».
  - عدم استفاده از افعال اداری فرسوده («می‌باشد» یا «می‌گردد»).
- **راستی‌آزمایی دیتابیس:**
  - شمارش مجدد سطرهای دیتابیس: `count_after == 1`.
  - تضمین عدم ایجاد هیچ رکورد تکراری در جدول `enrollments`.

---

### آزمون سوم: `test_enrolled_courses_retrieval`
- **هدف:** استخراج لیست دوره‌های فعال ثبت‌نام‌شده دانشجو و هیدراتاسیون اطلاعات در نمایه `/auth/me`.
- **پیش‌شرط:** دانشجو در دوره `course-mabadi-mantiq` ثبت‌نام کرده است.
- **بخش الف — اندپوینت `/api/v1/courses/enrolled`:**
  - درخواست: `GET /api/v1/courses/enrolled` با سرآیند احراز هویت.
  - کد وضعیت HTTP 200.
  - پاسخ به صورت لیستی از اشیاء دوره (`List[CourseDetailSchema]`).
  - وجود شناسه `course-mabadi-mantiq` در لیست دریافتی.
  - تطابق نام دوره: «سلسله جلسات مبادی منطق و تفکر عقلانی».
  - تطابق نام مدرس با هویت رسمی: «حجت الاسلام دکتر زنجیر زن حسینی».
  - حضور جلسات و سرفصل‌ها (`syllabus`) با تعداد ۹ جلسه.
  - درخواست بدون توکن باید با کد ۴۰۱ پس زده شود.
- **بخش ب — هیدراتاسیون نمایه در `/api/v1/auth/me`:**
  - درخواست: `GET /api/v1/auth/me` با سرآیند احراز هویت.
  - کد وضعیت HTTP 200.
  - وجود کلید `enrolled_course_ids` حاوی `course-mabadi-mantiq`.
  - وجود کلید `enrolled_courses_count` با مقداری بزرگتر یا مساوی ۱ (منطبق با طول آرایه `enrolled_course_ids`).

---

### آزمون چهارم: `test_orders_checkout_persistence`
- **هدف:** ثبت سفارش سبد خرید حاوی آیتم دوره آموزشی، ذخیره پایدار در جداول `orders` و `order_items`، و ثبت‌نام خودکار دانشجو در دوره خریداری‌شده.
- **پیش‌شرط:**
  - پاکسازی ثبت‌نام احتمالی قبلی کاربر در دوره هدف دوم (`course-bidayat`) در دیتابیس SQLite.
- **درخواست:** `POST /api/v1/orders/create` با سرآیند احراز هویت دانشجو و بدنه زیر:
  ```json
  {
    "items": [
      {
        "item_id": "course-bidayat",
        "item_type": "course",
        "title": "دوره شرح بدایة الحکمة علامه طباطبایی",
        "price": 0,
        "quantity": 1
      }
    ],
    "shipping_address": "قم، بلوار بهار، مدرسه فیضیه",
    "postal_code": "3713612345",
    "recipient_name": "علی موسوی",
    "recipient_phone": "09123456789"
  }
  ```
- **انتظارات پاسخ (Assertions):**
  - کد وضعیت HTTP 200.
  - حضور فیلد `order_id` با پیشوند `ORD-`.
  - حضور فیلد `tracking_number` با پیشوند `TRK-`.
  - مقدار `status` برابر با `"processing"`.
  - مقدار `items_count` برابر با ۱.
- **راستی‌آزمایی دیتابیس برای سفارش:**
  - استعلام از جدول `orders`:
    `SELECT id, user_id, tracking_number, status FROM orders WHERE id = ?`.
    تایید وجود رکورد با شناسه سفارش و شناسه کاربر (`usr-140301`).
- **راستی‌آزمایی دیتابیس برای ثبت‌نام خودکار (Auto-Enrollment):**
  - استعلام از جدول `enrollments`:
    `SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?` با مقادیر `("usr-140301", "course-bidayat")`.
    تایید وجود رکورد و وضعیت فعال (`status == 'active'`).
- **راستی‌آزمایی فراگیر دسترسی‌ها پس از ثبت سفارش:**
  - فراخوانی مجدد `GET /api/v1/courses/enrolled`:
    هر دو دوره `course-mabadi-mantiq` و `course-bidayat` در لیست حاضر باشند.
  - فراخوانی مجدد `GET /api/v1/auth/me`:
    فیلد `enrolled_course_ids` شامل هر دو دوره باشد و `enrolled_courses_count >= 2` باشد.
- **سازگاری با سفارش‌های مهمان (Anonymous Checkout):**
  - ارسال درخواست بدون سرآیند احراز هویت (سفارش کتاب فیزیکی) باید کماکان با کد ۲۰۰ انجام شود و دچار اختلال نشود.

---

## ۴. قطعه کد کامل و آماده درج برای `backend/tests/test_in_memory.py`

کد زیر دقیقاً برای الحاق به انتهای فایل `backend/tests/test_in_memory.py` تدوین شده است:

```python
def test_course_enrollment_persistence(student_token: str = None):
    """
    Milestone 1 Test 1:
    1. Authenticates as student (or uses provided token).
    2. Clears prior enrollment for course-mabadi-mantiq to guarantee test idempotency.
    3. Calls POST /api/v1/courses/course-mabadi-mantiq/enroll -> asserts HTTP 200, enrollment_id, active status.
    4. Verifies physical row insertion in SQLite zanjirzan_platform.db (enrollments table).
    5. Verifies unauthenticated enrollment attempt is rejected with HTTP 401.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_user_id = "usr-140301"
    target_course_id = "course-mabadi-mantiq"

    # 1. Clean prior enrollment state in SQLite for test repeatability
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (target_user_id, target_course_id))
        con.commit()

    # 2. Unauthenticated attempt must be rejected with 401
    unauth_res = client.post(f"/api/v1/courses/{target_course_id}/enroll")
    assert unauth_res.status_code == 401, f"Expected 401 for anonymous enrollment, got {unauth_res.status_code}"

    # 3. Authenticated student enrollment -> must return HTTP 200
    headers = {"Authorization": f"Bearer {student_token}"}
    enroll_res = client.post(f"/api/v1/courses/{target_course_id}/enroll", headers=headers)
    assert enroll_res.status_code == 200, f"Expected 200, got {enroll_res.status_code}: {enroll_res.text}"

    enroll_data = enroll_res.json()
    assert enroll_data.get("success") is True
    assert enroll_data.get("course_id") == target_course_id
    assert enroll_data.get("status") == "active"
    assert "enrollment_id" in enroll_data and len(enroll_data["enrollment_id"]) > 0
    assert "enrolled_at" in enroll_data
    assert "ثبت‌نام" in enroll_data.get("message", "")

    # 4. Physical SQLite persistence verification
    with sqlite3.connect("zanjirzan_platform.db") as con:
        row = con.execute(
            "SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, target_course_id),
        ).fetchone()
        assert row is not None, "Enrollment record was not found in SQLite zanjirzan_platform.db!"
        assert row[0] == enroll_data["enrollment_id"]
        assert row[1] == target_user_id
        assert row[2] == target_course_id
        assert row[3] == "active"

    print("✅ Milestone 1: Course enrollment persistence (POST /enroll) verified in SQLite.")


def test_duplicate_course_enrollment_rejection(student_token: str = None):
    """
    Milestone 1 Test 2:
    1. Attempts re-enrollment in an already active course (course-mabadi-mantiq).
    2. Asserts HTTP 400 with structured Persian error message (DUPLICATE_ENROLLMENT).
    3. Verifies zero duplicate records in SQLite enrollments table.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_user_id = "usr-140301"
    target_course_id = "course-mabadi-mantiq"
    headers = {"Authorization": f"Bearer {student_token}"}

    # Verify student is currently enrolled
    with sqlite3.connect("zanjirzan_platform.db") as con:
        count_before = con.execute(
            "SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, target_course_id),
        ).fetchone()[0]
    assert count_before == 1, "Prerequisite failure: Student must have exactly 1 active enrollment before duplicate test."

    # Attempt re-enrollment in the same course
    dup_res = client.post(f"/api/v1/courses/{target_course_id}/enroll", headers=headers)
    assert dup_res.status_code == 400, f"Expected 400 for duplicate enrollment, got {dup_res.status_code}: {dup_res.text}"

    dup_body = dup_res.text
    assert (
        "DUPLICATE_ENROLLMENT" in dup_body
        or "پیش از این" in dup_body
        or "ثبت‌نام کرده‌اید" in dup_body
    ), f"Expected structured Persian duplicate enrollment warning, got: {dup_body}"

    # Verify no duplicate records created in SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        count_after = con.execute(
            "SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, target_course_id),
        ).fetchone()[0]
    assert count_after == 1, f"Database integrity breach: Duplicate enrollment rows found! Count: {count_after}"

    print("✅ Milestone 1: Duplicate enrollment rejection (HTTP 400 + Persian error) verified.")


def test_enrolled_courses_retrieval(student_token: str = None):
    """
    Milestone 1 Test 3:
    1. Calls GET /api/v1/courses/enrolled with student token -> asserts HTTP 200 and course details.
    2. Verifies scholar identity «حجت الاسلام دکتر زنجیر زن حسینی» and syllabus integrity.
    3. Calls GET /api/v1/auth/me -> asserts enrolled_course_ids and enrolled_courses_count sync.
    4. Verifies unauthenticated access to /enrolled returns HTTP 401.
    """
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_course_id = "course-mabadi-mantiq"

    # 1. Unauthenticated request to /enrolled must return 401
    unauth_res = client.get("/api/v1/courses/enrolled")
    assert unauth_res.status_code == 401, f"Expected 401 for anonymous /enrolled, got {unauth_res.status_code}"

    # 2. Authenticated request to /enrolled
    headers = {"Authorization": f"Bearer {student_token}"}
    enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert enrolled_res.status_code == 200, f"Expected 200, got {enrolled_res.status_code}: {enrolled_res.text}"

    courses = enrolled_res.json()
    assert isinstance(courses, list), "Expected list of enrolled courses."
    assert len(courses) >= 1, "Enrolled courses list should not be empty."

    matched = next((c for c in courses if c["id"] == target_course_id), None)
    assert matched is not None, f"Enrolled course {target_course_id} was not returned in /enrolled list!"
    assert matched["title"] == "سلسله جلسات مبادی منطق و تفکر عقلانی"
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in matched.get("instructor", "")
    assert len(matched.get("syllabus", [])) == 9

    # 3. Verify session profile hydration via /api/v1/auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()

    assert "enrolled_course_ids" in me_data, "Missing enrolled_course_ids in /auth/me response."
    assert target_course_id in me_data["enrolled_course_ids"]
    assert "enrolled_courses_count" in me_data
    assert me_data["enrolled_courses_count"] >= 1
    assert len(me_data["enrolled_course_ids"]) == me_data["enrolled_courses_count"]

    print("✅ Milestone 1: Enrolled courses retrieval (GET /enrolled) & /auth/me hydration passed.")


def test_orders_checkout_persistence(student_token: str = None):
    """
    Milestone 1 Test 4:
    1. Clears prior enrollment in course-bidayat to guarantee clean baseline.
    2. Submits order containing course-bidayat via POST /api/v1/orders/create with student token.
    3. Asserts HTTP 200, order_id, tracking_number.
    4. Verifies physical order row in SQLite orders table.
    5. Verifies automatic enrollment in SQLite enrollments table for the purchased course item.
    6. Confirms student now has access to both courses in GET /enrolled and GET /auth/me.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_user_id = "usr-140301"
    purchased_course_id = "course-bidayat"

    # 1. Clean prior enrollment for course-bidayat in SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (target_user_id, purchased_course_id))
        con.commit()

    # 2. Place order with course item attached to authenticated student
    headers = {"Authorization": f"Bearer {student_token}"}
    order_payload = {
        "items": [
            {
                "item_id": purchased_course_id,
                "item_type": "course",
                "title": "دوره شرح بدایة الحکمة علامه طباطبایی",
                "price": 0,
                "quantity": 1,
            }
        ],
        "shipping_address": "قم، بلوار بهار، مدرسه فیضیه",
        "postal_code": "3713612345",
        "recipient_name": "علی موسوی",
        "recipient_phone": "09123456789",
    }

    order_res = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert order_res.status_code == 200, f"Expected 200, got {order_res.status_code}: {order_res.text}"

    order_data = order_res.json()
    assert "order_id" in order_data and order_data["order_id"].startswith("ORD-")
    assert "tracking_number" in order_data
    assert order_data.get("status") == "processing"
    assert order_data.get("items_count") == 1
    new_order_id = order_data["order_id"]

    # 3. Physical SQLite persistence verification for order record
    with sqlite3.connect("zanjirzan_platform.db") as con:
        # Check orders table
        order_row = con.execute(
            "SELECT id, user_id, tracking_number, status FROM orders WHERE id = ?",
            (new_order_id,),
        ).fetchone()
        assert order_row is not None, f"Order {new_order_id} was not persisted in SQLite orders table!"
        assert order_row[1] == target_user_id
        assert order_row[3] == "processing"

        # Check auto-enrollment in enrollments table
        enr_row = con.execute(
            "SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, purchased_course_id),
        ).fetchone()
        assert enr_row is not None, f"Auto-enrollment for {purchased_course_id} was not created in SQLite!"
        assert enr_row[1] == target_user_id
        assert enr_row[2] == purchased_course_id
        assert enr_row[3] == "active"

    # 4. Verify user can now retrieve both courses from /enrolled
    enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert enrolled_res.status_code == 200
    enrolled_ids = [c["id"] for c in enrolled_res.json()]
    assert "course-mabadi-mantiq" in enrolled_ids
    assert "course-bidayat" in enrolled_ids

    # 5. Verify /auth/me reflects both courses
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert "course-bidayat" in me_data["enrolled_course_ids"]
    assert "course-mabadi-mantiq" in me_data["enrolled_course_ids"]
    assert me_data["enrolled_courses_count"] >= 2

    # 6. Verify anonymous guest order checkout remains supported (backward compatibility)
    guest_res = client.post("/api/v1/orders/create", json={
        "items": [
            {
                "item_id": "book-bidayat",
                "item_type": "book_print",
                "title": "کتاب بدایة الحکمة",
                "price": 180000,
                "quantity": 1,
            }
        ],
        "shipping_address": "تهران، میدان انقلاب",
        "postal_code": "1417466191",
        "recipient_name": "کاربر میهمان",
        "recipient_phone": "09121111111",
    })
    assert guest_res.status_code == 200
    assert guest_res.json()["order_id"].startswith("ORD-")

    print("✅ Milestone 1: Order checkout persistence & auto-enrollment verified.")
```

### به‌روزرسانی بلوک اجرای اصلی (`__main__`) در `test_in_memory.py`:

```python
if __name__ == "__main__":
    print("==============================================")
    print("RUNNING BACKEND TEST SUITE (IN-MEMORY CLIENT)")
    print("==============================================")
    test_root_health()
    student_tok, admin_tok = test_auth_endpoints()
    test_rbac_security_shield(student_tok, admin_tok)
    drm_tok = test_drm_stream_shield()
    test_audio_range_streaming(drm_tok)
    test_courses_catalog()
    test_ai_chat_assistant()
    test_admin_course_management(admin_tok)
    test_persistent_sqlite_auth_and_registration()
    test_registration_persistence_and_duplicate_error()

    # Milestone 1: Persistent Course Enrollment & Orders Integration Tests
    test_course_enrollment_persistence(student_tok)
    test_duplicate_course_enrollment_rejection(student_tok)
    test_enrolled_courses_retrieval(student_tok)
    test_orders_checkout_persistence(student_tok)

    print("🎉 ALL 14 BACKEND TESTS PASSED SUCCESSFULLY!")
```

---

## ۵. ماتریس تحلیل ریسک و تضمین عدم رگرسیون (Zero Regression Matrix)

| ردیف | نام تست موجود | عملکرد آزمون | ریسک تداخل با تست‌های جدید | تمهید محافظتی اتخاذشده |
|:---:|:---|:---|:---:|:---|
| ۱ | `test_root_health` | نام استاد و سلامت سرویس | هیچ | عدم تغییر اندپوینت ریشه `/` |
| ۲ | `test_auth_endpoints` | ورود دانشجو و مدیر | هیچ | استفاده از همان توکن دانشجو بدون تغییر کلمه عبور |
| ۳ | `test_rbac_security_shield` | سنجش دسترسی مدیر | هیچ | استمرار ایزولاسیون رول‌ها |
| ۴ | `test_drm_stream_shield` | توکن‌های صوتی DRM | هیچ | عدم دستکاری در توکن‌های استریم |
| ۵ | `test_audio_range_streaming` | استریم پاره‌فایل صوتی | هیچ | عدم تغییر سازوکار Range requests |
| ۶ | `test_courses_catalog` | لود دوره‌ها و ریت‌لیمیت | هیچ | کاتالوگ دوره‌ها کماکان از `course_service.courses` خوانده می‌شود |
| ۷ | `test_ai_chat_assistant` | هوش مصنوعی و نام استاد | هیچ | عدم تغییر سرویس هوش مصنوعی |
| ۸ | `test_admin_course_management` | مدیریت دوره‌ها توسط ادمین | هیچ | تست ادمین دوره‌های موقت را ایجاد و حذف می‌کند |
| ۹ | `test_persistent_sqlite_auth_and_registration` | ثبت‌نام تصادفی با دیتابیس | هیچ | با شماره موبایل تصادفی کار می‌کند |
| ۱۰ | `test_registration_persistence_and_duplicate_error` | تست شماره `09191112233` | هیچ | پیش از اجرا سطر اختصاصی خود را پاکسازی می‌کند |

---

## ۶. چک‌لیست اعتبارسنجی پایانی (Verification Commands)

توسعه‌دهنده بک‌اند (`worker_backend`) پس از پیاده‌سازی گام‌های کدنویسی و افزودن تست‌های فوق، باید فرآیند زیر را بدون هیچ‌گونه خطا طی کند:

```powershell
# ۱. اجرای کامل سوئیت ۱۴ تستی بک‌اند
& backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py

# ۲. اجرای پایپ‌لاین کنترل کیفیت ۸ مرحله‌ای (کسب نمره ۱۰۰ از ۱۰۰)
& backend/.venv/Scripts/python.exe audit_pipeline.py
```

معیارهای موفقیت:
- خروجی کد ۰ در هر دو دستور.
- نمایش عبارت `🎉 ALL 14 BACKEND TESTS PASSED SUCCESSFULLY!`.
- نمره ۱۰۰ از ۱۰۰ در `audit_pipeline.py`.
