# Dispatch — M1 Explorer Integration Tests

## Objective
Design and specify exact integration tests to be added to `backend/tests/test_in_memory.py` for Milestone 1.

## Working Directory
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_tests`

## Required Readings
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically `## Follow-up — 2026-10-13T03:02:29Z`)
- `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
- `backend/tests/test_in_memory.py`
- `audit_pipeline.py`

## Focus
1. Integration test for student enrollment: `POST /api/v1/courses/course-mabadi-mantiq/enroll` with valid JWT token. Verify HTTP 200 and database persistence.
2. Integration test for duplicate enrollment rejection: Re-enroll in same course. Verify HTTP 400 and Persian error message. Verify no duplicate database records.
3. Integration test for enrolled courses retrieval: `GET /api/v1/courses/enrolled`. Verify enrolled course returned.
4. Integration test for `/api/v1/auth/me`: Verify `enrolled_course_ids` and `enrolled_courses_count` match database state.
5. Integration test for `/api/v1/orders/create`: Verify orders persistence and auto-enrollment for course items.
6. Verify no regressions on existing 10 tests in `test_in_memory.py` and ensure `audit_pipeline.py` compliance.

## Deliverable
Write `report_tests.md` and `handoff.md` with exact implementation instructions for the worker.


## 2026-10-13T03:15:33Z
You are the M1 Integration Tests Explorer (explorer_m1_tests).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_tests

Read your dispatch instructions in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m1_tests\DISPATCH.md
and the authoritative user request in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (specifically '## Follow-up — 2026-10-13T03:02:29Z').

Also read:
e:\personal\philosophy_zanjirzan_app\PROJECT.md
e:\personal\philosophy_zanjirzan_app\backend\tests\test_in_memory.py
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_backend\survey_backend.md

Objective:
Detail the exact integration tests to be added to backend/tests/test_in_memory.py:
- test_course_enrollment_persistence (POST /enroll, HTTP 200, DB persistence)
- test_duplicate_course_enrollment_rejection (re-enroll, HTTP 400, Persian error, no DB duplicate)
- test_enrolled_courses_retrieval (GET /enrolled, verifies active courses)
- test_orders_checkout_persistence (POST /orders/create with user, auto-enrollment)
- Verify zero regression on existing 10 tests.

Write report_tests.md and handoff.md in your working directory.
When done, notify me via send_message with a summary and absolute file paths.
