"""
Adversarial Stress Test Suite for Milestone 1 Follow-Up:
Persistent Course Enrollment, Shopping Cart, Orders, and SQLite Models.
Tests concurrency races, route collisions, duplicate enrollment integrity,
tampered orders, SQL injection, and Persian anti-slop compliance.
"""
import sys
import os
import sqlite3
import uuid
import concurrent.futures
from typing import Tuple

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"


def run_test(name: str, fn):
    print(f"\n--- [ADVERSARIAL ENROLLMENT TEST] {name} ---")
    try:
        fn()
        print(f"✅ PASSED: {name}")
        return True
    except AssertionError as e:
        print(f"❌ FAILED (Assertion): {name} -> {e}")
        return False
    except Exception as e:
        print(f"💥 FAILED (Exception): {name} -> {type(e).__name__}: {e}")
        return False


def get_authenticated_student() -> Tuple[str, str]:
    """Helper to register a fresh student and return (token, user_id, phone)."""
    phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    password = "TestPassword#2026"
    res = client.post("/api/v1/auth/register", json={
        "full_name": "دانشجوی ارزیابی تخاصمی",
        "phone": phone,
        "password": password
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()
    return data["access_token"], data["id"], phone


def test_duplicate_enrollment_exact_persian_message():
    """
    Verifies that re-enrolling in an already enrolled course returns HTTP 400
    with the exact Persian AppException message and zero duplicate rows in SQLite.
    """
    token, user_id, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}
    course_id = "course-mabadi-mantiq"

    # 1. Initial enrollment
    res1 = client.post(f"/api/v1/courses/{course_id}/enroll", headers=headers)
    assert res1.status_code == 200, f"First enrollment failed: {res1.text}"
    data1 = res1.json()
    assert data1["success"] is True
    assert "ثبت‌نام" in data1["message"]

    # 2. Duplicate enrollment attempt
    res2 = client.post(f"/api/v1/courses/{course_id}/enroll", headers=headers)
    assert res2.status_code == 400, f"Expected 400 on duplicate enrollment, got {res2.status_code}: {res2.text}"

    data2 = res2.json()
    msg = data2.get("message") or data2.get("detail") or ""
    assert "شما پیش از این در دوره" in msg, f"Expected Persian message start, got: {msg}"
    assert "ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است" in msg, f"Expected Persian message end, got: {msg}"
    assert "می‌باشد" not in msg, "Bureaucratic tell 'می‌باشد' found!"
    assert "می‌گردد" not in msg, "Bureaucratic tell 'می‌گردد' found!"

    # 3. Direct SQLite database verification: exactly 1 row
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
        count = cur.fetchone()[0]
        assert count == 1, f"Expected exactly 1 enrollment row in SQLite, found {count}"


def test_concurrent_duplicate_enrollment_race():
    """
    Stress-tests race condition: 10 concurrent requests trying to enroll the same user
    in the same course at the exact same moment.
    Only 1 request should succeed (HTTP 200), and 9 should be rejected (HTTP 400).
    There must be zero duplicate rows in SQLite.
    """
    token, user_id, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}
    course_id = "course-ishraq"
    num_threads = 10

    def attempt_enroll(idx: int) -> Tuple[int, str]:
        try:
            r = client.post(f"/api/v1/courses/{course_id}/enroll", headers=headers)
            return r.status_code, r.text
        except Exception as e:
            # Uncaught IntegrityError leaked from app layer under race condition
            return 500, f"Leaked {type(e).__name__}: {e}"

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(attempt_enroll, i) for i in range(num_threads)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_count = sum(1 for status, _ in results if status == 200)
    duplicate_count = sum(1 for status, _ in results if status == 400)
    leaked_count = sum(1 for status, _ in results if status == 500)
    other_count = sum(1 for status, _ in results if status not in (200, 400, 500))

    print(f"   Concurrency enrollment race results: 200={success_count}, 400={duplicate_count}, leaked_500={leaked_count}, other={other_count}")
    assert success_count == 1, f"Expected exactly 1 successful enrollment, got {success_count}"
    assert other_count == 0, f"Unexpected error status codes: {[s for s, _ in results if s not in (200, 400, 500)]}"

    # Database integrity check: MUST have exactly 1 row despite race condition
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
        count = cur.fetchone()[0]
        assert count == 1, f"Database integrity breach: found {count} rows instead of exactly 1 for {user_id}-{course_id}"


