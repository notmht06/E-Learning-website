# -*- coding: utf-8 -*-
"""
Hermetic Pytest Configuration and Test Harness for backend test suite.
Platform: پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

Ensures fully hermetic test execution with:
1. Isolated temporary SQLite database routing (both SQLAlchemy async/sync and sqlite3.connect)
2. Predictable test environment variables
3. Complete suite fixtures (client, student_token, admin_token, student_tok, admin_tok, drm_token)
4. Automatic sliding-window and token-bucket rate limiter resets between every test
5. Clean resource initialization and teardown
"""
import os
import sys
import gc
import asyncio
import tempfile
import sqlite3
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# 1. Setup isolated temporary SQLite database
TEMP_DB_DIR = tempfile.mkdtemp(prefix="zanjirzan_test_db_")
TEMP_DB_PATH = os.path.join(TEMP_DB_DIR, "test_zanjirzan_platform.db")
TEMP_DB_POSIX = Path(TEMP_DB_PATH).as_posix()

# 2. Intercept sqlite3.connect to seamlessly route any direct sqlite3 calls targeting zanjirzan_platform.db
_original_sqlite3_connect = sqlite3.connect


def _patched_sqlite3_connect(*args, **kwargs):
    kwargs.setdefault("timeout", 60.0)
    if args:
        database = args[0]
        if isinstance(database, (str, Path)) and "zanjirzan_platform.db" in str(database):
            args = (TEMP_DB_PATH,) + args[1:]
    elif "database" in kwargs:
        database = kwargs["database"]
        if isinstance(database, (str, Path)) and "zanjirzan_platform.db" in str(database):
            kwargs["database"] = TEMP_DB_PATH
    return _original_sqlite3_connect(*args, **kwargs)


sqlite3.connect = _patched_sqlite3_connect

# 3. Environment configuration BEFORE importing backend.app.main or database
os.environ["ENVIRONMENT"] = "test"
os.environ["TESTING"] = "1"
os.environ["STUDENT_INITIAL_PASSWORD"] = "pass"
os.environ["ADMIN_INITIAL_PASSWORD"] = "admin_secret_2026"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEMP_DB_POSIX}"
os.environ["SYNC_DATABASE_URL"] = f"sqlite:///{TEMP_DB_POSIX}"

# 4. Rate Limiter Tracking & Reset
from backend.app.core.rate_limiter import InMemoryRateLimiter, ai_token_bucket_limiter

_tracked_limiters = set()
_orig_limiter_init = InMemoryRateLimiter.__init__


def _tracking_limiter_init(self, *args, **kwargs):
    _orig_limiter_init(self, *args, **kwargs)
    _tracked_limiters.add(self)


InMemoryRateLimiter.__init__ = _tracking_limiter_init


def _reset_all_limiters():
    ai_token_bucket_limiter.reset()
    for limiter in list(_tracked_limiters):
        limiter.requests.clear()
    if hasattr(InMemoryRateLimiter, "requests") and isinstance(InMemoryRateLimiter.requests, dict):
        InMemoryRateLimiter.requests.clear()
    try:
        from backend.app.main import app
        curr = getattr(app, "middleware_stack", None)
        while curr:
            if hasattr(curr, "limiter") and hasattr(curr.limiter, "requests"):
                curr.limiter.requests.clear()
            curr = getattr(curr, "app", None)
    except Exception:
        pass


@pytest.fixture(autouse=True)
def reset_rate_limiters():
    """Autouse fixture to reset both rate limiters before and after each test."""
    _reset_all_limiters()
    yield
    _reset_all_limiters()


@pytest.fixture(scope="session", autouse=True)
def prepare_test_suite_environment():
    """
    Session fixture to initialize DB tables and seed users/courses on temporary DB,
    cleanly disposing engine and deleting temp db on teardown.
    """
    from backend.app.models.database import ensure_db_initialized, seed_default_users, engine

    async def _init():
        await ensure_db_initialized()
        await seed_default_users()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_init())
    finally:
        pass

    yield

    async def _teardown():
        await engine.dispose()

    try:
        loop.run_until_complete(_teardown())
    except Exception as e:
        print(f"[conftest] Teardown engine disposal note: {e}")
    finally:
        loop.close()

    try:
        gc.collect()
        if os.path.exists(TEMP_DB_PATH):
            os.remove(TEMP_DB_PATH)
        for ext in ["-wal", "-shm"]:
            wal_file = TEMP_DB_PATH + ext
            if os.path.exists(wal_file):
                os.remove(wal_file)
        if os.path.exists(TEMP_DB_DIR):
            os.rmdir(TEMP_DB_DIR)
    except Exception as e:
        print(f"[conftest] Temp db cleanup note: {e}")


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    return TestClient(app)


@pytest.fixture
def student_token(client):
    student_pass = os.getenv("STUDENT_INITIAL_PASSWORD", "pass")
    res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": student_pass})
    if res.status_code != 200:
        res = client.post("/api/v1/auth/login", json={"phone": "09123456789", "password": "pass_dev_1403"})
    assert res.status_code == 200, f"Failed to login default student in fixture: {res.text}"
    return res.json()["access_token"]


@pytest.fixture
def admin_token(client):
    admin_pass = os.getenv("ADMIN_INITIAL_PASSWORD", "admin_secret_2026")
    res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": admin_pass})
    if res.status_code != 200:
        res = client.post("/api/v1/auth/login", json={"phone": "09120000000", "password": "Admin_Secure_Initial_Pass_1403!"})
    assert res.status_code == 200, f"Failed to login default admin in fixture: {res.text}"
    return res.json()["access_token"]


@pytest.fixture
def student_tok(student_token):
    return student_token


@pytest.fixture
def admin_tok(admin_token):
    return admin_token


@pytest.fixture
def drm_token(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.post(
        "/api/v1/stream/token",
        headers=headers,
        json={"user_id": "usr-140301", "course_id": "c1", "chapter_id": 1}
    )
    assert res.status_code == 200, f"Failed to obtain drm_token fixture: {res.text}"
    return res.json()["token"]

