## 2026-10-07T04:48:37Z

You are a Worker subagent for Milestone 3: Folder Structure Standardization & Clean Architecture Restructure.
Your identity: worker_arch_1
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_arch_1

MANDATORY FIRST STEP:
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (Follow-up — 2026-10-07T03:59:53Z).
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_arch_1\handoff.md and report.md.
Read e:\personal\philosophy_zanjirzan_app\audit_pipeline.py.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL HARD PATH CONSTRAINTS (CHECKED BY audit_pipeline.py):
The following files have hardcoded path checks in audit_pipeline.py and MUST NOT be moved or deleted:
1. frontend/src/components/motion/MotionPrimitives.tsx (line 190 of audit_pipeline.py directly checks this path exists)
2. frontend/src/components/Navbar.tsx (line 42 of audit_pipeline.py checks scholar identity here)
3. frontend/src/lib/data.ts (line 40 of audit_pipeline.py checks scholar identity here)
4. frontend/src/app/sitemap.ts and frontend/src/app/robots.ts (lines 101-102)
5. frontend/public/llms.txt (lines 45, 103)

TASKS:
1. Reorganize and standardize frontend/src/ into a clean, decoupled architecture:
   - Presentation layer:
     - `components/ui/`: atomic UI primitives (SquircleCard, StatSquircle, ShadcnBadge, CategoryTabStrip, MinimalCourseCard, CompactHorizontalCard, CourseCard, BookCard).
     - `components/shell/`: ShellLayout, ShellHeader, ShellSidebar, ShellAuthGate, CommandPalette, GlobalOverlays, PWARegistration.
     - `components/motion/`: MotionPrimitives.tsx.
     - `components/admin/`: AdminHeader, AdminSidebar, AdminCharts, and tabs/ (AdminStatsTab, AdminCoursesTab, AdminDrmTab, AdminBooksTab).
     - `components/dashboard/`: DashboardHeader, DashboardSidebar, shared/ (KpiMetricStrip, MinimalistBarChart, OngoingCoursesTable), and tabs/ (DashboardOverviewTab, DashboardEnrollmentsTab, DashboardSecurityTab).
     - `components/learn/`: AudioVideoPlayerEngine, CoursePlaylistSidebar, CourseQaAccordion, CourseHandoutsTab, AudioPlayerIsland, AudioUploaderModal.
     - `components/reader/` (or re-exported): BookReader3D.
     - Keep barrel re-exports (or index.ts) in `frontend/src/components/` so any legacy imports continue to resolve cleanly without broken links.
   - State & Context layer:
     - `context/`: AuthContext, DataContext, LanguageContext, PlayerContext, CartContext.
   - Hooks layer:
     - `hooks/`: useBookmarks, etc.
   - Domain & Services layer:
     - `services/`: apiClient and domain services.
     - `types/`: domain types and entities.
   - Localization layer:
     - `locales/`: types.ts, fa.ts, ar.ts, en.ts, index.ts (strictly typed dictionaries).
   - Utility layer:
     - `lib/`: utils.ts, localization.ts, data.ts.
2. Ensure all imports in `src/app/` and components are clean, strongly typed, and use standard path aliases (`@/components/...`, `@/context/...`, `@/hooks/...`, `@/locales/...`, `@/services/...`, `@/types/...`).
3. Verification:
   - Run `npx tsc --noEmit` in `frontend/`: must pass with 0 errors.
   - Run `npm run build` in `frontend/`: must build all 15 routes with 0 errors.
   - Run `backend\.venv\Scripts\python.exe audit_pipeline.py`: must score 100/100 across all 8 gates.
   - Run `backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`: must pass 100%.

Deliver your detailed handoff report to:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_arch_1\handoff.md

When finished, send a message to orchestrator_2 (parent) with a concise summary and confirmation of build & audit pass.
