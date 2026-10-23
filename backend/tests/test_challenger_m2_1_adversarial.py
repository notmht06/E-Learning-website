"""
Empirical Adversarial Challenge Suite — Milestone 2 Frontend & API Integration
Challenger: challenger_m2_1 (Critic & Specialist)
Focus:
  - Persistent course enrollment API contracts for M2 frontend
  - Duplicate enrollment prevention (sequential & concurrent)
  - Auth token requirements (unauthenticated 401)
  - /auth/me hydration with enrolled_course_ids
  - /courses/enrolled response integrity
  - Scholar Identity and Anti-slop invariants
"""
import sys
import os
import sqlite3
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"
SCHOLAR_NAME = "حجت الاسلام دکتر زنجیر زن حسینی"


def create_test_student() -> Dict[str, Any]:
    phone = f"0935{uuid.uuid4().int % 10000000:07d}"
    password = "TestPassword#2026"
    full_name = f"دانش‌پژوه آزمون {uuid.uuid4().hex[:6]}"
    res = client.post("/api/v1/auth/register", json={
        "full_name": full_name,
        "phone": phone,
        "password": password
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()
    return {
        "id": data["id"],
        "phone": phone,
        "token": data["access_token"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"}
    }


def test_m2_unauthenticated_enrollment_rejected():
    """Vector 1: Anonymous request to /enroll must be rejected with 401."""
    res = client.post("/api/v1/courses/course-asfar-arba/enroll")
    assert res.status_code == 401, f"Expected 401 for anonymous enrollment, got {res.status_code}"


def test_m2_unauthenticated_enrolled_courses_rejected():
    """Vector 2: Anonymous request to /courses/enrolled must be rejected with 401."""
    res = client.get("/api/v1/courses/enrolled")
    assert res.status_code == 401, f"Expected 401 for anonymous /enrolled, got {res.status_code}"


def test_m2_successful_enrollment_and_hydration():
    """Vector 3: Authenticated student can enroll, and /auth/me reflects enrollment."""
    student = create_test_student()
    course_id = "course-mabadi-mantiq"

    # Enroll
    res = client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])
    assert res.status_code == 200, f"Enrollment failed: {res.text}"
    body = res.json()
    assert body.get("success") is True
    assert body.get("course_id") == course_id

    # Check /courses/enrolled
    res_enrolled = client.get("/api/v1/courses/enrolled", headers=student["headers"])
    assert res_enrolled.status_code == 200
    enrolled_courses = res_enrolled.json()
    assert any(c["id"] == course_id for c in enrolled_courses), "Enrolled course missing from /enrolled"

    # Check /auth/me hydration
    res_me = client.get("/api/v1/auth/me", headers=student["headers"])
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert course_id in me_data.get("enrolled_course_ids", [])
    assert me_data.get("enrolled_courses_count") >= 1


def test_m2_duplicate_enrollment_prevention():
    """Vector 4: Attempting to enroll again in the same course returns 400 and structured Persian error."""
    student = create_test_student()
    course_id = "course-bidayat"

    # First enrollment
    res1 = client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])
    assert res1.status_code == 200, f"Expected 200 on first enrollment, got {res1.status_code}: {res1.text}"

    # Duplicate enrollment
    res2 = client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])
    assert res2.status_code == 400, f"Expected 400 for duplicate enrollment, got {res2.status_code}: {res2.text}"
    err_body = res2.json()
    assert err_body.get("error_code") == "DUPLICATE_ENROLLMENT" or "پیش از این" in err_body.get("message", "")


def test_m2_concurrent_duplicate_enrollment():
    """Vector 5: Rapid concurrent enrollments do not create duplicate rows."""
    student = create_test_student()
    course_id = "course-asfar"

    def attempt_enroll():
        return client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(lambda _: attempt_enroll(), range(5)))

    status_codes = [r.status_code for r in results]
    success_count = status_codes.count(200)
    conflict_count = status_codes.count(400)
    assert success_count == 1, f"Expected exactly 1 success, got {success_count} (statuses: {status_codes})"
    assert conflict_count == 4, f"Expected 4 conflict responses, got {conflict_count}"

    # Verify SQLite DB has only 1 row for this user and course
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM enrollments WHERE user_id=? AND course_id=?", (student["id"], course_id))
    row_count = cur.fetchone()[0]
    conn.close()
    assert row_count == 1, f"Database has {row_count} rows for student enrollment, expected 1"


def test_m2_non_existent_course_enrollment():
    """Vector 6: Enrolling in a non-existent course returns 404."""
    student = create_test_student()
    res = client.post("/api/v1/courses/non-existent-course-999/enroll", headers=student["headers"])
    assert res.status_code == 404, f"Expected 404 for non-existent course, got {res.status_code}"


if __name__ == "__main__":
    print("=== RUNNING CHALLENGER M2 ADVERSARIAL BACKEND SUITE ===")
    test_m2_unauthenticated_enrollment_rejected()
    print("PASS: Unauthenticated enrollment rejected")
    test_m2_unauthenticated_enrolled_courses_rejected()
    print("PASS: Unauthenticated /enrolled rejected")
    test_m2_successful_enrollment_and_hydration()
    print("PASS: Successful enrollment and /me hydration")
    test_m2_duplicate_enrollment_prevention()
    print("PASS: Duplicate enrollment prevention")
    test_m2_concurrent_duplicate_enrollment()
    print("PASS: Concurrent duplicate enrollment race test")
    test_m2_non_existent_course_enrollment()
    print("PASS: Non-existent course enrollment returns 404")
    print("=== ALL ADVERSARIAL INTEGRATION TESTS PASSED ===")
