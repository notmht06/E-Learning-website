## 2026-09-30T00:58:38Z

You are Explorer 2 investigating the Dashboard & Admin Shell pages (/dashboard, /admin) and component modularization for the Philosophy Zanjirzan App redesign.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_admin_dashboard

MANDATORY READING:
You MUST read the authoritative request file before starting:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Project Root:
e:\personal\philosophy_zanjirzan_app

Your Tasks:
1. Examine existing `src/app/dashboard` and `src/app/admin` pages and components:
   - Identify why/where they are monolithic (e.g. `admin/page.tsx`, `dashboard/page.tsx`).
   - Locate KPI cards, charts, ongoing courses tables, sidebar/nav shells, and admin forms/tables.
2. Analyze requirements for R2:
   - Deconstruct monolithic shell pages into modular, reusable components (e.g., KpiMetricStrip, MinimalistBarChart, OngoingCoursesTable, ShellLayout).
   - Clean 4-card KPI metric strip with soft-colored circular icon wrappers (`bg-amber-50 text-amber-500`) and bold tabular numbers.
   - Minimalist vertical bar chart with rounded tops (`rounded-t-md`).
   - "Ongoing Courses" table using thin progress pill tracks (`w-24 h-1.5 bg-zinc-100` filled with `#8A532B`) and compact rows.
3. Analyze design system constraints (R4) & i18n (R5):
   - 4px spacing scale (p-1 to p-8), text-2xl heading ceiling.
   - Warm paper/obsidian contrast (`bg-[#FAF8F5]` / `bg-[#0C0D0E]`), terracotta/copper accent (`#8A532B`).
   - 100% Tailwind logical properties (ps-, pe-, ms-, me-).
   - Strict scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero AI slop (no `blur-3xl`, no text gradients, no pulsing dots).
   - Multi-language support (Arabic, Persian, English) via `src/context/LanguageContext.tsx`.
4. Propose a clear modular component breakdown and file structure for dashboard and admin.
5. Write your comprehensive analysis report to:
   `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_admin_dashboard\report.md`
   and write your standard handoff report to:
   `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_admin_dashboard\handoff.md`.
6. When done, send a message to parent with your summary and report path.