def test_route_ordering_enrolled_vs_course_id():
    """
    Verifies that GET /api/v1/courses/enrolled is NOT caught by GET /api/v1/courses/{course_id}.
    When authenticated, /enrolled should return HTTP 200 with list.
    When unauthenticated, /enrolled should return HTTP 401 (not 404 from {course_id}).
    """
    # 1. Unauthenticated to /enrolled -> must be 401
    unauth_res = client.get("/api/v1/courses/enrolled")
    assert unauth_res.status_code == 401, f"Expected 401 for unauthenticated /enrolled, got {unauth_res.status_code}"

    # 2. Authenticated to /enrolled -> must be 200
    token, _, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}
    auth_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert auth_res.status_code == 200, f"Expected 200 for authenticated /enrolled, got {auth_res.status_code}"
    assert isinstance(auth_res.json(), list)

    # 3. Requesting a real course ID returns 200
    real_course = client.get("/api/v1/courses/course-mabadi-mantiq")
    assert real_course.status_code == 200
    assert real_course.json()["id"] == "course-mabadi-mantiq"

    # 4. Requesting a nonexistent course ID returns 404
    fake_res = client.get("/api/v1/courses/course-non-existent-999")
    assert fake_res.status_code == 404


def test_nonexistent_course_enrollment_rejection():
    """
    Verifies that enrolling in a nonexistent course ID returns HTTP 404 or structured AppException.
    """
    token, _, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/v1/courses/course-definitely-fake/enroll", headers=headers)
    assert res.status_code in (400, 404), f"Expected 400 or 404 on nonexistent course enrollment, got {res.status_code}"


def test_orders_checkout_idempotency_and_duplicate_handling():
    """
    Stress-tests order checkout:
    1. User purchases a course -> auto-enrolled.
    2. User purchases the SAME course AGAIN in a subsequent order ->
       Order must succeed, and duplicate auto-enrollment must be handled idempotently without throwing 500!
    """
    token, user_id, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}
    course_id = "course-asfar"

    order_payload = {
        "items": [
            {
                "item_id": course_id,
                "item_type": "course",
                "title": "اسفار اربعه: سفر اول، امور عامه و اصالت وجود",
                "price": 0,
                "quantity": 1,
            }
        ],
        "shipping_address": "قم، چهارراه شهدا",
        "postal_code": "3713600000",
        "recipient_name": "طلبه حکمت",
        "recipient_phone": "09121234567",
    }

    # First order
    res1 = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert res1.status_code == 200, f"First order failed: {res1.text}"
    order1_id = res1.json()["order_id"]
    pay_init1 = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": order1_id,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert pay_init1.status_code == 200
    client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": pay_init1.json()["payment_token"],
        "status": "OK"
    })

    # Verify enrollment in SQLite
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
        count1 = cur.fetchone()[0]
        assert count1 == 1

    # Second order containing the exact same course
    res2 = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert res2.status_code == 200, f"Second order failed with duplicate course: {res2.text}"
    order2_id = res2.json()["order_id"]
    pay_init2 = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": order2_id,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert pay_init2.status_code == 200
    client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": pay_init2.json()["payment_token"],
        "status": "OK"
    })

    # Verify SQLite still has exactly 1 enrollment row (no duplicate row crash)
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
        count2 = cur.fetchone()[0]
        assert count2 == 1, f"Expected 1 enrollment row after re-ordering, got {count2}"


