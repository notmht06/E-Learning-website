# BRIEFING — 2026-10-07T05:05:00Z

## Mission
Standardize frontend folder structure into a clean, decoupled architecture across Presentation, State/Context, Hooks, Domain/Services, Types, Locales, and Lib layers while maintaining 100% build pass, preserving hard path constraints, and maintaining backward compatibility via barrel exports.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa
- Working directory: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_arch_1
- Original parent: 6880bd69-bbdb-447f-a7a1-e24c8f6356bc
- Milestone: Milestone 3: Folder Structure Standardization & Clean Architecture Restructure

## 🔒 Key Constraints
- NEVER move or delete:
  1. frontend/src/components/motion/MotionPrimitives.tsx
  2. frontend/src/components/Navbar.tsx
  3. frontend/src/lib/data.ts
  4. frontend/src/app/sitemap.ts and frontend/src/app/robots.ts
  5. frontend/public/llms.txt
- Official scholar identity must be strictly preserved: «حجت الاسلام دکتر زنجیر زن حسینی»
- Strict Anti-Slop adherence (no neon glows, no gradient clipped text, no pulsing green dots)
- Keep barrel re-exports in frontend/src/components/ so legacy imports resolve cleanly
- Typescript `npx tsc --noEmit` must pass with 0 errors
- `npm run build` must build all 15 routes with 0 errors
- `audit_pipeline.py` must pass with 100/100
- `backend/tests/test_in_memory.py` must pass 100%

## Current Parent
- Conversation ID: 6880bd69-bbdb-447f-a7a1-e24c8f6356bc
- Updated: 2026-10-07T05:05:00Z

## Task Summary
- **What to build**: Standardize frontend/src/ into Presentation (ui, shell, motion, admin, dashboard, learn, reader), State (context), Hooks (hooks), Domain/Services (services), Types (types), Locales (locales), Lib (lib), with full barrel index files, CartContext, DashboardSecurityTab, DashboardEnrollmentsTab, and facades for backward compatibility.
- **Success criteria**: 0 TS errors, 15 routes built, 100/100 audit pipeline, 100% backend test pass.
- **Interface contracts**: Clean modular architecture with barrel exports and path aliases.

## Key Decisions Made
- Implemented `CartContext.tsx` with local storage persistence and multi-tab synchronization; wrapped RootLayout with `<CartProvider>`.
- Preserved `frontend/src/components/motion/MotionPrimitives.tsx` and `frontend/src/components/Navbar.tsx` exactly at their paths to protect audit pipeline gates.
- Relocated `CommandPalette`, `GlobalOverlays`, and `PWARegistration` to `components/shell/` with backward-compatible facades at root components.
- Relocated `AdminCharts` to `components/admin/AdminCharts.tsx` with facade at root components.
- Relocated `AudioPlayerIsland` and `AudioUploaderModal` to `components/learn/` with facades at root components.
- Created `components/reader/BookReader3D.tsx` with facade at root components.
- Created `DashboardEnrollmentsTab.tsx` and `DashboardSecurityTab.tsx` in `components/dashboard/tabs/`.
- Created barrel `index.ts` files for: `components/`, `components/ui/`, `components/shell/`, `components/motion/`, `components/admin/`, `components/admin/tabs/`, `components/dashboard/`, `components/dashboard/shared/`, `components/dashboard/tabs/`, `components/learn/`, `components/reader/`, `context/`, `hooks/`, `services/`, `lib/`.

## Artifact Index
- DISPATCH.md — assignment details
- BRIEFING.md — persistent situational awareness
- progress.md — liveness heartbeat
- handoff.md — final handoff report

## Change Tracker
- **Files modified/created**:
  - `frontend/src/context/CartContext.tsx`: New cart context provider and hook
  - `frontend/src/context/index.ts`: Barrel index for contexts
  - `frontend/src/app/layout.tsx`: Mounted CartProvider in root layout tree
  - `frontend/src/hooks/index.ts`: Barrel index for hooks
  - `frontend/src/services/index.ts`: Barrel index and typed service delegates
  - `frontend/src/components/ui/index.ts`: Barrel index for UI primitives
  - `frontend/src/components/shell/CommandPalette.tsx`: Relocated implementation
  - `frontend/src/components/shell/GlobalOverlays.tsx`: Relocated implementation
  - `frontend/src/components/shell/PWARegistration.tsx`: Relocated implementation
  - `frontend/src/components/shell/index.ts`: Barrel index for shell
  - `frontend/src/components/CommandPalette.tsx`: Facade re-export
  - `frontend/src/components/GlobalOverlays.tsx`: Facade re-export
  - `frontend/src/components/PWARegistration.tsx`: Facade re-export
  - `frontend/src/components/motion/index.ts`: Barrel index for motion
  - `frontend/src/components/admin/AdminCharts.tsx`: Relocated implementation
  - `frontend/src/components/AdminCharts.tsx`: Facade re-export
  - `frontend/src/components/admin/tabs/index.ts`: Barrel index for admin tabs
  - `frontend/src/components/admin/index.ts`: Barrel index for admin layer
  - `frontend/src/app/admin/page.tsx`: Updated import to clean admin/tabs path
  - `frontend/src/components/dashboard/shared/index.ts`: Barrel index for dashboard shared components
  - `frontend/src/components/dashboard/tabs/DashboardOverviewTab.tsx`: Rich overview tab with KPI strip and charts
  - `frontend/src/components/dashboard/DashboardOverviewTab.tsx`: Facade re-export
  - `frontend/src/components/dashboard/AdminStatsTab.tsx`: Facade re-export
  - `frontend/src/components/dashboard/tabs/DashboardEnrollmentsTab.tsx`: Enrollments tab
  - `frontend/src/components/dashboard/tabs/DashboardSecurityTab.tsx`: Student DRM session security tab
  - `frontend/src/components/dashboard/tabs/index.ts`: Barrel index for dashboard tabs
  - `frontend/src/components/dashboard/index.ts`: Barrel index for dashboard layer
  - `frontend/src/app/dashboard/page.tsx`: Updated import to clean tabs path
  - `frontend/src/components/learn/AudioPlayerIsland.tsx`: Relocated implementation
  - `frontend/src/components/learn/AudioUploaderModal.tsx`: Relocated implementation
  - `frontend/src/components/AudioPlayerIsland.tsx`: Facade re-export
  - `frontend/src/components/AudioUploaderModal.tsx`: Facade re-export
  - `frontend/src/components/learn/index.ts`: Barrel index for learn layer
  - `frontend/src/components/reader/BookReader3D.tsx`: Relocated implementation
  - `frontend/src/components/BookReader3D.tsx`: Facade re-export
  - `frontend/src/components/reader/index.ts`: Barrel index for reader layer
  - `frontend/src/lib/index.ts`: Barrel index for lib layer
  - `frontend/src/components/index.ts`: Central barrel index for components
- **Build status**: `npx tsc --noEmit` PASS (0 errors), `npm run build` PASS (15/15 routes), `audit_pipeline.py` PASS (100/100), `test_in_memory.py` PASS (100%)
- **Pending issues**: None

## Quality Status
- **Build/test result**: All passing (100%)
- **Lint status**: Clean (0 errors)
- **Tests added/modified**: Verified against full backend test suite and 8-gate quality pipeline
