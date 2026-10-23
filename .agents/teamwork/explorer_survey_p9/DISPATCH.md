# DISPATCH — Explorer Survey Tests & Audit (Phase 9)

## Mission
Survey the test suites, edge cases, and audit pipeline to produce a detailed investigation report for Phase 9.

## Key Targets to Inspect
1. Existing Test Suites:
   - `backend/tests/test_api_v1.py` & `backend/tests/test_in_memory.py`: Inspect test coverage, existing test fixtures, client setup, and authentication helpers.
2. Required Edge-Case Tests (ORIGINAL_REQUEST §R4):
   - Unauthorized student access to `/api/v1/admin` returns HTTP 403 Forbidden.
   - RFC 7233 `Range: bytes=...` requests return HTTP 206 Partial Content with correct slice and `Content-Range`.
   - Replay attack rejection on payment verification and expired coupon rejection.
   - Timestamped study notes CRUD (`/api/v1/notes`) and scholarly Q&A interactions (`/api/v1/qa`). Check if these endpoints currently exist, their routes, and how they should be tested.
3. Quality & Audit Pipeline:
   - `audit_pipeline.py`: Check rules (Scholar Identity, Anti-AI-Slop, Persian Writing, SEO, Backend).
   - What is the current score and what checks are executed?

## Working Directory
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9`

## Deliverable
Write your findings to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9\analysis.md` and `handoff.md`.


## 2026-10-14T04:06:09Z
You are an Explorer subagent conducting the survey phase for Edge-Case Test Suites and Quality/Audit Pipeline (Phase 9).

MANDATORY FIRST STEP: Read the authoritative user request at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Specifically inspect the section under header ## Follow-up — 2026-10-14T04:02:02Z.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9
Read your task dispatch file at:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9\DISPATCH.md

Your tasks:
1. Examine existing tests in backend/tests/test_api_v1.py and backend/tests/test_in_memory.py:
   - Check test fixtures, client invocation (TestClient/AsyncClient), and existing coverage.
2. Examine required edge cases from Phase 9:
   - Unauthorized student access to /api/v1/admin returning HTTP 403 Forbidden.
   - RFC 7233 Range: bytes=... requests returning HTTP 206 Partial Content with correct slice and Content-Range.
   - Replay attack rejection on payment verification and expired coupon rejection.
   - Timestamped study notes CRUD (/api/v1/notes) and scholarly Q&A interactions (/api/v1/qa): check current state of these models/endpoints and what tests are needed.
3. Examine audit_pipeline.py: check what checks it performs (Scholar Identity, Anti-AI-Slop, Persian Writing, Backend Architecture, SEO). Note any potential risks.
4. Write your detailed technical findings and recommendations to:
   e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9\analysis.md
   and write a self-contained handoff to:
   e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p9\handoff.md
5. Send a completion message back to the orchestrator when finished.
