# BRIEFING — 2026-10-12T01:29:00Z

## Mission
Implement backend persistent database authentication using SQLAlchemy/SQLite, replacing in-memory dictionary while guaranteeing idempotent baseline user seeding, bcrypt hashing, duplicate phone validation, session hydration, and 100% test & audit compliance.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m1
- Original parent: 174180af-6f26-480c-bb80-0a02fcfc7785
- Milestone: Milestone 1: Backend Persistent Database Authentication

## 🔒 Key Constraints
- DO NOT CHEAT: Genuine implementation only. No hardcoded test results, no dummy facades.
- Exclusive Write Ownership:
  - `backend/app/models/models.py`
  - `backend/app/models/database.py`
  - `backend/app/services/auth_service.py`
  - `backend/app/api/v1/endpoints/auth.py`
  - `backend/app/api/deps.py`
  - `backend/tests/test_in_memory.py`
- DO NOT modify frontend or audit files.
- Scholar identity rule: strictly «حجت الاسلام دکتر زنجیر زن حسینی» everywhere.
- Anti-slop rule: no neon blur, no text gradients, no pulsing dots.
- Persian writing rule: no bureaucratic tells («می‌باشد»/«می‌گردد»), correct ZWNJ, Persian quotes (« »), Persian numbers in copy.
- Verification: `backend/tests/test_in_memory.py` must pass 100%, `audit_pipeline.py` must score 100/100.

## Current Parent
- Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785
- Updated: 2026-10-12T01:29:00Z

## Task Summary
- **What to build**: Full persistent async database auth system in FastAPI/SQLAlchemy/SQLite.
- **Success criteria**: All users persisted in SQLite `users` table; baseline seeding idempotent; duplicate phone check raises structured 400 AppException; tests pass 100%; audit pipeline 100/100.
- **Interface contracts**: `PROJECT.md`, `backend/app/schemas/auth.py`, `frontend/src/types/index.ts`.
- **Code layout**: `backend/app/models/`, `backend/app/services/`, `backend/app/api/`.

## Key Decisions Made
- Use async SQLAlchemy queries (`select(User).where(...)`).
- Seed baseline student (`09123456789`) and admin (`09120000000`, strictly «حجت الاسلام دکتر زنجیر زن حسینی») in `init_db()` and lazily in `get_db()`.
- Use `synonym("mobile")` for `phone` on `User` model to guarantee compatibility with both SQLite `mobile` column and `phone` property/Pydantic schemas.
- Provide auto-migration in `database.py` to add `wallet_balance` and `avatar_url` columns to SQLite table if missing.
- Add comprehensive verification tests in `backend/tests/test_in_memory.py`.

## Artifact Index
- `handoff.md` — Final 5-component handoff report.
- `report.md` — Detailed implementation and verification report.
- `progress.md` — Liveness heartbeat.
- `DISPATCH.md` — Original assignment and incoming instructions.

## Change Tracker
- **Files modified**:
  - `backend/app/models/models.py`: Added wallet_balance, avatar_url, phone synonym property, to_dict() serialization.
  - `backend/app/models/database.py`: Idempotent baseline user seeding and migration helper.
  - `backend/app/services/auth_service.py`: Replaced in-memory dict with async SQLAlchemy queries; eliminated auto-provisioning; added phone duplicate check.
  - `backend/app/api/v1/endpoints/auth.py`: Updated endpoints to async def with db: AsyncSession = Depends(get_db).
  - `backend/app/api/deps.py`: Updated get_current_user with db dependency injection.
  - `backend/tests/test_in_memory.py`: Added persistence test for 09191112233, duplicate 400 check, and /me hydration.
- **Build status**: 100% PASS (All tests in test_in_memory.py passed, audit_pipeline.py scored 100/100).
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Pass (100% of integration tests passed).
- **Lint status**: Clean.
- **Tests added/modified**: `test_registration_persistence_and_duplicate_error` in `backend/tests/test_in_memory.py`.

## Loaded Skills
- **Source**: `e:\personal\philosophy_zanjirzan_app\.agents\skills\persian-writing\SKILL.md`
- **Local copy**: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m1\persian_writing_skill.md`
- **Core methodology**: Natural human Persian, no bureaucratic copulas, proper orthography and ZWNJ.
