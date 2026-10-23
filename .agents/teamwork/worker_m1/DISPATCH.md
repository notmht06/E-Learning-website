# DISPATCH — Worker Milestone 1 (Phase 6)

## Mandatory Context
Read the authoritative user request at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically under `## Follow-up — 2026-10-14T04:02:02Z`).
Read the project architecture and features at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\PROJECT.md`.
Read the backend explorer survey findings at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p6_p7\analysis.md` and `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 1 Objectives (Phase 6)
1. **Models & Database (`backend/app/models/models.py` & `database.py`)**:
   - In `Enrollment`, ensure composite index `Index("ix_enrollments_user_course", "user_id", "course_id")` is defined alongside the unique constraint.
   - Define `UserFavorite` model with fields: `id`, `user_id` (ForeignKey to users.id), `course_id` (ForeignKey to courses.id), `created_at`, with `UniqueConstraint("user_id", "course_id", name="uq_user_course_favorite")` and composite index `Index("ix_user_favorites_user_course", "user_id", "course_id")`.
   - Add relationship in `User` if applicable, and ensure `init_db()` in `database.py` executes table creation and index sync without error.
2. **Eliminate N+1 Queries with `selectinload` (`course_service.py`, `order_service.py`, `auth_service.py`)**:
   - In `course_service.py`, apply `selectinload(Course.lessons)` on course detail queries and optimize `get_enrolled_courses_for_user` to avoid serial ID iteration.
   - In `order_service.py`, apply `selectinload(Order.items)` in `get_order_by_id_tx` and user orders.
   - In `auth_service.py`, apply `selectinload(User.enrollments)` in `_fetch_user_with_enrollments`.
3. **Pure Non-Blocking AsyncSession Transactions**:
   - Review all endpoints in `backend/app/api/v1/endpoints/` and ensure zero blocking synchronous ORM calls inside `async def` routes.
4. **RFC 7233 Audio Range Streaming (`backend/app/api/v1/endpoints/stream.py` & `drm_service.py`)**:
   - Implement complete RFC 7233 compliance in `stream_audio_lecture`:
     - Return status `206 Partial Content` when `Range` header is present and valid.
     - Include headers `Accept-Ranges: bytes` and `Content-Range: bytes {start}-{end}/{total_len}`.
     - Correctly parse suffix ranges (e.g. `bytes=-500` returns the last 500 bytes: `start = max(0, total_len - 500)`, `end = total_len - 1`).
     - If `start >= total_len`, return HTTP 416 Range Not Satisfiable with header `Content-Range: bytes */{total_len}`.
     - When using synthetic fallback buffer, slice bytes cleanly: `chunk = synthetic_payload[start:end+1]`.
5. **Quality & Rules**:
   - Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» exclusively.
   - Anti-AI-Slop and Persian Writing compliance.

## Verification Requirements
Worker must run:
1. `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
2. `.\backend\.venv\Scripts\python.exe audit_pipeline.py`
Document the exact command outputs in `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1\handoff.md`.


## 2026-10-14T04:18:28Z
You are the Worker subagent for Milestone 1 (Phase 6: Event Loop Optimization, Database Models, selectinload, and RFC 7233 Range Audio Streaming).

MANDATORY FIRST STEP: Read the authoritative user request at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Specifically inspect ## Follow-up — 2026-10-14T04:02:02Z (§R1).

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1
Read your task dispatch file at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1\DISPATCH.md
Read the backend explorer survey findings at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p6_p7\analysis.md and handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Follow all instructions in DISPATCH.md:
1. In backend/app/models/models.py and database.py, define composite Index("ix_enrollments_user_course", "user_id", "course_id") on Enrollment and create UserFavorite table with composite index (user_id, course_id) and unique constraint. Ensure init_db() creates them properly.
2. In course_service.py, order_service.py, and auth_service.py, apply selectinload to eliminate N+1 queries.
3. In backend/app/api/v1/endpoints/stream.py & drm_service.py, implement full RFC 7233 Range requests with 206 Partial Content, suffix range parsing, 416 out-of-range, and accurate buffer slicing.
4. Ensure zero blocking synchronous ORM calls inside async def routes.
5. Adhere to Scholar Identity («حجت الاسلام دکتر زنجیر زن حسینی») and Persian writing rules.
6. Verify your implementation by running:
   .\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
   .\backend\.venv\Scripts\python.exe audit_pipeline.py
7. Write your changes and test outputs to e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1\handoff.md and notify the orchestrator with send_message.
