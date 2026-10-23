# گزارش تحویل فنی فاز ۸: فرانت‌اند، تایپوگرافی، داکر و مستندات (Handoff Report)

## ۱. مشاهدات مستقیم (Observation)

۱. **فایل‌های بریف منسوخ در ریشه و فقدان پوشه آرشیو:**
   - فایل‌های `antigravity-redesign-brief.md` (حجم: ۹,۱۹۷ بایت) و `antigravity-redesign-brief_V2.md` (حجم: ۱۴,۲۳۰ بایت) در ریشه مخزن وجود دارند.
   - پوشه `docs/` در ریشه وجود ندارد.
   - بررسی `audit_pipeline.py` نشان داد که در خطوط ۱۳۲-۱۴۷ صرفاً فایل‌های `DESIGN.md`, `BACKEND_SYSTEM_DESIGN.md`, `SEO_STANDARDS.md`, `GEMINI.md`, `.agents/rules/anti-slop.md`, `.agents/rules/persian-writing.md`, `.agents/skills/persian-writing/SKILL.md` بررسی می‌شوند و هیچ رفرنسی به بریف‌های ریشه وجود ندارد.

۲. **وضعیت `DESIGN.md` و توکن‌های پالت دریبـل:**
   - در `DESIGN.md` بخش ۳ (خطوط ۳۴-۵۳) پالت فعلی به دو بخش ابسیدین (`#0C0D0E`, `#141518`, `#23252A`, `#F4F4F6`, `#C58B43`) و کاغذی (`#F9F8F5`, `#FFFFFF`, `#E7E4DC`, `#18181B`, `#8A532B`) تقسیم شده است.
   - توکن‌های چهارگانه پروداکشن دریبل مندرج در تقاضای رسمی کاربر (`#FCF9F4`, `#D6534F`, `#1B1B1B`, `#F2EFE9`) به صورت صریح در `DESIGN.md` مستند نشده‌اند.
   - در فایل `frontend/public/manifest.json`، دو توکن از این پالت درج شده است:
     ```json
     Line 10: "background_color": "#FCF9F4",
     Line 11: "theme_color": "#D6534F",
     ```

۳. **پیکربندی فونت در `frontend/src/app/layout.tsx`:**
   - خطوط ۳۸ تا ۵۳ فایل `frontend/src/app/layout.tsx`:
     ```tsx
     <head>
       <link
         rel="preload"
         href="/fonts/dana/DanaFaNum-Regular.woff2"
         as="font"
         type="font/woff2"
         crossOrigin="anonymous"
       />
       <link
         rel="preload"
         href="/fonts/dana/DanaFaNum-Bold.woff2"
         as="font"
         type="font/woff2"
         crossOrigin="anonymous"
       />
     </head>
     ```
   - فونت‌های `Vazirmatn` و `Lalezar` در `layout.tsx` لود نشده‌اند.
   - در `frontend/src/styles/globals.css` خط ۷۷:
     `--font-vazirmatn: 'Dana', -apple-system, sans-serif;` (نام مستعار دانا بوده است).
   - در `frontend/package.json` خط ۱۵: `"next": "^15.1.7"` که از ماژول `next/font/google` پشتیبانی کامل دارد.

۴. **پیکربندی `frontend/next.config.js` و مغایرت با `frontend/Dockerfile`:**
   - در `frontend/next.config.js` خطوط ۶۲-۶۸:
     ```javascript
     const nextConfig = {
       reactStrictMode: true,
       images: {
         unoptimized: true,
       },
     };
     ```
   - تنظیم `output: 'standalone'` وجود ندارد.
   - تابع `async headers()` با هدرهای امنیتی وجود ندارد.
   - در `frontend/Dockerfile` خطوط ۴۰ تا ۴۷:
     ```dockerfile
     COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
     COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
     ...
     CMD ["node", "server.js"]
     ```
     بدون `output: 'standalone'`، پوشه `.next/standalone` و فایل `server.js` تولید نمی‌شود و بیلد ایمیج داکر با شکست حتمی مواجه خواهد شد.

۵. **ناهماهنگی متغیرهای محیطی و سلامت‌سنجی در `docker-compose.yml`:**
   - در `backend/app/core/config.py` خط ۱۵:
     `SECRET_KEY: str = os.getenv("SECRET_KEY", "zanjirzan_philosophical_secret_key_2026_illumination")`
   - در `docker-compose.yml` خط ۱۷ و `.env.example` خط ۱۰:
     `JWT_SECRET=production_secure_secret_key_zanjirzan_2024`
   - متغیر `JWT_SECRET` در بک‌اند خوانده نمی‌شود و ناهماهنگ است.
   - سرویس `frontend` در `docker-compose.yml` خطوط ۳۲-۴۸ فاقد بخش `healthcheck` است.
   - بررسی اجرای `npm run build` در `frontend`: با موفقیت کامل و کد خروجی ۰ به پایان رسید.
   - بررسی اجرای `backend\.venv\Scripts\python.exe audit_pipeline.py`: با امتیاز ۱۰۰/۱۰۰ تایید شد.

---

## ۲. زنجیره منطقی استنتاج (Logic Chain)

