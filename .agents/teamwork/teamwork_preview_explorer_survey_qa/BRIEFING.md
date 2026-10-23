# BRIEFING — 2026-10-12T01:15:00Z

## Mission
Investigate verification harnesses and rules (audit_pipeline.py, backend tests, frontend build) to define acceptance criteria for persistent auth.

## 🔒 My Identity
- Archetype: explorer
- Roles: QA Verification & Pipeline Explorer
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_qa
- Original parent: 174180af-6f26-480c-bb80-0a02fcfc7785
- Milestone: Survey verification harnesses and quality criteria for persistent auth

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify project code files
- Write only to working directory .agents/teamwork/teamwork_preview_explorer_survey_qa
- Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی»
- Strict anti-slop and Persian writing rules apply

## Current Parent
- Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `audit_pipeline.py` (all 8 quality gates, 100 points breakdown)
  - `backend/tests/test_in_memory.py`, `backend/tests/test_i18n_parity.py`, `backend/tests/test_api_v1.py`
  - `backend/app/main.py`, `backend/app/core/config.py`, `backend/app/services/auth_service.py`, `backend/app/models/models.py`, `backend/app/models/database.py`, `backend/app/api/v1/endpoints/auth.py`
  - `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.js`
  - `frontend/src/context/AuthContext.tsx`, `frontend/src/app/login/page.tsx`, `frontend/src/services/apiClient.ts`, `frontend/src/locales/`
  - `zanjirzan_platform.db` (SQLite schema and contents of `users` table)
- **Key findings**:
  1. `audit_pipeline.py` consists of 8 equal-weighted steps (12.5 pts each); all must return 100 for 100/100.
  2. `test_in_memory.py` is invoked directly via `backend/.venv/Scripts/python.exe` without pytest; it expects default student (`09123456789`/`pass`) and admin (`09120000000`/`admin_secret_2026`).
  3. Starlette `TestClient(app)` does not trigger FastAPI `lifespan` unless called with context manager `with TestClient(app):`. Thus DB auto-seeding cannot rely solely on `lifespan`.
  4. The `users` table in `zanjirzan_platform.db` exists with columns `id`, `mobile`, `email`, `full_name`, `hashed_password`, `role`, `is_active`, `created_at`, but is currently EMPTY. Switching to persistent auth without auto-seeding will immediately break `test_in_memory.py`.
  5. `npm run build` compiles 15 static routes and generates PWA assets (`sw.js`, `manifest.json`, `workbox-*.js`), exiting with code 0.
  6. `test_i18n_parity.py` strictly requires matching keys and identical key order across `fa.ts`, `ar.ts`, `en.ts`.
  7. Frontend login files must be decomposed into components/hooks each < 200 lines to satisfy REA requirements.
- **Unexplored areas**: None remaining for this survey.

## Key Decisions Made
- Established complete baseline: `audit_pipeline.py` (100/100), `test_in_memory.py` (pass), `test_i18n_parity.py` (pass), `tsc --noEmit` (pass), `npm run build` (pass).
- Synthesized exact requirements and acceptance criteria for persistent auth transition.

## Artifact Index
- DISPATCH.md — Parent instructions and task dispatch
- BRIEFING.md — Persistent agent state
- progress.md — Liveness heartbeat and milestone tracker
- report.md — Comprehensive QA & verification harness survey
- handoff.md — 5-component handoff report
