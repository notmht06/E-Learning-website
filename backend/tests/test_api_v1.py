"""
Comprehensive end-to-end integration test suite for Dr. Meysam Zanjirzan Hosseini Platform API.
Tests all 11 enterprise architectural modules against http://127.0.0.1:8000.
"""
import urllib.request
import urllib.error
import json
import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import warnings
warnings.filterwarnings("ignore")

BASE_URL = "http://127.0.0.1:8000"
_use_in_memory = False
_in_memory_client = None


def _get_in_memory_client():
    global _in_memory_client
    if _in_memory_client is None:
        from fastapi.testclient import TestClient
        from backend.app.main import app
        _in_memory_client = TestClient(app)
    return _in_memory_client


def request(method: str, path: str, data: dict = None, headers: dict = None, return_headers: bool = False):
    global _use_in_memory
    if not _use_in_memory:
        url = f"{BASE_URL}{path}"
        h = {"Content-Type": "application/json"}
        if headers:
            h.update(headers)
        body = json.dumps(data).encode("utf-8") if data else None
        req = urllib.request.Request(url, data=body, headers=h, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                status = resp.getcode()
                res_headers = dict(resp.info())
                raw_bytes = resp.read()
                try:
                    parsed_body = json.loads(raw_bytes.decode("utf-8")) if raw_bytes else None
                except Exception:
                    parsed_body = raw_bytes
                if return_headers:
                    return status, parsed_body, res_headers
                return status, parsed_body
        except urllib.error.HTTPError as e:
            raw_err = e.read()
            res_headers = dict(e.headers)
            try:
                parsed_err = json.loads(raw_err.decode("utf-8"))
            except Exception:
                parsed_err = raw_err.decode("utf-8", errors="replace")
            if return_headers:
                return e.code, parsed_err, res_headers
            return e.code, parsed_err
        except (urllib.error.URLError, ConnectionError, OSError):
            _use_in_memory = True

    # Fallback to TestClient if standalone live server is not running
    client = _get_in_memory_client()
    fn = getattr(client, method.lower())
    kwargs = {}
    if headers:
        kwargs["headers"] = headers
    if data:
        kwargs["json"] = data
    resp = fn(path, **kwargs)
    try:
        parsed_body = resp.json()
    except Exception:
        parsed_body = resp.text
    if return_headers:
        return resp.status_code, parsed_body, dict(resp.headers)
    return resp.status_code, parsed_body

def run_all_tests():
    passed = 0
    failed = 0

    print("==================================================")
    print("RUNNING API ARCHITECTURAL VERIFICATION SUITE")
    print("==================================================")

    # 1. Health check
    status, data = request("GET", "/")
    assert status == 200 and data["status"] == "healthy", f"Health check failed: {status}"
    print("[PASS] 1. System Health Root (GET /)")
    passed += 1

    # 2. Auth Login
    stu_pass = os.getenv("STUDENT_INITIAL_PASSWORD", "pass_dev_1403")
    status, data = request("POST", "/api/v1/auth/login", {"phone": "09123456789", "password": stu_pass})
    if status != 200:
        status, data = request("POST", "/api/v1/auth/login", {"phone": "09123456789", "password": "pass"})
    assert status == 200 and data["phone"] == "09123456789", f"Auth login failed: {status}"
    token = data["access_token"]
    print(f"[PASS] 2. Auth Login (POST /api/v1/auth/login) -> Token: {token[:18]}...")
    passed += 1

    # 3. Auth OTP Send & Verify
    status, data = request("POST", "/api/v1/auth/otp/send", {"phone": "09129998877"})
    assert status == 200 and data["success"] is True, f"OTP send failed: {status}"
    print("[PASS] 3. Auth OTP Send (POST /api/v1/auth/otp/send)")
    passed += 1

    status, data = request("POST", "/api/v1/auth/otp/verify", {"phone": "09129998877", "code": "123456"})
    assert status == 200 and data["phone"] == "09129998877", f"OTP verify failed: {status}"
    print("[PASS] 4. Auth OTP Verify (POST /api/v1/auth/otp/verify)")
    passed += 1

    # 4. Courses Catalog
    status, data = request("GET", "/api/v1/courses/")
    assert status == 200 and len(data) >= 3, f"Course catalog failed: {status}"
    print(f"[PASS] 5. Audio Courses List (GET /api/v1/courses/) -> {len(data)} courses")
    passed += 1

    # 5. Course Detail
    status, data = request("GET", "/api/v1/courses/course-ishraq")
    assert status == 200 and data["id"] == "course-ishraq", f"Course detail failed: {status}"
    print(f"[PASS] 6. Course Detail (GET /api/v1/courses/course-ishraq) -> {len(data['syllabus'])} syllabus lessons")
    passed += 1

    # 6. Books Catalog
    status, data = request("GET", "/api/v1/books/")
    assert status == 200 and len(data) >= 1, f"Books list failed: {status}"
    print(f"[PASS] 7. Books List (GET /api/v1/books/) -> {len(data)} books")
    passed += 1

    # 7. Fidibo/Taaghche E-Reader Sample
    status, data = request("GET", "/api/v1/books/book-ishraq-1/sample")
    assert status == 200 and len(data["sample_pages"]) >= 3, f"Reader sample failed: {status}"
    print(f"[PASS] 8. Fidibo/Taaghche E-Reader Sample (GET /api/v1/books/book-ishraq-1/sample) -> {len(data['sample_pages'])} spreads")
    passed += 1

    # 8. DRM Token Issuance
    status, data = request("POST", "/api/v1/stream/token", {
        "user_id": "usr-140301",
        "course_id": "course-ishraq",
        "chapter_id": 1
    }, headers={"Authorization": f"Bearer {token}"})
    assert status == 200 and "forensic_watermark" in data, f"DRM Token failed: {status}"
    drm_token = data["token"]
    print(f"[PASS] 9. DRM Token Issue (POST /api/v1/stream/token) -> Watermark: {data['forensic_watermark']}")
    passed += 1

    # 9. DRM Playback Heartbeat
    status, data = request("POST", "/api/v1/stream/heartbeat", {
        "token": drm_token,
        "user_id": "usr-140301",
        "course_id": "course-ishraq",
        "chapter_id": 1,
        "playback_position_sec": 120
    })
    assert status == 200 and data["valid"] is True, f"DRM Heartbeat failed: {status}"
    print("[PASS] 10. DRM Playback Heartbeat (POST /api/v1/stream/heartbeat)")
    passed += 1

    # 10. Cart Management
    status, data = request("GET", "/api/v1/cart/")
    assert status == 200 and data["items_count"] >= 1, f"Cart list failed: {status}"
    print(f"[PASS] 11. Shopping Cart (GET /api/v1/cart/) -> Subtotal: {data['subtotal']:,} Tomans")
    passed += 1

    # 11. Coupon Engine Validation (HEKMAT1403: 20%)
    status, data = request("POST", "/api/v1/coupons/validate", {
        "code": "HEKMAT1403",
        "cart_total": 1000000
    })
    assert status == 200 and data["discount_amount"] == 200000, f"Coupon failed: {status}"
    print(f"[PASS] 12. Coupon Engine (POST /api/v1/coupons/validate) -> HEKMAT1403 applied: -{data['discount_amount']:,} Tomans")
    passed += 1

    # 12. Order Submission & 24-Digit Iran Post Barcode
    status, data = request("POST", "/api/v1/orders/create", {
        "items": [
            {
                "item_id": "book-ishraq-1",
                "item_type": "book_physical",
                "title": "نور و شهود در حکمت اشراق",
                "price": 390000,
                "quantity": 1
            }
        ],
        "shipping_address": "Tehran, Enghelab Ave, Faculty of Philosophy",
        "postal_code": "1417466191",
        "recipient_name": "Ali Mousavi",
        "recipient_phone": "09123456789",
        "coupon_code": "HEKMAT1403"
    })
    assert status == 200 and data["postal_barcode_24digit"] is not None, f"Order create failed: {status}"
    assert len(data["postal_barcode_24digit"]) == 24, "Postal barcode must be 24 digits"
    print(f"[PASS] 13. Order Creation & Logistics (POST /api/v1/orders/create)")
    print(f"       -> Order ID: {data['order_id']}")
    print(f"       -> 24-Digit Iran Post Barcode: {data['postal_barcode_24digit']}")
    passed += 1

    # 13. Postal Tracking
    barcode = data["postal_barcode_24digit"]
    status, track = request("GET", f"/api/v1/orders/track/{barcode}")
    assert status == 200, f"Track failed: {status}"
    print(f"[PASS] 14. Iran Post 24-Digit Tracking (GET /api/v1/orders/track/{barcode})")
    passed += 1

    # 14. Shaparak Payment Gateway
    auth_headers = {"Authorization": f"Bearer {token}"}
    status, pay_init = request("POST", "/api/v1/payment/init", {
        "order_id": data["order_id"],
        "gateway": "zarinpal",
        "return_url": "http://localhost:3000/checkout/callback"
    }, headers=auth_headers)
    assert status == 200 and "shaparak.ir" in pay_init["gateway_redirect_url"], f"Payment init failed: {status}"
    print(f"[PASS] 15. Shaparak Gateway Init (POST /api/v1/payment/init) -> Token: {pay_init['payment_token']}")
    passed += 1

    # 15. Shaparak Payment Verification
    status, receipt = request("POST", "/api/v1/payment/verify", {
        "authority": pay_init["payment_token"],
        "status": "OK"
    }, headers=auth_headers)
    assert status == 200 and receipt["success"] is True, f"Payment verify failed: {status}"
    print(f"[PASS] 16. Shaparak Digital Receipt (POST /api/v1/payment/verify) -> Ref: {receipt['reference_id']}")
    passed += 1

    # 16. Student Study Notebook
    status, note = request("POST", "/api/v1/notes/create", {
        "course_id": "course-ishraq",
        "chapter_id": 1,
        "title": "نکته درباره انوار قاهره",
        "content": "شیخ اشراق نور را شیء بالذات آشکار می‌داند.",
        "timestamp_sec": 420
    }, headers=auth_headers)
    assert status == 200 and note["id"].startswith("note-"), f"Note create failed: {status}"
    print(f"[PASS] 17. Student Study Notebook (POST /api/v1/notes/create) -> {note['id']}")
    passed += 1

    # 17. Scholarly Q&A Discussions
    status, qa = request("POST", "/api/v1/qa/ask", {
        "course_id": "course-ishraq",
        "chapter_id": 1,
        "title": "پرسش در باب اصالت نور",
        "question_text": "آیا نور در دیدگاه سهروردی با وجود در حکمت صدرایی انطباق مصداقی دارد؟"
    }, headers=auth_headers)
    assert status == 200 and qa["id"].startswith("qa-"), f"QA ask failed: {status}"
    print(f"[PASS] 18. Scholarly Q&A Submission (POST /api/v1/qa/ask) -> {qa['id']}")
    passed += 1

    # 18. Admin Cockpit KPI Analytics
    adm_pass = os.getenv("ADMIN_INITIAL_PASSWORD", "Admin_Secure_Initial_Pass_1403!")
    adm_status, adm_data = request("POST", "/api/v1/auth/login", {"phone": "09120000000", "password": adm_pass})
    if adm_status != 200:
        adm_status, adm_data = request("POST", "/api/v1/auth/login", {"phone": "09120000000", "password": "admin_secret_2026"})
    assert adm_status == 200, f"Admin login failed: {adm_status}"
    admin_auth_headers = {"Authorization": f"Bearer {adm_data['access_token']}"}

    status, analytics = request("GET", "/api/v1/admin/analytics", headers=admin_auth_headers)
    assert status == 200 and analytics["total_students"] >= 1000, f"Admin analytics failed: {status}"
    print(f"[PASS] 19. Admin Analytics (GET /api/v1/admin/analytics) -> {analytics['total_students']} students, {analytics['total_revenue_tomans']} Tomans")
    passed += 1

    # 19. Phase 9: Admin RBAC 403 Forbidden Enforcement on Student Role
    status, denied = request("POST", "/api/v1/admin/courses/create", {
        "title": "دوره غیرمجاز دانشجو",
        "instructor": "حجت الاسلام دکتر زنجیر زن حسینی",
        "price": "رایگان"
    }, headers=auth_headers)
    assert status == 403, f"Expected 403 for student accessing admin create course, got {status}"
    anon_status, _ = request("GET", "/api/v1/admin/analytics")
    assert anon_status == 401, f"Expected 401 for anonymous /admin/analytics, got {anon_status}"
    print("[PASS] 20. Admin RBAC 403 Forbidden on Student Access (POST /api/v1/admin/courses/create)")
    passed += 1

    # 20. Phase 9: RFC 7233 Audio Range Partial Streaming (HTTP 206)
    range_status, range_data, range_resp_headers = request(
        "GET",
        f"/api/v1/stream/audio/course-ishraq/1?token={drm_token}",
        headers={"Range": "bytes=0-1023"},
        return_headers=True
    )
    assert range_status == 206, f"Expected 206 for Range audio stream, got {range_status}"
    assert "content-range" in range_resp_headers or "Content-Range" in range_resp_headers
    assert range_resp_headers.get("accept-ranges") == "bytes" or range_resp_headers.get("Accept-Ranges") == "bytes"
    print(f"[PASS] 21. RFC 7233 Audio Range Partial Content (GET /api/v1/stream/audio/...) -> HTTP 206")
    passed += 1

    # 21. Phase 9: Shaparak Payment Replay Attack Defense (HTTP 400)
    replay_status, replay_data = request("POST", "/api/v1/payment/verify", {
        "authority": pay_init["payment_token"],
        "status": "OK"
    }, headers=auth_headers)
    assert replay_status == 400, f"Expected 400 for payment replay attack, got {replay_status}"
    print("[PASS] 22. Shaparak Payment Replay Attack Defense (POST /api/v1/payment/verify) -> HTTP 400")
    passed += 1

    # 22. Phase 9: Expired & Inactive Promotional Coupons Rejection (HTTP 400)
    exp_status, exp_data = request("POST", "/api/v1/coupons/validate", {
        "code": "EXPIRED1402",
        "cart_total": 500000
    })
    assert exp_status == 400, f"Expected 400 for expired coupon, got {exp_status}"
    inact_status, inact_data = request("POST", "/api/v1/coupons/validate", {
        "code": "INACTIVE10",
        "cart_total": 500000
    })
    assert inact_status == 400, f"Expected 400 for inactive coupon, got {inact_status}"
    print("[PASS] 23. Expired & Inactive Coupon Rejection (POST /api/v1/coupons/validate) -> HTTP 400")
    passed += 1

    # 23. Phase 9: Student Study Notes CRUD & Lifecycle
    status, notes_list = request("GET", "/api/v1/notes/", headers=auth_headers)
    assert status == 200 and any(n["id"] == note["id"] for n in notes_list), "Created study note not found in list"
    up_status, updated_note = request("PUT", f"/api/v1/notes/{note['id']}", {
        "title": "نکته درباره انوار قاهره (ویرایش جدید)",
        "timestamp_sec": 425
    }, headers=auth_headers)
    assert up_status == 200 and updated_note["title"] == "نکته درباره انوار قاهره (ویرایش جدید)"
    del_status, del_res = request("DELETE", f"/api/v1/notes/{note['id']}", headers=auth_headers)
    assert del_status == 200 and del_res["success"] is True
    print(f"[PASS] 24. Student Study Notes Full Lifecycle (List, Update, Delete) -> {note['id']}")
    passed += 1

    # 24. Phase 9: Scholarly Q&A Student Answer Block (403) and Admin Resolution (200)
    stud_ans_status, _ = request("POST", f"/api/v1/qa/{qa['id']}/answer", {
        "answer_text": "پاسخ غیرمجاز توسط دانشجو"
    }, headers=auth_headers)
    assert stud_ans_status == 403, f"Expected 403 for student answering Q&A, got {stud_ans_status}"

    adm_ans_status, adm_ans = request("POST", f"/api/v1/qa/{qa['id']}/answer", {
        "answer_text": "نور در حکمت اشراق ظاهر بالذات و مظهر للغیر است و با اصالت وجود صدرایی در مراتب عینی قرابت دارد."
    }, headers=admin_auth_headers)
    assert adm_ans_status == 200 and adm_ans["is_resolved"] is True
    print(f"[PASS] 25. Scholarly Q&A RBAC Answer Enforcement (Student 403 / Admin 200) -> {qa['id']}")
    passed += 1

    print("==================================================")
    print(f"ALL {passed} INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
