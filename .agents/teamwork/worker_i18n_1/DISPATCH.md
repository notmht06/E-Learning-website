## 2026-10-07T04:29:36Z
You are a Worker subagent for Milestone 2: Enterprise i18n Architecture.
Your identity: worker_i18n_1
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_i18n_1

MANDATORY FIRST STEP:
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (Follow-up — 2026-10-07T03:59:53Z).
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_i18n_1\report.md and handoff.md.
Read e:\personal\philosophy_zanjirzan_app\.agents\rules\persian-writing.md and scholar-identity.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SCOPE & EXCLUSIVE FILE OWNERSHIP:
You own:
- frontend/src/locales/ (create directory and files: types.ts, fa.ts, ar.ts, en.ts, index.ts)
- frontend/src/lib/data.ts (extract i18nDict out, replace with re-export from '@/locales', reduce ~2000 lines while keeping all data items intact)
- frontend/src/context/LanguageContext.tsx (strongly typed dict and overloaded t function)
- frontend/src/components/shell/ShellAuthGate.tsx (refactor to consume centralized dictionary)
- frontend/src/components/admin/tabs/AdminStatsTab.tsx (refactor to consume centralized dictionary)
- frontend/src/components/dashboard/tabs/DashboardOverviewTab.tsx (refactor to consume centralized dictionary)
- frontend/src/components/dashboard/shared/OngoingCoursesTable.tsx (refactor to consume centralized dictionary)

TASKS:
1. Create `frontend/src/locales/`:
   - `types.ts`:
     ```typescript
     import type { fa } from './fa';
     export type SupportedLang = 'fa' | 'ar' | 'en';
     export type TranslationKey = keyof typeof fa;
     export type Dictionary = Record<TranslationKey, string>;
     ```
   - `fa.ts`:
     Persian dictionary containing all ~611 existing keys from `frontend/src/lib/data.ts` (lines 2088-2739) plus the consolidated keys from local component dicts (`nav_home_return`, `chart_business_intel`, tabular headers, auth gate texts).
     Strictly follow `.agents/rules/persian-writing.md` (no «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals ۰-۹, «گیومه») and scholar identity rule («حجت الاسلام دکتر زنجیر زن حسینی»).
   - `ar.ts`:
     Arabic dictionary strictly typed as `export const ar: Dictionary = { ... };` with 100% key parity with `fa.ts`.
   - `en.ts`:
     English dictionary strictly typed as `export const en: Dictionary = { ... };` with 100% key parity with `fa.ts`.
   - `index.ts`:
     Re-export `fa`, `ar`, `en`, types, and:
     `export const i18nDict: Record<SupportedLang, Dictionary> = { fa, ar, en };`
2. Update `frontend/src/lib/data.ts`:
   - Replace the ~2000-line embedded `i18nDict` block with:
     `export { i18nDict, type SupportedLang } from '@/locales';`
   - Keep all data exports (`courses`, `books`, `articles`, etc.) completely intact so no other modules break.
3. Update `frontend/src/context/LanguageContext.tsx`:
   - Import `Dictionary`, `TranslationKey`, `SupportedLang` from `@/locales`.
   - Update `LanguageContextType` to provide strongly typed `dict: Dictionary` and `t: (key: TranslationKey | string, fallback?: string) => string;`.
4. Consolidate and clean up local component dicts in `ShellAuthGate.tsx`, `AdminStatsTab.tsx`, `DashboardOverviewTab.tsx`, and `OngoingCoursesTable.tsx` to use `dict.<key>` or `t('<key>')`.
5. Verification:
   - Run `npx tsc --noEmit` in `frontend/` to confirm strict TypeScript type checking catches no errors.
   - Run `npm run build` in `frontend/` to ensure production build succeeds with 0 errors.
   - Run `backend\.venv\Scripts\python.exe audit_pipeline.py` to ensure 100/100 score (all 8 gates pass).

Deliver your detailed handoff report to:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_i18n_1\handoff.md

When finished, send a message to orchestrator_2 (parent) with a concise summary and confirmation of build & audit pass.
