# گزارش جامع طراحی آزمون‌های تصحیحی احراز هویت و همزمانی (Milestone 1 Remediation)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**نگارش:** کاوشگر ۳ تصحیح مایل‌استون ۱ (`explorer_m1_remediation_3`)  
**مسیر سند:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_3\report.md`  
**تاریخ گزارش:** ۲۱ مهر ۱۴۰۵ (2026-10-12)  
**پرونده‌های هدف:** `backend/tests/test_in_memory.py`، `backend/app/api/deps.py`، `backend/app/services/auth_service.py`  

---

## ۱. خلاصه مدیریتی (Executive Summary)

در جریان ممیزی و ارزیابی موشکافانه مایل‌استون ۱ توسط ارزیاب ۲ (`reviewer_m1_2`) و چالش‌گر ۲ (`challenger_m1_2`)، دو مورد نیازمند تقویت شناسایی شد:
1. **وجود دیکشنری صوری در وابستگی احراز هویت (`backend/app/api/deps.py`):** تابع `get_current_user` در صورت عدم یافتن شناسه کاربر در پایگاه داده SQLite، به جای بازگرداندن خطای قطعی `401 Unauthorized`، یک دیکشنری ساختگی با عنوان «کاربر احرازشده» بازمی‌گرداند. این رفتار نقض صریح حذف کامل داده‌های ساختگی (In-Memory Mocks) و اصل ماندگاری نشست‌ها است.
2. **تاب‌آوری ثبت‌نام همزمان در شرایط رقابت فشرده (Race Condition):** در متد `_register_user_tx` در سرویس `auth_service.py`، اعتبارسنجی تکراری بودن شماره تلفن پیش از درج انجام می‌شد اما فراخوانی `await db.flush()` درون بلوک مدیریت خطای `IntegrityError` قرار نداشت؛ لذا در صورت ارسال همزمان چندین درخواست با یک شماره تلفن، رخداد خطای کلید یکتا ممکن بود به خطای سرور یا پیام‌های غیرساختاریافته منتهی شود.

هدف این سند، تدوین دقیق و بدون نقص دو آزمون تکمیلی جهت الحاق به فایل آزمون‌های رسمی و مرجع سامانه یعنی `backend/tests/test_in_memory.py` است تا:
- خطای قطعی `401 Unauthorized` برای توکن‌های با شناسه کاربر ناموجود یا حذف‌شده تضمین و عدم بازگشت دیکشنری صوری احراز شود.
- مدیریت ثبت‌نام‌های همزمان با شماره یکسان، بازگشت کد وضعیت `400` همراه با پیام هشدار ساختاریافته (`USER_ALREADY_EXISTS` / هشدار فارسی اصیل) و ثبت دقیقاً یک سطر در دیتابیس تضمین گردد.
- اجرای موفق ۱۰۰٪ تمام تست‌های پیشین و کسب نمره ۱۰۰ از ۱۰۰ در پایپ‌لاین `audit_pipeline.py` حفظ شود.

---

## ۲. ریشه‌یابی و تحلیل رفتار لایه‌ها (Root Cause Analysis)

### ۲.۱. نقص دیکشنری جایگزین در `deps.py`
در خطوط ۵۱ تا ۶۰ فایل `backend/app/api/deps.py`:
```python
user = await auth_service.get_user_by_id(user_id=user_id, db=db)
if not user:
    return {
        "id": user_id,
        "phone": payload.get("phone", "09123456789"),
        "role": payload.get("role", "student"),
        "full_name": "کاربر احرازشده",
        "wallet_balance": "0 Tomans",
        "enrolled_courses_count": 0,
    }
return user
```
این کد یک باقیمانده از دوران پروتوتایپ حافظه‌ای است. با اصلاح این بخش توسط کاوشگر ۱، در صورت نبود کاربر باید مستقیماً خطای زیر پرتاب شود:
```python
if not user:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.",
    )
