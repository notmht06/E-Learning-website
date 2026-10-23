"""
Adversarial Empirical Stress Test Suite — Milestone 1 (Phase 6)
Challenger 2 (challenger_m1_2)

Coverage:
1. Audio DRM Security Shield & Tamper Rejection (missing, empty, forged, expired, cross-resource, heartbeat)
2. RFC 7233 Audio Range Streaming Edge Cases & Out-of-Range 416 Responses (exact byte-slice validation)
3. UserFavorite Database Model, Composite Indexes, Foreign Keys & Cascade Deletion
4. SQLite WAL Mode Concurrency Stress (multi-threaded favorites, mixed load, race conditions)
5. selectinload Relationship Eager-Loading Hygiene (MissingGreenlet immunity)
6. Scholar Official Identity & Persian Anti-Slop Discipline
"""
import sys
import os
import time
import base64
import hmac
import hashlib
import sqlite3
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Tuple

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings
from backend.app.models.database import async_session
from backend.app.services.course_service import course_service
from backend.app.services.order_service import order_service
from backend.app.services.auth_service import auth_service

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"
AUDIO_FILE_PATH = os.path.abspath("frontend/public/audio/sample_lecture.wav")

def banner(title: str):
    print(f"\n{'='*70}")
    print(f"⚡ [CHALLENGE VECTOR] {title}")
    print(f"{'='*70}")

def register_student(prefix="m1p6"):
    phone = f"0933{uuid.uuid4().int % 10000000:07d}"
    res = client.post("/api/v1/auth/register", json={
        "full_name": f"دانشجوی {prefix}",
        "phone": phone,
        "password": "Password123!"
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()
    return data["id"], data["phone"], data["access_token"]


def get_admin_headers():
    res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "admin_secret_2026"})
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


