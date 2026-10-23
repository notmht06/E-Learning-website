# Changes Log — Milestone 2 (Phase 7 Implementation)

### 1. `backend/app/services/book_service.py`
- Added missing catalog book entries: `book-bidayat` (print: 180,000 / digital: 120,000), `book-bidayat-pdf` (digital: 50,000), and `book-hekmat-vol1` (print: 200,000 / digital: 150,000).
- Enables 100% server-side price resolution for physical and digital books.

### 2. `backend/app/services/coupon_service.py`
- Added `expires_at` and `is_active` attributes to coupon catalog dictionary.
- Cleansed bureaucratic tell from line 35: «منظور گردید» -> «منظور شد».
- Added validation for expired coupons (`datetime.fromisoformat(expires_at) < datetime.utcnow()`) and inactive coupons, raising `InvalidCouponException` with clear Persian messaging.
- Added `EXPIRED1402` and `INACTIVE10` fixtures.

### 3. `backend/app/api/v1/endpoints/coupons.py`
- Enhanced exception handling in `POST /validate` to catch `AppException` explicitly and return corresponding HTTP status and message.

### 4. `backend/app/services/payment_service.py`
- Added `threading.Lock()` for atomic thread-safe state mutations.
- Enforced payment replay protection: checking if `tx["status"] == "paid"` and rejecting subsequent verify calls with HTTP 400 (`PAYMENT_REPLAY_ATTACK`).
- Rejected non-existent/fake authority strings with HTTP 400 (`PAYMENT_NOT_FOUND`).
- Enforced tracking code uniqueness via `used_tracking_codes` set, rejecting duplicate tracking codes with HTTP 400 (`DUPLICATE_TRACKING_CODE`).

### 5. `backend/app/services/order_service.py`
- Added `resolve_server_price(item)` method that looks up official catalog rates for courses and books, stripping non-numeric chars and parsing Persian numerals.
- Enforced 100% server-side pricing in both `create_order` (in-memory) and `create_order_tx` (persistent SQLite session), overriding any client-manipulated item prices.
- Saved server-verified prices to `order_items` in SQLite database.

### 6. `backend/app/core/rate_limiter.py`
- Implemented `TokenBucketRateLimiter` supporting configurable capacity and refill rate per second with thread locking.
- Exported global instance `ai_token_bucket_limiter = TokenBucketRateLimiter(capacity=10, refill_rate_per_sec=1.0)`.

### 7. `backend/app/services/ai_service.py`
- Implemented `stream_chat(req: AIChatRequest) -> AsyncGenerator[str, None]` using Server-Sent Events (`text/event-stream`).
- Tokenizes philosophical RAG response into words/phrases and yields `data: {"chunk": token, "done": false}\n\n`.
- Emits terminal event `data: {"chunk": "", "done": true, "citations": [...], "scholar_identity": "..."}\n\n`.

### 8. `backend/app/api/v1/endpoints/ai.py`
- Added `POST /api/v1/ai/chat/stream` returning `StreamingResponse(..., media_type="text/event-stream")`.
- Enforced maximum prompt length of 2,000 characters on both `/chat` and `/chat/stream`, rejecting oversized inputs with HTTP 400.
- Integrated per-user/IP `TokenBucketRateLimiter`, rejecting bursts beyond capacity with HTTP 429 and `Retry-After` header.

### 9. `backend/app/api/v1/endpoints/admin.py`
- Added router-level dependency `router = APIRouter(dependencies=[Depends(get_current_admin)])`.
- Added root route `GET /` returning `{ "status": "ok", "role": "admin", "scholar_name": "حجت الاسلام دکتر زنجیر زن حسینی", "message": "پنل مدیریت حجت الاسلام دکتر زنجیر زن حسینی" }`.
- Verified that students receive HTTP 403 Forbidden on `/api/v1/admin` and all admin endpoints.

### 10. `backend/tests/test_in_memory.py`
- Added `test_payment_replay_attack_prevention`: tests legitimate verification, replay rejection (400), unknown authority rejection (400), duplicate tracking code rejection (400).
- Added `test_server_side_pricing_and_coupon_validation`: tests valid coupon with «منظور شد», expired coupon rejection (400), inactive coupon rejection (400), and client price tampering override verified in SQLite `order_items`.
- Added `test_ai_token_by_token_sse_and_rate_limiter`: tests SSE text/event-stream chunks, terminal citations event, oversized prompt rejection (400), and burst rate limiting (429).
- Added `test_admin_rbac_strict_shield`: tests anonymous 401, student 403, and admin 200 on `GET /api/v1/admin`.
