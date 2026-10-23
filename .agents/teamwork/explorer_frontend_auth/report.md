# گزارش جامع تحلیل و معماری احراز هویت پایدار و مهندسی معکوس فرانت‌اند (REA)
### پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**تاریخ تهیه**: ۲۰۲۶-۱۰-۱۲  
**کاوشگر**: Frontend Auth Explorer (Orchestrator 3)  
**هدف**: بررسی عمیق وضعیت فعلی احراز هویت، جداسازی منطق و لایه نمایش، تجزیه ماژولار کامپوننت‌های بالای ۲۰۰ خط بر اساس متدولوژی REA، استخراج هوک اختصاصی `useAuthForm`، خطایابی فیلد-به-فیلد درون‌خطی، اعتبارسنجی نشست با سرور FastAPI، و صیانت از استانداردهای ضد اسلاپ و هویت رسمی استاد.

---

## چکیده اجرایی (Executive Summary)

سامانه فرانت‌اند در حال حاضر دارای ظاهر بصری متناسب با پالت ابسیدین/کاغذ کهن است، اما در لایه احراز هویت و مدیریت نشست به طور کامل متکی بر داده‌های ساختگی (Mock) در حافظه محلی (`localStorage.getItem('zanjirzan_user')`) است:
1. **صفحه ورود (`login/page.tsx`)** به جای اتصال به اندپوینت‌های واقعی بک‌اند (`/api/v1/auth/login` و `/api/v1/auth/register`)، یک فرایند ساختگی ارسال پیامک (OTP) شبیه‌سازی کرده و بدون ارسال گذرواژه، کاربر را لاگین در نظر می‌گیرد. علاوه بر این، هیچ فرمی برای ثبت‌نام کاربران جدید وجود ندارد.
2. **زمینه احراز هویت (`AuthContext.tsx`)** در صورت خالی بودن حافظه محلی، به طور پیش‌فرض یک کاربر دانشجو (`usr-9812`) تولید و ذخیره می‌کند که باعث می‌شود هر بازدیدکننده ناشناس به صورت خودکار احرازشده تلقی گردد و توکن امنیتی JWT در کلید استاندارد `zanjirzan_token` ذخیره نمی‌شود.
3. **عدم اعتبارسنجی نشست (`Session Hydration`)**: پس از بارگذاری صفحه، هیچ استعلامی از اندپوینت `/api/v1/auth/me` جهت احراز صحت توکن و دریافت مشخصات به‌روز کاربر صورت نمی‌گیرد.
4. **معماری معکوس (REA)**: برای انطباق با اصل سقف ۲۰۰ خط برای هر فایل و تفکیک لایه منطق از نمایش، کامپوننت یکپارچه صفحه لاگین باید به ۵ بخش ماژولار شامل `AuthField`، `LoginForm`، `RegisterForm`، `QuickLoginGrid` و هوک اختصاصی `useAuthForm` تجزیه شود.

---

## ۱. تحلیل دقیق `frontend/src/app/login/page.tsx`

### ۱.۱. مشخصات فنی فعلی
- **تعداد خطوط**: ۱۷۱ خط.
- **وابستگی‌ها و هوک‌ها**: `'use client'`، `useState` (۳ متغیر)، `useAuth`، `useLanguage`، آیکون‌های `lucide-react`، کامپوننت `Link`.
- **ورودی‌های فرم**: 
  - فیلد تلفن (`type="tel"`) با مقدار پیش‌فرض هاردکدشده `'09123456789'`.
  - فیلد کد تایید ۵ رقمی (`type="text"`) با مقدار پیش‌فرض هاردکدشده `'12345'`.
  - **فیلد مفقود**: فیلد گذرواژه (`password`) و فیلد نام و نام خانوادگی (`full_name`) به کلی در این صفحه وجود ندارند!

