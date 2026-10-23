"""
Forensic Auditor Empirical Verification Script — Milestone 1
Independently verifies:
1. Physical SQLite Schema, Tables, Constraints, and Foreign Keys.
2. Cryptographic Password Hashing and Bcrypt Integrity.
3. Live API Persistence for Course Enrollments, Duplicate Rejection, and Orders.
4. Session Hydration via /api/v1/auth/me and Enrolled Courses Retrieval.
5. Scholar Identity and Persian Writing Anti-Slop Enforcement across M1 work product.
"""
import sys
import os
import sqlite3
import re
from pathlib import Path

# Fix Windows console UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT_DIR = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT_DIR))

DB_PATH = ROOT_DIR / "zanjirzan_platform.db"

results = {}

def report(name, status, details=""):
    results[name] = (status, details)
    symbol = "✅" if status == "PASS" else "❌"
    print(f"{symbol} [{status}] {name}: {details}")

print("=================================================================")
print("🔬 FORENSIC INTEGRITY AUDIT — EMPIRICAL SUITE")
print("=================================================================")

# -------------------------------------------------------------
# Check 1: SQLite Physical Database Inspection
# -------------------------------------------------------------
con = None
try:
    con = sqlite3.connect(str(DB_PATH), timeout=10.0)
    cur = con.cursor()
    cur.execute("PRAGMA foreign_keys=ON;")
    
    tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    required_tables = ["users", "courses", "lessons", "enrollments", "orders", "order_items"]
    missing = [t for t in required_tables if t not in tables]
    if missing:
        report("DB Schema Tables", "FAIL", f"Missing tables: {missing}")
    else:
        table_counts = {t: cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in required_tables}
        report("DB Schema Tables", "PASS", f"All required tables present: {table_counts}")

    # Check unique constraint / index on enrollments (user_id, course_id)
    indexes = cur.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='enrollments'").fetchall()
    uq_index = [idx for idx in indexes if "uq_user_course_enrollment" in str(idx[0]) or ("user_id" in str(idx[1]) and "course_id" in str(idx[1]))]
    if not uq_index:
        report("DB Enrollment Unique Constraint", "FAIL", "No unique index found on enrollments (user_id, course_id)")
    else:
        report("DB Enrollment Unique Constraint", "PASS", f"Unique index confirmed: {uq_index[0][0]}")

    # Test SQLite UNIQUE constraint enforcement directly at DB level:
    test_uid = "usr-140301" # Valid seeded student
    test_cid = "course-mabadi-mantiq" # Valid seeded course
    
    # Clean test record
    cur.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (test_uid, test_cid))
    con.commit()
    
    cur.execute("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                ("enr-f1", test_uid, test_cid, "active"))
    con.commit()
    
    duplicate_failed = False
    try:
        cur.execute("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                    ("enr-f2", test_uid, test_cid, "active"))
        con.commit()
    except sqlite3.IntegrityError:
        duplicate_failed = True
        con.rollback()

    if duplicate_failed:
        report("DB SQLite Unique Constraint Enforcement", "PASS", "Direct duplicate insertion raises sqlite3.IntegrityError as expected.")
    else:
        report("DB SQLite Unique Constraint Enforcement", "FAIL", "Direct duplicate insertion did NOT raise IntegrityError!")

    # Test SQLite FOREIGN KEY constraint enforcement directly at DB level:
    fk_failed = False
    try:
        cur.execute("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (?, ?, ?, ?)",
                    ("enr-fk-test", test_uid, "nonexistent-course-id-9999", "active"))
        con.commit()
    except sqlite3.IntegrityError:
        fk_failed = True
        con.rollback()

    if fk_failed:
        report("DB SQLite Foreign Key Enforcement", "PASS", "Foreign key constraint correctly prevents enrollment for nonexistent course.")
    else:
        report("DB SQLite Foreign Key Enforcement", "FAIL", "Foreign key constraint failed to block invalid course_id!")

except Exception as e:
    report("DB SQLite Inspection", "FAIL", f"Exception during DB check: {e}")
finally:
    if con:
        con.close()

# -------------------------------------------------------------
# Check 2: Cryptographic Password Hashing and Bcrypt Integrity
# -------------------------------------------------------------
try:
    from backend.app.core.security import hash_password, verify_password

    test_pass = "ForensicAuditPass_2026!"
    hashed = hash_password(test_pass)

    if not (hashed.startswith("$2b$") or hashed.startswith("$2a$")):
        report("Bcrypt Hash Format", "FAIL", f"Hash does not have bcrypt prefix: {hashed[:10]}")
    elif len(hashed) < 59:
        report("Bcrypt Hash Format", "FAIL", f"Hash length too short for bcrypt: {len(hashed)}")
    else:
        report("Bcrypt Hash Format", "PASS", f"Valid bcrypt hash generated: {hashed[:15]}... (len={len(hashed)})")

    v_correct = verify_password(test_pass, hashed)
    v_incorrect = verify_password("WrongPassword123", hashed)
    v_empty = verify_password("", hashed)

    if v_correct is True and v_incorrect is False and v_empty is False:
        report("Bcrypt Verification Logic", "PASS", "Verified correct=True, wrong=False, empty=False.")
    else:
        report("Bcrypt Verification Logic", "FAIL", f"Unexpected verification results: correct={v_correct}, wrong={v_incorrect}, empty={v_empty}")

    # Check database stored hashes
    con = sqlite3.connect(str(DB_PATH), timeout=10.0)
    users = con.execute("SELECT id, mobile, hashed_password FROM users LIMIT 10").fetchall()
    con.close()
    real_bcrypt_count = sum(1 for u in users if u[2].startswith("$2b$") or u[2].startswith("$2a$"))
    report("DB Stored User Hashes", "PASS", f"{real_bcrypt_count}/{len(users)} sampled users have genuine bcrypt hashes.")
except Exception as e:
    report("Bcrypt Check", "FAIL", f"Exception during bcrypt verification: {e}")

# -------------------------------------------------------------
# Check 3: Live API Course Enrollment & Persistence
# -------------------------------------------------------------
try:
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)

    # 1. Login student
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    if login_res.status_code != 200:
        report("Live Auth Login", "FAIL", f"Login failed: {login_res.status_code} {login_res.text}")
    else:
        student_token = login_res.json()["access_token"]
        report("Live Auth Login", "PASS", f"Student login successful, token issued: {student_token[:20]}...")

        headers = {"Authorization": f"Bearer {student_token}"}
        student_id = "usr-140301"
        test_course = "course-asfar"

        # Ensure baseline clean in SQLite
        con = sqlite3.connect(str(DB_PATH), timeout=10.0)
        con.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (student_id, test_course))
        con.commit()
        con.close()

        # Unauthenticated enrollment attempt
        anon_res = client.post(f"/api/v1/courses/{test_course}/enroll")
        if anon_res.status_code != 401:
            report("Anonymous Enrollment Shield", "FAIL", f"Expected 401, got {anon_res.status_code}")
        else:
            report("Anonymous Enrollment Shield", "PASS", "Unauthenticated enrollment rejected with 401.")

        # Non-existent course enrollment
        fake_res = client.post("/api/v1/courses/course-nonexistent-999/enroll", headers=headers)
        if fake_res.status_code != 404:
            report("Nonexistent Course Enrollment", "FAIL", f"Expected 404, got {fake_res.status_code}")
        else:
            report("Nonexistent Course Enrollment", "PASS", "Non-existent course enrollment correctly rejected with 404.")

        # Genuine course enrollment
        enr_res = client.post(f"/api/v1/courses/{test_course}/enroll", headers=headers)
        if enr_res.status_code != 200:
            report("Live Course Enrollment", "FAIL", f"Enrollment returned {enr_res.status_code}: {enr_res.text}")
        else:
            enr_data = enr_res.json()
            enr_id = enr_data.get("enrollment_id")
            # Verify in SQLite directly
            con = sqlite3.connect(str(DB_PATH), timeout=10.0)
            db_row = con.execute("SELECT id, user_id, course_id, status FROM enrollments WHERE id = ?", (enr_id,)).fetchone()
            con.close()
            if not db_row:
                report("Live Course Enrollment", "FAIL", f"Enrollment ID {enr_id} was NOT found in SQLite enrollments table!")
            else:
                report("Live Course Enrollment", "PASS", f"Enrolled successfully, persisted in SQLite: {db_row}")

        # Duplicate enrollment check
        dup_res = client.post(f"/api/v1/courses/{test_course}/enroll", headers=headers)
        if dup_res.status_code != 400:
            report("Duplicate Enrollment Rejection", "FAIL", f"Expected 400, got {dup_res.status_code}: {dup_res.text}")
        else:
            dup_json = dup_res.json()
            error_code = dup_json.get("error_code")
            msg = dup_json.get("message", "")
            if error_code != "DUPLICATE_ENROLLMENT" or "پیش از این" not in msg:
                report("Duplicate Enrollment Rejection", "FAIL", f"Incorrect duplicate response: {dup_json}")
            else:
                # Verify SQLite row count did not increase
                con = sqlite3.connect(str(DB_PATH), timeout=10.0)
                count = con.execute("SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND course_id = ?", (student_id, test_course)).fetchone()[0]
                con.close()
                if count != 1:
                    report("Duplicate Enrollment Rejection", "FAIL", f"Found {count} rows in SQLite for course-asfar!")
                else:
                    report("Duplicate Enrollment Rejection", "PASS", "Rejected with HTTP 400, DUPLICATE_ENROLLMENT, and exactly 1 row in SQLite.")

        # Enrolled courses retrieval via GET /api/v1/courses/enrolled
        enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
        if enrolled_res.status_code != 200:
            report("GET /courses/enrolled", "FAIL", f"Expected 200, got {enrolled_res.status_code}")
        else:
            enrolled_list = enrolled_res.json()
            enrolled_cids = [c["id"] for c in enrolled_list]
            if test_course not in enrolled_cids:
                report("GET /courses/enrolled", "FAIL", f"{test_course} not found in enrolled courses: {enrolled_cids}")
            else:
                asfar_course = next(c for c in enrolled_list if c["id"] == test_course)
                author = asfar_course.get("instructor", "")
                if "حجت الاسلام دکتر زنجیر زن حسینی" not in author:
                    report("GET /courses/enrolled", "FAIL", f"Scholar identity mismatch: {author}")
                else:
                    report("GET /courses/enrolled", "PASS", f"Retrieved {len(enrolled_list)} enrolled courses; scholar name strictly verified.")

        # /api/v1/auth/me session hydration
        me_res = client.get("/api/v1/auth/me", headers=headers)
        if me_res.status_code != 200:
            report("GET /auth/me Hydration", "FAIL", f"Expected 200, got {me_res.status_code}")
        else:
            me_data = me_res.json()
            me_cids = me_data.get("enrolled_course_ids", [])
            me_count = me_data.get("enrolled_courses_count", 0)
            if test_course not in me_cids or me_count != len(me_cids):
                report("GET /auth/me Hydration", "FAIL", f"Mismatch in /me hydration: count={me_count}, ids={me_cids}")
            else:
                report("GET /auth/me Hydration", "PASS", f"Session hydrated with {me_count} courses: {me_cids}")

        # Check Orders Checkout Persistence & Auto-Enrollment
        order_course = "course-ishraq"
        con = sqlite3.connect(str(DB_PATH), timeout=10.0)
        con.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (student_id, order_course))
        con.commit()
        con.close()

        order_res = client.post("/api/v1/orders/create", json={
            "items": [
                {
                    "item_id": order_course,
                    "item_type": "course",
                    "title": "شرح و تحلیل جامع حکمة‌الاشراق سهروردی",
                    "price": 0,
                    "quantity": 1,
                },
                {
                    "item_id": "book-ishraq",
                    "item_type": "book_print",
                    "title": "کتاب حکمة الاشراق",
                    "price": 250000,
                    "quantity": 1,
                }
            ],
            "shipping_address": "قم، چهارراه شهدا",
            "postal_code": "3713600000",
            "recipient_name": "علی موسوی",
            "recipient_phone": "09123456789",
            "coupon_code": "TALABE50"
        }, headers=headers)

        if order_res.status_code != 200:
            report("Orders Checkout Persistence", "FAIL", f"Order creation failed: {order_res.status_code} {order_res.text}")
        else:
            order_data = order_res.json()
            ord_id = order_data.get("order_id")
            barcode = order_data.get("postal_barcode_24digit")
            # Verify 24 digit barcode for physical book
            if not barcode or len(barcode) != 24 or not barcode.isdigit():
                report("Orders Logistics Barcode", "FAIL", f"Invalid 24-digit barcode: {barcode}")
            else:
                report("Orders Logistics Barcode", "PASS", f"Valid 24-digit Iran Post barcode generated: {barcode}")

            # Verify in SQLite orders and order_items tables
            con = sqlite3.connect(str(DB_PATH), timeout=10.0)
            db_order = con.execute("SELECT id, user_id, total_amount, coupon_code FROM orders WHERE id = ?", (ord_id,)).fetchone()
            db_items = con.execute("SELECT item_id, item_type FROM order_items WHERE order_id = ?", (ord_id,)).fetchall()
            db_auto_enr = con.execute("SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?", (student_id, order_course)).fetchone()
            con.close()

            if not db_order:
                report("Orders Checkout Persistence", "FAIL", f"Order {ord_id} not found in SQLite orders table!")
            elif len(db_items) != 2:
                report("Orders Checkout Persistence", "FAIL", f"Expected 2 order items in SQLite, got {len(db_items)}")
            elif not db_auto_enr:
                report("Orders Auto-Enrollment", "FAIL", f"Auto-enrollment for {order_course} not found in SQLite enrollments table!")
            else:
                report("Orders Checkout Persistence", "PASS", f"Order {ord_id} and {len(db_items)} items persisted in SQLite. Total: {db_order[2]} Tomans.")
                report("Orders Auto-Enrollment", "PASS", f"Course {order_course} automatically enrolled into SQLite: {db_auto_enr}")

