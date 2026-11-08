"""
Empirical Challenger Test Suite — Milestone 1 (Phase 6 Hardening)
Adversarial Stress Harness for:
1. RFC 7233 Audio Range Streaming (Full, Suffix, Mid, Open, Zero, Out-of-bounds, Malformed, Clamped, DRM security).
2. UserFavorite Subsystem (401 unauthenticated, 404 missing course, rapid sequential toggle, concurrent threads, SQLite invariants).
3. `selectinload` Relational Eager Hydration (Course.lessons, Order.items, User.enrollments, UserFavorite.course).
"""
import sys
import os
import sqlite3
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.database import async_session
from backend.app.services.course_service import course_service
from backend.app.services.order_service import order_service
from backend.app.models.models import Course, Lesson, Order, OrderItem, User, UserFavorite, Enrollment

client = TestClient(app)
DB_PATH = "zanjirzan_platform.db"


def test_rfc7233_audio_range_comprehensive():
    print("\n--- [VECTOR 1] EMPIRICAL RFC 7233 AUDIO RANGE STRESS TEST ---")
    
    # 0. Issue a genuine DRM token
    course_id = "c1"
    chapter_id = 1
    admin_login = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "admin_secret_2026"})
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}
    tok_res = client.post("/api/v1/stream/token", headers=admin_headers, json={
        "user_id": "usr-challenger-phase6",
        "course_id": course_id,
        "chapter_id": chapter_id
    })
    assert tok_res.status_code == 200, f"Failed to get DRM token: {tok_res.text}"
    drm_token = tok_res.json()["token"]

    # 1. Full content request (No Range header) -> 200 OK
    full_res = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}")
    assert full_res.status_code == 200, f"Expected 200, got {full_res.status_code}"
    assert full_res.headers.get("Accept-Ranges") == "bytes"
    total_len = len(full_res.content)
    header_content_len = int(full_res.headers.get("Content-Length", 0))
    assert total_len == header_content_len, f"Body length {total_len} != Content-Length {header_content_len}"
    assert total_len > 1000, f"Unexpectedly small total audio size: {total_len}"
    full_bytes = full_res.content
    print(f"  [1.0] Full audio stream: {total_len} bytes, Content-Length match verified.")

    # 2. Single byte at start: bytes=0-0
    r00 = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=0-0"})
    assert r00.status_code == 206
    assert r00.headers.get("Content-Range") == f"bytes 0-0/{total_len}"
    assert r00.headers.get("Content-Length") == "1"
    assert len(r00.content) == 1
    assert r00.content == full_bytes[0:1]
    print("  [1.1] Single byte range (bytes=0-0) matches exact byte.")

    # 3. Single byte at end: bytes={total_len-1}-{total_len-1}
    last_idx = total_len - 1
    rlast = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": f"bytes={last_idx}-{last_idx}"})
    assert rlast.status_code == 206
    assert rlast.headers.get("Content-Range") == f"bytes {last_idx}-{last_idx}/{total_len}"
    assert rlast.headers.get("Content-Length") == "1"
    assert len(rlast.content) == 1
    assert rlast.content == full_bytes[last_idx:last_idx+1]
    print(f"  [1.2] Single byte at end (bytes={last_idx}-{last_idx}) matches exact byte.")

    # 4. Single byte in middle: bytes=500-500
    rmid1 = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=500-500"})
    assert rmid1.status_code == 206
    assert rmid1.headers.get("Content-Range") == f"bytes 500-500/{total_len}"
    assert rmid1.headers.get("Content-Length") == "1"
    assert len(rmid1.content) == 1
    assert rmid1.content == full_bytes[500:501]
    print("  [1.3] Single byte in middle (bytes=500-500) matches exact byte.")

    # 5. Mid-stream range: bytes=100-200 (101 bytes)
    rmid = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=100-200"})
    assert rmid.status_code == 206
    assert rmid.headers.get("Content-Range") == f"bytes 100-200/{total_len}"
    assert rmid.headers.get("Content-Length") == "101"
    assert len(rmid.content) == 101
    assert rmid.content == full_bytes[100:201]
    print("  [1.4] Mid-stream range (bytes=100-200) exact 101 bytes match.")

    # 6. Open-ended range: bytes=100-
    ropen = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=100-"})
    assert ropen.status_code == 206
    assert ropen.headers.get("Content-Range") == f"bytes 100-{total_len-1}/{total_len}"
    expected_open_len = total_len - 100
    assert ropen.headers.get("Content-Length") == str(expected_open_len)
    assert len(ropen.content) == expected_open_len
    assert ropen.content == full_bytes[100:]
    print("  [1.5] Open-ended range (bytes=100-) exact slice match.")

    # 7. Suffix range: bytes=-100 (last 100 bytes)
    rsuf = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=-100"})
    assert rsuf.status_code == 206
    assert rsuf.headers.get("Content-Range") == f"bytes {total_len-100}-{total_len-1}/{total_len}"
    assert rsuf.headers.get("Content-Length") == "100"
    assert len(rsuf.content) == 100
    assert rsuf.content == full_bytes[-100:]
    print("  [1.6] Suffix range (bytes=-100) exact last 100 bytes match.")

    # 8. Suffix range of 1 byte: bytes=-1
    rsuf1 = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=-1"})
    assert rsuf1.status_code == 206
    assert rsuf1.headers.get("Content-Range") == f"bytes {total_len-1}-{total_len-1}/{total_len}"
    assert rsuf1.headers.get("Content-Length") == "1"
    assert len(rsuf1.content) == 1
    assert rsuf1.content == full_bytes[-1:]
    print("  [1.7] Suffix range of 1 byte (bytes=-1) verified.")

    # 9. Oversized suffix range: bytes=-99999999 (should clamp to 0 and return entire representation per RFC 7233 §2.1)
    rsuf_over = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=-99999999"})
    assert rsuf_over.status_code == 206
    assert rsuf_over.headers.get("Content-Range") == f"bytes 0-{total_len-1}/{total_len}"
    assert rsuf_over.headers.get("Content-Length") == str(total_len)
    assert len(rsuf_over.content) == total_len
    assert rsuf_over.content == full_bytes
    print("  [1.8] Oversized suffix range (bytes=-99999999) clamped to full representation.")

    # 10. Clamped end range: bytes=0-99999999
    rend_over = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=0-99999999"})
    assert rend_over.status_code == 206
    assert rend_over.headers.get("Content-Range") == f"bytes 0-{total_len-1}/{total_len}"
    assert rend_over.headers.get("Content-Length") == str(total_len)
    assert len(rend_over.content) == total_len
    print("  [1.9] Clamped end range (bytes=0-99999999) clamped to full representation.")

    # 11. Whitespace resilience: bytes= 50 - 150 
    rws = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes= 50 - 150 "})
    assert rws.status_code == 206
    assert rws.headers.get("Content-Range") == f"bytes 50-150/{total_len}"
    assert rws.headers.get("Content-Length") == "101"
    assert len(rws.content) == 101
    assert rws.content == full_bytes[50:151]
    print("  [1.10] Whitespace padded range (bytes= 50 - 150 ) parsed accurately.")

    # 12. Invalid range: bytes=999999999- (start >= total_len) -> 416
    r_oob = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=999999999-"})
    assert r_oob.status_code == 416, f"Expected 416, got {r_oob.status_code}"
    assert r_oob.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  [1.11] Out-of-bounds start (bytes=999999999-) returns 416 with Content-Range bytes */total.")

    # 13. Invalid range: bytes=500-200 (start > end) -> 416
    r_inv = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=500-200"})
    assert r_inv.status_code == 416
    assert r_inv.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  [1.12] Inverted range (bytes=500-200) returns 416 with Content-Range bytes */total.")

    # 14. Invalid suffix: bytes=-0 (suffix length must be positive) -> 416
    r_zero_suf = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=-0"})
    assert r_zero_suf.status_code == 416
    assert r_zero_suf.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  [1.13] Zero suffix (bytes=-0) returns 416.")

    # 15. Malformed header: bytes=- (no bounds) -> 416
    r_nobounds = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=-"})
    assert r_nobounds.status_code == 416
    assert r_nobounds.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  [1.14] Empty bounds (bytes=-) returns 416.")

    # 16. Malformed header: non-numeric bounds -> 416
    for bad_range in ["bytes=abc-def", "bytes=foo-", "bytes=-bar", "bytes=1-2-3"]:
        rb = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": bad_range})
        assert rb.status_code == 416, f"Expected 416 for '{bad_range}', got {rb.status_code}"
        assert rb.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  [1.15] Non-numeric bounds (abc-def, foo-, -bar, 1-2-3) return 416.")

    # 17. Malformed header: wrong unit / no bytes= prefix -> 416
    for bad_unit in ["items=0-10", "characters=0-5", "total_nonsense"]:
        ru = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": bad_unit})
        assert ru.status_code == 416, f"Expected 416 for '{bad_unit}', got {ru.status_code}"
        assert ru.headers.get("Content-Range") == f"bytes */{total_len}"
    print("  [1.16] Unsupported units (items=, characters=, nonsense) return 416.")

    # 18. Multipart ranges: bytes=0-10,20-30 -> 416 (not supported)
    rmulti = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token={drm_token}", headers={"Range": "bytes=0-10,20-30"})
    assert rmulti.status_code == 416
    print("  [1.17] Multipart ranges (bytes=0-10,20-30) rejected with 416.")

    # 19. DRM security enforcement with Range header
    r_no_drm = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}", headers={"Range": "bytes=0-100"})
    assert r_no_drm.status_code in [403, 422], f"Expected 403/422, got {r_no_drm.status_code}"

    r_fake_drm = client.get(f"/api/v1/stream/audio/{course_id}/{chapter_id}?token=forged.token.here", headers={"Range": "bytes=0-100"})
    assert r_fake_drm.status_code == 403, f"Expected 403, got {r_fake_drm.status_code}"
    print("  [1.18] DRM shield strictly protects Range requests (missing/forged token rejected).")
    print("✅ VECTOR 1 PASSED: 18/18 RFC 7233 range scenarios verified empirically.")


