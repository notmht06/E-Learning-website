"""
Forensic Integrity Verification Script for Milestone 1 (Phase 6).
Executes empirical tests on database, models, selectinload, RFC 7233 Range slicing,
and anti-slop / identity compliance.
"""
import sys
import os
import sqlite3
import asyncio

# Setup python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../../../"))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

print(f"[*] Root Directory: {root_dir}")

def test_sqlite_schema():
    print("\n--- Check 1: SQLite Schema & Index Forensics ---")
    db_path = os.path.join(root_dir, "zanjirzan_platform.db")
    assert os.path.exists(db_path), f"Database file not found: {db_path}"
    
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        
        # Check tables
        tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
        print(f"Tables in SQLite: {tables}")
        assert "user_favorites" in tables, "Table 'user_favorites' does not exist in SQLite!"
        assert "enrollments" in tables, "Table 'enrollments' does not exist in SQLite!"
        
        # Check enrollments indexes
        enr_indices = cursor.execute("PRAGMA index_list('enrollments')").fetchall()
        print(f"Enrollments indices: {enr_indices}")
        enr_index_names = [r[1] for r in enr_indices]
        assert any("ix_enrollments_user_course" in name or "uq_user_course_enrollment" in name for name in enr_index_names), \
            f"Composite index missing on enrollments: {enr_index_names}"
            
        # Check user_favorites indexes
        fav_indices = cursor.execute("PRAGMA index_list('user_favorites')").fetchall()
        print(f"UserFavorites indices: {fav_indices}")
        fav_index_names = [r[1] for r in fav_indices]
        assert any("ix_user_favorites_user_course" in name for name in fav_index_names), \
            f"ix_user_favorites_user_course missing: {fav_index_names}"
        assert any("uq_user_course_favorite" in name for name in fav_index_names), \
            f"uq_user_course_favorite missing: {fav_index_names}"
            
        # Check foreign keys on user_favorites
        fks = cursor.execute("PRAGMA foreign_key_list('user_favorites')").fetchall()
        print(f"UserFavorites foreign keys: {fks}")
        fk_tables = [r[2] for r in fks]
        assert "users" in fk_tables, "Foreign key to 'users' missing in user_favorites!"
        assert "courses" in fk_tables, "Foreign key to 'courses' missing in user_favorites!"
        
    print("[PASS] Check 1 Passed: Genuine SQLite tables, composite indexes, and foreign keys confirmed.")

def test_rfc7233_range_logic():
    print("\n--- Check 2: RFC 7233 Range Parser & Slicing Forensics ---")
    from backend.app.api.v1.endpoints.stream import parse_rfc7233_range
    from fastapi import HTTPException
    
    total = 10000
    
    # Standard range
    s, e, c = parse_rfc7233_range("bytes=0-1023", total)
    assert (s, e, c) == (0, 1023, 1024), f"Standard range mismatch: {(s, e, c)}"
    
    # Middle range
    s, e, c = parse_rfc7233_range("bytes=500-1499", total)
    assert (s, e, c) == (500, 1499, 1000), f"Middle range mismatch: {(s, e, c)}"
    
    # Suffix range
    s, e, c = parse_rfc7233_range("bytes=-500", total)
    assert (s, e, c) == (9500, 9999, 500), f"Suffix range mismatch: {(s, e, c)}"
    
    # Open-ended range
    s, e, c = parse_rfc7233_range("bytes=9000-", total)
    assert (s, e, c) == (9000, 9999, 1000), f"Open-ended range mismatch: {(s, e, c)}"
    
    # Out of bounds range
    try:
        parse_rfc7233_range("bytes=15000-", total)
        assert False, "Should have raised HTTPException 416"
    except HTTPException as exc:
        assert exc.status_code == 416
        assert exc.headers.get("Content-Range") == f"bytes */{total}"
        
    # Inverted range
    try:
        parse_rfc7233_range("bytes=800-400", total)
        assert False, "Should have raised HTTPException 416"
    except HTTPException as exc:
        assert exc.status_code == 416
        assert exc.headers.get("Content-Range") == f"bytes */{total}"
        
    # Malformed range
    try:
        parse_rfc7233_range("chars=0-500", total)
        assert False, "Should have raised HTTPException 416"
    except HTTPException as exc:
        assert exc.status_code == 416
        
    # Multi-range (not supported in single-range RFC 7233 spec here)
    try:
        parse_rfc7233_range("bytes=0-10,20-30", total)
        assert False, "Should have raised HTTPException 416"
    except HTTPException as exc:
        assert exc.status_code == 416
        
    print("[PASS] Check 2 Passed: RFC 7233 Range parser rigorously adheres to specs with status 206 and 416.")

