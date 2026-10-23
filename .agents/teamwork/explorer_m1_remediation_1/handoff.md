# Handoff Report — Explorer M1 Remediation 1 (`deps.py`)

## 1. Observation
- **Target File**: `backend/app/api/deps.py`
- **Observed Lines (51–63)**:
  ```python
  51:     user = await auth_service.get_user_by_id(user_id=user_id, db=db)
  52:     if not user:
  53:         return {
  54:             "id": user_id,
  55:             "phone": payload.get("phone", "09123456789"),
  56:             "role": payload.get("role", "student"),
  57:             "full_name": "کاربر احرازشده",
  58:             "wallet_balance": "0 Tomans",
  59:             "enrolled_courses_count": 0,
  60:         }
  61: 
  62:     return user
  ```
- **Observed Missing `sub` Handling (Lines 44–49)**:
  ```python
  44:     user_id = payload.get("sub")
  45:     if not user_id:
  46:         raise HTTPException(
  47:             status_code=status.HTTP_401_UNAUTHORIZED,
  48:             detail="اطلاعات شناسه کاربر در توکن مفقود است.",
  49:         )
  ```
- **Observed Downstream Role Verification in `get_current_admin` (Lines 80–92)**:
  ```python
  80: async def get_current_admin(
  81:     user: Dict[str, Any] = Depends(get_current_user),
  82: ) -> Dict[str, Any]:
  ...
  87:     if user.get("role") != "admin":
  88:         raise HTTPException(
  89:             status_code=status.HTTP_403_FORBIDDEN,
  90:             detail="دسترسی به این بخش منحصراً در اختیار مدیر پایگاه است.",
  91:         )
  92:     return user
  ```
- **Authoritative Guidelines Reference**:
  - `ORIGINAL_REQUEST.md`: "eliminating all in-memory and localStorage mocks."
  - `backend-quality.md`: Security Guardian directive for cryptographically and structurally verified auth sessions.
  - `persian-writing.md`: Ban bureaucratic verb tells (`می‌باشد`, `می‌گردد`).

## 2. Logic Chain
1. **From Observation 1**: When `auth_service.get_user_by_id(user_id=user_id, db=db)` returns `None` (user deleted or not in SQLite), lines 53–60 synthesize an in-memory dictionary with `full_name: "کاربر احرازشده"` and `role: payload.get("role", "student")`.
2. **From Observation 2 & Logic Step 1**: If an attacker signs or possesses a token with `"role": "admin"` where `sub` is nonexistent in SQLite, the fallback populates `"role": "admin"`.
3. **From Observation 3 & Logic Step 2**: `get_current_admin` receives the synthetic dictionary with `"role": "admin"`. The condition `user.get("role") != "admin"` evaluates to `False`, thereby granting unauthorized access to admin endpoints without checking SQLite.
4. **From Authoritative Guidelines**: The synthetic fallback violates the core mandate requiring all authentication data to originate from SQLite transactions.
5. **Deduction & Resolution**: Removing lines 53–60 and raising `HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.")` strictly prevents zombie sessions, eliminates in-memory mocks, and prevents privilege escalation while preserving legitimate DB-authenticated sessions.

## 3. Caveats
- Direct shell test execution via `run_command` was restricted by policy in this investigation turn; however, full static code analysis of `backend/tests/test_in_memory.py`, `backend/tests/test_adversarial_m1.py`, and `backend/tests/test_challenger_m1_2_adversarial.py` confirmed that all legitimate test cases log in or register real users in SQLite before calling authenticated routes.
- No other files in the backend rely on the `"کاربر احرازشده"` string (verified via global grep).

## 4. Conclusion
The synthetic user fallback in `backend/app/api/deps.py` (lines 52–60) must be replaced with a strict `HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="نشست نامعتبر است یا کاربر در سامانه یافت نشد.")`. This change is self-contained, fully backward-compatible with existing test suites, and eliminates both the architectural mock and the privilege escalation risk.

Artifacts provided:
- Unified patch: `.agents/teamwork/explorer_m1_remediation_1/deps.patch`
- Full reference replacement: `.agents/teamwork/explorer_m1_remediation_1/proposed_deps.py`
- Architectural report: `.agents/teamwork/explorer_m1_remediation_1/report.md`

## 5. Verification Method
1. **Apply the patch or proposed file**:
   ```powershell
   git apply .agents/teamwork/explorer_m1_remediation_1/deps.patch
   ```
2. **Run existing integration test suite**:
   ```powershell
   python backend/tests/test_in_memory.py
   ```
   *Expected result*: All 9 test modules pass with 100% success.
3. **Run adversarial test suites**:
   ```powershell
   python backend/tests/test_adversarial_m1.py
   python backend/tests/test_challenger_m1_2_adversarial.py
   ```
   *Expected result*: All adversarial test cases pass.
4. **Specific Invalidation Condition / Bug Reproduction Test**:
   Execute the following test snippet against the API client:
   ```python
   from backend.app.core.security import create_access_token
   token = create_access_token({"sub": "ghost-user-99999", "role": "admin"})
   res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
   assert res.status_code == 401
   res_admin = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {token}"})
   assert res_admin.status_code == 401
   ```
   *Expected result*: Returns HTTP 401 Unauthorized for both endpoints instead of HTTP 200.
