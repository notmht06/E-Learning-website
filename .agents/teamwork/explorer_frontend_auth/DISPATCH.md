# DISPATCH — Explorer Frontend Auth

## Mission
Investigate the frontend authentication, state management, and UI architecture in `frontend/src`.

## Authoritative User Request
Read: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically Follow-up — 2026-10-12T00:59:20Z)

## Scope & Target Files
- `frontend/src/app/login/page.tsx` (current line count, current mock/localStorage implementation, presentation vs logic coupling)
- `frontend/src/context/AuthContext.tsx` (current auth state, login/register methods, mock data, token handling, `/api/v1/auth/me` hydration)
- `frontend/src/services/apiClient.ts` (current apiClient.auth implementation, base URL, token header injection, error response handling)
- Protected routes: `/dashboard`, `/admin` and role guarding for student/admin
- REA architecture constraints: decomposing `login/page.tsx` into modular components each <200 lines, extracting form state/validation into `useAuthForm.ts` hook
- Inline field validation UX for phone pattern, duplicate phone, password verification
- Design tokens: Obsidian `#0C0D0E`, warm paper `#FAF8F5`, copper/terracotta accent `#8A532B`, rigid 4px spacing scale (`p-1` through `p-8`), 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`), typography ceiling capped at `text-2xl font-bold`
- Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی»
- Anti-Slop: No `blur-3xl`, no `bg-clip-text text-transparent`, no `animate-pulse` dots, no generic 3-card grids

## Deliverable
Write your comprehensive analysis to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_frontend_auth\report.md` and complete your `handoff.md`.


## 2026-10-12T01:02:42Z
Investigate:
1. `frontend/src/app/login/page.tsx`: line count, structure, form inputs, validation, mock logic, and how to deconstruct into modular components each under 200 lines adhering to REA (Reverse-Engineering Architecture).
2. `frontend/src/context/AuthContext.tsx`: state management, login/register/logout methods, token storage, user profile hydration via `/api/v1/auth/me`.
3. `frontend/src/services/apiClient.ts`: inspect `apiClient.auth` (`login`, `register`, `me`), base URL, headers, error handling.
4. Hook extraction: identify requirements for dedicated hook `useAuthForm.ts` to manage form state, validation, submission, and error display.
5. Inline field-level validation UX: displaying error badges directly below respective fields (duplicate phone, invalid phone format, incorrect password).
6. Protected route handling: verify how student and admin roles govern access to `/dashboard` and `/admin`.
7. Anti-slop and design tokens compliance: Obsidian `#0C0D0E`, warm paper `#FAF8F5`, copper/terracotta `#8A532B`, 4px scale, 100% Tailwind logical properties, scholar official name «حجت الاسلام دکتر زنجیر زن حسینی».
