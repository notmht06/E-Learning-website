# گزارش جامع کاوش و معماری فنی زیرساخت PWA (Next.js 15 App Router)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

- **شناسه کاوشگر**: `explorer_survey_pwa_1`
- **تاریخ کاوش**: 2026-10-07
- **وضعیت گزارش**: نهایی و آماده اجرا توسط عامل پیاده‌سازی (Implementer)
- **مخزن هدف**: `frontend/` (Next.js 15, React 19, TypeScript 5.7)

---

## ۱. ارزیابی وضعیت فعلی سامانه فرانت‌اند (Baseline Analysis)

### ۱.۱. نسخه‌های فریم‌ورک و وابستگی‌ها (`frontend/package.json`)
بررسی مستقیم فایل `frontend/package.json` وضعیت زیر را مشخص کرد:
* **Next.js**: نسخه `^15.1.7` (نسخه کامپایلر فعال در خروجی بیلد: `Next.js 15.5.25`)
* **React & React-DOM**: نسخه `^19.0.0`
* **TypeScript**: نسخه `^5.7.3`
* **Tailwind CSS**: نسخه `^3.4.17`
* **Motion / Lucide**: `motion ^13.4.0`، `lucide-react ^0.475.0`
* **وضعیت پکیج‌های PWA در `package.json` فعلی**: هیچ پکیجی برای PWA (مانند `next-pwa`، `@ducanh2912/next-pwa` یا `workbox-*`) در وابستگی‌ها درج نشده است.

### ۱.۲. پیکربندی نکست (`frontend/next.config.js`)
* فرمت فایل: ماژول CommonJS (`module.exports = nextConfig`)
* محتوای فعلی:
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    images: {
      unoptimized: true,
    },
  };

  module.exports = nextConfig;
  ```
* فاقد هرگونه افزونه یا لفاف (wrapper) برای بیلد سرویس‌ورکر یا کامپایل فایل‌های Workbox.

### ۱.۳. دارایی‌های موجود در پوشه عمومی (`frontend/public/`)
* **`public/manifest.json`**: وجود دارد (۳۴ خط). ساختار آن از هویت رسمی «حجت الاسلام دکتر زنجیر زن حسینی»، توکن‌های رنگی (`#0C0D0E`, `#8A532B`) و آیکون‌های استاندارد تبعیت می‌کند.
* **`public/sw.js`**: یک فایل جاوااسکریپت دستی ایستا (۹۳ خط) وجود دارد که کش اولیه را تعریف کرده، اما از طریق فرآیند بیلد یا وب‌پک جنریت نشده است و فایل‌های کمکی ورک‌باکس (`workbox-*.js`) را ایجاد نمی‌کند.
* **آیکون‌ها**:
  * `public/icons/icon-192.png` (ابعاد 192x192، حجم 547 بایت)
  * `public/icons/icon-512.png` (ابعاد 512x512، حجم 1881 بایت)
  * `public/icon.png` (ابعاد 192x192، حجم 547 بایت)
  * `public/favicon.ico` (99 بایت)
* **ثبت سرویس‌ورکر (`Service Worker Registration`)**:
  * فایل کامپوننت کلاینت `src/components/PWARegistration.tsx` از قبل ایجاد شده است.
  * این کامپوننت در `src/components/GlobalOverlays.tsx` (خط ۲۲) قرار داده شده و از طریق `src/app/layout.tsx` به صورت سراسری مانت می‌شود.
  * در فایل `src/app/layout.tsx`، متادیتای `manifest: '/manifest.json'` و تنظیمات `appleWebApp` و `viewport.themeColor` به درستی ثبت شده‌اند.

---

## ۲. ارزیابی گزینه‌های یکپارچه‌سازی PWA در Next.js 15

پروژه دارای الزامات و معیارهای پذیرش (Acceptance Criteria) بسیار شفافی در `ORIGINAL_REQUEST.md` است:
1. ارائه‌ی موفقیت‌آمیز `manifest.json`.
2. **کامپایل موفقیت‌آمیز فایل‌های سرویس‌ورکر (`sw.js` و `workbox-*.js`) در پوشه `public/` در زمان اجرای `npm run build`**.

