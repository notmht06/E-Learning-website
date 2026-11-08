# ممیزی فرانت‌اند «دارالحکمة» + فازبندی + دستور دقیق برای Antigravity

> روش ممیزی: Skill متن‌باز **unslop** (heydamir/unslop، مجوز CC BY 4.0) اجرا شد: ممیزی ← تعیین جهت ← پاس‌ها به ترتیب. چون پروژه یک سیستم طراحی واقعی دارد (`DESIGN.md`) و `AGENTS.md` تغییر پالت را ممنوع کرده، حالت اجرا **Polish** است: پالت، فونت و چیدمان برند حفظ شد و فقط نشانه‌های slop و نقض قوانین پروژه اصلاح شد.
>
> همهٔ اعداد با اسکریپت‌های داخل `frontend/tools/audit/` تولید شده‌اند و Antigravity می‌تواند همان‌ها را دوباره اجرا کند. هیچ عددی در این سند حدسی نیست.

---

## ۰. خلاصهٔ اجرایی

۱. فرانت‌اند ظاهراً «تمیز» است (تقریباً بدون ایموجی و glow)، اما **سه مشکل ساختاری** دارد که با چشم دیده نمی‌شوند:
   - **i18n سه‌تکه است:** کلیدهای `locales/*`، فال‌بک‌های `dict.x || 'فارسی'`، و تِرنری‌های درون‌خطی `currentLang === 'en' ? … : …`. نتیجه: در EN/AR متن فارسی نشت می‌کرد و TypeScript هیچ‌وقت هشدار نمی‌داد، چون نوع `Dictionary` با `Record<string,string>` باز بود.
   - **پنل ادمین تا حد زیادی «نمایشی» است:** کوپن، دسته‌بندی، سفارش‌ها، ثبت‌نام آنلاین و مسدودسازی نشست DRM فقط در `localStorage` مرورگر ادمین ذخیره می‌شوند و بک‌اند endpointی برایشان ندارد.
   - **DRM در سمت کلاینت بی‌اثر می‌شود:** پاسخ ۴۰۳ heartbeat نادیده گرفته می‌شود.
۲. **همین حالا اجرا و راستی‌آزمایی شد:** فاز ۰ و بخش بزرگی از فاز ۱ (جدول بخش ۲). نتیجه: `tsc` سبز، `next build` موفق (۲۱/۲۱ صفحه)، تست‌های بک‌اند سبز.
۳. **چیزی که برای Antigravity مانده:** فازهای ۱ (باقی‌ماندهٔ i18n)، ۲ تا ۶ در بخش ۴. هر فاز مستقل است و پرامپت آمادهٔ کپی دارد.

---

## ۱. جهت طراحی (مرحلهٔ Direction در unslop)

| | |
|---|---|
| **محصول** | پایگاه رسمی نشر آثار و دروس حجت‌الاسلام دکتر زنجیرزن حسینی؛ دروس صوتی (با DRM)، کتاب، مقاله، نقشهٔ مفاهیم. سه زبان: فارسی/عربی/انگلیسی. |
| **شخصیت** | آرام، دقیق، آرشیوی. نه «مدرن و تمیز». |
| **دنیا** | اتاق مطالعهٔ حوزوی: کاغذ شاموا، مرکب، چرم نسخهٔ خطی، برنج. (مطابق پالت `DESIGN.md`: `#FAF8F5` / `#0C0D0E` / `#8A532B` / `#C58B43`). |
| **دو لحظهٔ اصلی** | (۱) پخش‌کنندهٔ درس: موج صوتی + فهرست جلسات. (۲) کتاب سه‌بعدی. |
| **یک امضا** | برچسب آرشیوی `[ CRS-01 ]` با فونت mono. **باید فقط یک‌بار در هر کامپوننت بیاید** (الان تکرار زیاد است، فاز ۲). |
| **حالت** | Polish: پالت و تایپ‌فیس تغییر نکرد. |

---

## ۲. آنچه همین حالا انجام شد (قبل ← بعد)