```
آزمون جدید باید نشان دهد که اگر توکنی با `sub="usr-nonexistent-..."` ارسال شود، یا کاربری پس از ثبت‌نام از SQLite حذف شود، مسیر `/api/v1/auth/me` حتماً کد ۴۰۱ بازمی‌گرداند و هرگز عبارت «کاربر احرازشده» در پاسخ نخواهد بود.

### ۲.۲. نقص مدیریت خطای یکتایی همزمان در `auth_service.py`
در شرایط درخواست‌های کاملاً همزمان (مثلاً ۱۰ رشته موازی با یک شماره تماس)، هر دو درخواست ممکن است کوئری `SELECT` اولیه را خالی ببینند. با اجرای همزمان `INSERT`، موتور SQLite روی درخواست دوم خطای `sqlite3.IntegrityError: UNIQUE constraint failed: users.mobile` صادر می‌کند. با اصلاح کاوشگر ۲، این بخش با بلوک `try ... except IntegrityError:` مهار شده و استثنای ساختاریافته `AppException(code="USER_ALREADY_EXISTS", status_code=400, ...)` پرتاب می‌شود. آزمون جدید باید صحت این رفتار را با استفاده از `ThreadPoolExecutor` با ۱۰ درخواست همزمان بسنجد.

---

## ۳. طراحی تفصیلی آزمون ۱: نفی کاربر صوری و رد قطعی با کد ۴۰۱

### ۳.۱. شناسه آزمون
`test_unknown_user_token_strict_401()`

### ۳.۲. اهداف و موارد تحت پوشش (Coverage Goals)
1. **آزمون توکن معتبر با شناسه جعلی (Unknown User ID):** امضای توکن معتبر با کلید محرمانه سامانه (`settings.SECRET_KEY`) اما با شناسه کاربری که هرگز در دیتابیس ثبت نشده است.
2. **ابطال بلادرنگ توکن کاربر حذف‌شده (Revocation on Deletion):** ثبت‌نام یک کاربر، دریافت توکن، حذف فیزیکی کاربر از جدول `users` با کوئری مستقیم SQLite، و سپس اعتبارسنجی عدم دسترسی توکن به اطلاعات پروفایل.
3. **تطبیق ضد اسلاپ و ضد ماک (Anti-Mock Assertion):** اطمینان قطعی از عدم وجود رشته `"کاربر احرازشده"` در بدنه پاسخ.

### ۳.۳. کد پیاده‌سازی آزمون ۱
```python
def test_unknown_user_token_strict_401():
    """
    Verifies that a validly-signed JWT token containing an unknown, non-existent,
    or deleted user ID strictly triggers HTTP 401 Unauthorized.
    Enforces the permanent eradication of the synthetic in-memory fallback dict
    ('کاربر احرازشده') in backend/app/api/deps.py.
    """
    # 1. Forge a validly signed JWT token with a non-existent user ID
    non_existent_id = f"usr-unknown-{uuid.uuid4().hex[:8]}"
    payload = {
        "sub": non_existent_id,
        "phone": "09199990000",
        "role": "student",
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    unknown_token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # 2. Query /api/v1/auth/me with the unknown user token
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {unknown_token}"})
    assert res.status_code == 401, (
        f"CRITICAL: Unknown user token did not return 401! Got HTTP {res.status_code}: {res.text}"
    )
    # Strict verification: Must NEVER return the old synthetic mock dictionary
    assert "کاربر احرازشده" not in res.text, (
        "CRITICAL ARCHITECTURAL VIOLATION: In-memory synthetic user fallback ('کاربر احرازشده') "
        "is still present in deps.py!"
    )
    print("✅ Unknown user token rejected with strict HTTP 401 Unauthorized (mock user eradicated).")

    # 3. Test token invalidation upon user deletion from SQLite
    temp_phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "دانشجوی موقت جهت آزمون حذف",
        "phone": temp_phone,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    temp_data = reg_res.json()
    temp_token = temp_data["access_token"]
    temp_user_id = temp_data["id"]

    # Verify session is valid before deletion
    me_before = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {temp_token}"})
    assert me_before.status_code == 200

    # Physically delete the user record from SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM users WHERE id = ?", (temp_user_id,))
        con.commit()

    # Verify session is strictly rejected after user deletion (no ghost sessions)
    me_after = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {temp_token}"})
    assert me_after.status_code == 401, (
        f"CRITICAL: Deleted user session was not rejected with 401! Got HTTP {me_after.status_code}: {me_after.text}"
    )
    assert "کاربر احرازشده" not in me_after.text, (
        "CRITICAL ARCHITECTURAL VIOLATION: Deleted user session resolved to synthetic mock dict!"
    )
    print(f"✅ Deleted user token ({temp_user_id}) immediately invalidated with strict HTTP 401.")
```

---

## ۴. طراحی تفصیلی آزمون ۲: ثبت‌نام همزمان و مهار رقابت (Concurrency Shield)

### ۴.۱. شناسه آزمون
`test_concurrency_duplicate_registration()`

### ۴.۲. اهداف و موارد تحت پوشش (Coverage Goals)
1. **شبیه‌سازی هجوم همزمان (10 Concurrent Threads):** ایجاد ۱۰ رشته پردازشی همزمان از طریق `ThreadPoolExecutor` که دقیقاً در یک لحظه اقدام به ثبت‌نام با یک شماره تلفن واحد می‌کنند.
2. **عدم بروز کرش یا خطای ۵۰۰ (Zero 500 Server Errors):** هیچ درخواستی نباید منجر به خطای مدیریت‌نشده در سرور یا خطای `database is locked` مهارنشده گردد.
3. **تک‌برندگی مطلق (Exactly 1 Success):** دقیقاً یک درخواست موفق با کد ۲۰۰ ثبت شود.
4. **رد ساختاریافته سایر درخواست‌ها (Exactly 9 Rejections with HTTP 400):** نه درخواست دیگر با کد وضعیت ۴۰۰ و حاوی پیام هشدار فارسی یا شناسه خطا (`USER_ALREADY_EXISTS`) پس زده شوند.
5. **ارزیابی سلامت نگارش فارسی (Anti-Slop Compliance):** عدم وجود افعال فرسوده اداری نظیر «می‌باشد» و «می‌گردد» در متن خطای دریافتی.
6. **یکپارچگی فیزیکی پایگاه داده (SQLite Physical Row Count):** شمارش رکوردها در جدول `users` پایگاه داده `zanjirzan_platform.db` باید دقیقاً برابر با عدد ۱ باشد.

### ۴.۳. کد پیاده‌سازی آزمون ۲
```python
def test_concurrency_duplicate_registration():
    """
    Stress-tests race-condition duplicate registrations with concurrent threads.
    Asserts:
    1. Exactly 1 registration succeeds (HTTP 200).
    2. All other concurrent requests fail with structured HTTP 400 (USER_ALREADY_EXISTS).
    3. Zero 500 Internal Server Errors or unhandled crashes.
    4. Exactly 1 row is written to the SQLite users table.
    """
    race_phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    num_concurrent_requests = 10

    def submit_registration(idx: int):
        c = TestClient(app)
        return c.post("/api/v1/auth/register", json={
            "full_name": f"دانشجوی همزمان شماره {idx}",
            "phone": race_phone,
            "password": f"SafePassword{idx:02d}!"
        })

    with ThreadPoolExecutor(max_workers=num_concurrent_requests) as executor:
        futures = [executor.submit(submit_registration, i) for i in range(num_concurrent_requests)]
        responses = [f.result() for f in futures]

    status_codes = [r.status_code for r in responses]
    successes = [r for r in responses if r.status_code == 200]
    duplicates = [r for r in responses if r.status_code == 400]
    server_errors = [r for r in responses if r.status_code >= 500]

    # Assertions
    assert len(server_errors) == 0, (
        f"CRITICAL: Concurrency caused unhandled server errors (HTTP 500+): {[r.text for r in server_errors]}"
    )
    assert len(successes) == 1, (
        f"Expected exactly 1 successful registration under concurrency, got {len(successes)}! Statuses: {status_codes}"
    )
    assert len(duplicates) == num_concurrent_requests - 1, (
        f"Expected {num_concurrent_requests - 1} duplicate rejections with HTTP 400, got {len(duplicates)}! Statuses: {status_codes}"
    )

    # Validate structured Persian error message & absence of bureaucratic tells
    for dup in duplicates:
        body = dup.text
        assert ("ثبت شده" in body or "USER_ALREADY_EXISTS" in body), (
            f"Expected structured duplicate warning, got: {body}"
        )
        assert "می‌باشد" not in body, f"Anti-slop violation: 'می‌باشد' found in {body}"
        assert "می‌گردد" not in body, f"Anti-slop violation: 'می‌گردد' found in {body}"

    # Verify physical SQLite database integrity
    with sqlite3.connect("zanjirzan_platform.db") as con:
        count = con.execute("SELECT count(*) FROM users WHERE mobile = ?", (race_phone,)).fetchone()[0]
        assert count == 1, (
            f"CRITICAL DATABASE CORRUPTION: Expected 1 row in SQLite for {race_phone}, found {count}!"
        )

    print(f"✅ Concurrency duplicate registration passed: 1 success (200), {num_concurrent_requests - 1} structured rejections (400), 1 SQLite row.")
```

---

## ۵. تحلیل سازگاری با آزمون‌های پیشین و `audit_pipeline.py`

### ۵.۱. سازگاری با ۱۰ آزمون پیشین `test_in_memory.py`
فایل `backend/tests/test_in_memory.py` دارای ۱۰ آزمون پایه زیر است:
1. `test_root_health`: بررسی سلامت و تثبیت نام «حجت الاسلام دکتر زنجیر زن حسینی».
2. `test_auth_endpoints`: ورود دانشجو و مدیر با اعتبارسنجی هش bcrypt.
3. `test_rbac_security_shield`: اعمال گیت دفاعی ۴۰۱، ۴۰۳ و ۲۰۰ بر مسیرهای ادمین.
4. `test_drm_stream_shield`: صدور و اعتبارسنجی امضای رمزنگاری توکن DRM.
5. `test_audio_range_streaming`: استریم صوتی RFC 7233 بر اساس هدر Range.
6. `test_courses_catalog`: دریافت فهرست دروس و بررسی هدرهای Rate Limit.
7. `test_ai_chat_assistant`: دستیار هوشمند و تحلیل رساله با هویت رسمی استاد.
8. `test_admin_course_management`: عملیات CRUD دروس با توکن مدیر.
9. `test_persistent_sqlite_auth_and_registration`: ثبت‌نام پایدار و خطای شماره تکراری.
10. `test_registration_persistence_and_duplicate_error`: سناریوی اختصاصی شماره `09191112233`.

هیچ‌یک از ۱۰ آزمون فوق به دیکشنری ساختگی وابسته نیستند؛ زیرا کاربر دانشجو (`usr-140301`) و مدیر (`adm-001`) در پایگاه داده سید شده‌اند و کاربران جدید نیز مستقیماً در دیتابیس ثبت می‌شوند. بنابراین با اعمال اصلاحات `deps.py` و `auth_service.py`، تمام ۱۰ آزمون قبلی بدون کوچک‌ترین تداخلی پاس خواهند شد.

### ۵.۲. سازگاری با پایپ‌لاین `audit_pipeline.py`
در `audit_pipeline.py` تابع `check_backend_tests` خطوط ۸۱ تا ۹۸ مستقیماً فایل `backend/tests/test_in_memory.py` را با پایتون ران می‌کند:
```python
cmd = [str(python_bin), str(test_script)]
res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT_DIR), env=env)
if res.returncode == 0:
    return 100, "تمامی آزمون‌های یکپارچگی بک‌اند، احراز هویت، DRM و دیتابیس با موفقیت پاس شدند."
```
با افزودن فراخوانی دو تابع جدید در بلوک `if __name__ == "__main__":`، هر دو آزمون جدید در هنگام ارزیابی پایپ‌لاین اجرا می‌شوند و در صورت قبولی، نمره ۱۰۰ از ۱۰۰ برای گیت کیفیت شماره ۳ کسب خواهد شد.

---

## ۶. پچ و دستورالعمل اعمال تغییرات (Patch Specification)

پچ گیت کامل در فایل زیر در پوشه کاری ذخیره شده است:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_3\test_in_memory.patch`

خلاصه بخش‌های افزوده شده به `backend/tests/test_in_memory.py`:
1. افزودن ایمپورت‌های ماژولار:
   - `import uuid`
   - `import sqlite3`
   - `from datetime import datetime, timedelta`
   - `from concurrent.futures import ThreadPoolExecutor`
   - `from jose import jwt`
   - `from backend.app.core.config import settings`
2. تعریف توابع `test_unknown_user_token_strict_401` و `test_concurrency_duplicate_registration`.
3. فراخوانی هر دو تابع در انتهای فایل پیش از پرینت نهایی موفقیت.