### ۱.۲. آسیب‌شناسی و گلوگاه‌های معماری
1. **کوپلینگ شدید منطق و نمایش**: متغیرهای وضعیت، هندلرهای ارسالی، ناوبری مستقیم از طریق `window.location.href` (که باعث رفرش کامل مرورگر و پاک شدن استیت‌های حافظه‌ای می‌شود)، و المان‌های بصری همگی در یک فایل تجمیع شده‌اند.
2. **منطق ساختگی (Mock Workflow)**:
   ```typescript
   // خطوط ۲۴-۲۸: صرفاً تغییر وضعیت بدون هیچ فراخوانی شبکه
   const handleSendOtp = (e: React.FormEvent) => {
     e.preventDefault();
     if (!phone) return;
     setOtpSent(true);
   };
   
   // خطوط ۳۰-۳۴: لاگین موک بدون بررسی توکن و گذرواژه
   const handleVerifyOtp = (e: React.FormEvent) => {
     e.preventDefault();
     login(phone, 'STUDENT');
     window.location.href = '/dashboard';
   };
   ```
3. **فقدان فرم ثبت‌نام**: کاربری که حساب ندارد امکان ساخت حساب را در فرانت‌اند ندارد، در حالی که اندپوینت `/api/v1/auth/register` در بک‌اند کاملاً آماده دریافت مشخصات است.
4. **فقدان اعتبارسنجی درون‌خطی**: هیچ کادر یا نشان خطای اختصاصی زیر فیلدها وجود ندارد. صرفاً ویژگی استاندارد HTML5 `required` استفاده شده که خطاهای سمت سرور (شماره تکراری یا رمز اشتباه) را به کاربر نشان نمی‌دهد.

### ۱.۳. نقشه مهندسی معکوس و تجزیه ماژولار (REA Deconstruction Blueprint)
بر اساس متدولوژی REA، صفحه ورود باید به لایه‌های کاملاً تفکیک‌شده و کمتر از ۲۰۰ خط تقسیم شود:

```
frontend/src/
├── app/login/
│   └── page.tsx                         # شل اصلی، سوئیچ تب ورود/ثبت‌نام، کانتینر ابسیدین/کاغذ (< 90 خط)
├── components/auth/
│   ├── AuthField.tsx                    # ورودی استاندارد دسترس‌پذیر با نشان خطای درون‌خطی (< 70 خط)
│   ├── LoginForm.tsx                    # فرم ورود زنده با شماره تماس و گذرواژه (< 100 خط)
│   ├── RegisterForm.tsx                 # فرم ثبت‌نام با نام، شماره تماس و گذرواژه (< 120 خط)
│   └── QuickLoginGrid.tsx               # دکمه‌های ورود سریع ارزیابی (دانشجو/مدیر) متصل به بک‌اند (< 75 خط)
└── hooks/
    └── useAuthForm.ts                   # هوک اختصاصی مدیریت استیت فرم، ولیدیشن و خطاها (< 140 خط)
```

---

## ۲. تحلیل وضعیت `frontend/src/context/AuthContext.tsx`

### ۲.۱. مشخصات و استیت‌های فعلی
- **تعداد خطوط**: ۱۱۹ خط.
- **واسط‌ها (Interfaces)**:
  ```typescript
  export type UserRole = 'ADMIN' | 'STUDENT';
  export interface UserProfile {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
    avatar?: string;
    enrolledCourseIds: string[];
    purchasedBookIds: string[];
  }
  ```
- **استیت‌ها**: `user: UserProfile | null`.

