"""
Adversarial Stress Test Suite for Milestone 1:
Backend Persistent Database Authentication and SQLite Persistence.
Tests edge cases, malformed inputs, SQL injection, bcrypt limits,
concurrent duplicate registration races, and direct SQLite row verification.
"""
import sys
import os
import sqlite3
import uuid
import concurrent.futures
from typing import List, Tuple

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.security import verify_password

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"


def run_test(name: str, fn):
    print(f"\n--- [ADVERSARIAL TEST] {name} ---")
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


def test_sqlite_direct_persistence():
    phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    password = "SafePassword#2026"
    full_name = "دانش‌پژوه حکمت اول"

    res = client.post("/api/v1/auth/register", json={
        "full_name": full_name,
        "phone": phone,
        "password": password
    })
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    token = res.json().get("access_token")
    assert token, "Token missing in response"

    # Query SQLite directly
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT id, mobile, full_name, hashed_password, role, is_active FROM users WHERE mobile = ?", (phone,))
        row = cur.fetchone()
        assert row is not None, f"User {phone} not found in SQLite table users"
        user_id, mobile, name, hashed_pw, role, is_active = row
        assert mobile == phone
        assert name == full_name
        assert role == "student"
        assert is_active == 1
        assert hashed_pw.startswith("$2b$") or hashed_pw.startswith("$2a$"), f"Hash is not bcrypt: {hashed_pw[:10]}"
        assert verify_password(password, hashed_pw), "Bcrypt password verification failed against SQLite hash"
        assert not verify_password("WrongPassword!", hashed_pw), "Bcrypt incorrectly verified wrong password"


def test_duplicate_phone_rejection_and_persian_message():
    phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    password = "InitialPassword123"

    # Register initial user
    res1 = client.post("/api/v1/auth/register", json={
        "full_name": "کاربر نخست",
        "phone": phone,
        "password": password
    })
    assert res1.status_code == 200

    # Attempt duplicate registration with exact same phone
    res2 = client.post("/api/v1/auth/register", json={
        "full_name": "کاربر دوم با همان شماره",
        "phone": phone,
        "password": "AnotherPassword456"
    })
    assert res2.status_code == 400, f"Expected 400 on duplicate phone, got {res2.status_code}: {res2.text}"
    data = res2.json()
    detail = data.get("detail", "")
    assert "قبلاً در سامانه ثبت شده است" in detail or "USER_ALREADY_EXISTS" in detail, f"Unexpected detail message: {detail}"

    # Ensure no bureaucratic slop in error message (e.g. می‌باشد)
    assert "می‌باشد" not in detail, "Bureaucratic verb می‌باشد found in error message"
    assert "می‌گردد" not in detail, "Bureaucratic verb می‌گردد found in error message"

    # Direct SQLite verification: count must be exactly 1
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM users WHERE mobile = ?", (phone,))
        count = cur.fetchone()[0]
        assert count == 1, f"Expected 1 record in SQLite, found {count}"


def test_invalid_passwords_and_credentials():
    phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    password = "RealSecretPassword99"

    reg = client.post("/api/v1/auth/register", json={
        "full_name": "آزمون کلمه عبور",
        "phone": phone,
        "password": password
    })
    assert reg.status_code == 200

    # Test 1: Wrong password on registered phone
    bad_login = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": "FakePassword99"
    })
    assert bad_login.status_code in [400, 401], f"Expected 400 or 401, got {bad_login.status_code}"

    # Test 2: Non-existent phone
    non_existent = client.post("/api/v1/auth/login", json={
        "phone": "09190009999",
        "password": "AnyPassword"
    })
    assert non_existent.status_code in [400, 401], f"Expected 400 or 401, got {non_existent.status_code}"

    # Test 3: Empty string password in login
    empty_pw_login = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": ""
    })
    assert empty_pw_login.status_code in [400, 401]


def test_registration_input_validation():
    # 1. Short password (< 6 chars)
    short_pw = client.post("/api/v1/auth/register", json={
        "full_name": "کوتاه",
        "phone": "09121111111",
        "password": "123"
    })
    assert short_pw.status_code == 422, f"Expected 422 for short password, got {short_pw.status_code}"

    # 2. Malformed phones
    malformed_phones = [
        "",
        "0912",
        "091234567890",  # 12 digits
        "12345678901",   # doesn't start with 09
        "0912abc5678",   # letters
        "+989123456789", # prefix +98 not matching ^09[0-9]{9}$
        "0912 345 6789", # spaces
    ]
    for bad_phone in malformed_phones:
        res = client.post("/api/v1/auth/register", json={
            "full_name": "تست تلفن",
            "phone": bad_phone,
            "password": "ValidPassword123"
        })
        assert res.status_code in (400, 422), f"Phone '{bad_phone}' was not rejected with 400/422! Got: {res.status_code}"

    # 3. Missing fields
    missing_phone = client.post("/api/v1/auth/register", json={
        "full_name": "بدون تلفن",
        "password": "ValidPassword123"
    })
    assert missing_phone.status_code == 422

    missing_password = client.post("/api/v1/auth/register", json={
        "full_name": "بدون پسورد",
        "phone": "09121112233"
    })
    assert missing_password.status_code == 422


