## 2026-10-07T04:02:03Z
You are the Project Orchestrator (orchestrator_2).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_2
The project root is: e:\personal\philosophy_zanjirzan_app
The frontend directory is: e:\personal\philosophy_zanjirzan_app\frontend
The authoritative user request is recorded in: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (Follow-up — 2026-10-07T03:59:53Z).

Your objective is to orchestrate the standard full team to execute the following project:

# Project Objective: Next.js Frontend PWA & Enterprise i18n / Clean Architecture Restructure
Integrity mode: benchmark

## Requirements
### R1. PWA Foundation
Configure a modern Next.js PWA setup (e.g. using next-pwa). This includes setting up the manifest.json, registering the service worker, and ensuring the application is installable and has basic offline caching capabilities.

### R2. Enterprise i18n Architecture
Implement a clean, strongly-typed localization system. Extract all hardcoded texts into strict dictionary files (fa.ts, en.ts, ar.ts) located in a dedicated messages/ or locales/ directory. The implementation must allow for easy feature additions in the future without cluttering components.

### R3. Folder Structure Standardization
Reorganize the frontend source code into a highly standard, clean architecture. Separate components, hooks, contexts, and domain logic clearly so the codebase is ready for future feature expansions without hallucinated logic or messy dependencies.

### R4. Test-Driven Behavioral Verification
Before making any major architectural changes, the team MUST read any existing test files (e.g., in backend/tests or frontend if applicable) and audit_pipeline.py to fully understand the expected behaviors, anti-slop rules, and identity constraints. The refactoring must preserve all expected behaviors without breaking existing tests.

## Acceptance Criteria
- [ ] A manifest.json (or equivalent PWA manifest) is successfully served or generated.
- [ ] Service worker files (sw.js and workbox-*.js) are successfully compiled into the public/ directory upon running the build.
- [ ] The localization dictionaries (fa.ts, en.ts, ar.ts) exist and enforce TypeScript type-checking for keys.
- [ ] Running `npm run build` completes successfully with zero TypeScript or ESLint errors.
- [ ] `audit_pipeline.py` passes with a 100/100 score to ensure no design tokens or identity rules were broken during the restructure.

## Critical Constraints & Project Rules
- Scholar Identity: The scholar's official name must exclusively be written as «حجت الاسلام دکتر زنجیر زن حسینی».
- Anti-AI-Slop: Strictly obey DESIGN.md and .agents/rules/anti-slop.md (NO blur-3xl, NO bg-clip-text text-transparent, NO animate-pulse dots, NO generic 3-card grids).
- Persian Writing: Follow .agents/rules/persian-writing.md (no «می‌باشد», no «می‌گردد», proper ZWNJ, Persian numerals ۰-۹, «گیومه»).
- File Workspace Convention: Subagents must each have their own working directory under .agents/teamwork/<type>_<milestone>_<N>/. Only agent metadata belongs in .agents/teamwork/. No source code or tests in .agents/teamwork/.

Initialize your BRIEFING.md, plan.md, and progress.md in e:\personal\philosophy_zanjirzan_app\.agents\teamwork\orchestrator_2. Decompose into clear milestones, dispatch subagents, review thoroughly, run verification tests, and notify Sentinel via send_message when complete with a detailed completion report.