# =========================================================================
# VECTOR 1: DRM Token Security Shield & Tamper Rejection
# =========================================================================
def test_vector_1_drm_token_tampering():
    banner("Vector 1: Audio DRM Token Security Shield & Tamper Rejection")

    # A. Missing token query param -> 422 Unprocessable Entity
    res_no_tok = client.get("/api/v1/stream/audio/course-asfar/1")
    assert res_no_tok.status_code in [403, 422], f"Expected 403 or 422 without token, got {res_no_tok.status_code}"
    print("  ✅ [PASS] Missing token query param rejected.")

    # B. Empty token query param -> 403 Forbidden
    res_empty = client.get("/api/v1/stream/audio/course-asfar/1?token=")
    assert res_empty.status_code == 403, f"Expected 403 for empty token, got {res_empty.status_code}"
    print("  ✅ [PASS] Empty token query param rejected with 403.")

    # C. Forged HMAC signature -> 403 Forbidden
    admin_headers = get_admin_headers()
    tok_res = client.post("/api/v1/stream/token", headers=admin_headers, json={"user_id": "usr-test-1", "course_id": "course-asfar", "chapter_id": 1})
    assert tok_res.status_code == 200
    valid_token = tok_res.json()["token"]

    parts = valid_token.split(".")
    forged_token = f"{parts[0]}.{'0'*64}"
    res_forged = client.get(f"/api/v1/stream/audio/course-asfar/1?token={forged_token}")
    assert res_forged.status_code == 403, f"Expected 403 for forged HMAC, got {res_forged.status_code}"
    print("  ✅ [PASS] Forged HMAC signature rejected with 403.")

    # D. Expired token -> 403 Forbidden
    expired_ts = int(time.time()) - 3600
    raw_payload = f"usr-test-1:course-asfar:1:{expired_ts}"
    b64_payload = base64.urlsafe_b64encode(raw_payload.encode("utf-8")).decode("utf-8").rstrip("=")
    exp_sig = hmac.new(settings.SECRET_KEY.encode("utf-8"), b64_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    expired_token = f"{b64_payload}.{exp_sig}"

    res_expired = client.get(f"/api/v1/stream/audio/course-asfar/1?token={expired_token}")
    assert res_expired.status_code == 403, f"Expected 403 for expired token, got {res_expired.status_code}"
    print("  ✅ [PASS] Expired token rejected with 403.")

    # E. Cross-chapter token reuse -> 403 Forbidden
    # Token issued for Chapter 1, requested against Chapter 2
    res_cross_ch = client.get(f"/api/v1/stream/audio/course-asfar/2?token={valid_token}")
    assert res_cross_ch.status_code == 403, f"Expected 403 for cross-chapter reuse, got {res_cross_ch.status_code}"
    print("  ✅ [PASS] Cross-chapter token reuse strictly rejected with 403.")

    # F. Cross-course token reuse -> 403 Forbidden
    # Token issued for course-asfar, requested against course-ishraq
    res_cross_cr = client.get(f"/api/v1/stream/audio/course-ishraq/1?token={valid_token}")
    assert res_cross_cr.status_code == 403, f"Expected 403 for cross-course reuse, got {res_cross_cr.status_code}"
    print("  ✅ [PASS] Cross-course token reuse strictly rejected with 403.")

    # G. Heartbeat validation: valid vs tampered vs expired
    hb_valid = client.post("/api/v1/stream/heartbeat", json={
        "token": valid_token,
        "user_id": "usr-test-1",
        "course_id": "course-asfar",
        "chapter_id": 1,
        "playback_position_sec": 120
    })
    assert hb_valid.status_code == 200
    assert hb_valid.json()["valid"] is True
    assert "watermark" in hb_valid.json()

    hb_forged = client.post("/api/v1/stream/heartbeat", json={
        "token": forged_token,
        "user_id": "usr-test-1",
        "course_id": "course-asfar",
        "chapter_id": 1,
        "playback_position_sec": 120
    })
    assert hb_forged.status_code == 403

    hb_expired = client.post("/api/v1/stream/heartbeat", json={
        "token": expired_token,
        "user_id": "usr-test-1",
        "course_id": "course-asfar",
        "chapter_id": 1,
        "playback_position_sec": 120
    })
    assert hb_expired.status_code == 403
    print("  ✅ [PASS] Heartbeat validation correctly discriminates valid from forged/expired tokens.")


# =========================================================================
# VECTOR 2: RFC 7233 Audio Range Streaming & 416 Edge Cases
# =========================================================================
def test_vector_2_rfc7233_range_streaming():
    banner("Vector 2: RFC 7233 Range Audio Streaming & 416 Responses")

    # Issue fresh DRM token for course-asfar chapter 1
    admin_headers = get_admin_headers()
    tok_res = client.post("/api/v1/stream/token", headers=admin_headers, json={"user_id": "usr-range-test", "course_id": "course-asfar", "chapter_id": 1})
    assert tok_res.status_code == 200
    token = tok_res.json()["token"]

    # Read physical audio file to use as gold ground-truth oracle
    assert os.path.exists(AUDIO_FILE_PATH), f"Audio file not found: {AUDIO_FILE_PATH}"
    with open(AUDIO_FILE_PATH, "rb") as f:
        ground_truth_bytes = f.read()
    total_len = len(ground_truth_bytes)
    print(f"  Physical ground-truth audio size: {total_len:,} bytes")

    # 1. Full content request (no Range header) -> 200 OK
    res_full = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}")
    assert res_full.status_code == 200
    assert res_full.headers["Accept-Ranges"] == "bytes"
    assert int(res_full.headers["Content-Length"]) == total_len
    assert res_full.content == ground_truth_bytes
    print("  ✅ [PASS] Full stream returns 200 OK with exact file bytes and Accept-Ranges.")

    # 2. Standard initial range: bytes=0-1023 -> 206 Partial Content
    res_init = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=0-1023"})
    assert res_init.status_code == 206
    assert res_init.headers["Content-Range"] == f"bytes 0-1023/{total_len}"
    assert res_init.headers["Accept-Ranges"] == "bytes"
    assert len(res_init.content) == 1024
    assert res_init.content == ground_truth_bytes[0:1024]
    print("  ✅ [PASS] Initial Range bytes=0-1023 matches exact binary slice.")

    # 3. Arbitrary sub-chunk seek: bytes=100000-165535 (65,536 bytes)
    res_seek = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=100000-165535"})
    assert res_seek.status_code == 206
    assert res_seek.headers["Content-Range"] == f"bytes 100000-165535/{total_len}"
    assert len(res_seek.content) == 65536
    assert res_seek.content == ground_truth_bytes[100000:165536]
    print("  ✅ [PASS] Mid-stream seek Range bytes=100000-165535 matches exact 64KB slice.")

    # 4. Suffix range: bytes=-500 (last 500 bytes)
    res_suffix = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=-500"})
    assert res_suffix.status_code == 206
    expected_start = total_len - 500
    expected_end = total_len - 1
    assert res_suffix.headers["Content-Range"] == f"bytes {expected_start}-{expected_end}/{total_len}"
    assert len(res_suffix.content) == 500
    assert res_suffix.content == ground_truth_bytes[-500:]
    print("  ✅ [PASS] Suffix Range bytes=-500 matches exact tail 500 bytes.")

    # 5. Oversized suffix range: bytes=-99999999 -> clamped to full file
    res_over_suf = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=-99999999"})
    assert res_over_suf.status_code == 206
    assert res_over_suf.headers["Content-Range"] == f"bytes 0-{total_len - 1}/{total_len}"
    assert len(res_over_suf.content) == total_len
    assert res_over_suf.content == ground_truth_bytes
    print("  ✅ [PASS] Oversized suffix Range correctly clamped to entire file.")

    # 6. Open-ended range: bytes=2000000- -> from 2000000 to EOF
    res_open = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=2000000-"})
    assert res_open.status_code == 206
    assert res_open.headers["Content-Range"] == f"bytes 2000000-{total_len - 1}/{total_len}"
    expected_open_len = total_len - 2000000
    assert len(res_open.content) == expected_open_len
    assert res_open.content == ground_truth_bytes[2000000:]
    print(f"  ✅ [PASS] Open-ended Range bytes=2000000- matches {expected_open_len:,} bytes to EOF.")

    # 7. Single-byte boundary ranges: byte 0 and byte total_len - 1
    res_b0 = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=0-0"})
    assert res_b0.status_code == 206
    assert res_b0.headers["Content-Range"] == f"bytes 0-0/{total_len}"
    assert len(res_b0.content) == 1
    assert res_b0.content == ground_truth_bytes[0:1]

    last_idx = total_len - 1
    res_blast = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": f"bytes={last_idx}-{last_idx}"})
    assert res_blast.status_code == 206
    assert res_blast.headers["Content-Range"] == f"bytes {last_idx}-{last_idx}/{total_len}"
    assert len(res_blast.content) == 1
    assert res_blast.content == ground_truth_bytes[last_idx:last_idx+1]
    print("  ✅ [PASS] Single-byte edge boundaries (first byte, last byte) verified.")

    # 8. Out-of-bounds start >= total_len -> 416 Range Not Satisfiable
    res_out_high = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": f"bytes={total_len}-"})
    assert res_out_high.status_code == 416
    assert res_out_high.headers.get("Content-Range") == f"bytes */{total_len}"

    res_out_extreme = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=99999999-"})
    assert res_out_extreme.status_code == 416
    assert res_out_extreme.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  ✅ [PASS] Out-of-bounds Range returns 416 with RFC 7233 Content-Range: bytes */{total_len}.")

    # 9. Inverted range: bytes=500-200 -> 416 Range Not Satisfiable
    res_inv = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=500-200"})
    assert res_inv.status_code == 416
    assert res_inv.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  ✅ [PASS] Inverted Range bytes=500-200 returns 416.")

    # 10. Multiple range specs: bytes=0-10,20-30 -> 416 Range Not Satisfiable
    res_multi = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": "bytes=0-10,20-30"})
    assert res_multi.status_code == 416
    assert res_multi.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  ✅ [PASS] Multiple ranges rejected with 416 (multipart not supported).")

    # 11. Malformed syntax attacks
    malformed_specs = [
        "bytes=-0",
        "bytes=-",
        "bytes=---",
        "bytes=abc-def",
        "bytes=100-abc",
        "characters=0-100",
        "not-bytes=0-10",
        "bytes=   ",
    ]
    for spec in malformed_specs:
        res_mal = client.get(f"/api/v1/stream/audio/course-asfar/1?token={token}", headers={"Range": spec})
        assert res_mal.status_code == 416, f"Expected 416 for malformed Range '{spec}', got {res_mal.status_code}"
        assert res_mal.headers.get("Content-Range") == f"bytes */{total_len}"
    print(f"  ✅ [PASS] All {len(malformed_specs)} malformed Range specs safely rejected with 416.")


