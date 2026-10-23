## 2026-09-30T01:14:23Z
You are Worker 2 responsible for Milestone 2: Dashboard & Admin Shell Modularization for the Philosophy Zanjirzan App redesign.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard

MANDATORY READING:
You MUST read the authoritative request file before starting:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Project Root:
e:\personal\philosophy_zanjirzan_app

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit or create ONLY these files:
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
DO NOT modify any other files (other workers are running concurrently on other files).

Reference Architecture:
Read Explorer 2's report:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_admin_dashboard\report.md

Requirements to implement (R2, R4, R5):
1. Modular Shell System (`src/components/shell/`):
   - `ShellLayout.tsx`: Reusable shell combining `ShellSidebar` and `ShellHeader`, managing collapse state, breadcrumbs, and user menu.
   - `ShellSidebar.tsx`: Clean navigation sidebar with squircle badges and active tab indicator.
   - `ShellHeader.tsx`: Minimalist top header with mobile hamburger, breadcrumbs, language switcher, and profile trigger.
   - `ShellAuthGate.tsx`: Reusable login/unauthorized gate card with role-specific demo actions.
2. `KpiMetricStrip.tsx`:
   - Clean 4-card KPI metric strip (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`).
   - Soft-colored circular icon wrappers (`w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center` or palette tokens).
   - Bold tabular numbers (`font-num font-bold text-2xl`).
3. `MinimalistBarChart.tsx`:
   - Minimalist vertical bar chart with rounded tops (`rounded-t-md`), flat bottoms.
   - Clean percentage/value height scaling, clean labels, anti-slop typography.
4. `OngoingCoursesTable.tsx`:
   - Compact table using thin progress pill tracks (`w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden` with `#8A532B` progress fill).
   - Compact rows, course title, category badge, progress percentage, resume action.
5. Deconstruct & Refactor:
   - Refactor `src/app/dashboard/page.tsx` and `src/app/admin/page.tsx` into clean, concise controllers using `ShellLayout`.
   - Update `DashboardOverviewTab.tsx` and `AdminStatsTab.tsx` to use `KpiMetricStrip`, `MinimalistBarChart`, and `OngoingCoursesTable`.
   - Use `useLanguage()` and dictionary keys (`dash_tab_*`, `admin_tab_*`, `kpi_*`, `th_*`) so all tabs, KPIs, and tables update dynamically in Persian, Arabic, and English.
6. Anti-AI-slop & Design Rules:
   - ZERO `blur-3xl`, ZERO `bg-clip-text text-transparent`, ZERO `animate-pulse`.
   - 4px spacing scale (`p-1` through `p-8`), `text-2xl` heading ceiling.
   - 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
   - Strict scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero Persian bureaucratic verbs («میباشد», «گردید»).
7. Write handoff report to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_admin_dashboard\handoff.md`. Send completion message when done.
