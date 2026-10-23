# DISPATCH — Worker Milestone 2 Remediation (Phase 7 Fixes)

## Mandatory Context
Read `ORIGINAL_REQUEST.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md`.
Read `PROJECT.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\PROJECT.md`.
Read reviewer feedback from `reviewer_m2_2` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m2_2\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Remediation Objectives
1. **Fix `EntityNotFoundException` in `backend/app/core/exceptions.py`**:
   - Inspect `EntityNotFoundException.__init__`.
   - Update it to gracefully handle both call signatures:
     `(entity: Optional[str] = None, identifier: Optional[str] = None, message: Optional[str] = None, **kwargs)`
     If `message` is passed, use it. If `entity` and `identifier` are passed, format the Persian message:
     `f"موجودیت «{entity}» با شناسه «{identifier}» یافت نشد."`.
     Ensure neither call signature ever throws a `TypeError`.
2. **Fix Payment State Machine Resurrection Flaw in `backend/app/services/payment_service.py`**:
   - Inspect `verify_payment` around lines 55-80.
   - Enforce strict terminal state handling: only `"pending"` transactions can be processed.
   - If `tx.get("status") == "paid"`, raise HTTP 400 `PAYMENT_REPLAY_ATTACK`.
   - If `tx.get("status") == "failed"`, raise HTTP 400 `PAYMENT_ALREADY_FAILED` with message `این تراکنش قبلاً ناموفق ثبت شده است و امکان تغییر وضعیت یا استفاده مجدد از آن وجود ندارد.`.
   - Prevent any resurrection from `"failed"` to `"paid"`.
3. **Verify**:
   - Run `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
   - Run `.\backend\.venv\Scripts\python.exe audit_pipeline.py`
   - Add unit test checks verifying both `EntityNotFoundException` signatures and rejection of resurrection from failed to paid.

Write your changes and test outputs to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2_remediation\handoff.md` and report via send_message.


## 2026-10-14T05:17:59Z
You are the Worker subagent for Milestone 2 Remediation (Phase 7).
MANDATORY FIRST STEP: Read ORIGINAL_REQUEST.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2_remediation
Read DISPATCH.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2_remediation\DISPATCH.md
Read reviewer feedback at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m2_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Remediate the 2 issues identified by Reviewer 2:
1. In backend/app/core/exceptions.py, update EntityNotFoundException to accept (entity: Optional[str] = None, identifier: Optional[str] = None, message: Optional[str] = None) so both signatures work without TypeError.
2. In backend/app/services/payment_service.py, prevent resurrection of failed payments (if status == 'failed', reject with HTTP 400 PAYMENT_ALREADY_FAILED; only 'pending' can be processed).
3. Verify test suites:
   .\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
   .\backend\.venv\Scripts\python.exe audit_pipeline.py
4. Write handoff to e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m2_remediation\handoff.md and notify orchestrator via send_message.
