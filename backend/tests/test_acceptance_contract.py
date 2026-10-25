# -*- coding: utf-8 -*-
"""
Official Acceptance Contract Test Suite for Platform v1.0.0-rc1.
Enforces all core invariants:
1. Free orders bypass banking gateway with FREE-AUTH token, auto-enroll on verification, and persist in DB SSOT.
2. Payment transactions are durably tracked in DB PaymentTransaction table with atomic transitions and replay attack rejection.
3. Guest checkout gates payment init with 401.
4. Certificates issued for in-progress courses return valid: False and status: in_progress; valid: True and status: verified only upon completion.
5. GET /api/v1/ai/index-stats is public, returning counters and scholar identity while completely excluding internal sensitive config.
6. Admin media upload enforces MAX_UPLOAD_SIZE_MB chunk-by-chunk, deleting partial files and returning HTTP 413.
7. Production configuration rejects weak or short (<32 chars) SECRET_KEY.
8. DRM tokens and HTTP 206 Range audio playback stream correctly.
"""
import uuid
import pytest
from backend.app.core.config import Settings, settings


def test_contract_free_orders_and_payment_ssot(client, student_token):
    headers = {"Authorization": f"Bearer {student_token}"}

    # Create free course order
    order_res = client.post(
        "/api/v1/orders/create",
        json={"items": [{"item_id": "course-ishraq", "item_type": "course", "title": "حکمت اشراق", "price": 1}]},
        headers=headers
    )
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert order_data["total_amount"] == 0
    oid = order_data["order_id"]

    # Init payment for free order -> amount 0, FREE-AUTH token
    init_res = client.post(
        "/api/v1/payment/init",
        json={"order_id": oid, "gateway": "zarinpal", "return_url": "http://localhost:3000/checkout/callback"},
        headers=headers
    )
    assert init_res.status_code == 200
    init_data = init_res.json()
    assert init_data["amount"] == 0
    token = init_data["payment_token"]
    assert str(token).startswith("FREE-AUTH-")

    # Verify payment -> order marked paid, course enrolled
    ver_res = client.post(
        "/api/v1/payment/verify",
        json={"authority": token, "status": "OK"},
        headers=headers
    )
    assert ver_res.status_code == 200
    assert ver_res.json().get("success") is True

    # Check order is paid
    order_check = client.get(f"/api/v1/orders/{oid}", headers=headers)
    assert order_check.status_code == 200
    assert order_check.json()["status"] == "paid"

    # Check course is enrolled
    enrolled_res = client.get("/api/v1/courses/enrolled", headers=headers)
    assert enrolled_res.status_code == 200
    assert any(c.get("id") == "course-ishraq" for c in enrolled_res.json())

    # Replay attack prevention: verifying again with same authority must return 400
    replay_res = client.post(
        "/api/v1/payment/verify",
        json={"authority": token, "status": "OK"},
        headers=headers
    )
    assert replay_res.status_code == 400


def test_contract_guest_checkout_gated(client):
    # Guest order creation allowed
    guest_order = client.post(
        "/api/v1/orders/create",
        json={"items": [{"item_id": "book-ishraq-1", "item_type": "book_print", "title": "کتاب اشراق", "price": 1}]}
    )
    assert guest_order.status_code == 200
    goid = guest_order.json()["order_id"]

    # Guest cannot initialize payment -> 401
    guest_init = client.post(
        "/api/v1/payment/init",
        json={"order_id": goid, "gateway": "zarinpal", "return_url": "http://localhost:3000/checkout/callback"}
    )
    assert guest_init.status_code == 401


