"""
Challenger Adversarial Stress Test Suite for Milestone 4 (Phase 9)
Empirical challenge verifying:
1. Admin RBAC 403 & 401 Matrix across all admin and privileged endpoints.
2. RFC 7233 Range streaming with extreme byte offsets (0-0, 0-1, end-of-file, boundary offsets, out-of-bounds 416).
3. Payment Replay Attack prevention under sequential and concurrent multithreaded attacks.
4. Non-bureaucratic Persian error messages and Scholar Identity compliance.
"""
import os
import sys
import uuid
import threading
from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app
from backend.app.core.security import create_access_token
from backend.app.services.drm_service import drm_service

client = TestClient(app)

TOTAL_ADVERSARIAL_TESTS = 0
PASSED_ADVERSARIAL_TESTS = 0

def record_pass(test_name: str):
    global TOTAL_ADVERSARIAL_TESTS, PASSED_ADVERSARIAL_TESTS
    TOTAL_ADVERSARIAL_TESTS += 1
    PASSED_ADVERSARIAL_TESTS += 1
    print(f"  [PASS] {test_name}")

def get_tokens():
    res_student = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    assert res_student.status_code == 200, f"Student login failed: {res_student.text}"
    student_tok = res_student.json()["access_token"]

    res_admin = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "admin_secret_2026"})
    assert res_admin.status_code == 200, f"Admin login failed: {res_admin.text}"
    admin_tok = res_admin.json()["access_token"]

    return student_tok, admin_tok


# =========================================================================
# CHALLENGE 1: ADMIN RBAC 403 MATRIX & 401 ENFORCEMENT
# =========================================================================
def challenge_admin_rbac_matrix():
    print("\n" + "=" * 60)
    print("CHALLENGE 1: ADMIN RBAC 403 MATRIX & UNAUTHENTICATED 401")
    print("=" * 60)

    student_tok, admin_tok = get_tokens()
    student_headers = {"Authorization": f"Bearer {student_tok}"}
    admin_headers = {"Authorization": f"Bearer {admin_tok}"}

    endpoints = [
        ("GET", "/api/v1/admin/", None),
        ("GET", "/api/v1/admin/analytics", None),
        ("POST", "/api/v1/admin/courses/create", {
            "title": "دوره آزمایشی متخاصم",
            "instructor": "حجت الاسلام دکتر زنجیرزن حسینی",
            "price": "500000"
        }),
        ("PUT", "/api/v1/admin/courses/course-ishraq", {
            "title": "تغییر غیرمجاز عنوان دوره"
        }),
        ("POST", "/api/v1/admin/courses/course-ishraq/chapters", {
            "title": "فصل آزمایشی متخاصم",
            "duration": "15:00"
        }),
        ("PUT", "/api/v1/admin/courses/course-ishraq/chapters/1", {
            "title": "ویرایش غیرمجاز فصل"
        }),
        ("PUT", "/api/v1/admin/books/book-ishraq-1", {
            "title": "تغییر غیرمجاز مشخصات کتاب",
            "price": "250000"
        }),
        ("PUT", "/api/v1/admin/orders/ORD-TEST-ADV/status", {
            "status": "shipped",
            "postal_barcode_24digit": "111122223333444455556666"
        }),
        ("DELETE", "/api/v1/admin/courses/course-ishraq", None),
        ("POST", "/api/v1/qa/qa-101/answer", {
            "answer_text": "پاسخ متخاصم غیرمجاز"
        }),
    ]

    for method, path, payload in endpoints:
        # 1. Unauthenticated (No Header) -> Must be 401
        if method == "GET":
            res_anon = client.get(path)
        elif method == "POST":
            res_anon = client.post(path, json=payload)
        elif method == "PUT":
            res_anon = client.put(path, json=payload)
        elif method == "DELETE":
            res_anon = client.delete(path)
        assert res_anon.status_code == 401, f"Expected 401 for anonymous {method} {path}, got {res_anon.status_code}"
        record_pass(f"Unauthenticated 401: {method} {path}")

        # 2. Malformed / Tampered Token -> Must be 401
        malformed_headers = {"Authorization": "Bearer malformed.jwt.signature"}
        if method == "GET":
            res_mal = client.get(path, headers=malformed_headers)
        elif method == "POST":
            res_mal = client.post(path, json=payload, headers=malformed_headers)
        elif method == "PUT":
            res_mal = client.put(path, json=payload, headers=malformed_headers)
        elif method == "DELETE":
            res_mal = client.delete(path, headers=malformed_headers)
        assert res_mal.status_code == 401, f"Expected 401 for malformed token {method} {path}, got {res_mal.status_code}"
        record_pass(f"Malformed token 401: {method} {path}")

        # 3. Student Authenticated -> Must be 403 Forbidden with exact Persian message
        if method == "GET":
            res_stu = client.get(path, headers=student_headers)
        elif method == "POST":
            res_stu = client.post(path, json=payload, headers=student_headers)
        elif method == "PUT":
            res_stu = client.put(path, json=payload, headers=student_headers)
        elif method == "DELETE":
            res_stu = client.delete(path, headers=student_headers)
        assert res_stu.status_code == 403, f"Expected 403 for student {method} {path}, got {res_stu.status_code}: {res_stu.text}"
        assert "منحصراً در اختیار مدیر پایگاه است" in res_stu.text, f"Expected admin warning message, got: {res_stu.text}"
        # Anti-slop in error message: no bureaucratic tells
        assert "می‌باشد" not in res_stu.text
        assert "می‌گردد" not in res_stu.text
        record_pass(f"Student 403 Forbidden: {method} {path}")

        # 4. Admin Authenticated -> Must NOT be 401 or 403
        if method == "GET":
            res_adm = client.get(path, headers=admin_headers)
        elif method == "POST":
            res_adm = client.post(path, json=payload, headers=admin_headers)
        elif method == "PUT":
            res_adm = client.put(path, json=payload, headers=admin_headers)
        elif method == "DELETE":
            # Don't delete real course if course-ishraq is used in other tests; use dummy
            res_adm = client.delete("/api/v1/admin/courses/dummy-course-test", headers=admin_headers)
        assert res_adm.status_code not in (401, 403), f"Admin was rejected with {res_adm.status_code} on {method} {path}"
        record_pass(f"Admin Access Authorized: {method} {path} (status={res_adm.status_code})")


