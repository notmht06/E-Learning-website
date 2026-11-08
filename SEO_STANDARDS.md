# استانداردهای جامع سئو تکنیکال و رتبه‌بندی («SEO_STANDARDS.md»)
## انطباق کامل با ۳۳۲ قاعده مهندسی «seo-audit-skill»
### پایگاه رسمی حجت الاسلام دکتر زنجیرزن حسینی

---

## ۱. متادیتا و اسکیماهای داده ساختاریافته (JSON-LD Schemas)

بر اساس استانداردهای Schema.org و راهنمای موتورهای جستجو (گوگل)، تمامی صفحات سامانه مجهز به اسکیماهای استاندارد زیر می‌باشند:

### ۱. اسکیمای استاد و مؤلف (Schema.org/Person)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "حجت الاسلام دکتر زنجیرزن حسینی",
  "alternateName": ["دکتر زنجیرزن حسینی", "Dr. Zanjirzan Hosseini"],
  "jobTitle": "استاد سطوح عالی و خارج حوزه علمیه، پژوهشگر علوم عقلی و نقلی",
  "description": "مدرس دروس خارج فقه، اصول، فلسفه، کلام، تفسیر و عرفان اسلامی",
  "image": "https://zanjirzan.ir/images/ostad_zanjirzan.jpg"
}
```

### ۲. اسکیمای دوره‌های آموزشی (Schema.org/Course)
برای هر یک از دوره‌های آفلاین و آنلاین، متادیتای کامل شامل:
- `name`: عنوان دقیق دوره
- `description`: سرفصل‌های تدریس‌شده و متون مرجع
- `provider`: مشخصات استاد و موسسه نشر آثار
- `courseCode`: کد یکتای دوره
- `educationalLevel`: سطح علمی (مقدمات، سطوح عالی، خارج فقه و اصول)
- `courseMode`: `offline` (درس‌گفتار استودیویی) یا `online` (کارگاه زنده اسکای‌روم)
- `hasCourseInstance`: زمان‌بندی و پیوند کلاس

### ۳. اسکیمای فایل‌های صوتی دروس (Schema.org/AudioObject)
- `name`: شماره جلسه و موضوع درس
- `duration`: طول صوت به استاندارد ISO 8601 (مانند `PT45M`)
- `encodingFormat`: `audio/mpeg`
- `audioQuality`: استودیویی پالایش‌شده با هوش مصنوعی (RNNoise 48kHz)
- `author`: حجت الاسلام دکتر زنجیرزن حسینی

---

## ۲. رندرسازی و عملکرد (Core Web Vitals)

1. **LCP (Largest Contentful Paint) < 2.0s:**
   - بهینه‌سازی فونت دانا با `font-display: swap` و کش پیشرفته WOFF2.
   - بارگذاری تصاویر اصلی (عکس پرتره استاد و جلد دوره‌ها) با `priority={true}` و انکود مدرن WebP/AVIF.
2. **INP (Interaction to Next Paint) < 150ms:**
   - حذف کامل عملیات مسدودکننده در ترد اصلی جاوااسکریپت و استفاده از کامپوننت‌های بهینه React 18 / Next.js 14.
3. **CLS (Cumulative Layout Shift) < 0.05:**
   - تعیین ابعاد ثابت (aspect-ratio) برای عکس‌ها، پخش‌کننده صوت و نوارهای بارگذاری.

---

## ۳. نقشه سایت و ارتباط با موتورهای جستجو و هوش مصنوعی

- **Dynamic Sitemap:** تولید خودکار `sitemap.xml` از طریق مسیر `app/sitemap.ts` شامل صفحات اصلی، ۸ شاخه علوم، تمام دوره‌ها و مقالات.
- **Robots.txt:** تنظیم دسترسی موتورهای جستجو و مسدودسازی مسیرهای پنل ادمین و استریم داخلی در `app/robots.ts`.
- **llms.txt & llms-full.txt:** فایل استاندارد در ریشه هاست (`/llms.txt`) برای معرفی پایگاه، متون دروس و بیوگرافی استاد به مدل‌های زبانی هوش مصنوعی (ChatGPT, Gemini, Claude, Perplexity).

---

## ۴. تگ‌های شبکه‌های اجتماعی (OpenGraph & Twitter Card)

- تمامی صفحات به صورت خودکار تگ‌های `og:title`, `og:description`, `og:image`, `og:type=website`, `twitter:card=summary_large_image` را با عنوان رسمی استاد تولید می‌کنند.