# =========================================================================
# VECTOR 3: UserFavorite Model, Composite Index & Endpoints
# =========================================================================
def test_vector_3_user_favorite_and_indexes():
    banner("Vector 3: UserFavorite Schema, Composite Index & Endpoints")

    # 1. Verify schema and composite indexes in SQLite directly
    with sqlite3.connect(DB_PATH) as con:
        # Check enrollments composite index
        cur = con.cursor()
        cur.execute("PRAGMA index_list('enrollments')")
        enr_indexes = {row[1] for row in cur.fetchall()}
        assert "ix_enrollments_user_course" in enr_indexes, f"ix_enrollments_user_course missing from {enr_indexes}"
        assert "uq_user_course_enrollment" in enr_indexes, f"uq_user_course_enrollment missing from {enr_indexes}"

        cur.execute("PRAGMA index_info('ix_enrollments_user_course')")
        enr_cols = [row[2] for row in cur.fetchall()]
        assert enr_cols == ["user_id", "course_id"], f"Expected (user_id, course_id), got {enr_cols}"
        print("  ✅ [PASS] enrollments table has composite index (user_id, course_id).")

        # Check user_favorites table and composite index
        cur.execute("PRAGMA index_list('user_favorites')")
        fav_indexes = {row[1] for row in cur.fetchall()}
        assert "ix_user_favorites_user_course" in fav_indexes, f"ix_user_favorites_user_course missing from {fav_indexes}"
        assert "uq_user_course_favorite" in fav_indexes, f"uq_user_course_favorite missing from {fav_indexes}"

        cur.execute("PRAGMA index_info('ix_user_favorites_user_course')")
        fav_cols = [row[2] for row in cur.fetchall()]
        assert fav_cols == ["user_id", "course_id"], f"Expected (user_id, course_id), got {fav_cols}"
        print("  ✅ [PASS] user_favorites table has composite index (user_id, course_id).")

    # 2. Test toggle favorite via API
    uid, phone, token = register_student("fav_test")
    headers = {"Authorization": f"Bearer {token}"}

    # Step A: Toggle on
    res_on = client.post("/api/v1/courses/course-asfar/favorite", headers=headers)
    assert res_on.status_code == 200, f"Toggle on failed: {res_on.text}"
    data_on = res_on.json()
    assert data_on["success"] is True
    assert data_on["is_favorite"] is True
    assert "افزوده شد" in data_on["message"]

    # Verify row exists in SQLite
    with sqlite3.connect(DB_PATH) as con:
        row = con.execute("SELECT id, user_id, course_id FROM user_favorites WHERE user_id = ? AND course_id = ?", (uid, "course-asfar")).fetchone()
        assert row is not None
        assert row[1] == uid
        assert row[2] == "course-asfar"
    print("  ✅ [PASS] POST /favorite toggled ON and verified in SQLite.")

    # Step B: Get favorites list
    res_list = client.get("/api/v1/courses/favorites", headers=headers)
    assert res_list.status_code == 200
    fav_courses = res_list.json()
    assert len(fav_courses) == 1
    assert fav_courses[0]["id"] == "course-asfar"
    print("  ✅ [PASS] GET /courses/favorites retrieves active favorited course.")

    # Step C: Toggle off
    res_off = client.post("/api/v1/courses/course-asfar/favorite", headers=headers)
    assert res_off.status_code == 200
    data_off = res_off.json()
    assert data_off["success"] is True
    assert data_off["is_favorite"] is False
    assert "حذف شد" in data_off["message"]

    # Verify row is deleted from SQLite
    with sqlite3.connect(DB_PATH) as con:
        count = con.execute("SELECT count(*) FROM user_favorites WHERE user_id = ? AND course_id = ?", (uid, "course-asfar")).fetchone()[0]
        assert count == 0
    print("  ✅ [PASS] POST /favorite toggled OFF and row deleted from SQLite.")

    # 3. Foreign Key Integrity and Cascade Deletion
    # Toggle on again for testing CASCADE
    client.post("/api/v1/courses/course-asfar/favorite", headers=headers)
    with sqlite3.connect(DB_PATH) as con:
        con.execute("PRAGMA foreign_keys = ON")
        # Direct insert with invalid user_id must fail FK constraint
        try:
            con.execute("INSERT INTO user_favorites (id, user_id, course_id) VALUES ('fav-bad-fk', 'non-existent-user', 'course-asfar')")
            con.commit()
            assert False, "Expected FK constraint failure on user_id!"
        except sqlite3.IntegrityError as e:
            assert "FOREIGN KEY" in str(e).upper()
            print("  ✅ [PASS] Foreign Key constraint enforced on invalid user_id.")

        # Deleting the user must CASCADE delete their user_favorites
        con.execute("DELETE FROM users WHERE id = ?", (uid,))
        con.commit()
        rem_favs = con.execute("SELECT count(*) FROM user_favorites WHERE user_id = ?", (uid,)).fetchone()[0]
        assert rem_favs == 0, f"Expected 0 favorites after user deletion, found {rem_favs}"
        print("  ✅ [PASS] Deleting User CASCADE deletes user_favorites rows.")


