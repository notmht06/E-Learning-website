# گزارش تحلیل و راهکار برطرف‌سازی نقص احراز هویت در deps.py
## تحلیل بازبین ۲ (Reviewer 2 Finding 1) و طراحی اصلاحیه قطعی

---

## ۱. چکیده مدیریتی (Executive Summary)
در بازبینی تخصصی نقطه پایانی احراز هویت و وابستگی‌های تزریق اعتبارسنجی (Milestone 1 Remediation)، بازبین شماره ۲ نشان داد که در فایل `backend/app/api/deps.py` (سطرهای ۵۲ تا ۶۰)، تابع وابستگی `get_current_user` در صورت عدم وجود شناسه کاربر (`user_id`) در پایگاه داده SQLite، به جای رد درخواست با کد استاندارد `HTTP 401 Unauthorized`، به یک شیوه ساختگی درون‌حافظه‌ای (In-Memory Fallback Dictionary) با عنوان `«کاربر احرازشده»` بازمی‌گردد.

این رفتار متناقض با اصول مهندسی REA، ناقض اصل حذف کامل ماک‌های موقت، شکننده قرارداد واسط کاربری `/api/v1/auth/me`، و زمینه‌ساز آسیب‌پذیری نشت دسترسی و ارتقای سطح دسترسی (Privilege Escalation) است. این گزارش با طراحی تغییرات دقیق خط‌به‌خط، حذف ماک و اعمال پاسخ قاطع `401 Unauthorized` با پیام استاندارد فارسی پیراسته از اسلاپ، نقشه راه پیاده‌سازی را فراهم می‌آورد.

---

## ۲. ریشه‌یابی و تحلیل ریسک‌های معماری و امنیتی

### ۲.۱. کد فعلی (وضعیت موجود در `backend/app/api/deps.py`)
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

### ۲.۲. ریسک‌های شناسایی‌شده:
1. **نقض صریح مانیفست پایان‌نامه و فاز ۱ (Zero In-Memory Mocks Directive):**
   سند راهبردی پروژه مقرر داشته است که احراز هویت تماماً مبتنی بر تراکنش‌های زنده SQLAlchemy/SQLite باشد. وجود هرگونه دیکشنری پیش‌فرض سنتتیک درون کد بک‌اند مغایر با این فرمان است.
2. **بروز نشست‌های روحی (Ghost / Zombie Sessions):**
   اگر کاربری از پایگاه داده حذف گردد یا کلید امضای نشست معتبر باشد اما حساب کاربری معدوم شده باشد، سیستم به اشتباه نشست را زنده فرض کرده و مشخصات ساختگی بازمی‌گرداند.
3. **آسیب‌پذیری ارتقای دسترسی ادمین (Privilege Escalation Vector):**
   چنانچه توکنی حاوی ادعای `"role": "admin"` باشد اما کاربر مربوطه در دیتابیس ثبت نشده باشد (مانند توکن‌های امضا شده در محیط‌های متفرقه یا آزمایشی)، کد فعلی مقدار `role` را مستقیماً از محتوای توکن استخراج و در شیء بازگشتی قرار می‌دهد. متعاقباً وابستگی `get_current_admin` شرط `user.get("role") != "admin"` را بررسی نموده و دسترسی ادمین را تصویب می‌کند!
4. **شکست تعهدات مدل خروجی (`UserResponse` Schema Integrity):**
   قرارداد `/api/v1/auth/me` مستلزم بازتاب داده‌های واقعی ذخیره‌شده کاربر از جدول `users` است. نام جعلی «کاربر احرازشده» داده‌های پروفایل کاربر را در کلاینت مخدوش می‌سازد.

---

## ۳. طرح اصلاحیه قطعی (The Remediation Design)

### ۳.۱. تغییرات پیشنهادی
در تابع `get_current_user`:
1. چنانچه ادعای `sub` در توکن مفقود باشد: بازگرداندن خطای ۴۰۱ با پیام متناسب.
2. چنانچه نتیجه استعلام `auth_service.get_user_by_id(user_id=user_id, db=db)` برابر `None` باشد: فوراً خطای `HTTPException` با وضعیت `401 Unauthorized` و متن صریح فارسی برانگیخته شود:
   ```python
   detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد."
   ```

### ۳.۲. مقایسه قبل و بعد (Before vs. After Snippet)

#### قبل از اصلاح (Before - Lines 44–62):
```python
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="اطلاعات شناسه کاربر در توکن مفقود است.",
        )

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

#### بعد از اصلاح (After):
```python
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.",
        )

    user = await auth_service.get_user_by_id(user_id=user_id, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.",
        )

    return user