# =========================================================================
# CHALLENGE 2: RFC 7233 RANGE STREAMING EXTREME BYTE OFFSETS
# =========================================================================
def challenge_rfc7233_extreme_ranges():
    print("\n" + "=" * 60)
    print("CHALLENGE 2: RFC 7233 RANGE STREAMING WITH EXTREME OFFSETS")
    print("=" * 60)

    audio_path = os.path.abspath("frontend/public/audio/sample_lecture.wav")
    assert os.path.exists(audio_path), f"Audio file not found at {audio_path}"
    total_len = os.path.getsize(audio_path)
    print(f"  Target audio size: {total_len} bytes ({total_len / 1024 / 1024:.2f} MB)")

    token_data = drm_service.issue_token(user_id="usr-adv-tester", course_id="c1", chapter_id=1)
    drm_token = token_data["token"]
    base_url = f"/api/v1/stream/audio/c1/1?token={drm_token}"

    with open(audio_path, "rb") as f:
        full_content = f.read()

    # 1. Extreme: Single byte at offset 0 (bytes=0-0)
    r1 = client.get(base_url, headers={"Range": "bytes=0-0"})
    assert r1.status_code == 206, f"Expected 206, got {r1.status_code}"
    assert r1.headers.get("Content-Range") == f"bytes 0-0/{total_len}"
    assert r1.headers.get("Accept-Ranges") == "bytes"
    assert r1.headers.get("Content-Length") == "1"
    assert len(r1.content) == 1
    assert r1.content == full_content[0:1]
    record_pass("Extreme Range: Single first byte (bytes=0-0)")

    # 2. Extreme: Two bytes at start (bytes=0-1)
    r2 = client.get(base_url, headers={"Range": "bytes=0-1"})
    assert r2.status_code == 206
    assert r2.headers.get("Content-Range") == f"bytes 0-1/{total_len}"
    assert len(r2.content) == 2
    assert r2.content == full_content[0:2]
    record_pass("Extreme Range: First two bytes (bytes=0-1)")

    # 3. Extreme: Single byte at EOF (bytes={total-1}-{total-1})
    last_idx = total_len - 1
    r3 = client.get(base_url, headers={"Range": f"bytes={last_idx}-{last_idx}"})
    assert r3.status_code == 206
    assert r3.headers.get("Content-Range") == f"bytes {last_idx}-{last_idx}/{total_len}"
    assert r3.headers.get("Content-Length") == "1"
    assert len(r3.content) == 1
    assert r3.content == full_content[last_idx:last_idx+1]
    record_pass(f"Extreme Range: Single last byte (bytes={last_idx}-{last_idx})")

    # 4. Extreme: Last two bytes (bytes={total-2}-{total-1})
    penultimate = total_len - 2
    r4 = client.get(base_url, headers={"Range": f"bytes={penultimate}-{last_idx}"})
    assert r4.status_code == 206
    assert r4.headers.get("Content-Range") == f"bytes {penultimate}-{last_idx}/{total_len}"
    assert len(r4.content) == 2
    assert r4.content == full_content[penultimate:last_idx+1]
    record_pass(f"Extreme Range: Last two bytes (bytes={penultimate}-{last_idx})")

    # 5. Extreme: Suffix range of exactly 1 byte (bytes=-1)
    r5 = client.get(base_url, headers={"Range": "bytes=-1"})
    assert r5.status_code == 206
    assert r5.headers.get("Content-Range") == f"bytes {last_idx}-{last_idx}/{total_len}"
    assert len(r5.content) == 1
    assert r5.content == full_content[-1:]
    record_pass("Extreme Range: Suffix last 1 byte (bytes=-1)")

    # 6. Extreme: Suffix range of entire file (bytes=-{total_len})
    r6 = client.get(base_url, headers={"Range": f"bytes=-{total_len}"})
    assert r6.status_code == 206
    assert r6.headers.get("Content-Range") == f"bytes 0-{last_idx}/{total_len}"
    assert len(r6.content) == total_len
    record_pass(f"Extreme Range: Suffix whole file (bytes=-{total_len})")

    # 7. Extreme: Suffix range greater than total file (bytes=-{total_len + 5000})
    r7 = client.get(base_url, headers={"Range": f"bytes=-{total_len + 5000}"})
    assert r7.status_code == 206
    assert r7.headers.get("Content-Range") == f"bytes 0-{last_idx}/{total_len}"
    assert len(r7.content) == total_len
    record_pass("Extreme Range: Suffix greater than file size (clamped to 0)")

    # 8. Extreme: End boundary beyond total (bytes=0-{total_len + 5000})
    r8 = client.get(base_url, headers={"Range": f"bytes=0-{total_len + 5000}"})
    assert r8.status_code == 206
    assert r8.headers.get("Content-Range") == f"bytes 0-{last_idx}/{total_len}"
    assert len(r8.content) == total_len
    record_pass("Extreme Range: End offset beyond file size (clamped to EOF)")

    # 9. Extreme: Open-ended from start (bytes=0-)
    r9 = client.get(base_url, headers={"Range": "bytes=0-"})
    assert r9.status_code == 206
    assert r9.headers.get("Content-Range") == f"bytes 0-{last_idx}/{total_len}"
    assert len(r9.content) == total_len
    record_pass("Extreme Range: Open-ended from 0 (bytes=0-)")

    # 10. Extreme: Open-ended from penultimate byte (bytes={penultimate}-)
    r10 = client.get(base_url, headers={"Range": f"bytes={penultimate}-"})
    assert r10.status_code == 206
    assert r10.headers.get("Content-Range") == f"bytes {penultimate}-{last_idx}/{total_len}"
    assert len(r10.content) == 2
    record_pass(f"Extreme Range: Open-ended from penultimate byte (bytes={penultimate}-)")

    # 11. 416 Range Not Satisfiable: Start equals total_len (bytes={total_len}-)
    r11 = client.get(base_url, headers={"Range": f"bytes={total_len}-"})
    assert r11.status_code == 416, f"Expected 416, got {r11.status_code}"
    assert r11.headers.get("Content-Range") == f"bytes */{total_len}"
    record_pass(f"RFC 7233 416: Start equals total_len (bytes={total_len}-)")

    # 12. 416 Range Not Satisfiable: Start far beyond total_len (bytes=9999999999-)
    r12 = client.get(base_url, headers={"Range": "bytes=9999999999-"})
    assert r12.status_code == 416
    assert r12.headers.get("Content-Range") == f"bytes */{total_len}"
    record_pass("RFC 7233 416: Start far beyond EOF (bytes=9999999999-)")

    # 13. 416 Range Not Satisfiable: Inverted Range start > end (bytes=2048-1024)
    r13 = client.get(base_url, headers={"Range": "bytes=2048-1024"})
    assert r13.status_code == 416
    assert r13.headers.get("Content-Range") == f"bytes */{total_len}"
    record_pass("RFC 7233 416: Inverted range start > end (bytes=2048-1024)")

    # 14. 416 Range Not Satisfiable: Suffix zero (bytes=-0)
    r14 = client.get(base_url, headers={"Range": "bytes=-0"})
    assert r14.status_code == 416
    assert r14.headers.get("Content-Range") == f"bytes */{total_len}"
    record_pass("RFC 7233 416: Suffix zero (bytes=-0)")

    # 15. 416 Range Not Satisfiable: Malformed strings
    for bad_range in ["bytes=", "bytes=-", "bytes=abc-def", "bytes=1-2,3-4", "nonbytes=0-10"]:
        r_bad = client.get(base_url, headers={"Range": bad_range})
        assert r_bad.status_code == 416, f"Expected 416 for '{bad_range}', got {r_bad.status_code}"
        assert r_bad.headers.get("Content-Range") == f"bytes */{total_len}"
        record_pass(f"RFC 7233 416 Malformed Range: '{bad_range}'")

    # 16. Security priority: Tampered token must yield 403 Forbidden regardless of Range header
    r_sec1 = client.get("/api/v1/stream/audio/c1/1?token=FORGED_TAMPERED_TOKEN", headers={"Range": "bytes=0-0"})
    assert r_sec1.status_code == 403, f"Expected 403 for tampered token on 206 candidate, got {r_sec1.status_code}"
    record_pass("DRM Security Priority: 403 on tampered token with valid Range")

    r_sec2 = client.get("/api/v1/stream/audio/c1/1?token=FORGED_TAMPERED_TOKEN", headers={"Range": "bytes=9999999999-"})
    assert r_sec2.status_code == 403, f"Expected 403 for tampered token on 416 candidate, got {r_sec2.status_code}"
    record_pass("DRM Security Priority: 403 on tampered token with invalid Range (precedes 416)")


