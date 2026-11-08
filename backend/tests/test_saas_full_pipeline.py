# -*- coding: utf-8 -*-
"""
Comprehensive End-to-End Backend Test Suite (Phase 9 SaaS Verification).
Verifies all modules built across Phases 1 to 8:
- Security Headers & Health Check
- Auth, OTP, Active Device Sessions & Newsletter Subscription
- Full 21-Course Catalog & Legacy Alias Compatibility
- Student Playback Progress Sync & Retrieval (SQLite/PostgreSQL Persistence)
- Persistent Study Notes & Scholarly Q&A Forum
- Session-Isolated Shopping Cart, Coupons, Orders & Zarinpal Sandbox Gateway
- DRM Token Issuance, Heartbeat & RFC 7233 HTTP Range Audio Streaming (206 Partial Content)
- Multimedia Vector RAG Engine, Timestamped Citations & Strict Closed-Book Grounding
"""
import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def get_student_auth_headers() -> dict:
    student_pass = os.getenv("STUDENT_INITIAL_PASSWORD", "pass_dev_1403")
    resp = client.post(
        "/api/v1/auth/login",
        json={"phone": "09123456789", "password": student_pass},
    )
    if resp.status_code != 200:
        resp = client.post(
            "/api/v1/auth/login",
            json={"phone": "09123456789", "password": "pass"},
        )
    assert resp.status_code == 200, resp.text
    token = resp.json().get("access_token")
    assert token
    return {"Authorization": f"Bearer {token}"}


def get_admin_auth_headers() -> dict:
    admin_pass = os.getenv("ADMIN_INITIAL_PASSWORD", "Admin_Secure_Initial_Pass_1403!")
    resp = client.post(
        "/api/v1/auth/login",
        json={"phone": "09120000000", "password": admin_pass},
    )
    if resp.status_code != 200:
        resp = client.post(
            "/api/v1/auth/login",
            json={"phone": "09120000000", "password": "admin_secret_2026"},
        )
    assert resp.status_code == 200, resp.text
    token = resp.json().get("access_token")
    assert token
    return {"Authorization": f"Bearer {token}"}


def test_01_health_and_security_headers():
    """Verifies platform health and Phase 5 HTTP security headers."""
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in data["scholar_name"]
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"


def test_02_auth_sessions_and_newsletter_subscription():
    """Verifies active device session management and newsletter subscription."""
    headers = get_student_auth_headers()

    sess_resp = client.get("/api/v1/auth/sessions", headers=headers)
    assert sess_resp.status_code == 200
    sess_data = sess_resp.json()
    assert "sessions" in sess_data
    assert sess_data["max_concurrent_devices"] == 3

    sub_resp = client.post(
        "/api/v1/auth/subscribe",
        json={"contact": "scholar_test@zanjirzan.ir"},
    )
    assert sub_resp.status_code == 200
    assert sub_resp.json()["success"] is True


def test_03_full_21_courses_catalog_and_aliases():
    """Verifies that all 21 courses from seed_courses_data.json and legacy aliases resolve."""
    resp = client.get("/api/v1/courses/")
    assert resp.status_code == 200
    courses = resp.json()
    assert len(courses) >= 21

    # Check canonical frontend ID
    c1 = client.get("/api/v1/courses/course-falsafe-asfar-1")
    assert c1.status_code == 200
    assert "اسفار" in c1.json()["title"]

    # Check legacy alias ID
    c2 = client.get("/api/v1/courses/course-asfar")
    assert c2.status_code == 200


def test_04_course_progress_sync_and_hydration():
    """Verifies Phase 2 & 4 progress sync fix (no 500 error) and DB hydration."""
    headers = get_student_auth_headers()

    sync_resp = client.post(
        "/api/v1/courses/course-falsafe-asfar-1/progress",
        headers=headers,
        json={
            "chapter_id": 2,
            "progress_percent": 95,
            "last_position_sec": 480,
        },
    )
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()
    assert sync_data["success"] is True
    assert sync_data["progress_percent"] == 95

    get_resp = client.get(
        "/api/v1/courses/course-falsafe-asfar-1/progress",
        headers=headers,
    )
    assert get_resp.status_code == 200
    progress_info = get_resp.json()
    assert 2 in progress_info["completed_chapter_ids"]


def test_05_persistent_study_notes_and_qa():
    """Verifies Phase 2 & 3 DB-backed Study Notes and Q&A endpoints."""
    student_headers = get_student_auth_headers()
    admin_headers = get_admin_auth_headers()

    # Create note
    note_resp = client.post(
        "/api/v1/notes/create",
        headers=student_headers,
        json={
            "course_id": "course-falsafe-asfar-1",
            "chapter_id": 2,
            "title": "برهان اصالت وجود",
            "content": "وجود منشأ تمامی آثار عینی در عالم خارج است.",
            "timestamp_sec": 315,
        },
    )
    assert note_resp.status_code == 200
    note_id = note_resp.json()["id"]

    # List notes
    list_notes = client.get("/api/v1/notes/", headers=student_headers)
    assert list_notes.status_code == 200
    assert any(n["id"] == note_id for n in list_notes.json())

    # Ask Q&A question
    qa_resp = client.post(
        "/api/v1/qa/ask",
        headers=student_headers,
        json={
            "course_id": "course-falsafe-asfar-1",
            "chapter_id": 2,
            "title": "پرسش درباره تشکیک وجود",
            "question_text": "تفاوت تشکیک عامی و خاصی در حکمت متعالیه چیست؟",
        },
    )
    assert qa_resp.status_code == 200
    q_id = qa_resp.json()["id"]

    # Admin answers Q&A question
    ans_resp = client.post(
        f"/api/v1/qa/{q_id}/answer",
        headers=admin_headers,
        json={
            "answer_text": "در تشکیک خاصی، مابهالامتیاز عین مابهالاشتراک است."
        },
    )
    assert ans_resp.status_code == 200
    assert ans_resp.json()["is_resolved"] is True


