# گزارش جامع فنی فاز ۸: فرانت‌اند، تایپوگرافی، داکر و یکپارچه‌سازی مستندات
## Technical Survey & Architecture Report — Phase 8
### پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

---

## ۱. خلاصه اجرایی (Executive Summary)

این گزارش، بررسی فنی عمیق و نقشه‌راه اجرایی فاز ۸ توسعه پلتفرم شامل یکپارچه‌سازی مستندات، تثبیت توکن‌های پالت دریبل در `DESIGN.md`، مهاجرت به `next/font` جهت استقلال فونت‌ها در داکر، تنظیم `output: 'standalone'` و هدرهای امنیتی در `next.config.js`، و تصحیح هماهنگی متغیرهای محیطی و سلامت‌سنجی (Healthcheck) در `docker-compose.yml` را تدوین کرده است.

---

## ۲. هماهنگی مستندات و آرشیو بریف‌های منسوخ (Documentation Harmony)

### ۲.۱. بررسی وضعیت موجود:
- **فایل‌های ریشه:** دو فایل بریف قدیمی در ریشه پروژه قرار دارند:
  1. `antigravity-redesign-brief.md` (حجم: ۹,۱۹۷ بایت)
  2. `antigravity-redesign-brief_V2.md` (حجم: ۱۴,۲۳۰ بایت)
- **دایرکتوری `docs/`:** در حال حاضر دایرکتوری `docs/` در ریشه مخزن وجود ندارد.
- **تأثیر بر آزمون‌ها:** فایل `audit_pipeline.py` هیچ‌گونه وابستگی به نام یا مسیر این دو بریف ندارد (صرفاً `DESIGN.md`, `BACKEND_SYSTEM_DESIGN.md`, `SEO_STANDARDS.md`, `GEMINI.md` را چک می‌کند).

### ۲.۲. برنامه اقدام (Action Plan):
- ایجاد پوشه `docs/archive/` در ریشه مخزن.
- انتقال فایل‌های `antigravity-redesign-brief.md` و `antigravity-redesign-brief_V2.md` به `docs/archive/`.
- ثبت وضعیت منسوخ (Deprecated/Archived) این دو فایل و ارجاع کلیه تعاریف طراحی به `DESIGN.md`.

---

## ۳. مرجعیت واحد `DESIGN.md` و توکن‌های پالت دریبـل (Design System Single Source of Truth)

### ۳.۱. بررسی وضعیت موجود:
- سند `DESIGN.md` هم‌اکنون به عنوان مرجع ضد اسلاپ و هویت بصری فعال است و شامل قوانین منع هاله‌های نئونی (`blur-3xl`)، متن‌های گرادیانی (`bg-clip-text text-transparent`)، بج‌های چشمک‌زن (`animate-pulse`) و کارت‌های ۳ ستونه کلیشه‌ای است.
- با این وجود، توکن‌های دقیق پالت رنگی پروداکشن دریبل مندرج در تقاضای کاربر هنوز در بخش پالت رنگی `DESIGN.md` به صورت تفکیک‌شده درج نشده‌اند.
- در فایل `frontend/public/manifest.json`، دو توکن از این پالت قبلاً تثبیت شده‌اند:
  - `"background_color": "#FCF9F4"`
  - `"theme_color": "#D6534F"`

### ۳.۲. نگاشت توکن‌های چهارتایی دریبل (Dribbble Palette Semantic Tokens):
| کد رنگ هگز | نام معنایی توکن | کاربرد طراحی | معادل در حالت کنونی |
| :--- | :--- | :--- | :--- |
| `#FCF9F4` | **Warm Alabaster Canvas** | پس‌زمینه کاغذی اصلی لایت مود (Warm Editorial Canvas) | `manifest.json` (background_color) / جایگزین `#F9F8F5` |
| `#D6534F` | **Terracotta Coral Accent** | رنگ تأکیدی داغ، اکشن‌های اصلی، برند PWA | `manifest.json` (theme_color) |
| `#1B1B1B` | **Deep Carbon / Charcoal** | متن تیره با کنتراست بالا، سطوح کارت‌های دارک مود | جایگزین مشکی‌های جنریک و لایه مرجع دارک |
| `#F2EFE9` | **Soft Stone Muted Surface** | سطوح ظریف کارت‌ها، بوردرهای ملایم کاغذی و هاور | مکمل `#E7E4DC` در لایت مود |

