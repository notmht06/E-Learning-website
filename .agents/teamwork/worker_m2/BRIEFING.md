# BRIEFING — 2026-10-14T05:00:00Z

## Mission
Harden platform backend for Milestone 2 (Phase 7): Advanced Payment Security & Replay-Attack Prevention, Server-Side Pricing, AI Token-by-Token SSE Streaming, Per-User TokenBucketRateLimiter, and Strict Admin RBAC.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2
- Original parent: 6dcd4eed-9597-4cd0-8718-2e17657de9c5
- Milestone: M2 (Frontend Live Course Enrollment, CartModal & Player Lesson Unlock)
- New Parent: 3c84efb7-ad97-49f7-9b54-a24b5b5fe364
- Milestone (Current): M2 (Phase 7: Advanced Payment Security, Server-Side Pricing, AI SSE Streaming, and Admin RBAC)

## 🔒 Key Constraints
- Exclusive file ownership:
  - frontend/src/services/apiClient.ts
  - frontend/src/context/AuthContext.tsx
  - frontend/src/types/index.ts
  - frontend/src/components/course/CourseDetailHero.tsx
  - frontend/src/components/course/CourseSyllabusList.tsx
  - frontend/src/components/course/CourseEnrollmentCard.tsx
  - frontend/src/components/course/useCourseEnrollment.ts
  - frontend/src/app/courses/[id]/page.tsx
  - frontend/src/components/CartModal.tsx
  - frontend/src/app/courses/[id]/learn/page.tsx
  - frontend/src/components/course/CoursePlaylistSidebar.tsx
- Strict 200 LOC ceiling on all modified and newly created files.
- 4px spacing scale (p-1 to p-8), 100% Tailwind logical properties (ps-, pe-, ms-, me-).
- Scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی» strictly maintained.
- Anti-slop: No blur-3xl, no text-transparent bg-clip-text, no animate-pulse.
- Persian writing: Zero bureaucratic tells (می‌باشد, می‌گردد), proper ZWNJ, Persian quotes, Persian digits.
- Integrity mandate: No dummy mocks, no hardcoded test outputs, genuine state and network calls.
- Phase 7 files:
  - backend/app/services/payment_service.py
  - backend/app/api/v1/endpoints/payment.py
  - backend/app/services/coupon_service.py
  - backend/app/api/v1/endpoints/coupons.py
  - backend/app/services/book_service.py
  - backend/app/services/order_service.py
  - backend/app/core/rate_limiter.py
  - backend/app/services/ai_service.py
  - backend/app/api/v1/endpoints/ai.py
  - backend/app/api/v1/endpoints/admin.py
  - backend/tests/test_in_memory.py

## Current Parent
- Conversation ID: 3c84efb7-ad97-49f7-9b54-a24b5b5fe364
- Updated: 2026-10-14T05:00:00Z

## Task Summary
- **What to build**: Payment replay attack protection with atomic authority locking, 100% server-side pricing in OrderService, coupon expiration validation and anti-tell fix («منظور گردید» -> «منظور شد»), AI token-by-token SSE streaming (`POST /chat/stream`), prompt length validation (max 2000 chars), per-user `TokenBucketRateLimiter`, and router-level Admin RBAC (`dependencies=[Depends(get_current_admin)]` and root `GET /`).
- **Success criteria**: All in-memory tests pass (19/19), audit_pipeline passes 100/100, adversarial tests pass 8/8.
- **Interface contracts**: PROJECT.md & DISPATCH.md
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- `PaymentService.verify_payment`: Enforced atomic check-and-set using thread locks; rejects re-verification of already paid authorities with HTTP 400 (`PAYMENT_REPLAY_ATTACK`), rejects fake authorities with HTTP 400 (`PAYMENT_NOT_FOUND`), and rejects duplicate tracking codes with HTTP 400 (`DUPLICATE_TRACKING_CODE`).
- `OrderService`: Added `resolve_server_price` to calculate prices 100% server-side from `course_service` and `book_service`, neutralizing client price tampering.
- `CouponService`: Added `expires_at` and `is_active` support; replaced tell «منظور گردید» with «منظور شد»; rejected expired coupons with HTTP 400.
- `TokenBucketRateLimiter`: Implemented burst-capacity token bucket algorithm with steady refill; integrated per-user/IP into AI endpoints returning HTTP 429 when exhausted.
- `AIScholarlyService.stream_chat`: Implemented async generator yielding `text/event-stream` SSE tokens and terminal payload with citations.
- `Admin APIRouter`: Enforced `dependencies=[Depends(get_current_admin)]` at router level and added root route `GET /api/v1/admin` returning HTTP 403 for students and HTTP 200 for admins.

## Artifact Index
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\BRIEFING.md — situational awareness
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\progress.md — liveness heartbeat
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\changes.md — change log
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md — 5-component handoff report

## Change Tracker
- **Files modified**:
  - `backend/app/services/book_service.py` (added missing catalog books with physical & digital prices)
  - `backend/app/services/coupon_service.py` (added expiration dates, active flags, replaced tell with «منظور شد»)
  - `backend/app/api/v1/endpoints/coupons.py` (proper `AppException` error propagation)
  - `backend/app/services/payment_service.py` (atomic thread-locked replay protection and authority uniqueness)
  - `backend/app/api/v1/endpoints/payment.py` (replay attack error mapping)
  - `backend/app/services/order_service.py` (server-side price resolution and coupon validation)
  - `backend/app/core/rate_limiter.py` (implemented `TokenBucketRateLimiter`)
  - `backend/app/services/ai_service.py` (implemented `stream_chat` SSE generator)
  - `backend/app/api/v1/endpoints/ai.py` (added `/chat/stream`, 2000-char prompt validation, token bucket rate limiter)
  - `backend/app/api/v1/endpoints/admin.py` (router-level admin RBAC dependency and root `GET /` route)
  - `backend/tests/test_in_memory.py` (added 4 comprehensive Phase 7 integration tests)
- **Build status**: passed (19/19 in-memory tests pass, 8/8 adversarial tests pass, audit pipeline 100/100)
- **Pending issues**: none

## Quality Status
- **Build/test result**: 19/19 in-memory tests passed, 8/8 adversarial enrollment tests passed, 8/8 challenger2 tests passed, audit_pipeline passed 100/100
- **Lint status**: 0 errors
- **Tests added/modified**: 4 new tests in test_in_memory.py

## Loaded Skills
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\persian-writing\SKILL.md
- **Local copy**: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\persian_writing_skill.md
- **Core methodology**: Persian writing quality, no bureaucratic tells (می‌باشد/می‌گردد), proper ZWNJ, Persian numbers and quotes, scholar identity «حجت الاسلام دکتر زنجیر زن حسینی».