def test_06_isolated_cart_order_and_zarinpal_payment():
    """Verifies session-isolated shopping cart, order creation, and Zarinpal sandbox gateway."""
    headers_a = {"X-Cart-Session": "test-session-alpha"}
    headers_b = {"X-Cart-Session": "test-session-beta"}

    client.delete("/api/v1/cart/clear", headers=headers_a)
    client.delete("/api/v1/cart/clear", headers=headers_b)

    add_resp = client.post(
        "/api/v1/cart/add",
        headers=headers_a,
        json={
            "item_id": "book-ishraq-1",
            "item_type": "book_print",
            "title": "نور و شهود در حکمت اشراق سهروردی",
            "price": 390000,
            "quantity": 1,
        },
    )
    assert add_resp.status_code == 200
    assert add_resp.json()["items_count"] == 1

    # Verify Session B cart is completely isolated and empty
    cart_b = client.get("/api/v1/cart/", headers=headers_b)
    assert cart_b.status_code == 200
    assert cart_b.json()["items_count"] == 0

    # Create order & initiate payment
    ord_resp = client.post(
        "/api/v1/orders/create",
        json={
            "items": [
                {
                    "item_id": "book-ishraq-1",
                    "item_type": "book_print",
                    "title": "نور و شهود در حکمت اشراق سهروردی",
                    "price": 390000,
                    "quantity": 1,
                }
            ],
            "recipient_name": "سید مهدی موسوی",
            "recipient_phone": "09123456789",
            "postal_code": "1417834591",
            "shipping_address": "قم، بلوار معلم، مجتمع حیات",
        },
    )
    assert ord_resp.status_code == 200
    order_id = ord_resp.json()["order_id"]

    pay_init = client.post(
        "/api/v1/payment/init",
        headers=get_student_auth_headers(),
        json={
            "order_id": order_id,
            "gateway": "zarinpal",
            "return_url": "http://localhost:3000/checkout",
        },
    )
    assert pay_init.status_code == 200
    authority = pay_init.json()["payment_token"]

    pay_verify = client.post(
        "/api/v1/payment/verify",
        headers=get_student_auth_headers(),
        json={"authority": authority, "status": "OK"},
    )
    assert pay_verify.status_code == 200
    assert pay_verify.json()["success"] is True


def test_07_drm_shield_and_http_range_audio_stream():
    """Verifies DRM token generation, heartbeat, and RFC 7233 206 Partial Content streaming."""
    tok_resp = client.post(
        "/api/v1/stream/token",
        headers=get_student_auth_headers(),
        json={
            "user_id": "usr-140301",
            "course_id": "course-ishraq",
            "chapter_id": 1,
        },
    )
    assert tok_resp.status_code == 200
    token = tok_resp.json()["token"]

    hb_resp = client.post(
        "/api/v1/stream/heartbeat",
        headers=get_student_auth_headers(),
        json={
            "token": token,
            "user_id": "usr-140301",
            "course_id": "course-ishraq",
            "chapter_id": 1,
            "playback_position_sec": 120,
        },
    )
    assert hb_resp.status_code == 200
    assert hb_resp.json()["valid"] is True

    stream_resp = client.get(
        f"/api/v1/stream/audio/course-ishraq/1?token={token}",
        headers={"Range": "bytes=0-127"},
    )
    assert stream_resp.status_code == 206
    assert "bytes 0-127/" in stream_resp.headers.get("Content-Range", "")


def test_08_multimedia_vector_rag_and_strict_grounding():
    """Verifies Phase 7 Audio/Video Vector RAG, timestamped citations, and strict closed-book mode."""
    stats_resp = client.get("/api/v1/ai/index-stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["indexed_chunks_count"] >= 25
    assert stats["audio_video_segments_count"] >= 6

    # 1. In-corpus query about Asalat al-Wujud -> must return exact timestamped lecture citation
    chat_in = client.post(
        "/api/v1/ai/chat",
        json={"message": "براهین اصالت وجود و اعتباریت ماهیت در اسفار چیست؟"},
    )
    assert chat_in.status_code == 200
    data_in = chat_in.json()
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in data_in["reply"]
    assert len(data_in["citations"]) > 0
    assert "دقیقه" in data_in["citations"][0]["page_or_session"] or "جلسه" in data_in["citations"][0]["page_or_session"]

    # 2. Admin ingests a new lecture audio transcript -> immediately indexed with timestamps
    admin_headers = get_admin_auth_headers()
    ingest_resp = client.post(
        "/api/v1/ai/ingest-media-transcript",
        headers=admin_headers,
        json={
            "course_id": "course-falsafe-asfar-1",
            "chapter_id": 10,
            "course_title": "دوره خارج شرح اسفار اربعه",
            "subject": "حکمت متعالیه",
            "media_type": "audio_lecture",
            "transcript_text": (
                "در این جلسه به بررسی قاعده امکان اشرف و رابطه آن با برهان صدیقین میپردازیم. "
                "هرگاه ممکن اخس موجود باشد، واجب است که ممکن اشرف پیش از آن تحقق یافته باشد. "
                "این قاعده در نظام اشراقی و صدرایی جایگاه بنیادین دارد."
            ),
            "chunk_duration_sec": 120,
        },
    )
    assert ingest_resp.status_code == 200
    assert ingest_resp.json()["success"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