| معیار | قبل | بعد |
|---|---:|---:|
| خط‌های فارسی هاردکد در UI | 2023 | **1056** |
| فال‌بک `dict.x \|\| 'متن'` | 658 | **1** (عمداً؛ بخش ۶) |
| کلید `dict.*` استفاده‌شده ولی بدون تعریف | 11 | **0** و نوع `Dictionary` حالا سخت‌گیر است |
| تِرنری سه‌زبانهٔ درون‌خطی (کاملاً رشته‌ای) | 216 | **38** |
| `transition-all` | 66 | 0 |
| متن زیر ۱۱px | 130 | 0 |
| `hover:scale-*` | 18 | 0 |
| `animate-bounce` | 7 | 0 (اکولایزر واقعی با `transform`) |
| `uppercase` + `tracking-wide*` | 57 | 3 |
| `font-black/extrabold`، `italic` | 4 | 0 |
| سرتیتر بزرگ‌تر از سقف DESIGN.md | 6 | 0 |
| کامپوننت مرده | 5 (~850 خط) | 0 |
| اعتبارنامهٔ دموی هاردکد | 3 نقطه | 0 |
| JSON-LD بدون escape (XSS ذخیره‌شده) | 7 نقطه | 0 |
| `@ts-ignore` | 9 | 4 (فاز ۴) |

### تغییرات مهم (فایل‌ها)

**باگ‌های واقعی رفع‌شده**
- ۱۱ کلید ناموجود (کارت کتاب، کارت دوره، ناوبری، سبد) افزوده شد. قبلاً در EN/AR فارسی می‌ماند و `catalog_pages_count` برای همهٔ کتاب‌ها **«۳۸۵ صفحه» جعلی** نشان می‌داد؛ حالا فقط وقتی `pages_count` واقعی باشد نمایش داده می‌شود (`MasterpieceBookCard.tsx`، `lib/data.ts`).
- `locales/types.ts`: `Dictionary = Record<TranslationKey, string>`. از این پس کلید غلط **خطای کامپایل** است. برای کلید پویا از `lookupDictionary(dict, key)` (در `LanguageContext.tsx`) استفاده کنید.
- سرریز افقی موبایل در صفحهٔ اصلی (گزارش X-Ray): `min-w-0` روی ستون‌های گرید `DiscoursePlayerSection` + اصلاح `ui/scroll-area.tsx` (Radix محتوا را `display: table` می‌کرد).
- `next.config.js`: Service Worker در حالت توسعه غیرفعال شد (علت ۴۰۴ فایل `swe-worker-development.js` و کش کهنه). چهار فایل تولیدشدهٔ PWA از مخزن خارج و ignore شدند.
- `ConceptGraphVisualizer`: نویسهٔ `➔` (در RTL جهت نادرست) ← آیکن `ArrowLeft` با `ltr:rotate-180`.

**امنیت**
- حذف `QuickRoleSelector` (شماره و رمز دمو داخل باندل صفحهٔ ورود، پیش‌فرض روشن)، مقدار اولیهٔ هاردکد فیلد تلفن در `useAuthForm`، و `login('09123456789','STUDENT')` در داشبورد.
- `lib/jsonLd.ts` (`serializeJsonLd`): `<` را escape می‌کند؛ ۷ نقطهٔ `<script type="application/ld+json">` به آن وصل شد. تست رفت‌وبرگشت انجام شد.

**Polish (unslop)**
- حرکت: `transition-all` ← فهرست خاصیت‌های مشخص؛ حذف hover-scale روی کارت/آیکن؛ اکولایزر پخش با `scaleY` و منحنی ease-out (`tailwind.config.js`).
- تایپ: حذف uppercase/tracking، حداقل ۱۱px، سرتیترها طبق `DESIGN.md` (H1 تا `text-2xl`، H2 برابر `sm:text-xl`).
- جزئیات: `Sparkles` (علامت «هر چیزِ AI») فقط برای دستیار هوش مصنوعی ماند؛ ۱۲ مورد دیگر با آیکن مرتبط جایگزین یا حذف شد. گرادیان سطح `BookDetailClient` تخت شد؛ دو `✦` تزئینی حذف شد.

### راستی‌آزمایی انجام‌شده
`npx tsc --noEmit` ← exit 0 · `npx next build` ← exit 0 (۲۱/۲۱ صفحه) · `pytest backend/tests` ← سبز (شامل parity سه‌زبانه) · ابزارهای ممیزی بعد از تغییر دوباره اجرا شدند.

> **صادقانه:** رندر بصری واقعی (اسکرین‌شات در موبایل/دسکتاپ، RTL) در این محیط ممکن نبود (مرورگر Playwright نصب نیست). تغییرات بصری با کامپایل، build و بازبینی کد راستی‌آزمایی شده‌اند. فاز ۲ دقیقاً برای همین است.

---

## ۳. یافته‌های کلیدی به ترتیب اهمیت

