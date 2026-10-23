# Dispatch Assignment — Worker M4 (Phase 9: Comprehensive Edge-Case Test Suites & 100/100 Audit Verification)

## Mission
You are the Worker subagent for Milestone 4 (Phase 9: Comprehensive Edge-Case Test Suites and Audit Pipeline Verification).

MANDATORY FIRST STEP:
Read the authoritative user request at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md`
Specifically inspect the section under header `## Follow-up — 2026-10-14T04:02:02Z` (§R4).
Also read the detailed survey findings and blueprint at:
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9\analysis.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9\handoff.md`

Your working directory is:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m4`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

---

## Detailed Task Requirements

### 1. Edge-Case Test Suite in `backend/tests/test_in_memory.py`:
Add dedicated, comprehensive test functions that cover all Phase 9 requirements using in-memory `TestClient(app)`:

1. **Admin RBAC 403 Forbidden Enforcement**:
   - Authenticate as a standard student user.
   - Assert that sending requests with the student token to EVERY mutating admin endpoint under `/api/v1/admin/` returns strictly `HTTP 403 Forbidden`:
     - `POST /api/v1/admin/courses/create` -> 403
     - `PUT /api/v1/admin/courses/{id}` -> 403
     - `POST /api/v1/admin/courses/{id}/chapters` -> 403
     - `PUT /api/v1/admin/courses/{id}/chapters/{chapter_id}` -> 403
     - `PUT /api/v1/admin/books/{id}` -> 403
     - `PUT /api/v1/admin/orders/{id}/status` -> 403
     - `DELETE /api/v1/admin/courses/{id}` -> 403
     - `GET /api/v1/admin/` -> 403
   - Also verify that unauthenticated requests (no token) return `HTTP 401 Unauthorized`.

2. **RFC 7233 Audio Range Streaming (206 & 416)**:
   - Prefix range: `Range: bytes=0-1023` -> 206 Partial Content, `Content-Range: bytes 0-1023/{total}`, body length 1024.
   - Mid-stream scrubbing: `Range: bytes=1024-2047` -> 206 Partial Content, `Content-Range: bytes 1024-2047/{total}`, body length 1024.
   - Suffix / open-ended range: `Range: bytes=-1024` or open-ended `Range: bytes={total - 1000}-` -> 206 Partial Content with correct slice.
   - Out-of-bounds range: `Range: bytes=999999999-` -> returns `HTTP 416 Range Not Satisfiable` with `Content-Range: bytes */{total}`.
   - Verify `Accept-Ranges: bytes` is present on all 206 responses.
   - Verify that invalid/expired DRM token returns 403 Forbidden regardless of Range header.

3. **Payment Replay Attack & Expired Coupon Rejection**:
   - Replay attack rejection: Initialize a transaction (`POST /api/v1/payment/init`), verify it once (`POST /api/v1/payment/verify`) -> 200 OK. Verify the exact same authority a second time -> returns `HTTP 400 Bad Request` (Payment Replay Attack / already paid).
   - Failed payment resurrection rejection: Verify an authority with status "FAILED" -> returns failed status. Attempting to verify it again must return `HTTP 400 Bad Request`.
   - Expired coupon rejection: Validate a coupon that is expired (e.g. `EXPIRED1402` or with an expired timestamp) -> returns `HTTP 400 Bad Request` with Persian detail message.

4. **Timestamped Study Notes (`/api/v1/notes`) & Scholarly Q&A (`/api/v1/qa`) Lifecycle & Student Isolation**:
   - Study Notes:
     - Student A creates note for a course lesson with `timestamp_sec=420` -> 200 OK.
     - Student A reads notes list -> includes note.
     - Student B requests notes -> Student A's note is NOT visible (complete user isolation).
     - Student B attempts to delete Student A's note -> 403/404 or rejected.
     - Student A deletes note -> 200 OK, note no longer in list.
   - Scholarly Q&A:
     - Anonymous user can read questions (`GET /api/v1/qa/`) -> 200 OK.
     - Anonymous cannot ask (`POST /api/v1/qa/ask`) -> 401 Unauthorized.
     - Student A asks a scholarly question -> 200 OK, returns `is_resolved: False`.
     - Student A attempts to answer the question (`POST /api/v1/qa/{id}/answer`) -> returns `HTTP 403 Forbidden` (only Admin/Scholar can answer!).
     - Admin answers the question (`POST /api/v1/qa/{id}/answer` with admin token) -> 200 OK, sets `is_resolved: True`.
     - Admin attempts to answer a non-existent question -> 404 Not Found.

### 2. Synchronization of `backend/tests/test_api_v1.py`:
- Update or expand `test_api_v1.py` to synchronize edge-case assertions for the HTTP test suite (or ensure it runs smoothly when a live server is active).
- Ensure no syntax errors or breaking changes are introduced.

### 3. Isolation & Stability in `zanjirzan_platform.db`:
- Ensure all test functions in `test_in_memory.py` use unique identifiers (e.g. `uuid.uuid4()`, unique phone numbers, unique usernames) so tests do not collide or depend on leftover state from previous runs.
- Prevent deprecation warnings from causing noise.

---

## Mandatory Verification Commands:
Run these commands and document the full output in your `handoff.md`:
1. `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
   All test functions must pass with exit code 0.
2. `.\backend\.venv\Scripts\python.exe audit_pipeline.py`
   Score MUST be 100 out of 100!

---

## Handoff Deliverable:
Write your self-contained report to:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m4\handoff.md`
Report back to the orchestrator via `send_message` when complete.


## 2026-10-14T06:02:10Z
[Message received from orchestrator 3c84efb7-ad97-49f7-9b54-a24b5b5fe364]:
Worker subagent for Milestone 4 (Phase 9: Comprehensive Edge-Case Test Suite & 100/100 Audit Verification).
Execute test suite expansion in backend/tests/test_in_memory.py, test_api_v1.py, verify replay attack, expired coupon, RFC 7233 range streaming, notes CRUD & isolation, QA lifecycle & RBAC 403, and maintain 100/100 audit score.
