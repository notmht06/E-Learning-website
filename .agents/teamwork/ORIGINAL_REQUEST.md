# Original User Request

## Initial Request — 2026-09-30T00:57:07Z

Redesign the user interface of the "Philosophy Zanjirzan App" (Next.js, React, Tailwind CSS) by modularizing monolithic pages and strictly enforcing a minimalist, anti-slop design system. The redesign is modeled after 3 Dribbble references, emphasizing clean hierarchies, squircle cards, and zero text clutter.

Working directory: E:\personal\philosophy_zanjirzan_app
Integrity mode: demo

## Requirements

### R1. Catalog View (`/courses`, `/books`)
Implement an active category tab strip with minimal underlines (`border-b-2 border-zinc-900 font-medium`). Update course cards to feature a 16:9 media preview, subtle price pill on media corner, bookmark button (`backdrop-blur-sm`), star rating, duration, and lessons count. Use a clean instructor footer row with a circular avatar and credentials. Add a secondary "Featured" row below with compact horizontal cards separated by thin lines.

### R2. Dashboard & Admin Shell (`/dashboard`, `/admin`)
Deconstruct monolithic shell pages into modular components. Build a clean 4-card KPI metric strip with soft-colored circular icon wrappers (`bg-amber-50 text-amber-500`) and bold tabular numbers. Add a minimalist vertical bar chart with rounded tops (`rounded-t-md`). Create an "Ongoing Courses" table using thin progress pill tracks (`w-24 h-1.5 bg-zinc-100` filled with `#8A532B`) and compact rows.

### R3. Learning Environment & Roadmap (`/courses/[id]/learn`, `/roadmap`)
Implement a Vertical Timeline Stepper for both the course playlist and the `/roadmap` timeline. Use a vertical connecting line (`border-l-2 border-zinc-100`), completed solid checkmark nodes (`bg-[#8A532B]`), and hollow circle pending steps. Use accordion-based metadata disclosure for descriptions. Create a clean media player container (`rounded-2xl`) with a frosted glass play button (`bg-black/40 backdrop-blur-md`).

### R4. Design Constraints & Scholar Identity
Enforce the 4px spacing scale (`p-1` through `p-8`) and `text-2xl` heading ceiling. Use the warm paper/obsidian contrast (`bg-[#FAF8F5]` / `bg-[#0C0D0E]`) and terracotta/copper accent (`#8A532B`). Use 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`). Strictly maintain the scholar identity as «حجت الاسلام دکتر زنجیر زن حسینی» and remove any AI slop (no `blur-3xl`, no text gradients, no pulsing dots).

### R5. Multi-Language Support
Ensure all new components, texts, and images support 3 languages: Arabic, Persian, and English. Use the existing Next.js `useLanguage` context (`src/context/LanguageContext.tsx`) and localization dictionaries.

## Verification Resources
- Use `npm run build` to verify Next.js compilation.
- Use `python audit_pipeline.py` to verify the Scholar Identity, Anti-Slop, and Persian Writing rules.

## Acceptance Criteria

### Verification & Compliance
- [ ] `npm run build` completes with 0 errors.
- [ ] `python audit_pipeline.py` passes with a 100/100 score.
- [ ] No `blur-3xl`, `text-transparent bg-clip-text`, or `animate-pulse` classes are added to any new components.
- [ ] The monolithic `admin/page.tsx` and `dashboard/page.tsx` have been refactored into modular components.
- [ ] All text supports Arabic, Persian, and English dynamically.


## Follow-up — 2026-10-07T03:59:53Z

# Teamwork Project Prompt

Restructure the existing Next.js frontend into a standard Progressive Web App (PWA) with a clean, scalable software engineering architecture, focusing on a robust i18n folder structure (fa.ts, en.ts, ar.ts) and modularization.

Requested team: Standard full team
Working directory: e:\personal\philosophy_zanjirzan_app\frontend
Integrity mode: benchmark

## Requirements

### R1. PWA Foundation
Configure a modern Next.js PWA setup (e.g. using `next-pwa`). This includes setting up the `manifest.json`, registering the service worker, and ensuring the application is installable and has basic offline caching capabilities.

### R2. Enterprise i18n Architecture
Implement a clean, strongly-typed localization system. Extract all hardcoded texts into strict dictionary files (`fa.ts`, `en.ts`, `ar.ts`) located in a dedicated `messages/` or `locales/` directory. The implementation must allow for easy feature additions in the future without cluttering components.

### R3. Folder Structure Standardization
Reorganize the frontend source code into a highly standard, clean architecture. Separate components, hooks, contexts, and domain logic clearly so the codebase is ready for future feature expansions without hallucinated logic or messy dependencies.

### R4. Test-Driven Behavioral Verification
Before making any major architectural changes, the team MUST read any existing test files (e.g., in `backend/tests` or frontend if applicable) and `audit_pipeline.py` to fully understand the expected behaviors, anti-slop rules, and identity constraints. The refactoring must preserve all expected behaviors without breaking existing tests.

## Acceptance Criteria

### PWA Configuration
- [ ] A `manifest.json` (or equivalent PWA manifest) is successfully served or generated.
- [ ] Service worker files (`sw.js` and `workbox-*.js`) are successfully compiled into the `public/` directory upon running the build.

### Clean i18n & Architecture
- [ ] The localization dictionaries (`fa.ts`, `en.ts`, `ar.ts`) exist and enforce TypeScript type-checking for keys.
- [ ] Running `npm run build` completes successfully with zero TypeScript or ESLint errors.
- [ ] The `audit_pipeline.py` passes with a 100/100 score to ensure no design tokens or identity rules were broken during the restructure.


## Follow-up — 2026-10-12T00:59:20Z

# Teamwork Project Prompt

Implement end-to-end persistent authentication connecting the Next.js frontend login/registration interface directly to the FastAPI backend with database transactions (SQLAlchemy/SQLite), eliminating all in-memory and localStorage mocks. Enforce the REA (Reverse-Engineering Architecture) engineering methodology across both backend and frontend layers.

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

## Follow-up — 2026-10-13T03:02:29Z

# Teamwork Project Prompt

Implement end-to-end persistent Course Enrollment, Shopping Cart, and Checkout subsystems connecting the Next.js frontend to FastAPI and persistent SQLite database, permanently unlocking enrolled courses and lessons for authenticated students. Enforce REA (Reverse-Engineering Architecture) standards across all modified layers.

Requested team: Standard full team
Working directory: e:\personal\philosophy_zanjirzan_app
Integrity mode: demo

## Architecture & Engineering Directives (REA Methodology)

1. **Clear Architectural Boundaries:**
   - Decouple UI state from backend mutation endpoints; manage checkout and enrollment logic via dedicated domain hooks or service clients.
   - Enforce the 200 LOC ceiling on all newly created or refactored components.
2. **Design Tokens & Quality Discipline:**
   - Maintain 4px spacing scale (`p-1` through `p-8`), deep obsidian `#0C0D0E`, warm paper `#FAF8F5`, and terracotta accent `#8A532B`.
   - 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
   - Official scholar identity must remain strictly: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero bureaucratic tells (`می‌باشد`, `می‌گردد`) and clean Persian typography.

