# DISPATCH — Project Orchestrator (orchestrator_5)

## Working Directory
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5`

## Authoritative User Request
Refer directly to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically the request under `## Follow-up — 2026-10-14T04:02:02Z`).

## Mission Objective
Comprehensive refactoring and hardening of the Dr. Zanjirzan Platform across Phases 6 through 9:
- **Phase 6: Event Loop Optimization, Database Queries & Range Streaming**
  - Ensure all endpoints in `backend/app/api/v1/endpoints/` and `backend/app/models/database.py` use pure non-blocking `AsyncSession` transactions with zero blocking synchronous ORM calls inside `async def` routes.
  - In `backend/app/models/models.py`, add composite index `(user_id, course_id)` on `Enrollment` and create `UserFavorite` table with composite index `(user_id, course_id)` to support the Dribbble `Favourite` tab.
  - Apply `selectinload` across `course_service.py`, `book_service.py`, and `order_service.py` to eliminate N+1 Query latency on related models (`lessons`, `enrollments`, `items`).
  - In `backend/app/api/v1/endpoints/stream.py` and `drm_service.py`, implement full RFC 7233 `Range` requests with `206 Partial Content`, `Accept-Ranges: bytes`, and `Content-Range: bytes {start}-{end}/{total}` supporting precise audio/video seek scrubbing and playback resumption from timestamped notes.

- **Phase 7: Advanced Payment Security, JWT & AI Streaming SSE**
  - In `backend/app/services/payment_service.py`, `backend/app/api/v1/endpoints/payment.py`, and `order_service.py`, prevent payment replay attacks by enforcing tracking code and authority uniqueness with database locks. Final order pricing must be computed 100% server-side based on catalog rates and validated coupon rules.
  - In `backend/app/api/v1/endpoints/ai.py` and `ai_service.py`, implement token-by-token streaming via `StreamingResponse` with `text/event-stream` format. Enforce maximum input prompt length validation and integrate per-user token-bucket rate limiting via `rate_limiter.py`.
  - In `backend/app/api/v1/endpoints/admin.py` and `deps.py`, enforce strict Role-Based Access Control (`get_current_admin`) at both the router and endpoint levels.

- **Phase 8: Font Unification, Docker & Documentation Harmony**
  - Move deprecated root brief files (`antigravity-redesign-brief.md`, `antigravity-redesign-brief_V2.md`) into `docs/archive/`, and establish `DESIGN.md` as the single source of truth featuring the Dribbble production palette (`#FCF9F4`, `#D6534F`, `#1B1B1B`, `#F2EFE9`).
  - Configure `Vazirmatn` and `Lalezar` in `frontend/src/app/layout.tsx` via `next/font` with `display: 'swap'` to decouple font assets from local file systems in Docker containers.
  - In `frontend/next.config.js`, enable `output: 'standalone'` and security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`). Update `docker-compose.yml` with healthchecks and sync `.env.example`.

- **Phase 9: Edge-Case Test Suite Completion**
  - In `backend/tests/test_api_v1.py` and `backend/tests/test_in_memory.py`, add and verify:
    1. Unauthorized student access to `/api/v1/admin` returns HTTP 403 Forbidden.
    2. RFC 7233 `Range: bytes=...` requests return HTTP 206 Partial Content with correct slice and `Content-Range`.
    3. Replay attack rejection on payment verification and expired coupon rejection.
    4. Timestamped study notes CRUD (`/api/v1/notes`) and scholarly Q&A interactions (`/api/v1/qa`).
  - Ensure all tests pass with 100% success rate and `audit_pipeline.py` maintains 100/100.

## Mandatory Rules & Constraints
- **Scholar Identity**: «حجت الاسلام دکتر زنجیر زن حسینی» exclusively.
- **Anti-AI-Slop**: No `blur-3xl`, no `bg-clip-text text-transparent`, no pulsing dots (`animate-pulse`), no generic cards. Follow `DESIGN.md`.
- **Persian Quality**: No «می‌باشد», no «می‌گردد», proper ZWNJ (نیم‌فاصله), Persian digits, and quotes.
- **Backend Architecture**: Async routes, SQLAlchemy ORM with parameterized queries, structured errors via `AppException`.

## Required Orchestration Discipline
- Create your `plan.md` and keep `progress.md` continuously updated so the Sentinel's progress and liveness crons stay informed.
- Deconstruct milestones and dispatch specialized subagents under `.agents/teamwork/`.
- Verify behavior thoroughly before declaring completion.


## 2026-10-14T04:03:56Z
Received System Message:
You are the Project Orchestrator (orchestrator_5) for the Dr. Zanjirzan Platform comprehensive refactoring and hardening across Phases 6 through 9.
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5
Read your dispatch file at: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\DISPATCH.md
Read the authoritative user request at: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (under header ## Follow-up — 2026-10-14T04:02:02Z).

Follow all project rules (Scholar Identity, Anti-AI-Slop, Persian Writing, Backend Architecture).
Create your plan.md and keep progress.md continuously updated. Deconstruct into milestones and dispatch specialists.
When all phases are implemented and fully verified with tests passing and audit pipeline at 100/100, report your victory claim back to me via send_message.