۱. **استنتاج جابجایی بریف‌ها:** با توجه به مشاهده ۱ (عدم رفرنس در `audit_pipeline.py` و تکمیل بازطراحی ریشه)، انتقال فایل‌های `antigravity-redesign-brief.md` و `antigravity-redesign-brief_V2.md` به `docs/archive/` پروژه را پیراسته کرده و هیچ تداخلی با خط لوله تست نخواهد داشت.
۲. **استنتاج مرجعیت `DESIGN.md`:** با توجه به مشاهده ۲ و تطابق با مقادیر موجود در `manifest.json`، افزودن جدول صریح کدهای هگز (`#FCF9F4`, `#D6534F`, `#1B1B1B`, `#F2EFE9`) به `DESIGN.md`، تناقض بین مستندات و PWA را رفع کرده و سند را به منبع واحد حقیقت مبدل می‌سازد.
۳. **استنتاج استقلال فونت‌ها با `next/font`:** با توجه به مشاهده ۳، ایمپورت `Vazirmatn` و `Lalezar` از `next/font/google` با `display: 'swap'` و تزریق متغیرهای CSS به `html` و `tailwind.config.js`، هم فونت‌ها را در ران‌تایم داکر سلف‌هاست و مستقل از فایل‌سیستم محلی می‌کند و هم فونت دانا را بدون تغییر حفظ می‌نماید.
۴. **استنتاج بحرانی `output: 'standalone'`:** با توجه به مشاهده ۴، از آنجا که `Dockerfile` فرانت‌اند فایل `server.js` را از `.next/standalone` کپی و اجرا می‌کند، فعال‌سازی `output: 'standalone'` در `next.config.js` یک ضرورت ساختاری است. افزودن `async headers()` نیز سه هدر الزامی امنیتی (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`) را پیاده‌سازی می‌کند.
۵. **استنتاج هماهنگی داکر و متغیرها:** با توجه به مشاهده ۵، جهت رفع ناهماهنگی نام کلید سکرت، باید در `docker-compose.yml` و `.env.example` متغیر `SECRET_KEY` درج شود (و در `config.py` فال‌بک دوطرفه تعبیه گردد). همچنین افزودن سلامت‌سنجی مبتنی بر `wget` به فرانت‌اند، هماهنگی کامل سرویس‌ها را تضمین می‌کند.

---

## ۳. محدودیت‌ها و فرضیات (Caveats)

۱. **دسترسی شبکه در زمان Build داکر:** `next/font/google` در زمان اجرای دستور `npm run build` اقدام به دانلود فونت‌ها از گوگل می‌نماید و پس از آن کاملاً به صورت محلی در کانتینر ذخیره می‌شوند. چنانچه محیط ساخت کانتینر در شرایط تحریم یا آفلاین باشد، اتصال اینترنت هنگام ساخت لایه `builder` یا دسترسی به سرور فونت مورد نیاز است (فونت دانا کماکان به صورت کاملاً لوکال در `public/fonts/dana` فعال است).
۲. **پروکسی Nginx:** در فایل `nginx/nginx.conf` هدر `X-Frame-Options "SAMEORIGIN"` قید شده بود، در حالی که تقاضای کاربر برای `next.config.js` صراحتاً مقدار `"DENY"` را خواسته است؛ بنابراین هدرها در لایه اپلیکیشن روی `DENY` تنظیم خواهند شد.

---

## ۴. نتیجه‌گیری اجرایی (Conclusion)

نقشه فنی فاز ۸ کاملاً روشن، دارای ریسک کنترل‌شده و آماده پیاده‌سازی است:
۱. ساخت دایرکتوری `docs/archive/` و انتقال بریف‌ها.
۲. اصلاح `DESIGN.md` و ثبت جدول چهار توکن تولیدی دریبل.
۳. به‌روزرسانی `frontend/src/app/layout.tsx` با پیکربندی استاندارد `next/font/google` (`Vazirmatn` و `Lalezar`).
۴. به‌روزرسانی `frontend/next.config.js` با `output: 'standalone'` و هدرهای امنیتی سه‌گانه.
۵. به‌روزرسانی `docker-compose.yml` (افزودن healthcheck فرانت‌اند و تصحیح `SECRET_KEY`) و همگام‌سازی `.env.example`.

---

## ۵. روش اعتبارسنجی مستقل (Verification Method)

عامل اجراکننده یا ناظر می‌تواند با فرامین زیر صحت تغییرات را بیازماید:
۱. **تست بیلد فرانت‌اند:**
   ```powershell
   cd frontend
   npm run build
   ```
   *شرط قبولی:* خروجی موفق، ایجاد پوشه `frontend/.next/standalone` با حجم بهینه و عدم وجود خطای تایپ یا هدرها.
۲. **تست سلامت‌سنجی و کیفیت پلتفرم:**
   ```powershell
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *شرط قبولی:* کسب امتیاز ۱۰۰/۱۰۰ در تمامی ۸ آزمون خودکار.
۳. **بررسی عدم وجود بریف‌ها در ریشه:**
   ```powershell
   Test-Path antigravity-redesign-brief.md
   Test-Path docs/archive/antigravity-redesign-brief.md
   ```
