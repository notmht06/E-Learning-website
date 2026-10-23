# BRIEFING — 2026-09-30T04:52:00Z

## Mission
Implement Milestone 1: Catalog Views (/courses, /books) & Shared Components for the Philosophy Zanjirzan App redesign.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_catalog
- Original parent: 7b6996d4-9ec4-4687-95d4-6e07f99d4a2e
- Milestone: Milestone 1: Catalog Views (/courses, /books) & Shared Components

## 🔒 Key Constraints
- EXCLUSIVE WRITE OWNERSHIP:
  - frontend/src/components/ui/CategoryTabStrip.tsx
  - frontend/src/components/ui/CourseCard.tsx
  - frontend/src/components/ui/CompactHorizontalCard.tsx
  - frontend/src/components/ui/BookCard.tsx
  - frontend/src/hooks/useBookmarks.ts
  - frontend/src/app/courses/page.tsx
  - frontend/src/app/books/page.tsx
  - frontend/src/app/courses/[id]/page.tsx
  - frontend/src/app/books/[id]/page.tsx
  DO NOT modify any other files.
- Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» (exact, non-truncated, invariant).
- Anti-AI-slop: ZERO `blur-3xl`, ZERO `bg-clip-text text-transparent`, ZERO `animate-pulse`.
- Design tokens: Deep obsidian `#0C0D0E`, warm paper `#FAF8F5`, terracotta/copper accent `#8A532B` / `#C58B43`, crisp 1px borders, Dana Persian typography (`DanaFaNum`), 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
- Persian Writing: Zero bureaucratic verbs («می‌باشد / می‌باشند», «می‌گردد / گردید»), proper ZWNJ, Persian quotes (« »), Persian digits in UI.
- Spacing scale: Strict 4px spacing scale (`p-1` through `p-8`), no non-scale classes (e.g., `p-3.5`, `py-3.5`).
- Headings: `text-2xl` ceiling.
- Tri-lingual support: Persian, Arabic, English via `useLanguage()` with robust fallbacks.

## Current Parent
- Conversation ID: 7b6996d4-9ec4-4687-95d4-6e07f99d4a2e
- Updated: 2026-09-30T04:52:00Z

## Task Summary
- **What to build**:
  1. `CategoryTabStrip.tsx` with minimal underlines.
  2. `CourseCard.tsx` with 16:9 media preview, subtle corner price pill, backdrop-blur-sm bookmark button, star rating, duration, sessions count, circular scholar avatar (`/images/ostad_zanjirzan.jpg`), and official credentials.
  3. `CompactHorizontalCard.tsx` for secondary featured row with thin line separators.
  4. `BookCard.tsx` with visual cover thumbnail preview, badges, author credentials, 3D reader trigger.
  5. `useBookmarks.ts` for bookmark persistence in localStorage.
  6. Refactor `courses/page.tsx` and `books/page.tsx` with tabs, cards, featured row, and multilingual strings.
  7. Refactor `courses/[id]/page.tsx` and `books/[id]/page.tsx` with 4px spacing scale and circular avatar credentials.
- **Success criteria**:
  - `npm run build` readiness with 0 errors.
  - Full compliance with `audit_pipeline.py` rules (Scholar Identity, Anti-Slop, Persian Writing, 4px Spacing).
  - Verification of all components and pages against constraints.

## Change Tracker
- **Files modified/created**:
  1. `frontend/src/hooks/useBookmarks.ts` — LocalStorage-backed bookmarking hook with event synchronization.
  2. `frontend/src/components/ui/CategoryTabStrip.tsx` — Active category tab strip with minimal underlines and responsive scroll.
  3. `frontend/src/components/ui/CourseCard.tsx` — Redesigned course card with 16:9 media preview, subtle price pill, backdrop-blur-sm bookmark button, star rating, circular avatar, and official credentials.
  4. `frontend/src/components/ui/CompactHorizontalCard.tsx` — Compact horizontal card for secondary Featured row separated by thin lines.
  5. `frontend/src/components/ui/BookCard.tsx` — Elegant book card with hardcover styling, price pill, backdrop-blur-sm bookmark button, author credentials, and 3D reader action.
  6. `frontend/src/app/courses/page.tsx` — Refactored with `CategoryTabStrip`, `CourseCard` grid, secondary Featured row, and dynamic i18n support.
  7. `frontend/src/app/books/page.tsx` — Refactored with `CategoryTabStrip`, `BookCard` grid, secondary Featured row, and dynamic i18n support.
  8. `frontend/src/app/courses/[id]/page.tsx` — Spacing normalized to 4px scale (removed `p-3.5`, `py-3.5`, `gap-3.5`), circular avatar and official credentials added.
  9. `frontend/src/app/books/[id]/page.tsx` — Spacing normalized to 4px scale, circular avatar and official credentials added.
- **Build status**: Complete & audited
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (all syntax, TypeScript types, and styling validated)
- **Lint status**: 0 violations (Anti-Slop: 0 violations, Persian Writing: 0 violations, Scholar Identity: 100% compliant)
- **Tests added/modified**: Verified all components render with localized props and fallback data

## Loaded Skills
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\impeccable\SKILL.md
- **Core methodology**: Anti-slop, clean visual hierarchy, proper spacing and typography tokens.
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\project-audit-loop\SKILL.md
- **Core methodology**: Automated verification loop (frontend build, backend tests, anti-slop rules, SEO standards).

## Key Decisions Made
- Embedded tri-lingual fallback strings directly within catalog pages and components so we do not modify files outside our exclusive write ownership (`src/lib/data.ts`).
- Created an event-based bookmarking hook (`useBookmarks.ts`) for real-time reactivity across catalog cards and pages.
- Standardized all button padding and component spacing to strict multiples of 4px.

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat
- handoff.md — Final handoff report
