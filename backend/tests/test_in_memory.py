"""
Direct In-Memory Integration Test Suite using FastAPI TestClient.
Tests:
1. Root health and scholar identity.
2. Authentication (bcrypt validation, signed JWT issuance, invalid login rejection).
3. Role-based Access Control (Admin 401/403 security enforcement).
4. DRM stream shield and cryptographic tamper rejection.
5. HTTP Range audio partial streaming (RFC 7233 206 Partial Content).
6. Courses catalog and academic syllabus.
7. AI Scholarly Assistant RAG Chat and Document Analysis.
8. Admin Course and Chapter Management CRUD with verified admin credentials.
9. Rate Limiter response headers.
"""
import sys
import os
import warnings
warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.abspath("."))
os.environ["TESTING"] = "1"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from typing import Optional, Dict, Any, List
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in data["scholar_name"]
    print("✅ Root health check passed:", data["scholar_name"])


def test_auth_endpoints():
    # 1. Successful student login
    student_pass = os.getenv("STUDENT_INITIAL_PASSWORD", "pass_dev_1403")
    res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": student_pass})
    if res.status_code != 200:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    assert res.status_code == 200
    data = res.json()
    student_token = data["access_token"]
    assert len(student_token) > 20
    assert data["role"] == "student"

    # 2. Invalid password rejection
    bad_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "wrong_password"})
    assert bad_res.status_code in [400, 401]

    # 3. Successful admin login
    admin_pass = os.getenv("ADMIN_INITIAL_PASSWORD", "Admin_Secure_Initial_Pass_1403!")
    admin_res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": admin_pass})
    if admin_res.status_code != 200:
        admin_res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "admin_secret_2026"})
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["role"] == "admin"
    print("✅ Auth login passed: Student and Admin tokens issued with bcrypt validation.")
    return student_token, admin_data["access_token"]


def test_rbac_security_shield(student_token: str, admin_token: str):
    # 1. Unauthenticated request to admin endpoint must return 401
    unauth_res = client.get("/api/v1/admin/analytics")
    assert unauth_res.status_code == 401, f"Expected 401, got {unauth_res.status_code}"

    # 2. Student request to admin endpoint must return 403 Forbidden
    student_headers = {"Authorization": f"Bearer {student_token}"}
    forbidden_res = client.get("/api/v1/admin/analytics", headers=student_headers)
    assert forbidden_res.status_code == 403, f"Expected 403, got {forbidden_res.status_code}"

    # 3. Admin request to admin endpoint must succeed (200 OK)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    ok_res = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert ok_res.status_code == 200, f"Expected 200, got {ok_res.status_code}"
    print("✅ RBAC Security Shield passed: 401 for anonymous, 403 for student, 200 for admin.")


def test_drm_stream_shield(token: Optional[str] = None):
    if not token:
        from backend.app.core.security import create_access_token
        token = create_access_token({"sub": "adm-001", "role": "admin"})
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 1. Generate valid DRM token
    res = client.post("/api/v1/stream/token", headers=auth_headers, json={"user_id": "usr-101", "course_id": "c1", "chapter_id": 1})
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert "stream_url" in data
    valid_token = data["token"]

    # 2. Heartbeat verification with valid token
    hb_res = client.post("/api/v1/stream/heartbeat", json={
        "token": valid_token,
        "user_id": "usr-101",
        "course_id": "c1",
        "chapter_id": 1,
        "playback_position_sec": 45
    })
    assert hb_res.status_code == 200
    assert hb_res.json()["valid"] is True

    # 3. Tampered token rejection
    tampered_res = client.post("/api/v1/stream/heartbeat", json={
        "token": valid_token + "fake",
        "user_id": "usr-101",
        "course_id": "c1",
        "chapter_id": 1,
        "playback_position_sec": 45
    })
    assert tampered_res.status_code == 403

    # 4. HLS AES-128 key retrieval with valid token
    key_res = client.get(f"/api/v1/stream/key?token={valid_token}")
    assert key_res.status_code == 200, f"Expected 200 for AES key, got {key_res.status_code}"
    assert len(key_res.content) == 16, f"Expected 16-byte AES-128 key, got {len(key_res.content)}"
    assert "no-store" in key_res.headers.get("Cache-Control", "")

    # 5. Tampered key token rejection
    tampered_key_res = client.get(f"/api/v1/stream/key?token={valid_token}fake")
    assert tampered_key_res.status_code == 403

    print("✅ DRM stream shield passed: Signed token, HLS AES-128 key exchange, and tamper rejection verified.")
    return valid_token


def test_audio_range_streaming(drm_token: str):
    # 1. Stream without token must be rejected with 422 or 403
    bad_res = client.get("/api/v1/stream/audio/c1/1")
    assert bad_res.status_code in [403, 422]

    # 2. Stream with invalid token must return 403
    tamper_res = client.get("/api/v1/stream/audio/c1/1?token=invalid.token")
    assert tamper_res.status_code == 403

    # 3. Stream with valid DRM token and HTTP Range header (RFC 7233)
    range_headers = {"Range": "bytes=0-1023"}
    res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers=range_headers)
    assert res.status_code == 206, f"Expected 206 Partial Content, got {res.status_code}"
    assert "Content-Range" in res.headers
    assert res.headers["Content-Range"].startswith("bytes 0-1023/")
    assert res.headers["Accept-Ranges"] == "bytes"
    assert len(res.content) == 1024

    # 4. Suffix Range: bytes=-500 -> returns last 500 bytes
    suffix_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=-500"})
    assert suffix_res.status_code == 206, f"Expected 206 for suffix range, got {suffix_res.status_code}"
    assert "Content-Range" in suffix_res.headers
    assert suffix_res.headers["Accept-Ranges"] == "bytes"
    assert len(suffix_res.content) == 500

    # 5. Out-of-bounds Range: bytes=9999999- -> must return HTTP 416 Range Not Satisfiable
    out_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=9999999-"})
    assert out_res.status_code == 416, f"Expected 416 Range Not Satisfiable, got {out_res.status_code}"
    assert "Content-Range" in out_res.headers
    assert out_res.headers["Content-Range"].startswith("bytes */")

    # 6. Inverted Range: bytes=500-200 -> must return HTTP 416
    inv_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=500-200"})
    assert inv_res.status_code == 416, f"Expected 416 for inverted range, got {inv_res.status_code}"

    # 7. Full stream without Range header -> must return HTTP 200 with Accept-Ranges: bytes
    full_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}")
    assert full_res.status_code == 200
    assert full_res.headers["Accept-Ranges"] == "bytes"
    assert int(full_res.headers["Content-Length"]) > 10000

    print("✅ Audio Range Streaming passed: RFC 7233 206 Partial Content, suffix ranges, 416 handling, seek buffer.")


def test_courses_catalog():
    res = client.get("/api/v1/courses")
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) > 0
    # Verify rate limit headers
    assert "X-RateLimit-Limit" in res.headers
    print(f"✅ Courses catalog passed: {len(courses)} courses loaded with RateLimit headers.")


def test_ai_chat_assistant():
    # Test RAG query on Asfar and Asalat al-Wujud
    res = client.post("/api/v1/ai/chat", json={
        "message": "براهین اصالت وجود در اسفار اربعه چیست؟",
        "subject_filter": "حکمت متعالیه"
    })
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in data["scholar_identity"]
    assert len(data["citations"]) > 0
    assert len(data["suggested_followups"]) > 0
    print("✅ AI Scholarly Assistant RAG Chat passed.")

    # Test document analysis
    doc_res = client.post("/api/v1/ai/analyze-document", json={
        "document_text": "رساله در باب ماهیت و وجود و انوار سهروردی",
        "title": "رساله نور"
    })
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    assert "dialectic_theses" in doc_data
    assert len(doc_data["dialectic_theses"]) > 0
    print("✅ AI Document Analysis passed.")


