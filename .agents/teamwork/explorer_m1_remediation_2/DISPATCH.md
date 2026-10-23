# DISPATCH — Explorer M1 Remediation 2 (auth_service.py)

## Mission
Analyze the remediation for Reviewer 2 Findings 2, 3, and 4 in `backend/app/services/auth_service.py`.

## Background / Reviewer Feedback
1. Concurrency Shield: In `_register_user_tx`, wrapping `await db.flush()` in `try ... except IntegrityError:` is needed so race-condition duplicate inserts catch SQLite IntegrityError and raise structured `AppException(status_code=400, code="USER_ALREADY_EXISTS", message=f"شماره تماس «{phone}» قبلاً در سامانه ثبت شده است. لطفاً وارد شوید یا از شماره دیگری استفاده فرمایید.")`.
2. CPU-bound bcrypt: Recommend offloading `bcrypt` execution using `asyncio.to_thread` or thread pool.
3. Persian Quotes: Fix Latin single quotes to Persian guillemets `«...»`.

## Task
Formulate the exact drop-in remediation code for `auth_service.py`.
Write report to `report.md` and complete `handoff.md`.


## 2026-10-12T01:40:22Z
You are Explorer Remediation 2 for Milestone 1.
Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_2
Read instructions: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_remediation_2\DISPATCH.md
Read authoritative user request: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Read reviewer feedback: Reviewer 2 found that `backend/app/services/auth_service.py` lacks `try...except IntegrityError` around flush, lacks bcrypt thread offload, and uses Latin quotes.
Design the exact remediation code for auth_service.py. Write report.md and handoff.md.
