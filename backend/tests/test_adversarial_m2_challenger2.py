"""
Adversarial Security & Rate Limiting Test Suite - Milestone 2 Challenger 2
Tests:
1. Admin RBAC Boundary: Unauthorized Student Token on EVERY admin endpoint -> HTTP 403 Forbidden.
2. Admin RBAC Boundary: Anonymous & Malformed Tokens -> HTTP 401 Unauthorized.
3. Admin RBAC Boundary: Authorized Admin Token -> HTTP 200 OK + Scholar Identity.
4. AI TokenBucket Rate Limiting: Burst of 15 requests to /api/v1/ai/chat/stream -> HTTP 429 Too Many Requests with Retry-After.
5. AI TokenBucket Isolation: Multi-user bucket isolation (User A exhausted does not block User B) and Anonymous IP limiting.
6. AI Prompt Boundary Validation: Max prompt length 2,000 chars vs 2,001 chars (HTTP 400).
7. Payment Replay Protection: Atomic lock, single-use authority, duplicate tracking code rejection.
8. Server-Side Pricing & Coupon Lifecycle: Tampered price override and expired coupon rejection.
"""
import sys
import os
import uuid
import time
from typing import Dict, Any
from unittest.mock import patch

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.rate_limiter import ai_token_bucket_limiter

client = TestClient(app)

async def no_sleep(delay=0):
    """Bypasses artificial network token-by-token delay to simulate burst requests within 1s."""
    return

def run_test(name: str):
    print(f"\n{'='*65}")
    print(f"RUNNING: {name}")
    print(f"{'='*65}")