| # | یافته | شدت | فاز |
|---|---|---|---|
| 1 | heartbeat DRM: ۴۰۳ نادیده گرفته می‌شود؛ `user_id` از بدنهٔ درخواست (دادهٔ کلاینت) پذیرفته می‌شود | بالا | 6 |
| 2 | کوپن/دسته‌بندی/سفارش/ثبت‌نام/نشست DRM فقط در `localStorage`؛ بک‌اند endpoint ندارد | بالا | 5 |
| 3 | `AuthContext`: برای همه `purchasedBookIds=['book1']` و برای ادمین `course1..3` ساختگی | بالا | 5 |
| 4 | ۱۰۵۶ خط فارسی هاردکد باقی‌مانده + ۱۱۱۱ خط دادهٔ ایستا در `lib/data.ts` و دو فایل مشابه | متوسط | 1، 5 |
| 5 | کنتراست: `text-zinc-400` روی کاغذ شاموا ۲٫۴۲:۱ (حداقل AA برابر ۴٫۵:۱) و ۱۳۶ بار استفاده شده | متوسط | 3 |
| 6 | ۱۳ عنصر `div/span onClick` بدون نقش و کیبورد (CommandPalette ۵، checkout ۳، …) | متوسط | 3 |
| 7 | ESLint اصلاً نصب نیست؛ اسکریپت `npm run lint` شکست می‌خورد. CSP هم وجود ندارد | متوسط | 4، 6 |
| 8 | ۸ فایل بالای ۵۰۰ خط؛ ۹۳ مورد `any` (۲۴ تا در `apiClient.ts`)؛ دو کارت دورهٔ زنده ≈۷۰٪ کپی هم | متوسط | 4 |

---

## ۴. فازها

### قانون مشترک (این متن را اول هر جلسهٔ Antigravity بچسبانید)

```text
Read AGENTS.md, DESIGN.md and frontend/tools/audit/README.md before touching code.
Hard rules:
- No hardcoded Persian/Arabic/English UI text in components. Every string goes through
  frontend/src/locales/{fa,ar,en}.ts with the SAME key in all three files and the SAME order
  (backend/tests/test_i18n_parity.py enforces it). Static keys: dict.some_key. Runtime keys: lookupDictionary(dict, key).
- Do not change design-system colors/fonts (DESIGN.md). Use logical properties only (ms-/me-/ps-/pe-/start-/end-, text-start/end).
- Never swallow errors: no empty catch, no .catch(() => {}). Use console.debug/warn with context, or surface the error.
- Do not edit existing tests to make them pass. Do not modify existing alembic/versions files (add a NEW revision).
- Several files use CRLF line endings (locales/*.ts, types/index.ts, lib/data.ts, ...). Preserve each file's existing line endings.
- One logical change per commit. After EVERY step run:
    cd frontend && npx tsc --noEmit
    cd .. && python -m pytest backend/tests -q
  and at the end of the phase also: cd frontend && npx next build
- Report the before/after output of: python3 tools/audit/scan.py .
```

---

### فاز ۱ — تکمیل i18n (۱۰۵۶ خط باقی‌مانده)
**چرا اول:** بزرگ‌ترین نقض قانون پروژه است و بقیهٔ فازها (به‌خصوص کارت‌ها) روی آن سوار می‌شوند. ابزار آماده است، پس بیشترش مکانیکی است.

**گام‌ها**
1. `node tools/audit/extract_triples.cjs --dry` را بزنید. ۳۸ تِرنری باقی‌مانده چون یا `currentLang` در scope از `useLanguage()` نیامده یا subject برابر `lang` است. در هر کامپوننت `dict` و `currentLang` را از `useLanguage()` بگیرید، alias `lang` را حذف کنید، سپس همان دستور را **بدون** `--dry` اجرا کنید.
2. ۸۰ شرط زبانی دیگر (دوحالته، ترکیبی، غیررشته‌ای) را دستی به کلید ببرید. برای مقدارهای متغیر یک helper یک‌خطی `lib/formatMessage.ts` بسازید (`formatMessage(dict.some_key, { count })` با جایگذاری `{count}`) و در locale بنویسید `'{count} صفحه'`.
3. جدول‌های «زبان ← شیء» (`const labels = { fa:{…}, ar:{…}, en:{…} }`) را حذف و به کلید تبدیل کنید:
   `app/admin/page.tsx` (32)، `app/dashboard/page.tsx` (33)، `components/dashboard/tabs/DashboardOverviewConfig.ts` (57)، `components/admin/AdminCharts.tsx` (54)، `components/admin/tabs/AdminStatsTab.tsx` (15)، `components/home/MethodologyGuarantees.tsx` (24)، `components/home/WisdomStationsSheet.tsx` (24)، `components/home/RoadmapBannerSection.tsx` (16)، `components/home/HeroInstantSearch.tsx` (12)، `app/articles/[slug]/ArticleDetailClient.tsx` (14).
