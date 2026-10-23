# DISPATCH: Worker — Milestone 1: Backend Persistent Database Authentication

Working Directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m1
Role: Backend Database Authentication Worker
Parent: orchestrator_3 (Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Inputs (Read these before starting!)
- Original User Request: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (Read verbatim!)
- Project Scope & Architecture: `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
- Backend Explorer Handoff: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_backend\handoff.md`
- Backend Explorer Report: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_backend\report.md`
- QA Explorer Handoff: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_qa\handoff.md`

## Exclusive Write Ownership
You exclusively own and may modify:
- `backend/app/models/models.py`
- `backend/app/models/database.py`
- `backend/app/services/auth_service.py`
- `backend/app/api/v1/endpoints/auth.py`
- `backend/app/api/deps.py`
- `backend/tests/test_in_memory.py`
DO NOT modify any frontend files or audit files.

## Technical Tasks & Deliverables
1. **`backend/app/models/models.py`**:
   - Add `wallet_balance = Column(String(50), default="0 Tomans")` and `avatar_url = Column(String(255), nullable=True)` to `User` model.
   - Add `@property def phone(self) -> str:` and `@phone.setter def phone(self, val: str): self.mobile = val` to ensure complete compatibility between `mobile` and `phone`.
   - Implement `to_dict(self, access_token: Optional[str] = None) -> Dict[str, Any]` returning clean dictionary (without `hashed_password`) matching `UserResponse`.
2. **`backend/app/models/database.py` & Baseline Seeding**:
   - In `init_db()`, after creating tables, implement idempotent database seeding for the two baseline users:
     - Student: id `usr-140301`, mobile `09123456789`, password hashed with bcrypt (`pass`), role `student`, full_name `Ali Mousavi`, wallet_balance `350,000 Tomans`.
     - Admin: id `adm-001`, mobile `09120000000`, password hashed with bcrypt (`admin_secret_2026`), role `admin`, full_name `حجت الاسلام دکتر زنجیر زن حسینی`.
   - Also, in `AuthService` or upon database connection, ensure that if the `users` table is empty (due to TestClient instantiation outside lifespan context), ensure baseline users exist so that all existing tests pass unconditionally.
3. **`backend/app/services/auth_service.py`**:
   - Replace the in-memory `self.users` dictionary with live asynchronous SQLAlchemy queries against `User`.
   - Make methods `async def`: `register_user(db: AsyncSession, ...)`, `authenticate_user(db: AsyncSession, ...)`, `get_user_by_id(db: AsyncSession, ...)`.
   - Eliminate auto-provisioning in `authenticate_user`: verify password against `user.hashed_password` using `verify_password(password, user.hashed_password)`. If user not found or password incorrect, raise `AppException` or `AuthenticationException` with Persian message: «شماره تماس یا کلمه عبور وارد شده نادرست است.».
   - In `register_user`: check if `mobile == phone` already exists. If yes, raise `AppException(status_code=400, message=f"شماره تماس '{phone}' قبلاً در سامانه ثبت شده است.", error_code="USER_ALREADY_EXISTS")`. Insert new `User`, commit session, and return `UserResponse` with generated JWT `access_token`.
4. **`backend/app/api/v1/endpoints/auth.py`**:
   - Update endpoints (`register`, `login`, `get_me`) to `async def` and inject `db: AsyncSession = Depends(get_db)`.
   - Pass `db` to `auth_service` calls.
   - Return structured Persian error responses.
5. **`backend/app/api/deps.py`**:
   - Inject `db: AsyncSession = Depends(get_db)` into `get_current_user` and query `User` asynchronously from the SQLite database.
6. **`backend/tests/test_in_memory.py`**:
   - Extend test suite with:
     - Testing `register_user` via `/api/v1/auth/register` with phone `09191112233`. Assert HTTP 200, access token returned, and record inserted into SQLite database file `zanjirzan_platform.db`.
     - Testing duplicate phone registration with `09191112233`. Assert HTTP 400 returned with Persian error message.
     - Testing `/api/v1/auth/me` with bearer token. Assert HTTP 200 and correct user profile returned.
     - Testing login with invalid credentials. Assert HTTP 400 or 401 returned without crashing.
   - Ensure all existing tests (login, RBAC, DRM, courses, AI chat, admin CRUD) pass 100%.
7. **Verification**:
   - Run: `& "backend\.venv\Scripts\python.exe" backend\tests\test_in_memory.py` (Must pass 100%).
   - Run: `& "backend\.venv\Scripts\python.exe" audit_pipeline.py` (Must score 100/100).
   - Write comprehensive report to `report.md` and 5-component `handoff.md` in your working directory.
   - Notify orchestrator_3 via `send_message` when done.


## 2026-10-12T01:16:53Z
[Message] timestamp=2026-10-12T01:16:53Z sender=174180af-6f26-480c-bb80-0a02fcfc7785 priority=MESSAGE_PRIORITY_HIGH content=You are the Backend Database Authentication Worker (worker_m1).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m1
Your parent is orchestrator_3 (Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785).

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read your DISPATCH.md in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m1\DISPATCH.md and ORIGINAL_REQUEST.md in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md.
Also read PROJECT.md in e:\personal\philosophy_zanjirzan_app\PROJECT.md and the backend explorer handoff in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_backend\handoff.md.

Exclusive Write Ownership:
You exclusively own and may modify:
- backend/app/models/models.py
- backend/app/models/database.py
- backend/app/services/auth_service.py
- backend/app/api/v1/endpoints/auth.py
- backend/app/api/deps.py
- backend/tests/test_in_memory.py

Key Deliverables:
1. Update User model in models.py with wallet_balance, avatar_url, phone property, and to_dict() serialization.
2. In database.py (and AuthService), ensure idempotent seeding of baseline student ('09123456789' / 'pass') and admin ('09120000000' / 'admin_secret_2026' named strictly «حجت الاسلام دکتر زنجیر زن حسینی») in SQLite users table.
3. In auth_service.py: replace in-memory dictionary with live async SQLAlchemy queries; eliminate auto-provisioning; verify bcrypt password hashes; check phone uniqueness and raise structured Persian AppException on duplicate phone; make methods async.
4. In endpoints/auth.py & deps.py: make endpoints and dependencies async def with db: AsyncSession = Depends(get_db).
5. In backend/tests/test_in_memory.py: add tests for register, duplicate phone 400 error, and /me hydration, ensuring 100% of all tests pass.
6. Verify by running:
   & "backend\.venv\Scripts\python.exe" backend\tests\test_in_memory.py
   & "backend\.venv\Scripts\python.exe" audit_pipeline.py
7. Write your report.md and 5-component handoff.md, then notify orchestrator_3 via send_message.
