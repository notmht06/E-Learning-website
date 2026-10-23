"""
Adversarial Challenge Test Suite — Milestone 1 (Challenger m1_1)
Author: Challenger m1_1 (Adversarial Critic & Specialist)
Focus:
  - Duplicate enrollment rejection (sequential & concurrent race condition)
  - Unauthenticated enrollment and /enrolled requests (401 verification)
  - Non-existent course ID handling (404 and DB non-pollution)
  - SQL injection & malicious course IDs
  - Order checkout auto-enrollment idempotency & duplicate cart items
  - SQLite foreign key integrity and unique constraint validation
"""
import sys
import os
import sqlite3
import uuid
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"

SCHOLAR_NAME = "حجت الاسلام دکتر زنجیر زن حسینی"


def create_test_student() -> Dict[str, Any]:
    """Helper to register a unique student for clean, isolated test runs."""
    phone = f"0933{uuid.uuid4().int % 10000000:07d}"
    password = "TestPassword#2026"
    full_name = f"دانش‌پژوه آزمون {uuid.uuid4().hex[:6]}"
    res = client.post("/api/v1/auth/register", json={
        "full_name": full_name,
        "phone": phone,
        "password": password
    })
    assert res.status_code == 200, f"Failed to register test student: {res.text}"
    data = res.json()
    return {
        "id": data["id"],
        "phone": phone,
        "token": data["access_token"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"}
    }


def run_check(title: str, check_fn):
    print(f"\n[CHALLENGE VECTOR] {title}")
    try:
        check_fn()
        print(f"  --> PASSED: {title}")
        return True
    except AssertionError as err:
        print(f"  --> FAILED (AssertionError): {title} | {err}")
        raise
    except Exception as exc:
        print(f"  --> CRASHED ({type(exc).__name__}): {title} | {exc}")
        raise


def test_vector_1_sequential_duplicate_enrollment():
    """Empirically test that re-enrolling in an active course returns 400 and creates no extra DB rows."""
    student = create_test_student()
    course_id = "course-mabadi-mantiq"

    # 1. First enrollment -> 200 OK
    res1 = client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])
    assert res1.status_code == 200, f"Expected 200 on first enrollment, got {res1.status_code}: {res1.text}"
    body1 = res1.json()
    assert body1.get("success") is True
    assert body1.get("course_id") == course_id

    # 2. Sequential duplicate attempts (3 consecutive times)
    for i in range(1, 4):
        res_dup = client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])
        assert res_dup.status_code == 400, f"Attempt {i}: Expected 400 for duplicate enrollment, got {res_dup.status_code}"
        dup_json = res_dup.json()
        assert dup_json.get("error_code") == "DUPLICATE_ENROLLMENT" or "ثبت‌نام" in dup_json.get("message", "")

    # 3. Direct DB row check
    with sqlite3.connect(DB_PATH) as con:
        count = con.execute(
            "SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (student["id"], course_id)
        ).fetchone()[0]
        assert count == 1, f"Database integrity violation: Expected exactly 1 enrollment row, found {count}"


def test_vector_2_concurrent_duplicate_enrollment_race():
    """Stress test race condition: send 10 concurrent enrollment requests simultaneously for same student & course."""
    student = create_test_student()
    course_id = "course-bidayat"

    def do_enroll():
        # Fresh test client call per thread
        return client.post(f"/api/v1/courses/{course_id}/enroll", headers=student["headers"])

    num_threads = 10
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(do_enroll) for _ in range(num_threads)]
        results = [f.result() for f in futures]

    status_codes = [r.status_code for r in results]
    print(f"      Concurrent response codes: {status_codes}")

    # Exactly one request must succeed with 200, and the others must be rejected (400 or handled error)
    # No 500 server crashes allowed
    assert 200 in status_codes, f"At least one concurrent enrollment should succeed. Got: {status_codes}"
    success_count = status_codes.count(200)
    assert success_count == 1, f"Concurrency breach: multiple enrollments succeeded! Success count: {success_count}"
    assert all(code in (200, 400) for code in status_codes), f"Unexpected status codes returned: {status_codes}"

    # Verify database has exactly 1 row
    with sqlite3.connect(DB_PATH) as con:
        count = con.execute(
            "SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (student["id"], course_id)
        ).fetchone()[0]
        assert count == 1, f"Database race breach: Multiple rows created in SQLite! Count: {count}"


