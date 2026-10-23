# طرح معماری فنی: پیاده‌سازی تجربه بصری و پشته حرکتی
## Technical Plan: 001-bespoke-editorial-experience

- **هدف:** تشریح معماری کامپوننت‌ها، پشته انیمیشن، وضعیت‌های محلی و استراتژی پرفورمنس در Next.js 15 و React 19.

---

### ۱. پشته فناوری انیمیشن (Animation Tech Stack)

- **کتابخانه حرکتی:** `motion` (نسخه رسمی و سبک Framer Motion ۱۲ برای React 19).
- **پیکربندی فیزیک فنری (Spring Physics Preset):**
  ```typescript
  export const springTransition = {
    type: "spring",
    stiffness: 350,
    damping: 30,
    mass: 0.8,
  };
  ```
- **منحنی شتاب استاندارد (Editorial Ease-Out):**
  ```css
  cubic-bezier(0.16, 1, 0.3, 1)
  ```

---

### ۲. معماری کامپوننت‌های رپری (`frontend/src/components/motion/MotionPrimitives.tsx`)

1. **`FluidTabs<T>`:**
   - پذیرش آرایه‌ای از تب‌ها.
   - رندر دکمه‌ها با کپسول پس‌زمینه متحرک مجهز به `layoutId="activeTabIndicator"` و `transition={springTransition}`.
2. **`FluidModal`:**
   - مدیریت چرخه حیات باز/بسته شدن با `AnimatePresence`.
   - انیمیشن پس‌زمینه: `opacity: 0 -> 1` با بلور نرم.
   - انیمیشن محتوای مودال: `scale: 0.95 -> 1, y: 8 -> 0` با فیزیک Spring.
3. **`StaggerContainer` و `StaggerItem`:**
   - نمایش روان اعضای لیست با تأخیر پلکانی (`staggerChildren: 0.05`).

---

### ۳. نگاشت ساختاری صفحه اصلی جدید (`frontend/src/app/page.tsx`)

```text
<main>
  ├── EditorialHeroSection (نامتقارن ۷/۵، بیانیه برهانی، نمونه صوت، کتاب فیزیکی)
  ├── ScholarlyChairSection (کرسی تدریس و نسب علمی - جایگزین آمار ۴تایی)
  ├── CuratedTreatisesSection (کاتالوگ پیوسته دوره‌ها با تب‌های فنری و پخش درون‌خطی)
  ├── StripePressShowcaseSection (ویترین لوکس کتب چاپی با جزئیات فیپا و کتابخوان)
  ├── LiveDisputationCircleSection (حلقه مباحثه اسکای‌روم با شمارنده صندلی)
  └── GlobalInteractiveModals (مودال کتابخوان ۳بعدی، سبد خرید، رزرو اسکای‌روم)
</main>
```

---

### ۴. استراتژی پرفورمنس و بهینه‌سازی بارگذاری
- تمام انیمیشن‌ها تنها بر روی خصوصیات شتاب‌یافته پردازنده گرافیکی (`transform` و `opacity`) اجرا می‌شوند تا هیچ بازچیدمان ناگهانی (Layout Thrashing) در مرورگر رخ ندهد.
- کامپوننت‌های فرعی و کتابخوان سه‌بعدی به صورت ناهمگام و بر اساس تقاضا (Dynamic Imports) لود می‌شوند.
