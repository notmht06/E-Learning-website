# Adversarial Challenge Report — Milestone 2 (Phase 7)
## Empirical Security, Rate Limiting & Pricing Integrity Assessment

**Challenger**: Challenger 2 (Milestone 2 Instance 2)  
**Target**: Milestone 2 (Phase 7: Advanced Payment Security, Server-Side Pricing, AI SSE Streaming, and Admin RBAC)  
**Date**: 2026-10-14  

---

## Challenge Summary

**Overall risk assessment**: **LOW** (Production-Grade & Structurally Robust)

All empirical stress harnesses executed directly against the FastAPI server and SQLite persistent database confirm that the Milestone 2 security boundaries are hardened, un-bypassable, and compliant with the system architecture.

---

## Challenges & Empirical Stress Tests

### 1. [High Risk Mitigated] Admin RBAC Boundary Enforcement Across All Routes
- **Assumption challenged**: The router-level dependency `router = APIRouter(dependencies=[Depends(get_current_admin)])` strictly blocks unauthorized student tokens on all current and mutating sub-routes without leaking parameter schema errors.
- **Attack scenario**: An authenticated student crafts requests to mutating and query endpoints under `/api/v1/admin/` (`GET /`, `GET /analytics`, `POST /courses/create`, `PUT /courses/{id}`, `POST /courses/{id}/chapters`, `PUT /courses/{id}/chapters/{id}`, `PUT /books/{id}`, `PUT /orders/{id}/status`, `DELETE /courses/{id}`).
- **Empirical result**:
  - `GET /api/v1/admin/` -> HTTP 403 Forbidden (`detail="دسترسی به این بخش منحصراً در اختیار مدیر پایگاه است."`)
  - `GET /api/v1/admin/analytics` -> HTTP 403 Forbidden
  - `POST /api/v1/admin/courses/create` -> HTTP 403 Forbidden
  - `PUT /api/v1/admin/courses/course-asfar-1` -> HTTP 403 Forbidden
  - `POST /api/v1/admin/courses/course-asfar-1/chapters` -> HTTP 403 Forbidden
  - `PUT /api/v1/admin/courses/course-asfar-1/chapters/1` -> HTTP 403 Forbidden
  - `PUT /api/v1/admin/books/book-ishraq-1` -> HTTP 403 Forbidden
  - `PUT /api/v1/admin/orders/ord-arbitrary-123/status` -> HTTP 403 Forbidden
  - `DELETE /api/v1/admin/courses/course-asfar-1` -> HTTP 403 Forbidden
  - Anonymous requests strictly receive HTTP 401 (`"سرآیند احراز هویت (Authorization) یافت نشد."`).
  - Malformed/forged headers strictly receive HTTP 401.
  - Legitimate admin credentials (`09120000000` / `admin_secret_2026`) successfully return HTTP 200 and verify scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
- **Blast radius**: None. Zero route leakage.
- **Status**: **PASS (ROBUST)**.

---

### 2. [High Risk Mitigated] AI TokenBucket Rate Limiting Under Burst Pressure
- **Assumption challenged**: Rapid bursts of requests to `/api/v1/ai/chat/stream` exceeding the bucket capacity (10 tokens) are throttled with HTTP 429 Too Many Requests and include standard `Retry-After` headers.
- **Attack scenario**: A client fires 15 rapid requests within 1 second to `/api/v1/ai/chat/stream`.
- **Empirical result**:
  - Exactly 10 requests are granted (HTTP 200, media-type `text/event-stream`).
  - Requests 11 through 15 are blocked with HTTP 429 Too Many Requests.
  - Header `Retry-After: 1` is returned.
  - Response body contains structured Persian error: `"تعداد درخواست‌های هوش مصنوعی بیش از سقف مجاز است. لطفاً اندکی صبر فرمایید."`.
- **Observation on Outer Middleware**:
  - The inner `TokenBucketRateLimiter` enforces the endpoint-level burst (capacity 10), while the outer `RateLimitMiddleware` manages the IP sliding window envelope (120 req/min). Both layers cooperate cleanly without conflict.
- **Status**: **PASS (ROBUST)**.

---

### 3. [Medium Risk Mitigated] AI Multi-User & IP Limiter Isolation
- **Assumption challenged**: Rate limiting one student or IP must not cause denial-of-service for other authenticated students or distinct IP addresses.
- **Attack scenario**: Exhaust User A's token bucket, then immediately test User B. Exhaust IP 1, then immediately test IP 2.
- **Empirical result**:
  - User A throttled (HTTP 429) -> User B immediately succeeds with HTTP 200.
  - IP 1 throttled (HTTP 429) -> IP 2 immediately succeeds with HTTP 200.
- **Status**: **PASS (ROBUST)**.

---

### 4. [Medium Risk Mitigated] Prompt Length Boundary Validation
- **Assumption challenged**: Prompts exceeding 2,000 characters are strictly rejected to prevent LLM resource starvation.
- **Attack scenario**: Send 2,000 characters (valid boundary) vs 2,001 characters (invalid boundary) to both `/api/v1/ai/chat` and `/api/v1/ai/chat/stream`.
- **Empirical result**:
  - Prompt length == 2,000 chars -> HTTP 200 OK.
  - Prompt length == 2,001 chars -> HTTP 400 Bad Request (`"طول متن پرسش بیش از سقف مجاز است (حداکثر 2000 نویسه مجاز است)."`).