4. `lib/localization.ts` (134 خط) و `lib/subtitles.ts` (28 خط): محتوا را به locale منتقل کنید (یا اگر محتوای درس است، به فاز ۵) و ماژول را حذف کنید.
5. متن‌های JSX، `aria-label`/`placeholder`/`title`، `toast`/`confirm`/`alert`/`new Error('فارسی')`: فهرست کامل با `python3 tools/audit/persian_breakdown.py .`. برای `throw new Error` کد خطا پرتاب کنید و نگاشت به متن را در لایهٔ UI انجام دهید (`context/DataContext.tsx` ۱۲ مورد، `hooks/useAuthForm.ts`).
6. (اختیاری) ۱۶۳ کلید `ui_*` که کدمود از متن انگلیسی ساخته، به نام معنایی تغییر نام دهید (`ui_go_to_login` ← `auth_go_to_login`) با یک rename دسته‌ای.

**معیار پذیرش**
- `python3 tools/audit/scan.py .` ← `persian_hardcoded_ui` ≤ ۱۰ (فقط ثابت‌های رسمی در `lib/constants.ts` و فال‌بکی که در بخش ۶ توضیح داده شد).
- `node tools/audit/count_lang_ternaries.cjs` ← صفر.
- `python3 tools/audit/i18n_keys.py .` ← «NOT defined» صفر (به‌جز رشتهٔ مثال در کامنت `LanguageContext`).
- دستی: زبان را روی EN و AR بگذارید و `/`، `/courses`، `/books`، `/cart`، `/checkout`، `/dashboard`، `/admin` را باز کنید؛ هیچ حرف فارسی در EN نباید دیده شود.

**پرامپت**
```text
PHASE 1 – finish i18n. Goal: python3 tools/audit/scan.py . reports persian_hardcoded_ui <= 10.
Do, in this order, committing after each: (1) fix the 38 skipped trilingual ternaries (make `dict`/`currentLang`
available from useLanguage(), then run node tools/audit/extract_triples.cjs without --dry); (2) convert the ~80 remaining
language conditionals by hand, adding lib/formatMessage.ts for {placeholders}; (3) replace the per-language tables in
admin/page.tsx, dashboard/page.tsx, DashboardOverviewConfig.ts, AdminCharts.tsx, AdminStatsTab.tsx, MethodologyGuarantees.tsx,
WisdomStationsSheet.tsx, RoadmapBannerSection.tsx, HeroInstantSearch.tsx, ArticleDetailClient.tsx with locale keys;
(4) fold lib/localization.ts and lib/subtitles.ts into locales and delete them; (5) remove remaining JSX text, attribute text,
toast/confirm/alert strings and Error('…') messages (throw codes, map in UI). Always add each key to fa.ts, ar.ts and en.ts in
identical order (real Arabic and English translations, not copies). Do not touch tests. Finish with tsc, pytest, next build and paste
the scan.py before/after table.
```

---

### فاز ۲ — بصری و موبایل (نیازمند مرورگر)
**چرا:** این‌ها را فقط با رندر واقعی می‌شود راستی‌آزمایی کرد. اسکریپت X-Ray که `XRAY_REPORT.md` را ساخت دوباره اجرا شود.

**گام‌ها**
1. ویوپورت‌های ۳۷۵ و ۳۹۰ و ۷۶۸ برای **۱۱ صفحهٔ سرریزکنندهٔ** گزارش X-Ray (صفحهٔ اصلی در همین نسخه اصلاح شده). شرط معیار: `document.documentElement.scrollWidth <= window.innerWidth`. علل شناخته‌شده: فرزند گرید بدون `min-w-0`، `truncate` در flex بدون `min-w-0`، عرض ثابت `w-[Npx]` بزرگ‌تر از ویوپورت، محتوای `display: table` (قبلاً برای ScrollArea اصلاح شد).
2. **ادغام دو کارت دوره:** `components/catalog/MasterpieceCourseCard.tsx` و `components/ui/CourseCard.tsx` ≈۷۰٪ مشابه‌اند و هر دو `@ts-ignore` دارند. یک `CourseCard` با prop `variant` بسازید، نوع `discipline` را درست کنید (حذف ۴ `@ts-ignore`)، دیگری را حذف کنید.
3. **شلوغی کارت‌ها:** X-Ray یک کارت دوره را با **۱۱ اقدام و ۶ نشان** ثبت کرده. هر کارت حداکثر یک اقدام اصلی و دو نشان.
4. **امضا:** X-Ray ۲۱ هشدار «کدهای براکتی شلوغ‌کننده» (مثل `[STUDIO-48KHZ]`) ثبت کرده. برچسب آرشیوی `[…]` فقط یک‌بار در هر کامپوننت.
5. **۲ دکمه/لینک مرده** ثبت‌شده در X-Ray: یا کارکرد بدهید یا حذف کنید.
6. `animate-pulse` فقط روی اسکلت بارگذاری بماند (الان همین‌طور است). `backdrop-blur-2xl` در `FloatingNavigationPill` و `BookReader3D` را کم یا حذف کنید.
7. `tracking-tight` (۲۱ مورد) فقط روی عنوان‌های بزرگ لاتین؛ در RTL همان‌طور که `globals.css` تضمین کرده، بی‌اثر است.