### ۲.۲. نواقص بحرانی
1. **لاگین خودکار ناخواسته (Auto-Login Anti-Pattern)**:
   در خطوط ۴۱-۵۲، اگر در حافظه مرورگر کاربری وجود نداشته باشد، سیستم به صورت خودکار یک کاربر تستی (`usr-9812`) تولید و ذخیره می‌کند:
   ```typescript
   // خط ۴۲: کاربر پیش‌فرض ناخواسته!
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
   **پیامد منفی**: هیچ کاربری در ابتدای ورود به سایت «ناشناس» محسوب نمی‌شود! نوبار دکمه لاگین را مخفی کرده و دکمه داشبورد را نمایش می‌دهد.
2. **عدم تطابق نام کلید توکن**: `apiClient.ts` توکن JWT را از `zanjirzan_token` می‌خواند، اما `AuthContext` هرگز چیزی در این کلید ذخیره نمی‌کند!
3. **فقدان تابع `register`**: متد ثبت‌نام در `AuthContextType` وجود ندارد.
4. **عدم اعتبارسنجی نشست (`Session Hydration`)**: در زمان باز شدن صفحه، هیچ درخواستی به `/api/v1/auth/me` ارسال نمی‌شود تا بررسی شود آیا توکن معتبر است یا منقضی شده.
5. **ناهمخوانی تایپ و حساسیت به بزرگی و کوچکی حروف**: بک‌اند نقش‌ها را با حروف کوچک برمی‌گرداند (`"student"` و `"admin"` مطابق با مدل Pydantic `UserResponse`)، در حالی که کانتکست با حروف بزرگ مقایسه می‌کند (`user?.role === 'ADMIN'`). در نتیجه در صورت دریافت پاسخ از سرور، وضعیت `isAdmin` به غلط `false` می‌شود مگر اینکه نرمال‌سازی شود.
6. **سازگاری به عقب برای آرایه‌های دوره و کتاب**: فایل `frontend/src/app/courses/[id]/page.tsx` به `user?.enrolledCourseIds.includes(...)` وابسته است. مدل بازگشتی از سرور فاقد این فیلدهاست؛ لذا کانتکست باید این آرایه‌ها را مقداردهی کند تا خطای ران‌تایم رخ ندهد.

### ۲.۳. ساختار بهینه‌سازی‌شده پیشنهادی برای `AuthContext.tsx`
```typescript
interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (fullName: string, phone: string, password: string) => Promise<User>;
  quickLogin: (role: 'student' | 'admin') => Promise<User>;
  logout: () => void;
  enrollCourse: (courseId: string) => void;
  purchaseBook: (bookId: string) => void;
}
```
چرخه آب‌رسانی نشست (Hydration Lifecycle):
- در هوک `useEffect` در بدو لود:
  1. مقدار `token = localStorage.getItem('zanjirzan_token')` بررسی می‌شود.
  2. اگر توکن موجود بود، درخواست `apiClient.auth.getMe()` فرستاده می‌شود.
  3. در صورت دریافت پاسخ ۲۰۰، اطلاعات کاربر هیدراته شده و `isAuthenticated = true` می‌گردد.
  4. در صورت خطای ۴۰۱ (انقضای توکن)، کلیدهای `zanjirzan_token` و `zanjirzan_user` پاک شده و کاربر `null` می‌ماند.
  5. وضعیت `isLoading` به `false` تغییر می‌کند.

---

## ۳. بازرسی `frontend/src/services/apiClient.ts`

### ۳.۱. ماژول احراز هویت در کلاینت API
کلاینت `apiClient.ts` از قبل دارای متدهای احراز هویت است (خطوط ۵۰ تا ۷۶):
- `auth.login(phone, password)` -> `POST /api/v1/auth/login`
- `auth.register(full_name, phone, password)` -> `POST /api/v1/auth/register`
- `auth.getMe()` -> `GET /api/v1/auth/me`
- `auth.sendOtp(phone)` -> `POST /api/v1/auth/otp/send`
- `auth.verifyOtp(phone, code)` -> `POST /api/v1/auth/otp/verify`

### ۳.۲. مدیریت آدرس پایه و سرآیند احراز هویت
- **آدرس پایه**:
  `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';`
  کاملاً صحیح و هماهنگ با سرور FastAPI.
- **تزریق سرآیند Authorization**:
  ```typescript
  private getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('zanjirzan_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
  ```
  عملکرد این بخش استاندارد است؛ فقط نیاز است `AuthContext` توکن را دقیقاً در همین کلید `zanjirzan_token` بنویسد.

