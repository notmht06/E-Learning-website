# Plan: Next.js Frontend PWA & Enterprise i18n / Clean Architecture Restructure

## Objective
Restructure the Next.js frontend into a modern PWA with strongly-typed enterprise i18n architecture and clean folder organization, strictly adhering to scholar identity, anti-slop design rules, and 100/100 audit pipeline score.

## Milestones & Strategy

### Phase 0: Survey & Scope Mapping
- Spawn 3 parallel Explorers:
  1. `explorer_survey_pwa`: Examine Next.js configuration, React version, package.json dependencies, sw.js / manifest requirements, compatibility of `@ducanh2912/next-pwa` vs `next-pwa` with Next.js 15 App Router.
  2. `explorer_survey_i18n`: Examine `src/context/LanguageContext.tsx`, `src/lib/data.ts` (the 611 keys), all consumers of `useLanguage` / translations across the frontend, and design a strongly-typed dictionary system (`fa.ts`, `en.ts`, `ar.ts` in `src/messages/` or `src/locales/`).
  3. `explorer_survey_arch_tests`: Examine `audit_pipeline.py`, backend/frontend tests, existing file tree in `frontend/src`, anti-slop rules, and establish target clean architecture folder structure and file migration plan.

### Milestone 1: PWA Foundation (M1)
- Install/configure compatible Next.js PWA package (e.g. `@ducanh2912/next-pwa` or `@serwist/next` or `next-pwa`).
- Configure `manifest.json` with appropriate icons, theme colors (`#0C0D0E`, `#FAF8F5`), start_url, display mode.
- Register service worker properly for Next.js App Router.
- Verify `sw.js` and `workbox-*.js` generate in `public/` upon build.

### Milestone 2: Enterprise i18n Architecture (M2)
- Create `frontend/src/locales/` or `frontend/src/messages/`.
- Create strongly typed dictionaries `fa.ts`, `en.ts`, `ar.ts` with strict TypeScript key enforcement (e.g., `type TranslationKey = keyof typeof fa;` and `const en: Record<TranslationKey, string> = ...`).
- Port all existing dictionary entries (ensuring zero loss of keys).
- Refactor `LanguageContext.tsx` or localization helper to consume the new typed dictionaries with autocompletion.

### Milestone 3: Clean Architecture Restructure (M3)
- Reorganize `frontend/src` into standard clean architecture layers:
  - `components/` (ui primitives, layout/shell, feature components)
  - `hooks/`
  - `context/` or `contexts/`
  - `domain/` or `services/` (domain models, API clients, business logic)
  - `lib/` (utilities, helpers)
  - `locales/` (typed i18n dictionaries)
- Update all page and component imports cleanly.
- Verify zero regression in component behavior, layout, or design tokens.

### Milestone 4: Final Verification & Audit Hardening (M4)
- Run `npm run build` (zero TypeScript and ESLint errors).
- Run `python audit_pipeline.py` (100/100 score).
- Verification by Reviewers, Challengers, and Forensic Auditor.
- Submit completion report to Sentinel.
