"""
Adversarial Challenge & Stress Test Suite — Milestone 2 (Phase 7)
Challenger: challenger_m2_1 (Critic & Specialist)

Target Features:
1. Payment Replay Attacks:
   - Sequential re-verification returning 400 (PAYMENT_REPLAY_ATTACK).
   - Concurrent 10-thread replay on already-verified payment returning 400 on all 10 threads.
   - Concurrent 10-thread race on fresh unverified payment ensuring exactly 1 success (200) and 9 rejections (400).
   - Unknown authority rejection (400 PAYMENT_NOT_FOUND).
   - Duplicate tracking code rejection (400 DUPLICATE_TRACKING_CODE).

2. Server-side Pricing Defense:
   - Order items with client-tampered price = 0 or price = 1 for paid books.
   - Catalog pricing verification: total_amount and SQLite order_items rows strictly use official catalog rates.
   - Expired coupon rejection (EXPIRED1402 -> 400).
   - Inactive coupon rejection (INACTIVE10 -> 400).
   - Non-existent coupon rejection (400).
   - Valid coupon calculation and Persian anti-bureaucratic verification («منظور شد»).

3. AI SSE Streaming & Prompt Capping:
   - Prompt length capping at 2000 chars:
     * 2005 chars -> 400.
     * 2001 chars -> 400.
     * 2000 chars -> 200 OK boundary condition.
   - SSE streaming format parsing:
     * content-type: text/event-stream
     * intermediate chunks: data: {"chunk": ..., "done": false}
     * final chunk: data: {"done": true, "citations": [...], "scholar_identity": "حجت الاسلام دکتر زنجیرزن حسینی"}
   - Token-bucket rate limiting (10 burst capacity, 11th request -> 429 + Retry-After).

4. Admin RBAC Router-level Enforcement:
   - Anonymous -> 401.
   - Student -> 403 on root /api/v1/admin and /analytics.
   - Admin -> 200 with verified scholar identity.
"""
import sys
import os
import json
import uuid
import sqlite3
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.rate_limiter import ai_token_bucket_limiter

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"
OFFICIAL_SCHOLAR_NAME = "حجت الاسلام دکتر زنجیرزن حسینی"


def get_student_auth():
    phone = f"0936{uuid.uuid4().int % 10000000:07d}"
    res = client.post("/api/v1/auth/register", json={
        "full_name": "دانش‌پژوه آزمون حمله",
        "phone": phone,
        "password": "Password#1403"
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def get_admin_auth():
    res = client.post("/api/v1/auth/login", json={
        "phone": "09120000000",
        "password": "admin_secret_2026"
    })
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_test_order(headers):
    res = client.post("/api/v1/orders/create", headers=headers, json={
        "items": [{"item_id": "course-bidayat", "item_type": "course", "title": "بدایة الحکمة", "price": 100000, "quantity": 1}],
        "shipping_address": "قم",
        "postal_code": "3713612345",
        "recipient_name": "علی",
        "recipient_phone": "09123456789"
    })
    assert res.status_code == 200
    return res.json()["order_id"]


# ============================================================================
# 1. PAYMENT REPLAY ATTACK VECTORS
# ============================================================================

def test_payment_replay_sequential():
    """Vector 1a: Verify once (200), replay second time (400 PAYMENT_REPLAY_ATTACK)."""
    headers = get_student_auth()
    order_id = create_test_order(headers)
    init_res = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": order_id,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_res.status_code == 200
    authority = init_res.json()["payment_token"]

    tracking = f"TRK-{uuid.uuid4().hex[:8]}"
    # 1. Legitimate verification
    v1 = client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": tracking
    })
    assert v1.status_code == 200, f"First verification failed: {v1.text}"
    res_data = v1.json()
    assert res_data["success"] is True
    assert len(res_data["reference_id"]) > 0

    # 2. Sequential replay attempt
    v2 = client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
    })
    assert v2.status_code == 400, f"Replay attack was NOT rejected! Status: {v2.status_code}"
    err_body = v2.json()
    assert err_body.get("error_code") == "PAYMENT_REPLAY_ATTACK" or "قبلاً تایید شده" in err_body.get("message", "")
    print("PASS: Vector 1a (Sequential Payment Replay Rejected with HTTP 400).")