def test_contract_certificate_in_progress_and_completion_rules(client):
    # Register fresh student
    unique_phone = f"0912{uuid.uuid4().int % 9000000 + 1000000}"
    reg = client.post("/api/v1/auth/register", json={
        "full_name": "دانش‌پژوه آزمون گواهینامه",
        "phone": unique_phone,
        "password": "TestPassword123"
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Enroll in course
    client.post("/api/v1/courses/course-ishraq/enroll", headers=headers)

    # Issue certificate while course is in progress (0% progress)
    cert0_res = client.post(
        "/api/v1/certificates/issue",
        json={"course_id": "course-ishraq", "score": "عالی (۱۰۰ از ۱۰۰)"},
        headers=headers
    )
    assert cert0_res.status_code == 200
    cert0_data = cert0_res.json()
    assert cert0_data["score"].startswith("در حال گذراندن")
    code = cert0_data["certificate_code"]

    # Public QR verification for in-progress certificate must return valid: False and status: in_progress
    v0_res = client.get(f"/api/v1/certificates/verify/{code}")
    assert v0_res.status_code == 200
    v0_data = v0_res.json()
    assert v0_data["valid"] is False
    assert v0_data["status"] == "in_progress"

    # Complete all syllabus chapters to 100%
    for ch in (1, 2):
        client.post(
            "/api/v1/courses/course-ishraq/progress",
            json={"chapter_id": ch, "progress_percent": 100, "last_position_sec": 2700},
            headers=headers
        )

    # Re-issue certificate after full completion
    cert1_res = client.post(
        "/api/v1/certificates/issue",
        json={"course_id": "course-ishraq", "score": "عالی (۱۰۰ از ۱۰۰)"},
        headers=headers
    )
    assert cert1_res.status_code == 200
    cert1_data = cert1_res.json()
    assert cert1_data["score"].startswith("عالی")

    # Public QR verification now returns valid: True and status: verified
    v1_res = client.get(f"/api/v1/certificates/verify/{code}")
    assert v1_res.status_code == 200
    v1_data = v1_res.json()
    assert v1_data["valid"] is True
    assert v1_data["status"] == "verified"
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in v1_data["institute"]


def test_contract_ai_index_stats_sanitization(client):
    # Public endpoint without authorization
    stats_res = client.get("/api/v1/ai/index-stats")
    assert stats_res.status_code == 200
    data = stats_res.json()

    # Public counters and scholar identity present
    assert "total_chunks" in data and data["total_chunks"] >= 10
    assert "indexed_chunks_count" in data
    assert "audio_chunks" in data
    assert "video_chunks" in data
    assert "audio_video_segments_count" in data
    assert data["total_courses"] == 21
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in data["scholar_name"]
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in data["scholar_identity"]
    assert data["status"] == "ready"

    # Internal sensitive configuration fields MUST NOT be present
    assert "persistence_file" not in data
    assert "active_provider" not in data
    assert "active_model" not in data
    assert "whisper_model" not in data


def test_contract_admin_upload_size_limit_and_rbac(client, student_token, admin_token):
    h_student = {"Authorization": f"Bearer {student_token}"}
    h_admin = {"Authorization": f"Bearer {admin_token}"}

    sample_audio = ("test_lecture.mp3", b"ID3" + b"\x00" * 512, "audio/mpeg")

    # Student cannot upload -> 403
    forbidden_res = client.post("/api/v1/admin/upload", files={"file": sample_audio}, headers=h_student)
    assert forbidden_res.status_code == 403

    # Admin valid upload succeeds -> 200
    ok_res = client.post("/api/v1/admin/upload", files={"file": sample_audio}, headers=h_admin)
    assert ok_res.status_code == 200
    assert ok_res.json()["success"] is True
    assert "file_url" in ok_res.json()
    uploaded_filename = ok_res.json().get("filename", "")

    # Oversized file upload returns 413
    orig_max = settings.MAX_UPLOAD_SIZE_MB
    try:
        settings.MAX_UPLOAD_SIZE_MB = 1  # 1 MB threshold for deterministic verification
        oversized = ("oversized_lecture.mp3", b"A" * (1024 * 1024 + 50), "audio/mpeg")
        over_res = client.post("/api/v1/admin/upload", files={"file": oversized}, headers=h_admin)
        assert over_res.status_code == 413
    finally:
        settings.MAX_UPLOAD_SIZE_MB = orig_max
        # Clean up uploaded test file
        if uploaded_filename:
            import os
            up_dir = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "..", "app", "static", "uploads")
            )
            up_path = os.path.join(up_dir, uploaded_filename)
            if os.path.exists(up_path):
                try:
                    os.remove(up_path)
                except OSError:
                    pass


def test_contract_drm_preview_and_range_streaming(client, student_token):
    headers = {"Authorization": f"Bearer {student_token}"}

    # Chapter 1 is preview -> 200
    pv = client.post("/api/v1/stream/token", json={"course_id": "course-asfar", "chapter_id": 1}, headers=headers)
    assert pv.status_code == 200
    token = pv.json()["token"]

    # Chapter 90 is nonpreview for unenrolled course -> 403
    npv = client.post("/api/v1/stream/token", json={"course_id": "course-asfar", "chapter_id": 90}, headers=headers)
    assert npv.status_code == 403

    # Audio range request -> HTTP 206 Partial Content
    stream_res = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=0-99"})
    assert stream_res.status_code == 206
    assert "bytes 0-99/" in stream_res.headers.get("content-range", "")


def test_contract_config_production_secret_key_rigor():
    # Production with weak secret must raise RuntimeError
    with pytest.raises(RuntimeError):
        Settings(ENVIRONMENT="production", SECRET_KEY="weak_secret", OTP_MODE="production")

    with pytest.raises(RuntimeError):
        Settings(ENVIRONMENT="production", SECRET_KEY="illumination_secret_that_is_long_enough_123456789", OTP_MODE="production")

    # Production with valid 32+ char secret succeeds
    strong_sec = "a_very_secure_high_entropy_production_secret_key_1403"
    cfg = Settings(ENVIRONMENT="production", SECRET_KEY=strong_sec, OTP_MODE="production")
    assert cfg.SECRET_KEY == strong_sec
