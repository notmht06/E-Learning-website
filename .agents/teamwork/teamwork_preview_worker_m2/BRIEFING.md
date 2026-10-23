# BRIEFING — 2026-10-12T01:55:00Z

## Mission
Implement live frontend authentication integration connecting Next.js to FastAPI backend, deconstruct login monolithic page using REA (<200 LOC per file), surface inline field-level validation badges, eliminate auto-mock student in AuthContext, handle JWT tokens in localStorage, implement session hydration, and harden backend error handling.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m2
- Original parent: 174180af-6f26-480c-bb80-0a02fcfc7785
- Milestone: M2 - Live Frontend Auth Integration & REA Modularization

## 🔒 Key Constraints
- Exclusive write ownership:
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
  - .agents/teamwork/teamwork_preview_worker_m2/*
- REA Architecture: Every single file in components/auth, hooks, and login/page.tsx must be strictly under 200 lines.
- Rigid 4px spacing scale (p-1 to p-8).
- 100% Tailwind logical properties (ps-, pe-, ms-, me-).
- Palette: Obsidian #0C0D0E, warm paper #FAF8F5, terracotta/copper #8A532B.
- Anti-Slop: NO blur-3xl, NO bg-clip-text text-transparent, NO animate-pulse dots, NO generic 3-card grids.
- Scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی» without truncation.
- Persian writing: no «می‌باشد», no «می‌گردد», proper ZWNJ (نیم‌فاصله), Persian digits (۰-۹).
- Verification: npm run build (0 errors), test_in_memory.py (100%), audit_pipeline.py (100/100).

## Current Parent
- Conversation ID: 174180af-6f26-480c-bb80-0a02fcfc7785
- Updated: 2026-10-12T01:55:00Z

## Task Summary
- **What to build**: REA-compliant auth frontend architecture, live JWT authentication, inline validation error badges, AuthContext session hydration, backend auth hardening.
- **Success criteria**: 0 errors on npm run build, 100% passing backend tests, 100/100 audit pipeline, all touched frontend files <200 LOC.
- **Interface contracts**: PROJECT.md
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Deconstructed monolithic login/page.tsx into useAuthForm (157 LOC), AuthTabs (50 LOC), AuthFormField (97 LOC), LoginForm (89 LOC), RegisterForm (119 LOC), QuickRoleSelector (57 LOC), and login/page.tsx (109 LOC).
- All files strictly under 200 LOC ceiling and within their individual limits.
- Surface inline errors under input fields with subtle red badges (text-red-600 bg-red-50/80 border border-red-200 rounded-lg text-xs py-1 px-2.5 flex items-center gap-1.5 mt-1.5).
- Store JWT in localStorage `zanjirzan_token` and hydrate via `apiClient.auth.getMe()` on mount.
- Eliminated client-side auto-mock user creation. Added isLoading flag to prevent route gate flicker.
- Hardened backend: deps.py raises 401 when user not found; auth_service.py catches IntegrityError on db.flush() during concurrent registration and raises 400 AppException.

## Artifact Index
- DISPATCH.md — Assignment instructions
- progress.md — Liveness heartbeat and step tracker
- report.md — Full implementation report
- handoff.md — 5-component handoff report

## Change Tracker
- **Files modified**:
  - `backend/app/api/deps.py`: Raise 401 when user not found in DB
  - `backend/app/services/auth_service.py`: Catch IntegrityError on concurrent register flush
  - `frontend/src/services/apiClient.ts`: Parse detail array/object errors cleanly
  - `frontend/src/context/AuthContext.tsx`: Live JWT management, /me hydration, isLoading, no auto-mock
  - `frontend/src/hooks/useAuthForm.ts`: Form state, field validation, server error mapping, mutations
  - `frontend/src/components/auth/AuthTabs.tsx`: Tab toggle between login and register
  - `frontend/src/components/auth/AuthFormField.tsx`: Reusable input with inline error badges
  - `frontend/src/components/auth/LoginForm.tsx`: Decoupled login presentation
  - `frontend/src/components/auth/RegisterForm.tsx`: Decoupled register presentation
  - `frontend/src/components/auth/QuickRoleSelector.tsx`: Quick evaluation role selectors
  - `frontend/src/app/login/page.tsx`: Clean assembly of REA components
- **Build status**: PASS (npm run build: 0 errors, 15 static routes)
- **Pending issues**: none

## Quality Status
- **Build/test result**: PASS (test_in_memory.py: 100%, audit_pipeline.py: 100/100, npm run build: 0 errors)
- **Lint status**: 0 violations
- **Tests added/modified**: Verified against backend integration tests and audit pipeline

## Loaded Skills
- **Source**: e:\personal\philosophy_zanjirzan_app\.agents\skills\persian-writing\SKILL.md
- **Local copy**: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\teamwork_preview_worker_m2\persian_writing_skill.md
- **Core methodology**: Persian orthography (ZWNJ, Persian numerals, quotes), anti-bureaucratic diction (no می‌باشد/می‌گردد).
