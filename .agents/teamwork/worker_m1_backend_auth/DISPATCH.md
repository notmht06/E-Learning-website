# DISPATCH — Worker M1 Backend Auth

## Mission
Implement Milestone 1: Backend Persistent Database Authentication using live SQLAlchemy AsyncSession with SQLite persistence, eliminating all in-memory mock storage.

## Authoritative User Request
Read: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically Follow-up — 2026-10-12T00:59:20Z)
Read: `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
Read explorer reports and blueprints in:
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_backend_auth\report.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_backend_auth\handoff.md`
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_testing_quality\report.md`

## Write Ownership (Exclusive to this Worker)
You have exclusive write access to:
- `backend/app/models/models.py`
- `backend/app/models/database.py`
- `backend/app/services/auth_service.py`
- `backend/app/api/v1/endpoints/auth.py`
- `backend/app/api/deps.py`
- `backend/tests/test_in_memory.py`

Do NOT touch any frontend files.

## Technical Requirements
1. **`models.py`**:
   - `User` table model: `phone = Column(String(20), unique=True, index=True, nullable=False)`. Provide `@property def mobile(self): return self.phone` for backward compatibility.
   - Include `wallet_balance = Column(String(50), default="۰ تومان", nullable=False)` and `enrolled_courses_count = Column(Integer, default=0, nullable=False)`.
   - Provide `to_dict()` method returning dictionary conforming to `UserResponse` schema.
2. **`database.py`**:
   - SQLite WAL mode pragmas (`PRAGMA journal_mode=WAL`, `PRAGMA foreign_keys=ON`).
   - Explicit `import app.models.models` so metadata registers tables before `create_all`.
   - Idempotent `seed_default_users(db: AsyncSession)` function provisioning:
     - Student: phone `09123456789`, password `pass`, role `student` (hashed with bcrypt).
     - Admin: phone `09120000000`, password `admin_secret_2026`, role `admin` (hashed with bcrypt).
     - Also ensure `usr-140301` user exists or alias satisfies `test_api_v1.py` / `test_in_memory.py`.
3. **`auth_service.py`**:
   - Refactor completely to use live SQLAlchemy `AsyncSession` database transactions. Eliminate `self.users = {}`.
   - `authenticate_user(db: AsyncSession, phone: str, password: str)`: query by `phone`, verify bcrypt hash using `verify_password`. Raise `AppException(status_code=401, error_code="AUTHENTICATION_FAILED", message="شماره تماس یا رمز عبور واردشده نادرست است.")` if invalid.
   - `register_user(db: AsyncSession, phone: str, password: str, full_name: str, role: str)`: check if phone already exists in DB. If exists, raise `AppException(status_code=400, error_code="USER_ALREADY_EXISTS", message=f"شماره تماس «{phone}» قبلاً در سامانه ثبت شده است.")`. Insert new `User` row with `get_password_hash(password)`, commit transaction, refresh user.
   - `get_user_by_id(db: AsyncSession, user_id: str)`: query `User` from DB.
4. **`api/v1/endpoints/auth.py`**:
   - Make all endpoints `async def`.
   - Inject `db: AsyncSession = Depends(get_db)`.
   - In `/register`, call `await auth_service.register_user(db, ...)`, return access token + user response.
   - In `/login`, call `await auth_service.authenticate_user(db, ...)`, return access token + user response.
   - In `/me` or `/profile`, return authenticated user data.
5. **`api/deps.py`**:
   - Update `get_current_user` to async query using `db: AsyncSession = Depends(get_db)`.
   - Update `get_current_admin` via `Depends(get_current_user)`.
6. **`backend/tests/test_in_memory.py`**:
   - Keep all existing tests passing 100%.
   - Add new assertions/tests for:
     - Registering a new user inserts into SQLite DB and returns 200 with JWT.
     - Registering duplicate phone returns HTTP 400 with Persian error message and error code `USER_ALREADY_EXISTS`.
     - Logging in with wrong password returns 401.
     - Accessing `/api/v1/auth/me` with bearer token returns the authenticated profile.
7. **Verification**:
   - Run `backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py` and verify all tests pass.
   - Run `backend\.venv\Scripts\python.exe audit_pipeline.py` and verify 100/100 score.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your completion report in `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1_backend_auth\handoff.md`.


## 2026-10-12T01:14:31Z
You are the Backend Auth Worker (worker_m1) for Orchestrator 3.
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1_backend_auth
Read your instructions in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m1_backend_auth\DISPATCH.md
Read the authoritative user request in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md
Read: e:\personal\philosophy_zanjirzan_app\PROJECT.md
Read explorer reports and blueprints in:
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_backend_auth\report.md
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_backend_auth\handoff.md
- e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_testing_quality\report.md

You have EXCLUSIVE write access to:
- backend/app/models/models.py
- backend/app/models/database.py
- backend/app/services/auth_service.py
- backend/app/api/v1/endpoints/auth.py
- backend/app/api/deps.py
- backend/tests/test_in_memory.py

Implement Milestone 1:
1. Update `models.py` for User schema (phone, wallet_balance, enrolled_courses_count, to_dict, backward-compatible mobile property).
2. Update `database.py` with SQLite WAL mode, proper metadata imports, and seed_default_users for student (09123456789/pass) and admin (09120000000/admin_secret_2026).
3. Refactor `auth_service.py` to use live SQLAlchemy AsyncSession transactions and queries with bcrypt password verification, eliminating in-memory mock storage. Enforce unique phone check with structured Persian error and AppException.
4. Update `api/v1/endpoints/auth.py` to be async def and inject `db: AsyncSession = Depends(get_db)`. Ensure `/register`, `/login`, and `/me` (or `/profile`) work seamlessly.
5. Update `api/deps.py` for async session user retrieval.
6. Augment `backend/tests/test_in_memory.py` with persistent registration, duplicate phone rejection, wrong password 401, and me hydration tests.
7. Run the tests using `backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py` and `backend\.venv\Scripts\python.exe audit_pipeline.py`. Ensure 100% pass!
