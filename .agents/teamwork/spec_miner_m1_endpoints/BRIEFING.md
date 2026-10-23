# BRIEFING — 2026-10-13T03:22:00Z

## Mission
Probe and document the authoritative specification for M1 backend endpoints and services (POST /courses/{id}/enroll, GET /courses/enrolled, POST /orders/create, duplicate enrollment AppException, /auth/me hydration).

## 🔒 My Identity
- Archetype: specification_miner
- Roles: Specification Miner
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints
- Original parent: 6dcd4eed-9597-4cd0-8718-2e17657de9c5
- Milestone: M1 (Backend Persistent Course Enrollment, Orders & SQLite Models)

## 🔒 Key Constraints
- Read-only on implementation code — do NOT modify production code or implement features.
- Adhere to official scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
- Adhere to Persian writing quality: zero bureaucratic tells («می‌باشد», «می‌گردد»), correct ZWNJ, Persian quotes (« »), Persian numerals.
- Adhere to Anti-Slop directives and backend-skill architecture (FastAPI async def, SQLAlchemy parameterization, AppException error structure, SQLite WAL).
- Exact Persian error on duplicate enrollment:
  «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.»
- Expose enrolled_course_ids: List[str] and enrolled_courses_count: int on GET /api/v1/auth/me and UserResponse.

## Current Parent
- Conversation ID: 6dcd4eed-9597-4cd0-8718-2e17657de9c5
- Updated: 2026-10-13T03:15:33Z

## Task Summary
- **What to build**: Specification mining report (`report_endpoints.md`) and handoff report (`handoff.md`) detailing the exact contracts, signatures, models, error handling, route ordering, and behavior of M1 endpoints and services.
- **Success criteria**: Exhaustive interface contracts, exact Pydantic models, exception signatures, database interactions, edge cases, route collision prevention, and test specifications documented.
- **Interface contracts**: PROJECT.md § Interface Contracts, survey_backend.md § 4, report_endpoints.md
- **Code layout**: PROJECT.md § Code Layout

## Loaded Skills
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\persian-writing\SKILL.md
- **Local copy**: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints\skills\persian-writing.md
- **Core methodology**: Persian writing quality, ZWNJ discipline, anti-slop copula prevention, formal-but-human scholar voice.

## Key Decisions Made
- Route Collision Immunity: `GET /api/v1/courses/enrolled` MUST be placed BEFORE `GET /api/v1/courses/{course_id}` in `courses.py`.
- Duplicate Enrollment Shield: Defined HTTP 400 `AppException` with code `DUPLICATE_ENROLLMENT` and exact Persian message: «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.».
- FK Safety: Handled SQLite `PRAGMA foreign_keys=ON;` prerequisite by ensuring course row exists in `courses` table before inserting `Enrollment`.
- Async Order Checkout: Specified `POST /api/v1/orders/create` async conversion, `get_optional_user` dependency, and auto-enrollment for cart course items.
- Session Hydration: Added `enrolled_course_ids: List[str]` and `enrolled_courses_count: int` to `UserResponse`, `User.to_dict()`, and `auth_service.get_user_by_id`.

## Artifact Index
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints\report_endpoints.md` — Detailed specification report for worker
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints\handoff.md` — 5-component hard handoff report
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints\progress.md` — Liveness heartbeat and progress tracker
