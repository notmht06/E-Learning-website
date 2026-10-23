# Handoff Report — explorer_survey_pwa_1

## 1. Observation
- **Next.js & React Versions**: `frontend/package.json:14-16` shows `"next": "^15.1.7"`, `"react": "^19.0.0"`, `"react-dom": "^19.0.0"`, `"typescript": "^5.7.3"`. During `npm run build`, Next.js reported `▲ Next.js 15.5.25`.
- **Next.js Configuration**: `frontend/next.config.js:1-9` is a simple CommonJS export (`module.exports = nextConfig`) containing only `reactStrictMode: true` and `images: { unoptimized: true }`. No PWA plugin is wrapped.
- **Public Assets & Existing Files**:
  - `frontend/public/manifest.json`: 34 lines. Name: `"پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی"`, Short name: `"دارالحکمة"`, Theme color: `"#8A532B"`, Background: `"#0C0D0E"`.
  - `frontend/public/sw.js`: 93 lines of a manually written static service worker.
  - `frontend/public/icons/`: contains `icon-192.png` (547 bytes) and `icon-512.png` (1881 bytes).
  - Note: There are currently no compiled `workbox-*.js` files in `public/`.
- **PWA Service Worker Registration**:
  - `frontend/src/components/PWARegistration.tsx:5-22` contains a client component registering `/sw.js` on `window.addEventListener('load')` when `process.env.NODE_ENV === 'production'`.
  - `frontend/src/components/GlobalOverlays.tsx:5,22` mounts `<PWARegistration />` inside `src/app/layout.tsx:59`.
  - `frontend/src/app/layout.tsx:12` references `manifest: '/manifest.json'`.
- **Existing Build Error**:
  - Running `npm run build` failed with exit code 1 at `src/components/admin/tabs/AdminStatsTab.tsx:25:75`:
    `Type error: This comparison appears to be unintentional because the types '"مسدود‌شده"' and '"Active"' have no overlap.`
    `src/components/admin/tabs/AdminStatsTab.tsx(25,100): error TS2367: This comparison appears to be unintentional because the types '"مسدود‌شده"' and '"نشط"' have no overlap.`
    This is due to `DrmSessionRecord['status']` in `src/context/DataContext.tsx:57` being defined strictly as `'فعال' | 'مسدود‌شده'`.
- **Audit Pipeline**:
  - Running `backend\.venv\Scripts\python.exe audit_pipeline.py` exited with code 0 and scored 100/100 across all 8 checks (Scholar Identity, Anti-AI-Slop, Backend DRM tests, SEO artifacts, Kaggle/Colab notebooks, Root standards, Persian writing quality, Spec kit compliance).
- **PWA Package Feasibility**:
  - `npm install --dry-run @ducanh2912/next-pwa` completed with exit code 0 (`added 349 packages in 2m`). Peer dependencies: `{ next: '>=14.0.0', webpack: '>=5.9.0' }`.
  - `npm info @ducanh2912/next-pwa dependencies` confirmed inclusion of `workbox-build: 7.1.1`, `workbox-webpack-plugin: 7.1.0`, `workbox-core: 7.1.0`.

## 2. Logic Chain
1. **From Acceptance Criteria to Library Choice**:
   - `ORIGINAL_REQUEST.md:69` explicitly specifies: *"Service worker files (`sw.js` and `workbox-*.js`) are successfully compiled into the `public/` directory upon running the build."*
   - Legacy `next-pwa` (v5.6.0) is unmaintained since 2022 and has known compatibility failures with Next.js 15 App Router webpack hooks.
   - Modern `@serwist/next` uses an alternative modular structure and does not emit the classic `workbox-*.js` files expected by the acceptance criteria.
   - `@ducanh2912/next-pwa` (v10.2.9) is specifically built for Next.js App Router with Webpack 5 and Workbox 7. When configured with `dest: "public"`, it automatically compiles both `public/sw.js` and `public/workbox-*.js` during `next build`.
2. **From DRM Security Rule to Cache Routing**:
   - Rule in `GEMINI.md:27-32` and `BACKEND_SYSTEM_DESIGN.md` requires strict DRM stream protection via short-lived signed tokens (`/api/v1/stream/*`).
   - Therefore, the Workbox configuration in `next.config.js` MUST enforce `NetworkOnly` for all `/api/*` and `/stream/*` routes and blacklist them from navigation fallbacks.
3. **From Build Failure to Prerequisite Fix**:
   - In `AdminStatsTab.tsx:25`, the redundant comparisons `s.status === 'Active' || s.status === 'نشط'` violate TS2367 against the strict `'فعال' | 'مسدود‌شده'` union.
   - For `npm run build` to succeed during PWA verification, the implementer must simplify line 25 to `s.status === 'فعال'` (or cast to string).

## 3. Caveats
- Turbopack (`--turbopack`) does not support Webpack-based PWA build plugins like `@ducanh2912/next-pwa`. Normal production builds (`next build`) use Webpack and are fully supported.
- In development mode (`npm run dev`), PWA generation should remain disabled (`disable: process.env.NODE_ENV === 'development'`) to avoid aggressive caching during local development.
- The root workspace is not currently a git repository (`fatal: not a git repository`).

## 4. Conclusion
- The optimal PWA architecture for this project is to install `@ducanh2912/next-pwa` in `frontend/`, wrap `next.config.js` with `withPWA`, configure Workbox runtime caching to strictly exclude `/api/*` and `/stream/*`, and retain the existing compliant `public/manifest.json`.
- When `npm run build` is executed, Workbox will compile `sw.js` and `workbox-*.js` into `public/`, directly satisfying the R1 acceptance criteria.
- Full details and configuration code have been written to `report.md`.

## 5. Verification Method
1. **Compilation Check**:
   Fix line 25 in `frontend/src/components/admin/tabs/AdminStatsTab.tsx` and run:
   ```bash
   cd frontend
   npm run build
   ```
   Verify that `frontend/public/sw.js` and `frontend/public/workbox-*.js` are created, and the build exits with code 0.
2. **Audit Pipeline Check**:
   Run from repository root:
   ```bash
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   Verify the score is 100/100.
