# DISPATCH: Frontend Auth & REA Architecture Explorer

Working Directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend
Role: Frontend Auth & REA Architecture Explorer
Parent: orchestrator_3 (Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785)

## Objective
Survey the frontend authentication and login/registration UX to detail how to replace all mock/localStorage auth with live API integration (`apiClient.auth`), inline field validation badges, secure JWT bearer session persistence, `/api/v1/auth/me` hydration, and role-based route protection, adhering strictly to REA architecture (<200 lines per file, `useAuthForm` hook extraction).

## Mandatory Inputs
- Original User Request: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (Read this first!)
- Login View: `frontend/src/app/login/page.tsx`
- Auth Context: `frontend/src/context/AuthContext.tsx`
- API Client: `frontend/src/services/apiClient.ts`
- Protected Routes & Gates: `frontend/src/app/dashboard`, `frontend/src/app/admin`, `frontend/src/components/shell/ShellAuthGate.tsx`
- Design Tokens & Anti-Slop: `DESIGN.md`, `.agents/rules/anti-slop.md`, `.agents/rules/persian-writing.md`, `.agents/rules/scholar-identity.md`

## Instructions
1. Initialize your `BRIEFING.md` and `progress.md` in your working directory.
2. Read `ORIGINAL_REQUEST.md` thoroughly.
3. Investigate the codebase using read-only tools.
4. Document the exact state of `login/page.tsx`, `AuthContext.tsx`, `apiClient.ts`, and protected route guards.
5. Identify required changes for:
   - Live HTTP calls to `/api/v1/auth/login` and `/api/v1/auth/register` via `apiClient.auth`
   - Replacing mock localStorage credentials with real JWT access tokens
   - Field-level validation: phone number format, password length/strength, server error response mapping (e.g. 400 duplicate phone) to inline badges below inputs
   - Decomposing `login/page.tsx` into modular components <200 lines each, extracting business logic to `useAuthForm.ts`
   - Session hydration via `/api/v1/auth/me` on initial load / refresh
   - Role-based route guards (student vs admin) for `/dashboard` and `/admin`
   - 4px spacing scale, 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`), scholar official name «حجت الاسلام دکتر زنجیر زن حسینی», and Persian writing rules.
6. Produce `report.md` and a 5-component `handoff.md` in your working directory.
7. Send a message to orchestrator_3 with your completion summary.


## 2026-10-12T01:04:48Z
You are the Frontend Auth & REA Architecture Explorer.
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend
Your parent is orchestrator_3 (Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785).
Read your DISPATCH.md in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend\DISPATCH.md and ORIGINAL_REQUEST.md in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md.

Investigate the frontend authentication architecture in frontend/src/:
- frontend/src/app/login/page.tsx (current line count, mock/localStorage implementation, tab switching login/register, inputs, validation)
- frontend/src/context/AuthContext.tsx (current state, mock user, login/register/logout methods, session storage/hydration via /api/v1/auth/me)
- frontend/src/services/apiClient.ts (current apiClient.auth methods, base URL, JWT bearer header attachment)
- Protected route handling: frontend/src/app/dashboard, frontend/src/app/admin, and ShellAuthGate.tsx
- REA decomposition plan: keep files under 200 lines, extract useAuthForm.ts hook for form state, validation, and submission mutations.
- Inline field validation UX: Persian error messages below input fields, field-level error state mapping.
- Design & tokens: 4px spacing scale, logical properties (ps-, pe-, ms-, me-), warm paper/obsidian contrast, scholar official name «حجت الاسلام دکتر زنجیر زن حسینی».

Write your findings to report.md and create a comprehensive 5-component handoff.md in your working directory.
When complete, notify orchestrator_3 via send_message with your completion summary.