**پذیرش:** صفر سرریز افقی در ۳ ویوپورت؛ اسکرین‌شات قبل/بعد پیوست شود؛ `@ts-ignore` در کارت‌ها صفر.

```text
PHASE 2 – visual/mobile (needs a real browser). Re-run the X-Ray Playwright script that produced frontend/XRAY_REPORT.md at 375, 390 and 768 px.
Fix every page where scrollWidth > innerWidth (typical causes: grid children without min-w-0, truncate without min-w-0 on the flex parent,
fixed w-[Npx], display:table wrappers). Merge components/catalog/MasterpieceCourseCard.tsx and components/ui/CourseCard.tsx into ONE CourseCard
with a `variant` prop, type `discipline` properly and remove the @ts-ignore comments. Reduce each course card to one primary action and at most two badges.
Use the archival tag [ XXX ] at most once per component. Wire or remove the dead buttons listed in the report. Keep the palette. Attach before/after screenshots
(light + dark, fa + en) for /, /courses, /books, /courses/[id]. Finish with tsc, pytest, next build.
```

---

### فاز ۳ — دسترس‌پذیری و RTL
**گام‌ها**
1. ۱۳ عنصر غیرمعنایی با کلیک: `components/shell/CommandPalette.tsx` (5)، `app/checkout/page.tsx` (3)، `components/learn/AudioPlayerIsland.tsx` (2)، `components/auth/AuthModal.tsx` (1)، `components/home/DiscoursePlayerSection.tsx` (1)، `components/learn/AudioUploaderModal.tsx` (1) ← `<button type="button">`؛ پس‌زمینهٔ مودال با Escape و `role="presentation"`. `CommandPalette` (555 خط) روی `ui/dialog.tsx` (Radix، دارای focus-trap) بنشیند.
2. کنتراست: `text-zinc-400` روی سطح روشن ← `text-zinc-500` (۴٫۵۶:۱ روی کاغذ شاموا). **کورکورانه جایگزین نکنید:** در پنل‌های همیشه‌تیره (`BookReader3D`، `LearningAccessGuard`) `zinc-400` درست است. با axe-core در Playwright روی صفحه‌های روشن و تیره بسنجید.
3. دکمه‌های فقط‌آیکن: `aria-label` از locale (کلید جدید، نه رشتهٔ هاردکد؛ مثلاً `aria-label="Mute toggle"` در `DiscoursePlayerSection`).
4. ویژگی‌های فیزیکی: `ui/dialog.tsx` (5)، `BentoHero.tsx` (4)، `AuthModal.tsx` (2)، `NavbarCoursesMegaMenu.tsx` (1) ← `start-/end-`. برای مرکزچین‌شدن `left-1/2 -translate-x-1/2` ← `start-1/2 -translate-x-1/2 rtl:translate-x-1/2`.
5. آیکن‌های جهت‌دار (`ArrowLeft/ChevronRight` برای «بعدی») با `rtl:`/`ltr:rotate-180` درست شوند؛ `prefers-reduced-motion` برای همهٔ انیمیشن‌های `motion/react`؛ `focus-visible` برای همهٔ کنترل‌ها.

