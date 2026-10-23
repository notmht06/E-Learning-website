# Adversarial Challenge Report — Milestone 1 (Challenger m1_1)

## Challenge Summary

**Overall risk assessment**: LOW

All 8 adversarial attack vectors passed empirical verification without a single unhandled server crash, data corruption, or constraint breach. The backend implementation in `backend/app` demonstrably enforces atomic SQLite persistence, unique enrollment constraints (`uq_user_course_enrollment`), proper HTTP 400 rejection for sequential and concurrent duplicate enrollments, HTTP 401 unauthenticated defenses, and HTTP 404 structured errors for non-existent courses.

---

## Challenges & Adversarial Vectors

### [Low] Challenge 1: Concurrent Enrollment Race Condition & Database Locking
- **Assumption challenged**: That SQLite under WAL mode and FastAPI async sessions gracefully serialize concurrent duplicate requests without deadlocks or constraint race breaches.
- **Attack scenario**: 10 simultaneous threads invoking `POST /api/v1/courses/course-bidayat/enroll` for the identical student token and course ID.
- **Blast radius**: If unhandled, SQLite `IntegrityError` or database lock errors could result in HTTP 500 crashes or multiple duplicate rows in `enrollments`.
- **Empirical result**: Exactly 1 request received HTTP 200, and 9 requests received HTTP 400 (`DUPLICATE_ENROLLMENT`). The SQLite table retained exactly 1 physical row (`SELECT count(*) == 1`). Zero unhandled 500 errors.
- **Mitigation / Assessment**: Existing unique index `CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_enrollment ON enrollments (user_id, course_id)` coupled with pre-check in `enroll_student` provides dual-layer defense.

### [Low] Challenge 2: Non-existent Course Enrollment & Table Pollution
- **Assumption challenged**: That non-existent course IDs do not trigger auto-creation of phantom records or foreign key crashes.
- **Attack scenario**: A student submits `POST /api/v1/courses/course-phantom-xyz/enroll` with a valid JWT token.
- **Blast radius**: Orphan records in `enrollments` or unhandled database exception / 500 error.
- **Empirical result**: System immediately raises `EntityNotFoundException` and returns structured HTTP 404 (`ENTITY_NOT_FOUND`). Zero records inserted into `courses` or `enrollments` tables.
- **Mitigation / Assessment**: Catalog lookup `self.get_course_by_id(course_id)` executes before database mutation, guaranteeing valid course IDs.

### [Low] Challenge 3: Malicious Course IDs, SQL Injection & Path Traversal
- **Assumption challenged**: That parameterized queries and path parsing neutralize SQL injection and directory traversal attacks on course routes.
- **Attack scenario**: Injected malicious payloads including:
  - `course-'; DROP TABLE enrollments; --`
  - `course-' OR '1'='1`
  - `../../etc/passwd`
  - Long strings (800+ chars)
  - Raw Persian unicode non-catalog strings
- **Blast radius**: Database corruption, table drop, or directory disclosure.
- **Empirical result**: All malicious payloads returned HTTP 404 or 422 safely. The `enrollments` table remained intact and undamaged.
- **Mitigation / Assessment**: SQLAlchemy parameterized query binding completely neutralizes injection.

### [Low] Challenge 4: Order Checkout Auto-Enrollment Idempotency
- **Assumption challenged**: That placing an order containing an already-enrolled course does not crash checkout or create duplicate enrollments.
- **Attack scenario**: A student pre-enrolled in `course-asfar` places an order with a cart containing both `course-asfar` (already enrolled) and `course-ishraq` (new).
- **Blast radius**: Order failure or duplicate rows in `enrollments`.
- **Empirical result**: Order completed with HTTP 200, returning valid `order_id` (`ORD-...`). `course-asfar` remained at 1 enrollment row, while `course-ishraq` was auto-enrolled with 1 row. `/auth/me` and `/courses/enrolled` correctly hydrated both courses.
- **Mitigation / Assessment**: `order_service.py` checks `enr_chk` prior to creating `Enrollment` records.

---

## Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| **Vector 1**: Sequential Duplicate Enrollment (3x) | HTTP 400, structured Persian error, count = 1 | HTTP 400 (`DUPLICATE_ENROLLMENT`), count = 1 | PASS |
| **Vector 2**: 10 Concurrent Race Enrollment Requests | Exactly 1 HTTP 200, 9 HTTP 400, count = 1 | `[200, 400, 400, 400, 400, 400, 400, 400, 400, 400]`, count = 1 | PASS |
| **Vector 3**: Anonymous / Malformed Auth Headers | HTTP 401 across /enroll and /enrolled | HTTP 401 for anonymous, tampered, bad prefix, and blank token | PASS |
| **Vector 4**: Phantom Course ID Enrollment | HTTP 404 `ENTITY_NOT_FOUND`, no DB pollution | HTTP 404, 0 rows in courses, 0 rows in enrollments | PASS |
| **Vector 5**: SQL Injection & Malicious Course IDs | HTTP 404/422, zero corruption | HTTP 404/422, enrollments table fully intact | PASS |
| **Vector 6**: Fresh Student Lifecycle & Scholar Name | 0 enrollments initially, 1 after /enroll, strict scholar name | 0 initial, 1 after enroll, «حجت الاسلام دکتر زنجیر زن حسینی» verified | PASS |
| **Vector 7**: Order Checkout with Pre-enrolled Items | HTTP 200, idempotency preserved, no duplicate rows | HTTP 200, both courses hydrated, exactly 1 row per course | PASS |
| **Vector 8**: SQLite Foreign Key & Unique Constraint | Direct raw duplicate insert rejected with IntegrityError | `sqlite3.IntegrityError: UNIQUE constraint failed`, 0 orphan rows | PASS |

---

## Unchallenged Areas

- **Frontend client UI integration**: Out of scope for Milestone 1; allocated to Milestone 2 (`apiClient.ts`, `AuthContext.tsx`, `CartModal.tsx`, `CourseEnrollmentCard.tsx`).
- **Live payment gateway callbacks (Shetab/ZarinPal)**: Simulated in mock transaction tier; real bank webhook integration is scheduled for future production deployment.

---

## Verdict

**APPROVE** — Milestone 1 backend persistent course enrollment, orders subsystem, and SQLite database models are robust, strictly compliant, and ready for Milestone 2 frontend integration.
