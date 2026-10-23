# DISPATCH — Worker Milestone 2 (Phase 7)

## Mandatory Context
Read `ORIGINAL_REQUEST.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically under `## Follow-up — 2026-10-14T04:02:02Z §R2`).
Read `PROJECT.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\PROJECT.md`.
Read backend survey findings at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p6_p7\analysis.md` and `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 2 Objectives (Phase 7)
1. **Payment Replay Attack Prevention & Server-Side Pricing (`payment_service.py`, `payment.py`, `order_service.py`, `coupon_service.py`)**:
   - In `payment_service.py`, enforce replay protection:
     - Check if transaction with `authority` was already verified (`status == "paid"`).
     - If verified previously, reject with HTTP 400 (or `AppException(status_code=400, error_code="PAYMENT_REPLAY_ATTACK", message="این تراکنش قبلاً تایید شده است و امکان استفاده مجدد از آن وجود ندارد.")`).
     - Enforce authority and tracking code uniqueness with database locks / atomic transitions.
   - In `order_service.py`:
     - Calculate order pricing 100% server-side: look up course and book catalog prices (from DB / catalog items) instead of trusting client-supplied prices.
     - Validate coupon code against `coupon_service.py` with expiration dates and active flags.
   - In `coupon_service.py`:
     - Cleanse bureaucratic tell «منظور گردید» -> «منظور شد».
     - Support coupon validation with expiration dates and reject expired coupons.
2. **AI Token-by-Token Streaming SSE & Token-Bucket Rate Limiter (`ai.py`, `ai_service.py`, `rate_limiter.py`)**:
   - In `backend/app/core/rate_limiter.py`:
     - Implement `TokenBucketRateLimiter` supporting per-user token buckets (capacity e.g. 10 tokens, refill rate e.g. 1 token/sec).
   - In `backend/app/services/ai_service.py`:
     - Implement `stream_chat(request)` as an async generator producing token-by-token SSE events:
       `data: {"chunk": "...", "done": false}\n\n` and finishing with `data: {"done": true}\n\n`.
   - In `backend/app/api/v1/endpoints/ai.py`:
     - Add `POST /chat/stream` (or support streaming) returning `StreamingResponse(..., media_type="text/event-stream")`.
     - Enforce maximum input prompt length validation (e.g. 2000 chars) rejecting oversized prompts with HTTP 400.
     - Apply `TokenBucketRateLimiter` per user, returning HTTP 429 when rate limit exceeded.
3. **Strict Admin RBAC (`admin.py`, `deps.py`)**:
   - In `backend/app/api/v1/endpoints/admin.py`:
     - Add router-level `dependencies=[Depends(get_current_admin)]` on `router = APIRouter(dependencies=[Depends(get_current_admin)])`.
     - Add root route `@router.get("/")` returning `{ "status": "ok", "message": "پنل مدیریت حجت الاسلام دکتر زنجیر زن حسینی" }`.
     - Verify that non-admin students attempting to access any admin endpoint (including GET /) are strictly rejected with HTTP 403 Forbidden.
4. **Project Rules**:
   - Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» exclusively.
   - Anti-AI-Slop & Persian Writing compliance (no «می‌باشد», no «می‌گردد»).

## Verification Requirements
Worker must run:
1. `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
2. `.\backend\.venv\Scripts\python.exe audit_pipeline.py`
Record commands and outputs in `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md`.


## 2026-10-14T04:44:41Z
You are the Worker subagent for Milestone 2 (Phase 7: Advanced Payment Security, Server-Side Pricing, AI SSE Streaming, and Admin RBAC).

MANDATORY FIRST STEP: Read the authoritative user request at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Specifically inspect ## Follow-up — 2026-10-14T04:02:02Z (§R2).

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2
Read your task dispatch file at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\DISPATCH.md
Read the backend explorer survey findings at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p6_p7\analysis.md and handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Follow all instructions in DISPATCH.md:
1. In payment_service.py and endpoints/payment.py, enforce payment replay attack rejection (HTTP 400 when verifying already-paid transaction) and authority uniqueness.
2. In order_service.py and coupon_service.py, compute order prices 100% server-side from catalog rates, validate coupons with expiration dates, and remove bureaucratic tell «منظور گردید» -> «منظور شد».
3. In endpoints/ai.py, ai_service.py, and rate_limiter.py, add POST /chat/stream with StreamingResponse text/event-stream, token-by-token generation, prompt max_length validation (2000 chars), and per-user TokenBucketRateLimiter.
4. In endpoints/admin.py, add router-level dependencies=[Depends(get_current_admin)] and root route GET / returning HTTP 403 Forbidden for students.
5. Uphold Scholar Identity («حجت الاسلام دکتر زنجیر زن حسینی») and Persian writing rules.
6. Verify your implementation by running:
   .\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
   .\backend\.venv\Scripts\python.exe audit_pipeline.py
7. Write your changes and test outputs to e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md and report to the orchestrator via send_message.