```text
PHASE 3 – accessibility and RTL. Convert the 13 non-semantic click handlers (CommandPalette 5, checkout 3, AudioPlayerIsland 2, AuthModal 1,
DiscoursePlayerSection 1, AudioUploaderModal 1) to real <button type="button">; rebuild CommandPalette on ui/dialog.tsx so focus is trapped and Escape closes it.
Add localized aria-labels (new keys in all 3 locales) to every icon-only button. Replace remaining physical left/right/ml/mr/pl/pr/border-l/border-r with logical
properties (dialog.tsx, BentoHero.tsx, AuthModal.tsx, NavbarCoursesMegaMenu.tsx). Fix contrast: run axe-core via Playwright on / /courses /books /cart /login in light
and dark; text must reach 4.5:1 (text-zinc-400 on #FAF8F5 is 2.42:1 – use zinc-500 in light mode only; do NOT change always-dark panels).
Honour prefers-reduced-motion for every motion/react animation. Report axe violations before/after.
```

---

### فاز ۴ — نوع‌ها، ساختار و ابزار کیفیت
**گام‌ها**
1. **`any` (۹۳ مورد):** `services/apiClient.ts` (24) ← نوع پاسخ‌ها را از `/openapi.json` بک‌اند با `openapi-typescript` تولید و در `src/types/api.ts` نگه دارید (و `types/index.ts` دستی را به آن وصل کنید). بقیه: `context/DataContext.tsx` (10)، `app/search/page.tsx` (9)، `ScholarlyAIAssistant.tsx` (7)، `hooks/useAuthForm.ts` (6)، `lib/localization.ts` (6)، `BookReader3D.tsx` (5)، `app/verify/[code]/page.tsx` (3).
2. **فایل‌های بالای ۵۰۰ خط** (قانون پروژه): `app/checkout/page.tsx` 785 ← `ShippingForm`، `PaymentMethodPicker`، `OrderSummary`، هوک `useCheckout`؛ `AudioVideoPlayerEngine.tsx` 780 ← هوک‌های `useDrmHeartbeat`، `usePlaybackProgress`، `useMediaSession`؛ `BookReader3D.tsx` 742؛ `ScholarlyAIAssistant.tsx` 692؛ `DataContext.tsx` 626 (فاز ۵)؛ `app/courses/page.tsx` 601؛ `CommandPalette.tsx` 555؛ `AdminCoursesTab.tsx` 506. هر تقسیم بدون تغییر رفتار.
3. **ESLint:** نصب نیست و `npm run lint` شکست می‌خورد. `eslint` + `eslint-config-next` + قانون `react-hooks/exhaustive-deps` + `no-restricted-syntax` برای `catch {}` خالی اضافه کنید و در CI اجرا کنید.
4. فایل‌های بشکهٔ بی‌مصرف (`components/index.ts`، `context/index.ts`، `hooks/index.ts`، `lib/index.ts`، `services/index.ts`) و shim‌های ۳خطی (`AdminCharts`، `CommandPalette`، `AdminStatsTab` در ریشهٔ components) را حذف یا استفاده کنید. `python3 tools/audit/orphans.py .` فهرست را می‌دهد (`middleware.ts` مثبت کاذب است).

```text
PHASE 4 – types, structure, tooling. (1) Generate API types from the backend OpenAPI schema (openapi-typescript) into src/types/api.ts and remove every
`any` in services/apiClient.ts, DataContext.tsx, search/page.tsx, ScholarlyAIAssistant.tsx, useAuthForm.ts, lib/localization.ts, BookReader3D.tsx, verify/[code]/page.tsx
(scan.py any_type must reach 0). (2) Split the 8 files over 500 lines (checkout/page.tsx, AudioVideoPlayerEngine.tsx, BookReader3D.tsx, ScholarlyAIAssistant.tsx,
courses/page.tsx, CommandPalette.tsx, AdminCoursesTab.tsx; DataContext is Phase 5) into components + hooks with NO behaviour change; each resulting component <= 500 lines.
(3) Install and configure ESLint (eslint-config-next, react-hooks/exhaustive-deps, ban empty catch) so `npm run lint` passes, and run it in CI.
(4) Delete unused barrel/shim files reported by tools/audit/orphans.py. Verify with tsc, pytest, next build.
```

---

### فاز ۵ — حذف state محلی/ساختگی و اتصال کامل به بک‌اند (فول‌استک)
**مشکل:** `context/DataContext.tsx` از `lib/data.ts` (۲۱۱۱ خط دادهٔ ساختگی) شروع می‌کند و در `localStorage` می‌نویسد: `zan_courses`، `zan_books`، `zan_orders`، `zan_coupons`، `zan_categories`، `zan_enrolled_online`. بک‌اند فقط این endpointهای ادمین را دارد: آمار، ساخت/ویرایش/حذف دوره، جلسات، ویرایش کتاب، وضعیت سفارش، آپلود؛ و برای کوپن فقط `validate` و `list`.

