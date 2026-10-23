# گزارش تحویل کار (Handoff Report)
## واحد کاوشگر معماری احراز هویت فرانت‌اند و REA (Frontend Auth & REA Architecture Explorer)

**گیرنده:** `orchestrator_3` (Conversation ID: `174180af-6f26-480c-bb80-0a02fcfc7785`)  
**تاریخ گزارش:** ۱۲ اکتبر ۲۰۲۶  
**مسیر گزارش جامع:** `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend\report.md`  

---

## ۱. مشاهدات عینی (Observation)

۱. **فایل `frontend/src/app/login/page.tsx` (۱۷۱ سطر):**
   - در سطرهای ۲۰ تا ۲۳:
     ```tsx
     const [phone, setPhone] = useState('09123456789');
     const [otpSent, setOtpSent] = useState(false);
     const [otpCode, setOtpCode] = useState('');
     ```
     فقط جریان شبیه‌سازی‌شده OTP پیاده شده است. فیلدهای دریافت رمز عبور (Password) یا نام و نام خانوادگی برای ثبت‌نام وجود ندارند.
   - در سطرهای ۳۰ تا ۳۴ و ۳۶ تا ۳۹:
     ```tsx
     const handleVerifyOtp = (e: React.FormEvent) => {
       e.preventDefault();
       login(phone, 'STUDENT');
       window.location.href = '/dashboard';
     };
     ```
     از فراخوانی مستقیم متد ماک `login` و تغییر هاردکدشده `window.location.href` استفاده می‌شود. هیچ فراخوانی API به `/api/v1/auth/login` یا `/api/v1/auth/register` وجود ندارد.
   - فاقد هرگونه نشان خطای درون‌خطی (Inline Error Badge) برای شماره نامعتبر، شماره تکراری یا رمز اشتباه.

۲. **فایل `frontend/src/context/AuthContext.tsx` (۱۱۹ سطر):**
   - در سطرهای ۴۱ تا ۵۲:
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
     در صورت نبود اطلاعات، سیستم به شکل خودکار یک دانش‌آموز فرضی ماک می‌سازد؛ در نتیجه در نگاه نخست به برنامه، کاربر هیچ‌گاه در وضعیت بدون لاگین قرار نمی‌گیرد!
   - متد `login(phone, role)` در سطرهای ۵۵ تا ۶۶ صرفاً یک شیء محلی با شناسه موقت تولید می‌کند.
   - هیچ متدی برای `register` در تایپ `AuthContextType` یا بدنه کانتکست وجود ندارد.
   - کلید ذخیره توکن `zanjirzan_token` هرگز در `AuthContext` نوشته یا خوانده نمی‌شود، در نتیجه اندپوینت `/api/v1/auth/me` فراخوانی نمی‌شود و `apiClient` نیز توکنی برای ارسال در سرآیند ندارد.
   - فاقد پرچم `isLoading` برای مدیریت بارگذاری اولیه نشست.

۳. **فایل `frontend/src/services/apiClient.ts` (۲۹۰ سطر):**
   - در سطرهای ۲۳ تا ۳۰، سرآیند احراز هویت توکن را از کلید `zanjirzan_token` در `localStorage` استخراج می‌کند:
     ```ts
     const token = localStorage.getItem('zanjirzan_token');
     return {
       'Content-Type': 'application/json',
       ...(token ? { Authorization: `Bearer ${token}` } : {}),
     };
     ```
   - در سطرهای ۵۰ تا ۷۶، متدهای `auth.login`, `auth.register`, `auth.getMe`, `auth.sendOtp`, `auth.verifyOtp` پیاده‌سازی شده‌اند.
   - در سطرهای ۳۸ تا ۴۲، خطاهای Pydantic با آرایه `detail` مدیریت نشده‌اند و می‌توانند منجر به نمایش `[object Object]` شوند.

