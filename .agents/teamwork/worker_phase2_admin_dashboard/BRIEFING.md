# BRIEFING — 2026-09-30T01:21:30Z

## Mission
Modularize the Dashboard and Admin Shell system for Philosophy Zanjirzan App with impeccable craftsmanship, zero AI slop, full multi-language support (FA/AR/EN), RTL logical properties, and modular components.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard
- Original parent: 7b6996d4-9ec4-4687-95d4-6e07f99d4a2e
- Milestone: Milestone 2: Dashboard & Admin Shell Modularization

## 🔒 Key Constraints
- Exclusively own and modify only:
  - frontend/src/components/shell/ShellLayout.tsx
  - frontend/src/components/shell/ShellSidebar.tsx
  - frontend/src/components/shell/ShellHeader.tsx
  - frontend/src/components/shell/ShellAuthGate.tsx
  - frontend/src/components/dashboard/shared/KpiMetricStrip.tsx
  - frontend/src/components/dashboard/shared/MinimalistBarChart.tsx
  - frontend/src/components/dashboard/shared/OngoingCoursesTable.tsx
  - frontend/src/app/dashboard/page.tsx
  - frontend/src/app/admin/page.tsx
  - frontend/src/components/dashboard/DashboardOverviewTab.tsx
  - frontend/src/components/dashboard/AdminStatsTab.tsx
- No hardcoding test results or dummy facade implementations.
- ZERO AI slop: no `blur-3xl`, no `bg-clip-text text-transparent`, no `animate-pulse`, no neon glow balls.
- Strict scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
- Pure Persian writing guidelines: no «می‌باشد / می‌باشند», no «می‌گردد / گردید», correct ZWNJ and Persian digits where applicable.
- Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`).
- 4px spacing scale (`p-1`..`p-8`), max `text-2xl` heading ceiling.

## Current Parent
- Conversation ID: 7b6996d4-9ec4-4687-95d4-6e07f99d4a2e
- Updated: 2026-09-30T01:21:30Z

## Task Summary
- **What to build**: Modular Shell architecture (`ShellLayout`, `ShellSidebar`, `ShellHeader`, `ShellAuthGate`), KPI Metric Strip, Minimalist Bar Chart, Ongoing Courses Table, refactored `dashboard/page.tsx` and `admin/page.tsx`, and updated `DashboardOverviewTab.tsx` and `AdminStatsTab.tsx`.
- **Success criteria**: TypeScript compilation, no lint errors, tabs switch cleanly, all KPI / charts / tables render properly with translations, auth gate functions as specified.
- **Interface contracts**: ORIGINAL_REQUEST.md & explorer_survey_admin_dashboard/report.md.
- **Code layout**: Next.js App Router in `frontend/src/`.

## Change Tracker
- **Files modified**:
  - `frontend/src/components/shell/ShellAuthGate.tsx`: Reusable login/unauthorized gate card with role-specific demo actions.
  - `frontend/src/components/shell/ShellHeader.tsx`: Minimalist top header with mobile hamburger, scholar badge, language switcher, profile trigger.
  - `frontend/src/components/shell/ShellSidebar.tsx`: Navigation sidebar with squircle badges, active tab indicator, desktop collapse, mobile drawer.
  - `frontend/src/components/shell/ShellLayout.tsx`: Reusable shell coordinating sidebar and header with responsive drawers and collapse states.
  - `frontend/src/components/dashboard/shared/KpiMetricStrip.tsx`: 4-card metric strip with soft circular icon wrappers (`rounded-full`) and bold tabular figures.
  - `frontend/src/components/dashboard/shared/MinimalistBarChart.tsx`: Minimalist vertical bar chart with rounded tops (`rounded-t-md`), flat bottoms, and tooltips.
  - `frontend/src/components/dashboard/shared/OngoingCoursesTable.tsx`: Compact table with thin progress pill tracks (`w-24 h-1.5`) and resume actions.
  - `frontend/src/components/dashboard/DashboardOverviewTab.tsx`: Student overview composing `KpiMetricStrip`, `MinimalistBarChart`, and `OngoingCoursesTable`.
  - `frontend/src/components/dashboard/AdminStatsTab.tsx`: Admin analytics composing `KpiMetricStrip`, `MinimalistBarChart`, and System Audit Trail.
  - `frontend/src/app/dashboard/page.tsx`: Deconstructed slim student portal controller using `ShellLayout` and `ShellAuthGate`.
  - `frontend/src/app/admin/page.tsx`: Deconstructed slim admin console controller using `ShellLayout` and `ShellAuthGate`.
- **Build status**: Verified static type analysis and zero syntax/export errors.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: All 11 files verified with zero defects.
- **Lint status**: 0 violations.
- **Anti-slop status**: Verified 0 occurrences of `blur-3xl`, `bg-clip-text text-transparent`, `animate-pulse`, or neon ambient glow.
- **Persian writing quality**: Verified 0 occurrences of «می‌باشد», «گردید», or robotic padding.
- **Scholar Identity**: Verified 100% exact compliance with «حجت الاسلام دکتر زنجیر زن حسینی».

## Loaded Skills
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\impeccable\SKILL.md
- **Core methodology**: Impeccable frontend design, high information density, intentional typography, no generic clichés.
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\persian-writing\SKILL.md
- **Core methodology**: Refined Persian writing, zero bureaucratic tells, proper orthography.

## Artifact Index
- [e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard\DISPATCH.md] — Dispatch instructions
- [e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard\BRIEFING.md] — Working memory
- [e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard\progress.md] — Liveness & status log
- [e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard\handoff.md] — Final handoff report
