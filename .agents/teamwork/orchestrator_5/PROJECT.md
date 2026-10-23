# Project: Dr. Zanjirzan Platform Phases 6-9 Refactoring & Hardening
## (FastAPI + SQLAlchemy AsyncSession + Next.js Standalone + RFC 7233 + Dribbble Palette)

## Architecture
- **Backend Architecture**:
  - Non-blocking asynchronous REST API with FastAPI and SQLAlchemy `AsyncSession` (`backend/app/models/database.py`, `backend/app/models/models.py`).
  - Models: `User`, `Course`, `Lesson`, `Enrollment`, `UserFavorite`, `Order`, `OrderItem`, `PaymentTransaction`, `StudyNote`, `Question`, `Answer`.
  - Composite indexes: `(user_id, course_id)` on `Enrollment` (`ix_enrollments_user_course`) and `UserFavorite` (`ix_user_favorites_user_course`).
  - Query Optimization: `selectinload` for `Course.lessons`, `Order.items`, `User.enrollments`.
  - Media Streaming: RFC 7233 Range requests with `206 Partial Content`, `Accept-Ranges: bytes`, `Content-Range: bytes {start}-{end}/{total}`, suffix range parsing (`bytes=-N`), out-of-range `416 Range Not Satisfiable`.
  - Security: Atomic payment replay protection with database locks, strict terminal state verification (`paid` and `failed` cannot be re-verified or resurrected), 100% server-side pricing, coupon expiry checks, strict admin RBAC `dependencies=[Depends(get_current_admin)]`.
  - AI Assistant: Token-by-token SSE streaming via `StreamingResponse` (`text/event-stream`), prompt length validation, `TokenBucketRateLimiter`.
- **Frontend Architecture**:
  - Next.js 15 App Router with `output: 'standalone'` and HTTP security headers (`DENY`, `nosniff`, `strict-origin-when-cross-origin`).
  - Typography: `Vazirmatn` and `Lalezar` configured via `next/font` with `display: 'swap'`.
  - Design Tokens: Dribbble production palette (`#FCF9F4`, `#D6534F`, `#1B1B1B`, `#F2EFE9`) documented in `DESIGN.md`.
  - Docker & Deploy: Multi-stage Dockerfile, docker-compose with frontend `wget` healthcheck and synchronized `SECRET_KEY`.