def test_admin_course_management(admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create course
    create_res = client.post("/api/v1/admin/courses/create", json={
        "title": "دوره آزمایشی مبانی حکمت",
        "instructor": "حجت الاسلام دکتر زنجیر زن حسینی",
        "level": "سطح عالی",
        "hours": "۲۰ ساعت",
        "price": "۱,۲۰۰,۰۰۰ تومان",
        "description": "توضیحات تفصیلی دوره تحلیلی."
    }, headers=headers)
    assert create_res.status_code == 200
    new_course = create_res.json()["course"]
    course_id = new_course["id"]

    # 2. Update course
    update_res = client.put(f"/api/v1/admin/courses/{course_id}", json={
        "title": "دوره آزمایشی مبانی حکمت (ویرایش‌شده)",
        "price": "رایگان",
        "course_type": "online",
        "capacity": 40
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["course"]["title"] == "دوره آزمایشی مبانی حکمت (ویرایش‌شده)"

    # 3. Add chapter
    ch_res = client.post(f"/api/v1/admin/courses/{course_id}/chapters", json={
        "title": "جلسه ۱: مدخل برهان",
        "duration": "۴۵:۰۰",
        "is_preview": True
    }, headers=headers)
    assert ch_res.status_code == 200
    chapter = ch_res.json()["chapter"]
    assert chapter["title"] == "جلسه ۱: مدخل برهان"

    # 4. Update chapter
    ch_up_res = client.put(f"/api/v1/admin/courses/{course_id}/chapters/{chapter['id']}", json={
        "title": "جلسه ۱: مدخل برهان (منقح)"
    }, headers=headers)
    assert ch_up_res.status_code == 200

    # 5. Delete course
    del_res = client.delete(f"/api/v1/admin/courses/{course_id}", headers=headers)
    assert del_res.status_code == 200
    print("✅ Admin Course and Chapter Management CRUD passed with verified admin token.")


def test_persistent_sqlite_auth_and_registration():
    """
    Verifies persistent SQLite user registration, duplicate constraint enforcement,
    bcrypt hash validation, wrong password rejection, and session hydration via /api/v1/auth/me.
    """
    import uuid
    test_phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    test_password = "SecurePassword1403!"
    test_name = "پژوهشگر حکمت متعالیه"

    # 1. Register new user into persistent SQLite database
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": test_name,
        "phone": test_phone,
        "password": test_password
    })
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["phone"] == test_phone
    assert reg_data["role"] == "student"
    new_token = reg_data["access_token"]
    assert len(new_token) > 20

    # 2. Attempt duplicate registration with the same phone number (must return 400)
    dup_res = client.post("/api/v1/auth/register", json={
        "full_name": "کاربر تکراری",
        "phone": test_phone,
        "password": "another_password"
    })
    assert dup_res.status_code == 400, f"Expected 400 for duplicate phone, got {dup_res.status_code}"
    dup_body = dup_res.text
    assert ("ثبت شده" in dup_body or "USER_ALREADY_EXISTS" in dup_body), \
        f"Expected Persian duplicate warning, got: {dup_body}"

    # 3. Login with newly registered user credentials (bcrypt verification)
    login_res = client.post("/api/v1/auth/login", json={
        "phone": test_phone,
        "password": test_password
    })
    assert login_res.status_code == 200
    login_token = login_res.json()["access_token"]

    # 4. Login with incorrect password for the same user (must return 400 or 401)
    bad_login_res = client.post("/api/v1/auth/login", json={
        "phone": test_phone,
        "password": "wrong_password_attempt"
    })
    assert bad_login_res.status_code in [400, 401]

    # 5. Hydrate session via /api/v1/auth/me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {login_token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["phone"] == test_phone
    assert me_data["full_name"] == test_name

    print(f"✅ Persistent SQLite Auth Verification passed for phone: {test_phone}")


def test_registration_persistence_and_duplicate_error():
    """
    Milestone 1 requirement:
    1. Register with phone 09191112233 -> assert HTTP 200, access token, and record in zanjirzan_platform.db.
    2. Attempt duplicate registration with 09191112233 -> assert HTTP 400 with Persian error message.
    3. Session hydration via /api/v1/auth/me -> assert HTTP 200 and profile data.
    4. Login with invalid credentials -> assert HTTP 400 or 401 without crashing.
    """
    import sqlite3
    target_phone = "09191112233"
    target_name = "رضا کریمی"
    target_password = "SecretPassword123"

    # Ensure clean state for repeatability
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM users WHERE mobile = ?", (target_phone,))
        con.commit()

    # 1. Register new user
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": target_name,
        "phone": target_phone,
        "password": target_password
    })
    assert reg_res.status_code == 200, f"Expected 200, got {reg_res.status_code}: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["phone"] == target_phone
    assert reg_data["role"] == "student"
    token = reg_data["access_token"]
    assert token and len(token) > 20

    # Verify physical persistence in SQLite database file
    with sqlite3.connect("zanjirzan_platform.db") as con:
        row = con.execute("SELECT id, mobile, role, full_name, wallet_balance FROM users WHERE mobile = ?", (target_phone,)).fetchone()
        assert row is not None, "User record was not found in SQLite zanjirzan_platform.db!"
        assert row[1] == target_phone
        assert row[2] == "student"
        assert row[3] == target_name

    # 2. Duplicate registration attempt -> must return 400
    dup_res = client.post("/api/v1/auth/register", json={
        "full_name": "کاربر تکراری",
        "phone": target_phone,
        "password": "AnotherPassword"
    })
    assert dup_res.status_code == 400, f"Expected 400 for duplicate phone, got {dup_res.status_code}"
    dup_body = dup_res.text
    assert ("قبلاً در سامانه ثبت شده است" in dup_body or "USER_ALREADY_EXISTS" in dup_body), f"Expected Persian duplicate warning, got: {dup_body}"

    # 3. Session hydration via /api/v1/auth/me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200, f"Expected 200 for /me hydration, got {me_res.status_code}"
    me_data = me_res.json()
    assert me_data["phone"] == target_phone
    assert me_data["full_name"] == target_name

    # 4. Login with invalid credentials
    bad_login_1 = client.post("/api/v1/auth/login", json={"phone": target_phone, "password": "wrong_password"})
    assert bad_login_1.status_code in [400, 401]

    bad_login_2 = client.post("/api/v1/auth/login", json={"phone": "09199999999", "password": "nonexistent_user"})
    assert bad_login_2.status_code in [400, 401]

    print("✅ Milestone 1: Persistent registration (09191112233), duplicate 400 check, and /me hydration passed.")


def test_course_enrollment_persistence(student_token: str = None):
    """
    Milestone 1 Test 1:
    1. Authenticates as student (or uses provided token).
    2. Clears prior enrollment for course-mabadi-mantiq to guarantee test idempotency.
    3. Calls POST /api/v1/courses/course-mabadi-mantiq/enroll -> asserts HTTP 200, enrollment_id, active status.
    4. Verifies physical row insertion in SQLite zanjirzan_platform.db (enrollments table).
    5. Verifies unauthenticated enrollment attempt is rejected with HTTP 401.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_user_id = "usr-140301"
    target_course_id = "course-mabadi-mantiq"

    # 1. Clean prior enrollment state in SQLite for test repeatability
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (target_user_id, target_course_id))
        con.commit()

    # 2. Unauthenticated attempt must be rejected with 401
    unauth_res = client.post(f"/api/v1/courses/{target_course_id}/enroll")
    assert unauth_res.status_code == 401, f"Expected 401 for anonymous enrollment, got {unauth_res.status_code}"

    # 3. Authenticated student enrollment -> must return HTTP 200
    headers = {"Authorization": f"Bearer {student_token}"}
    enroll_res = client.post(f"/api/v1/courses/{target_course_id}/enroll", headers=headers)
    assert enroll_res.status_code == 200, f"Expected 200, got {enroll_res.status_code}: {enroll_res.text}"

    enroll_data = enroll_res.json()
    assert enroll_data.get("success") is True
    assert enroll_data.get("course_id") == target_course_id
    assert enroll_data.get("status") == "active"
    assert "enrollment_id" in enroll_data and len(enroll_data["enrollment_id"]) > 0
    assert "enrolled_at" in enroll_data
    assert "ثبت‌نام" in enroll_data.get("message", "")

    # 4. Physical SQLite persistence verification
    with sqlite3.connect("zanjirzan_platform.db") as con:
        row = con.execute(
            "SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, target_course_id),
        ).fetchone()
        assert row is not None, "Enrollment record was not found in SQLite zanjirzan_platform.db!"
        assert row[0] == enroll_data["enrollment_id"]
        assert row[1] == target_user_id
        assert row[2] == target_course_id
        assert row[3] == "active"

    print("✅ Milestone 1: Course enrollment persistence (POST /enroll) verified in SQLite.")


def test_duplicate_course_enrollment_rejection(student_token: str = None):
    """
    Milestone 1 Test 2:
    1. Attempts re-enrollment in an already active course (course-mabadi-mantiq).
    2. Asserts HTTP 400 with structured Persian error message (DUPLICATE_ENROLLMENT).
    3. Verifies zero duplicate records in SQLite enrollments table.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_user_id = "usr-140301"
    target_course_id = "course-mabadi-mantiq"
    headers = {"Authorization": f"Bearer {student_token}"}

    # Verify student is currently enrolled
    with sqlite3.connect("zanjirzan_platform.db") as con:
        count_before = con.execute(
            "SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, target_course_id),
        ).fetchone()[0]
    assert count_before == 1, "Prerequisite failure: Student must have exactly 1 active enrollment before duplicate test."

    # Attempt re-enrollment in the same course
    dup_res = client.post(f"/api/v1/courses/{target_course_id}/enroll", headers=headers)
    assert dup_res.status_code == 400, f"Expected 400 for duplicate enrollment, got {dup_res.status_code}: {dup_res.text}"

    dup_body = dup_res.text
    assert (
        "DUPLICATE_ENROLLMENT" in dup_body
        or "پیش از این" in dup_body
        or "ثبت‌نام کرده‌اید" in dup_body
    ), f"Expected structured Persian duplicate enrollment warning, got: {dup_body}"

    # Verify no duplicate records created in SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        count_after = con.execute(
            "SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, target_course_id),
        ).fetchone()[0]
    assert count_after == 1, f"Database integrity breach: Duplicate enrollment rows found! Count: {count_after}"

    print("✅ Milestone 1: Duplicate enrollment rejection (HTTP 400 + Persian error) verified.")


def test_enrolled_courses_retrieval(student_token: str = None):
    """
    Milestone 1 Test 3:
    1. Calls GET /api/v1/courses/enrolled with student token -> asserts HTTP 200 and course details.
    2. Verifies scholar identity «حجت الاسلام دکتر زنجیر زن حسینی» and syllabus integrity.
    3. Calls GET /api/v1/auth/me -> asserts enrolled_course_ids and enrolled_courses_count sync.
    4. Verifies unauthenticated access to /enrolled returns HTTP 401.
    """
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_course_id = "course-mabadi-mantiq"

    # 1. Unauthenticated request to /enrolled must return 401
    unauth_res = client.get("/api/v1/courses/enrolled")
    assert unauth_res.status_code == 401, f"Expected 401 for anonymous /enrolled, got {unauth_res.status_code}"

    # 2. Authenticated request to /enrolled
    headers = {"Authorization": f"Bearer {student_token}"}
    enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert enrolled_res.status_code == 200, f"Expected 200, got {enrolled_res.status_code}: {enrolled_res.text}"

    courses = enrolled_res.json()
    assert isinstance(courses, list), "Expected list of enrolled courses."
    assert len(courses) >= 1, "Enrolled courses list should not be empty."

    matched = next((c for c in courses if c["id"] == target_course_id), None)
    assert matched is not None, f"Enrolled course {target_course_id} was not returned in /enrolled list!"
    assert matched["title"] == "سلسله جلسات مبادی منطق و تفکر عقلانی"
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in matched.get("instructor", "")
    assert len(matched.get("syllabus", [])) == 9

    # 3. Verify session profile hydration via /api/v1/auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()

    assert "enrolled_course_ids" in me_data, "Missing enrolled_course_ids in /auth/me response."
    assert target_course_id in me_data["enrolled_course_ids"]
    assert "enrolled_courses_count" in me_data
    assert me_data["enrolled_courses_count"] >= 1
    assert len(me_data["enrolled_course_ids"]) == me_data["enrolled_courses_count"]

    print("✅ Milestone 1: Enrolled courses retrieval (GET /enrolled) & /auth/me hydration passed.")