def test_vector_3_unauthenticated_and_malformed_auth():
    """Verify rejection (401) of anonymous and malformed tokens on /enroll and /enrolled."""
    course_id = "course-mabadi-mantiq"

    # 1. Anonymous /enroll
    res_anon_enroll = client.post(f"/api/v1/courses/{course_id}/enroll")
    assert res_anon_enroll.status_code == 401, f"Expected 401 for anonymous /enroll, got {res_anon_enroll.status_code}"

    # 2. Malformed token prefix
    res_bad_prefix = client.post(
        f"/api/v1/courses/{course_id}/enroll",
        headers={"Authorization": "Token some_fake_token_value"}
    )
    assert res_bad_prefix.status_code == 401

    # 3. Blank Bearer token
    res_blank = client.post(
        f"/api/v1/courses/{course_id}/enroll",
        headers={"Authorization": "Bearer "}
    )
    assert res_blank.status_code == 401

    # 4. Tampered / invalid JWT signature
    fake_jwt = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItOTk5OTkifQ.invalid_signature"
    res_tampered = client.post(
        f"/api/v1/courses/{course_id}/enroll",
        headers={"Authorization": fake_jwt}
    )
    assert res_tampered.status_code == 401

    # 5. Anonymous GET /courses/enrolled
    res_anon_get = client.get("/api/v1/courses/enrolled")
    assert res_anon_get.status_code == 401, f"Expected 401 for anonymous /enrolled, got {res_anon_get.status_code}"


def test_vector_4_nonexistent_course_enrollment():
    """Verify that enrolling in a non-existent course returns 404 EntityNotFoundException without crashing or polluting DB."""
    student = create_test_student()
    invalid_course_id = f"course-phantom-{uuid.uuid4().hex[:8]}"

    # Enroll in phantom course
    res = client.post(f"/api/v1/courses/{invalid_course_id}/enroll", headers=student["headers"])
    assert res.status_code == 404, f"Expected 404 for non-existent course, got {res.status_code}: {res.text}"
    body = res.json()
    assert body.get("error_code") == "ENTITY_NOT_FOUND" or "not found" in body.get("message", "").lower()

    # Verify no phantom course or enrollment inserted in SQLite
    with sqlite3.connect(DB_PATH) as con:
        c_row = con.execute("SELECT id FROM courses WHERE id = ?", (invalid_course_id,)).fetchone()
        assert c_row is None, f"Phantom course was polluted into SQLite courses table: {invalid_course_id}"
        e_row = con.execute("SELECT id FROM enrollments WHERE course_id = ?", (invalid_course_id,)).fetchone()
        assert e_row is None, f"Phantom enrollment was polluted into SQLite enrollments table for {invalid_course_id}"