| گزینه | مزایا | معایب / ریسک‌ها | سازگاری با معیار پذیرش |
| :--- | :--- | :--- | :--- |
| **گزینه ۱: `@ducanh2912/next-pwa`** (پیشنهاد اصلی) | • پشتیبانی ذاتی از Next.js 14/15 و App Router<br>• وابسته به Workbox 7 مدرن<br>• تولید خودکار و استاندارد `public/sw.js` و `public/workbox-*.js`<br>• تست موفق نصب در Next 15 (`exit code 0`) | نیازمند دقت در تنظیم `disable: dev` جهت عدم تداخل در فرآیند دولوپمنت | **۱۰۰٪ منطبق** با عبارت دقیق acceptance criteria |
| **گزینه ۲: `next-pwa` سنتی (v5.6.0)** | پکیج اولیه و شناخته‌شده در جامعه | • از سال ۲۰۲۲ رها شده است<br>• با هوک‌های مدرن Webpack در Next 15 و ساختار App Router به خطای زمان کامپایل می‌خورد<br>• فرض می‌کند پوشه `pages/` وجود دارد | نامناسب و پرریسک در Next 15 |
| **گزینه ۳: `@serwist/next`** | نسخه کاملاً بازنویسی‌شده برای Next.js جدید | معماری خروجی آن به جای `workbox-*.js` از ساختار ماژولار متفاوتی استفاده می‌کند و نیازمند `app/sw.ts` جداگانه است | مغایرت در فرمت فایل‌های خروجی با معیار پذیرش |
| **گزینه ۴: اسکریپت سفارشی `workbox-build`** | استقلال کامل از وب‌پک نکست | نیازمند نوشتن اسکریپت node سفارشی و تنظیم در scripts بیلد | پیچیدگی افزوده نگهداری |

### نتیجه‌گیری و توصیه فنی:
استفاده از پکیج **`@ducanh2912/next-pwa`** (نسخه `^10.2.9`).
این پکیج دقیقاً رفتار مورد تقاضای پروژه را تامین می‌کند: هنگام اجرای `npm run build`، پلاگین `workbox-webpack-plugin` فایل‌های `public/sw.js` و `public/workbox-<hash>.js` را کامپایل و مستقر می‌سازد.

---

## ۳. معماری مانیفست (`manifest.json`) و تطبیق با موازین پروژه

فایل `frontend/public/manifest.json` استاندارد و نهایی به شرح زیر تنظیم می‌شود. این سند پایبندی ۱۰۰٪ به اصل تثبیت نام استاد و پالت رنگی طراحی دارد:

```json
{
  "name": "پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی",
  "short_name": "دارالحکمة",
  "description": "پلتفرم تخصصی نشر کتب فلسفی، رسالات تحلیلی و دوره‌های آموزشی منقح حجت الاسلام دکتر زنجیر زن حسینی",
  "id": "/#daralhikmah",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0C0D0E",
  "theme_color": "#8A532B",
  "lang": "fa",
  "dir": "rtl",
  "categories": ["education", "books", "philosophy"],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### چک‌لیست انطباق مانیفست:
* ✅ نام کامل رسمی: «حجت الاسلام دکتر زنجیر زن حسینی» بدون تلخیص یا کسره/هکسره ناصحیح.
* ✅ پس‌زمینه ابسیدین: `#0C0D0E` (منطبق بر `DESIGN.md`).
* ✅ رنگ تم و متریال مس/چرم سوخته: `#8A532B` (منطبق بر `DESIGN.md`).
* ✅ زبان و جهت: `lang: "fa"`, `dir: "rtl"`.
* ✅ حالت نمایش اپلیکیشن بومی: `display: "standalone"`.

---

## ۴. استراتژی کش آفلاین و امنیت استریم‌های DRM

سیاست سرویس‌ورکر در مواجهه با منابع گوناگون باید با حفظ موازین امنیت بک‌اند (`BACKEND_SYSTEM_DESIGN.md`) و کارایی آفلاین تنظیم گردد:

### ۴.۱. اصل تخطی‌ناپذیر امنیت DRM (Security Guardian)
* 🛑 **ممنوعیت قطعی کش کردن اندپوینت‌های استریم و صوت (`/api/v1/stream/*`, `/stream/*`)**:
  تمامی قطعات صوتی و توکن‌های استریم دارای توکن‌های امضاشده منقضی‌شونده DRM هستند. سرویس‌ورکر **تحت هیچ شرایطی نباید این اندپوینت‌ها را کش کند** (`NetworkOnly` یا استثنا کردن کامل در الگوی URL).
* 🛑 **ممنوعیت کش کردن مسیرهای احراز هویت و مدیریت (`/api/v1/auth/*`, `/api/v1/admin/*`)**.

### ۴.۲. منابع پیش‌کش (Pre-caching)
* پوسته روت `/`
* فونت‌های اختصاصی پلتفرم: `/fonts/dana/DanaFaNum-Regular.woff2` و `/fonts/dana/DanaFaNum-Bold.woff2`
* آیکون‌ها و دارایی‌های برند: `/manifest.json`، `/icons/icon-192.png`، `/images/ostad_zanjirzan.jpg`