۴. **مسیرهای محافظت‌شده و `ShellAuthGate.tsx` (۹۶ سطر):**
   - در `frontend/src/app/dashboard/page.tsx` (سطر ۱۱۳) و `frontend/src/app/admin/page.tsx` (سطر ۱۱۴)، بررسی `if (!user)` یا `if (!user || !isAdmin)` به رندر `ShellAuthGate` ختم می‌شود.
   - `ShellAuthGate` در حال حاضر تنها دکمه ورود آزمایشی دارد و پیوند ورود مستقیم به `/login` را ارائه نمی‌دهد.

۵. **قراردادهای بک‌اند در `backend/app/api/v1/endpoints/auth.py`:**
   - متد ثبت‌نام `POST /api/v1/auth/register` با پارامترهای `{ full_name, phone, password }` و خروجی `UserResponse` شامل `access_token`.
   - در صورت شماره تکراری، خطای کد ۴۰۰ با پیام `شماره تماس '...' قبلاً در سامانه ثبت شده است.` صادر می‌شود.
   - متد ورود `POST /api/v1/auth/login` با پارامترهای `{ phone, password }` و خروجی `UserResponse` شامل `access_token`.
   - متد استعلام کاربر `GET /api/v1/auth/me` با سرآیند `Authorization: Bearer <token>` و خروجی `UserResponse`.

۶. **وضعیت بیلد و اعتبارسنجی‌های پروژه:**
   - اجرای `npm run build` با خروجی کد ۰ و موفقیت ۱۰۰٪ پایان یافت.
   - اجرای `backend\.venv\Scripts\python.exe audit_pipeline.py` با امتیاز ۱۰۰/۱۰۰ پایان یافت.

---

## ۲. زنجیره استدلال منطقی (Logic Chain)

۱. با توجه به مشاهده ۱ و ۲، از آنجا که فرانت‌اند در لایه ورود و کانتکست صرفاً بر ماک‌های داخلی تکیه دارد و هیچ توکنی ذخیره نمی‌کند، تمام درخواست‌های کاربران عملاً ناشناس مانده و از مزایای پایگاه داده ماندگار و توکن‌های امضاشده JWT محروم می‌شوند.
۲. با توجه به مشاهده ۱، فقدان تب‌های ورود/ثبت‌نام و نبود فیلدهای رمز عبور و نام، مانع از تعامل زنده کاربر با سرویس ثبت‌نام و ورود بک‌اند است. بنابراین تفکیک این دو جریان در تب‌های مجزا الزامی است.
۳. با توجه به مشاهده ۱ و ۵، خطاهای ساختاریافته بازگشتی از بک‌اند (نظیر ۴۰۰ برای شماره تکراری و رمز نادرست) و اعتبارسنجی‌های کلاینت (الگوی شماره ایران `^09\d{9}$` و طول رمز) باید به صورت نشان‌های خطای درون‌خطی زیر فیلدها نگاشت شوند تا تجربه کاربری تحریریه‌ای استاندارد حاصل شود.
۴. با توجه به مشاهده ۲ و ۳، پیاده‌سازی سازوکار ذخیره `zanjirzan_token` و استعلام `/api/v1/auth/me` بر روی کانتکست به همراه استیت `isLoading`، امکان آب‌رسانی بی‌درنگ نشست (Session Hydration) و حذف فلیکر گیت‌های محافظتی در `/dashboard` و `/admin` را تضمین می‌کند.
۵. با توجه به استاندارد REA (محدودیت زیر ۲۰۰ سطر در هر فایل)، نمی‌توان تمام فرم‌ها، اعتبارسنجی و جهش‌های شبکه را در `login/page.tsx` تجمیع کرد. از این رو، استخراج منطق به هوک `useAuthForm.ts` و تفکیک کامپوننت‌های بصری به `AuthFormField`, `AuthTabs`, `LoginForm`, `RegisterForm` و `QuickRoleSelector` ضروری و راه‌حل قطعی است.

---

## ۳. احتیاط‌ها و مفروضات (Caveats)

