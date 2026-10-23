# Handoff Report — Explorer Survey for Backend Architecture & Security (Phases 6 & 7)

## 1. Observation
Direct codebase inspections revealed the following verified facts:

1. **`Enrollment` Indexes & `UserFavorite` Absence:**
   - In `backend/app/models/models.py:155-165`: `Enrollment` contains `UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment")` and individual column indexes `index=True` on `user_id` and `course_id`. It lacks an explicit composite `Index("ix_enrollments_user_course", "user_id", "course_id")`.
   - In `backend/app/models/models.py:1-260`: `UserFavorite` model does not exist anywhere in `models.py`.
   - In `backend/app/models/database.py:205`: `sync_conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_user_course_enrollment ON enrollments (user_id, course_id)"))` handles enrollment uniqueness, but has no provisions for `user_favorites`.

2. **ORM Query Hygiene & N+1 Latency:**
   - In `backend/app/services/course_service.py:260-282`: `get_enrolled_courses_for_user` queries `select(Enrollment.course_id)` and loops over IDs with `self.get_course_by_id(cid)` rather than eager batch loading.
   - In `backend/app/services/auth_service.py:258-274`: `_fetch_user_with_enrollments` executes two serial queries: `select(User).where(User.id == uid)` followed by `select(Enrollment.course_id).where(Enrollment.user_id == uid)`. It does not use `selectinload(User.enrollments)`.
   - In `backend/app/models/models.py:210-216`: `Order` has `items = relationship("OrderItem", ...)`, and `Order.to_dict()` inspects `"items" in self.__dict__`. Without `selectinload(Order.items)`, accessing `order.items` in async context either triggers detached instance error or requires manual secondary queries.

3. **Payment Security, Replay Attacks & Pricing:**
   - In `backend/app/services/payment_service.py:10-57`: Transactions are stored in a volatile in-memory dictionary `self.transactions: Dict[str, Dict[str, Any]]`.
   - In `backend/app/services/payment_service.py:35-56`: `verify_payment` does NOT check if `self.transactions[authority]["status"] == "paid"`. Calling `verify_payment` repeatedly with the same authority generates a fresh `ref_id` each time and returns `success: True`. Furthermore, an unknown authority string triggers line 46 (`order_id = f"ORD-CONFIRMED-{random.randint(1000, 9999)}"`) and returns `success: True`.
   - In `backend/app/services/order_service.py:85`: `subtotal = sum(item.get("price", 0) * item.get("quantity", 1) for item in items)` trusts client-supplied prices without validating against server catalog rates.
   - In `backend/app/services/coupon_service.py:11-36`: Coupons are stored as a static dictionary `{"HEKMAT1403": 20, ...}` without expiration dates or `is_active` flags. Line 35 contains the Persian writing tell `منظور گردید`.

4. **RFC 7233 Audio Range Streaming:**
   - In `backend/app/api/v1/endpoints/stream.py:107-140`: When `DEFAULT_AUDIO_PATH` exists (verified on disk at `frontend/public/audio/sample_lecture.wav`, size 2,822,444 bytes), range parsing parses `start` and `end`. However, it does not handle suffix range specs (e.g. `bytes=-500` sets `start=0` and `end=500` instead of the last 500 bytes).
   - In `stream.py:114`: If `start >= file_size`, it clamps `end = file_size - 1`, leading to negative `chunk_size` rather than raising `HTTP 416 Range Not Satisfiable`.
   - In `stream.py:155-167`: In the synthetic fallback branch, the full payload is returned with `bytes 0-{total_len-1}/{total_len}` rather than slicing `synthetic_payload[start:end+1]`.

5. **AI Assistant Streaming & Rate Limiting:**
   - In `backend/app/api/v1/endpoints/ai.py:21-27`: `@router.post("/chat")` calls `ai_service.chat(req)` synchronously returning an `AIChatResponse` JSON object. There is no token-by-token SSE streaming endpoint (`text/event-stream`).
   - In `backend/app/schemas/ai.py:11-16`: `AIChatRequest` has no `max_length` constraint on `message`.
   - In `backend/app/core/rate_limiter.py:12-58`: Only `InMemoryRateLimiter` (sliding-window IP counter) exists. There is no per-user token-bucket rate limiter.

6. **Admin RBAC Enforcement:**
   - In `backend/app/api/v1/endpoints/admin.py:18`: `router = APIRouter()` does not enforce `dependencies=[Depends(get_current_admin)]` at the router level.
   - In `admin.py`: There is no root route (`@router.get("/")`), causing `GET /api/v1/admin` to return 404 rather than an explicit 403 for unauthorized students.