def test_unicode_and_special_characters():
    phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    # Name with Persian ZWNJ (نیم‌فاصله) and quotes
    name = "«دانش‌پژوه حکمت و فلسفه اسلامی»"
    # Password with unicode characters
    password = "کلید_رمز_🔑_1403_#$@"

    res = client.post("/api/v1/auth/register", json={
        "full_name": name,
        "phone": phone,
        "password": password
    })
    assert res.status_code == 200, f"Registration failed with unicode: {res.text}"
    token = res.json()["access_token"]

    # Verify login with unicode password
    login_res = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": password
    })
    assert login_res.status_code == 200

    # Verify session profile matches
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == name


def test_sql_injection_resilience():
    # Injection in login phone
    sqli_login = client.post("/api/v1/auth/login", json={
        "phone": "09123456789' OR '1'='1",
        "password": "' OR '1'='1"
    })
    # Should be rejected with 400 or 401, definitely NOT succeed (200) or crash (500)
    assert sqli_login.status_code in [400, 401], f"SQLi returned {sqli_login.status_code}"


def test_concurrent_duplicate_registration_race():
    race_phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    password = "RacePassword123!"
    num_threads = 10

    def attempt_register(idx: int) -> Tuple[int, str]:
        # Create separate client or use existing client
        r = client.post("/api/v1/auth/register", json={
            "full_name": f"رقابت کننده {idx}",
            "phone": race_phone,
            "password": password
        })
        return r.status_code, r.text

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(attempt_register, i) for i in range(num_threads)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_count = sum(1 for status, _ in results if status == 200)
    error_count = sum(1 for status, _ in results if status == 400)
    other_count = sum(1 for status, _ in results if status not in (200, 400))

    print(f"   Concurrency race results: 200={success_count}, 400={error_count}, other={other_count}")
    assert success_count == 1, f"Expected exactly 1 success, got {success_count}"
    assert other_count == 0, f"Unexpected status codes returned in race: {[s for s, _ in results if s not in (200, 400)]}"
    assert error_count == num_threads - 1, f"Expected {num_threads - 1} rejections with 400, got {error_count}"

    # Confirm in SQLite database: exactly 1 row exists
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT count(*) FROM users WHERE mobile = ?", (race_phone,))
        count = cur.fetchone()[0]
        assert count == 1, f"Database has {count} rows instead of exactly 1 for {race_phone}"


def test_token_tampering_and_me_hydration():
    phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    reg = client.post("/api/v1/auth/register", json={
        "full_name": "آزمون توکن",
        "phone": phone,
        "password": "TokenPassword123"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]

    # 1. Valid token
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["phone"] == phone

    # 2. Tampered token
    tampered_token = token[:-4] + "xxxx"
    res_tamper = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert res_tamper.status_code == 401

    # 3. Malformed header (no Bearer prefix)
    res_no_bearer = client.get("/api/v1/auth/me", headers={"Authorization": token})
    assert res_no_bearer.status_code == 401

    # 4. Empty header
    res_empty = client.get("/api/v1/auth/me", headers={"Authorization": ""})
    assert res_empty.status_code == 401


def test_scholar_admin_identity_in_db():
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT mobile, full_name, role FROM users WHERE role = 'admin'")
        rows = cur.fetchall()
        assert len(rows) > 0, "No admin user found in SQLite database"
        for mobile, full_name, role in rows:
            assert "حجت الاسلام دکتر زنجیرزن حسینی" in full_name, f"Admin full_name violation: '{full_name}'"


if __name__ == "__main__":
    print("=================================================================")
    print("⚡ ADVERSARIAL STRESS TEST SUITE — MILESTONE 1 (CHALLENGER 1)")
    print("=================================================================")
    tests = [
        ("1. SQLite Direct Persistence & Bcrypt Verification", test_sqlite_direct_persistence),
        ("2. Duplicate Phone Rejection & Anti-Slop Persian Warning", test_duplicate_phone_rejection_and_persian_message),
        ("3. Invalid Password Rejection & Credentials Safety", test_invalid_passwords_and_credentials),
        ("4. Registration Input Validation (Schema Constraints)", test_registration_input_validation),
        ("5. Unicode, Persian ZWNJ, and Special Characters", test_unicode_and_special_characters),
        ("6. SQL Injection Defense Verification", test_sql_injection_resilience),
        ("7. Concurrent Duplicate Registration Race Condition", test_concurrent_duplicate_registration_race),
        ("8. JWT Session Hydration, Tampering, and Header Malformation", test_token_tampering_and_me_hydration),
        ("9. Scholar Official Identity in Database Records", test_scholar_admin_identity_in_db),
    ]

    all_passed = True
    for name, test_fn in tests:
        passed = run_test(name, test_fn)
        if not passed:
            all_passed = False

    print("\n=================================================================")
    if all_passed:
        print("🏆 ALL ADVERSARIAL TESTS PASSED EMPIRICALLY!")
        sys.exit(0)
    else:
        print("💥 SOME ADVERSARIAL TESTS FAILED!")
        sys.exit(1)