- **دامنه تحقیق:** این بررسی بر اساس معماری فعلی فرانت‌اند در `frontend/src/` و اندپوینت‌های جاری بک‌اند انجام گرفت. تغییرات همزمان تیم بک‌اند بر روی مایگریشن‌های پایگاه‌داده SQLite/SQLAlchemy مستلزم هم‌راستایی فیلدها با اسکیماهای `UserResponse` است (که از پیش در اسکیماها تثبیت شده‌اند).
- **سازگاری با کدهای موجود:** فیلدهای مصرفی `user.name` و `user.role` در کامپوننت‌های موجود نظیر `ShellLayout` باید از طریق آداپتور کانتکست با فیلدهای `full_name` و نقش کوچک `student`/`admin` بک‌اند تطبیق یابند تا هیچ صفحه فرعی دچار شکستگی نشود.
- **تقارن دیکشنری:** در صورت افزودن کلیدهای ترجمه جدید به `fa.ts`، حتماً کلیدهای متناظر به `ar.ts` و `en.ts` افزوده شوند تا تایپ `TranslationKey` به ارور تایپ‌اسکریپت نخورد.

---

## ۴. نتیجه‌گیری (Conclusion)

طرح معماری پیشنهادی، تمامی نیازمندی‌های احراز هویت زنده، پایگاه داده واقعی، اعتبارسنجی درون‌خطی فیلدها و انطباق با متدولوژی REA را بدون نقض قوانین سخت‌گیرانه پروژه پاسخ می‌دهد:
- **معماری ماژولار زیر ۲۰۰ سطر:** استخراج `useAuthForm.ts` و ۵ زیرکامپوننت تخصصی در `components/auth/`.
- **احراز هویت زنده و واقعی:** اتصال به `apiClient.auth.login` و `register` و ذخیره توکن Bearer در `zanjirzan_token`.
- **تجربه کاربری تحریریه‌ای ضد اسلاپ:** نشان‌های خطای اینلاین ظریف با آیکون `AlertCircle` و عدم استفاده از المان‌های زائد بصری.
- **آب‌رسانی دقیق نشست:** استعلام `/api/v1/auth/me` در هنگام بارگذاری و حفاظت مقتدرانه از مسیرهای `/dashboard` و `/admin`.

---

## ۵. روش اعتبارسنجی مستقل (Verification Method)

پس از اجرای پیاده‌سازی توسط توسعه‌دهندگان، صحت عملکرد باید به صورت زیر تصدیق شود:

۱. **بررسی عدم وجود خطای ساخت و تایپ‌اسکریپت:**
   ```bash
   cd e:\personal\philosophy_zanjirzan_app\frontend
   npm run build
   ```
   *شرط قبولی:* خروجی کد ۰ با ایجاد موفق تمامی صفحات ایستا و سرویس‌ورکر PWA.

۲. **بررسی آزمون‌های خط لوله جامع کیفیت، سئو و نگارش فارسی:**
   ```bash
   cd e:\personal\philosophy_zanjirzan_app
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *شرط قبولی:* کسب امتیاز ۱۰۰ از ۱۰۰ و تایید نام «حجت الاسلام دکتر زنجیر زن حسینی»، مانیفست ضد اسلاپ و نگارش اصیل فارسی.

۳. **بررسی سقف خطوط فایل‌ها (REA Line Count Audit):**
   هیچ فایلی در `frontend/src/components/auth/`، `frontend/src/hooks/` و `frontend/src/app/login/` نباید بیشتر از ۲۰۰ سطر کد داشته باشد.

۴. **تست تعاملی جریان احراز هویت:**
   - ثبت‌نام با شماره تکراری `09123456789`: نمایش نشان خطای قرمز رنگ «این شماره تماس قبلاً در پایگاه ثبت شده است. لطفاً وارد شوید.» مستقیماً در زیر فیلد تلفن.
   - ورود با شماره `09123456789` و رمز عبور اشتباه: نمایش نشان خطای «رمز عبور واردشده نادرست است.» زیر فیلد رمز عبور.
   - ورود موفق با رمز `pass`: ذخیره توکن در `localStorage`، ریدایرکت نرم به `/dashboard`، و نمایش نام دانشجو در هدر بدون فلیکر.