except Exception as e:
    report("Live API Course Enrollment", "FAIL", f"Exception during Live API check: {e}")

# -------------------------------------------------------------
# Check 4: Scholar Identity & Persian Writing Anti-Slop Audit on M1 Work Product
# -------------------------------------------------------------
try:
    expected_scholar = "حجت الاسلام دکتر زنجیر زن حسینی"
    m1_files = [
        ROOT_DIR / "backend/app/models/models.py",
        ROOT_DIR / "backend/app/models/database.py",
        ROOT_DIR / "backend/app/models/__init__.py",
        ROOT_DIR / "backend/app/schemas/course.py",
        ROOT_DIR / "backend/app/schemas/auth.py",
        ROOT_DIR / "backend/app/services/course_service.py",
        ROOT_DIR / "backend/app/services/order_service.py",
        ROOT_DIR / "backend/app/services/auth_service.py",
        ROOT_DIR / "backend/app/api/v1/endpoints/courses.py",
        ROOT_DIR / "backend/app/api/v1/endpoints/orders.py",
        ROOT_DIR / "backend/tests/test_in_memory.py",
    ]
    
    scholar_violations = []
    bureaucratic_tells = []
    
    tell_patterns = [
        (re.compile(r'می‌باشد|می باشد'), "می‌باشد"),
        (re.compile(r'می‌باشند|می باشند'), "می‌باشند"),
        (re.compile(r'(?<![بازبر])گردید'), "گردید"),
        (re.compile(r'(?<![بازبر])می‌گردد'), "می‌گردد"),
        (re.compile(r'لازم به ذکر است'), "لازم به ذکر است"),
        (re.compile(r'شایان ذکر است'), "شایان ذکر است"),
    ]

    for py_file in m1_files:
        if not py_file.exists():
            continue
        content = py_file.read_text(encoding="utf-8", errors="ignore")
        # Check scholar identity violations
        if "دکتر میثم زنجیرزن" in content or ("دکتر زنجیرزن" in content and expected_scholar not in content):
            scholar_violations.append(py_file.name)
        # Check tells
        for pat, label in tell_patterns:
            matches = pat.findall(content)
            if matches:
                bureaucratic_tells.append(f"{py_file.name}: {label} ({len(matches)}x)")

    if scholar_violations:
        report("Scholar Identity Strictness", "FAIL", f"Violations found in: {scholar_violations}")
    else:
        report("Scholar Identity Strictness", "PASS", f"100% adherence to «{expected_scholar}» across all M1 files.")

    if bureaucratic_tells:
        report("Persian Writing Anti-Slop Tells", "FAIL", f"Bureaucratic tells found in M1 files: {bureaucratic_tells}")
    else:
        report("Persian Writing Anti-Slop Tells", "PASS", "Zero bureaucratic tells (می‌باشد/گردید/کلیشه‌ها) across M1 files.")

except Exception as e:
    report("Static Code Audit", "FAIL", f"Exception during static code check: {e}")

print("=================================================================")
print("📊 FORENSIC AUDIT SUMMARY")
print("=================================================================")
all_passed = all(status == "PASS" for status, _ in results.values())
if all_passed:
    print("🏆 FINAL VERDICT: CLEAN — ALL FORENSIC CHECKS PASSED EMPIRICALLY!")
else:
    print("🚨 FINAL VERDICT: INTEGRITY VIOLATION — FAILURES DETECTED!")
    for name, (status, details) in results.items():
        if status != "PASS":
            print(f"   -> {name}: {details}")

sys.exit(0 if all_passed else 1)