## Requirements

### R1. Backend Persistent Course Enrollment & Orders
Implement persistent database transactions for course enrollments and checkout orders using SQLAlchemy async sessions (`backend/app/models/models.py`). Create or enhance API endpoints (`/api/v1/courses/{course_id}/enroll` and `/api/v1/orders/create`) to record active enrollments in the `enrollments` table linked to the authenticated user's ID. Prevent duplicate enrollments with clear Persian error messages and provide an endpoint (`/api/v1/courses/enrolled` or via `/me`) to retrieve the user's active courses.

### R2. Live Frontend Course Enrollment & Player Unlock
Wire the course enrollment button in `frontend/src/app/courses/[id]/page.tsx` and the checkout actions in `CartModal.tsx` to dispatch live authenticated requests via `apiClient`. Upon successful enrollment, update the global auth/user state, transition the action button to "ورود به محیط یادگیری و پخش دوره" linking directly to `/courses/[id]/learn`, and unlock all course lessons in the learning player.

### R3. Student Dashboard Real Enrollment Synchronization
Update `/dashboard` (`DashboardOverviewTab.tsx` and `DashboardCoursesTab.tsx`) to display the student's live enrolled courses retrieved from the backend database in the `OngoingCoursesTable`, showing correct course titles, instructor credentials, and direct continue-learning buttons.

## Acceptance Criteria

### Backend & Database Persistence
- [ ] Enrolling in a course inserts an active row into the SQLite database (`enrollments` table) tied to the authenticated user's ID.
- [ ] Attempting to re-enroll in an already active course returns HTTP 400 with a structured Persian message and does not duplicate records.
- [ ] Authenticated requests to fetch enrolled courses return the user's active courses from the database.

### Frontend Integration & Player Unlocking
- [ ] Clicking the enrollment button on a course page while logged in triggers a live API request and updates state without requiring a full page refresh.
- [ ] After enrollment, the course details page displays "ثبت‌نام شده" with a prominent link to `/courses/[id]/learn`.
- [ ] Navigating to `/dashboard` renders the enrolled course in the active courses table.
- [ ] Session persistence survives browser refresh without losing unlocked status.

### Verification & Compliance
- [ ] `backend/tests/test_in_memory.py` passes 100% with new enrollment integration tests.
- [ ] `audit_pipeline.py` passes with a 100/100 score.
- [ ] `npm run build` completes with 0 errors.

## Follow-up — 2026-10-14T04:02:02Z

# Teamwork Project Prompt