def test_vector_5_adversarial_malicious_course_ids():
    """Verify injection resilience against SQL injection, path traversal, and extreme strings in course_id."""
    student = create_test_student()

    malicious_ids = [
        "course-'; DROP TABLE enrollments; --",
        "course-' OR '1'='1",
        "../../etc/passwd",
        "course-" + "A" * 800,
        "دوره-ناموجود-حکمت-آزمایشی",
    ]

    for mid in malicious_ids:
        res = client.post(f"/api/v1/courses/{mid}/enroll", headers=student["headers"])
        assert res.status_code in (404, 422), f"Adversarial ID {mid} failed with unexpected status {res.status_code}: {res.text}"

    # Verify enrollments table still exists and is untouched
    with sqlite3.connect(DB_PATH) as con:
        tables = [t[0] for t in con.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        assert "enrollments" in tables, "SQL injection dropped enrollments table!"


def test_vector_6_profile_hydration_and_enrolled_parity():
    """Verify fresh student lifecycle: 0 enrollments initially, 1 enrollment after /enroll, correct scholar identity."""
    student = create_test_student()

    # 1. Fresh state: 0 enrolled courses
    enrolled_res0 = client.get("/api/v1/courses/enrolled", headers=student["headers"])
    assert enrolled_res0.status_code == 200
    assert enrolled_res0.json() == [], "New student should have empty enrolled courses list"

    me_res0 = client.get("/api/v1/auth/me", headers=student["headers"])
    assert me_res0.status_code == 200
    me0 = me_res0.json()
    assert me0.get("enrolled_courses_count") == 0
    assert me0.get("enrolled_course_ids") == []

    # 2. Enroll in course-mabadi-mantiq
    target_course = "course-mabadi-mantiq"
    res_enr = client.post(f"/api/v1/courses/{target_course}/enroll", headers=student["headers"])
    assert res_enr.status_code == 200, f"Expected 200, got {res_enr.status_code}: {res_enr.text}"

    # 3. Verify /courses/enrolled returns 1 course with strict scholar name
    enrolled_res1 = client.get("/api/v1/courses/enrolled", headers=student["headers"])
    assert enrolled_res1.status_code == 200
    enrolled_list = enrolled_res1.json()
    assert len(enrolled_list) == 1
    item = enrolled_list[0]
    assert item["id"] == target_course
    assert SCHOLAR_NAME in item["instructor"], f"Scholar name violated in course metadata! Got: {item.get('instructor')}"

    # 4. Verify /auth/me returns updated enrolled count and IDs
    me_res1 = client.get("/api/v1/auth/me", headers=student["headers"])
    assert me_res1.status_code == 200
    me1 = me_res1.json()
    assert me1.get("enrolled_courses_count") == 1
    assert me1.get("enrolled_course_ids") == [target_course]


def test_vector_7_orders_auto_enrollment_idempotency():
    """Verify that placing orders auto-enrolls courses, and re-ordering an already enrolled course does NOT crash or duplicate."""
    student = create_test_student()
    course1 = "course-asfar"
    course2 = "course-ishraq"

    # Pre-enroll in course1 via /enroll
    pre_enr = client.post(f"/api/v1/courses/{course1}/enroll", headers=student["headers"])
    assert pre_enr.status_code == 200

    # Now submit checkout order containing BOTH course1 (already enrolled) AND course2 (new)
    order_payload = {
        "items": [
            {
                "item_id": course1,
                "item_type": "course",
                "title": "دوره حکمت متعالیه و اسفار اربعه",
                "price": 0,
                "quantity": 1,
            },
            {
                "item_id": course2,
                "item_type": "course",
                "title": "شرح و تحلیل جامع حکمة‌الاشراق سهروردی",
                "price": 0,
                "quantity": 1,
            }
        ],
        "shipping_address": "مشهد، خیابان طبرسی",
        "postal_code": "9133612345",
        "recipient_name": "پژوهشگر حکمت",
        "recipient_phone": student["phone"],
    }

    order_res = client.post("/api/v1/orders/create", json=order_payload, headers=student["headers"])
    assert order_res.status_code == 200, f"Checkout failed when containing already-enrolled course: {order_res.text}"
    order_data = order_res.json()
    assert "order_id" in order_data and order_data["order_id"].startswith("ORD-")

    # Confirm payment to trigger auto-enrollment
    p_init = client.post("/api/v1/payment/init", headers=student["headers"], json={
        "order_id": order_data["order_id"],
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert p_init.status_code == 200
    p_ver = client.post("/api/v1/payment/verify", headers=student["headers"], json={
        "authority": p_init.json()["payment_token"],
        "status": "OK"
    })
    assert p_ver.status_code == 200

    # In SQLite: verify course1 still has exactly 1 enrollment, and course2 was auto-enrolled with 1 enrollment
    with sqlite3.connect(DB_PATH) as con:
        c1_count = con.execute(
            "SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (student["id"], course1)
        ).fetchone()[0]
        assert c1_count == 1, f"course1 was duplicated during order checkout! Count: {c1_count}"

        c2_count = con.execute(
            "SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (student["id"], course2)
        ).fetchone()[0]
        assert c2_count == 1, f"course2 was not auto-enrolled during order checkout! Count: {c2_count}"

    # Verify student /auth/me now has both courses
    me_res = client.get("/api/v1/auth/me", headers=student["headers"])
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data.get("enrolled_courses_count") == 2
    assert set(me_data.get("enrolled_course_ids")) == {course1, course2}


def test_vector_8_sqlite_foreign_key_and_constraint_enforcement():
    """Verify SQLite database schema: unique constraint on enrollments(user_id, course_id) and zero orphan rows."""
    with sqlite3.connect(DB_PATH) as con:
        # Check 1: Unique constraint enforcement at database layer
        # Attempt direct raw insert of duplicate row
        cur = con.cursor()
        cur.execute("SELECT user_id, course_id FROM enrollments LIMIT 1")
        existing_enr = cur.fetchone()
        assert existing_enr is not None, "Enrollments table is unexpectedly empty"

        user_id, course_id = existing_enr
        raw_duplicate_rejected = False
        try:
            cur.execute(
                "INSERT INTO enrollments (id, user_id, course_id, status, enrolled_at) VALUES (?, ?, ?, ?, ?)",
                (f"raw-dup-{uuid.uuid4().hex[:6]}", user_id, course_id, "active", "2026-10-13T00:00:00")
            )
            con.commit()
        except sqlite3.IntegrityError:
            raw_duplicate_rejected = True

        assert raw_duplicate_rejected, "SQLite UNIQUE constraint (uq_user_course_enrollment) failed to block duplicate raw insert!"

        # Check 2: No orphan enrollments referencing nonexistent courses
        orphan_courses = con.execute(
            "SELECT count(*) FROM enrollments WHERE course_id NOT IN (SELECT id FROM courses)"
        ).fetchone()[0]
        assert orphan_courses == 0, f"Integrity failure: {orphan_courses} orphan enrollments reference non-existent courses!"

        # Check 3: No orphan enrollments referencing nonexistent users
        orphan_users = con.execute(
            "SELECT count(*) FROM enrollments WHERE user_id NOT IN (SELECT id FROM users)"
        ).fetchone()[0]
        assert orphan_users == 0, f"Integrity failure: {orphan_users} orphan enrollments reference non-existent users!"


if __name__ == "__main__":
    print("===================================================================")
    print("CHALLENGER M1-1 ADVERSARIAL STRESS TEST SUITE")
    print("===================================================================")

    checks = [
        ("Vector 1: Sequential Duplicate Enrollment Rejection (HTTP 400 & DB Integrity)", test_vector_1_sequential_duplicate_enrollment),
        ("Vector 2: Concurrent Duplicate Enrollment Race Condition (ThreadPool Stress)", test_vector_2_concurrent_duplicate_enrollment_race),
        ("Vector 3: Unauthenticated & Malformed Authorization Headers (HTTP 401)", test_vector_3_unauthenticated_and_malformed_auth),
        ("Vector 4: Non-existent Course Enrollment (HTTP 404 & Zero DB Pollution)", test_vector_4_nonexistent_course_enrollment),
        ("Vector 5: Malicious Course IDs & SQL Injection Resilience", test_vector_5_adversarial_malicious_course_ids),
        ("Vector 6: Fresh Student Lifecycle, Parity & Scholar Name Verification", test_vector_6_profile_hydration_and_enrolled_parity),
        ("Vector 7: Order Checkout Auto-Enrollment Idempotency & Repeat Purchases", test_vector_7_orders_auto_enrollment_idempotency),
        ("Vector 8: SQLite Database Foreign Key & Unique Constraint Enforcement", test_vector_8_sqlite_foreign_key_and_constraint_enforcement),
    ]

    passed = 0
    failed = 0
    for title, fn in checks:
        try:
            run_check(title, fn)
            passed += 1
        except Exception:
            failed += 1

    print("\n===================================================================")
    print(f"ADVERSARIAL STRESS SUMMARY: {passed} PASSED, {failed} FAILED (TOTAL {len(checks)})")
    print("===================================================================")

    if failed > 0:
        sys.exit(1)
    else:
        print("🏆 ALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY!")
        sys.exit(0)
