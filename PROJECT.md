# Project: End-to-End Persistent Course Enrollment, Cart & Checkout Subsystems
## (FastAPI + SQLAlchemy/SQLite + Next.js App Router + REA Architecture)

## Architecture
- **Backend Architecture**: FastAPI asynchronous REST API, SQLAlchemy `AsyncSession` with SQLite database (`zanjirzan_platform.db`), WAL mode, `PRAGMA foreign_keys=ON;`.
  - Database Models: `User`, `Course`, `Lesson`, `Enrollment` (with `UniqueConstraint("user_id", "course_id")`), `Order`, `OrderItem`.
  - Seeding: `seed_default_courses()` in `backend/app/models/database.py` to satisfy foreign key integrity on course enrollments.
  - Endpoints: `POST /api/v1/courses/{course_id}/enroll`, `GET /api/v1/courses/enrolled`, `POST /api/v1/orders/create` (async with student link and auto-enrollment for course items), `GET /api/v1/auth/me` returning `enrolled_course_ids` and `enrolled_courses_count`.
  - Error Handling: Persian structured `AppException` with HTTP 400 on duplicate enrollments.
- **Frontend Architecture (REA Methodology)**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS.
  - Strict 200 LOC ceiling across all newly created or refactored components and pages.
  - Modular course details page (`CourseDetailHero`, `CourseSyllabusList`, `CourseEnrollmentCard`, `useCourseEnrollment`).
  - Live API integration via `apiClient.courses.enroll` and `apiClient.courses.getEnrolled`.
  - Global `AuthContext` async `enrollCourse` and real session hydration from `/auth/me`.
  - Learning player (`/courses/[id]/learn` & `CoursePlaylistSidebar`) enforcing lesson lock icons on non-preview sessions for non-enrolled visitors, and 100% unlocked playback for enrolled students.
  - Student Dashboard (`DashboardOverviewTab`, `DashboardCoursesTab`, `OngoingCoursesTable`) dynamically synchronizing with active enrolled courses, with continue learning links to `/courses/[id]/learn`.
- **Design Tokens & System**:
  - Obsidian `#0C0D0E`, warm paper `#FAF8F5`, copper/terracotta accent `#8A532B`, 1px borders, rigid 4px spacing scale (`p-1` through `p-8`), 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
  - Official Scholar Identity: «حجت الاسلام دکتر زنجیر زن حسینی» across all database records, components, and metadata.
  - Persian Quality: Strict prohibition of bureaucratic tells (`می‌باشد`, `می‌گردد`), proper ZWNJ (نیم‌فاصله), Persian numerals (۰-۹), Persian quotes («گیومه»).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SQLite Course Seeding in init_db | Seed baseline catalog courses in `database.py` to prevent SQLite foreign key constraint failures | M1 | Backend Survey |
| 2 | Enrollment Model Unique Constraint | Add `UniqueConstraint("user_id", "course_id")` and relationships to `Enrollment` model | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Order & OrderItem SQLite Models | Define `Order` and `OrderItem` SQLAlchemy models linked to `User` in `models.py` | M1 | ORIGINAL_REQUEST §R1 |
| 4 | POST /courses/{id}/enroll Endpoint | Create authenticated async endpoint to record active enrollment in SQLite database | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Duplicate Enrollment Prevention | Reject re-enrollment in active course with HTTP 400 and structured Persian AppException | M1 | ORIGINAL_REQUEST §R1 |
| 6 | GET /courses/enrolled Endpoint | Authenticated async endpoint retrieving current student's active courses from database | M1 | ORIGINAL_REQUEST §R1 |
| 7 | Async POST /orders/create with Enrollment | Convert order creation to `async def`, attach authenticated user, and record course enrollments | M1 | ORIGINAL_REQUEST §R1 |
| 8 | Session Hydration with Enrolled Courses | Expose `enrolled_course_ids` and accurate `enrolled_courses_count` in `/auth/me` and `UserResponse` | M1 | Backend & Frontend Survey |
| 9 | Backend Integration Tests in test_in_memory.py | Add integration tests for enrollment persistence, duplicate rejection, and order checkout | M1 | ORIGINAL_REQUEST Validation |
| 10 | apiClient Courses Enrollment Methods | Add `courses.enroll(courseId)` and `courses.getEnrolled()` to `apiClient.ts` | M2 | ORIGINAL_REQUEST §R2 |
| 11 | AuthContext Live Async Enrollment | Replace mock in-memory array with async `enrollCourse` and real session hydration in `AuthContext.tsx` | M2 | ORIGINAL_REQUEST §R2 |
| 12 | Course Detail Page REA Modularization | Decompose `courses/[id]/page.tsx` (<200 LOC per file) into Hero, Syllabus, EnrollmentCard, and hook | M2 | ORIGINAL_REQUEST REA Directive |
| 13 | Live Action Button State Transition | Transition button to "ورود به محیط یادگیری و پخش دوره" linking to `/courses/[id]/learn` on enrollment | M2 | ORIGINAL_REQUEST §R2 |
| 14 | CartModal Live Checkout & Enrollment | Connect `CartModal.tsx` checkout actions to backend enrollment/order persistence | M2 | ORIGINAL_REQUEST §R2 |
| 15 | Learning Player Lesson Locking & Unlock | Lock non-preview lessons for non-enrolled visitors; unlock 100% of lessons for enrolled students | M2 | ORIGINAL_REQUEST §R2 |
| 16 | DashboardOverviewTab REA Modularization | Refactor `DashboardOverviewTab.tsx` (currently 244 LOC) to comply with 200 LOC ceiling | M3 | Dashboard Survey |
| 17 | OngoingCoursesTable Live Enrolled Sync | Synchronize `DashboardOverviewTab` and `DashboardCoursesTab` with real enrolled courses from backend | M3 | ORIGINAL_REQUEST §R3 |
| 18 | Dashboard Instructor Credential & Learn Links | Display official instructor credentials and resume learning buttons linking to `/courses/[id]/learn` | M3 | ORIGINAL_REQUEST §R3 |
| 19 | Full Quality Pipeline & Audit Verification | Verify 100% pass on `test_in_memory.py`, 100/100 on `audit_pipeline.py`, and 0 errors on `npm run build` | M3 | ORIGINAL_REQUEST Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Persistent Course Enrollment, Orders & SQLite Models | Database seeding, Enrollment UniqueConstraint, Order/OrderItem models, /enroll & /enrolled endpoints, /orders/create async enhancement, /auth/me hydration fields, integration tests in test_in_memory.py | none | DONE |
| M2 | Frontend Live Course Enrollment, CartModal & Player Lesson Unlock | apiClient methods, AuthContext async enrollment & hydration, modularization of courses/[id]/page.tsx (<200 LOC), action button transition, CartModal live flow, learning player lesson locking/unlock | M1 | DONE |
| M3 | Student Dashboard Real Enrollment Sync & E2E Validation | DashboardOverviewTab modularization (<200 LOC), OngoingCoursesTable live sync with backend enrollments, resume learning links, verification of test_in_memory.py, audit_pipeline.py 100/100, and npm run build | M1, M2 | PLANNED |

