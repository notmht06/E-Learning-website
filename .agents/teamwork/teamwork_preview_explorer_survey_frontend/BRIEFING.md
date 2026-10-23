# BRIEFING — 2026-10-12T01:14:00Z

## Mission
Survey frontend authentication and login/registration UX to architect live API integration, inline field validation, JWT session hydration, role-based protection, and REA decomposition (<200 LOC, useAuthForm hook).

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Frontend Auth & REA Architecture Explorer
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_explorer_survey_frontend
- Original parent: 174180af-6f26-480c-bb80-0a02fcfc7785
- Milestone: Survey & Architecture Discovery

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Scholar official name: «حجت الاسلام دکتر زنجیر زن حسینی»
- Anti-slop: No neon glow (blur-3xl), no text gradients, no pulsing dots, 4px spacing, warm paper/obsidian contrast
- Persian quality: No «می‌باشد», no «می‌گردد», proper ZWNJ, Persian quotes « », Persian numerals
- REA methodology: Files < 200 lines, extract custom hooks (e.g. useAuthForm.ts)
- Logical properties: 100% Tailwind (ps-, pe-, ms-, me-)

## Current Parent
- Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785
- Updated: 2026-10-12T01:14:00Z

## Investigation State
- **Explored paths**:
  - `frontend/src/app/login/page.tsx` (171 LOC, mock OTP, no registration, no validation)
  - `frontend/src/context/AuthContext.tsx` (119 LOC, auto-mock fallback, no JWT token persistence, no /auth/me)
  - `frontend/src/services/apiClient.ts` (290 LOC, zanjirzan_token header, apiClient.auth methods, error formatting)
  - `frontend/src/components/shell/ShellAuthGate.tsx` (96 LOC, gate props and auth actions)
  - `frontend/src/app/dashboard/page.tsx` & `frontend/src/app/admin/page.tsx` (protected gates)
  - `backend/app/api/v1/endpoints/auth.py` & `backend/app/schemas/auth.py` (API contracts, 400 error messages)
  - `backend/tests/test_in_memory.py` & `audit_pipeline.py` (test suites and seed users)
- **Key findings**: Complete REA modular decomposition designed (<200 LOC per file), inline field error mapping formulated, session hydration flow mapped out, verification baselines validated.
- **Unexplored areas**: None within frontend auth scope.

## Key Decisions Made
- Decompose `login/page.tsx` into modular presentation components (`components/auth/`) and extract business logic to `useAuthForm.ts`.
- Map backend 400 duplicate phone and 400/401 wrong password to inline field-level error badges with `AlertCircle`.
- Introduce `isLoading` state and `/api/v1/auth/me` hydration in `AuthContext` with backward-compatible adapters.

## Artifact Index
- `DISPATCH.md` — incoming dispatch instructions
- `progress.md` — liveness heartbeat and milestone tracker
- `report.md` — comprehensive technical architecture report
- `handoff.md` — 5-component self-contained handoff report