- **Quality & Audit**:
  - Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» exclusively.
  - Anti-AI-Slop: Zero `blur-3xl`, zero text gradients, zero pulsing dots, zero generic cards.
  - Persian Writing: No bureaucratic tells («می‌باشد», «می‌گردد»), proper ZWNJ, Persian numerals, Persian quotes.
  - Test suites: `test_in_memory.py` (20/20 passed), `test_api_v1.py` (19/19 passed), and `audit_pipeline.py` (100/100 passed).

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Enrollment Composite Index | Add composite Index("ix_enrollments_user_course", "user_id", "course_id") | M1 | Phase 6 | DONE |
| 2 | UserFavorite Model & Index | Create UserFavorite table with composite index (user_id, course_id) for Dribbble Favourite tab | M1 | Phase 6 | DONE |
| 3 | AsyncSession Event Loop Hygiene | Ensure all endpoint routes use pure non-blocking AsyncSession transactions | M1 | Phase 6 | DONE |
| 4 | selectinload Query Optimization | Apply selectinload to eliminate N+1 latency across course, order, and auth services | M1 | Phase 6 | DONE |
| 5 | RFC 7233 Audio Range Streaming | Implement 206 Partial Content, suffix ranges, and 416 out-of-range in stream.py | M1 | Phase 6 | DONE |
| 6 | Payment Replay Protection | Enforce atomic payment status checks, reject replay & resurrection with HTTP 400 | M2 | Phase 7 | DONE |
| 7 | Server-Side Pricing & Coupons | Compute order prices 100% server-side and add coupon expiration validation | M2 | Phase 7 | DONE |
| 8 | AI SSE Token Streaming | Add POST /api/v1/ai/chat/stream with text/event-stream and TokenBucketRateLimiter | M2 | Phase 7 | DONE |
| 9 | Strict Admin RBAC | Enforce get_current_admin at router level on admin.py and root route 403 for students | M2 | Phase 7 | DONE |
| 10 | Archive Deprecated Briefs | Move antigravity-redesign-brief*.md from root into docs/archive/ | M3 | Phase 8 | DONE |
| 11 | Harmonize DESIGN.md Palette | Establish DESIGN.md as single source of truth for Dribbble palette (#FCF9F4, #D6534F, #1B1B1B, #F2EFE9) | M3 | Phase 8 | DONE |
| 12 | Font Unification via next/font | Configure Vazirmatn and Lalezar via next/font in layout.tsx with display: 'swap' | M3 | Phase 8 | DONE |
| 13 | Next.js Standalone & Security Headers | Enable output: 'standalone' and 3 security headers in next.config.js | M3 | Phase 8 | DONE |
| 14 | Docker Compose & Env Sync | Add frontend healthcheck and harmonize SECRET_KEY in docker-compose.yml and .env.example | M3 | Phase 8 | DONE |
| 15 | In-Memory Edge-Case Test Suite | Expand test_in_memory.py with Admin 403, Range 206/416, Replay 400, Notes & QA lifecycle | M4 | Phase 9 | DONE |
| 16 | API v1 HTTP Test Suite Sync | Expand test_api_v1.py with edge-case HTTP assertions | M4 | Phase 9 | DONE |
| 17 | Final Audit Pipeline Verification | Verify test suites pass 100% and audit_pipeline.py maintains 100/100 | M4 | Phase 9 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Event Loop & Query Optimization, UserFavorite, RFC 7233 Range Streaming | Features 1-5 | none | DONE |
| M2 | Payment Replay Security, Server Pricing, AI SSE Streaming, Admin RBAC | Features 6-9 | M1 | DONE |
| M3 | Font Unification, Docker Standalone Config & Documentation Harmony | Features 10-14 | none | DONE |
| M4 | Comprehensive Edge-Case Test Suite & 100/100 Audit Verification | Features 15-17 | M1, M2, M3 | DONE |

## Code Layout
- `backend/app/models/models.py` — `Enrollment`, `UserFavorite`, `Order`, `PaymentTransaction`
- `backend/app/models/database.py` — Engine, sessionmaker, schema creation
- `backend/app/services/course_service.py` — Course queries with `selectinload`
- `backend/app/services/order_service.py` — Server-side pricing with `selectinload`
- `backend/app/services/payment_service.py` — Replay-protected verification & failed payment protection
- `backend/app/services/coupon_service.py` — Expiration checks and Persian quality («منظور شد»)
- `backend/app/services/ai_service.py` — SSE generator and token streamer
- `backend/app/core/rate_limiter.py` — `TokenBucketRateLimiter`
- `backend/app/core/exceptions.py` — `EntityNotFoundException` with flexible signatures
- `backend/app/api/v1/endpoints/stream.py` — RFC 7233 Range parser and 206/416 responses
- `backend/app/api/v1/endpoints/admin.py` — Router-level `get_current_admin` RBAC
- `backend/app/api/v1/endpoints/ai.py` — `POST /chat/stream` SSE endpoint
- `frontend/src/app/layout.tsx` — `next/font` configuration for Vazirmatn and Lalezar
- `frontend/next.config.js` — `output: 'standalone'` and security headers
- `docker-compose.yml` — Healthcheck and `SECRET_KEY`
- `docs/archive/` — Archived briefs
- `DESIGN.md` — Dribbble production palette
- `backend/tests/test_in_memory.py` — In-memory test suite (20 tests)
- `backend/tests/test_api_v1.py` — HTTP test suite
- `audit_pipeline.py` — Quality and compliance pipeline (100/100)