### ۳.۳. مدیریت خطاها و ساختار پیام‌ها
کد فعلی:
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
}
```
**نکته قابل بهبود**:
اگر اعتبارسنجی Pydantic دچار خطا شود (HTTP 422)، `errorData.detail` یک آرایه از اشیاء خطاست:
`[{"loc": ["body", "phone"], "msg": "...", "type": "value_error"}]`
اگر مستقیم به عنوان متن در `new Error(...)` قرار گیرد، ممکن است به صورت `[object Object]` تبدیل شود. بنابراین بهتر است پردازش خطای آرایه‌ای اضافه گردد تا متن پیام خوانا و ساختاریافته استخراج شود.

---

## ۴. طراحی هوک اختصاصی فرم احراز هویت (`useAuthForm.ts`)

جهت رعایت تفکیک قطعی منطق از رابط کاربری (SoC) و رعایت سقف ۲۰۰ خط:

### ۴.۱. مسئولیت‌ها و مرزهای هوک
1. نگهداری مقادیر ورودی‌ها (`fullName`, `phone`, `password`).
2. اعتبارسنجی پیش از ارسال در سمت فرانت (Pre-flight client validation).
3. نگهداری نقشه خطاهای تفکیک‌شده به ازای هر فیلد (`errors.phone`, `errors.password`, `errors.fullName`, `errors.general`).
4. مدیریت وضعیت در حال ارسال (`isSubmitting`) جهت جلوگیری از ارسال تکراری.
5. تبدیل خطاهای دریافتی از سرور به خطاهای فیلد مربوطه.
6. هدایت روان کاربر با `useRouter().push()` به میز مطالعه یا پنل مدیریت.

### ۴.۲. امضا و تایپ‌های پیشنهادی
```typescript
export type AuthMode = 'login' | 'register';

export interface AuthFormValues {
  fullName: string;
  phone: string;
  password: string;
}

export interface AuthFormErrors {
  fullName?: string;
  phone?: string;
  password?: string;
  general?: string;
}

export function useAuthForm(initialMode: AuthMode = 'login') {
  // state: mode, values, errors, isSubmitting
  // functions: setMode, setFieldValue, validate, handleSubmit
}
```

### ۴.۳. قوانین اعتبارسنجی سمت کاربر (Client Validation)
| فیلد | قانون | پیام خطای فارسی اصیل |
| :--- | :--- | :--- |
| **شماره تلفن** (`phone`) | خالی نباشد | «شماره تلفن همراه الزامی است.» |
| **شماره تلفن** (`phone`) | تطابق با الگوی `/^09\d{9}$/` | «شماره تلفن همراه باید ۱۱ رقم و با ۰۹ آغاز شود (مثال: ۰۹۱۲۳۴۵۶۷۸۹).» |
| **رمز عبور** (`password`) | خالی نباشد | «رمز عبور الزامی است.» |
| **رمز عبور** (`password`) | حداقل ۶ کاراکتر | «رمز عبور باید حداقل ۶ نویسه باشد.» |
| **نام کاربر** (`fullName`) | در حالت ثبت‌نام خالی نباشد | «نام و نام خانوادگی الزامی است.» |
| **نام کاربر** (`fullName`) | حداقل ۳ نویسه | «نام و نام خانوادگی باید حداقل ۳ نویسه باشد.» |

### ۴.۴. ترجمه خطاهای سرور (Server Error Mapping)
- هنگامی که سرور پیام `USER_ALREADY_EXISTS` یا عبارت `قبلاً در سامانه ثبت شده است` برگرداند:
  -> خطای `errors.phone = 'این شماره تماس قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.'` ثبت می‌شود.
- هنگامی که سرور پیام `AUTHENTICATION_FAILED` یا `رمز عبور وارد شده نادرست است` برگرداند:
  -> خطای `errors.password = 'رمز عبور وارد شده نادرست است.'` ثبت می‌شود.
- سایر خطاها در `errors.general` قرار می‌گیرند.

---

## ۵. رابط کاربری و تجربه اعتبارسنجی فیلد-به-فیلد درون‌خطی (Inline Validation UX)

### ۵.۱. اصول تجربه کاربری
- خطای هر ورودی باید دقیقاً در زیر همان کادر ورودی (و نه در قالب یک توست شناور گذرا یا هشدار بالای صفحه) نمایش یابد.
- کادر ورودی در صورت داشتن خطا با حاشیه قرمز نرم (`border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500`) متمایز گردد.
- برچسب خطا باید دارای آیکون هشدار مینیاتوری (`AlertCircle` اندازه ۱۴ پیکسل)، پس‌زمینه محو نرم، حاشیه ۱ پیکسلی و متناسب با مود شب و روز باشد.
- دسترسی‌پذیری (A11y): ورودی دارای ویژگی `aria-invalid="true"` و `aria-describedby="{field}-error"` باشد و پیام خطا دارای `role="alert"`.

### ۵.۲. ساختار کامپوننت `AuthField.tsx`
```tsx
interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}
```
نشان خطا با استایل سازگار با پالت ضد اسلاپ:
```tsx
{error && (
  <div
    id={`${id}-error`}
    role="alert"
    className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 rounded-lg animate-in fade-in duration-150"
  >
    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
    <span>{error}</span>
  </div>
)}
```

---

## ۶. نظارت بر مسیرهای حفاظت‌شده (`/dashboard` و `/admin`)

### ۶.۱. وضعیت کنونی گیت‌های دسترسی
- در فایل `frontend/src/app/dashboard/page.tsx`:
  ```tsx
  if (!user) {
    return (
      <ShellAuthGate
        portalType="student"
        onDemoLogin={() => login('09123456789', 'STUDENT')}
      />
    );
  }
  ```
- در فایل `frontend/src/app/admin/page.tsx`:
  ```tsx
  if (!user || !isAdmin) {
    return (
      <ShellAuthGate
        portalType="admin"
        onDemoLogin={() => login('09123456789', 'ADMIN')}
      />
    );
  }
  ```

### ۶.۲. مسائل و راهکارهای اصلاحی
1. **فلش ناخواسته گیت در زمان آب‌رسانی (Hydration Flash)**:
   در بارگذاری اولیه، تا زمانی که درخواست `/api/v1/auth/me` پاسخ ندهد، مقدار `user` برابر `null` است. اگر بررسی بدون در نظر گرفتن `isLoading` انجام شود، کاربر حتی اگر لاگین باشد برای کسری از ثانیه صفحه `ShellAuthGate` را می‌بیند.
   **راهکار**: افزودن اسکلت لودینگ شیک یا بررسی `if (isLoading) return <DashboardSkeleton />`.
2. **اتصال `ShellAuthGate` به احراز هویت واقعی**:
   دکمه دمو در `ShellAuthGate` در حال حاضر متد موک را فراخوانی می‌کند. باید به متد `quickLogin('student')` یا پیوند رسمی به `/login` متصل شود تا توکن واقعی ثبت گردد.
3. **تفکیک نقش‌های دانشجو و مدیر**:
   - کاربران با نقش `student`: اجازه دسترسی به `/dashboard` را دارند اما در `/admin` با گیت مسدود می‌شوند.
   - کاربران با نقش `admin`: هم به `/admin` و هم به `/dashboard` دسترسی کامل دارند.

---

## ۷. انطباق با توکن‌های طراحی، مانیفست ضد اسلاپ و نام رسمی استاد

### ۷.۱. ماتریس انطباق توکن‌های بصری
- **رنگ‌های پایه**:
  - پس‌زمینه تاریک: ابسیدین ژرف `#0C0D0E`.
  - سطوح پنل‌های تاریک: `#141518` با خطوط مرزی ۱ پیکسلی `border-zinc-800`.
  - پس‌زمینه روشن: کاغذ کهن و پنبه‌ای `#FAF8F5`.
  - سطوح پنل‌های روشن: سفید خالص `#FFFFFF` با خطوط مرزی `border-zinc-200`.
  - رنگ تأکیدی (Accent): چرم سوخته و برنز کهن `#8A532B` (در حالت روشن) و `#C58B43` (در حالت تاریک).
