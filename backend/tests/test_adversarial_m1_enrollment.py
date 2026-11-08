"""
Adversarial Stress Test Suite for Milestone 1:
Persistent Course Enrollment, Orders Subsystem, SQLite Foreign Keys,
and Concurrency Integrity.
"""
import sys
import os
import sqlite3
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import List

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.database import async_session
from backend.app.models.models import Enrollment, Course, User

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"

def test_1_sqlite_schema_and_unique_constraint():
    print("\n--- [TEST 1] SQLite Schema & Unique Constraint Verification ---")
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        
        # 1. Verify PRAGMA foreign_keys is capable and table definitions exist
        cur.execute("PRAGMA foreign_keys = ON")
        
        # Check enrollments table definition
        enr_sql = cur.execute("SELECT sql FROM sqlite_master WHERE name='enrollments'").fetchone()[0]
        print("Enrollments table SQL:", enr_sql)
        assert "courses" in enr_sql, "Enrollments must reference courses"
        assert "users" in enr_sql, "Enrollments must reference users"

        # Check indexes on enrollments
        indexes = cur.execute("PRAGMA index_list(enrollments)").fetchall()
        print("Enrollments indexes:", indexes)
        unique_index_names = [idx[1] for idx in indexes if idx[2] == 1]
        assert "uq_user_course_enrollment" in unique_index_names, f"Expected unique index uq_user_course_enrollment, found: {unique_index_names}"
        print("✅ Unique constraint index uq_user_course_enrollment is active in SQLite.")

        # 2. Test direct SQLite duplicate insertion raises IntegrityError
        test_uid = "usr-140301"
        test_cid = "course-mabadi-mantiq"
        
        # Ensure 1 row exists
        cur.execute("INSERT OR IGNORE INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                    (f"test-enr-{uuid.uuid4().hex[:6]}", test_uid, test_cid, "active"))
        con.commit()

        # Try duplicate raw insert
        try:
            cur.execute("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                        (f"test-enr-{uuid.uuid4().hex[:6]}", test_uid, test_cid, "active"))
            con.commit()
            raise AssertionError("SQLite failed to enforce UNIQUE constraint on (user_id, course_id)!")
        except sqlite3.IntegrityError as e:
            print(f"✅ SQLite IntegrityError raised on raw duplicate insert: {e}")


def test_2_sqlite_foreign_key_enforcement():
    print("\n--- [TEST 2] SQLite Foreign Key Enforcement ---")
    with sqlite3.connect(DB_PATH) as con:
        con.execute("PRAGMA foreign_keys = ON")
        cur = con.cursor()
        
        # Non-existent course foreign key failure
        fake_course = "course-non-existent-xyz"
        try:
            cur.execute("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                        (f"test-fk-{uuid.uuid4().hex[:6]}", "usr-140301", fake_course, "active"))
            con.commit()
            raise AssertionError("SQLite allowed insertion of enrollment referencing non-existent course with foreign_keys=ON!")
        except sqlite3.IntegrityError as e:
            print(f"✅ SQLite foreign key violation caught as expected for invalid course: {e}")

        # Non-existent user foreign key failure
        fake_user = "usr-non-existent-9999"
        try:
            cur.execute("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                        (f"test-fk-{uuid.uuid4().hex[:6]}", fake_user, "course-mabadi-mantiq", "active"))
            con.commit()
            raise AssertionError("SQLite allowed insertion of enrollment referencing non-existent user with foreign_keys=ON!")
        except sqlite3.IntegrityError as e:
            print(f"✅ SQLite foreign key violation caught as expected for invalid user: {e}")


def test_3_seeded_courses_and_scholar_identity():
    print("\n--- [TEST 3] Seeded Courses and Scholar Identity ---")
    expected_scholar = "حجت الاسلام دکتر زنجیرزن حسینی"
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        courses = cur.execute("SELECT id, title_fa, author_name FROM courses").fetchall()
        print(f"Found {len(courses)} seeded courses in SQLite:")
        for cid, title, author in courses:
            print(f"  - {cid}: {title} | Author: {author}")
            assert author == expected_scholar, f"Course {cid} author '{author}' does not match official scholar identity: {expected_scholar}"
        assert len(courses) >= 4, f"Expected at least 4 courses seeded, found {len(courses)}"

        # Check lessons seeded
        lessons_count = cur.execute("SELECT count(*) FROM lessons").fetchone()[0]
        print(f"Total seeded lessons in SQLite: {lessons_count}")
        assert lessons_count >= 16, f"Expected at least 16 lessons across 4 courses, found {lessons_count}"
    print("✅ All seeded courses and lessons strictly preserve official scholar identity.")


def test_4_concurrent_enrollment_race_condition():
    print("\n--- [TEST 4] Concurrent Duplicate Enrollment Race Condition ---")
    # 1. Create a fresh temporary user for isolated concurrent test
    temp_phone = f"0913{uuid.uuid4().int % 10000000:07d}"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "دانشجوی آزمون همزمانی",
        "phone": temp_phone,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["id"]
    target_course = "course-asfar"

    headers = {"Authorization": f"Bearer {token}"}

    def attempt_enroll(idx: int):
        return client.post(f"/api/v1/courses/{target_course}/enroll", headers=headers)

    # Dispatch 10 concurrent requests to enroll in the same course simultaneously
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(attempt_enroll, range(10)))

    status_codes = [r.status_code for r in results]
    print(f"Concurrent enrollment status codes: {status_codes}")
    success_count = status_codes.count(200)
    duplicate_count = status_codes.count(400)
    
    print(f"Success (200): {success_count}, Rejected (400): {duplicate_count}")
    assert success_count == 1, f"Expected exactly 1 successful enrollment under race condition, got {success_count}"
    assert duplicate_count == 9, f"Expected 9 rejections with HTTP 400, got {duplicate_count}"

    # Verify physical database row count is exactly 1
    with sqlite3.connect(DB_PATH) as con:
        enr_count = con.execute("SELECT count(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
                                (user_id, target_course)).fetchone()[0]
        assert enr_count == 1, f"Database has {enr_count} rows for user {user_id} and course {target_course}, expected exactly 1!"
    print("✅ Concurrency race condition correctly handled: exactly 1 enrollment recorded, zero corruption.")


def test_5_route_collision_and_nonexistent_course():
    print("\n--- [TEST 5] Route Collision & Invalid Course Handling ---")
    # Test GET /api/v1/courses/enrolled is not captured by /{course_id}
    res_enrolled_anon = client.get("/api/v1/courses/enrolled")
    # Anonymous must receive 401 Unauthorized, NOT 404 Not Found or a course object with id="enrolled"
    assert res_enrolled_anon.status_code == 401, f"Expected 401 for anonymous /enrolled, got {res_enrolled_anon.status_code}"
    print("✅ Route collision test: /enrolled correctly resolved to get_enrolled_courses (returned 401 for anonymous).")

    # Test enrolling in non-existent course
    res_login = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_fake_enroll = client.post("/api/v1/courses/non-existent-course-12345/enroll", headers=headers)
    print(f"Enrolling in non-existent course response: {res_fake_enroll.status_code}")
    assert res_fake_enroll.status_code in [400, 404], f"Expected 400 or 404 for non-existent course enrollment, got {res_fake_enroll.status_code}"
    print("✅ Non-existent course enrollment correctly rejected.")


def test_6_orders_with_multiple_courses_and_idempotency():
    print("\n--- [TEST 6] Order Auto-Enrollment & Idempotency ---")
    # Fresh user
    temp_phone = f"0914{uuid.uuid4().int % 10000000:07d}"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "سفارش‌دهنده آزمون",
        "phone": temp_phone,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Order with 2 course items
    order_payload = {
        "items": [
            {"item_id": "course-mabadi-mantiq", "item_type": "course", "title": "مبادی منطق", "price": 0, "quantity": 1},
            {"item_id": "course-ishraq", "item_type": "course", "title": "حکمة الاشراق", "price": 0, "quantity": 1},
        ],
        "shipping_address": "مشهد، خیابان شیرازی",
        "postal_code": "9134567890",
        "recipient_name": "سفارش‌دهنده آزمون",
        "recipient_phone": temp_phone
    }

    order_res = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["items_count"] == 2

    # Confirm payment for first order
    p_init1 = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": order_data["order_id"],
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert p_init1.status_code == 200
    client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": p_init1.json()["payment_token"],
        "status": "OK"
    })

    # Check that both courses were enrolled
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert "course-mabadi-mantiq" in me_data["enrolled_course_ids"]
    assert "course-ishraq" in me_data["enrolled_course_ids"]
    assert me_data["enrolled_courses_count"] == 2

    # Place a SECOND order containing the SAME course: must succeed without crashing or duplicating
    second_order_res = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert second_order_res.status_code == 200
    second_order_data = second_order_res.json()

    # Confirm payment for second order
    p_init2 = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": second_order_data["order_id"],
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert p_init2.status_code == 200
    client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": p_init2.json()["payment_token"],
        "status": "OK"
    })

    # Still exactly 2 enrollments
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        total_enr = cur.execute("SELECT count(*) FROM enrollments WHERE user_id = ?", (user_id,)).fetchone()[0]
        assert total_enr == 2, f"Expected 2 enrollments after re-purchasing, found {total_enr}"
    print("✅ Order auto-enrollment is idempotent: duplicate course in cart does not violate uniqueness or crash checkout.")