### ۴.۳. کش در زمان اجرا (Runtime Caching)
* **استراتژی ناوبری صفحات (HTML Documents)**: `NetworkFirst` با زمان انتظار کوتاه (Network Timeout 3s) و فال‌بک به حافظه کش برای دسترسی آفلاین به محتوای از قبل بازدیدشده.
* **استراتژی فونت‌ها و استایل‌ها (`fonts`, `styles`)**: `CacheFirst` با انقضای ۳۶۵ روزه.
* **استراتژی تصاویر جلد کتب و مقالات (`images`)**: `StaleWhileRevalidate` با سقف ۱۰۰ ورودی و انقضای ۳۰ روزه.

---

## ۵. نقشه پیاده‌سازی گام‌به‌گام برای عامل اجرا (Implementation Blueprint)

### گام ۱: نصب وابستگی PWA در `frontend`
اجرای دستور زیر در دایرکتوری `frontend`:
```bash
npm install @ducanh2912/next-pwa
```
*(بررسی درای‌ران با موفقیت و کدهای خروجی بدون تعارض انجام شد).*

### گام ۲: اصلاح پیکربندی `frontend/next.config.js`
کد آماده و استاندارد برای `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    // استثنا کردن صریح اندپوینت‌های استریم DRM و API از کش سرویس‌ورکر
    navigateFallbackDenylist: [/^\/api/, /^\/stream/],
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /^https?:\/\/.*\/stream\/.*/i,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = withPWA(nextConfig);
```

### گام ۳: به‌روزرسانی کامپوننت `PWARegistration.tsx`
کامپوننت `frontend/src/components/PWARegistration.tsx` هم‌اکنون به درستی پیاده شده است:
* از لود تاخیری رویداد `window.addEventListener('load')` استفاده می‌کند.
* در حالت توسعه برای پرهیز از کش‌شدن کدهای دولوپمنت غیرفعال است (`process.env.NODE_ENV === 'production'`).
* در صورتی که `@ducanh2912/next-pwa` با `register: true` بیلد شود، اسکریپت تزریقی خودکار ثبت را انجام می‌دهد و `PWARegistration` می‌تواند به عنوان ناظر بر رخدادهای آپدیت و آنلاین/آفلاین عمل کند یا به صورت کلاینتی به کار خود ادامه دهد.

### گام ۴: رفع خطای سدکننده تایپ‌اسکریپت موجود در بیلد پروژه (TS Blocker)
در خلال اجرای تست بیلد اولیه کشف شد که خطایی مستقل از PWA مانع از اتمام موفق `next build` می‌شود:
* **فایل**: `frontend/src/components/admin/tabs/AdminStatsTab.tsx`
* **سطر ۲۵**:
  ```typescript
  const activeDrmCount = drmSessions.filter((s) => s.status === 'فعال' || s.status === 'Active' || s.status === 'نشط').length;
  ```
* **علت خطا**: در تایپ `DrmSessionRecord` در `DataContext.tsx`، فیلد `status` به صورت یونیون استریکت `'فعال' | 'مسدود‌شده'` تعریف شده است. تایپ‌اسکریپت ۵.۷ مقایسه مقادیر `'Active'` و `'نشط'` را غیرممکن و خطای `TS2367` می‌داند.
* **راهکار رفع**:
  ```typescript
  const activeDrmCount = drmSessions.filter((s) => s.status === 'فعال').length;
  ```
  با این اصلاح جزئی، پروژه با خروجی ۰ خطای تایپ کامپایل خواهد شد.

---

## ۶. روش اعتبارسنجی و تایید عملکرد (Verification Protocol)

عامل اجرا پس از اِعمال تغییرات باید موارد زیر را آزمایش و احراز کند:

1. **بررسی تولید فایل‌های سرویس‌ورکر**:
   ```bash
   cd frontend
   npm run build
   ```
   **خروجی مورد انتظار**:
   * ساخت موفق فایل `frontend/public/sw.js`.
   * ساخت موفق فایل‌های `frontend/public/workbox-*.js` (مانند `workbox-7876a4a0.js`).
   * اتمام بدون خطای `npm run build` با کد ۰.

2. **بررسی تطابق ممیزی و استانداردها**:
   ```bash
   backend/.venv/Scripts/python.exe audit_pipeline.py
   ```
   **خروجی مورد انتظار**: کسب نمره ۱۰۰/۱۰۰ کامل بدون نقص در قواعد ضد اسلاپ، هویت استاد و نگارش فارسی.

3. **بررسی ثبت مانیفست در مرورگر**:
   * مسیر `/manifest.json` باید با فرمت `application/json` و محتوای صحیح لود شود.
   * نام برنامه: `پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی`.