## Code Layout
- `backend/app/models/models.py` — SQLAlchemy ORM models (`User`, `Course`, `Lesson`, `Enrollment`, `Order`, `OrderItem`)
- `backend/app/models/database.py` — Database engine, sessionmaker, `init_db()`, `seed_default_courses()`
- `backend/app/schemas/course.py` — Schemas for course enrollment response and enrolled courses list
- `backend/app/schemas/auth.py` — `UserResponse` with `enrolled_course_ids: List[str]`
- `backend/app/services/course_service.py` — `enroll_student()`, `get_enrolled_courses_for_user()`
- `backend/app/services/order_service.py` — `create_order_tx()` with database persistence & auto-enrollment
- `backend/app/api/v1/endpoints/courses.py` — `POST /{course_id}/enroll`, `GET /enrolled`
- `backend/app/api/v1/endpoints/orders.py` — `POST /create` (async with user attachment)
- `backend/app/api/v1/endpoints/auth.py` — `GET /me` (querying active enrollments)
- `backend/tests/test_in_memory.py` — Integration tests for enrollment, duplicate prevention, and orders
- `frontend/src/services/apiClient.ts` — `courses.enroll()` and `courses.getEnrolled()`
- `frontend/src/context/AuthContext.tsx` — Async `enrollCourse()`, live hydration of `enrolledCourseIds`
- `frontend/src/components/course/CourseDetailHero.tsx` — Modular course header & scholar info (<100 LOC)
- `frontend/src/components/course/CourseSyllabusList.tsx` — Modular session syllabus list (<100 LOC)
- `frontend/src/components/course/CourseEnrollmentCard.tsx` — Modular sticky enrollment card & action button (<120 LOC)
- `frontend/src/components/course/useCourseEnrollment.ts` — Enrollment mutation and state hook (<80 LOC)
- `frontend/src/app/courses/[id]/page.tsx` — Lightweight orchestration page (<80 LOC)
- `frontend/src/components/CartModal.tsx` — Cart checkout triggering live enrollment
- `frontend/src/app/courses/[id]/learn/page.tsx` — Learning theater with enrollment verification
- `frontend/src/components/course/CoursePlaylistSidebar.tsx` — Lesson playlist with lock/unlock status
- `frontend/src/app/dashboard/DashboardOverviewTab.tsx` — Refactored dashboard overview (<180 LOC)
- `frontend/src/app/dashboard/DashboardOverviewConfig.ts` — Extracted KPI and chart config (<100 LOC)
- `frontend/src/app/dashboard/DashboardCoursesTab.tsx` — Live enrolled courses tab (<120 LOC)
- `frontend/src/components/dashboard/OngoingCoursesTable.tsx` — Table rendering active enrolled courses

## Interface Contracts
### `POST /api/v1/courses/{course_id}/enroll`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: HTTP 200
  ```json
  {
    "success": true,
    "message": "ثبت‌نام شما در دوره «...» با موفقیت انجام شد.",
    "enrollment_id": "enr-...",
    "course_id": "course-...",
    "enrolled_at": "2026-10-13T...",
    "status": "active"
  }
  ```
- **Duplicate Error**: HTTP 400
  ```json
  {
    "success": false,
    "error_code": "DUPLICATE_ENROLLMENT",
    "message": "شما پیش از این در دوره «...» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است."
  }
  ```

### `GET /api/v1/courses/enrolled`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: HTTP 200, Array of `CourseDetailSchema` matching student's active enrollments in SQLite.

### `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: HTTP 200
  ```json
  {
    "id": "usr-...",
    "full_name": "...",
    "phone": "09123456789",
    "role": "student",
    "wallet_balance": "350,000 Tomans",
    "enrolled_courses_count": 1,
    "enrolled_course_ids": ["course-mabadi-mantiq"],
    "access_token": null
  }
  ```
