# Handoff Report — explorer_m4_survey_backend

## 1. Observation
1. **Model Structures (`backend/app/models/models.py`)**:
   - `User` (lines 83–130) has relationship `enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")` and property `phone` as a synonym for `mobile`.
   - `Course` (lines 34–62) has `enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")`.
   - `Enrollment` (lines 131–142) has columns `id`, `user_id` (FK to `users.id`), `course_id` (FK to `courses.id`), `enrolled_at`, and `status`. It lacks a `UniqueConstraint("user_id", "course_id")` in `__table_args__`.
   - No `Order` or `OrderItem` model exists in `models.py`.
2. **Database State and Foreign Keys (`backend/app/models/database.py`)**:
   - SQLite PRAGMA configuration enables foreign keys: `cursor.execute("PRAGMA foreign_keys=ON")` (line 30).
   - In SQLite database `zanjirzan_platform.db`, `SELECT count(*) FROM courses` returns `0`.
   - Verbatim error observed when inserting an `Enrollment` referencing `course-mabadi-mantiq` into `zanjirzan_platform.db`: `Insert failed with FK error: FOREIGN KEY constraint failed`.
   - `init_db()` (lines 104–138) runs `seed_default_users()`, but does not seed catalog courses into the `courses` table.
3. **Course Endpoints (`backend/app/api/v1/endpoints/courses.py`)**:
   - Only `GET /` (line 18), `GET /{course_id}` (line 26), and `POST /{course_id}/progress` (line 37) exist.
   - Endpoint `POST /api/v1/courses/{course_id}/enroll` does NOT exist.
   - Endpoint `GET /api/v1/courses/enrolled` does NOT exist.
4. **Order Endpoints (`backend/app/api/v1/endpoints/orders.py`)**:
   - Endpoint `POST /create` (line 11) is defined synchronously: `def create_order(req: CreateOrderRequest):`.
   - It does not take an authenticated user dependency (`get_current_user` or `get_optional_user`) and does not take `db: AsyncSession = Depends(get_db)`.
   - It does not record any enrollment records in the `enrollments` table.
5. **Auth and Profile Hydration (`backend/app/api/v1/endpoints/auth.py` & `deps.py`)**:
   - `GET /me` (line 80) returns `UserResponse`, which currently only returns `enrolled_courses_count: int` (defaulting to 0 when enrollments relationship is not preloaded) and does not include `enrolled_course_ids`.
6. **Existing Test Suite Baseline**:
   - Command `& backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py` exits with code 0 (100% pass across all 11 existing test suites).
   - Command `& backend/.venv/Scripts/python.exe audit_pipeline.py` exits with code 0 (Quality score 100/100).

---

## 2. Logic Chain
1. **Observation 1 & 2 -> Constraint Risk**:
   - Because `Enrollment.course_id` references `courses.id` and SQLite enforces `PRAGMA foreign_keys=ON`, attempting to insert an enrollment for `course-mabadi-mantiq` fails with `FOREIGN KEY constraint failed` because `courses` table has 0 rows.
   - Therefore, `init_db()` or `database.py` must include a `seed_default_courses(session)` routine that idempotently seeds baseline courses from `course_service.courses` into the `courses` table.
2. **Observation 3 -> Missing Core Enrollment Functionality**:
   - Neither `POST /api/v1/courses/{course_id}/enroll` nor `GET /api/v1/courses/enrolled` exists.
   - To fulfill R1, `courses.py` must expose `POST /{course_id}/enroll` (with duplicate check returning HTTP 400 with structured Persian `AppException`) and `GET /enrolled` returning the active courses for the authenticated user.
3. **Observation 4 -> Missing Cart/Checkout Auto-Enrollment**:
   - `POST /api/v1/orders/create` is currently synchronous and stores orders in an in-memory dictionary.
   - To satisfy R1, `create_order` must become an `async def` endpoint accepting `user: Optional[dict] = Depends(get_optional_user)` and `db: AsyncSession = Depends(get_db)`. When an order contains course items and an authenticated student is present, it must record active enrollments in the `enrollments` table.
4. **Observation 5 -> Frontend State Hydration Disconnect**:
   - When the student refreshes their browser, the frontend calls `GET /api/v1/auth/me`.
   - If `UserResponse` includes `enrolled_course_ids: List[str]` and `auth_service.get_user_by_id` queries the user's active enrollments, the frontend `useAuth` state will hydrate with the student's real enrolled courses from the database.

---

## 3. Caveats
1. `order_service.py` currently maintains in-memory mocks for coupons and admin analytics that are tested by existing tests in `test_in_memory.py`. Any additions to `Order` persistence must preserve backward compatibility with in-memory dictionary lookups to avoid breaking existing tests.
2. Digital vs physical items: The `orders` endpoint handles physical books with 24-digit Iran Post barcodes as well as courses; only course items (`item_type == "course"` or `item_id.startswith("course")`) should be enrolled in `enrollments`.

---

## 4. Conclusion
The backend is well-structured and ready for the R1 enrollment and orders persistence implementation.
The implementer must execute the 6 specific steps detailed in `survey_backend.md`:
1. Add `UniqueConstraint("user_id", "course_id")` to `Enrollment`, and define `Order` / `OrderItem` models in `backend/app/models/models.py`.
2. Add `seed_default_courses()` to `backend/app/models/database.py` in `init_db()` to resolve the SQLite Foreign Key constraint trap.
3. Implement `enroll_student` and `get_enrolled_courses_for_user` in `course_service.py`.
4. Expose `POST /api/v1/courses/{course_id}/enroll` (with HTTP 400 structured Persian duplicate error) and `GET /api/v1/courses/enrolled` in `courses.py`.
5. Upgrade `POST /api/v1/orders/create` to `async def` with user dependency, linking course purchases to `enrollments`.
6. Include `enrolled_course_ids: List[str]` in `UserResponse` and `GET /api/v1/auth/me`.

---

## 5. Verification Method
1. **Database Inspection**:
   Run: `& backend/.venv/Scripts/python.exe -c "import sqlite3; con = sqlite3.connect('zanjirzan_platform.db'); print(con.execute('SELECT count(*) FROM courses').fetchone()); con.close()"`
   Must return greater than 0 after seeding.
2. **Backend In-Memory Integration Tests**:
   Run: `& backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py`
   Must pass 100% including new enrollment persistence tests.
3. **Full Quality Gate Audit**:
   Run: `& backend/.venv/Scripts/python.exe audit_pipeline.py`
   Must pass with a score of 100/100.
4. **Invalidation Conditions**:
   - If `POST /courses/{course_id}/enroll` returns 500 due to foreign key failure (indicates courses table was not seeded).
   - If duplicate enrollment does not return HTTP 400 with a Persian error message.
   - If existing tests fail or score drops below 100.
