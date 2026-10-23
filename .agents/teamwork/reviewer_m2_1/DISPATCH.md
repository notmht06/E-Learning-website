# DISPATCH — Reviewer 1 for Milestone 2 (Phase 7)

## Mandatory Context
Read `ORIGINAL_REQUEST.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (section `## Follow-up — 2026-10-14T04:02:02Z §R2`).
Read `PROJECT.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\PROJECT.md`.
Read worker handoff at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md`.

## Review Scope
Review Milestone 2 (Phase 7):
1. Payment Replay Protection in `payment_service.py` and `payment.py`: verify that repeat verification returns HTTP 400 (`PAYMENT_REPLAY_ATTACK`).
2. Server-side pricing in `order_service.py`: verify that client price tampering is neutralized and order totals match catalog rates.
3. Coupon validation in `coupon_service.py`: check expiration and active status validation. Check removal of bureaucratic tell «منظور گردید» -> «منظور شد».
4. AI Token-by-Token SSE streaming in `endpoints/ai.py` and `ai_service.py`: check `text/event-stream`, prompt max_length (2000 chars), and `TokenBucketRateLimiter` in `rate_limiter.py`.
5. Admin RBAC in `admin.py`: check router-level `dependencies=[Depends(get_current_admin)]` and root route `GET /` returning HTTP 403 for student tokens.
6. Rules: Scholar Identity («حجت الاسلام دکتر زنجیر زن حسینی»), Anti-AI-Slop, Persian Writing.

## Verification Commands
`.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
`.\backend\.venv\Scripts\python.exe audit_pipeline.py`

Deliver your review with verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` and send_message.

## 2026-10-14T05:01:39Z
[Message] sender=3c84efb7-ad97-49f7-9b54-a24b5b5fe364
You are Reviewer 1 for Milestone 2 (Phase 7: Advanced Payment Security, Server-Side Pricing, AI SSE Streaming, and Admin RBAC).
MANDATORY FIRST STEP: Read ORIGINAL_REQUEST.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (§R2).
Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m2_1
Read DISPATCH.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m2_1\DISPATCH.md
Read worker handoff at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md

Review code changes in backend/app/services/payment_service.py, order_service.py, coupon_service.py, ai_service.py, rate_limiter.py, and endpoints/payment.py, ai.py, admin.py.
Run tests:
.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
.\backend\.venv\Scripts\python.exe audit_pipeline.py
Write your review and clear verdict (APPROVE or REQUEST_CHANGES) in handoff.md and report via send_message.