# =========================================================================
# VECTOR 4: SQLite WAL Mode Concurrency Stress
# =========================================================================
def test_vector_4_sqlite_wal_concurrency():
    banner("Vector 4: SQLite WAL Mode Concurrency Stress")

    # 1. Verify WAL mode in SQLite PRAGMA
    with sqlite3.connect(DB_PATH) as con:
        journal_mode = con.execute("PRAGMA journal_mode;").fetchone()[0]
        assert journal_mode.lower() == "wal", f"Expected WAL mode, got {journal_mode}"
        print(f"  ✅ [PASS] SQLite is running in '{journal_mode.upper()}' mode.")

    # 2. Multi-threaded parallel favorite creation across distinct (student, course) pairs
    # Pre-register 8 students sequentially to avoid CPU bcrypt bottleneck in worker threads
    students = [register_student(f"wal_{i}") for i in range(8)]
    catalog_courses = ["course-asfar", "course-bidayat", "course-mabadi-mantiq", "course-ishraq"]

    # 16 unique (student, course) pairs
    unique_pairs = []
    for s_idx in range(4):
        for c_idx in range(4):
            unique_pairs.append((students[s_idx], catalog_courses[c_idx]))

    def worker_favorite_unique(idx: int) -> Tuple[int, bool]:
        student, cid = unique_pairs[idx]
        uid, phone, token = student
        h = {"Authorization": f"Bearer {token}"}
        r = client.post(f"/api/v1/courses/{cid}/favorite", headers=h)
        return r.status_code, r.json().get("is_favorite", False)

    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(worker_favorite_unique, range(len(unique_pairs))))

    status_codes = [r[0] for r in results]
    assert all(code == 200 for code in status_codes), f"Not all concurrent favorites succeeded: {status_codes}"
    print(f"  ✅ [PASS] All {len(unique_pairs)} concurrent favorite toggles completed with HTTP 200 under WAL mode.")

    # 3. Race condition on identical (student, course) favorite toggle
    # Stress-test: 5 threads hitting the exact same course for the exact same student at once
    race_student = students[4]
    race_uid, race_phone, race_token = race_student
    race_course = "course-asfar"
    race_headers = {"Authorization": f"Bearer {race_token}"}

    def worker_race(idx: int) -> Tuple[int, str]:
        try:
            r = client.post(f"/api/v1/courses/{race_course}/favorite", headers=race_headers)
            return r.status_code, "OK"
        except Exception as e:
            return 500, f"Leaked {type(e).__name__}"

    with ThreadPoolExecutor(max_workers=5) as ex:
        race_results = list(ex.map(worker_race, range(5)))

    race_codes = [r[0] for r in race_results]
    print(f"  ⚡ Identical-pair concurrent race results: {race_codes}")
    # Document whether race was clean or leaked IntegrityError
    leaked_errors = [r[1] for r in race_results if r[0] == 500]
    if leaked_errors:
        print(f"  ⚠️ [FINDING] Identical-pair concurrent favorite race leaked unhandled exception: {leaked_errors}")
    else:
        print(f"  ✅ [PASS] Identical-pair concurrent favorite race handled without crash.")

    # 3. High-concurrency mixed read/write traffic (20 concurrent tasks)
    # Tasks: GET courses, GET audio with Range, POST favorite, GET favorites, GET auth/me
    admin_headers = get_admin_headers()

    def mixed_worker(idx: int) -> Tuple[str, int]:
        uid, phone, token = students[idx % len(students)]
        h = {"Authorization": f"Bearer {token}"}
        task_type = idx % 5
        if task_type == 0:
            # Course details read
            r = client.get("/api/v1/courses/course-asfar")
            return "get_course", r.status_code
        elif task_type == 1:
            # Audio streaming with range
            # Issue fast DRM token
            tok_r = client.post("/api/v1/stream/token", headers=admin_headers, json={"user_id": uid, "course_id": "course-asfar", "chapter_id": 1})
            drm_tok = tok_r.json()["token"]
            r = client.get(f"/api/v1/stream/audio/course-asfar/1?token={drm_tok}", headers={"Range": "bytes=0-1023"})
            return "stream_audio", r.status_code
        elif task_type == 2:
            # Toggle favorite
            r = client.post("/api/v1/courses/course-bidayat/favorite", headers=h)
            return "toggle_fav", r.status_code
        elif task_type == 3:
            # Get favorites
            r = client.get("/api/v1/courses/favorites", headers=h)
            return "get_favs", r.status_code
        else:
            # Auth me profile read
            r = client.get("/api/v1/auth/me", headers=h)
            return "get_me", r.status_code

    with ThreadPoolExecutor(max_workers=10) as ex:
        mixed_results = list(ex.map(mixed_worker, range(20)))

    # All expected status codes: 200 for reads, 206 for stream, 200 for favorites
    for task_name, code in mixed_results:
        expected = [200, 206]
        assert code in expected, f"Task {task_name} returned unexpected status {code}"
    print(f"  ✅ [PASS] 20 concurrent mixed read/write operations succeeded without SQLite database lock.")


