## 2026-10-12T00:59:20Z
You are the Project Orchestrator (orchestrator_3).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_3
The project root is: e:\personal\philosophy_zanjirzan_app
The backend directory is: e:\personal\philosophy_zanjirzan_app\backend
The frontend directory is: e:\personal\philosophy_zanjirzan_app\frontend
The authoritative user request is recorded in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (Follow-up — 2026-10-12T00:59:20Z).

Your objective is to orchestrate the standard full team to execute the following project:

# Project Objective: End-to-End Persistent Authentication (Next.js + FastAPI + SQLAlchemy/SQLite)
Requested team: Standard full team
Working directory: e:\personal\philosophy_zanjirzan_app
Integrity mode: demo

## Architecture & Engineering Directives (REA Methodology)

1. **Clear Architectural Boundaries:**
   - Decouple UI presentation from network mutations and state management.
   - Deconstruct complex components so that no single file exceeds 200 lines. Extract heavy logic into dedicated hooks (e.g. `useAuthForm.ts`).
2. **Strict Design Tokens & RTL:**
   - Spacing: Rigid 4px scale (`p-1` through `p-8`).
   - Palette: Obsidian `#0C0D0E`, warm paper `#FAF8F5`, copper/terracotta accent `#8A532B`. Zero color slop.
   - 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
   - Typography ceiling capped at `text-2xl font-bold`.
3. **Scholar Identity & Persian Quality:**
   - Maintain official scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero bureaucratic tells (`می‌باشد`, `می‌گردد`) and clean Persian typography.

## Requirements

### R1. Backend Persistent Database Authentication
Refactor `backend/app/services/auth_service.py` to use live SQLAlchemy async database sessions with the `User` model (`backend/app/models/models.py`). Store newly registered users in the database with bcrypt-hashed passwords. Enforce unique constraints on phone numbers and return clear, structured Persian error messages when encountering duplicate or invalid credentials.

### R2. Live Frontend Auth Integration & Inline Field Validation
Replace the mock/localStorage-only login and registration logic in `frontend/src/app/login/page.tsx` and `frontend/src/context/AuthContext.tsx` with live HTTP calls to `/api/v1/auth/login` and `/api/v1/auth/register` via `apiClient.auth`. Surface field-level validation errors (e.g., duplicate phone, invalid phone pattern, incorrect password) directly below the respective input fields with inline error badges.

### R3. Session Hydration & Protected Route Authorization
Save the issued JWT bearer token securely, hydrate user profile state on page load via `/api/v1/auth/me`, and ensure that student and admin roles correctly govern access to protected routes (`/dashboard` and `/admin`).

## Acceptance Criteria

### Backend & Database Persistence
- [ ] Registering a user successfully inserts a row into the SQLite database file (`users` table).
- [ ] Attempting to register an already existing phone number returns HTTP 400 with a structured Persian error message and does not create duplicate entries.
- [ ] Logging in with correct credentials verifies the bcrypt hash and issues a valid JWT access token.
- [ ] Logging in with incorrect credentials returns HTTP 400 or 401 without crashing.

### Frontend Component Architecture & UX
- [ ] The login and registration view separates presentation from logic, with each file kept under 200 lines.
- [ ] Invalid phone numbers or duplicate registration attempts display an inline error message directly below the respective input field.
- [ ] Successful authentication persists the session, updates global auth state, and redirects the user smoothly to the appropriate dashboard.

### Verification & Compliance
- [ ] `backend/tests/test_in_memory.py` passes 100%.
- [ ] `audit_pipeline.py` passes with a 100/100 score.
- [ ] `npm run build` completes with 0 errors.

## Critical Constraints & Project Rules
- Scholar Identity: The scholar's official name must exclusively be written as «حجت الاسلام دکتر زنجیر زن حسینی».
- Anti-AI-Slop: Strictly obey DESIGN.md and .agents/rules/anti-slop.md (NO blur-3xl, NO bg-clip-text text-transparent, NO animate-pulse dots, NO generic 3-card grids).
- Persian Writing: Follow .agents/rules/persian-writing.md (no «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals ۰-۹, «گیومه»).
- File Workspace Convention: Subagents must each have their own working directory under .agents/teamwork/<type>_<milestone>_<N>/. Only agent metadata belongs in .agents/teamwork/. No source code or tests in .agents/teamwork/.

Initialize your BRIEFING.md, plan.md, and progress.md in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_3. Decompose into clear milestones, dispatch subagents, review thoroughly, run verification tests, and notify Sentinel via send_message when complete with a detailed completion report.

## 2026-10-12T01:00:52Z
[Message from 1363e3df-6170-46c2-9fe3-df5980d81baf]
You are the Project Orchestrator (orchestrator_3).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_3
The project root is: e:\personal\philosophy_zanjirzan_app
The authoritative user request is recorded in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (Follow-up — 2026-10-12T00:59:20Z).
Detailed dispatch instructions are in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_3\DISPATCH.md.

Objective: Implement end-to-end persistent authentication connecting the Next.js frontend login/registration interface directly to the FastAPI backend with database transactions (SQLAlchemy/SQLite), eliminating all in-memory and localStorage mocks. Enforce the REA (Reverse-Engineering Architecture) engineering methodology across both backend and frontend layers.

Please read DISPATCH.md and ORIGINAL_REQUEST.md, set up your working directory (BRIEFING.md, plan.md, progress.md), decompose into milestones, coordinate subagents per the project orchestration pattern, verify rigorously, and report back to Sentinel via send_message when work is complete with your handoff report.


## 2026-10-12T01:02:13Z
[Message from 62f6511b-47ff-4852-953b-03877832fb41]
You are the Project Orchestrator (orchestrator_3).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_3
The project root is: e:\personal\philosophy_zanjirzan_app
The backend directory is: e:\personal\philosophy_zanjirzan_app\backend
The frontend directory is: e:\personal\philosophy_zanjirzan_app\frontend
The authoritative user request is recorded in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md.
Detailed dispatch instructions are in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_3\DISPATCH.md.

Objective: Implement end-to-end persistent authentication connecting the Next.js frontend login/registration interface directly to the FastAPI backend with database transactions (SQLAlchemy/SQLite), eliminating all in-memory and localStorage mocks. Enforce the REA (Reverse-Engineering Architecture) engineering methodology across both backend and frontend layers.

Requirements:
- R1. Backend Persistent Database Authentication (SQLAlchemy async sessions, User model in models.py, bcrypt hashed passwords, phone uniqueness, structured Persian error messages).
- R2. Live Frontend Auth Integration & Inline Field Validation (replace mock/localStorage in login/page.tsx and AuthContext.tsx with live HTTP calls, inline error badges).
- R3. Session Hydration & Protected Route Authorization (JWT bearer token storage, hydration via /api/v1/auth/me, role governance for /dashboard and /admin).
- REA Methodology: Decouple presentation, keep files under 200 lines, extract heavy logic to dedicated hooks like useAuthForm.ts.
- Strict anti-slop, 4px spacing scale, logical properties (ps-, pe-, ms-, me-), official scholar identity «حجت الاسلام دکتر زنجیر زن حسینی», Persian writing standards.
- Verification: backend/tests/test_in_memory.py passes 100%, audit_pipeline.py passes 100/100, npm run build passes with 0 errors.

Please initialize your working directory (BRIEFING.md, plan.md, progress.md), decompose milestones, dispatch subagents per standard conventions, verify thoroughly, and report back to Sentinel via send_message when complete with your handoff report.