**بک‌اند (جدید، همه با `Depends(get_current_admin)`، تست برای هر کدام: ۴۰۱/۴۰۳/۲۰۰/۴۲۲):**

| متد و مسیر | کار |
|---|---|
| `GET /admin/orders` | فهرست سفارش‌ها با صفحه‌بندی و فیلتر وضعیت |
| `POST/PATCH/DELETE /admin/coupons` | ساخت، فعال/غیرفعال، حذف کوپن (اعتبارسنجی درصد و تاریخ) |
| `GET/POST/PUT/DELETE /admin/categories` | CRUD دسته‌بندی |
| `POST/DELETE /admin/books` | ساخت و حذف کتاب (الان فقط ویرایش) |
| `GET /admin/stream-sessions`، `DELETE /admin/stream-sessions/{id}` | فهرست و ابطال نشست‌های DRM همهٔ کاربران (به `drm_service` وصل شود) |
| `GET /admin/audit-log` | لاگ ممیزی ثبت‌شده در سرور |

جدول‌های جدید ← **یک migration Alembic جدید**؛ فایل‌های قبلی را دست نزنید.

**فرانت‌اند:** `zan_*` را از `localStorage` بردارید (فقط تم، زبان و سرعت پخش بماند)؛ داده را از `apiClient` بخوانید؛ `lib/data.ts`/`roadmapData.ts`/`conceptGraphData.ts` را حذف یا به seed بک‌اند منتقل کنید. در `AuthContext.mapUserResponseToProfile` فهرست‌های ساختگی `course1..3` و `['book1']` را حذف کنید؛ `MasterpieceBookCard` فرمت کتاب را با `book.id === 'book1'` تعیین می‌کند ← از فیلد `format` بک‌اند بخواند؛ `dashboard/page.tsx` مقدار پیش‌فرض `selectedBookId='book1'` دارد.

```text
PHASE 5 – remove local-only/mock state and wire the admin panel to the real backend (full-stack).
Backend first (new tests for each endpoint: 401 anonymous, 403 student, 200 admin, 422 invalid body; follow backend/tests/conftest.py patterns; add ONE new Alembic
revision, never edit existing ones): GET /admin/orders (paginated, status filter); POST/PATCH/DELETE /admin/coupons; GET/POST/PUT/DELETE /admin/categories;
POST/DELETE /admin/books; GET /admin/stream-sessions and DELETE /admin/stream-sessions/{id} (revokes via drm_service); GET /admin/audit-log.
Then frontend: delete the localStorage keys zan_courses, zan_books, zan_orders, zan_coupons, zan_categories, zan_enrolled_online from context/DataContext.tsx (keep only theme,
language and playback speed in localStorage), load/mutate through apiClient (extend apiClient + types), remove the seeded lib/data.ts, roadmapData.ts, conceptGraphData.ts from
production paths (move content to backend seed). In AuthContext.mapUserResponseToProfile remove the fake ['course1','course2','course3'] and ['book1'] defaults.
MasterpieceBookCard must read book.format from the API instead of comparing book.id with 'book1'..'book4'. Admin success toasts must appear only after the server confirms.
Verify with pytest (all), tsc, next build and a manual create-coupon -> validate-as-student round trip.
```

---

### فاز ۶ — امنیت، DRM و پایداری
**گام‌ها**
1. **heartbeat (بالاترین اولویت):** بک‌اند: `user_id` را از JWT/توکن DRM بگیرد، نه از بدنهٔ `DRMHeartbeatRequest`؛ پیام خطای `403` عمومی باشد (الان `detail=str(e)` متن داخلی را می‌دهد). فرانت‌اند (`AudioVideoPlayerEngine.tsx` حدود خط ۲۱۸): در پاسخ ۴۰۳ پخش را متوقف، پیام محلی نمایش بده و توکن تازه بخواه؛ `'guest-scholar'` حذف شود.
2. `BookReader3D` مقدار `pageData.r_body` را با `dangerouslySetInnerHTML` می‌نویسد. فعلاً منبعش دادهٔ ایستاست (کم‌ریسک)، ولی بعد از فاز ۵ از API می‌آید ← حتماً با DOMPurify پاک‌سازی شود.
3. `next.config.js`: هدرهای `X-Frame-Options`، `nosniff`، `Referrer-Policy` هست؛ **CSP نیست.** ابتدا `Content-Security-Policy-Report-Only` با nonce (اسکریپت درون‌خطی تم در `layout.tsx`) و بعد اجباری. هدر `Strict-Transport-Security` و `Permissions-Policy` اضافه شود.
4. `apiClient.ts`: اگر `NEXT_PUBLIC_API_URL` در build پروداکشن خالی باشد به `http://127.0.0.1:8000` برمی‌گردد (بی‌صدا). در production باید build را شکست بدهد.
5. اگر پچ SRE قبلی (`sre-audit-changes.patch`: تلمتری، `/observability/*`، CI) هنوز در این شاخه نیست، اعمال شود.
6. CI: `tsc`، `next build`، `eslint`، `pytest` روی هر PR.