Comprehensive refactoring and hardening of the Dr. Zanjirzan Platform across Phases 6 through 9: Event Loop optimization, database query optimization with `selectinload`, `UserFavorite` table, RFC 7233 Range seeking, payment replay-attack protection, AI SSE streaming, Docker standalone deployment, font unification with `next/font`, and exhaustive edge-case test suites.

Requested team: Standard full team
Working directory: E:\personal\philosophy_zanjirzan_app
Integrity mode: demo

## Requirements

### R1. Event Loop Optimization, Database Queries & Range Streaming (Phase 6)
- Ensure all endpoints in `backend/app/api/v1/endpoints/` and `backend/app/models/database.py` use pure non-blocking `AsyncSession` transactions with zero blocking synchronous ORM calls inside `async def` routes.
- In `backend/app/models/models.py`, add composite index `(user_id, course_id)` on `Enrollment` and create `UserFavorite` table with composite index `(user_id, course_id)` to support the Dribbble `Favourite` tab.
- Apply `selectinload` across `course_service.py`, `book_service.py`, and `order_service.py` to eliminate N+1 Query latency on related models (`lessons`, `enrollments`, `items`).
- In `backend/app/api/v1/endpoints/stream.py` and `drm_service.py`, implement full RFC 7233 `Range` requests with `206 Partial Content`, `Accept-Ranges: bytes`, and `Content-Range: bytes {start}-{end}/{total}` supporting precise audio/video seek scrubbing and playback resumption from timestamped notes.

### R2. Advanced Payment Security, JWT & AI Streaming SSE (Phase 7)
- In `backend/app/services/payment_service.py`, `backend/app/api/v1/endpoints/payment.py`, and `order_service.py`, prevent payment replay attacks by enforcing tracking code and authority uniqueness with database locks. Final order pricing must be computed 100% server-side based on catalog rates and validated coupon rules.
- In `backend/app/api/v1/endpoints/ai.py` and `ai_service.py`, implement token-by-token streaming via `StreamingResponse` with `text/event-stream` format. Enforce maximum input prompt length validation and integrate per-user token-bucket rate limiting via `rate_limiter.py`.
- In `backend/app/api/v1/endpoints/admin.py` and `deps.py`, enforce strict Role-Based Access Control (`get_current_admin`) at both the router and endpoint levels.

### R3. Font Unification, Docker & Documentation Harmony (Phase 8)
- Move deprecated root brief files (`antigravity-redesign-brief.md`, `antigravity-redesign-brief_V2.md`) into `docs/archive/`, and establish `DESIGN.md` as the single source of truth featuring the Dribbble production palette (`#FCF9F4`, `#D6534F`, `#1B1B1B`, `#F2EFE9`).
- Configure `Vazirmatn` and `Lalezar` in `frontend/src/app/layout.tsx` via `next/font` with `display: 'swap'` to decouple font assets from local file systems in Docker containers.
- In `frontend/next.config.js`, enable `output: 'standalone'` and security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`). Update `docker-compose.yml` with healthchecks and sync `.env.example`.

### R4. Edge-Case Test Suite Completion (Phase 9)
- In `backend/tests/test_api_v1.py` and `backend/tests/test_in_memory.py`, add and verify:
  1. Unauthorized student access to `/api/v1/admin` returns HTTP 403 Forbidden.
  2. RFC 7233 `Range: bytes=...` requests return HTTP 206 Partial Content with correct slice and `Content-Range`.
  3. Replay attack rejection on payment verification and expired coupon rejection.
  4. Timestamped study notes CRUD (`/api/v1/notes`) and scholarly Q&A interactions (`/api/v1/qa`).
- Ensure all tests pass with 100% success rate and `audit_pipeline.py` maintains 100/100.

## Acceptance Criteria

### Backend & Database Architecture
- [ ] No synchronous session calls block the asyncio Event Loop in any endpoint.
- [ ] `UserFavorite` table and composite indexes `(user_id, course_id)` are defined in `models.py` and migrated.
- [ ] `selectinload` is utilized for relational queries in services.
- [ ] HTTP `Range` requests return status `206 Partial Content` with `Content-Range` matching requested bytes.
- [ ] Replay payment verification attempts return HTTP 400.
- [ ] AI chat endpoint supports `text/event-stream` SSE streaming and validates input length.
- [ ] All admin routes strictly reject non-admin users with HTTP 403.

### Frontend, Docker & Docs
- [ ] `docs/archive/` contains archived redesign briefs.
- [ ] `DESIGN.md` serves as single source of truth for Dribbble palette tokens.
- [ ] `Vazirmatn` and `Lalezar` fonts use `next/font` with `display: 'swap'`.
- [ ] `frontend/next.config.js` builds with `output: 'standalone'` and security headers.
- [ ] `npm run build` completes with 0 errors.

### Verification & Compliance
- [ ] `backend/tests/test_in_memory.py` passes 100%.
- [ ] `backend/tests/test_api_v1.py` passes 100%.
- [ ] `python audit_pipeline.py` scores 100/100.
