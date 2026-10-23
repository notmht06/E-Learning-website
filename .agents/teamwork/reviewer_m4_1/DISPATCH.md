# Dispatch Assignment — Reviewer M4 1 (Milestone 4 / Phase 9)

## Mission
You are Reviewer 1 for Milestone 4 (Phase 9: Comprehensive Edge-Case Test Suite & 100/100 Audit Verification).

MANDATORY FIRST STEP:
Read the authoritative user request at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md`
Specifically inspect ## Follow-up — 2026-10-14T04:02:02Z (§R4).

Your working directory is:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m4_1`
Read worker handoff at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m4\handoff.md`

## Review Tasks
1. Review code changes in `backend/tests/test_in_memory.py`, `backend/tests/test_api_v1.py`, `backend/app/api/v1/endpoints/notes.py`, and `backend/app/services/note_service.py`.
2. Verify Admin RBAC 403 test completeness: verify that student token attempts to mutate courses, chapters, books, orders, and delete courses are rejected with 403.
3. Verify RFC 7233 Audio Range streaming tests: 206 for prefix/mid/suffix ranges, 416 for out-of-bounds, Accept-Ranges header, and DRM priority.
4. Verify Payment replay and expired coupon tests: 400 for repeated verify, 400 for failed resurrection, 400 for expired coupons.
5. Verify Study Notes CRUD and Scholarly Q&A tests: user data isolation and student answer 403 rejection.
6. Run the test commands:
   - `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
   - `.\backend\.venv\Scripts\python.exe backend/tests/test_api_v1.py`
   - `.\backend\.venv\Scripts\python.exe audit_pipeline.py`
7. Check Scholar Identity («حجت الاسلام دکتر زنجیر زن حسینی») and Persian writing rules.
8. Deliver your review and clear verdict (**APPROVE** or **REQUEST_CHANGES**) in:
   `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m4_1\handoff.md`
9. Report back to the orchestrator via `send_message`.


## 2026-10-14T06:18:23Z
You are Reviewer 1 for Milestone 4 (Phase 9: Comprehensive Edge-Case Test Suite & 100/100 Audit Verification).

MANDATORY FIRST STEP: Read ORIGINAL_REQUEST.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (§R4).
Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m4_1
Read DISPATCH.md at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\reviewer_m4_1\DISPATCH.md
Read worker handoff at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m4\handoff.md

Review all code changes in backend/tests/test_in_memory.py, test_api_v1.py, notes.py, note_service.py.
Run tests:
.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py
.\backend\.venv\Scripts\python.exe backend/tests/test_api_v1.py
.\backend\.venv\Scripts\python.exe audit_pipeline.py
Write your review and clear verdict (APPROVE or REQUEST_CHANGES) in handoff.md and report via send_message.