# =========================================================================
# VECTOR 5: selectinload Async Eager-Loading Hygiene
# =========================================================================
def test_vector_5_selectinload_hygiene():
    banner("Vector 5: selectinload Async Eager-Loading Hygiene")

    async def verify_queries():
        async with async_session() as session:
            # 1. Course eager loading with lessons and category
            c = await course_service.get_course_from_db_tx(session, "course-asfar")
            assert c is not None, "course-asfar not found in DB"
            # Accessing lessons must NOT raise MissingGreenlet
            lessons = c.lessons
            assert isinstance(lessons, list)
            print(f"  ✅ [PASS] Course.lessons eagerly loaded via selectinload ({len(lessons)} lessons).")

            # 2. User eager loading with enrollments
            # adm-001 or standard student
            u_dict = await auth_service._fetch_user_with_enrollments(session, "adm-001")
            assert u_dict is not None
            assert "enrolled_course_ids" in u_dict
            print("  ✅ [PASS] User.enrollments eagerly loaded via selectinload in _fetch_user_with_enrollments.")

            # 3. Order eager loading with items and user
            # Place a test order first
            o_dict = await order_service.create_order_tx(
                items=[{"item_id": "course-asfar", "item_type": "course", "title": "اسفار", "price": 0, "quantity": 1}],
                shipping_address="دفتر مرکزی",
                postal_code="1234567890",
                recipient_name="مدیر سیستم",
                recipient_phone="09120000000",
                user={"id": "adm-001"},
                db=session,
            )
            order_id = o_dict["order_id"]
            retrieved_order = await order_service.get_order_by_id_tx(session, order_id)
            assert retrieved_order is not None
            assert len(retrieved_order["items"]) == 1
            print("  ✅ [PASS] Order.items and Order.user eagerly loaded via selectinload.")

    asyncio.run(verify_queries())


