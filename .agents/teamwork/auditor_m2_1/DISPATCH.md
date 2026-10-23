# DISPATCH — Forensic Auditor for Milestone 2 (Phase 7)

## Mandatory Context
Read `ORIGINAL_REQUEST.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md`.
Read `PROJECT.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\PROJECT.md`.
Read worker handoff at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md`.

## Forensic Integrity Audit Scope
Verify authentic implementation and zero cheating across Milestone 2:
1. **Static Analysis & Anti-Cheat**:
   - Verify payment replay logic in `payment_service.py` is genuine (checks status, tracks tracking codes) and not hardcoded to pass specific test values.
   - Verify `resolve_server_price` in `order_service.py` genuinely queries catalog prices from course/book services and recalculates totals.
   - Verify `coupon_service.py` genuinely checks expiration dates and that «منظور گردید» was eliminated.
   - Verify `POST /chat/stream` genuinely uses `StreamingResponse` with an async generator producing SSE events, not a static block returned all at once.
   - Verify `get_current_admin` is enforced at router level on `admin.router`.
2. **Project Rules**:
   - Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» exclusively.
   - Anti-AI-Slop: No `blur-3xl`, no text gradients, no pulsing dots.
   - Persian Writing: No «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals, Persian quotes.
3. **Pipeline Verification**:
   - Run `.\backend\.venv\Scripts\python.exe audit_pipeline.py` and confirm 100/100 score.

Deliver your verdict (`CLEAN` or `INTEGRITY VIOLATION`) with evidence in `handoff.md` and send_message.

## 2026-10-14T05:01:39Z
You are the Forensic Integrity Auditor for Milestone 2 (Phase 7: Advanced Payment Security, Server-Side Pricing, AI SSE Streaming, and Admin RBAC).
MANDATORY FIRST STEP: Read ORIGINAL_REQUEST.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md.
Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\auditor_m2_1
Read DISPATCH.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\auditor_m2_1\DISPATCH.md
Read worker handoff at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2\handoff.md

Conduct forensic integrity audit:
1. Static analysis: ensure zero hardcoded test outputs or dummy facades.
2. Confirm payment replay protection, authority locking, and tracking code uniqueness are genuine.
3. Confirm resolve_server_price genuinely looks up catalog rates and neutralizes price tampering.
4. Confirm coupon expiration logic is genuine and «منظور گردید» was eliminated.
5. Confirm POST /chat/stream genuinely uses StreamingResponse with async generator yielding SSE chunks.
6. Confirm get_current_admin is enforced at router level on admin.py.
7. Confirm Scholar Identity («حجت الاسلام دکتر زنجیر زن حسینی»), Anti-AI-Slop, and Persian writing rules.
8. Run audit_pipeline.py and verify score 100/100.
Deliver your verdict (CLEAN or INTEGRITY VIOLATION) in handoff.md and report via send_message.