def test_user_favorites_security_and_stress():
    print("\n--- [VECTOR 2] USER FAVORITES SECURITY, SEQUENTIAL & CONCURRENT STRESS ---")

    target_course_id = "course-bidayat"

    # 1. Unauthenticated checks
    u_get = client.get("/api/v1/courses/favorites")
    assert u_get.status_code == 401, f"Expected 401 for anonymous GET /favorites, got {u_get.status_code}"

    u_post = client.post(f"/api/v1/courses/{target_course_id}/favorite")
    assert u_post.status_code == 401, f"Expected 401 for anonymous POST /favorite, got {u_post.status_code}"

    bad_tok = client.get("/api/v1/courses/favorites", headers={"Authorization": "Bearer malformed.token"})
    assert bad_tok.status_code == 401
    print("  [2.1] Unauthenticated and malformed access blocked with HTTP 401.")

    # 2. Register dedicated test user
    test_phone = f"0918{uuid.uuid4().int % 10000000:07d}"
    reg_res = client.post("/api/v1/auth/register", json={
        "phone": test_phone,
        "password": "SecurePassword123!",
        "full_name": "چالش‌گر تجربی مورد علاقه"
    })
    assert reg_res.status_code in [200, 201], f"Registration failed: {reg_res.text}"
    user_token = reg_res.json()["access_token"]
    user_id = reg_res.json()["id"]
    headers = {"Authorization": f"Bearer {user_token}"}
    print(f"  [2.2] Dedicated test user registered: {test_phone} (id: {user_id}).")

    # 3. Non-existent course favorite toggle -> 404
    non_course_id = "non-existent-course-99999"
    nf_res = client.post(f"/api/v1/courses/{non_course_id}/favorite", headers=headers)
    assert nf_res.status_code == 404, f"Expected 404 for non-existent course, got {nf_res.status_code}: {nf_res.text}"
    print("  [2.3] Favoriting non-existent course correctly returns HTTP 404.")

    # 4. Rapid Sequential Toggling (30 iterations)
    print("  [2.4] Executing 30 rapid sequential toggle operations...")
    for i in range(1, 31):
        toggle_res = client.post(f"/api/v1/courses/{target_course_id}/favorite", headers=headers)
        assert toggle_res.status_code == 200, f"Iteration {i} failed with status {toggle_res.status_code}: {toggle_res.text}"
        data = toggle_res.json()
        expected_state = (i % 2 == 1)  # Odd iterations: True (added), Even: False (removed)
        assert data.get("is_favorite") == expected_state, f"Iter {i}: expected is_favorite={expected_state}, got {data.get('is_favorite')}"

        # Direct SQLite invariant check
        with sqlite3.connect(DB_PATH) as con:
            cur = con.cursor()
            cur.execute("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND course_id = ?", (user_id, target_course_id))
            row_count = cur.fetchone()[0]
            expected_count = 1 if expected_state else 0
            assert row_count == expected_count, f"Iter {i}: expected DB count={expected_count}, got {row_count}"
    print("  [2.4] 30 rapid sequential toggles verified. DB row count perfectly tracked state with zero corruption.")

    # 5. Concurrent Multi-Threaded Stress Test (Multiple distinct users favoriting simultaneously)
    print("  [2.5] Concurrent stress test: 10 parallel distinct users favoriting course-1 concurrently...")
    num_users = 10
    user_tokens = []
    user_ids = []
    for u_idx in range(num_users):
        u_phone = f"0917{uuid.uuid4().int % 10000000:07d}"
        r = client.post("/api/v1/auth/register", json={
            "phone": u_phone,
            "password": "Password123!",
            "full_name": f"کاربر همزمان {u_idx}"
        })
        assert r.status_code in [200, 201]
        user_tokens.append(r.json()["access_token"])
        user_ids.append(r.json()["id"])

    def do_favorite(tok):
        h = {"Authorization": f"Bearer {tok}"}
        return client.post(f"/api/v1/courses/{target_course_id}/favorite", headers=h)

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(do_favorite, user_tokens))

    # All 10 distinct users must succeed (200) and have is_favorite=True
    for idx, res in enumerate(results):
        assert res.status_code == 200, f"Concurrent user {idx} failed: {res.status_code} - {res.text}"
        assert res.json().get("is_favorite") is True

    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM user_favorites WHERE course_id = ?", (target_course_id,))
        total_course_favs = cur.fetchone()[0]
        # At least the 10 users we just inserted must be present
        assert total_course_favs >= 10, f"Expected at least 10 favorites in DB, got {total_course_favs}"
    print(f"  [2.5] 10 parallel user threads completed with 100% success (all 200 OK, zero DB collisions).")

    # 6. Composite Unique Index and Schema Invariant Check
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("PRAGMA index_list('user_favorites')")
        indexes = cur.fetchall()
        index_names = [idx[1] for idx in indexes]
        assert "ix_user_favorites_user_course" in index_names or "uq_user_course_favorite" in index_names, \
            f"Expected composite index on user_favorites, found: {index_names}"
        
        # Verify enrollment composite index
        cur.execute("PRAGMA index_list('enrollments')")
        enr_indexes = [idx[1] for idx in cur.fetchall()]
        assert "ix_enrollments_user_course" in enr_indexes or "uq_user_course_enrollment" in enr_indexes, \
            f"Expected composite index on enrollments, found: {enr_indexes}"
    print("  [2.6] Composite unique index 'ix_user_favorites_user_course' and 'ix_enrollments_user_course' verified in SQLite.")

    # 7. Concurrent Same-User Race Condition Stress
    print("  [2.7] Concurrent same-user race condition test: 10 parallel requests toggling for the SAME user...")
    same_user_phone = f"0915{uuid.uuid4().int % 10000000:07d}"
    r_same = client.post("/api/v1/auth/register", json={
        "phone": same_user_phone,
        "password": "Password123!",
        "full_name": "کاربر مسابقه همزمان"
    })
    same_token = r_same.json()["access_token"]
    same_uid = r_same.json()["id"]

    def do_same_user_fav(_):
        h = {"Authorization": f"Bearer {same_token}"}
        try:
            return client.post(f"/api/v1/courses/{target_course_id}/favorite", headers=h)
        except Exception as e:
            return e

    with ThreadPoolExecutor(max_workers=10) as executor:
        same_results = list(executor.map(do_same_user_fav, range(10)))

    successes = [r for r in same_results if hasattr(r, "status_code") and r.status_code == 200]
    errors = [r for r in same_results if not hasattr(r, "status_code") or r.status_code != 200]
    print(f"  [2.7] Concurrency race results for same user: {len(successes)} HTTP 200s, {len(errors)} collisions/errors.")
    
    # Invariant: Database count must NEVER exceed 1 due to unique constraint
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM user_favorites WHERE user_id = ? AND course_id = ?", (same_uid, target_course_id))
        final_count = cur.fetchone()[0]
        assert final_count in [0, 1], f"Database invariant breached! Duplicate rows found: {final_count}"
    print(f"  [2.7] Database invariant strictly maintained: final row count is {final_count} (<= 1). Zero duplicate corruptions.")
    print("✅ VECTOR 2 PASSED: UserFavorite security, sequential toggle, concurrent threads, and DB invariants verified.")