def test_7_persian_writing_anti_slop_inspection():
    print("\n--- [TEST 7] Persian Writing Quality & Anti-Slop in Codebase ---")
    banned_words = ["می‌باشد", "می‌باشند", "می‌گردد", "گردید", "لازم به ذکر است", "شایان ذکر است"]
    checked_files = [
        "backend/app/services/course_service.py",
        "backend/app/services/order_service.py",
        "backend/app/services/auth_service.py",
        "backend/app/services/book_service.py",
        "backend/app/services/rag_engine.py",
        "backend/app/services/coupon_service.py",
        "backend/app/models/models.py",
        "backend/app/models/database.py",
    ]
    for fp in checked_files:
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()
            for bw in banned_words:
                assert bw not in content, f"Banned bureaucratic Persian tell '{bw}' found in {fp}!"
    print("✅ Checked all service and model files: zero bureaucratic tells or AI-slop phrases detected.")


if __name__ == "__main__":
    print("==================================================================")
    print("RUNNING ADVERSARIAL STRESS-TEST SUITE FOR PERSISTENT ENROLLMENT M1")
    print("==================================================================")
    test_1_sqlite_schema_and_unique_constraint()
    test_2_sqlite_foreign_key_enforcement()
    test_3_seeded_courses_and_scholar_identity()
    test_4_concurrent_enrollment_race_condition()
    test_5_route_collision_and_nonexistent_course()
    test_6_orders_with_multiple_courses_and_idempotency()
    test_7_persian_writing_anti_slop_inspection()
    print("\n🎉 ALL ADVERSARIAL TESTS PASSED WITHOUT FLAWS!")
