## 2026-10-07T04:17:57Z
You are a Worker subagent for Milestone 1: PWA Foundation & Service Worker.
Your identity: worker_pwa_1
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_pwa_1

MANDATORY FIRST STEP:
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (Follow-up — 2026-10-07T03:59:53Z).
Read e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_pwa_1\handoff.md and report.md.
Read e:\personal\philosophy_zanjirzan_app\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

SCOPE & EXCLUSIVE FILE OWNERSHIP:
You own:
- frontend/package.json
- frontend/next.config.ts (or frontend/next.config.mjs / next.config.js)
- frontend/public/manifest.json
- frontend/src/components/PWARegistration.tsx (or service worker registration component)
- frontend/src/components/admin/tabs/AdminStatsTab.tsx (only to fix the line 25 TS2367 comparison error where s.status is compared to 'Active'/'نشط', change to s.status === 'فعال')

TASKS:
1. In frontend/, install `@ducanh2912/next-pwa` (as recommended by explorer_survey_pwa_1).
2. Configure next.config with withPWA:
   - dest: "public"
   - disable: false (or process.env.NODE_ENV === "development" ? false : false, but ensure build compiles sw.js and workbox-*.js during `npm run build`)
   - Configure runtimeCaching in workboxOptions to ensure `/api/*` and `/stream/*` use NetworkOnly strategy to protect signed DRM tokens and avoid caching dynamic responses.
3. Verify and refine frontend/public/manifest.json:
   - name and short_name must strictly include «حجت الاسلام دکتر زنجیر زن حسینی».
   - theme_color: "#0C0D0E"
   - background_color: "#FAF8F5"
   - display: "standalone"
   - start_url: "/"
   - icons pointing to existing assets in public/ (e.g. icon-192.png, icon-512.png, favicon.ico).
4. Ensure Service Worker registration in Next.js App Router (PWARegistration.tsx is mounted in root layout or GlobalOverlays).
5. Fix TS2367 comparison error in frontend/src/components/admin/tabs/AdminStatsTab.tsx:25 (`s.status === 'فعال'`).
6. Run `npm run build` in frontend/ and verify:
   - Build completes with zero TypeScript and ESLint errors.
   - `public/sw.js` and `public/workbox-*.js` are compiled into public/.
7. Run `backend\.venv\Scripts\python.exe audit_pipeline.py` from project root and verify 100/100 score.

Deliver your detailed handoff report to:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_pwa_1\handoff.md

When finished, send a message to orchestrator_2 (parent) with a concise summary and confirmation of build & audit pass.