```text
PHASE 6 – security/DRM/reliability. (1) DRM heartbeat: backend must derive the user from the authenticated JWT/DRM token (never from the request body) and return a
generic 403 message (no str(e)); frontend (AudioVideoPlayerEngine.tsx pushProgressToServer) must, on 403, pause playback, show a localized message (new keys in all 3 locales)
and request a fresh token; remove the 'guest-scholar' fallback. Add tests for expired token, wrong user and concurrent-session cases. (2) Sanitize BookReader3D
dangerouslySetInnerHTML with DOMPurify. (3) Add Content-Security-Policy-Report-Only (nonce for the inline theme script in layout.tsx), Strict-Transport-Security and Permissions-Policy
in next.config.js; flip to enforcing after a clean report. (4) Make `next build` fail when NEXT_PUBLIC_API_URL is empty in production. (5) Add a GitHub Actions workflow running
pytest, tsc, eslint and next build on every PR. Report each change with the test that proves it.
```

---

## ۵. ترتیب پیشنهادی و تخمین بار کار

| ترتیب | فاز | ماهیت | ریسک | سنگینی برای Antigravity |
|---|---|---|---|---|
| 1 | ۶ (فقط گام ۱) | امنیتی، کوچک | کم | سبک |
| 2 | ۱ | مکانیکی با ابزار آماده | کم | متوسط |
| 3 | ۳ | کد + axe | متوسط | متوسط |
| 4 | ۲ | نیازمند مرورگر | متوسط | متوسط |
| 5 | ۴ | refactor بزرگ، بدون تغییر رفتار | متوسط | سنگین |
| 6 | ۵ | فول‌استک، مهاجرت دیتابیس | **بالا** | **خیلی سنگین**؛ حتماً در چند جلسه |
| 7 | ۶ (بقیه) | سخت‌سازی | کم‌متوسط | متوسط |

اگر به سقف رسیدید: هر فاز را در **جلسهٔ جدید** با «قانون مشترک» اول و پرامپت همان فاز بدهید؛ فازها از هم مستقل‌اند، به‌جز اینکه فاز ۵ باید قبل از شکستن `DataContext` در فاز ۴ انجام شود.

---

## ۶. نکات و تعارض‌هایی که باید بدانید

- **تست متنی در برابر قانون locale:** `backend/tests/test_phase8_seo_and_articles.py` وجود لیترال «حجت الاسلام دکتر زنجیرزن حسینی» را در `app/articles/page.tsx` می‌خواهد. به همین دلیل فقط همان یک فال‌بک (`articles_home_desc`) را نگه داشتم. تست را عوض نکردم (قانون پروژه)؛ پیشنهاد می‌کنم **شما** تست را عوض کنید تا نام را در `lib/constants.ts` یا `locales/fa.ts` بررسی کند و بعد فال‌بک حذف شود.
- **مثبت‌های کاذب ابزار:** `console_log` (۳۶): همگی `console.debug` داخل `catch` هستند، یعنی روش درست «بلعیده‌نشدن» خطا طبق AGENTS.md؛ حذفشان نکنید. `gradient`: گرادیان‌های تیرهٔ هم‌هیو روی جلد کارت دوره، رمزگذاری رنگی رشته‌هاست و عمداً ماند. رنگ‌های قرمز/سبز/کهربایی فقط برای معنا (خطا/موفقیت/هشدار) هستند؛ در صورت تمایل می‌توان توکن معنایی (`danger/success/warning`) به سیستم طراحی افزود، که تغییر `DESIGN.md` است و تصمیم شماست.
- **نام کلیدهای ساخته‌شده:** ۱۶۳ کلید `ui_*` از متن انگلیسی تولید شد؛ کار می‌کنند ولی بهتر است معنایی شوند (فاز ۱ گام ۶).
- **`NEXT_PUBLIC_DEMO_MODE`** حالا در کد مصرف نمی‌شود؛ از `Dockerfile` و `docker-compose.prod.yml` می‌توان حذفش کرد.
- اعتبار روش ممیزی: unslop، © heydamir، CC BY 4.0 (https://github.com/heydamir/unslop).
