# DISPATCH — Worker Milestone 3 (Phase 8: Font Unification, Docker & Documentation Harmony)

## Mandatory Context
Read `ORIGINAL_REQUEST.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically under `## Follow-up — 2026-10-14T04:02:02Z §R3`).
Read `PROJECT.md` at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_5\PROJECT.md`.
Read frontend/docker survey blueprint at:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_p8\handoff.md` and `analysis.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 3 Objectives (Phase 8)
1. **Archive Deprecated Briefs & Document Dribbble Palette**:
   - Create `docs/archive/` and move `antigravity-redesign-brief.md` and `antigravity-redesign-brief_V2.md` from the root into `docs/archive/`.
   - Update `DESIGN.md` to establish it as single source of truth documenting the Dribbble production palette tokens (`#FCF9F4`, `#D6534F`, `#1B1B1B`, `#F2EFE9`) matching `frontend/public/manifest.json`.
2. **Font Unification via `next/font` (`frontend/src/app/layout.tsx`)**:
   - Configure `Vazirmatn` and `Lalezar` using `next/font/google` with `display: 'swap'` and CSS variables (`--font-vazirmatn`, `--font-lalezar`).
   - Attach variables to `body` or `html` element.
   - Keep existing Dana local font preloads and styles intact.
3. **Next.js Standalone & Security Headers (`frontend/next.config.js`)**:
   - Add `output: 'standalone'`.
   - Add `async headers()` delivering:
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
4. **Docker Compose & Environment Synchronization (`docker-compose.yml`, `.env.example`)**:
   - Add frontend healthcheck using `wget` in `docker-compose.yml`.
   - Harmonize `SECRET_KEY` between `backend/app/core/config.py`, `docker-compose.yml`, and `.env.example`.
5. **Project Rules**:
   - Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» exclusively.
   - Anti-AI-Slop and Persian Writing compliance.

## Verification Requirements
Worker must run:
1. `cd frontend && npm run build` (assert 0 errors, all 15 routes compiled)
2. `.\backend\.venv\Scripts\python.exe audit_pipeline.py` (assert 100/100 score)
Record exact commands and outputs in `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_m3\handoff.md`.


## 2026-10-14T05:27:59Z
You are the Worker subagent for Milestone 3 (Phase 8: Font Unification, Docker Standalone Config & Security Headers, Documentation Harmony).
Follow all instructions in DISPATCH.md.