def create_fresh_student(prefix="m2_challenger"):
    phone = f"0917{uuid.uuid4().int % 10000000:07d}"
    res = client.post("/api/v1/auth/register", json={
        "full_name": f"دانشجوی پژوهشی {prefix}",
        "phone": phone,
        "password": "Password123!"
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()
    return data["id"], data["phone"], data["access_token"]


def get_admin_token():
    res = client.post("/api/v1/auth/login", json={
        "phone": "09120000000",
        "password": "admin_secret_2026"
    })
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    return res.json()["access_token"]


def test_1_admin_rbac_student_tokens_rejected_everywhere():
    run_test("1. Admin RBAC: Student Token Receives HTTP 403 on ALL Admin Endpoints")
    
    student_id, student_phone, student_token = create_fresh_student("rbac_student")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # Exhaustive list of all admin endpoints defined under /api/v1/admin
    admin_endpoints = [
        ("GET", "/api/v1/admin/", None),
        ("GET", "/api/v1/admin/analytics", None),
        ("POST", "/api/v1/admin/courses/create", {
            "title": "حکمت آزمایشی",
            "instructor": "حجت الاسلام دکتر زنجیرزن حسینی",
            "level": "مقدماتی",
            "price": 0
        }),
        ("PUT", "/api/v1/admin/courses/course-asfar-1", {
            "title": "عنوان ویرایش‌شده",
            "price": 0
        }),
        ("POST", "/api/v1/admin/courses/course-asfar-1/chapters", {
            "title": "فصل آزمایشی جدید",
            "duration": "45:00",
            "audio_url": "/static/audio/test.mp3",
            "is_free_sample": False
        }),
        ("PUT", "/api/v1/admin/courses/course-asfar-1/chapters/1", {
            "title": "فصل به‌روزشده"
        }),
        ("PUT", "/api/v1/admin/books/book-ishraq-1", {
            "title": "کتاب حکمة الإشراق",
            "price_print": 400000
        }),
        ("PUT", "/api/v1/admin/orders/ord-arbitrary-123/status", {
            "status": "shipped",
            "postal_barcode_24digit": "123456789012345678901234"
        }),
        ("DELETE", "/api/v1/admin/courses/course-asfar-1", None),
    ]
    
    tested_count = 0
    for method, path, payload in admin_endpoints:
        if method == "GET":
            res = client.get(path, headers=student_headers)
        elif method == "POST":
            res = client.post(path, json=payload, headers=student_headers)
        elif method == "PUT":
            res = client.put(path, json=payload, headers=student_headers)
        elif method == "DELETE":
            res = client.delete(path, headers=student_headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"  -> Testing {method} {path} with student token: got HTTP {res.status_code}")
        assert res.status_code == 403, (
            f"SECURITY BREACH: {method} {path} returned HTTP {res.status_code} "
            f"instead of 403 Forbidden! Response: {res.text}"
        )
        
        data = res.json()
        assert "دسترسی به این بخش منحصراً در اختیار مدیر پایگاه است." in data.get("detail", ""), (
            f"Unexpected error message on {method} {path}: {data}"
        )
        tested_count += 1
        
    print(f"✅ Verified all {tested_count} admin endpoints return HTTP 403 Forbidden for student tokens.")


def test_2_admin_rbac_anonymous_and_malformed_tokens():
    run_test("2. Admin RBAC: Anonymous & Malformed Tokens Receive HTTP 401")
    
    sample_admin_routes = [
        ("GET", "/api/v1/admin/"),
        ("GET", "/api/v1/admin/analytics"),
        ("POST", "/api/v1/admin/courses/create"),
        ("DELETE", "/api/v1/admin/courses/course-asfar-1"),
    ]
    
    for method, path in sample_admin_routes:
        # A. No authorization header
        if method == "GET":
            res_anon = client.get(path)
        elif method == "POST":
            res_anon = client.post(path, json={})
        elif method == "DELETE":
            res_anon = client.delete(path)
        assert res_anon.status_code == 401, f"{method} {path} allowed anonymous access: {res_anon.status_code}"
        assert "سرآیند احراز هویت" in res_anon.json().get("detail", "")
        
        # B. Malformed header format (no 'Bearer')
        bad_format_header = {"Authorization": "Basic dXNlcjpwYXNz"}
        if method == "GET":
            res_bad = client.get(path, headers=bad_format_header)
        elif method == "POST":
            res_bad = client.post(path, json={}, headers=bad_format_header)
        elif method == "DELETE":
            res_bad = client.delete(path, headers=bad_format_header)
        assert res_bad.status_code == 401, f"{method} {path} accepted malformed auth: {res_bad.status_code}"
        assert "قالب سرآیند احراز هویت نامعتبر است" in res_bad.json().get("detail", "")
        
        # C. Invalid forged JWT token
        forged_header = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake"}
        if method == "GET":
            res_forged = client.get(path, headers=forged_header)
        elif method == "POST":
            res_forged = client.post(path, json={}, headers=forged_header)
        elif method == "DELETE":
            res_forged = client.delete(path, headers=forged_header)
        assert res_forged.status_code == 401, f"{method} {path} accepted forged token: {res_forged.status_code}"
        assert "توکن نشست نامعتبر یا منقضی شده است" in res_forged.json().get("detail", "")
        
    print("✅ Verified anonymous, malformed, and forged tokens strictly receive HTTP 401.")


def test_3_admin_rbac_legitimate_admin_access():
    run_test("3. Admin RBAC: Legitimate Admin Receives HTTP 200 + Scholar Identity")
    
    admin_token = get_admin_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # GET /api/v1/admin/
    res_root = client.get("/api/v1/admin/", headers=admin_headers)
    assert res_root.status_code == 200, f"Admin root failed: {res_root.text}"
    root_data = res_root.json()
    assert root_data["role"] == "admin"
    assert root_data["scholar_name"] == "حجت الاسلام دکتر زنجیرزن حسینی"
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in root_data["message"]
    
    # GET /api/v1/admin/analytics
    res_analytics = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert res_analytics.status_code == 200, f"Admin analytics failed: {res_analytics.text}"
    analytics_data = res_analytics.json()
    assert "total_students" in analytics_data
    assert "total_revenue_tomans" in analytics_data
    assert "total_courses_sold" in analytics_data
    assert "active_streams_today" in analytics_data
    
    print("✅ Verified legitimate admin access functions with HTTP 200 and preserves scholar identity.")


def test_4_ai_token_bucket_burst_rate_limiting():
    run_test("4. AI TokenBucket Rate Limiting: Burst of 15 Requests Exceeds Limit (HTTP 429)")
    
    # Reset the limiter bucket to guarantee predictable initial capacity
    ai_token_bucket_limiter.reset()
    
    _, _, student_token = create_fresh_student("ai_rate_limiter_burst")
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    payload = {
        "message": "حقیقت وجود از دیدگاه حکمت متعالیه چیست؟",
        "chat_history": []
    }
    
    success_count = 0
    throttled_count = 0
    first_429_response = None
    
    # Burst 15 requests in tight loop
    with patch("asyncio.sleep", new=no_sleep):
        for i in range(1, 16):
            res = client.post("/api/v1/ai/chat/stream", json=payload, headers=student_headers)
            if res.status_code == 200:
                success_count += 1
                assert res.headers["content-type"].startswith("text/event-stream")
            elif res.status_code == 429:
                throttled_count += 1
                if first_429_response is None:
                    first_429_response = res
            else:
                raise AssertionError(f"Unexpected status code {res.status_code}: {res.text}")
            
    print(f"  Burst results: {success_count} succeeded, {throttled_count} throttled.")
    assert success_count == 10, f"Expected 10 successful tokens (bucket capacity), got {success_count}"
    assert throttled_count == 5, f"Expected 5 throttled requests, got {throttled_count}"
    
    # Verify 429 Response Headers & Body
    assert first_429_response is not None
    # Outer RateLimitMiddleware stamps global sliding-window limit (120) while preserving endpoint Retry-After
    assert "Retry-After" in first_429_response.headers
    assert int(first_429_response.headers["Retry-After"]) >= 1
    
    body = first_429_response.json()
    assert "تعداد درخواست‌های هوش مصنوعی بیش از سقف مجاز است" in body.get("detail", "")
    
    print("✅ Verified AI TokenBucket strictly enforces capacity 10 and returns HTTP 429 with Retry-After.")


def test_5_ai_token_bucket_user_and_ip_isolation():
    run_test("5. AI TokenBucket Isolation: Multi-User Isolation and Anonymous IP Limiting")
    
    ai_token_bucket_limiter.reset()
    
    _, _, token_user_a = create_fresh_student("user_a")
    _, _, token_user_b = create_fresh_student("user_b")
    
    payload = {"message": "برهان صدیقین چیست؟"}
    
    with patch("asyncio.sleep", new=no_sleep):
        # Exhaust User A's bucket (10 requests)
        for _ in range(10):
            res_a = client.post("/api/v1/ai/chat/stream", json=payload, headers={"Authorization": f"Bearer {token_user_a}"})
            assert res_a.status_code == 200
            
        # 11th request for User A must be 429
        res_a_exhausted = client.post("/api/v1/ai/chat/stream", json=payload, headers={"Authorization": f"Bearer {token_user_a}"})
        assert res_a_exhausted.status_code == 429, "User A should be throttled"
        
        # User B must NOT be blocked by User A's consumption!
        res_b = client.post("/api/v1/ai/chat/stream", json=payload, headers={"Authorization": f"Bearer {token_user_b}"})
        assert res_b.status_code == 200, f"User B wrongly throttled by User A's bucket: {res_b.status_code}"
        
        # Anonymous client with distinct IP
        anon_headers_ip1 = {"X-Forwarded-For": "198.51.100.1"}
        anon_headers_ip2 = {"X-Forwarded-For": "198.51.100.2"}
        
        # Exhaust IP1
        for _ in range(10):
            res_ip1 = client.post("/api/v1/ai/chat/stream", json=payload, headers=anon_headers_ip1)
            assert res_ip1.status_code == 200
            
        res_ip1_throttled = client.post("/api/v1/ai/chat/stream", json=payload, headers=anon_headers_ip1)
        assert res_ip1_throttled.status_code == 429
        
        # IP2 must still be allowed
        res_ip2 = client.post("/api/v1/ai/chat/stream", json=payload, headers=anon_headers_ip2)
        assert res_ip2.status_code == 200, "IP2 wrongly throttled by IP1 bucket"
    
    print("✅ Verified per-user and per-IP isolation on TokenBucket rate limiter.")


def test_6_ai_prompt_length_validation():
    run_test("6. AI Prompt Boundary Validation: Max Length 2000 Chars vs 2001 Chars")
    
    # Reset limiter to avoid rate limit collisions
    ai_token_bucket_limiter.reset()
    
    # Exact boundary 2,000 characters
    prompt_2000 = "ف" * 2000
    res_2000 = client.post("/api/v1/ai/chat", json={"message": prompt_2000})
    assert res_2000.status_code == 200, f"2000 chars should be accepted, got {res_2000.status_code}"
    
    # Boundary violation 2,001 characters
    prompt_2001 = "ف" * 2001
    res_2001 = client.post("/api/v1/ai/chat", json={"message": prompt_2001})
    assert res_2001.status_code == 400, f"2001 chars should return 400, got {res_2001.status_code}"
    assert "بیش از سقف مجاز است" in res_2001.json().get("detail", "")
    
    # Boundary violation on streaming endpoint as well
    res_stream_2001 = client.post("/api/v1/ai/chat/stream", json={"message": prompt_2001})
    assert res_stream_2001.status_code == 400, f"Streaming 2001 chars should return 400, got {res_stream_2001.status_code}"
    assert "بیش از سقف مجاز است" in res_stream_2001.json().get("detail", "")
    
    print("✅ Verified prompt length capped strictly at 2,000 chars returning HTTP 400 on overflow.")


def test_7_payment_replay_protection_and_locking():
    run_test("7. Payment Replay Protection: Single-Use Authority & Replay Rejection")
    
    # Login student
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

    # 1. Initiate valid payment
    order_id = _create_order()
    res_init = client.post("/api/v1/payment/init", headers=student_headers, json={
        "order_id": order_id,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert res_init.status_code == 200, f"Payment init failed: {res_init.text}"
    data_init = res_init.json()
    authority = data_init["payment_token"]
    
    # 2. First verification -> Success
    trk_code = f"TRK-{uuid.uuid4().hex[:8]}"
    res_verify_1 = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": trk_code
    })
    assert res_verify_1.status_code == 200, f"First verification failed: {res_verify_1.text}"
    v1_data = res_verify_1.json()
    assert v1_data["success"] is True
    assert len(v1_data["reference_id"]) > 0
    
    # 3. Second verification (Replay Attack) -> Must be HTTP 400
    res_verify_2 = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
    })
    assert res_verify_2.status_code == 400, f"Replay attack was NOT rejected! Status: {res_verify_2.status_code}"
    v2_err = res_verify_2.json()
    assert v2_err.get("error_code") == "PAYMENT_REPLAY_ATTACK"
    assert "قبلاً تایید شده است" in v2_err.get("message", "")
    
    # 4. Unknown authority -> HTTP 400 PAYMENT_NOT_FOUND
    res_unknown = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": "SHAPARAK_AUTH_FORGED_999999",
        "status": "OK"
    })
    assert res_unknown.status_code == 400
    assert res_unknown.json().get("error_code") == "PAYMENT_NOT_FOUND"

    # 5. Duplicate tracking code reuse -> HTTP 400 DUPLICATE_TRACKING_CODE
    order_id2 = _create_order()
    res_init2 = client.post("/api/v1/payment/init", headers=student_headers, json={
        "order_id": order_id2,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert res_init2.status_code == 200
    auth2 = res_init2.json()["payment_token"]
    
    res_dup_trk = client.post("/api/v1/payment/verify", headers=student_headers, json={
        "authority": auth2,
        "status": "OK",
        "tracking_code": trk_code  # Reusing already verified tracking code!
    })
    assert res_dup_trk.status_code == 400
    assert res_dup_trk.json().get("error_code") == "DUPLICATE_TRACKING_CODE"
    
    print("✅ Verified payment replay attacks strictly blocked with HTTP 400 PAYMENT_REPLAY_ATTACK.")


def test_8_server_side_pricing_and_coupon_lifecycle():
    run_test("8. Server-Side Pricing & Coupon Expiration Validation")
    
    # 1. Client attempts price manipulation (e.g., submitting 10 Rials for a 390,000 Rial book)
    tampered_payload = {
        "items": [
            {
                "item_id": "book-ishraq-1",
                "item_type": "book_print",
                "title": "شرح حکمت الإشراق (نسخه چاپی)",
                "price": 10,  # Tampered price! Official is 390,000
                "quantity": 2
            }
        ],
        "shipping_address": "قم، میدان معلم",
        "postal_code": "3715612345",
        "recipient_name": "پژوهشگر فلسفه",
        "recipient_phone": "09121112233"
    }
    
    res_order = client.post("/api/v1/orders/create", json=tampered_payload)
    assert res_order.status_code == 200, f"Order creation failed: {res_order.text}"
    order_data = res_order.json()
    
    # Expected official total: 390,000 * 2 = 780,000
    expected_subtotal = 390000 * 2
    expected_total = expected_subtotal
    assert order_data["total_amount"] == expected_total, (
        f"Server failed to override tampered price! "
        f"Got total {order_data['total_amount']} instead of expected {expected_total}"
    )
    # Verify item unit price was corrected in SQLite persistence
    import sqlite3
    con = sqlite3.connect("zanjirzan_platform.db")
    db_items = con.execute("SELECT item_id, price FROM order_items WHERE order_id = ?", (order_data["order_id"],)).fetchall()
    con.close()
    price_map = {row[0]: row[1] for row in db_items}
    assert price_map.get("book-ishraq-1") == 390000, (
        f"Item price in SQLite was not corrected to official catalog price: {price_map}"
    )
    
    # 2. Coupon Expiration check: EXPIRED1402 must be rejected with HTTP 400
    res_expired = client.post("/api/v1/coupons/validate", json={
        "code": "EXPIRED1402",
        "cart_total": 500000
    })
    assert res_expired.status_code == 400, f"Expired coupon accepted: {res_expired.status_code}"
    assert "منقضی" in res_expired.json().get("detail", "")
    
    # 3. Inactive Coupon check: INACTIVE10 must be rejected with HTTP 400
    res_inactive = client.post("/api/v1/coupons/validate", json={
        "code": "INACTIVE10",
        "cart_total": 500000
    })
    assert res_inactive.status_code == 400, f"Inactive coupon accepted: {res_inactive.status_code}"
    assert "غیرفعال" in res_inactive.json().get("detail", "")
    
    # 4. Valid coupon HEKMAT1403: must apply discount and use Persian «منظور شد» (no «منظور گردید»)
    res_valid = client.post("/api/v1/coupons/validate", json={
        "code": "HEKMAT1403",
        "cart_total": 200000
    })
    assert res_valid.status_code == 200, f"Valid coupon failed: {res_valid.text}"
    valid_data = res_valid.json()
    assert valid_data["discount_amount"] == 40000
    msg = valid_data["message"]
    assert "منظور شد" in msg, f"Expected «منظور شد» in message: {msg}"
    assert "گردید" not in msg, f"Bureaucratic tell «گردید» found in message: {msg}"
    
    print("✅ Verified 100% server-side pricing anti-tampering and coupon lifecycle enforcement.")


if __name__ == "__main__":
    print("=================================================================")
    print("STARTING ADVERSARIAL STRESS SUITE - MILESTONE 2 CHALLENGER 2")
    print("=================================================================")
    test_1_admin_rbac_student_tokens_rejected_everywhere()
    test_2_admin_rbac_anonymous_and_malformed_tokens()
    test_3_admin_rbac_legitimate_admin_access()
    test_4_ai_token_bucket_burst_rate_limiting()
    test_5_ai_token_bucket_user_and_ip_isolation()
    test_6_ai_prompt_length_validation()
    test_7_payment_replay_protection_and_locking()
    test_8_server_side_pricing_and_coupon_lifecycle()
    print("\n" + "="*65)
    print("🎉 ALL 8 ADVERSARIAL CHALLENGER 2 TESTS PASSED EMPIRICALLY!")
    print("=================================================================")