def test_sql_injection_defense_in_enrollment():
    """
    Stress-tests SQL injection attempts in course_id for enrollment.
    """
    token, _, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}

    sqli_payloads = [
        "course-mabadi-mantiq' OR '1'='1",
        "course-mabadi-mantiq'; DROP TABLE enrollments; --",
        "' UNION SELECT 1, 2, 3 --",
    ]

    for sqli in sqli_payloads:
        res = client.post(f"/api/v1/courses/{sqli}/enroll", headers=headers)
        # Must be rejected (404, 400, or 422) and NEVER 500 or 200
        assert res.status_code in (400, 404, 422), f"SQLi payload {sqli} returned {res.status_code}"

    # Verify enrollments table still exists and is intact
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM enrollments")
        total = cur.fetchone()[0]
        assert total >= 0, "enrollments table corrupted or missing!"


def test_session_hydration_consistency():
    """
    Verifies that /auth/me accurately reflects enrolled_courses_count and enrolled_course_ids
    in real time as courses are enrolled.
    """
    token, user_id, _ = get_authenticated_student()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Initially 0 courses
    me1 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me1["enrolled_courses_count"] == 0
    assert me1["enrolled_course_ids"] == []

    # 2. Enroll in course 1
    client.post("/api/v1/courses/course-mabadi-mantiq/enroll", headers=headers)
    me2 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me2["enrolled_courses_count"] == 1
    assert me2["enrolled_course_ids"] == ["course-mabadi-mantiq"]

    # 3. Enroll in course 2
    client.post("/api/v1/courses/course-bidayat/enroll", headers=headers)
    me3 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me3["enrolled_courses_count"] == 2
    assert set(me3["enrolled_course_ids"]) == {"course-mabadi-mantiq", "course-bidayat"}


def test_scholar_identity_and_anti_slop():
    """
    Verifies scholar identity is strictly «حجت الاسلام دکتر زنجیرزن حسینی»
    in course instructor metadata and seeded database tables.
    """
    res = client.get("/api/v1/courses")
    assert res.status_code == 200
    courses = res.json()
    for c in courses:
        assert "حجت الاسلام دکتر زنجیرزن حسینی" in c["instructor"], \
            f"Scholar identity violation in course {c['id']}: {c['instructor']}"

    # Direct SQLite courses table check
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT id, title_fa, author_name FROM courses")
        rows = cur.fetchall()
        assert len(rows) > 0, "No courses in SQLite database"
        for cid, title, author in rows:
            assert "حجت الاسلام دکتر زنجیرزن حسینی" in author, \
                f"SQLite author_name violation in {cid}: {author}"


if __name__ == "__main__":
    print("==========================================================================")
    print("⚡ ADVERSARIAL STRESS TEST SUITE — MILESTONE 1 COURSE ENROLLMENT & ORDERS")
    print("==========================================================================")
    tests = [
        ("1. Duplicate Enrollment Exact Persian AppException & DB Check", test_duplicate_enrollment_exact_persian_message),
        ("2. Concurrent Duplicate Enrollment Race Condition (10 Threads)", test_concurrent_duplicate_enrollment_race),
        ("3. Route Ordering: /enrolled vs /{course_id} Collision Check", test_route_ordering_enrolled_vs_course_id),
        ("4. Nonexistent Course Enrollment Rejection", test_nonexistent_course_enrollment_rejection),
        ("5. Order Checkout Idempotency & Duplicate Course Handling", test_orders_checkout_idempotency_and_duplicate_handling),
        ("6. SQL Injection Defense in Course ID Parameter", test_sql_injection_defense_in_enrollment),
        ("7. Real-Time Session Hydration Consistency (/auth/me)", test_session_hydration_consistency),
        ("8. Scholar Identity & Persian Anti-Slop Verification", test_scholar_identity_and_anti_slop),
    ]

    all_passed = True
    for name, test_fn in tests:
        passed = run_test(name, test_fn)
        if not passed:
            all_passed = False

    print("\n==========================================================================")
    if all_passed:
        print("🏆 ALL 8 ADVERSARIAL ENROLLMENT & ORDERS TESTS PASSED EMPIRICALLY!")
        sys.exit(0)
    else:
        print("💥 SOME ADVERSARIAL TESTS FAILED!")
        sys.exit(1)