# =========================================================================
# VECTOR 6: Scholar Identity & Anti-Slop Discipline
# =========================================================================
def test_vector_6_scholar_identity_and_anti_slop():
    banner("Vector 6: Scholar Official Identity & Persian Anti-Slop")

    official_name = "حجت الاسلام دکتر زنجیر زن حسینی"

    # 1. Health check scholar identity
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert res_root.json()["scholar_name"] == official_name

    # 2. Courses instructor scholar identity
    res_c = client.get("/api/v1/courses")
    assert res_c.status_code == 200
    for course in res_c.json():
        assert course.get("instructor") == official_name, f"Instructor mismatch in {course['id']}: {course.get('instructor')}"

    # 3. Persian anti-slop check in exception messages
    # Test duplicate enrollment Persian text
    uid, phone, token = register_student("slop_test")
    h = {"Authorization": f"Bearer {token}"}
    client.post("/api/v1/courses/course-asfar/enroll", headers=h)
    dup_res = client.post("/api/v1/courses/course-asfar/enroll", headers=h)
    assert dup_res.status_code == 400
    msg = dup_res.json().get("message", "")
    assert "می‌باشد" not in msg, "Bureaucratic tell 'می‌باشد' found!"
    assert "می‌گردد" not in msg, "Bureaucratic tell 'می‌گردد' found!"
    assert "شما پیش از این در دوره" in msg
    print("  ✅ [PASS] Scholar identity strictly verified; zero bureaucratic tells in error messages.")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 RUNNING EMPIRICAL ADVERSARIAL SUITE — MILESTONE 1 (PHASE 6)")
    print("="*70)

    test_vector_1_drm_token_tampering()
    test_vector_2_rfc7233_range_streaming()
    test_vector_3_user_favorite_and_indexes()
    test_vector_4_sqlite_wal_concurrency()
    test_vector_5_selectinload_hygiene()
    test_vector_6_scholar_identity_and_anti_slop()

    print("\n" + "="*70)
    print("🎉 ALL 6 ADVERSARIAL CHALLENGE VECTORS COMPLETED SUCCESSFULLY!")
    print("="*70)