### ۳.۳. برنامه اقدام برای `DESIGN.md`:
افزودن جدول مرجع رسمی توکن‌های پالت دریبل به بخش ۳ سند `DESIGN.md` به عنوان مرجع غیرقابل تغییر (Single Source of Truth) تا طراحان و عامل‌های بعدی بدون ابهام از این چهار کد هگز استفاده کنند.

---

## ۴. بازمهندسی تایپوگرافی با `next/font` در `frontend/src/app/layout.tsx`

### ۴.۱. بررسی وضعیت موجود:
- در حال حاضر `layout.tsx` به صورت دستی فونت دانا را با تگ‌های زیر در `<head>` پیش‌بارگذاری (preload) می‌کند:
  ```html
  <link rel="preload" href="/fonts/dana/DanaFaNum-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preload" href="/fonts/dana/DanaFaNum-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  ```
- فونت‌های اصیل فارسی استاندارد وب نظیر **وزیرمتن (`Vazirmatn`)** و **لاله‌زار (`Lalezar`)** در `layout.tsx` بارگذاری نشده‌اند.
- در `globals.css` متغیر `--font-vazirmatn: 'Dana', -apple-system, sans-serif;` صرفاً یک نام مستعار برای فونت محلی دانا است.
- در محیط داکر، تکیه بر فونت‌های متفرقه محلی در صورت بروز ناهماهنگی در کپی مسیرها می‌تواند موجب شکست نمایش فونت شود، در حالی که ماژول `next/font/google` فونت‌های وب را در زمان Build دانلود کرده و به طور کامل سلف‌هاست (Self-host) می‌کند (هیچ درخواستی در زمان ران‌تایم به سرورهای گوگل ارسال نمی‌شود).

### ۴.۲. برنامه پیکربندی با `next/font/google`:
در `frontend/src/app/layout.tsx`:
```tsx
import { Vazirmatn, Lalezar } from 'next/font/google';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const lalezar = Lalezar({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-lalezar',
  weight: '400',
});
```
و اتصال متغیرها به تگ `<html>` یا `<body>`:
```tsx
<html lang="fa" dir="rtl" className={`light ${vazirmatn.variable} ${lalezar.variable}`}>
```
و در `frontend/tailwind.config.js`:
```js
fontFamily: {
  sans: ['Dana', 'var(--font-vazirmatn)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  vazir: ['var(--font-vazirmatn)', 'Dana', 'sans-serif'],
  lalezar: ['var(--font-lalezar)', 'serif'],
  ...
}
```
**مزایا:**
۱. بارگذاری `display: 'swap'` مانع پرش متن نامرئی (FOIT) می‌شود.
۲. استقلال کامل از فایل‌سیستم محلی در کانتینر داکر (Decoupled from local filesystems).
۳. حفظ هم‌زمان فونت دانا به عنوان پیش‌فرض و در دسترس بودن وزیرمتن و لاله‌زار در سرتاسر رابط کاربری.

---

## ۵. تنظیم خروجی داکر و هدرهای امنیتی در `frontend/next.config.js`

### ۵.۱. کشف حساس و اضطراری در داکرفایل فرانت‌اند:
در خطوط ۴۰ تا ۴۷ فایل `frontend/Dockerfile` مشاهده شد:
```dockerfile
# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```
اما در `frontend/next.config.js`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};
```
❌ **نقص اساسی:** گزینه `output: 'standalone'` فعال نیست! اگر کسی فرمان `docker build` را اجرا کند، مرحله کپی از `/app/.next/standalone` با خطا مواجه خواهد شد زیرا بدون `output: 'standalone'`، نکست دایرکتوری standalone و فایل `server.js` را تولید نمی‌کند.

### ۵.۲. هدرهای امنیتی مورد نیاز (Security Headers):
طبق نیازمندی‌های فاز ۸، هدرهای زیر باید در `nextConfig` تنظیم شوند:
1. `X-Frame-Options: DENY` (محافظت در برابر حملات Clickjacking)
2. `X-Content-Type-Options: nosniff` (جلوگیری از MIME sniffing)
3. `Referrer-Policy: strict-origin-when-cross-origin` (حفظ امنیت ریفرر در تراکنش‌های خارجی)

### ۵.۳. کد پیشنهادی برای `frontend/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## ۶. ارزیابی `docker-compose.yml` و همگام‌سازی متغیرهای محیطی (`.env.example`)