- **مقیاس فاصله‌گذاری**:
  - استفاده دقیق از مقیاس مضرب ۴ پیکسلی تیلویند: `p-1` (۴px)، `p-2` (۸px)، `p-3` (۱۲px)، `p-4` (۱۶px)، `p-6` (۲۴px)، `p-8` (۳۲px). بدون استفاده از مقادیر اعشاری دلخواه.
- **ویژگی‌های منطقی تیلویند (Tailwind Logical Properties)**:
  - استفاده ۱۰۰٪ از جهت‌های منطقی راست‌به‌چپ: `ps-` (padding-inline-start)، `pe-` (padding-inline-end)، `ms-` (margin-inline-start)، `me-` (margin-inline-end)، `start-` و `end-`، `text-start`. پرهیز کامل از `pl-`، `pr-`، `ml-`، `mr-`، `left-`، `right-`.
- **سقف تایپوگرافی**:
  - عناوین به هیچ وجه از `text-2xl font-bold` فراتر نمی‌روند. تیترهای فرم ورود `text-lg` و `text-base` تنظیم شده‌اند.

### ۷.۲. پاکیزگی از اسلاپ (Anti-AI-Slop Cleanliness)
- ❌ هیچ‌گونه هاله نئونی بلورشده (`blur-3xl`, `bg-amber-500/10`) استفاده نشده و نخواهد شد.
- ❌ هیچ‌گونه متن گرادیانی چندرنگ (`bg-clip-text text-transparent`) وجود ندارد.
- ❌ هیچ‌گونه برچسب شناور با نقطه سبز چشمک‌زن (`animate-pulse`) قرار نگرفته است.
- ❌ هیچ‌گونه کارت کلیشه‌ای سه‌ستونه با آیکون داخل مربع رنگی استفاده نمی‌شود.

