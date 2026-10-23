"""
Empirical Verification Script for Milestone 2 API Contracts and DB Persistence
Author: Challenger 2 (challenger_m2_2)
"""
import asyncio
import os
import sys

# Ensure repo root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_m2_contracts():
    print("==================================================================")
    print("EMPIRICAL TEST SUITE: MILESTONE 2 CONTRACTS & PERSISTENCE")
    print("==================================================================")

    # 1. Register a unique student
    phone = f"0912{int(asyncio.get_event_loop().time() * 1000) % 10000000:07d}"
    print(f"\n1. Registering new student with phone: {phone}")
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "دانش‌پژوه آزمایشی مایلستون ۲",
            "phone": phone,
            "password": "Password123!",
        },
    )
    assert reg_resp.status_code == 200, f"Register failed: {reg_resp.text}"
    user_data = reg_resp.json()
    token = user_data.get("access_token")
    assert token, "Access token missing from registration response"
    print(f"   ✅ Registered student. ID: {user_data.get('id')}")

    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify initial session via /auth/me
    print("\n2. Verifying initial /auth/me session hydration")
    me_resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_resp.status_code == 200, f"getMe failed: {me_resp.text}"
    me_data = me_resp.json()
    enrolled_ids = me_data.get("enrolled_course_ids") or []
    count = me_data.get("enrolled_courses_count", 0)
    print(f"   Initial enrolled courses: {enrolled_ids}, count: {count}")
    assert enrolled_ids == [], f"Expected empty enrolled_course_ids, got: {enrolled_ids}"
    assert count == 0, f"Expected 0 count, got: {count}"
    print("   ✅ Fresh student has 0 enrolled courses (no mock fallback).")

    # 3. Verify unauthenticated enrollment rejection
    print("\n3. Testing unauthenticated POST /courses/{id}/enroll rejection")
    unauth_resp = client.post("/api/v1/courses/course-mabadi-mantiq/enroll")
    assert unauth_resp.status_code == 401, f"Expected 401, got: {unauth_resp.status_code}"
    print(f"   ✅ Rejected anonymous enrollment with HTTP 401: {unauth_resp.json().get('detail')}")

    # 4. Enroll in first course
    print("\n4. Enrolling student in course 'course-mabadi-mantiq'")
    enroll_resp = client.post("/api/v1/courses/course-mabadi-mantiq/enroll", headers=auth_headers)
    assert enroll_resp.status_code == 200, f"Enrollment failed: {enroll_resp.text}"
    enroll_data = enroll_resp.json()
    assert enroll_data.get("success") is True, "success should be True"
    assert enroll_data.get("course_id") == "course-mabadi-mantiq"
    assert "enrollment_id" in enroll_data
    assert "enrolled_at" in enroll_data
    assert enroll_data.get("status") == "active"
    print(f"   ✅ Enrollment successful: {enroll_data.get('message')}")

    # 5. Adversarially challenge duplicate enrollment
    print("\n5. Adversarially testing duplicate enrollment rejection")
    dup_resp = client.post("/api/v1/courses/course-mabadi-mantiq/enroll", headers=auth_headers)
    assert dup_resp.status_code == 400, f"Expected 400 for duplicate, got: {dup_resp.status_code}"
    dup_data = dup_resp.json()
    assert dup_data.get("error_code") == "DUPLICATE_ENROLLMENT", f"Expected DUPLICATE_ENROLLMENT, got: {dup_data}"
    assert "پیش از این" in dup_data.get("message", ""), f"Persian duplicate message mismatch: {dup_data}"
    print(f"   ✅ Rejected duplicate re-enrollment with HTTP 400: {dup_data.get('message')}")

    # 6. Verify GET /courses/enrolled
    print("\n6. Testing GET /api/v1/courses/enrolled")
    get_enrolled_resp = client.get("/api/v1/courses/enrolled", headers=auth_headers)
    assert get_enrolled_resp.status_code == 200, f"get_enrolled failed: {get_enrolled_resp.text}"
    enrolled_courses = get_enrolled_resp.json()
    assert isinstance(enrolled_courses, list), "Expected list of courses"
    assert len(enrolled_courses) == 1, f"Expected 1 course, got: {len(enrolled_courses)}"
    assert enrolled_courses[0]["id"] == "course-mabadi-mantiq"
    print(f"   ✅ GET /courses/enrolled returned: {enrolled_courses[0]['title']}")

    # 7. Verify session hydration via GET /auth/me after enrollment
    print("\n7. Verifying /api/v1/auth/me reflects active enrollment")
    me_resp_2 = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_resp_2.status_code == 200
    me_data_2 = me_resp_2.json()
    assert me_data_2.get("enrolled_course_ids") == ["course-mabadi-mantiq"]
    assert me_data_2.get("enrolled_courses_count") == 1
    print(f"   ✅ /auth/me accurately returned enrolled_course_ids: {me_data_2.get('enrolled_course_ids')}")

    # 8. Enroll in second course 'course-bidayat'
    print("\n8. Enrolling in second course 'course-bidayat'")
    enroll_resp_2 = client.post("/api/v1/courses/course-bidayat/enroll", headers=auth_headers)
    assert enroll_resp_2.status_code == 200
    me_resp_3 = client.get("/api/v1/auth/me", headers=auth_headers)
    assert set(me_resp_3.json().get("enrolled_course_ids")) == {"course-mabadi-mantiq", "course-bidayat"}
    assert me_resp_3.json().get("enrolled_courses_count") == 2
    print(f"   ✅ Successfully enrolled in 2 courses. Count: 2")

    # 9. Test Non-existent course enrollment
    print("\n9. Testing non-existent course enrollment rejection")
    not_found_resp = client.post("/api/v1/courses/course-does-not-exist/enroll", headers=auth_headers)
    assert not_found_resp.status_code == 404, f"Expected 404, got: {not_found_resp.status_code}"
    print(f"   ✅ Non-existent course returned HTTP 404: {not_found_resp.json().get('message')}")

    print("\n==================================================================")
    print("🎉 ALL EMPIRICAL BACKEND CONTRACT CHECKS PASSED (9/9)")
    print("==================================================================")

if __name__ == "__main__":
    test_m2_contracts()
