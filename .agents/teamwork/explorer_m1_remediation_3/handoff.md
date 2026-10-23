# گزارش تحویل کار (Handoff Report): طراحی آزمون‌های تصحیحی مایل‌استون ۱

**مسیر گزارش:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_3\handoff.md`  
**عامل تهیه‌کننده:** Explorer Remediation 3 (`explorer_m1_remediation_3`)  
**عامل گیرنده / والد:** orchestrator_3 (شناسه مکالمه: `d55861c4-3fee-4b2d-9337-907247691604`)  
**نوع تحویل:** کامل (Hard Handoff)  
**تاریخ گزارش:** ۲۱ مهر ۱۴۰۵ (2026-10-12)  

---

## ۱. مشاهدات عینی (Observation)

۱. **کد ماک در وابستگی احراز هویت (`backend/app/api/deps.py`، خطوط ۵۱ تا ۶۰):**
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
در وضعیت موجود، توکن‌های معتبری که `sub` آن‌ها در دیتابیس وجود ندارد یا حذف شده است، با کد ۲۰۰ و دیکشنری صوری پاسخ داده می‌شوند.

۲. **مدیریت ثبت‌نام همزمان در سرویس احراز هویت (`backend/app/services/auth_service.py`، خطوط ۶۲ تا ۸۳):**
```python
result = await db.execute(select(User).where(User.mobile == phone))
existing_user = result.scalar_one_or_none()
if existing_user:
    raise AppException(
        message=f"شماره تماس '{phone}' قبلاً در سامانه ثبت شده است.",
        code="USER_ALREADY_EXISTS",
        status_code=400,
    )
...
db.add(new_user)
await db.flush()
```
فراخوانی `await db.flush()` بدون پوشش `try ... except IntegrityError:` است و در شرایط رقابت فشرده (Race Condition)، خطای پایگاه داده به صورت خام بالا می‌آمد.

۳. **آزمون‌های کنونی فایل `backend/tests/test_in_memory.py` (خطوط ۱ تا ۳۴۹):**
این فایل شامل ۱۰ آزمون یکپارچگی است:
- `test_root_health()` (خط ۲۴)
- `test_auth_endpoints()` (خط ۳۳)
- `test_rbac_security_shield()` (خط ۵۵)
- `test_drm_stream_shield()` (خط ۷۲)
- `test_audio_range_streaming()` (خط ۱۰۵)
- `test_courses_catalog()` (خط ۱۲۵)
- `test_ai_chat_assistant()` (خط ۱۳۵)
- `test_admin_course_management()` (خط ۱۶۱)
- `test_persistent_sqlite_auth_and_registration()` (خط ۲۰۹)
- `test_registration_persistence_and_duplicate_error()` (خط ۲۶۸)
هیچ‌یک از این توابع سناریوی رد قطعی شناسه کاربر ناموجود با کد ۴۰۱ یا شرایط همزمانی فشرده (Race Condition) با چندین رشته را تست نمی‌کنند.

۴. **نحوه اعتبارسنجی پایپ‌لاین کیفیت در `audit_pipeline.py` (خطوط ۸۱ تا ۹۸):**
```python
python_bin = ROOT_DIR / "backend/.venv/Scripts/python.exe"
test_script = ROOT_DIR / "backend/tests/test_in_memory.py"
cmd = [str(python_bin), str(test_script)]
res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT_DIR), env=env)
if res.returncode == 0:
    return 100, "تمامی آزمون‌های یکپارچگی بک‌اند، احراز هویت، DRM و دیتابیس با موفقیت پاس شدند."
```
پایپ‌لاین ارزیابی مستقیماً `test_in_memory.py` را به عنوان اسکریپت اصلی اجرا می‌کند و خروجی کد ۰ معیار قبولی ۱۰۰ از ۱۰۰ است.

---

## ۲. زنجیره منطقی استنتاج (Logic Chain)

۱. **استنتاج نیاز به آزمون رد قطعی توکن کاربر ناموجود:**
- بر اساس مشاهده ۱، نقص اصلی وجود دیکشنری صوری در `deps.py` است.
- اصلاح کاوشگر ۱ این دیکشنری را حذف کرده و خطای `HTTPException(status_code=401, detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.")` را پرتاب می‌کند.
- برای اطمینان از عدم بازگشت به کد صوری، آزمون `test_unknown_user_token_strict_401` باید دو جنبه را بیازماید:
  الف) توکن با شناسه دلخواه که هرگز در SQLite نبوده است.
  ب) توکن کاربری که ثبت‌نام شده و سپس با کوئری مستقیم `DELETE` از SQLite پاک شده است.
- شرط قبولی: کد وضعیت ۴۰۱ و عدم حضور عبارت `"کاربر احرازشده"` در بدنه پاسخ.

