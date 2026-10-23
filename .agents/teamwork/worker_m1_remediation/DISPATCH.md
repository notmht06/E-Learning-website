# DISPATCH — Worker M1 Remediation

## Mission
Apply the remediation patches formulated by the remediation explorers to resolve Reviewer 2 findings in Milestone 1:
1. `backend/app/api/deps.py`: Remove synthetic mock fallback dictionary in `get_current_user`; raise strict HTTP 401 when user is not found in database.
2. `backend/app/services/auth_service.py`: Add `try ... except IntegrityError:` around `db.flush()` in registration transaction, offload CPU-bound bcrypt to thread pool via `asyncio.to_thread`, and use Persian quotes `«{phone}»`.
3. `backend/tests/test_in_memory.py`: Add test assertions for strict 401 on unknown user token and concurrent duplicate registration.

## Reference Patches & Reports
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_1\report.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_1\deps.patch`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_2\report.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_2\handoff.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_3\test_in_memory.patch`

## Write Ownership
You have exclusive write access to:
- `backend/app/api/deps.py`
- `backend/app/services/auth_service.py`
- `backend/tests/test_in_memory.py`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification
Run:
- `backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
- `backend\.venv\Scripts\python.exe audit_pipeline.py`
Ensure all tests pass with 100% score!
Deliver your handoff report to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1_remediation\handoff.md`.


## 2026-10-12T01:48:47Z
[Message] timestamp=2026-10-12T01:48:47Z sender=d55861c4-3fee-4b2d-9337-907247691604 priority=MESSAGE_PRIORITY_HIGH content=You are the Remediation Worker (worker_m1_remediation) for Orchestrator 3.
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1_remediation
Read your instructions in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1_remediation\DISPATCH.md
Read the authoritative user request in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Read the remediation explorer reports:
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_1\deps.patch
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_2\report.md
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_3\test_in_memory.patch

You have exclusive write access to:
- backend/app/api/deps.py
- backend/app/services/auth_service.py
- backend/tests/test_in_memory.py

Apply the remediations:
1. In `deps.py`: eliminate in-memory synthetic user dict fallback, strictly raise HTTP 401.
2. In `auth_service.py`: wrap db.flush() with try...except IntegrityError, offload bcrypt to asyncio.to_thread, use Persian quotes «{phone}».
3. In `backend/tests/test_in_memory.py`: apply test additions for strict 401 unknown user and concurrent duplicate phone registration.
4. Run tests: `backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py` and `backend\.venv\Scripts\python.exe audit_pipeline.py`. Ensure 100% pass!
