# Master Plan: Philosophy Zanjirzan App UI Redesign

## 1. Overview & Objective
Redesign the user interface of the "Philosophy Zanjirzan App" into a modular, anti-slop, squircle design system modeled after 3 Dribbble references.
Enforce 100% compliance with:
- Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی»
- Anti-Slop Directive: zero `blur-3xl`, zero `bg-clip-text text-transparent`, zero `animate-pulse` dots
- Persian Writing: zero «می‌باشد», «گردید», or robotic padding
- 4px Spacing Scale & text-2xl heading ceiling
- 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`)
- Trilingual localization across Persian, Arabic, and English

## 2. Phase Breakdown

### Phase 0: Survey & Codebase Mapping (COMPLETED)
- 3 parallel Explorers surveyed Catalog, Dashboard/Admin, and Learning/Roadmap/Quality pipelines.
- Produced comprehensive architectural reports and handoffs.
- Synthesized `PROJECT.md`.

### Phase 1: Shared Infrastructure & Trilingual Dictionaries (Worker 0)
- Add complete dictionary keys (`fa`, `ar`, `en`) to `frontend/src/lib/data.ts`:
  - Catalog & Book categories, filter tags, price/bookmark labels.
  - Dashboard & Admin tabs, KPI titles, table column headers, auth gate texts.
  - Learning theater controls, playlist steps, roadmap stages, and FAQs.
- Check `frontend/next.config.js` to ensure clean Windows Next.js 15 export.
- Verification: `npm run build` and `backend\.venv\Scripts\python.exe audit_pipeline.py` pass 100/100.

### Phase 2: Parallel Feature Implementation (Workers 1, 2, 3)
- **Worker 1 (Milestone 1 — Catalog Views & Shared UI)**:
  - Exclusive files:
    - `src/components/ui/CategoryTabStrip.tsx`
    - `src/components/ui/CourseCard.tsx`
    - `src/components/ui/CompactHorizontalCard.tsx`
    - `src/components/ui/BookCard.tsx`
    - `src/hooks/useBookmarks.ts`
    - `src/app/courses/page.tsx`
    - `src/app/books/page.tsx`
    - `src/app/courses/[id]/page.tsx`
    - `src/app/books/[id]/page.tsx`
- **Worker 2 (Milestone 2 — Dashboard & Admin Modularization)**:
  - Exclusive files:
    - `src/components/shell/ShellLayout.tsx`
    - `src/components/shell/ShellSidebar.tsx`
    - `src/components/shell/ShellHeader.tsx`
    - `src/components/shell/ShellAuthGate.tsx`
    - `src/components/dashboard/shared/KpiMetricStrip.tsx`
    - `src/components/dashboard/shared/MinimalistBarChart.tsx`
    - `src/components/dashboard/shared/OngoingCoursesTable.tsx`
    - `src/app/dashboard/page.tsx`
    - `src/app/admin/page.tsx`
    - `src/components/dashboard/DashboardOverviewTab.tsx`
    - `src/components/dashboard/AdminStatsTab.tsx`
- **Worker 3 (Milestone 3 — Learning Environment & Roadmap Stepper)**:
  - Exclusive files:
    - `src/components/learn/AudioVideoPlayerEngine.tsx`
    - `src/components/learn/CoursePlaylistSidebar.tsx`
    - `src/components/CurriculumRoadmap.tsx`
    - `src/app/courses/[id]/learn/page.tsx`
    - `src/app/roadmap/page.tsx`

### Phase 3: Review, Challenge & Forensic Integrity Audit
- 2 Independent Reviewers (`teamwork_preview_reviewer`): Verify correctness, completeness, anti-slop, and visual elegance.
- 2 Challengers (`teamwork_preview_challenger`): Stress test responsiveness, i18n switching, DOM structure, and edge cases.
- 1 Forensic Auditor (`teamwork_preview_auditor`): Run `audit_pipeline.py` and exhaustive integrity/anti-slop checks.

### Phase 4: Gate Evaluation & Final Reporting
- Record verdicts in `GATE_STATUS.md`.
- Ensure 100/100 audit score and 0 build errors.
- Transmit completion report to Sentinel.
