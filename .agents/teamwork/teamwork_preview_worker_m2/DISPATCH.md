# DISPATCH: Worker — Milestone 2: Live Frontend Auth Integration & REA Modularization

Working Directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m2
Role: Frontend Auth Integration & REA Modularization Worker
Parent: orchestrator_3 (Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Inputs (Read these before starting!)
- Original User Request: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (Read verbatim!)
- Project Architecture & Standards: `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
- Frontend Explorer Handoff: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend\handoff.md`
- Frontend Explorer Report: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend\report.md`
- Design Tokens & Rules: `DESIGN.md`, `.agents/rules/anti-slop.md`, `.agents/rules/persian-writing.md`, `.agents/rules/scholar-identity.md`

## Exclusive Write Ownership
You exclusively own and may create/modify:
- `frontend/src/hooks/useAuthForm.ts`
- `frontend/src/components/auth/AuthTabs.tsx`
- `frontend/src/components/auth/AuthFormField.tsx`
- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/components/auth/RegisterForm.tsx`
- `frontend/src/components/auth/QuickRoleSelector.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/services/apiClient.ts`
- `backend/app/api/deps.py` (hardening: raise 401 if user not found in DB)
- `backend/app/services/auth_service.py` (hardening: catch IntegrityError on concurrent register)

## Technical Directives & REA Constraints
1. **REA Architecture (<200 LOC per file constraint)**:
   - Deconstruct monolithic `login/page.tsx`. Every single file in `frontend/src/components/auth/`, `frontend/src/hooks/`, and `frontend/src/app/login/` MUST be strictly under 200 lines.
   - Extract form state, input validation, server error parsing, and submission mutations into `frontend/src/hooks/useAuthForm.ts` (<160 LOC).
2. **Modular Presentation Components (`frontend/src/components/auth/`)**:
   - `AuthTabs.tsx`: Clean toggle between "ورود به سامانه" and "ثبت‌نام دانش‌پژوه" (<100 LOC).
   - `AuthFormField.tsx`: Reusable input field with label, error badge, focus rings, and RTL icons (<120 LOC).
   - `LoginForm.tsx`: Presentation for phone and password inputs, submit button, and forgot password link (<120 LOC).
   - `RegisterForm.tsx`: Presentation for full name, phone, password, confirm password, and submit button (<140 LOC).
   - `QuickRoleSelector.tsx`: Quick-fill buttons for evaluation (Student: `09123456789`/`pass`, Admin: `09120000000`/`admin_secret_2026`) (<80 LOC).
   - `frontend/src/app/login/page.tsx`: Clean page assembling the modular components (<150 LOC).
3. **Inline Field-Level Validation UX**:
   - Surface validation errors directly below the respective input fields:
     - Phone format (`^09\d{9}$`): "شماره تماس باید ۱۱ رقم و با ۰۹ آغاز شود."
     - Password length (min 4 or 6 chars): "کلمه عبور باید حداقل ۶ نویسه باشد."
     - Name required in registration: "لطفاً نام و نام خانوادگی خود را وارد کنید."
     - Confirm password mismatch: "تکرار کلمه عبور با کلمه عبور اصلی همخوانی ندارد."
     - Server duplicate phone (HTTP 400): "این شماره تماس قبلاً در سامانه ثبت شده است. لطفاً وارد شوید."
     - Server invalid credentials (HTTP 400/401): "شماره تماس یا کلمه عبور وارد شده نادرست است."
   - Badge style: Subtle 1px border, light reddish tint (`text-red-600 bg-red-50/80 border border-red-200 rounded-lg text-xs py-1 px-2.5 flex items-center gap-1.5 mt-1.5`).
4. **Live API Client & AuthContext Integration**:
   - In `frontend/src/services/apiClient.ts`: ensure error parsing extracts `detail` message correctly from error responses.
   - In `frontend/src/context/AuthContext.tsx`:
     - Eliminate client-side auto-mock user creation on initial load.
     - Manage `token` in `localStorage.getItem('zanjirzan_token')` and `localStorage.setItem('zanjirzan_token', token)`.
     - Implement live `login(phone, password)` calling `apiClient.auth.login`.
     - Implement live `register(fullName, phone, password)` calling `apiClient.auth.register`.
     - Implement `logout()` clearing `zanjirzan_token` and `zanjirzan_user`.
     - Implement profile hydration: on mount, if `zanjirzan_token` exists, call `apiClient.auth.getMe()` to hydrate `user`.
     - Provide `isLoading` state (true while hydrating) so route guards do not flicker.
5. **Security & Backend Hardening**:
   - In `backend/app/api/deps.py`: if `auth_service.get_user_by_id` returns `None`, raise `HTTPException(status_code=401, detail="کاربر مورد نظر در پایگاه داده یافت نشد یا نشست باطل شده است.")` instead of returning a synthetic dictionary.
   - In `backend/app/services/auth_service.py`: in `_register_user_tx`, catch `IntegrityError` on `db.flush()` and raise `AppException(message=f"شماره تماس '{phone}' قبلاً در سامانه ثبت شده است.", code="USER_ALREADY_EXISTS", status_code=400)`.
6. **Design System & Anti-Slop**:
   - Obsidian `#0C0D0E`, warm paper `#FAF8F5`, copper/terracotta `#8A532B`.
   - NO `blur-3xl`, NO `bg-clip-text text-transparent`, NO `animate-pulse` dots, NO generic 3-card grids.
   - 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
   - Rigid 4px spacing scale (`p-1` through `p-8`).
   - Official scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Persian writing: no «می‌باشد», no «می‌گردد», proper ZWNJ (نیم‌فاصله), Persian numerals (۰-۹).
7. **Verification**:
   - `cd frontend; npm run build` (Must complete with 0 errors, 15 static routes).
   - `& "backend\.venv\Scripts\python.exe" backend\tests\test_in_memory.py` (Must pass 100%).
   - `& "backend\.venv\Scripts\python.exe" audit_pipeline.py` (Must score 100/100).
   - Document changes in `report.md` and 5-component `handoff.md`. Notify orchestrator_3 via `send_message`.


## 2026-10-12T01:41:23Z
You are the Frontend Auth Integration & REA Modularization Worker (worker_m2).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m2
Your parent is orchestrator_3 (Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785).

Exclusive Write Ownership:
You exclusively own and may create/modify:
- frontend/src/hooks/useAuthForm.ts
- frontend/src/components/auth/AuthTabs.tsx
- frontend/src/components/auth/AuthFormField.tsx
- frontend/src/components/auth/LoginForm.tsx
- frontend/src/components/auth/RegisterForm.tsx
- frontend/src/components/auth/QuickRoleSelector.tsx
- frontend/src/app/login/page.tsx
- frontend/src/context/AuthContext.tsx
- frontend/src/services/apiClient.ts
- backend/app/api/deps.py (raise 401 if user not found in DB)
- backend/app/services/auth_service.py (catch IntegrityError on concurrent register)