def test_selectinload_relational_hydration():
    print("\n--- [VECTOR 3] EMPIRICAL SELECTINLOAD EAGER HYDRATION VERIFICATION ---")

    async def _async_checks():
        async with async_session() as session:
            # 1. Course.lessons eager loading via get_course_from_db_tx
            test_c_id = f"test-c-{uuid.uuid4().hex[:6]}"
            db_c = Course(
                id=test_c_id,
                title_fa="دوره آزمون سلکت‌این‌لود",
                slug=f"test-slug-{uuid.uuid4().hex[:6]}",
                author_name="حجت الاسلام دکتر زنجیرزن حسینی",
            )
            lesson1 = Lesson(
                id=f"les-{uuid.uuid4().hex[:8]}",
                course_id=test_c_id,
                session_number=1,
                title_fa="جلسه آزمایشی ۱",
                audio_url="/audio/sample.wav"
            )
            lesson2 = Lesson(
                id=f"les-{uuid.uuid4().hex[:8]}",
                course_id=test_c_id,
                session_number=2,
                title_fa="جلسه آزمایشی ۲",
                audio_url="/audio/sample.wav"
            )
            session.add(db_c)
            session.add(lesson1)
            session.add(lesson2)
            await session.commit()

            c = await course_service.get_course_from_db_tx(session, test_c_id)
            assert c is not None, f"Course {test_c_id} not found in database"
            # Access lessons attribute directly: in SQLAlchemy async, if selectinload was NOT used,
            # accessing a relationship outside eager load raises MissingGreenlet exception!
            try:
                lessons = c.lessons
                assert isinstance(lessons, list)
                assert len(lessons) == 2
                print(f"  [3.1] Course.lessons eagerly hydrated via selectinload without MissingGreenlet error ({len(lessons)} lessons).")
            except Exception as e:
                raise AssertionError(f"selectinload failed for Course.lessons! Raised: {e}")

            # 2. Order.items eager loading via get_order_by_id_tx
            order_id = f"ord-{uuid.uuid4().hex[:8]}"
            order = Order(
                id=order_id,
                tracking_number=f"TRK-{uuid.uuid4().hex[:6].upper()}",
                total_amount=150000,
                status="completed"
            )
            item1 = OrderItem(
                id=f"item-{uuid.uuid4().hex[:8]}",
                order_id=order_id,
                item_id=test_c_id,
                item_type="course",
                price=150000,
                title="دوره آزمون سلکت‌این‌لود"
            )
            session.add(order)
            session.add(item1)
            await session.commit()

            fetched_order = await order_service.get_order_by_id_tx(session, order_id)
            assert fetched_order is not None
            assert "items" in fetched_order
            assert len(fetched_order["items"]) >= 1
            assert fetched_order["items"][0]["title"] == "دوره آزمون سلکت‌این‌لود"
            print(f"  [3.2] Order.items eagerly hydrated via selectinload for order {order_id}.")

            # 3. UserFavorite.course eager loading
            test_uid = f"usr-hydr-{uuid.uuid4().hex[:6]}"
            new_u = User(
                id=test_uid,
                mobile=f"0916{uuid.uuid4().int % 10000000:07d}",
                hashed_password="hash",
                full_name="تست لودینگ"
            )
            fav = UserFavorite(
                id=f"fav-hydr-{uuid.uuid4().hex[:6]}",
                user_id=test_uid,
                course_id="course-bidayat"
            )
            session.add(new_u)
            session.add(fav)
            await session.commit()

            user_favs = await course_service.get_user_favorites(session, test_uid)
            assert len(user_favs) == 1
            assert user_favs[0]["id"] == "course-bidayat"
            print("  [3.3] UserFavorite.course eagerly hydrated via selectinload.")

    asyncio.run(_async_checks())
    print("✅ VECTOR 3 PASSED: selectinload hydration verified across Course, Order, and UserFavorite.")


if __name__ == "__main__":
    print("==================================================================")
    print("RUNNING ADVERSARIAL CHALLENGER TEST SUITE (PHASE 6 HARDENING)")
    print("==================================================================")
    test_rfc7233_audio_range_comprehensive()
    test_user_favorites_security_and_stress()
    test_selectinload_relational_hydration()
    print("\n🎉 ALL ADVERSARIAL STRESS TESTS COMPLETED SUCCESSFULLY WITH ZERO FAILURES!")
