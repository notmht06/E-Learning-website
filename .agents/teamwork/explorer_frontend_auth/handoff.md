# Handoff Report — Frontend Auth Explorer
**Date**: 2026-10-12T01:10:00Z  
**Agent**: Frontend Auth Explorer (Subagent of Orchestrator 3)  
**Working Directory**: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_frontend_auth`  
**Handoff Type**: Hard (Investigation Complete)

---

## ۱. Observation (مشاهدات عینی)

1. **`frontend/src/app/login/page.tsx`**:
   - خطوط ۱ تا ۱۷۱ (مجموعاً ۱۷۱ خط).
   - خطوط ۲۰ تا ۲۳:
     ```tsx
     const [phone, setPhone] = useState('09123456789');
     const [otpSent, setOtpSent] = useState(false);
     const [otpCode, setOtpCode] = useState('');
     ```
   - خطوط ۳۰ تا ۳۴:
     ```tsx
     const handleVerifyOtp = (e: React.FormEvent) => {
       e.preventDefault();
       login(phone, 'STUDENT');
       window.location.href = '/dashboard';
     };
     ```
   - صفحه صرفاً یک فرایند صوری ارسال و اعتبارسنجی پیامک دارد و فاقد فیلد گذرواژه (`password`)، فاقد فرم ثبت‌نام (`register`) و فاقد هرگونه نشان خطای فیلد-به-فیلد درون‌خطی است.

2. **`frontend/src/context/AuthContext.tsx`**:
   - خطوط ۱ تا ۱۱۹ (مجموعاً ۱۱۹ خط).
   - خطوط ۴۱ تا ۵۲:
     ```tsx
     // Default demo student
     const defaultUser: UserProfile = {
       id: 'usr-9812',
       name: '',
       phone: '09123456789',
       role: 'STUDENT',
       enrolledCourseIds: ['course1'],
       purchasedBookIds: ['book1', 'book3'],
     };
     setUser(defaultUser);
     localStorage.setItem('zanjirzan_user', JSON.stringify(defaultUser));
     ```
   - خطوط ۵۵ تا ۶۶:
     ```tsx
     const login = (phone: string, role: UserRole = 'STUDENT') => {
       const newUser: UserProfile = {
         id: role === 'ADMIN' ? 'admin-01' : `usr-${Date.now().toString().slice(-4)}`,
         name: '',
         phone: phone || '09121234567',
         role,
         enrolledCourseIds: role === 'ADMIN' ? ['course1', 'course2', 'course3'] : ['course1'],
         purchasedBookIds: role === 'ADMIN' ? ['book1', 'book2', 'book3', 'book4'] : ['book1'],
       };
       setUser(newUser);
       localStorage.setItem('zanjirzan_user', JSON.stringify(newUser));
     };
     ```
   - متد `register` وجود ندارد. توکن در `zanjirzan_token` ذخیره نمی‌شود. هیچ درخواستی به `/api/v1/auth/me` ارسال نمی‌شود.

3. **`frontend/src/services/apiClient.ts`**:
   - خط ۲۵: `const token = localStorage.getItem('zanjirzan_token');`
   - خطوط ۵۰ تا ۷۶: توابع `login`, `register`, `sendOtp`, `verifyOtp`, `getMe` از قبل پیاده‌سازی شده و آماده فراخوانی هستند.
   - خطوط ۳۸ تا ۴۱: در صورت بروز خطای HTTP، متن خطا از `errorData.detail` یا `errorData.message` استخراج می‌شود.

4. **`frontend/src/components/Navbar.tsx`**:
   - خط ۵۴ و خطوط ۴۴۰ تا ۴۵۵: وضعیت `isAuthenticated` نمایش یا عدم نمایش دکمه ورود در نوبار را مشخص می‌کند. با توجه به لاگین خودکار کاربر فرضی در `AuthContext.tsx`، این دکمه همواره در حالت لاگین قرار دارد.

5. **فرمان‌های آزمایشی اجرا شده**:
   - `backend/.venv/Scripts/python.exe audit_pipeline.py`: امتیاز ۱۰۰/۱۰۰ با موفقیت کامل تمامی آزمون‌های ضد اسلاپ، هویت استاد و تست‌های بک‌اند.
   - `npm run build` در پوشه `frontend`: موفقیت کامل کامپایل صفحات با خروجی ۰ خطا (Exit code 0).

---

## ۲. Logic Chain (زنجیره استدلال منطقی)

1. **انتقال از مشاهده ۱ به تفکیک لایه نمایش (REA Deconstruction)**:
   مشاهده ۱ نشان داد که ۱۷۱ خط کد صفحه لاگین شامل استیت‌های محلی، ناوبری مستقیم با `window.location.href`، هدر برندینگ و دکمه‌های ورود سریع است. با افزودن فرم ثبت‌نام، فیلد رمز عبور و هندلرهای شبکه، حجم کد فراتر از ۲۰۰ خط خواهد رفت؛ بنابراین تفکیک آن به کامپوننت‌های کمتر از ۲۰۰ خط (`AuthField`، `LoginForm`، `RegisterForm`، `QuickLoginGrid` و `app/login/page.tsx`) و هوک `useAuthForm` برای انطباق با اصل مهندسی معکوس الزامی است.

2. **انتقال از مشاهدات ۲ و ۳ به اتصال احراز هویت پایدار**:
   مشاهده ۲ نشان داد که `AuthContext` به جای فراخوانی شبکه، اشیاء ساختگی می‌سازد و توکن را در `zanjirzan_token` نمی‌گذارد، در حالی که مشاهده ۳ نشان داد `apiClient.ts` توکن را از `zanjirzan_token` می‌خواند و اندپوینت‌های `login` و `register` و `getMe` آماده هستند. بنابراین جایگزینی منطق موک با فراخوانی متدهای `apiClient.auth` و آب‌رسانی نشست با `/api/v1/auth/me` مستقیماً مسئله ذخیره‌سازی پایدار را حل می‌کند.

3. **انتقال از مشاهده ۴ به رفع باگ لاگین خودکار**:
   مشاهده ۴ اثبات کرد که ساخت کاربر پیش‌فرض `usr-9812` در بارگذاری اولیه سبب اختلال در تجربه کاربری نوبار شده است؛ لذا حذف این شیء پیش‌فرض و تنظیم مقدار اولیه `user = null` برای کاربران ناشناس الزامی است.

4. **انتقال از مشاهده ۳ به استخراج خطاهای فیلد-به-فیلد**:
   مشاهده ۳ نشان داد که سرور FastAPI در زمان خطای اعتبارسنجی شیء `detail` برمی‌گرداند (`USER_ALREADY_EXISTS` برای شماره تکراری، `AUTHENTICATION_FAILED` برای رمز غلط). هوک `useAuthForm` این متون خطا را تحلیل کرده و مستقیماً به فیلدهای مربوطه (`phone` یا `password`) نقشه می‌زند تا درون کامپوننت `AuthField` به صورت درون‌خطی زیر همان فیلد به نمایش درآید.

---

## ۳. Caveats (محدودیت‌ها و مفروضات)

1. **محیط اجرایی مرورگر و تست E2E**: تست در سطح بیلد ایستا (`next build`) و تست‌های واحد پایتون انجام شد. تست مرورگر زنده مستلزم اجرای همزمان سرور Uvicorn بک‌اند (پورت ۸۰۰۰) و سرور Next.js فرانت‌اند (پورت ۳۰۰۰) است.
2. **پشتیبانی از نقش‌ها**: نقش کاربر در پاسخ سرور با حروف کوچک (`"student"` و `"admin"`) ارسال می‌شود، در حالی که تایپ پیشین فرانت‌اند با حروف بزرگ (`"STUDENT"` و `"ADMIN"`) بود. پیاده‌ساز باید تابع نرمال‌سازی کوچک/بزرگ قرار دهد تا سازگاری کامل حفظ شود.
3. **فیلدهای دوره‌ها و کتاب‌های کاربر**: مدل کاربر در پاسخ سرور فاقد `enrolledCourseIds` است، در حالی که صفحه جزئیات دوره به آن وابسته است. در کانتکست باید مقادیر پیش‌فرض آرایه خالی یا شناسه‌های مجاز به آن الحاق گردند تا از خطای زمان اجرا جلوگیری شود.

---

## ۴. Conclusion (نتیجه‌گیری و طرح عملیاتی)

مسیر معماری برای پیاده‌سازان به وضوح مشخص و تبیین شده است:
1. **توسعه هوک `frontend/src/hooks/useAuthForm.ts`** برای مدیریت استیت فرم، ولیدیشن سمت کلاینت و نگاشت خطاهای سرور به فیلدها.
2. **ایجاد کامپوننت‌های ماژولار** `AuthField.tsx`، `LoginForm.tsx`، `RegisterForm.tsx` و `QuickLoginGrid.tsx` در پوشه `frontend/src/components/auth/` (همگی زیر ۲۰۰ خط).
3. **بازنویسی سبک `frontend/src/app/login/page.tsx`** به عنوان ارائه‌دهنده شل و سوئیچ تب‌ها.
4. **اصلاح `frontend/src/context/AuthContext.tsx`** جهت حذف کاربر پیش‌فرض ساختگی، افزودن آب‌رسانی نشست با `/api/v1/auth/me`، ذخیره توکن در `zanjirzan_token` و اتصال `login` و `register` به `apiClient.auth`.
5. **رعایت کامل مانیفست ضد اسلاپ**، توکن‌های ابسیدین/کاغذ کهن و نام رسمی «حجت الاسلام دکتر زنجیر زن حسینی».

---

## ۵. Verification Method (روش ارزیابی و راستی‌آزمایی مستقل)

برای راستی‌آزمایی مستقل یافته‌ها و تغییرات آتی، دستورات زیر در ریشه پروژه اجرا شوند:

1. **ارزیابی سلامت، هویت استاد، نگارش فارسی و مانیفست ضد اسلاپ**:
   ```powershell
   .\backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *شرط قبولی*: کسب نمره ۱۰۰/۱۰۰ بدون هیچ خطای اسلاپ یا نقض نام رسمی.

2. **بررسی صحت تایپ‌ها و کامپایل فرانت‌اند**:
   ```powershell
   cd frontend
   npm run build
   ```
   *شرط قبولی*: کامپایل موفق بدون خطای TypeScript یا ESLint (کد خروج ۰).

3. **آزمون‌های یکپارچگی بک‌اند**:
   ```powershell
   .\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
   ```
   *شرط قبولی*: پاس شدن تمام آزمون‌های ورود، رمزنگاری bcrypt، صدور JWT و RBAC.

4. **فایل‌های جهت بازرسی**:
   - `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_frontend_auth\report.md`
   - `frontend/src/app/login/page.tsx`
   - `frontend/src/context/AuthContext.tsx`
   - `frontend/src/services/apiClient.ts`