---

## 2. Logic Chain
1. From Observation 1:
   - Because `UserFavorite` is not defined in `models.py`, any attempt by frontend components to persist course bookmarks or populate the Dribbble Favourite tab will fail. Adding `UserFavorite` with `(user_id, course_id)` unique constraint and composite index provides O(1) bookmark lookups and satisfies database referential integrity.
2. From Observation 2:
   - Serial queries in `_fetch_user_with_enrollments` and in-memory loops in `get_enrolled_courses_for_user` create unnecessary round-trips and risk Greenlet errors in async SQLAlchemy. Adding `selectinload(Course.lessons)` and `selectinload(User.enrollments)` enables single-query batch fetching.
3. From Observation 3:
   - The absence of payment transaction persistence, authority locking, and status validation permits trivial payment replay attacks and allows clients to forge successful receipts or purchase courses for 0 Tomans by tampering with the request body. Enforcing server-side pricing lookup and atomic status transition `pending -> paid` with database locking eliminates both attack vectors.
4. From Observation 4:
   - Media players scrubbing audio rely on RFC 7233 range requests. Suffix ranges (`bytes=-500`) and out-of-bounds requests (`start >= file_size`) must conform to RFC 7233 (handling suffix offsets and returning HTTP 416 with `Content-Range: bytes */{file_size}`).
5. From Observation 5:
   - Real-time conversational AI requires low-latency chunk streaming (`text/event-stream`) to stream responses token-by-token. Coupling an SSE generator with prompt length bounds and a per-user `TokenBucketRateLimiter` protects against resource exhaustion.
6. From Observation 6:
   - Injecting `get_current_admin` into `admin.router` ensures fail-safe authorization where every current and future admin sub-route automatically yields HTTP 403 for student credentials.

---

## 3. Caveats
- `frontend/public/audio/sample_lecture.wav` exists in the local filesystem (2.8 MB). In minimal containerized Docker environments where static assets might not be mounted, the synthetic fallback in `stream.py` must slice bytes accurately to prevent test failures.
- Unit tests in `backend/tests/test_api_v1.py` require a running uvicorn instance on port 8000, while `backend/tests/test_in_memory.py` executes using `TestClient` directly in-process.

---

## 4. Conclusion
The backend architecture is functional for basic operations but requires specific hardening across Phases 6 & 7:
1. Define `UserFavorite` and composite indexes on `Enrollment` in `models.py` and `database.py`.
2. Apply `selectinload` in `course_service.py`, `order_service.py`, and `auth_service.py`.
3. Create `PaymentTransaction` database model, enforce atomic status checks with database locks in `payment_service.py` to prevent replay attacks, and compute order pricing 100% server-side.
4. Normalize RFC 7233 Range request parsing in `stream.py` for suffix ranges and HTTP 416 responses.
5. Implement `POST /api/v1/ai/chat/stream` via `StreamingResponse(..., media_type="text/event-stream")`, enforce max prompt length, and integrate `TokenBucketRateLimiter`.
6. Enforce `dependencies=[Depends(get_current_admin)]` on `admin.router` and provide a root endpoint returning HTTP 403 for students.

---

## 5. Verification Method
1. **Automated Backend In-Memory Suite:**
   Run:
   `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`
   Expected: 100% pass across all tests.
2. **Adversarial Enrollment & Integrity Suite:**
   Run:
   `.\backend\.venv\Scripts\python.exe backend/tests/test_adversarial_enrollment.py`
   Expected: 8/8 tests pass without regressions.
3. **Audit Pipeline Compliance:**
   Run:
   `.\backend\.venv\Scripts\python.exe audit_pipeline.py`
   Expected: 100/100 score across all quality gates.
4. **Targeted Verification Tests for Proposed Changes:**
   - **Replay Protection:** Call `POST /api/v1/payment/verify` twice with the same `authority` and assert second call returns HTTP 400 with `PAYMENT_REPLAY_ATTACK`.
   - **Range Seeking:** Send `GET /api/v1/stream/audio/c1/1?token=...` with `Range: bytes=100-200` and assert status 206 with `Content-Range: bytes 100-200/2822444` and `len(content) == 101`. Send `Range: bytes=9999999-` and assert status 416.
   - **Admin RBAC:** Send `GET /api/v1/admin` with student bearer token and assert status 403 Forbidden.
   - **AI SSE Streaming:** Send `POST /api/v1/ai/chat/stream` with valid payload and assert `content-type: text/event-stream` and stream events starting with `data:`. Send prompt with > 2000 characters and assert HTTP 400.
