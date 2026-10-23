# Handoff Report: Enterprise i18n Architecture Survey
**Agent**: `explorer_survey_i18n_1`  
**To**: `orchestrator_2` / Builder subagent  
**Date**: 2026-10-07  
**Working Directory**: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_i18n_1`

---

## 1. Observation
1. **Location and size of `i18nDict` in `frontend/src/lib/data.ts`**:
   - `frontend/src/lib/data.ts` lines 2087 to 4044 (out of 4045 total lines) define `i18nDict: Record<SupportedLang, Record<string, string>>`.
   - Line 2088: `fa: { ... }` (lines 2088-2739, 652 lines).
   - Line 2740: `ar: { ... }` (lines 2740-3391, 652 lines).
   - Line 3392: `en: { ... }` (lines 3392-4043, 652 lines).
   - Exactly ~611 keys in each language block, perfectly aligned line-by-line.
2. **Weak typing in `frontend/src/context/LanguageContext.tsx`**:
   - Line 9: `dict: Record<string, string>;`
   - Line 13: `t: (key: string, fallback?: string) => string;`
   - Line 47: `const dict = i18nDict[currentLang] || i18nDict['fa'];`
   - Line 50: `const t = (key: string, fallback?: string): string => dict[key] || fallback || key;`
   - Language preferences are persisted in `localStorage` under key `'zan_lang'`.
   - Direction `'rtl'` or `'ltr'` is set on `document.documentElement.dir`.
3. **Consumers across `frontend/src/`**:
   - Over 50 files import `useLanguage` from `@/context/LanguageContext`.
   - Extensive usage of `dict.key` (~280+ instances, e.g. `dict.hero_badge`, `dict.nav_home`, `dict.cart_title`).
   - Several components use `t('key', fallback)` (e.g. `app/dashboard/page.tsx:123`, `app/admin/page.tsx:124`, `DashboardOverviewTab.tsx:96`, `AdminStatsTab.tsx:114`, `OngoingCoursesTable.tsx:83`).
   - `BookReader3D.tsx:28,65` directly imports `i18nDict` from `@/lib/data` instead of using the context.
4. **Ad-hoc component-local translation dictionaries**:
   - `frontend/src/components/shell/ShellAuthGate.tsx:17-48`: defines `translations: Record<'fa' | 'ar' | 'en', Record<string, string>>` with 8 keys.
   - `frontend/src/components/dashboard/AdminStatsTab.tsx:18-91`: defines `adminStatsText: Record<'fa' | 'ar' | 'en', Record<string, string>>` with 21 keys.
   - `frontend/src/components/dashboard/DashboardOverviewTab.tsx:20-78`: defines `overviewText: Record<'fa' | 'ar' | 'en', Record<string, string>>` with 19 keys.
   - `frontend/src/components/dashboard/shared/OngoingCoursesTable.tsx:26-63`: defines `tableTranslations: Record<'fa' | 'ar' | 'en', Record<string, string>>` with 11 keys.
   - `frontend/src/app/admin/page.tsx:38-90` & `frontend/src/app/dashboard/page.tsx:41-90`: define redundant `tabLocalization` and `navLabels`.
5. **Missing keys in `data.ts` relying on fallbacks**:
   - `nav_home_return` (called in `ShellAuthGate.tsx:74`).
   - `chart_business_intel` (called in `AdminStatsTab.tsx:191`).
   - Sub-labels in `AdminStatsTab` (`audit_title`, `audit_sub`, `th_id`, `th_user`, `th_details`, `th_time`, `toman_unit`).
6. **Compliance check with project quality rules**:
   - Scholar identity rule: The scholar name in `data.ts` (lines 221, 246, 271, 373, 2092, 2093, etc.) is strictly written as `«حجت الاسلام دکتر زنجیر زن حسینی»`.
   - Persian writing rule: Zero occurrences of `می‌باشد`, `گردید` (as copula), or `لازم به ذکر است`.
   - `audit_pipeline.py` currently checks `ROOT_DIR / "frontend/src/lib/data.ts"` in `check_scholar_identity()` and scans `frontend/src/lib`, `app`, `components`, `context` in `check_persian_writing_quality()`.

---

## 2. Logic Chain
1. *From Observation 1 & 2*: `i18nDict` in `lib/data.ts` is typed as `Record<string, string>` and bloats `data.ts` by nearly 2000 lines. Because TypeScript cannot infer valid keys from `Record<string, string>`, developers have no IDE autocomplete, missing keys in `ar` or `en` are silent runtime bugs, and typos cannot be caught at compile time.
2. *From Observation 4 & 5*: Because `data.ts` was an unwieldy 4045-line file, developers resorted to writing component-local translation dictionaries, leading to fragmented strings and missing keys in the global dictionary (`nav_home_return`, `chart_business_intel`).
3. *From Observation 3*: Because both `dict.key` and `t('key')` are heavily used across 50+ files, any new enterprise architecture must support BOTH `dict.key` (with strongly typed autocomplete) and `t(key)` (with overload for legacy/dynamic keys) to avoid breaking existing code.
4. *From Observation 1 & 6*: Extracting `i18nDict` out of `lib/data.ts` into a dedicated `frontend/src/locales/` folder (`fa.ts`, `ar.ts`, `en.ts`, `types.ts`, `index.ts`), while re-exporting `i18nDict` and `SupportedLang` from `data.ts`, achieves:
   - Zero breaking changes for legacy imports.
   - 48% reduction in `data.ts` file size.
   - 100% compile-time type-safety (`export const ar: Dictionary = { ... }` guarantees missing keys cause TypeScript errors).
   - Clean architecture separation.
   - Continued 100/100 compliance with `audit_pipeline.py`.

---

## 3. Caveats
1. **Dynamic Backend Messages**: Messages coming from FastAPI backend endpoints (e.g. API error messages from `AppException`) are handled by backend JSON responses; this survey focused exclusively on frontend static and UI localization.
2. **Entity-level Localization**: Database models in `data.ts` (`Book`, `Course`, `ScholarlyArticle`) with `title_fa`, `title_ar`, `title_en` are properly handled by `frontend/src/lib/localization.ts` (`getLocalized`). These were reviewed and confirmed to remain separate from the UI dictionary.
3. **SSR Hydration Direction**: In Next.js client navigation, `LanguageContext` sets `document.documentElement.dir` in `useEffect`. If SSR HTML initially renders `dir="rtl"`, changing to `'en'` updates on mount. This is the existing and working behavior.

---

## 4. Conclusion
The enterprise i18n architecture is fully surveyed, diagnosed, and designed. The recommended plan is ready for execution by the builder agent:
1. Create `frontend/src/locales/` containing `types.ts`, `fa.ts`, `ar.ts`, `en.ts`, and `index.ts`.
2. Derive `TranslationKey = keyof typeof fa` and enforce `Dictionary = Record<TranslationKey, string>` on `ar.ts` and `en.ts` to ensure 100% compile-time safety.
3. Include the ~611 existing keys plus the missing keys (`nav_home_return`, `chart_business_intel`, tabular sub-labels).
4. Re-export `i18nDict` and `SupportedLang` in `frontend/src/lib/data.ts` to maintain zero-breaking backwards compatibility.
5. Upgrade `frontend/src/context/LanguageContext.tsx` to provide typed `dict: Dictionary` and overloaded `t(key)`.
6. Refactor component-local dictionaries (`ShellAuthGate`, `AdminStatsTab`, `DashboardOverviewTab`, `OngoingCoursesTable`) to consume the centralized dictionary.

Detailed specifications and code blueprints are available in:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_i18n_1\report.md`

---

## 5. Verification Method
1. **Type-checking verification**:
   ```bash
   cd frontend
   npx tsc --noEmit
   ```
   *Expected outcome*: 0 errors. If a key is intentionally removed from `ar.ts` or `en.ts`, TypeScript must flag a compilation error pointing to the missing property.
2. **Next.js Production Build**:
   ```bash
   cd frontend
   npm run build
   ```
   *Expected outcome*: Compiles with zero errors.
3. **Anti-slop & Quality Pipeline**:
   ```bash
   python audit_pipeline.py
   ```
   *Expected outcome*: Passes with a 100/100 score across all 8 quality gates.
