# DISPATCH — Explorer Testing & Quality

## Mission
Investigate test suites, audit pipeline, anti-slop rules, and verification criteria for end-to-end persistent authentication.

## Authoritative User Request
Read: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically Follow-up — 2026-10-12T00:59:20Z)

## Scope & Target Files
- `audit_pipeline.py` at root (how tests and scores are calculated, anti-slop rules, scholar identity checks, Persian writing checks)
- `backend/tests/test_in_memory.py` and any other test files in `backend/tests/` (what tests are run, how auth is currently tested, how to ensure 100% pass)
- Frontend build commands and checks (`npm run build`)
- Persian writing rules: `.agents/rules/persian-writing.md` (no «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals ۰-۹, «گیومه»)
- Scholar identity rules: `.agents/rules/scholar-identity.md` («حجت الاسلام دکتر زنجیر زن حسینی»)
- Anti-slop rules: `.agents/rules/anti-slop.md`
- Identify testing gaps and define clear verification plan for SQLite persistent database auth.

## Deliverable
Write your comprehensive analysis to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_testing_quality\report.md` and complete your `handoff.md`.


## 2026-10-12T01:02:42Z
[Message from d55861c4-3fee-4b2d-9337-907247691604]
You are the Testing & Quality Explorer for Orchestrator 3.
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_testing_quality
Read your instructions in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_testing_quality\DISPATCH.md
Read the authoritative user request in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Investigate:
1. `audit_pipeline.py`: examine how audit checks are performed (Scholar Identity, Anti-Slop, Persian Writing, build checks, backend test runner), scoring mechanics, and failure thresholds.
2. `backend/tests/test_in_memory.py` and test suite: analyze all test cases, what they assert, how they run, and verify how to run them successfully.
3. Frontend build verification: `npm run build` requirements, linting, TypeScript types.
4. Compliance constraints:
   - Scholar official name: «حجت الاسلام دکتر زنجیر زن حسینی»
   - Anti-AI-slop: zero blur-3xl, zero bg-clip-text text-transparent, zero animate-pulse dots, zero generic 3-card grids
   - Persian writing: no «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals ۰-۹, «گیومه»
5. Verification strategy: determine exact criteria and automated tests required to prove acceptance criteria:
   - Register inserts row in SQLite database.
   - Duplicate phone returns HTTP 400 with Persian error message.
   - Login verifies bcrypt hash and issues valid JWT.
   - Wrong credentials return 400/401 gracefully.
   - Inline field error display on frontend.
   - Session hydration and route protection.

Write your report to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_testing_quality\report.md` and complete your `handoff.md`. Communicate back when done.