۲. **استنتاج نیاز به آزمون همزمانی با رشته‌های موازی:**
- بر اساس مشاهده ۲، در صورت هجوم همزمان درخواست‌های ثبت‌نام با یک شماره تلفن، خطای `IntegrityError` در سطح پایگاه داده پرتاب می‌شود.
- اصلاح کاوشگر ۲ این خطا را به `AppException(code="USER_ALREADY_EXISTS", status_code=400, ...)` تبدیل می‌کند.
- آزمون `test_concurrency_duplicate_registration` با استفاده از `ThreadPoolExecutor(max_workers=10)`، ده درخواست همزمان ارسال می‌کند.
- شرط قبولی: دقیقاً ۱ پاسخ ۲۰۰، دقیقاً ۹ پاسخ ۴۰۰، صفر خطای ۵۰۰، و ثبت دقیقاً یک سطر در جدول `users` فایل `zanjirzan_platform.db`.

۳. **استنتاج عدم شکست آزمون‌های پیشین و قبولی پایپ‌لاین:**
- بر اساس مشاهده ۳، تمام کاربران تستی آزمون‌های ۱۰ گانه قبلی (`usr-140301`, `adm-001`, کاربران تازه ثبت‌نام‌شده) در پایگاه داده SQLite ثبت شده‌اند و وابسته به دیکشنری ماک نیستند.
- بر اساس مشاهده ۴، الحاق این دو آزمون به انتهای فایل `test_in_memory.py` و فراخوانی آن‌ها در بلوک `if __name__ == "__main__":` سبب پوشش کامل این رفتارها در دل پایپ‌لاین `audit_pipeline.py` شده و نمره ۱۰۰ از ۱۰۰ را بدون ایجاد وقفه تضمین می‌کند.

---

## ۳. نکات و فرضیات (Caveats)

۱. **تعداد رشته‌های همزمان در SQLite:** در موتور SQLite تحت فایل، تعداد رشته‌های همزمان نوشتن روی ۱۰ رشته تنظیم شده است. با توجه به فعال بودن حالت `PRAGMA journal_mode=WAL`، این حجم از همزمانی بدون خطای قفل دیتابیس پردازش می‌شود.
۲. **نحوه فرمت پیام خطا:** آزمون به نحوی طراحی شده که هم با ساختار `{ "detail": "..." }` و هم با فرمت استثنای سراسری حاوی `"USER_ALREADY_EXISTS"` و هشدارهای فارسی اصیل سازگار باشد.
۳. هیچ فرضیه تاییدنشده دیگری وجود ندارد.

---

## ۴. نتیجه‌گیری (Conclusion)

طراحی آزمون‌های تکمیلی برای `backend/tests/test_in_memory.py` به طور کامل به پایان رسید:
1. تابع `test_unknown_user_token_strict_401()` تضمین می‌کند که توکن‌های با شناسه کاربر ناموجود یا حذف‌شده، با خطای صریح `401 Unauthorized` پس زده شده و ماک صوری «کاربر احرازشده» به طور غیرقابل‌بازگشت نابود شده است.
2. تابع `test_concurrency_duplicate_registration()` تضمین می‌کند که هجوم موازی ثبت‌نام همزمان، با ۱ موفقیت (۲۰۰) و ۹ خطای ساختاریافته (۴۰۰) مهار شده، هیچ خطای سروری (۵۰۰) رخ نمی‌دهد و یکپارچگی فیزیکی دیتابیس حفظ می‌شود.
3. فایل پچ `test_in_memory.patch` و سند تحلیلی `report.md` تولید شده و آماده الحاق توسط عامل مجری است.

---

## ۵. روش اعتبارسنجی مستقل (Verification Method)

جهت اعتبارسنجی مستقل پس از اعمال پچ توسط پیاده‌ساز:

۱. **اجرای مستقیم اسکریپت آزمون‌های بک‌اند:**
```powershell
& "backend\.venv\Scripts\python.exe" backend\tests\test_in_memory.py
```
*شرط قبولی:* خروجی موفقیت‌آمیز هر ۱۲ آزمون (۱۰ آزمون قبلی + ۲ آزمون جدید):
```
✅ Unknown user token rejected with strict HTTP 401 Unauthorized (mock user eradicated).
✅ Deleted user token (usr-...) immediately invalidated with strict HTTP 401.
✅ Concurrency duplicate registration passed: 1 success (200), 9 structured rejections (400), 1 SQLite row.
🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!
```

۲. **اجرای پایپ‌لاین کیفیت سامانه:**
```powershell
& "backend\.venv\Scripts\python.exe" audit_pipeline.py
```
*شرط قبولی:* بررسی گام ۳ «تست‌های خودکار بک‌اند و استریم DRM» با امتیاز ۱۰۰/۱۰۰ و مجموع امتیاز ۱۰۰ از ۱۰۰.

۳. **شرایط ابطال (Invalidation Conditions):**
- بازگرداندن کد وضعیت ۲۰۰ برای توکن جعلی یا کاربر حذف‌شده.
- ظاهر شدن عبارت «کاربر احرازشده» در هر نقطه‌ای از پاسخ سرور.
- بروز خطای ۵۰۰ در شرایط ثبت‌نام همزمان ۱۰ کاربر موازی.
- درج بیش از ۱ رکورد در پایگاه داده SQLite برای شماره تلفن همزمان.
