# BRIEFING — 2026-10-07T04:22:00Z

## Mission
Investigate Enterprise i18n Architecture for the Next.js Frontend (Requirement R2), auditing current language handling and dictionaries, and designing a modular, type-safe i18n architecture preserving all translations and adhering to strict writing and scholar identity standards.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_i18n_1
- Original parent: 6880bd69-bbdb-447f-a7a1-e24c8f6356bc
- Milestone: survey_i18n

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Respect official scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی»
- Respect Persian writing rules: no «می‌باشد», proper ZWNJ, Persian numbers, no robotic clichés
- Zero loss of existing translation keys
- Type-safety: compile-time check across fa, en, ar dictionaries

## Current Parent
- Conversation ID: 6880bd69-bbdb-447f-a7a1-e24c8f6356bc
- Updated: 2026-10-07T04:22:00Z

## Investigation State
- **Explored paths**:
  - `frontend/src/context/LanguageContext.tsx`
  - `frontend/src/lib/data.ts` (lines 2087-4044)
  - `frontend/src/lib/localization.ts`
  - `frontend/src/app/layout.tsx` & `globals.css`
  - 50+ components consuming translations (`Navbar.tsx`, `BentoHero.tsx`, `CartModal.tsx`, `BookReader3D.tsx`, `ShellAuthGate.tsx`, `AdminStatsTab.tsx`, `DashboardOverviewTab.tsx`, `OngoingCoursesTable.tsx`, `admin/page.tsx`, `dashboard/page.tsx`, `ScholarlyAIAssistant.tsx`)
  - `audit_pipeline.py` & rule constraints
- **Key findings**:
  - ~611 keys in `fa`, `ar`, `en` in `data.ts` with 100% line symmetry but zero compile-time type-safety.
  - Component-local translation objects created in 4 components due to monolithic `data.ts`.
  - Missing keys found in `data.ts` relying on fallbacks (`nav_home_return`, `chart_business_intel`, tabular sub-labels).
  - 100% adherence to scholar identity «حجت الاسلام دکتر زنجیر زن حسینی» and persian-writing rules.
- **Unexplored areas**: None (investigation complete).

## Key Decisions Made
- Designed dedicated `frontend/src/locales/` directory (`types.ts`, `fa.ts`, `ar.ts`, `en.ts`, `index.ts`).
- Single source of truth typing: `TranslationKey = keyof typeof fa; Dictionary = Record<TranslationKey, string>`.
- Preserved backward compatibility by re-exporting `i18nDict` and `SupportedLang` in `lib/data.ts`.
- Retained full dual support for `dict.<key>` and `t(key, fallback)`.

## Artifact Index
- DISPATCH.md — Initial dispatch instructions
- BRIEFING.md — Persistent context & state
- progress.md — Liveness heartbeat & task tracking
- report.md — Comprehensive exploration report with architectural specifications
- handoff.md — 5-component handoff report for builder agent