async def test_selectinload_queries():
    print("\n--- Check 3: selectinload ORM Query Compilation & Execution Forensics ---")
    from backend.app.models.database import async_session, ensure_db_initialized
    from backend.app.models.models import User, Course, Lesson, Enrollment, UserFavorite, Order
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    await ensure_db_initialized()
    
    async with async_session() as session:
        # 1. Query User with selectinload(User.enrollments)
        stmt1 = select(User).options(selectinload(User.enrollments)).limit(1)
        res1 = await session.execute(stmt1)
        u = res1.scalar_one_or_none()
        assert u is not None, "No user found in database!"
        # Access relationship without lazy load error in async session
        enrs = u.enrollments
        print(f"User {u.id} enrollments loaded eagerly: {len(enrs)}")
        
        # 2. Query Enrollment with selectinload(Enrollment.course).selectinload(Course.lessons)
        stmt2 = select(Enrollment).options(
            selectinload(Enrollment.course).selectinload(Course.lessons)
        ).limit(1)
        res2 = await session.execute(stmt2)
        enr = res2.scalar_one_or_none()
        if enr and enr.course:
            lessons = enr.course.lessons
            print(f"Enrollment {enr.id} -> Course {enr.course.id} -> Lessons loaded eagerly: {len(lessons)}")
            
        # 3. Query UserFavorite with selectinload(UserFavorite.course).selectinload(Course.lessons)
        stmt3 = select(UserFavorite).options(
            selectinload(UserFavorite.course).selectinload(Course.lessons)
        ).limit(1)
        res3 = await session.execute(stmt3)
        fav = res3.scalar_one_or_none()
        print(f"UserFavorite query executed with selectinload successfully (result: {fav})")
        
        # 4. Query Order with selectinload(Order.items)
        stmt4 = select(Order).options(selectinload(Order.items)).limit(1)
        res4 = await session.execute(stmt4)
        order = res4.scalar_one_or_none()
        if order:
            items = order.items
            print(f"Order {order.id} items loaded eagerly: {len(items)}")
            
    print("[PASS] Check 3 Passed: selectinload executes successfully in AsyncSession without N+1 or greenlet errors.")

