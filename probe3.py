# -*- coding: utf-8 -*-
"""Post-fix verification probe (probe3)."""
import os
import sys
import json

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./probe3.db"
os.environ["ENVIRONMENT"] = "test"
os.environ["OTP_MODE"] = "development"
os.environ["PAYMENT_MODE"] = "sandbox"
for db_f in ["probe3.db", "probe3.db-shm", "probe3.db-wal"]:
    if os.path.exists(db_f):
        try:
            os.remove(db_f)
        except Exception:
            pass
sys.path.insert(0, r"E:\personal\philosophy_zanjirzan_app")

from fastapi.testclient import TestClient  # noqa: E402
from backend.app.main import app  # noqa: E402

out = {}


def rec(name, r, keep=None):
    try:
        b = r.json()
    except Exception:
        b = r.text[:120]
    if isinstance(b, dict):
        keys = keep or list(b)[:6]
        b = {k: b.get(k) for k in keys if k in b}
    out[name] = {"status": r.status_code, "body": b}


with TestClient(app, raise_server_exceptions=False) as c:
    rec("01_anon_stream_token", c.post("/api/v1/stream/token", json={
        "user_id": "x", "course_id": "course-asfar", "chapter_id": 3}))

    rec("02_anon_payment_init", c.post("/api/v1/payment/init", json={
        "order_id": "ORD-x", "gateway": "zarinpal", "return_url": "http://x"}))
    rec("03_anon_payment_verify", c.post("/api/v1/payment/verify", json={
        "authority": "X", "status": "OK"}))

    admin = c.post("/api/v1/auth/login", json={
        "phone": "09120000000", "password": "admin_secret_2026"})
    rec("04_admin_login", admin, ["role", "id"])
    ah = {"Authorization": f"Bearer {(admin.json() or {}).get('access_token','')}"}

    stu = c.post("/api/v1/auth/register", json={
        "full_name": "Probe Student", "phone": "09129998877", "password": "Probe12345"})
    rec("05_register", stu, ["id", "role"])
    sh = {"Authorization": f"Bearer {(stu.json() or {}).get('access_token','')}"}

    rec("06_otp_without_request", c.post("/api/v1/auth/otp/verify", json={
        "phone": "09121234567", "code": "123456"}), ["detail", "message"])

    order = c.post("/api/v1/orders/create", json={
        "items": [{"item_id": "book-ishraq-1", "item_type": "book_physical",
                   "title": "x", "price": 1, "quantity": 1}]}, headers=sh)
    rec("07_physical_price", order, ["order_id", "total_amount"])
    oid = (order.json() or {}).get("order_id", "")

    rec("08_order_read_by_other_user", c.get(f"/api/v1/orders/{oid}"), ["detail"])
    rec("09_order_read_by_owner", c.get(f"/api/v1/orders/{oid}", headers=sh), ["order_id", "total_amount"])

    rec("10_payment_init_anonymous_owner", c.post("/api/v1/payment/init", json={
        "order_id": oid, "gateway": "zarinpal", "return_url": "http://localhost:3000/checkout/callback"},
        headers=sh), ["payment_token", "amount"])

    rec("11_admin_add_chapter", c.post("/api/v1/admin/courses/course-asfar/chapters",
        json={"title": "جلسه تست", "duration": "45:00"}, headers=ah), ["success"])
    rec("12_catalog_after_add", c.get("/api/v1/courses/"), [])

    rec("13_preview_token_non_enrolled", c.post("/api/v1/stream/token", json={
        "user_id": "x", "course_id": "course-asfar", "chapter_id": 1}, headers=sh), ["detail"])

    c.post("/api/v1/courses/course-asfar/enroll", headers=sh)
    tok = c.post("/api/v1/stream/token", json={
        "course_id": "course-asfar", "chapter_id": 1}, headers=sh)
    rec("14_token_after_enroll", tok, ["token"])
    token = (tok.json() or {}).get("token", "")
    r = c.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=0-99"})
    out["15_audio_range_enrolled"] = {"status": r.status_code,
                                      "content_range": r.headers.get("content-range")}

    hb = c.post("/api/v1/stream/heartbeat", json={
        "token": token, "user_id": "attacker", "course_id": "course-asfar",
        "chapter_id": 1, "playback_position_sec": 5})
    rec("16_heartbeat_foreign_uid", hb, ["valid", "watermark"])

    rec("17_cert_self_issue", c.post("/api/v1/certificates/issue",
        json={"course_id": "course-asfar", "score": "نمره ۱۰۰"}, headers=sh), ["score"])

    rec("18_ai_transcribe_anon", c.post("/api/v1/ai/transcribe",
        json={"audio_base64": "x" * 200, "format": "webm"}), ["text", "confidence"])

print("\n===== PROBE3 =====")
print(json.dumps(out, ensure_ascii=False, indent=2))
