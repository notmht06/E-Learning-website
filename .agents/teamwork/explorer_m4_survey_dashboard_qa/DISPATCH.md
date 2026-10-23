# Dispatch — Survey Explorer Dashboard & QA

## Objective
Investigate student dashboard tabs, ongoing courses table, live data fetching from backend, test suite in `backend/tests/test_in_memory.py`, and `audit_pipeline.py`.

## Working Directory
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_dashboard_qa`

## Required Readings
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically `## Follow-up — 2026-10-13T03:02:29Z`)
- `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
- `e:\personal\philosophy_zanjirzan_app\GEMINI.md`

## Target Inspection Paths
- `frontend/src/app/dashboard/` (`page.tsx`, `DashboardOverviewTab.tsx`, `DashboardCoursesTab.tsx`, `OngoingCoursesTable.tsx`, etc.)
- `backend/tests/test_in_memory.py`
- `audit_pipeline.py`

## Deliverables
Produce `survey_dashboard_qa.md` and `handoff.md` in your working directory with detailed analysis of dashboard courses rendering, backend test coverage needed for enrollment/orders, audit_pipeline expectations (anti-slop, scholar identity, Persian rules), and concrete implementation plan for R3 and validation.


## 2026-10-13T03:05:29Z
You are the Dashboard and QA Survey Explorer (explorer_m4_survey_dashboard_qa).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_dashboard_qa

Read your dispatch instructions in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_dashboard_qa\DISPATCH.md
and the authoritative user request in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (specifically '## Follow-up — 2026-10-13T03:02:29Z').

Objective:
Investigate student dashboard tabs, ongoing courses table, live data fetching from backend, test suite in backend/tests/test_in_memory.py, and audit_pipeline.py.
Examine:
- frontend/src/app/dashboard/ (page.tsx, DashboardOverviewTab.tsx, DashboardCoursesTab.tsx, OngoingCoursesTable.tsx, etc.)
- How OngoingCoursesTable gets course data and how to display live enrolled courses from backend
- Instructor credentials and continue-learning buttons in dashboard
- backend/tests/test_in_memory.py (existing tests, what integration tests must be added for enrollment, duplicate enrollment rejection, orders, /enrolled)
- audit_pipeline.py (exact checks: anti-slop, scholar identity, Persian rules, LOC limits)

Produce survey_dashboard_qa.md and handoff.md in your working directory.
When done, notify me via send_message with a summary and the absolute paths to your reports.
