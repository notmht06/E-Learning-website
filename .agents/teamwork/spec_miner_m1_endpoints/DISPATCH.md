# Dispatch — M1 Spec Miner Endpoints & Services

## Objective
Extract exact specification requirements and interface contracts for backend endpoints and services in Milestone 1.

## Working Directory
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints`

## Required Readings
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically `## Follow-up — 2026-10-13T03:02:29Z`)
- `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_backend\survey_backend.md`

## Focus
1. `POST /api/v1/courses/{course_id}/enroll` endpoint in `courses.py` calling `course_service.enroll_student`.
2. `GET /api/v1/courses/enrolled` endpoint in `courses.py` calling `course_service.get_enrolled_courses_for_user`.
3. `POST /api/v1/orders/create` async conversion, `get_optional_user`, and auto-enrollment in `order_service.py`.
4. Duplicate enrollment error response: HTTP 400 with structured Persian AppException:
   «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.»
5. `GET /api/v1/auth/me` and `UserResponse` schema exposing `enrolled_course_ids: List[str]` and `enrolled_courses_count: int`.

## Deliverable
Write `report_endpoints.md` and `handoff.md` with exact implementation instructions for the worker.


## 2026-10-13T03:15:33Z
You are the M1 Endpoints Spec Miner (spec_miner_m1_endpoints).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints

Read your dispatch instructions in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\spec_miner_m1_endpoints\DISPATCH.md
and the authoritative user request in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (specifically '## Follow-up — 2026-10-13T03:02:29Z').

Also read:
e:\personal\philosophy_zanjirzan_app\PROJECT.md
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_backend\survey_backend.md

Objective:
Detail the exact implementation for endpoints and services:
- POST /api/v1/courses/{course_id}/enroll in courses.py and course_service.py
- GET /api/v1/courses/enrolled in courses.py and course_service.py
- POST /api/v1/orders/create async conversion, user attachment, auto-enrollment in orders.py and order_service.py
- Duplicate enrollment Persian error (HTTP 400): «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.»
- GET /api/v1/auth/me and UserResponse in schemas/auth.py with enrolled_course_ids and enrolled_courses_count

Write report_endpoints.md and handoff.md in your working directory.
When done, notify me via send_message with a summary and absolute file paths.