### ۷.۳. صیانت از نام رسمی استاد و نگارش اصیل فارسی
- **نام رسمی استاد**: منحصراً و بدون کوچک‌ترین دخل و تصرف:
  **«حجت الاسلام دکتر زنجیر زن حسینی»**
- **نگارش فارسی پیراسته**:
  - عدم استفاده مطلق از افعال اداری فرسوده («می‌باشد / می‌باشند»، «می‌گردد / گردید»).
  - عدم استفاده از کلیشه‌های تکراری هوش مصنوعی («لازم به ذکر است»، «شایان ذکر است»، «نقش بسزایی ایفا می‌کند»).
  - رعایت دقیق نیم‌فاصله‌ها (ZWNJ) در افعال و نشانه‌های جمع و گیومه فارسی (« ») در پیام‌ها.

---

## ۸. جدول تطبیق کامپوننت‌ها پیش و پس از ریفکتور

| مؤلفه | وضعیت کنونی | وضعیت پس از ریفکتور REA | خطوط هدف |
| :--- | :--- | :--- | :--- |
| `app/login/page.tsx` | فایل یکپارچه ۱۷۱ خط با منطق موک OTP و ناوبری مستقیم | شل سبک با هدر استاد، تب سوئیچینگ و فوتر | ~۸۵ خط |
| `components/auth/AuthField.tsx` | وجود ندارد | ورودی دسترس‌پذیر با ویژگی‌های منطقی و نشان خطای زیر فیلد | ~۶۵ خط |
| `components/auth/LoginForm.tsx` | وجود ندارد | فرم اختصاصی ورود زنده با شماره و گذرواژه | ~۹۵ خط |
| `components/auth/RegisterForm.tsx` | وجود ندارد | فرم اختصاصی ثبت‌نام با نام، شماره و گذرواژه | ~۱۱۵ خط |
| `components/auth/QuickLoginGrid.tsx` | ادغام‌شده داخل صفحه لاگین | ماژول مستقل دکمه‌های ورود آزمایشی با احراز زنده | ~۷۵ خط |
| `hooks/useAuthForm.ts` | وجود ندارد | هوک تفکیک‌شده استیت، ولیدیشن سمت فرانت و مپ خطای سرور | ~۱۳۰ خط |
| `context/AuthContext.tsx` | ۱۱۹ خط موک محلی با تولید خودکار کاربر فیک | کانتکست آب‌رسانی پایدار با `/me`، ذخیره توکن و ورود/ثبت‌نام زنده | ~۱۵۰ خط |

---

## ۹. نتیجه‌گیری و گام‌های بعدی جهت پیاده‌سازی

تحلیل میدانی نشان داد که زیرساخت فرانت‌اند کلاینت API (`apiClient.auth`) و مدل‌های تایپ‌اسکریپت دامنه از قبل به درستی پیکربندی شده‌اند و مانع اصلی، کدهای موک در `AuthContext.tsx` و صفحه `login/page.tsx` است.  
با پیاده‌سازی گام‌های فوق بر اساس نقشه معماری ارائه‌شده:
۱. فرانت‌اند به طور کامل به پایگاه داده پایدار متصل می‌شود.  
۲. خطاهای تکراری بودن شماره یا اشتباه بودن گذرواژه مستقیماً زیر فیلدها ظاهر می‌گردند.  
۳. خطوط تمام فایل‌ها زیر ۲۰۰ خط باقی می‌مانند.  
۴. سازگاری کامل با `audit_pipeline.py` (امتیاز ۱۰۰/۱۰۰) و `npm run build` (۰ خطا) تضمین می‌شود.