```

### ۳.۳. انطباق با معیارهای نگارش فارسی (Persian Writing Compliance)
عبارت انتخابی:
`"نشست نامعتبر است یا کاربر در سامانه یافت نشد."`
- پیراسته از افعال فرسوده و اداری نظیر «می‌باشد / نمی‌باشد» و «می‌گردد».
- بدون کلیشه‌های متداول ماشینی («لازم به ذکر است»).
- استفاده از ساختار جمله‌بندی فصیح، رسمی و دقیق حوزوی-دانشگاهی.

---

## ۴. بررسی وابستگی‌ها و رفتار زنجیره امنیتی (Security Chain Audit)

### ۴.۱. تعامل با `get_current_admin`
کد وابستگی ادمین در `backend/app/api/deps.py`:
```python
async def get_current_admin(
    user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی به این بخش منحصراً در اختیار مدیر پایگاه است.",
        )
    return user
```
- **حالت الف: درخواست ناشناس (بدون سرآیند Bearer):** `get_current_user` خطای ۴۰۱ صادر می‌کند. درخواست پیش از ورود به `get_current_admin` متوقف می‌شود.
- **حالت ب: توکن جعلی یا کاربر حذف‌شده از دیتابیس:** `get_current_user` خطای ۴۰۱ صادر می‌کند و امکان ارتقای نقش منتفی است.
- **حالت ج: کاربر دانشجوی معتبر در دیتابیس:** `get_current_user` شیء واقعی کاربر را با `role == "student"` بازمی‌گرداند؛ `get_current_admin` خطای ۴۰۳ (دسترسی غیرمجاز) صادر می‌کند.
- **حالت د: ادمین رسمی در دیتابیس (`adm-001`):** `get_current_user` شیء دیتابیس را بازمی‌گرداند؛ بررسی `role == "admin"` تأیید شده و درخواست با ۲۰۰ پردازش می‌شود.

### ۴.۲. تعامل با `get_optional_user`
```python
async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Optional[Dict[str, Any]]:
    if not authorization:
        return None
    try:
        return await get_current_user(authorization=authorization, db=db)
    except HTTPException:
        return None
```
در این وابستگی، در صورت منقضی بودن یا عدم وجود کاربر در دیتابیس، استثنای `HTTPException` از `get_current_user` گرفته شده و مقدار `None` بازمی‌گردد که رفتار کاملاً مطلوب برای مسیرهای احراز هویت اختیاری است.

---

## ۵. ارزیابی انطباق آزمون‌ها (Test Suite Invariance Verification)

تحلیل آزمون‌های موجود در `backend/tests/`:
1. **`test_in_memory.py`:**
   - تمام آزمون‌های احراز هویت (`test_auth_endpoints`, `test_rbac_security_shield`, `test_persistent_sqlite_auth_and_registration`, `test_registration_persistence_and_duplicate_error`) کاربران واقعی موجود در SQLite (مانند `usr-140301`، `adm-001` یا کاربران رجیسترشده زنده) را به کار می‌گیرند.
   - هیچ آزمونی در `test_in_memory.py` وابسته به بازگشت دیکشنری ماک جعلی نبوده‌است.
   - بنابراین ۱۰۰٪ آزمون‌های این فایل موفق (Pass) باقی خواهند ماند.
2. **`test_adversarial_m1.py` و `test_challenger_m1_2_adversarial.py`:**
   - آزمون‌های دستکاری توکن، امضای نامعتبر و فقدان `sub` وضعیت ۴۰۱ را بررسی می‌کنند.
   - با اعمال این اصلاحیه، رفتار سیستم نه تنها آزمون‌های قبلی را نقض نمی‌کند، بلکه آزمون نفوذ جدید مبنی بر رد توکن معتبر با `sub` ناموجود را نیز پاس خواهد کرد.

---

## ۶. فایل‌های کمکی ایجادشده در پوشه کاوشگر
جهت سهولت کار پیاده‌ساز، موارد زیر در پوشه این عامل مستقر شدند:
- `.agents/teamwork/explorer_m1_remediation_1/deps.patch`: پچ استاندارد و آماده اعمال (unified diff).
- `.agents/teamwork/explorer_m1_remediation_1/proposed_deps.py`: نسخه کامل، بازبینی‌شده و آماده جایگزینی برای `backend/app/api/deps.py`.
- `.agents/teamwork/explorer_m1_remediation_1/handoff.md`: سند تحویل ۵ مؤلفه‌ای مطابق پروتکل تیمی.
