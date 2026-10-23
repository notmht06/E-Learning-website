# -*- coding: utf-8 -*-
"""
Auditor M4 Independent Forensic & Adversarial Verification Script
"""
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def run_auditor_forensic_checks():
    print("==================================================")
    print("FORENSIC AUDITOR INDEPENDENT ADVERSARIAL CHECKS")
    print("==================================================")

    # 1. Single byte Range: bytes=0-0
    token_res = client.post("/api/v1/stream/token", json={"user_id": "usr-test-auditor", "course_id": "course-ishraq", "chapter_id": 1})
    assert token_res.status_code == 200
    drm_token = token_res.json()["token"]

    res_single = client.get(f"/api/v1/stream/audio/course-ishraq/1?token={drm_token}", headers={"Range": "bytes=0-0"})
    assert res_single.status_code == 206, f"Expected 206, got {res_single.status_code}"
    assert len(res_single.content) == 1, f"Expected 1 byte, got {len(res_single.content)}"
    assert "bytes 0-0/" in res_single.headers.get("Content-Range", "")
    print("✅ Single byte range (bytes=0-0) correctly returned 206 with 1 byte.")

    # 2. RBAC: Student answering QA receives 403 regardless of whether QA exists or not (Anti-Enumeration)
    reg_stu = client.post("/api/v1/auth/register", json={"full_name": "دانشجو مستقل", "phone": "09199990001", "password": "Password123!"})
    stu_tok = reg_stu.json().get("access_token") or client.post("/api/v1/auth/login", json={"phone": "09199990001", "password": "Password123!"}).json()["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_tok}"}

    res_enum = client.post("/api/v1/qa/qa-definitely-does-not-exist-9999/answer", json={"answer_text": "تست نفوذ"}, headers=stu_headers)
    assert res_enum.status_code == 403, f"Expected 403 (RBAC before 404), got {res_enum.status_code}"
    print("✅ RBAC precedence verified: Student receives 403 before existence check (prevents enumeration).")

    # 3. Note isolation: Student B updating non-existent note vs Student A's note
    note_create = client.post("/api/v1/notes/create", json={
        "course_id": "course-ishraq",
        "chapter_id": 1,
        "title": "یادداشت امنیتی الف",
        "content": "متن حاشیه‌نویسی محرمانه",
        "timestamp_sec": 100
    }, headers=stu_headers)
    assert note_create.status_code == 200
    created_note_id = note_create.json()["id"]

    reg_stu2 = client.post("/api/v1/auth/register", json={"full_name": "دانشجو مهاجم", "phone": "09199990002", "password": "Password123!"})
    stu2_tok = reg_stu2.json().get("access_token") or client.post("/api/v1/auth/login", json={"phone": "09199990002", "password": "Password123!"}).json()["access_token"]
    stu2_headers = {"Authorization": f"Bearer {stu2_tok}"}

    update_other = client.put(f"/api/v1/notes/{created_note_id}", json={"title": "سرقت"}, headers=stu2_headers)
    assert update_other.status_code == 404, f"Expected 404 for student B updating student A note, got {update_other.status_code}"
    update_nonexistent = client.put("/api/v1/notes/note-nonexistent-9999", json={"title": "تست"}, headers=stu2_headers)
    assert update_nonexistent.status_code == 404
    print("✅ Student note isolation verified: cross-user updates yield uniform 404.")

    # 4. Payment Replay Attack Prevention
    init_pay = client.post("/api/v1/payment/init", json={
        "order_id": "ORD-AUDIT-001",
        "gateway": "shaparak_sep",
        "return_url": "https://zanjirzan.ir/checkout/callback"
    })
    assert init_pay.status_code == 200
    auth_tok = init_pay.json()["payment_token"]

    v_first = client.post("/api/v1/payment/verify", json={"authority": auth_tok, "status": "OK"})
    assert v_first.status_code == 200
    v_replay = client.post("/api/v1/payment/verify", json={"authority": auth_tok, "status": "OK"})
    assert v_replay.status_code == 400
    assert "PAYMENT_REPLAY_ATTACK" in v_replay.text or "قبلاً تایید شده است" in v_replay.text
    print("✅ Payment replay attack defense verified: second verification rejected with HTTP 400.")

    print("==================================================")
    print("ALL AUDITOR FORENSIC ADVERSARIAL CHECKS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_auditor_forensic_checks()