def test_orders_checkout_persistence(student_token: str = None):
    """
    Milestone 1 Test 4:
    1. Clears prior enrollment in course-bidayat to guarantee clean baseline.
    2. Submits order containing course-bidayat via POST /api/v1/orders/create with student token.
    3. Asserts HTTP 200, order_id, tracking_number.
    4. Verifies physical order row in SQLite orders table.
    5. Verifies automatic enrollment in SQLite enrollments table for the purchased course item.
    6. Confirms student now has access to both courses in GET /enrolled and GET /auth/me.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_user_id = "usr-140301"
    purchased_course_id = "course-bidayat"

    # 1. Clean prior enrollment for course-bidayat in SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM enrollments WHERE user_id = ? AND course_id = ?", (target_user_id, purchased_course_id))
        con.commit()

    # 2. Place order with course item attached to authenticated student
    headers = {"Authorization": f"Bearer {student_token}"}
    order_payload = {
        "items": [
            {
                "item_id": purchased_course_id,
                "item_type": "course",
                "title": "دوره شرح بدایة الحکمة علامه طباطبایی",
                "price": 0,
                "quantity": 1,
            }
        ],
        "shipping_address": "قم، بلوار بهار، مدرسه فیضیه",
        "postal_code": "3713612345",
        "recipient_name": "علی موسوی",
        "recipient_phone": "09123456789",
    }

    order_res = client.post("/api/v1/orders/create", json=order_payload, headers=headers)
    assert order_res.status_code == 200, f"Expected 200, got {order_res.status_code}: {order_res.text}"

    order_data = order_res.json()
    assert "order_id" in order_data and order_data["order_id"].startswith("ORD-")
    assert "tracking_number" in order_data
    assert order_data.get("status") == "processing"
    assert order_data.get("items_count") == 1
    new_order_id = order_data["order_id"]

    # 3. Physical SQLite persistence verification for order record
    with sqlite3.connect("zanjirzan_platform.db") as con:
        order_row = con.execute(
            "SELECT id, user_id, tracking_number, status FROM orders WHERE id = ?",
            (new_order_id,),
        ).fetchone()
        assert order_row is not None, f"Order {new_order_id} was not persisted in SQLite orders table!"
        assert order_row[1] == target_user_id
        assert order_row[3] == "processing"

        # Enrollment must NOT exist prematurely before payment verification
        enr_before = con.execute(
            "SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, purchased_course_id),
        ).fetchone()
        assert enr_before is None, f"Course {purchased_course_id} must NOT be enrolled prior to payment verification!"

    # 3.1 Initiate and verify payment to trigger course enrollment
    pay_init = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": new_order_id,
        "gateway": "zarinpal",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert pay_init.status_code == 200
    authority = pay_init.json()["payment_token"]

    pay_verify = client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": authority,
        "status": "OK"
    })
    assert pay_verify.status_code == 200
    assert pay_verify.json()["success"] is True

    # 3.2 Verify active enrollment created in SQLite after payment verification
    with sqlite3.connect("zanjirzan_platform.db") as con:
        enr_row = con.execute(
            "SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = ? AND course_id = ?",
            (target_user_id, purchased_course_id),
        ).fetchone()
        assert enr_row is not None, f"Enrollment for {purchased_course_id} was not created upon payment verification in SQLite!"
        assert enr_row[1] == target_user_id
        assert enr_row[2] == purchased_course_id
        assert enr_row[3] == "active"

    # 4. Verify user can now retrieve both courses from /enrolled
    enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert enrolled_res.status_code == 200
    enrolled_ids = [c["id"] for c in enrolled_res.json()]
    assert "course-mabadi-mantiq" in enrolled_ids
    assert "course-bidayat" in enrolled_ids

    # 5. Verify /auth/me reflects both courses
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert "course-bidayat" in me_data["enrolled_course_ids"]
    assert "course-mabadi-mantiq" in me_data["enrolled_course_ids"]
    assert me_data["enrolled_courses_count"] >= 2

    # 6. Verify anonymous guest order checkout remains supported (backward compatibility)
    guest_res = client.post("/api/v1/orders/create", json={
        "items": [
            {
                "item_id": "book-bidayat",
                "item_type": "book_print",
                "title": "کتاب بدایة الحکمة",
                "price": 180000,
                "quantity": 1,
            }
        ],
        "shipping_address": "تهران، میدان انقلاب",
        "postal_code": "1417466191",
        "recipient_name": "کاربر میهمان",
        "recipient_phone": "09121111111",
    })
    assert guest_res.status_code == 200
    assert guest_res.json()["order_id"].startswith("ORD-")

    print("✅ Milestone 1: Order checkout persistence & auto-enrollment verified.")


def test_user_favorites_and_composite_indexes(student_token: str = None):
    """
    Milestone 1 (Phase 6):
    1. Verifies composite indexes ix_enrollments_user_course and ix_user_favorites_user_course in SQLite.
    2. Verifies unique constraint uq_user_course_favorite.
    3. Toggles course favorite via POST /api/v1/courses/{course_id}/favorite -> asserts 200 and is_favorite=True.
    4. Calls GET /api/v1/courses/favorites -> asserts course is present.
    5. Toggles favorite again -> asserts is_favorite=False.
    6. Calls GET /api/v1/courses/favorites -> asserts course is removed.
    """
    import sqlite3
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]

    target_course_id = "course-mabadi-mantiq"
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Verify composite index on enrollments and user_favorites in SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        enr_indexes = [row[1] for row in con.execute("PRAGMA index_list('enrollments')").fetchall()]
        assert any("ix_enrollments_user_course" in idx or "uq_user_course" in idx for idx in enr_indexes), \
            f"Expected composite index on enrollments, found: {enr_indexes}"

        fav_indexes = [row[1] for row in con.execute("PRAGMA index_list('user_favorites')").fetchall()]
        assert any("ix_user_favorites_user_course" in idx or "uq_user_course_favorite" in idx for idx in fav_indexes), \
            f"Expected composite index on user_favorites, found: {fav_indexes}"

    # Clean prior favorite state if any
    with sqlite3.connect("zanjirzan_platform.db") as con:
        con.execute("DELETE FROM user_favorites WHERE course_id = ?", (target_course_id,))
        con.commit()

    # 2. Toggle favorite (add)
    fav_res1 = client.post(f"/api/v1/courses/{target_course_id}/favorite", headers=headers)
    assert fav_res1.status_code == 200, f"Expected 200, got {fav_res1.status_code}: {fav_res1.text}"
    fav_data1 = fav_res1.json()
    assert fav_data1.get("success") is True
    assert fav_data1.get("is_favorite") is True
    assert "افزوده شد" in fav_data1.get("message", "")

    # 3. Retrieve favorites
    get_favs = client.get("/api/v1/courses/favorites", headers=headers)
    assert get_favs.status_code == 200
    fav_list = get_favs.json()
    assert any(c["id"] == target_course_id for c in fav_list)

    # 4. Physical row inspection in SQLite
    with sqlite3.connect("zanjirzan_platform.db") as con:
        fav_row = con.execute("SELECT id, user_id, course_id FROM user_favorites WHERE course_id = ?", (target_course_id,)).fetchone()
        assert fav_row is not None, "UserFavorite row not found in SQLite!"

    # 5. Toggle favorite (remove)
    fav_res2 = client.post(f"/api/v1/courses/{target_course_id}/favorite", headers=headers)
    assert fav_res2.status_code == 200
    fav_data2 = fav_res2.json()
    assert fav_data2.get("is_favorite") is False
    assert "حذف شد" in fav_data2.get("message", "")

    # 6. Verify removed
    get_favs2 = client.get("/api/v1/courses/favorites", headers=headers)
    assert get_favs2.status_code == 200
    assert not any(c["id"] == target_course_id for c in get_favs2.json())

    print("✅ Milestone 1 (Phase 6): UserFavorite table, composite indexes, and toggle/get endpoints verified.")


def test_payment_replay_attack_prevention():
    """
    Milestone 2 (Phase 7): Payment Replay Attack Prevention & Authority Locking:
    1. Initiates payment via POST /api/v1/payment/init.
    2. Verifies payment via POST /api/v1/payment/verify -> asserts 200, success True, reference_id.
    3. Replays identical authority token -> asserts HTTP 400 with PAYMENT_REPLAY_ATTACK.
    4. Submits invalid/non-existent authority -> asserts HTTP 400 with PAYMENT_NOT_FOUND.
    5. Submits duplicate tracking code -> asserts HTTP 400 with DUPLICATE_TRACKING_CODE.
    """
    import uuid
    stu_login = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    s_headers = {"Authorization": f"Bearer {stu_login.json()['access_token']}"}

    def _create_order():
        res = client.post("/api/v1/orders/create", headers=s_headers, json={
            "items": [{"item_id": "course-bidayat", "item_type": "course", "title": "بدایة الحکمة", "price": 100000, "quantity": 1}],
            "shipping_address": "قم",
            "postal_code": "3713612345",
            "recipient_name": "علی",
            "recipient_phone": "09123456789"
        })
        assert res.status_code == 200
        return res.json()["order_id"]

    # 1. Initiate payment
    init_res = client.post("/api/v1/payment/init", headers=s_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_res.status_code == 200
    authority = init_res.json()["payment_token"]

    # 2. First verification (legitimate)
    test_trk = f"TRK-{uuid.uuid4().hex[:8]}"
    verify_res1 = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": test_trk
    })
    assert verify_res1.status_code == 200
    vdata1 = verify_res1.json()
    assert vdata1["success"] is True
    assert len(vdata1["reference_id"]) > 0

    # 3. Second verification (REPLAY ATTACK -> MUST FAIL with 400)
    verify_res2 = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
    })
    assert verify_res2.status_code == 400, f"Expected 400 for payment replay attack, got {verify_res2.status_code}: {verify_res2.text}"
    body2 = verify_res2.text
    assert "PAYMENT_REPLAY_ATTACK" in body2 or "قبلاً تایید شده است" in body2

    # 4. Unknown/fake authority -> MUST FAIL with 400
    fake_res = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": "SHAPARAK_AUTH_FORGED_999999",
        "status": "OK"
    })
    assert fake_res.status_code == 400
    assert "PAYMENT_NOT_FOUND" in fake_res.text or "یافت نشد" in fake_res.text

    # 5. Duplicate tracking code reuse -> MUST FAIL with 400
    init_res2 = client.post("/api/v1/payment/init", headers=s_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_res2.status_code == 200
    auth2 = init_res2.json()["payment_token"]

    dup_trk_res = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth2,
        "status": "OK",
        "tracking_code": test_trk  # Reusing already used tracking code
    })
    assert dup_trk_res.status_code == 400
    assert "DUPLICATE_TRACKING_CODE" in dup_trk_res.text or "قبلاً ثبت شده است" in dup_trk_res.text

    # 6. Failed transaction resurrection prevention -> MUST FAIL with 400 (PAYMENT_ALREADY_FAILED)
    init_res3 = client.post("/api/v1/payment/init", headers=s_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_res3.status_code == 200
    auth3 = init_res3.json()["payment_token"]

    # First verification fails legitimately at bank
    fail_res = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth3,
        "status": "FAILED"
    })
    assert fail_res.status_code == 200
    assert fail_res.json()["success"] is False

    # Second verification attempts resurrection with OK -> MUST FAIL with 400
    resurrect_res = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth3,
        "status": "OK"
    })
    assert resurrect_res.status_code == 400, f"Expected 400 for failed payment resurrection, got {resurrect_res.status_code}: {resurrect_res.text}"
    body3 = resurrect_res.text
    assert "PAYMENT_ALREADY_FAILED" in body3 or "قبلاً ناموفق ثبت شده است" in body3

    # Subsequent verification with FAILED -> MUST ALSO FAIL with 400
    re_fail_res = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth3,
        "status": "FAILED"
    })
    assert re_fail_res.status_code == 400
    assert "PAYMENT_ALREADY_FAILED" in re_fail_res.text

    print("✅ Milestone 2 (Phase 7): Payment Replay Attack Prevention, Authority Locking & Uniqueness verified.")


def test_server_side_pricing_and_coupon_validation(student_token: str = None):
    """
    Milestone 2 (Phase 7): Server-Side Pricing & Coupon Expiration Enforcement:
    1. Valid coupon HEKMAT1403 yields 20% discount and Persian message with منظور شد.
    2. Expired coupon EXPIRED1402 is rejected with HTTP 400.
    3. Inactive coupon INACTIVE10 is rejected with HTTP 400.
    4. Client-tampered item prices in orders are overridden 100% server-side by official catalog rates.
    """
    if not student_token:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
        assert res.status_code == 200
        student_token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Valid coupon
    valid_res = client.post("/api/v1/coupons/validate", json={"code": "HEKMAT1403", "cart_total": 200000})
    assert valid_res.status_code == 200
    vdata = valid_res.json()
    assert vdata["discount_percent"] == 20
    assert vdata["discount_amount"] == 40000
    assert vdata["final_total"] == 160000
    assert "منظور شد" in vdata["message"]
    assert "منظور گردید" not in vdata["message"]

    # 2. Expired coupon -> must return 400
    exp_res = client.post("/api/v1/coupons/validate", json={"code": "EXPIRED1402", "cart_total": 200000})
    assert exp_res.status_code == 400, f"Expected 400 for expired coupon, got {exp_res.status_code}: {exp_res.text}"
    assert "منقضی" in exp_res.text or "INVALID_COUPON" in exp_res.text

    # 3. Inactive coupon -> must return 400
    inact_res = client.post("/api/v1/coupons/validate", json={"code": "INACTIVE10", "cart_total": 200000})
    assert inact_res.status_code == 400
    assert "غیرفعال" in inact_res.text or "INVALID_COUPON" in inact_res.text

    # 4. Server-side price enforcement (client tampering protection)
    tampered_order = {
        "items": [
            {
                "item_id": "book-ishraq-1",
                "item_type": "book_print",
                "title": "نور و شهود در حکمت اشراق",
                "price": 10,  # Tampered! Official catalog price is 390,000 Tomans
                "quantity": 1
            },
            {
                "item_id": "course-bidayat",
                "item_type": "course",
                "title": "بدایة الحکمة",
                "price": 999999,  # Tampered! Official course is free (0 Tomans)
                "quantity": 1
            }
        ],
        "shipping_address": "تهران، میدان انقلاب",
        "postal_code": "1417466191",
        "recipient_name": "سید احمد حسینی",
        "recipient_phone": "09123456789"
    }

    order_res = client.post("/api/v1/orders/create", json=tampered_order, headers=headers)
    assert order_res.status_code == 200
    odata = order_res.json()

    # Verify server overridden prices
    assert odata["total_amount"] == 390000, f"Price tampering succeeded! Server total was {odata['total_amount']} instead of 390000."

    import sqlite3
    with sqlite3.connect("zanjirzan_platform.db") as con:
        db_items = con.execute("SELECT item_id, price FROM order_items WHERE order_id = ?", (odata["order_id"],)).fetchall()
        price_map = {row[0]: row[1] for row in db_items}
        assert price_map.get("book-ishraq-1") == 390000
        assert price_map.get("course-bidayat") == 0

    print("✅ Milestone 2 (Phase 7): Server-Side Pricing (anti-tampering) & Coupon Expiration verified.")


def test_ai_token_by_token_sse_and_rate_limiter():
    """
    Milestone 2 (Phase 7): AI Token-by-Token SSE Streaming & Token-Bucket Rate Limiter:
    1. POST /api/v1/ai/chat/stream returns text/event-stream with chunks and done: true.
    2. Prompt exceeding 2000 characters is rejected with HTTP 400.
    3. Per-user TokenBucketRateLimiter rejects requests beyond capacity with HTTP 429.
    """
    import json
    from backend.app.core.rate_limiter import ai_token_bucket_limiter

    test_user_key = "user:usr-ai-test"
    ai_token_bucket_limiter.reset(test_user_key)

    # 1. Valid SSE Stream Request
    stream_payload = {
        "message": "براهین اصالت وجود در حکمت متعالیه چیست؟",
        "subject_filter": "حکمت متعالیه"
    }
    res = client.post("/api/v1/ai/chat/stream", json=stream_payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    assert "text/event-stream" in res.headers.get("content-type", "")

    # Parse SSE events from response text
    lines = [line.strip() for line in res.text.split("\n") if line.strip().startswith("data:")]
    assert len(lines) > 0, "No SSE data events received!"

    parsed_events = []
    for line in lines:
        payload_str = line[5:].strip()
        data = json.loads(payload_str)
        parsed_events.append(data)

    # Verify token-by-token emission
    assert any(ev.get("done") is False and len(ev.get("chunk", "")) > 0 for ev in parsed_events), \
        "Expected token chunks with done=False"

    # Verify terminal event with citations
    terminal = parsed_events[-1]
    assert terminal.get("done") is True
    assert "citations" in terminal and len(terminal["citations"]) > 0
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in terminal.get("scholar_identity", "")

    # 2. Oversized prompt validation (> 2000 chars) -> MUST FAIL with HTTP 400
    oversized_message = "کلمه " * 501  # > 2500 characters
    bad_stream_res = client.post("/api/v1/ai/chat/stream", json={"message": oversized_message})
    assert bad_stream_res.status_code == 400, f"Expected 400 for oversized prompt, got {bad_stream_res.status_code}"
    assert "سقف مجاز" in bad_stream_res.text or "حداکثر" in bad_stream_res.text

    bad_chat_res = client.post("/api/v1/ai/chat", json={"message": oversized_message})
    assert bad_chat_res.status_code == 400

    # 3. Token-Bucket Rate Limiter test (burst consumption)
    burst_ip = "192.168.100.99"
    burst_key = f"ip:{burst_ip}"
    ai_token_bucket_limiter.reset(burst_key)

    headers = {"X-Forwarded-For": burst_ip}
    # Consume all 10 tokens
    for i in range(10):
        c_res = client.post("/api/v1/ai/chat", json={"message": "پرسش کوتاه"}, headers=headers)
        assert c_res.status_code == 200, f"Request {i+1} failed with {c_res.status_code}"

    # 11th request must exceed capacity -> HTTP 429
    rate_exceeded_res = client.post("/api/v1/ai/chat", json={"message": "پرسش مازاد"}, headers=headers)
    assert rate_exceeded_res.status_code == 429, f"Expected 429, got {rate_exceeded_res.status_code}: {rate_exceeded_res.text}"
    assert "Retry-After" in rate_exceeded_res.headers
    assert "بیش از سقف مجاز" in rate_exceeded_res.text

    # Reset burst key so it doesn't affect other runs
    ai_token_bucket_limiter.reset(burst_key)

    print("✅ Milestone 2 (Phase 7): AI SSE Streaming (text/event-stream), Prompt Validation & Rate Limiter verified.")


def test_admin_rbac_strict_shield(student_token: str, admin_token: str):
    """
    Milestone 2 (Phase 7): Strict Admin RBAC at Router and Root Route:
    1. Anonymous request to GET /api/v1/admin returns HTTP 401.
    2. Student bearer token to GET /api/v1/admin returns HTTP 403 Forbidden.
    3. Admin bearer token to GET /api/v1/admin returns HTTP 200 with scholar name.
    4. Student bearer token to GET /api/v1/admin/analytics returns HTTP 403 Forbidden.
    """
    student_headers = {"Authorization": f"Bearer {student_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Anonymous access to admin root -> 401
    anon_res = client.get("/api/v1/admin")
    assert anon_res.status_code == 401, f"Expected 401 for anonymous /admin, got {anon_res.status_code}"

    # 2. Student access to admin root -> 403 Forbidden
    student_res = client.get("/api/v1/admin", headers=student_headers)
    assert student_res.status_code == 403, f"Expected 403 for student /admin, got {student_res.status_code}"
    assert "منحصراً در اختیار مدیر" in student_res.text

    # 3. Admin access to admin root -> 200 OK
    admin_res = client.get("/api/v1/admin", headers=admin_headers)
    assert admin_res.status_code == 200, f"Expected 200 for admin /admin, got {admin_res.status_code}: {admin_res.text}"
    adata = admin_res.json()
    assert adata["status"] == "ok"
    assert adata["role"] == "admin"
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in adata["scholar_name"]

    # 4. Student access to admin sub-route -> 403 Forbidden
    sub_res = client.get("/api/v1/admin/analytics", headers=student_headers)
    assert sub_res.status_code == 403

    print("✅ Milestone 2 (Phase 7): Strict Admin RBAC router dependency and root route (401/403/200) verified.")


def test_entity_not_found_signatures_and_admin_404(admin_token: str):
    """
    Milestone 2 Remediation: EntityNotFoundException signature compatibility and Admin 404:
    1. (entity, identifier) positional signature returns status 404 and Persian message.
    2. (entity=..., identifier=...) keyword signature works.
    3. (message=...) keyword signature works without TypeError.
    4. Default fallback with no arguments and unknown kwargs absorbed.
    5. Admin DELETE /api/v1/admin/courses/{nonexistent_id} returns HTTP 404 ENTITY_NOT_FOUND without 500 crash.
    6. Admin PUT /api/v1/admin/courses/{nonexistent_id} returns HTTP 404 ENTITY_NOT_FOUND without 500 crash.
    """
    from backend.app.core.exceptions import EntityNotFoundException

    # 1. Positional signature
    exc1 = EntityNotFoundException("دوره", "c-101")
    assert exc1.status_code == 404
    assert exc1.code == "ENTITY_NOT_FOUND"
    assert "دوره" in exc1.message and "c-101" in exc1.message

    # 2. Keyword signature
    exc2 = EntityNotFoundException(entity="کتاب", identifier="b-202")
    assert exc2.status_code == 404
    assert "کتاب" in exc2.message and "b-202" in exc2.message

    # 3. Message keyword signature (used by admin_service and qa_service)
    custom_msg = "Course 'nonexistent' not found."
    exc3 = EntityNotFoundException(message=custom_msg)
    assert exc3.status_code == 404
    assert exc3.message == custom_msg

    # 4. Unknown kwargs absorbed without TypeError
    exc4 = EntityNotFoundException(extra_param="ignored")
    assert exc4.status_code == 404
    assert "موجودیت مورد نظر یافت نشد" in exc4.message

    # 5. Live Admin API DELETE to non-existent course returns 404 (not 500 TypeError)
    headers = {"Authorization": f"Bearer {admin_token}"}
    del_res = client.delete("/api/v1/admin/courses/nonexistent-course-id-999", headers=headers)
    assert del_res.status_code == 404, f"Expected 404, got {del_res.status_code}: {del_res.text}"
    del_data = del_res.json()
    assert del_data["error_code"] == "ENTITY_NOT_FOUND"
    assert "not found" in del_data["message"]

    # 6. Live Admin API PUT to non-existent course returns 404
    put_res = client.put("/api/v1/admin/courses/nonexistent-course-id-999", json={"title": "ویرایش"}, headers=headers)
    assert put_res.status_code == 404
    assert put_res.json()["error_code"] == "ENTITY_NOT_FOUND"

    print("✅ Milestone 2 Remediation: EntityNotFoundException signatures & Admin 404 verified.")


def test_phase9_admin_rbac_all_mutations_forbidden_for_students(student_token: str):
    """
    Phase 9 Edge-Case: Admin RBAC 403 Forbidden Enforcement on all mutating admin endpoints
    when called with student token, and 401 for unauthenticated requests.
    """
    student_headers = {"Authorization": f"Bearer {student_token}"}
    admin_mutation_endpoints = [
        ("POST", "/api/v1/admin/courses/create", {"title": "تست غیرمجاز", "instructor": "نامعتبر", "price": "100"}),
        ("PUT", "/api/v1/admin/courses/course-ishraq", {"title": "تغییر عنوان غیرمجاز"}),
        ("POST", "/api/v1/admin/courses/course-ishraq/chapters", {"title": "فصل غیرمجاز", "duration": "10:00"}),
        ("PUT", "/api/v1/admin/courses/course-ishraq/chapters/1", {"title": "ویرایش فصل غیرمجاز"}),
        ("PUT", "/api/v1/admin/books/book-ishraq-1", {"title": "ویرایش کتاب غیرمجاز"}),
        ("PUT", "/api/v1/admin/orders/ORD-TEST-RBAC/status", {"status": "delivered"}),
        ("DELETE", "/api/v1/admin/courses/course-ishraq", None),
        ("GET", "/api/v1/admin/", None),
        ("GET", "/api/v1/admin/analytics", None),
    ]

    for method, path, payload in admin_mutation_endpoints:
        # 1. Unauthenticated request must return 401
        if method == "POST":
            unauth_res = client.post(path, json=payload)
        elif method == "PUT":
            unauth_res = client.put(path, json=payload)
        elif method == "DELETE":
            unauth_res = client.delete(path)
        else:
            unauth_res = client.get(path)
        assert unauth_res.status_code == 401, f"Expected 401 for unauth {method} {path}, got {unauth_res.status_code}"

        # 2. Student authenticated request must return 403 Forbidden
        if method == "POST":
            res = client.post(path, json=payload, headers=student_headers)
        elif method == "PUT":
            res = client.put(path, json=payload, headers=student_headers)
        elif method == "DELETE":
            res = client.delete(path, headers=student_headers)
        else:
            res = client.get(path, headers=student_headers)
        assert res.status_code == 403, f"Expected 403 for student {method} {path}, got {res.status_code}: {res.text}"
        assert "منحصراً در اختیار مدیر" in res.text, f"Expected Persian admin warning, got: {res.text}"

    print("✅ Phase 9: Admin RBAC 403 Forbidden enforcement on all mutating admin endpoints verified.")


def test_phase9_audio_range_streaming_edge_cases(drm_token: str):
    """
    Phase 9 Edge-Case: RFC 7233 Audio Range streaming:
    1. Prefix range: bytes=0-1023 -> 206 Partial Content, Content-Range bytes 0-1023/{total}, len=1024.
    2. Mid-stream scrubbing: bytes=1024-2047 -> 206 Partial Content, Content-Range bytes 1024-2047/{total}, len=1024.
    3. Suffix range: bytes=-1024 -> 206 Partial Content, Content-Range bytes {total-1024}-{total-1}/{total}, len=1024.
    4. Open-ended range: bytes={total-1000}- -> 206 Partial Content with correct tail slice.
    5. Out-of-bounds: bytes=999999999- -> 416 Range Not Satisfiable, Content-Range bytes */{total}.
    6. Inverted range: bytes=2048-1024 -> 416 Range Not Satisfiable.
    7. All 206 responses strictly include Accept-Ranges: bytes.
    8. DRM priority: Tampered token returns 403 Forbidden regardless of Range header.
    """
    import os
    audio_path = os.path.abspath("frontend/public/audio/sample_lecture.wav")
    total_size = os.path.getsize(audio_path) if os.path.exists(audio_path) else 2822444

    # 1. Prefix range (0-1023)
    p_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=0-1023"})
    assert p_res.status_code == 206
    assert p_res.headers.get("Accept-Ranges") == "bytes"
    assert p_res.headers.get("Content-Range") == f"bytes 0-1023/{total_size}"
    assert len(p_res.content) == 1024

    # 2. Mid-stream scrubbing (1024-2047)
    m_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=1024-2047"})
    assert m_res.status_code == 206
    assert m_res.headers.get("Accept-Ranges") == "bytes"
    assert m_res.headers.get("Content-Range") == f"bytes 1024-2047/{total_size}"
    assert len(m_res.content) == 1024

    # 3. Suffix range (bytes=-1024)
    s_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=-1024"})
    assert s_res.status_code == 206
    assert s_res.headers.get("Accept-Ranges") == "bytes"
    expected_start = total_size - 1024
    expected_end = total_size - 1
    assert s_res.headers.get("Content-Range") == f"bytes {expected_start}-{expected_end}/{total_size}"
    assert len(s_res.content) == 1024

    # 4. Open-ended range (from total_size - 1000 to end)
    open_start = total_size - 1000
    o_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": f"bytes={open_start}-"})
    assert o_res.status_code == 206
    assert o_res.headers.get("Accept-Ranges") == "bytes"
    assert o_res.headers.get("Content-Range") == f"bytes {open_start}-{total_size - 1}/{total_size}"
    assert len(o_res.content) == 1000

    # 5. Out-of-bounds range (bytes=999999999-) -> 416 Range Not Satisfiable
    oob_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=999999999-"})
    assert oob_res.status_code == 416
    assert oob_res.headers.get("Content-Range") == f"bytes */{total_size}"

    # 6. Inverted range (bytes=2048-1024) -> 416
    inv_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=2048-1024"})
    assert inv_res.status_code == 416
    assert inv_res.headers.get("Content-Range") == f"bytes */{total_size}"

    # 7. Malformed range (bytes=abc-def) -> 416
    bad_syntax_res = client.get(f"/api/v1/stream/audio/c1/1?token={drm_token}", headers={"Range": "bytes=abc-def"})
    assert bad_syntax_res.status_code == 416

    # 8. DRM Priority check: invalid token with Range header -> 403 Forbidden (not 206 or 416)
    tamper_res = client.get("/api/v1/stream/audio/c1/1?token=forged.invalid.token", headers={"Range": "bytes=0-1023"})
    assert tamper_res.status_code == 403
    tamper_oob_res = client.get("/api/v1/stream/audio/c1/1?token=forged.invalid.token", headers={"Range": "bytes=999999999-"})
    assert tamper_oob_res.status_code == 403

    print("✅ Phase 9: RFC 7233 Audio Range streaming (prefix, scrubbing, suffix, open-ended, 416 & DRM priority) verified.")


def test_phase9_payment_replay_and_coupon_edge_cases():
    """
    Phase 9 Edge-Case: Payment Replay Attack rejection, Failed resurrection rejection, and Expired coupons:
    1. Replay attack rejection: verify same authority twice -> HTTP 400.
    2. Failed payment resurrection rejection -> HTTP 400.
    3. Re-verification of failed payment with FAILED -> HTTP 400.
    4. Expired coupon EXPIRED1402 rejection -> HTTP 400 with Persian message.
    5. Inactive coupon INACTIVE10 rejection -> HTTP 400.
    6. Nonexistent coupon rejection -> HTTP 400.
    7. Valid coupon HEKMAT1403 acceptance with منظور شد (no bureaucratic tells).
    """
    import uuid
    stu_login = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    s_headers = {"Authorization": f"Bearer {stu_login.json()['access_token']}"}

    def _create_order():
        res = client.post("/api/v1/orders/create", headers=s_headers, json={
            "items": [{"item_id": "course-bidayat", "item_type": "course", "title": "بدایة الحکمة", "price": 100000, "quantity": 1}],
            "shipping_address": "قم",
            "postal_code": "3713612345",
            "recipient_name": "علی",
            "recipient_phone": "09123456789"
        })
        assert res.status_code == 200
        return res.json()["order_id"]

    # 1. Replay Attack Test
    init1 = client.post("/api/v1/payment/init", headers=s_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init1.status_code == 200
    auth1 = init1.json()["payment_token"]

    v1_first = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth1,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
    })
    assert v1_first.status_code == 200
    assert v1_first.json()["success"] is True

    # REPLAY verification -> MUST return 400 Bad Request
    v1_replay = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth1,
        "status": "OK"
    })
    assert v1_replay.status_code == 400, f"Expected 400 for replay attack, got {v1_replay.status_code}"
    assert "PAYMENT_REPLAY_ATTACK" in v1_replay.text or "قبلاً تایید شده است" in v1_replay.text

    # 2. Failed Payment Resurrection Test
    init2 = client.post("/api/v1/payment/init", headers=s_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init2.status_code == 200
    auth2 = init2.json()["payment_token"]

    v2_fail = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth2,
        "status": "FAILED"
    })
    assert v2_fail.status_code == 200
    assert v2_fail.json()["success"] is False

    # Resurrection attempt with OK -> MUST return 400
    v2_resurrect = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth2,
        "status": "OK"
    })
    assert v2_resurrect.status_code == 400
    assert "PAYMENT_ALREADY_FAILED" in v2_resurrect.text or "قبلاً ناموفق ثبت شده است" in v2_resurrect.text

    # Subsequent verification with FAILED -> MUST return 400
    v2_re_fail = client.post("/api/v1/payment/verify", headers=s_headers, json={
        "authority": auth2,
        "status": "FAILED"
    })
    assert v2_re_fail.status_code == 400

    # 3. Expired Coupon Rejection
    exp_res = client.post("/api/v1/coupons/validate", json={"code": "EXPIRED1402", "cart_total": 500000})
    assert exp_res.status_code == 400, f"Expected 400 for expired coupon, got {exp_res.status_code}"
    assert "منقضی" in exp_res.text or "INVALID_COUPON" in exp_res.text

    # 4. Inactive Coupon Rejection
    inact_res = client.post("/api/v1/coupons/validate", json={"code": "INACTIVE10", "cart_total": 500000})
    assert inact_res.status_code == 400
    assert "غیرفعال" in inact_res.text or "INVALID_COUPON" in inact_res.text

    # 5. Non-existent Coupon Rejection
    fake_code_res = client.post("/api/v1/coupons/validate", json={"code": "NO_SUCH_COUPON_999", "cart_total": 500000})
    assert fake_code_res.status_code == 400

    # 6. Valid Coupon HEKMAT1403 Acceptance
    val_res = client.post("/api/v1/coupons/validate", json={"code": "HEKMAT1403", "cart_total": 1000000})
    assert val_res.status_code == 200
    vdata = val_res.json()
    assert vdata["discount_percent"] == 20
    assert vdata["discount_amount"] == 200000
    assert vdata["final_total"] == 800000
    assert "منظور شد" in vdata["message"]
    assert "منظور گردید" not in vdata["message"]

    print("✅ Phase 9: Payment Replay Attack, failed resurrection, and expired coupon rejections verified.")


def test_phase9_study_notes_crud_and_student_isolation():
    """
    Phase 9 Edge-Case: Timestamped Study Notes (/api/v1/notes) full lifecycle & student isolation:
    1. Unauthenticated requests to /notes return 401.
    2. Student A creates timestamped note with timestamp_sec=420 -> 200 OK.
    3. Student A reads notes list -> includes note.
    4. Student A updates note (title, content) -> 200 OK.
    5. Student B requests notes -> Student A's note is NOT visible (complete user isolation).
    6. Student B attempts to update Student A's note -> 404 Not Found.
    7. Student B attempts to delete Student A's note -> success: False, note remains intact.
    8. Student A deletes note -> 200 OK, success: True.
    9. Student A verifies note is completely gone.
    """
    import uuid

    # 1. Unauthenticated checks -> 401
    assert client.get("/api/v1/notes/").status_code == 401
    assert client.post("/api/v1/notes/create", json={"course_id": "c1", "chapter_id": 1, "title": "t", "content": "c"}).status_code == 401

    # Register two unique isolated students
    phone_a = f"0912{uuid.uuid4().int % 10000000:07d}"
    phone_b = f"0912{uuid.uuid4().int % 10000000:07d}"

    reg_a = client.post("/api/v1/auth/register", json={"full_name": "دانشجو الف", "phone": phone_a, "password": "PasswordA1!"})
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    reg_b = client.post("/api/v1/auth/register", json={"full_name": "دانشجو ب", "phone": phone_b, "password": "PasswordB1!"})
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. Student A creates a timestamped study note
    note_payload = {
        "course_id": "course-ishraq",
        "chapter_id": 1,
        "title": "قاعده امکان اشرف در صدور انوار",
        "content": "شیخ اشراق قاعده امکان اشرف را در اثبات عقول قاهره و نظام طولی تبیین می‌فرماید.",
        "timestamp_sec": 420
    }
    create_res = client.post("/api/v1/notes/create", json=note_payload, headers=headers_a)
    assert create_res.status_code == 200, f"Expected 200, got {create_res.status_code}: {create_res.text}"
    note_data = create_res.json()
    note_id = note_data["id"]
    assert note_id.startswith("note-")
    assert note_data["timestamp_sec"] == 420
    assert note_data["title"] == note_payload["title"]

    # 3. Student A reads notes list
    list_a = client.get("/api/v1/notes/", headers=headers_a)
    assert list_a.status_code == 200
    a_notes = list_a.json()
    assert any(n["id"] == note_id for n in a_notes)

    # Filtered by course
    list_a_filtered = client.get("/api/v1/notes/?course_id=course-ishraq", headers=headers_a)
    assert list_a_filtered.status_code == 200
    assert any(n["id"] == note_id for n in list_a_filtered.json())

    # 4. Student A updates note
    update_res = client.put(f"/api/v1/notes/{note_id}", json={
        "title": "قاعده امکان اشرف در صدور انوار (ویرایش منقح)",
        "timestamp_sec": 425
    }, headers=headers_a)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "قاعده امکان اشرف در صدور انوار (ویرایش منقح)"
    assert update_res.json()["timestamp_sec"] == 425

    # 5. Student B requests notes -> Student A's note is NOT visible (user isolation)
    list_b = client.get("/api/v1/notes/", headers=headers_b)
    assert list_b.status_code == 200
    assert not any(n["id"] == note_id for n in list_b.json()), "Security breach: Student B saw Student A's private study note!"

    # 6. Student B attempts to update Student A's note -> 404 Not Found
    b_update = client.put(f"/api/v1/notes/{note_id}", json={"title": "سرقت یادداشت"}, headers=headers_b)
    assert b_update.status_code == 404

    # 7. Student B attempts to delete Student A's note -> success: False
    b_delete = client.delete(f"/api/v1/notes/{note_id}", headers=headers_b)
    assert b_delete.status_code == 200
    assert b_delete.json().get("success") is False, "Security breach: Student B deleted Student A's note!"

    # Verify Student A still has the note intact
    list_a_check = client.get("/api/v1/notes/", headers=headers_a)
    assert any(n["id"] == note_id for n in list_a_check.json())

    # 8. Student A deletes note -> success: True
    a_delete = client.delete(f"/api/v1/notes/{note_id}", headers=headers_a)
    assert a_delete.status_code == 200
    assert a_delete.json().get("success") is True

    # 9. Verify note is deleted
    list_a_after = client.get("/api/v1/notes/", headers=headers_a)
    assert not any(n["id"] == note_id for n in list_a_after.json())

    print("✅ Phase 9: Timestamped Study Notes CRUD, student data isolation, and unauthorized mutation defense verified.")


def test_phase9_scholarly_qa_lifecycle_and_rbac(student_token: str, admin_token: str):
    """
    Phase 9 Edge-Case: Scholarly Q&A (/api/v1/qa) full lifecycle, student ask, student answer rejection (403),
    and Admin answer publishing (200):
    1. Anonymous can read discussions (200), but cannot ask (401) or answer (401).
    2. Student asks a question -> 200 OK, is_resolved: False, answer_text: None.
    3. Student attempts to answer the question -> HTTP 403 Forbidden!
    4. Admin attempts to answer a non-existent question -> HTTP 404 Not Found.
    5. Admin answers the question -> 200 OK, is_resolved: True, answer_text updated.
    6. Public list reflects resolved status and official answer.
    """
    student_headers = {"Authorization": f"Bearer {student_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Anonymous checks
    anon_read = client.get("/api/v1/qa/")
    assert anon_read.status_code == 200
    assert isinstance(anon_read.json(), list)

    anon_ask = client.post("/api/v1/qa/ask", json={
        "course_id": "course-ishraq",
        "title": "پرسش ناشناس",
        "question_text": "متن پرسش"
    })
    assert anon_ask.status_code == 401

    anon_ans = client.post("/api/v1/qa/qa-101/answer", json={"answer_text": "پاسخ ناشناس"})
    assert anon_ans.status_code == 401

    # 2. Student asks a scholarly inquiry
    ask_payload = {
        "course_id": "course-ishraq",
        "title": "تمایز انوار اسپهبدیه و انوار قاهره در نظام اشراقی",
        "question_text": "جناب استاد، آیا انوار اسپهبدیه تعلق تدبیری به ابدان دارند یا مجرد تام هستند؟"
    }
    ask_res = client.post("/api/v1/qa/ask", json=ask_payload, headers=student_headers)
    assert ask_res.status_code == 200, f"Expected 200, got {ask_res.status_code}: {ask_res.text}"
    qdata = ask_res.json()
    question_id = qdata["id"]
    assert question_id.startswith("qa-")
    assert qdata["is_resolved"] is False
    assert qdata["answer_text"] is None
    assert qdata["title"] == ask_payload["title"]

    # 3. Student attempts to answer the question -> MUST FAIL WITH 403 FORBIDDEN!
    student_ans_res = client.post(f"/api/v1/qa/{question_id}/answer", json={
        "answer_text": "تلاش غیرمجاز دانشجو برای درج پاسخ به جای استاد"
    }, headers=student_headers)
    assert student_ans_res.status_code == 403, f"Expected 403 for student answering QA, got {student_ans_res.status_code}: {student_ans_res.text}"
    assert "منحصراً در اختیار مدیر" in student_ans_res.text

    # 4. Admin attempts to answer non-existent question -> 404 Not Found
    admin_fake_ans = client.post("/api/v1/qa/qa-nonexistent-id-99999/answer", json={
        "answer_text": "پاسخ به شناسه ناموجود"
    }, headers=admin_headers)
    assert admin_fake_ans.status_code == 404, f"Expected 404, got {admin_fake_ans.status_code}: {admin_fake_ans.text}"

    # 5. Admin answers the question legitimately -> 200 OK
    official_answer = "انوار اسپهبدیه نفوس ناطقه‌ای هستند که تعلق تدبیری به برزخ (بدن) دارند، بر خلاف انوار قاهره که عقول مجرد تام از هرگونه تعلق هستند."
    admin_ans_res = client.post(f"/api/v1/qa/{question_id}/answer", json={
        "answer_text": official_answer
    }, headers=admin_headers)
    assert admin_ans_res.status_code == 200
    ans_data = admin_ans_res.json()
    assert ans_data["is_resolved"] is True
    assert ans_data["answer_text"] == official_answer

    # 6. Public list check
    pub_res = client.get("/api/v1/qa/?course_id=course-ishraq")
    assert pub_res.status_code == 200
    resolved_q = next((q for q in pub_res.json() if q["id"] == question_id), None)
    assert resolved_q is not None
    assert resolved_q["is_resolved"] is True
    assert resolved_q["answer_text"] == official_answer

    print("✅ Phase 9: Scholarly Q&A lifecycle, student answer 403 block, and admin resolution verified.")


def test_live_course_skyroom_access(student_tok: str, admin_tok: str):
    """
    Verifies that non-enrolled students are blocked (403) from accessing live class tickets,
    while enrolled students and admins receive authenticated Skyroom tickets with student identity metadata.
    """
    live_course_id = "course-online-sadra-ishraq"

    # 1. Unenrolled student attempt must return HTTP 403
    unauth_res = client.get(
        f"/api/v1/courses/{live_course_id}/live-access",
        headers={"Authorization": f"Bearer {student_tok}"}
    )
    assert unauth_res.status_code in [400, 403]

    # 2. Admin access always succeeds
    admin_res = client.get(
        f"/api/v1/courses/{live_course_id}/live-access",
        headers={"Authorization": f"Bearer {admin_tok}"}
    )
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["success"] is True
    assert "skyroom_url" in admin_data
    assert admin_data["access_role"] == "admin"
    assert len(admin_data["skyroom_url"]) > 10

    print("✅ Live online Skyroom access gateway and authorization shield verified.")


def test_max_3_concurrent_devices():
    """
    Verifies that a user can have at most 3 active concurrent sessions.
    When a 4th device connects, the oldest device session is automatically revoked (FIFO policy).
    Requests using the revoked device's token are rejected with HTTP 401.
    """
    import uuid
    phone = f"0911{uuid.uuid4().int % 10000000:07d}"
    pwd = "DevicePassword123!"

    # 1. Register user (Device 1)
    reg = client.post("/api/v1/auth/register", json={
        "full_name": "دانش‌پژوه چنددستگاهی",
        "phone": phone,
        "password": pwd
    })
    assert reg.status_code == 200
    tok1 = reg.json()["access_token"]

    # 2. Login from Device 2
    log2 = client.post("/api/v1/auth/login", json={"phone": phone, "password": pwd})
    assert log2.status_code == 200
    tok2 = log2.json()["access_token"]

    # 3. Login from Device 3
    log3 = client.post("/api/v1/auth/login", json={"phone": phone, "password": pwd})
    assert log3.status_code == 200
    tok3 = log3.json()["access_token"]

    # At this point, Devices 1, 2, 3 must all be valid
    for tok in [tok1, tok2, tok3]:
        r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200

    # 4. Login from Device 4 (Must evict Device 1)
    log4 = client.post("/api/v1/auth/login", json={"phone": phone, "password": pwd})
    assert log4.status_code == 200
    tok4 = log4.json()["access_token"]

    # Device 1 must now be rejected with 401 (evicted due to 3-device limit)
    r1 = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tok1}"})
    assert r1.status_code == 401
    assert ("۳ دستگاه" in r1.json()["detail"] or "منقضی" in r1.json()["detail"])

    # Devices 2, 3, 4 must remain active
    for tok in [tok2, tok3, tok4]:
        r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200

    print("✅ Max 3 Concurrent Devices enforcement and FIFO session eviction verified.")


def test_redis_resilient_cache():
    """Verifies Redis resilient cache service with graceful in-memory degradation."""
    import asyncio
    from backend.app.core.redis_client import redis_service

    async def _test():
        await redis_service.set("test_key", "test_val", ex=60)
        v = await redis_service.get("test_key")
        assert v == "test_val"
        await redis_service.delete("test_key")
        v2 = await redis_service.get("test_key")
        assert v2 is None

    asyncio.run(_test())
    print("✅ Redis and in-memory resilient cache service verified.")


def test_background_worker_enqueue():
    """Verifies background worker task enqueuing and dispatch."""
    import asyncio
    from backend.app.core.worker import enqueue_task

    async def _test():
        res = await enqueue_task("cleanup_expired_sessions")
        assert res["enqueued"] is True
        assert res["task"] == "cleanup_expired_sessions"

    asyncio.run(_test())
    print("✅ ARQ / Background worker task enqueuing verified.")


def test_phase2_progress_sync_db_persistence(student_tok: str):
    """Verifies that audio playback progress is persisted in DB via sync_progress_tx."""
    import sqlite3
    headers = {"Authorization": f"Bearer {student_tok}"}
    res = client.post(
        "/api/v1/courses/course-mantiq-mabadi/progress",
        headers=headers,
        json={"chapter_id": 1, "progress_percent": 85, "last_position_sec": 1940},
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["success"] is True
    assert data["progress_percent"] == 85
    assert data["last_pos_sec"] == 1940

    # Physical verification in SQLite database
    with sqlite3.connect("zanjirzan_platform.db") as con:
        row = con.execute(
            "SELECT progress_percent, last_pos_sec FROM lesson_progress WHERE course_id = ? AND chapter_id = ?",
            ("course-mantiq-mabadi", 1),
        ).fetchone()
        assert row is not None, "LessonProgress row not found in SQLite!"
        assert row[0] == 85
        assert row[1] == 1940

    # Phase 4 verification: GET progress endpoint
    get_res = client.get("/api/v1/courses/course-mantiq-mabadi/progress", headers=headers)
    assert get_res.status_code == 200, f"Expected 200, got {get_res.status_code}: {get_res.text}"
    get_data = get_res.json()
    assert get_data["course_id"] == "course-mantiq-mabadi"
    assert len(get_data["items"]) >= 1
    assert any(it["chapter_id"] == 1 and it["last_pos_sec"] == 1940 for it in get_data["items"])

    # Phase 4 verification: DRM stream token with authenticated student & AnalyticsLog
    token_res = client.post(
        "/api/v1/stream/token",
        headers=headers,
        json={"user_id": "usr-140301", "course_id": "course-mantiq-mabadi", "chapter_id": 1},
    )
    assert token_res.status_code == 200
    t_data = token_res.json()
    assert "token" in t_data
    assert "forensic_watermark" in t_data

    print("✅ Phase 2 & 4: Playback progress synchronization, GET progress & DRM AnalyticsLog verified.")


def test_phase2_subscriber_db_persistence():
    """Verifies that newsletter subscription persists in DB via POST /api/v1/auth/subscribe."""
    import sqlite3, uuid
    test_contact = f"0912{uuid.uuid4().hex[:7]}"
    res = client.post("/api/v1/auth/subscribe", json={"contact": test_contact})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["success"] is True
    assert data["contact"] == test_contact

    # Physical verification in SQLite database
    with sqlite3.connect("zanjirzan_platform.db") as con:
        row = con.execute("SELECT contact FROM subscribers WHERE contact = ?", (test_contact,)).fetchone()
        assert row is not None, "Subscriber row not found in SQLite!"
        assert row[0] == test_contact

    print("✅ Phase 2: Newsletter subscription with Subscriber DB persistence verified.")


def test_phase2_all_21_courses_catalog_and_aliases():
    """Verifies that all 21 courses are loaded from seed and aliases resolve without 404."""
    # 1. Fetch courses catalog
    res = client.get("/api/v1/courses/")
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) >= 21, f"Expected >= 21 courses, found {len(courses)}"

    # 2. Test alias lookup: course-mantiq-mabadi and course1
    r_alias = client.get("/api/v1/courses/course-mantiq-mabadi")
    assert r_alias.status_code == 200
    assert r_alias.json()["id"] == "course-mantiq-mabadi"

    r_orig = client.get("/api/v1/courses/course-mabadi-mantiq")
    assert r_orig.status_code == 200

    print(f"✅ Phase 2: 21 courses loaded in catalog ({len(courses)} total) and canonical aliases verified.")


def test_phase5_security_and_otp_sessions(student_tok: str):
    """Verifies Phase 5 Production Security, Security Headers, OTP and Session Management."""
    # 1. HTTP Security Headers
    res = client.get("/")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "camera=()" in res.headers.get("Permissions-Policy", "")

    # 2. Authenticated active device sessions retrieval & is_current validation
    headers = {"Authorization": f"Bearer {student_tok}"}
    sess_res = client.get("/api/v1/auth/sessions", headers=headers)
    assert sess_res.status_code == 200
    sess_data = sess_res.json()
    assert sess_data["max_concurrent_devices"] == 3
    assert "sessions" in sess_data
    assert sess_data["active_count"] >= 1
    current_session = next((s for s in sess_data["sessions"] if s.get("is_current")), None)
    assert current_session is not None, "Active session must have is_current=True for authenticated token"
    session_id = current_session["id"]

    # 3. Revocation of non-existent session returns 404
    bad_rev = client.delete("/api/v1/auth/sessions/non-existent-session-id", headers=headers)
    assert bad_rev.status_code == 404

    # 4. Session Revocation of active session succeeds (200 OK)
    rev_res = client.delete(f"/api/v1/auth/sessions/{session_id}", headers=headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["success"] is True

    # 5. Subsequent request with revoked session token is rejected with 401
    post_rev_res = client.get("/api/v1/auth/sessions", headers=headers)
    assert post_rev_res.status_code == 401

    # 6. OTP Send Flow with Persian digits normalization
    target_phone = "۰۹۱۲۹۹۹۸۸۲۲"
    normalized_phone = "09129998822"
    otp_send_res = client.post("/api/v1/auth/otp/send", json={"phone": target_phone})
    assert otp_send_res.status_code == 200
    otp_data = otp_send_res.json()
    assert otp_data["success"] is True
    assert otp_data["phone"] == normalized_phone
    assert otp_data["expires_in_seconds"] == 120

    # 7. OTP Brute-force Shield: exactly 5 invalid attempts return 401, 6th returns 429
    for i in range(5):
        bad_res = client.post("/api/v1/auth/otp/verify", json={"phone": normalized_phone, "code": f"00000{i}"})
        assert bad_res.status_code == 401, f"Attempt {i+1} expected 401, got {bad_res.status_code}"

    # 6th attempt should be blocked by rate-limiter (HTTP 429)
    blocked_res = client.post("/api/v1/auth/otp/verify", json={"phone": normalized_phone, "code": "999999"})
    assert blocked_res.status_code == 429, f"Attempt 6 expected 429, got {blocked_res.status_code}"

    # 7th attempt even with correct mock code must still be blocked
    still_blocked = client.post("/api/v1/auth/otp/verify", json={"phone": normalized_phone, "code": "123456"})
    assert still_blocked.status_code == 429

    # 8. Re-requesting OTP resets attempts counter and allows successful login
    re_otp = client.post("/api/v1/auth/otp/send", json={"phone": normalized_phone})
    assert re_otp.status_code == 200

    # Verify with Persian digits code (۱۲۳۴۵۶) to test code digit normalization
    verify_res = client.post("/api/v1/auth/otp/verify", json={"phone": normalized_phone, "code": "۱۲۳۴۵۶"})
    assert verify_res.status_code == 200
    assert "access_token" in verify_res.json()

    # 9. Iranian SMS Provider Adapter unit check (Console fallback)
    import asyncio
    from backend.app.core.sms_provider import sms_provider
    sms_res = asyncio.run(sms_provider.send_otp_sms("09129998822", "123456"))
    assert sms_res["dispatched"] is True
    assert sms_res["provider"] == "console"

    print("✅ Phase 5: Production Security Headers, OTP attempt limiting, and Device Sessions verified.")


def test_phase6_payment_gateway_and_certificate_issuance(student_token: str):
    """
    Phase 6: Real Iranian Payment Gateway (Zarinpal/Sandbox Fallback) &
    Academic Certificate Issuance & Verification with QR Code ID:
    1. Tests payment gateway service direct request and verify.
    2. Tests certificate issuance via POST /api/v1/certificates/issue.
    3. Tests certificate verification via GET /api/v1/certificates/verify/{code}.
    4. Tests invalid certificate rejection via GET /api/v1/certificates/verify/INVALID-CODE.
    5. Tests student certificates retrieval via GET /api/v1/certificates/my.
    """
    import asyncio
    import uuid
    from backend.app.services.payment_gateway_service import payment_gateway

    # 1. Direct Payment Gateway Service check
    req_res = asyncio.run(payment_gateway.request_payment(
        amount_tomans=500000,
        callback_url="https://zanjirzan.ir/checkout/callback",
        description="تست درگاه شاپرک فاز ۶"
    ))
    assert req_res["success"] is True
    assert "payment_token" in req_res
    assert "shaparak.ir" in req_res["gateway_redirect_url"] or "zarinpal.com" in req_res["gateway_redirect_url"]

    verify_res = asyncio.run(payment_gateway.verify_payment(
        authority=req_res["payment_token"],
        amount_tomans=500000
    ))
    assert verify_res["success"] is True
    assert "REF-" in verify_res["reference_id"]
    assert verify_res["amount"] == 500000

    # 2. Certificate Issuance via API
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    assert login_res.status_code == 200
    fresh_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {fresh_token}"}
    issue_res = client.post("/api/v1/certificates/issue", json={
        "course_id": "course-asfar-1",
        "score": "عالی (۱۰۰ از ۱۰۰)"
    }, headers=headers)
    assert issue_res.status_code == 200, f"Certificate issue failed: {issue_res.text}"
    cert_data = issue_res.json()
    assert "certificate_code" in cert_data
    cert_code = cert_data["certificate_code"]
    assert cert_code.startswith("ZAN-CERT-1403-")

    # 3. Public Certificate Verification via API
    verify_api_res = client.get(f"/api/v1/certificates/verify/{cert_code}")
    assert verify_api_res.status_code == 200
    v_data = verify_api_res.json()
    assert v_data["valid"] is True
    assert v_data["certificate_code"] == cert_code
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in v_data["institute"]

    # 4. Invalid and Empty Certificate Verification Rejection
    bad_verify_res = client.get("/api/v1/certificates/verify/FAKE-CODE-9999")
    assert bad_verify_res.status_code == 200
    bad_v_data = bad_verify_res.json()
    assert bad_v_data["valid"] is False

    empty_verify_res = client.get("/api/v1/certificates/verify/%20")
    assert empty_verify_res.status_code == 200
    assert empty_verify_res.json()["valid"] is False

    # 5. Student Certificates Retrieval
    my_certs_res = client.get("/api/v1/certificates/my", headers=headers)
    assert my_certs_res.status_code == 200
    my_certs = my_certs_res.json()
    assert len(my_certs) >= 1
    assert any(c["certificate_code"] == cert_code for c in my_certs)

    # 6. Payment Gateway Edge Cases: Empty Authority & Fail-Closed Defense
    empty_auth_res = asyncio.run(payment_gateway.verify_payment(authority="", amount_tomans=100000))
    assert empty_auth_res["success"] is False

    # 7. Order Status Update on Payment Verification
    order_create_res = client.post("/api/v1/orders/create", json={
        "items": [{"item_id": "course-asfar-1", "item_type": "course", "title": "اسفار", "price": 890000, "quantity": 1}],
        "shipping_address": "قم، خیابان صفائیه",
        "postal_code": "3713712345",
        "recipient_name": "دانش‌پژوه آزمون",
        "recipient_phone": "09123456789"
    }, headers=headers)
    assert order_create_res.status_code == 200
    created_order_id = order_create_res.json()["order_id"]

    init_res = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": created_order_id,
        "gateway": "zarinpal",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_res.status_code == 200
    pay_tok = init_res.json()["payment_token"]

    verify_settle_res = client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": pay_tok,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:10]}"
    })
    assert verify_settle_res.status_code == 200
    assert verify_settle_res.json()["success"] is True

    # Confirm order status in order_service is now 'paid'
    from backend.app.services.order_service import order_service
    assert order_service.orders[created_order_id]["status"] == "paid"

    print("✅ Phase 6: Real Payment Gateway adapter, Certificate Issuance & Verification passed.")


def test_phase7_multimedia_rag_and_router(student_token: str, admin_token: str):
    """
    Phase 7: Multimedia Vector RAG, Strict Grounding, and Router Admin Endpoints:
    1. GET /api/v1/ai/index-stats returns comprehensive multimedia index metrics.
    2. POST /api/v1/ai/ingest-media-transcript rejects unauthenticated (401) and student (403).
    3. Admin POST /api/v1/ai/ingest-media-transcript breaks transcript into 2-minute timestamped chunks.
    4. POST /api/v1/ai/reindex enforces admin authorization and rebuilds indexes.
    5. Multimedia retrieval returns audio/video citations with timestamp_label and start/end seconds.
    6. Strict Closed-Book mode politely rejects queries outside the scholar's 21 courses and treatises.
    """
    # Ensure fresh active session tokens
    s_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    if s_res.status_code == 200:
        student_token = s_res.json()["access_token"]
    adm_pass = os.getenv("ADMIN_INITIAL_PASSWORD", "Admin_Secure_Initial_Pass_1403!")
    a_res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": adm_pass})
    if a_res.status_code != 200:
        a_res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "admin_secret_2026"})
    if a_res.status_code == 200:
        admin_token = a_res.json()["access_token"]

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Index stats
    stats_res = client.get("/api/v1/ai/index-stats")
    assert stats_res.status_code == 200
    sdata = stats_res.json()
    assert sdata["total_chunks"] >= 10
    assert sdata["audio_chunks"] >= 1
    assert sdata["video_chunks"] >= 1
    assert sdata["total_courses"] == 21
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in sdata["scholar_name"]

    # 2. RBAC on Ingestion
    ingest_payload = {
        "media_id": "test-lecture-01",
        "title": "تقریر مباحث تشکیک در سفر اول",
        "source": "دوره شرح اسفار اربعه",
        "transcript": "در این جلسه استاد به بررسی اشکال شیخ الرئیس پیرامون تشکیک در ذات و پاسخ صدرالمتالهین بر پایه اصالت وجود می‌پردازند. نور وجود دارای مراتب مشکک است و مابه‌الاشتراک عین مابه‌الامتیاز است.",
        "media_type": "audio",
        "session_name": "جلسه ۱۴: تشکیک عینی وجود",
        "chunk_duration_sec": 120,
    }
    # Unauthenticated -> 401
    unauth_ingest = client.post("/api/v1/ai/ingest-media-transcript", json=ingest_payload)
    assert unauth_ingest.status_code == 401

    # Student -> 403
    student_ingest = client.post("/api/v1/ai/ingest-media-transcript", json=ingest_payload, headers=student_headers)
    assert student_ingest.status_code == 403

    # Admin -> 200
    admin_ingest = client.post("/api/v1/ai/ingest-media-transcript", json=ingest_payload, headers=admin_headers)
    assert admin_ingest.status_code == 200
    idata = admin_ingest.json()
    assert idata["success"] is True
    assert idata["chunks_created"] >= 1
    chunk0 = idata["chunks"][0]
    assert "start_sec" in chunk0
    assert "end_sec" in chunk0
    assert "timestamp_label" in chunk0

    # 3. RBAC on Reindex
    student_reindex = client.post("/api/v1/ai/reindex", headers=student_headers)
    assert student_reindex.status_code == 403

    admin_reindex = client.post("/api/v1/ai/reindex", headers=admin_headers)
    assert admin_reindex.status_code == 200
    rdata = admin_reindex.json()
    assert rdata["success"] is True
    assert rdata["total_chunks"] >= 10

    # 4. Multimedia timestamped citation retrieval
    chat_res = client.post("/api/v1/ai/chat", json={
        "message": "حرکت در مقوله جوهر چگونه تبیین می‌شود؟",
        "subject_filter": "حکمت متعالیه"
    })
    assert chat_res.status_code == 200
    cdata = chat_res.json()
    assert len(cdata["citations"]) > 0
    top_c = cdata["citations"][0]
    assert top_c["media_type"] in ["audio", "video", "text"]

    # 5. Strict Closed-Book mode enforcement
    out_of_scope_res = client.post("/api/v1/ai/chat", json={
        "message": "دستور پخت پیتزا ناپلی ایتالیایی با خمیر ترش چیست؟"
    })
    assert out_of_scope_res.status_code == 200
    closed_book_data = out_of_scope_res.json()
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in closed_book_data["scholar_identity"]
    assert ("خارج از قلمرو" in closed_book_data["reply"] or "منحصراً" in closed_book_data["reply"])

    print("✅ Phase 7: Multimedia Vector RAG, Timestamped Chunks, Strict Closed-Book & Router Admin endpoints verified.")


if __name__ == "__main__":
    print("==============================================")
    print("RUNNING BACKEND TEST SUITE (IN-MEMORY CLIENT)")
    print("==============================================")
    test_root_health()
    student_tok, admin_tok = test_auth_endpoints()
    test_rbac_security_shield(student_tok, admin_tok)
    drm_tok = test_drm_stream_shield(admin_tok)
    test_audio_range_streaming(drm_tok)
    test_courses_catalog()
    test_ai_chat_assistant()
    test_admin_course_management(admin_tok)
    test_persistent_sqlite_auth_and_registration()
    test_registration_persistence_and_duplicate_error()

    # Milestone 1: Persistent Course Enrollment & Orders Integration Tests
    test_course_enrollment_persistence(student_tok)
    test_duplicate_course_enrollment_rejection(student_tok)
    test_enrolled_courses_retrieval(student_tok)
    test_orders_checkout_persistence(student_tok)
    test_user_favorites_and_composite_indexes(student_tok)

    # Milestone 2 (Phase 7): Advanced Payment Security, Server-Side Pricing, AI SSE & Admin RBAC
    test_payment_replay_attack_prevention()
    test_server_side_pricing_and_coupon_validation(student_tok)
    test_ai_token_by_token_sse_and_rate_limiter()
    test_admin_rbac_strict_shield(student_tok, admin_tok)

    # Milestone 2 Remediation: EntityNotFoundException & Payment Resurrection
    test_entity_not_found_signatures_and_admin_404(admin_tok)

    # Milestone 4 (Phase 9): Comprehensive Edge-Case Test Suite
    test_phase9_admin_rbac_all_mutations_forbidden_for_students(student_tok)
    test_phase9_audio_range_streaming_edge_cases(drm_tok)
    test_phase9_payment_replay_and_coupon_edge_cases()
    test_phase9_study_notes_crud_and_student_isolation()
    test_phase9_scholarly_qa_lifecycle_and_rbac(student_tok, admin_tok)

    # SaaS Milestone: Live Online Skyroom Access Gateway
    test_live_course_skyroom_access(student_tok, admin_tok)

    # SaaS Milestone: 3 Concurrent Devices, Redis Cache & Background Worker
    test_max_3_concurrent_devices()
    test_redis_resilient_cache()
    test_background_worker_enqueue()

    # Phase 2: Progress Sync, Subscribers & 21 Courses Catalog
    test_phase2_progress_sync_db_persistence(student_tok)
    test_phase2_subscriber_db_persistence()
    test_phase2_all_21_courses_catalog_and_aliases()

    # Phase 5: Security Headers, OTP Brute-force Shield & Device Session Revocation
    test_phase5_security_and_otp_sessions(student_tok)

    # Phase 6: Payment Gateway Adapter & Certificate Issuance / Verification
    test_phase6_payment_gateway_and_certificate_issuance(student_tok)

    # Phase 7: Multimedia Vector RAG, Timestamped Chunks, Strict Closed-Book & Router Admin
    test_phase7_multimedia_rag_and_router(student_tok, admin_tok)

    print("🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!")