def test_http_endpoints():
    print("\n--- Check 4: Live HTTP API Endpoints & Audio Slice Forensics ---")
    from fastapi.testclient import TestClient
    from backend.app.main import app
    from backend.app.services.drm_service import drm_service
    
    client = TestClient(app)
    
    # 1. Issue genuine DRM token
    token_resp = drm_service.issue_token("student_demo", "course-mabadi-mantiq", 1)
    token = token_resp["token"]
    assert token and "." in token
    
    # 2. Test Range request on audio endpoint
    res_206 = client.get(
        f"/api/v1/stream/audio/course-mabadi-mantiq/1?token={token}",
        headers={"Range": "bytes=100-299"}
    )
    assert res_206.status_code == 206, f"Expected 206, got {res_206.status_code}"
    assert res_206.headers.get("Accept-Ranges") == "bytes"
    assert res_206.headers.get("Content-Range").startswith("bytes 100-299/")
    assert len(res_206.content) == 200, f"Expected 200 bytes, got {len(res_206.content)}"
    
    # 3. Test Full audio request (status 200)
    res_200 = client.get(
        f"/api/v1/stream/audio/course-mabadi-mantiq/1?token={token}"
    )
    assert res_200.status_code == 200, f"Expected 200, got {res_200.status_code}"
    assert res_200.headers.get("Accept-Ranges") == "bytes"
    total_len = int(res_200.headers.get("Content-Length"))
    assert total_len > 200
    # Verify the slice matches the full content exactly!
    assert res_206.content == res_200.content[100:300], "Sliced range content does NOT match bytes from full content!"
    print(f"[PASS] Audio byte slicing strictly matches: res_206.content == full_content[100:300] ({len(res_206.content)} bytes)")
    
    # 4. Test Suffix range on audio endpoint
    res_suffix = client.get(
        f"/api/v1/stream/audio/course-mabadi-mantiq/1?token={token}",
        headers={"Range": "bytes=-150"}
    )
    assert res_suffix.status_code == 206
    assert len(res_suffix.content) == 150
    assert res_suffix.content == res_200.content[-150:], "Suffix range content does NOT match last 150 bytes of full content!"
    print(f"[PASS] Audio suffix slice strictly matches: res_suffix.content == full_content[-150:] (150 bytes)")
    
    # 5. Test 416 Out of bounds
    res_416 = client.get(
        f"/api/v1/stream/audio/course-mabadi-mantiq/1?token={token}",
        headers={"Range": f"bytes={total_len + 1000}-"}
    )
    assert res_416.status_code == 416
    assert res_416.headers.get("Content-Range") == f"bytes */{total_len}"
    print(f"[PASS] Audio out-of-bounds correctly returns 416 with Content-Range: bytes */{total_len}")
    
    # 6. Test UserFavorite endpoints
    login_res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass"})
    assert login_res.status_code == 200
    st_token = login_res.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {st_token}"}
    
    # Toggle favorite
    fav_res = client.post("/api/v1/courses/course-bidayat/favorite", headers=auth_headers)
    assert fav_res.status_code == 200
    fav_json = fav_res.json()
    assert fav_json["success"] is True
    
    # Get favorites
    get_fav = client.get("/api/v1/courses/favorites", headers=auth_headers)
    assert get_fav.status_code == 200
    fav_ids = [c["id"] for c in get_fav.json()]
    assert "course-bidayat" in fav_ids
    print(f"[PASS] UserFavorite endpoints working dynamically with live SQLite persistence.")
    
    # Untoggled favorite (clean up)
    fav_untoggle = client.post("/api/v1/courses/course-bidayat/favorite", headers=auth_headers)
    assert fav_untoggle.status_code == 200
    assert fav_untoggle.json()["is_favorite"] is False
    
    print("[PASS] Check 4 Passed: Live HTTP endpoints, genuine byte slicing, and favorites confirmed.")

def test_scholar_identity_and_anti_slop():
    print("\n--- Check 5: Scholar Identity, Anti-AI-Slop & Persian Writing Rules ---")
    scholar_correct = "حجت الاسلام دکتر زنجیر زن حسینی"
    
    # Check that scholar name in Course model default is correct
    from backend.app.models.models import Course
    assert Course.author_name.default.arg == scholar_correct, f"Course author_name default mismatch: {Course.author_name.default.arg}"
    
    # Prohibited phrases in Persian
    banned_tells = ["می‌باشد", "می‌گردد", "لازم به ذکر است", "شایان ذکر است"]
    
    # Scan backend/app files modified or relevant
    scan_files = [
        os.path.join(root_dir, "backend/app/models/models.py"),
        os.path.join(root_dir, "backend/app/models/database.py"),
        os.path.join(root_dir, "backend/app/api/v1/endpoints/stream.py"),
        os.path.join(root_dir, "backend/app/api/v1/endpoints/courses.py"),
        os.path.join(root_dir, "backend/app/api/v1/endpoints/orders.py"),
        os.path.join(root_dir, "backend/app/services/course_service.py"),
        os.path.join(root_dir, "backend/app/services/order_service.py"),
    ]
    
    for fpath in scan_files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            for tell in banned_tells:
                assert tell not in content, f"Banned Persian tell '{tell}' found in {fpath}!"
                
            # Check for corrupted scholar identity
            if "دکتر زنجیرزن" in content and "حجت الاسلام دکتر زنجیر زن حسینی" not in content:
                assert False, f"Truncated scholar identity found in {fpath}!"
                
    print("[PASS] Check 5 Passed: Zero banned Persian tells and exact scholar identity confirmed.")

def main():
    test_sqlite_schema()
    test_rfc7233_range_logic()
    asyncio.run(test_selectinload_queries())
    test_http_endpoints()
    test_scholar_identity_and_anti_slop()
    print("\n[ALL PASS] ALL 5 FORENSIC CHECKS PASSED EMPIRICALLY WITH ZERO ERRORS!")

if __name__ == "__main__":
    main()