def test_payment_replay_concurrent_on_paid_tx():
    """Vector 1b: 10 threads concurrently trying to verify an already-paid authority."""
    headers = get_student_auth()
    order_id = create_test_order(headers)
    init_res = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": order_id,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    authority = init_res.json()["payment_token"]

    # Pre-verify legitimately
    v_legit = client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": authority,
        "status": "OK",
        "tracking_code": f"TRK-{uuid.uuid4().hex[:8]}"
    })
    assert v_legit.status_code == 200

    # Now launch 10 concurrent replay verification requests
    def attempt_replay(worker_idx: int):
        return client.post("/api/v1/payment/verify", headers=headers, json={
            "authority": authority,
            "status": "OK",
            "tracking_code": f"TRK-ATTACK-{worker_idx}-{uuid.uuid4().hex[:4]}"
        })

    with ThreadPoolExecutor(max_workers=10) as executor:
        responses = list(executor.map(attempt_replay, range(10)))

    status_codes = [r.status_code for r in responses]
    assert all(code == 400 for code in status_codes), f"Not all concurrent replays failed: {status_codes}"
    for r in responses:
        body = r.json()
        assert body.get("error_code") == "PAYMENT_REPLAY_ATTACK" or "قبلاً تایید شده" in body.get("message", "")
    print("PASS: Vector 1b (Concurrent 10-thread replay on paid authority returned 400 on all threads).")


