# DISPATCH — Explorer M1 Remediation 1 (deps.py)

## Mission
Analyze the remediation for Reviewer 2 Critical Finding 1 in `backend/app/api/deps.py`.

## Background / Reviewer Feedback
In `backend/app/api/deps.py` (lines 52–60), `get_current_user` currently contains an in-memory fallback returning a synthetic user dictionary (`"کاربر احرازشده"`) if `user_id` is not found in SQLite.
This violates the core directive to eliminate in-memory mocks, breaks interface contract for `/api/v1/auth/me`, and permits privilege escalation.

## Task
Formulate the exact remediation code for `deps.py`:
- Remove all synthetic user fallback dictionaries.
- If `user_id` is missing or `auth_service.get_user_by_id` returns `None`, strictly raise `HTTPException(status_code=401, detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.")`.
- Verify interaction with `get_current_admin`.
- Ensure all tests in `test_in_memory.py` continue to pass.

Write report to `report.md` and complete `handoff.md`.

## 2026-10-12T01:40:22Z
You are Explorer Remediation 1 for Milestone 1.
Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_1
Read instructions: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_1\DISPATCH.md
Read authoritative user request: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Read reviewer feedback: Reviewer 2 found that `backend/app/api/deps.py` (lines 52–60) falls back to an in-memory synthetic user dict if user_id is not in SQLite.
Design the exact remediation to remove this mock and raise HTTP 401. Write report.md and handoff.md.