### ۶.۱. کشف عدم تطابق نام متغیر سکرت بک‌اند:
- در `backend/app/core/config.py`:
  `SECRET_KEY: str = os.getenv("SECRET_KEY", "zanjirzan_philosophical_secret_key_2026_illumination")`
- در `docker-compose.yml` و `.env.example`:
  `JWT_SECRET=production_secure_secret_key_zanjirzan_2024`
- ⚠️ **ناهماهنگی:** متغیر `JWT_SECRET` در بک‌اند خوانده نمی‌شود و بک‌اند همچنان از مقدار پیش‌فرض `SECRET_KEY` استفاده می‌کند.
- **راهکار:** افزودن `SECRET_KEY` به `docker-compose.yml` و `.env.example`، و در `config.py` افزودن فال‌بک به `JWT_SECRET` جهت سازگاری ۱۰۰٪ دوطرفه:
  `SECRET_KEY: str = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET") or "zanjirzan_philosophical_secret_key_2026_illumination"`

### ۶.۲. پایش وضعیت سلامت (Healthcheck) در داکر کامپوز:
- **سرویس بک‌اند:** هم‌اکنون دارای سلامت‌سنجی صحیح است:
  `test: ["CMD", "curl", "-f", "http://localhost:8000/"]`
  بررسی نقطه ورود `/` در `main.py` تایید کرد که پاسخ `200 OK` با متادیتای سلامت پلتفرم بازگردانده می‌شود.
- **سرویس فرانت‌اند:** فاقد `healthcheck` است. در ایمیج `node:20-alpine`، ابزار `wget` به صورت پیش‌فرض وجود دارد. پیشنهاد می‌شود بلوک زیر اضافه شود:
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "wget --spider -q http://localhost:3000/ || exit 1"]
    interval: 20s
    timeout: 5s
    retries: 3
    start_period: 10s
  ```
- **سرویس پروکسی (Nginx):** به شرط سلامت هر دو سرویس ارتقا یابد:
  ```yaml
  depends_on:
    backend:
      condition: service_healthy
    frontend:
      condition: service_healthy
  ```

---

## ۷. ماتریس ریسک و سازگاری (Risk & Compatibility Matrix)

| مولفه | ریسک بالقوه | تمهید ایمنی |
| :--- | :--- | :--- |
| جابجایی بریف‌ها | احتمال شکست در اسکریپت‌های آزمون | تایید شد که `audit_pipeline.py` هیچ اتکایی به این فایل‌ها ندارد. |
| `output: 'standalone'` | احتمال افزایش حجم یا ناسازگاری با `@ducanh2912/next-pwa` | داکرفایل فرانت‌اند دقیقاً به این ساختار نیاز دارد. |
| بارگذاری فونت گوگل | نیاز به اتصال اینترنت در لحظه ساخت Build در داکر | فونت‌های گوگل در زمان بیلد توسط نکست کش می‌شوند؛ دانا به عنوان فال‌بک آفلاین در کنار آن باقی می‌ماند. |
| هدرهای امنیتی | تداخل با آی‌فریم‌های مجاز احتمالی | پلتفرم دارای هیچ آی‌فریم خارجی نیست و `DENY` کاملاً استاندارد است. |

---

## ۸. نتیجه‌گیری و گام‌های بعدی پیاده‌سازی (Next Steps)
بررسی‌های میدانی به پایان رسیده و کلیه فایل‌ها، خطوط هدف و پارامترهای تغییر شناسایی شدند. پیاده‌سازی می‌تواند توسط عامل مجری در مراحل زیر انجام شود:
1. انتقال بریف‌ها به `docs/archive/`.
2. به‌روزرسانی `DESIGN.md` با توکن‌های چهارگانه دریبل.
3. به‌روزرسانی `layout.tsx` با `next/font/google` (`Vazirmatn`, `Lalezar`, `display: 'swap'`).
4. اضافه کردن `output: 'standalone'` و Security Headers به `next.config.js`.
5. هماهنگ‌سازی متغیرهای `SECRET_KEY` و افزودن Healthcheck فرانت‌اند به `docker-compose.yml`.
6. اعتبارسنجی با `npm run build` و `python audit_pipeline.py`.
