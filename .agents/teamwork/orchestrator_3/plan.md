# Master Plan: End-to-End Persistent Authentication

## Objective
Implement end-to-end persistent authentication connecting the Next.js frontend login/registration interface directly to the FastAPI backend with database transactions (SQLAlchemy/SQLite), eliminating all in-memory and localStorage mocks. Enforce the REA (Reverse-Engineering Architecture) engineering methodology across both backend and frontend layers.

## Standards & Constraints
- Backend: SQLAlchemy async sessions, SQLite persistence, bcrypt password hashing, structured AppException, Persian error responses.
- Frontend: REA modularization (<200 lines per file, `useAuthForm` hook), live HTTP calls to `/api/v1/auth/login` and `/api/v1/auth/register` via `apiClient.auth`, inline field validation badges, secure JWT bearer token persistence, profile hydration via `/api/v1/auth/me`, role-based route protection (`/dashboard`, `/admin`).
- Design & Identity: Strict anti-slop (no `blur-3xl`, no text gradients, no pulsing dots), scholar official name «حجت الاسلام دکتر زنجیر زن حسینی», Persian writing standards (no «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals ۰-۹, «گیومه»).
- Verification: `backend/tests/test_in_memory.py` 100% pass, `audit_pipeline.py` 100/100, `npm run build` 0 errors.

## Execution Phases
1. **Phase 0: Survey & Codebase Exploration**
   - Explorer 1 (Backend Auth & DB): Analyze `backend/app/services/auth_service.py`, `backend/app/models/models.py`, `backend/app/routers/auth.py`, session management, and tests.
   - Explorer 2 (Frontend Auth & Forms): Analyze `frontend/src/app/login/page.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/services/apiClient.ts`, protected routes, and modularization targets.
   - Explorer 3 (Verification & Pipeline): Analyze `audit_pipeline.py`, test harnesses, anti-slop and scholar identity compliance.

2. **Phase 1: Architecture & Decomposition Synthesis**
   - Synthesize explorer findings into `PROJECT.md` with full Feature Inventory, Architecture, Interface Contracts, and Milestones.

3. **Phase 2: Milestone Execution**
   - Milestone 1: Backend Persistent Database Authentication (SQLAlchemy/SQLite).
   - Milestone 2: Frontend Auth Integration & Inline Field Validation (REA, modularized components <200 lines, useAuthForm).
   - Milestone 3: Session Hydration, Route Guarding & End-to-End Verification.

4. **Phase 3: Final Verification & Hand-off**
   - Run audit pipeline, backend tests, frontend build.
   - Generate comprehensive handoff report to Sentinel.