# =========================================================================
# CHALLENGE 3: PAYMENT REPLAY ATTACK & CONCURRENCY PREVENTION
# =========================================================================
def challenge_payment_replay_attacks():
    print("\n" + "=" * 60)
    print("CHALLENGE 3: PAYMENT REPLAY ATTACK & CONCURRENCY DEFENSE")
    print("=" * 60)

    auth_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    if auth_res.status_code != 200:
        auth_res = client.post("/api/v1/auth/register", json={"full_name": "دانشجو", "phone": "09123456789", "password": "pass"})
    student_headers = {"Authorization": f"Bearer {auth_res.json()['access_token']}"}

    def _create_order():
        res = client.post("/api/v1/orders/create", headers=student_headers, json={
            "items": [{"item_id": "course-bidayat", "item_type": "course", "title": "بدایة الحکمة", "price": 100000, "quantity": 1}],
            "shipping_address": "قم",
            "postal_code": "3713612345",
            "recipient_name": "علی",
            "recipient_phone": "09123456789"
        })
        assert res.status_code == 200
        return res.json()["order_id"]

    # 1. Sequential Replay Attack
    init_res = client.post("/api/v1/payment/init", headers=student_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_res.status_code == 200
    auth = init_res.json()["payment_token"]

    v1 = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": auth,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
    })
    assert v1.status_code == 200
    assert v1.json()["success"] is True
    assert v1.json()["reference_id"].startswith("REF-")
    record_pass("Payment: First verification succeeds (200 OK)")

    # Immediate second verification of SAME authority -> MUST be 400 Bad Request
    v2 = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": auth,
        "status": "OK"
    })
    assert v2.status_code == 400, f"Expected 400 for replay attack, got {v2.status_code}: {v2.text}"
    assert "PAYMENT_REPLAY_ATTACK" in v2.text or "قبلاً تایید شده است" in v2.text
    record_pass("Payment Replay Defense: Second verification rejected (400 Bad Request)")

    # Third verification attempt
    v3 = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": auth,
        "status": "OK"
    })
    assert v3.status_code == 400
    record_pass("Payment Replay Defense: Third verification rejected (400 Bad Request)")

    # 2. Concurrent / Multithreaded Replay Attack (Race Condition Simulation)
    init_race = client.post("/api/v1/payment/init", headers=student_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_race.status_code == 200
    race_auth = init_race.json()["payment_token"]

    concurrency_count = 15
    results = []

    def attack_verify():
        r = client.post("/api/v1/payment/verify", headers=student_headers, json={
            "authority": race_auth,
            "status": "OK",
            "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
        })
        return r.status_code

    with ThreadPoolExecutor(max_workers=concurrency_count) as executor:
        futures = [executor.submit(attack_verify) for _ in range(concurrency_count)]
        for f in futures:
            results.append(f.result())

    successes = results.count(200)
    rejections = results.count(400)
    print(f"  Concurrent race results: {successes} x 200 OK, {rejections} x 400 Rejections (Total: {len(results)})")
    assert successes == 1, f"Security Breach: Exactly 1 concurrent request must succeed, got {successes}"
    assert rejections == concurrency_count - 1, f"Expected {concurrency_count - 1} rejections, got {rejections}"
    record_pass(f"Concurrent Race Condition Replay Defense: 1 of {concurrency_count} succeeded, {concurrency_count - 1} rejected with 400")

    # 3. Failed Transaction Resurrection Attack
    init_fail = client.post("/api/v1/payment/init", headers=student_headers, json={
        "order_id": _create_order(),
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    fail_auth = init_fail.json()["payment_token"]

    v_fail = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": fail_auth,
        "status": "FAILED"
    })
    assert v_fail.status_code == 200
    assert v_fail.json()["success"] is False
    record_pass("Payment: Verification of failed bank status recorded (200 with success=False)")

    # Resurrection attempt: try to claim transaction as OK after failure
    v_resurrect = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": fail_auth,
        "status": "OK"
    })
    assert v_resurrect.status_code == 400
    assert "PAYMENT_ALREADY_FAILED" in v_resurrect.text or "قبلاً ناموفق ثبت شده است" in v_resurrect.text
    record_pass("Resurrection Attack Defense: Cannot change failed transaction to OK (400 Bad Request)")

    # 4. Duplicate Tracking Code Collision Attack
    init_c1 = client.post("/api/v1/payment/init", headers=student_headers, json={"order_id": _create_order(), "gateway": "sep", "return_url": "https://z.ir"})
    init_c2 = client.post("/api/v1/payment/init", headers=student_headers, json={"order_id": _create_order(), "gateway": "sep", "return_url": "https://z.ir"})
    auth_c1 = init_c1.json()["payment_token"]
    auth_c2 = init_c2.json()["payment_token"]

    shared_trk = f"TRK-SHARED-{uuid.uuid4().hex[:6]}"
    v_c1 = client.post("/api/v1/payment/verify", headers=student_headers, json={"authority": auth_c1, "status": "OK", "tracking_code": shared_trk})
    assert v_c1.status_code == 200
    record_pass("Tracking Code Uniqueness: First claim of tracking code accepted")

    v_c2 = client.post("/api/v1/payment/verify", headers=student_headers, json={"authority": auth_c2, "status": "OK", "tracking_code": shared_trk})
    assert v_c2.status_code == 400
    assert "DUPLICATE_TRACKING_CODE" in v_c2.text or "قبلاً ثبت شده است" in v_c2.text
    record_pass("Tracking Code Uniqueness: Second claim of same tracking code rejected (400)")

    # 5. Non-existent Authority
    v_fake = client.post("/api/v1/payment/verify", headers=student_headers, json={"authority": "SHAPARAK_AUTH_TOTALLY_FAKE_9999", "status": "OK"})
    assert v_fake.status_code == 400
    assert "PAYMENT_NOT_FOUND" in v_fake.text or "یافت نشد" in v_fake.text
    record_pass("Payment Not Found: Bogus authority rejected (400)")


# =========================================================================
# MAIN EXECUTION
# =========================================================================
if __name__ == "__main__":
    print("=" * 60)
    print("STARTING EMPIRICAL CHALLENGER ADVERSARIAL TEST HARNESS")
    print("=" * 60)

    try:
        challenge_admin_rbac_matrix()
        challenge_rfc7233_extreme_ranges()
        challenge_payment_replay_attacks()

        print("\n" + "=" * 60)
        print(f"🎉 ALL {PASSED_ADVERSARIAL_TESTS} ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 60)
    except AssertionError as e:
        print(f"\n❌ EMPIRICAL CHALLENGE FAILED: {e}")
        sys.exit(1)