- **Status**: **PASS (ROBUST)**.

---

### 5. [High Risk Mitigated] Payment Replay Attack & Tracking Code Uniqueness
- **Assumption challenged**: Bank callbacks cannot verify the same payment authority twice, and duplicate tracking codes cannot be reused.
- **Attack scenario**: Initiate payment on `/api/v1/payment/init`. Verify once on `/api/v1/payment/verify`. Repeat verification with the same authority. Re-use tracking code on a different transaction.
- **Empirical result**:
  - First verification succeeds with HTTP 200, generating valid `reference_id` and marking transaction `paid`.
  - Second verification is blocked with HTTP 400 and structured error:
    `error_code="PAYMENT_REPLAY_ATTACK"`
    `message="این تراکنش قبلاً تایید شده است و امکان استفاده مجدد از آن وجود ندارد."`
  - Re-used tracking code on a second transaction is blocked with HTTP 400 and `error_code="DUPLICATE_TRACKING_CODE"`.
  - Unknown/forged authority is blocked with HTTP 400 and `error_code="PAYMENT_NOT_FOUND"`.
- **Status**: **PASS (ROBUST)**.

---

### 6. [Critical Risk Mitigated] Server-Side Pricing Anti-Tampering & Coupon Expiration
- **Assumption challenged**: Client-tampered prices submitted in order payloads are completely overridden by official server catalog rates, and expired/inactive promotional coupons are rejected.
- **Attack scenario**: Submit order for 2 copies of physical book `book-ishraq-1` (official catalog price 390,000 Rials each) with client `price: 10`. Test expired coupon `EXPIRED1402` and inactive coupon `INACTIVE10`.
- **Empirical result**:
  - Order subtotal and `total_amount` recalculated 100% server-side: 390,000 * 2 = 780,000 Rials.
  - Unit price in SQLite `order_items` table verified at 390,000 Rials (tampered price 10 was discarded).
  - Expired coupon `EXPIRED1402` rejected with HTTP 400 (`"مهلت استفاده از کد تخفیف «EXPIRED1402» به پایان رسیده و منقضی شده است."`).
  - Inactive coupon `INACTIVE10` rejected with HTTP 400 (`"کد تخفیف «INACTIVE10» غیرفعال شده است."`).
  - Valid coupon `HEKMAT1403` applies 20% discount and confirms with anti-bureaucratic Persian: `«منظور شد»` (zero `«منظور گردید»`).
- **Status**: **PASS (ROBUST)**.

---

## Stress Test Results Summary

| Test Scenario | Target Endpoint | Expected Behavior | Observed Behavior | Status |
|---|---|---|---|---|
| Admin RBAC: Student Token | `/api/v1/admin/*` (9 routes) | HTTP 403 Forbidden | HTTP 403 on all 9 routes | **PASS** |
| Admin RBAC: Anonymous Token | `/api/v1/admin/*` | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| Admin RBAC: Legitimate Admin | `/api/v1/admin/` & `/analytics` | HTTP 200 OK + Scholar Name | HTTP 200 + Official Scholar Identity | **PASS** |
| AI SSE Burst Throttling | `/api/v1/ai/chat/stream` | 10x 200, 5x 429 + Retry-After | 10x 200, 5x 429 + Retry-After: 1 | **PASS** |
| AI TokenBucket Isolation | `/api/v1/ai/chat/stream` | User A throttled, User B passes | Distinct buckets per user / IP | **PASS** |
| AI Prompt Length Boundary | `/api/v1/ai/chat` & `/stream` | 2000 chars=200, 2001 chars=400 | Exactly 2000=200, 2001=400 | **PASS** |
| Payment Replay Attack | `/api/v1/payment/verify` | 1st=200, 2nd=400 REPLAY_ATTACK | 400 PAYMENT_REPLAY_ATTACK | **PASS** |
| Duplicate Tracking Code | `/api/v1/payment/verify` | 400 DUPLICATE_TRACKING_CODE | 400 DUPLICATE_TRACKING_CODE | **PASS** |
| Server-Side Price Override | `/api/v1/orders/create` | Override client 10 to 390,000 | 780,000 total, 390,000 in DB | **PASS** |
| Expired / Inactive Coupon | `/api/v1/coupons/validate` | HTTP 400 with Persian reason | HTTP 400 with exact Persian msg | **PASS** |
| Test Suite: test_in_memory.py | Backend Test Suite | 19/19 Tests Passed | 19/19 Tests Passed | **PASS** |
| Quality Gate: audit_pipeline.py | 8 Quality Dimensions | 100/100 Score | 100/100 Score | **PASS** |
| Frontend: npm run build | Next.js App Router | 0 Errors, 15 Routes | 0 Errors, 15 Routes Compiled | **PASS** |

---

## Unchallenged Areas

- **Distributed Redis Token Bucket**: Current `TokenBucketRateLimiter` uses thread-safe in-memory storage (`threading.Lock`), which is tailored for single-instance or containerized deployments. In a multi-pod cluster, a distributed Redis-backed rate limiter would be appropriate.
- **Real Bank Network Webhooks**: Real Shaparak bank IP whitelisting and IP-based reverse proxy validation can only be tested in production staging.

---

## Final Verdict
**APPROVE**: Milestone 2 (Phase 7) is fully verified, empirical security guarantees hold across all vectors, and regression tests pass 100%.