def test_payment_concurrent_race_on_fresh_authority():
    """Vector 1c: 10 threads concurrently attempting to verify a FRESH authority token.
    Exactly 1 thread must succeed (200), and 9 threads must be rejected (400).
    """
    headers = get_student_auth()
    order_id = create_test_order(headers)
    init_res = client.post("/api/v1/payment/init", headers=headers, json={
        "order_id": order_id,
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    authority = init_res.json()["payment_token"]

    def attempt_first_verify(idx: int):
        return client.post("/api/v1/payment/verify", headers=headers, json={
            "authority": authority,
            "status": "OK",
            "tracking_code": f"TRK-RACE-{idx}-{uuid.uuid4().hex[:4]}"
        })

    with ThreadPoolExecutor(max_workers=10) as executor:
        responses = list(executor.map(attempt_first_verify, range(10)))

    status_codes = [r.status_code for r in responses]
    success_count = status_codes.count(200)
    conflict_count = status_codes.count(400)

    assert success_count == 1, f"Expected exactly 1 success in race condition, got {success_count} (statuses: {status_codes})"
    assert conflict_count == 9, f"Expected exactly 9 rejections, got {conflict_count}"
    print(f"PASS: Vector 1c (Concurrency Race: 1 winner (200), 9 rejected (400)).")


def test_payment_unknown_authority_and_duplicate_tracking():
    """Vector 1d: Unknown authority returns 400; duplicate tracking code returns 400."""
    headers = get_student_auth()
    # Unknown authority
    res_fake = client.post("/api/v1/payment/verify", headers=headers, json={
        "authority": "SHAPARAK_AUTH_FORGED_00000000",
        "status": "OK"
    })
    assert res_fake.status_code == 400
    assert res_fake.json().get("error_code") == "PAYMENT_NOT_FOUND" or "یافت نشد" in res_fake.text

    # Duplicate tracking code across different authorities
    order1 = create_test_order(headers)
    order2 = create_test_order(headers)
    init1 = client.post("/api/v1/payment/init", headers=headers, json={"order_id": order1, "gateway": "sep", "return_url": "url"})
    init2 = client.post("/api/v1/payment/init", headers=headers, json={"order_id": order2, "gateway": "sep", "return_url": "url"})
    auth1 = init1.json()["payment_token"]
    auth2 = init2.json()["payment_token"]

    fixed_tracking = f"TRK-FIXED-{uuid.uuid4().hex[:6]}"
    v1 = client.post("/api/v1/payment/verify", headers=headers, json={"authority": auth1, "status": "OK", "tracking_code": fixed_tracking})
    assert v1.status_code == 200

    v2 = client.post("/api/v1/payment/verify", headers=headers, json={"authority": auth2, "status": "OK", "tracking_code": fixed_tracking})
    assert v2.status_code == 400
    assert v2.json().get("error_code") == "DUPLICATE_TRACKING_CODE" or "قبلاً ثبت شده" in v2.text
    print("PASS: Vector 1d (Unknown authority and duplicate tracking code rejected with 400).")


# ============================================================================
# 2. SERVER-SIDE PRICING & COUPON DEFENSE VECTORS
# ============================================================================

def test_server_side_pricing_tamper_defense():
    """Vector 2a: Client tampers with price (0, 1, negative) for paid books & courses.
    Backend must override with official catalog rates and persist official rates in SQLite.
    """
    student_headers = get_student_auth()

    # Catalog rates:
    # book-ishraq-1: physical_price 390,000 Tomans
    # book-bidayat: physical_price 180,000 Tomans
    # course-asfar-arba: free / waqf = 0 Tomans
    tampered_payload = {
        "items": [
            {
                "item_id": "book-ishraq-1",
                "item_type": "book_print",
                "title": "نور و شهود در حکمت اشراق",
                "price": 1,         # Tampered to 1 Toman (catalog is 390,000)
                "quantity": 2
            },
            {
                "item_id": "book-bidayat",
                "item_type": "book_print",
                "title": "بدایة الحکمة (جلد اول)",
                "price": 0,         # Tampered to 0 Toman (catalog is 180,000)
                "quantity": 1
            },
            {
                "item_id": "course-asfar-arba",
                "item_type": "course",
                "title": "شرح اسفار اربعه",
                "price": 9999999,   # Tampered to 9.9M Tomans (catalog is free = 0)
                "quantity": 1
            }
        ],
        "shipping_address": "قم، خیابان صفائیه، پلاک ۱۲",
        "postal_code": "3713712345",
        "recipient_name": "پژوهشگر فلسفه اسلامی",
        "recipient_phone": "09121112233"
    }

    res = client.post("/api/v1/orders/create", json=tampered_payload, headers=student_headers)
    assert res.status_code == 200, f"Order creation failed: {res.text}"
    order_data = res.json()
    order_id = order_data["order_id"]

    # Expected: (390,000 * 2) + (180,000 * 1) + (0 * 1) = 780,000 + 180,000 = 960,000 Tomans
    expected_total = 960000
    assert order_data["total_amount"] == expected_total, \
        f"Server failed to override prices! total_amount was {order_data['total_amount']} instead of {expected_total}."

    # Direct SQLite persistence check
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            "SELECT item_id, price, quantity FROM order_items WHERE order_id = ?",
            (order_id,)
        ).fetchall()
        db_prices = {r[0]: (r[1], r[2]) for r in rows}

    assert db_prices["book-ishraq-1"][0] == 390000, f"DB stored tampered price for book-ishraq-1: {db_prices['book-ishraq-1']}"
    assert db_prices["book-bidayat"][0] == 180000, f"DB stored tampered price for book-bidayat: {db_prices['book-bidayat']}"
    assert db_prices["course-asfar-arba"][0] == 0, f"DB stored tampered price for course-asfar-arba: {db_prices['course-asfar-arba']}"

    print(f"PASS: Vector 2a (Server-side price enforcement: 960,000 Tomans computed and persisted in SQLite).")


def test_coupon_expiration_and_anti_slop():
    """Vector 2b: Expired, inactive, and invalid coupons return 400; valid coupon uses «منظور شد»."""
    # 1. Expired coupon (EXPIRED1402)
    exp_res = client.post("/api/v1/coupons/validate", json={"code": "EXPIRED1402", "cart_total": 500000})
    assert exp_res.status_code == 400, f"Expired coupon accepted! status={exp_res.status_code}"
    assert "منقضی" in exp_res.text or "INVALID_COUPON" in exp_res.text

    # 2. Inactive coupon (INACTIVE10)
    inact_res = client.post("/api/v1/coupons/validate", json={"code": "INACTIVE10", "cart_total": 500000})
    assert inact_res.status_code == 400
    assert "غیرفعال" in inact_res.text or "INVALID_COUPON" in inact_res.text

    # 3. Non-existent coupon
    fake_res = client.post("/api/v1/coupons/validate", json={"code": "HACK_DISCOUNT_99", "cart_total": 500000})
    assert fake_res.status_code == 400

    # 4. Valid coupon (DARALHIKMAH 30%)
    valid_res = client.post("/api/v1/coupons/validate", json={"code": "DARALHIKMAH", "cart_total": 1000000})
    assert valid_res.status_code == 200
    vdata = valid_res.json()
    assert vdata["discount_percent"] == 30
    assert vdata["discount_amount"] == 300000
    assert vdata["final_total"] == 700000

    # Check Persian anti-slop rules
    assert "منظور شد" in vdata["message"]
    assert "منظور گردید" not in vdata["message"]
    assert "می‌باشد" not in vdata["message"]
    print("PASS: Vector 2b (Coupon expiration, inactive rejection, and Persian anti-bureaucratic verification).")


# ============================================================================
# 3. AI SSE STREAMING & PROMPT LENGTH CAPPING VECTORS
# ============================================================================

def test_ai_prompt_length_capping():
    """Vector 3a: Prompts exceeding 2000 characters rejected with HTTP 400; exactly 2000 accepted."""
    # Reset rate limit for this test IP
    ai_token_bucket_limiter.reset("ip:127.0.0.1")

    # 1. 2005 characters on /chat/stream -> MUST return 400
    oversized_prompt_2005 = "الف " * 501 + "ب"  # 501 * 4 + 1 = 2005 chars
    assert len(oversized_prompt_2005) > 2000
    res_stream_400 = client.post("/api/v1/ai/chat/stream", json={"message": oversized_prompt_2005})
    assert res_stream_400.status_code == 400, f"Expected 400 for 2005 chars on /chat/stream, got {res_stream_400.status_code}"
    assert "سقف مجاز" in res_stream_400.text or "حداکثر" in res_stream_400.text

    # 2. 2001 characters on /chat -> MUST return 400
    oversized_prompt_2001 = "س" * 2001
    res_chat_400 = client.post("/api/v1/ai/chat", json={"message": oversized_prompt_2001})
    assert res_chat_400.status_code == 400, f"Expected 400 for 2001 chars on /chat, got {res_chat_400.status_code}"

    # 3. Exactly 2000 characters boundary test -> MUST return 200 OK
    exact_2000 = "ک" * 2000
    res_boundary = client.post("/api/v1/ai/chat", json={"message": exact_2000})
    assert res_boundary.status_code == 200, f"Expected 200 for exact 2000 chars, got {res_boundary.status_code}: {res_boundary.text}"
    print("PASS: Vector 3a (Prompt length capping at 2000 chars & boundary verification).")


def test_ai_sse_stream_parsing_and_citations():
    """Vector 3b: Verify SSE chunk stream format, token assembly, and citations."""
    ai_token_bucket_limiter.reset("ip:127.0.0.1")

    stream_req = {
        "message": "انوار قاهره و اسفهبدیه در حکمت اشراق سهروردی چگونه است؟",
        "subject_filter": "فلسفه اشراق"
    }

    res = client.post("/api/v1/ai/chat/stream", json=stream_req)
    assert res.status_code == 200
    content_type = res.headers.get("content-type", "")
    assert "text/event-stream" in content_type, f"Expected text/event-stream, got {content_type}"

    # Collect and parse SSE events
    raw_lines = res.text.strip().split("\n")
    events = []
    for line in raw_lines:
        line_clean = line.strip()
        if line_clean.startswith("data:"):
            payload_str = line_clean[5:].strip()
            events.append(json.loads(payload_str))

    assert len(events) >= 2, f"Expected at least 2 events in SSE stream, got {len(events)}"

    # Intermediate chunks check
    intermediate = events[:-1]
    for chunk_ev in intermediate:
        assert "chunk" in chunk_ev
        assert chunk_ev["done"] is False

    # Terminal event check
    terminal = events[-1]
    assert terminal["done"] is True
    assert "reply" in terminal and len(terminal["reply"]) > 50
    assert terminal.get("scholar_identity") == OFFICIAL_SCHOLAR_NAME
    assert "citations" in terminal and len(terminal["citations"]) >= 1

    citation = terminal["citations"][0]
    assert "نور و شهود در حکمت اشراق" in citation["source"] or "اشراق" in citation["source"] or "الإشراق" in citation["source"]
    assert OFFICIAL_SCHOLAR_NAME in terminal.get("scholar_identity", "") or OFFICIAL_SCHOLAR_NAME in citation.get("page_or_session", "")

    # Reconstructed text check
    reconstructed = "".join(ev["chunk"] for ev in intermediate)
    assert reconstructed.strip() == terminal["reply"].strip(), "Reconstructed token stream differs from terminal reply!"
    print("PASS: Vector 3b (AI SSE chunk parsing, token stream reassembly, and citation accuracy).")


def test_ai_rate_limiter_burst_enforcement():
    """Vector 3c: TokenBucketRateLimiter allows 10 burst calls, then returns HTTP 429 with Retry-After."""
    test_ip = "10.20.30.40"
    bucket_key = f"ip:{test_ip}"
    ai_token_bucket_limiter.reset(bucket_key)
    headers = {"X-Forwarded-For": test_ip}

    # Consume 10 allowed tokens
    for i in range(10):
        r = client.post("/api/v1/ai/chat", json={"message": "پرسش"}, headers=headers)
        assert r.status_code == 200, f"Call {i+1} failed with {r.status_code}"

    # 11th call must be blocked with HTTP 429
    r_exceeded = client.post("/api/v1/ai/chat", json={"message": "پرسش ۱۱"}, headers=headers)
    assert r_exceeded.status_code == 429, f"Rate limiter did not block 11th request! Status: {r_exceeded.status_code}"
    assert "Retry-After" in r_exceeded.headers
    assert int(r_exceeded.headers["Retry-After"]) >= 1

    # Cleanup
    ai_token_bucket_limiter.reset(bucket_key)
    print("PASS: Vector 3c (Token-bucket rate limiter: 10 capacity burst, 11th rejected with 429 + Retry-After).")


# ============================================================================
# 4. ADMIN RBAC ROUTER-LEVEL ENFORCEMENT VECTORS
# ============================================================================

def test_admin_rbac_strictness():
    """Vector 4: Router-level admin RBAC enforcement:
    - Anonymous -> 401
    - Student -> 403 on root /api/v1/admin and all endpoints
    - Admin -> 200 with verified scholar identity
    """
    student_headers = get_student_auth()
    admin_headers = get_admin_auth()

    # 1. Anonymous root
    assert client.get("/api/v1/admin").status_code == 401
    assert client.get("/api/v1/admin/analytics").status_code == 401

    # 2. Student root (403 Forbidden)
    res_st_root = client.get("/api/v1/admin", headers=student_headers)
    assert res_st_root.status_code == 403, f"Expected 403 for student on admin root, got {res_st_root.status_code}"

    res_st_analytics = client.get("/api/v1/admin/analytics", headers=student_headers)
    assert res_st_analytics.status_code == 403

    res_st_create = client.post("/api/v1/admin/courses/create", json={"title": "دوره جعلی"}, headers=student_headers)
    assert res_st_create.status_code == 403

    # 3. Admin root (200 OK)
    res_adm_root = client.get("/api/v1/admin", headers=admin_headers)
    assert res_adm_root.status_code == 200
    adm_data = res_adm_root.json()
    assert adm_data["role"] == "admin"
    assert adm_data["scholar_name"] == OFFICIAL_SCHOLAR_NAME
    assert adm_data["message"] == "پنل مدیریت حجت الاسلام دکتر زنجیرزن حسینی"

    res_adm_analytics = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert res_adm_analytics.status_code == 200
    print("PASS: Vector 4 (Strict router-level admin RBAC: 401 unauth, 403 student, 200 admin).")


if __name__ == "__main__":
    print("=================================================================")
    print("⚔️ ADVERSARIAL STRESS SUITE — MILESTONE 2 (PHASE 7) CHALLENGER 1")
    print("=================================================================")
    test_payment_replay_sequential()
    test_payment_replay_concurrent_on_paid_tx()
    test_payment_concurrent_race_on_fresh_authority()
    test_payment_unknown_authority_and_duplicate_tracking()
    test_server_side_pricing_tamper_defense()
    test_coupon_expiration_and_anti_slop()
    test_ai_prompt_length_capping()
    test_ai_sse_stream_parsing_and_citations()
    test_ai_rate_limiter_burst_enforcement()
    test_admin_rbac_strictness()
    print("=================================================================")
    print("🏆 ALL 10 ADVERSARIAL CHALLENGES COMPLETED AND PASSED EMPIRICALLY!")
    print("=================================================================")
