# Adversarial Challenge Report — Milestone 1 (Phase 6)
**Agent**: Challenger 2 (`challenger_m1_2`)  
**Timestamp**: 2026-10-14T04:45:00Z  
**Verdict**: **APPROVE** (All core Phase 6 objectives robustly implemented; one non-blocking low-severity race finding noted for refinement)

---

## Challenge Summary

**Overall risk assessment**: **LOW**

The implementation of Milestone 1 (Phase 6) introduces major architectural upgrades across:
1. Pure non-blocking `AsyncSession` route handlers eliminating Event Loop starvation.
2. The `UserFavorite` table with composite index `(user_id, course_id)` and foreign key cascade deletion.
3. Composite indexing `(user_id, course_id)` on `Enrollment`.
4. Relational eager loading via `selectinload` across course, order, and auth services, preventing N+1 queries and greenlet exceptions.
5. RFC 7233 audio streaming supporting HTTP Range headers (`206 Partial Content`, suffix ranges, open-ended ranges, single-byte slices, and `416 Range Not Satisfiable`).
6. Cryptographic DRM token issuance, HMAC-SHA256 signature verification, and periodic playback heartbeat monitoring.

Empirical verification confirmed that all functional requirements are satisfied. One low-severity race condition was uncovered when the exact same user hits `POST /favorite` on the exact same course near-simultaneously across concurrent threads.

---

## Challenges

### [Low] Challenge 1: Unhandled `IntegrityError` on Concurrent Duplicate Favorite Race

- **Assumption challenged**: The worker assumed that sequential checks (`fav = res.scalar_one_or_none()`) inside `toggle_favorite` are sufficient to handle duplicate clicks.
- **Attack scenario**: A user double-clicks rapidly on the bookmark icon, or two client tabs make simultaneous `POST /api/v1/courses/{course_id}/favorite` requests under high latency. Both requests execute `SELECT FROM user_favorites` concurrently before either commits. Both find no existing row and both proceed to `INSERT INTO user_favorites`. The first insert succeeds; the second hits SQLite's unique constraint:
  ```
  sqlalchemy.exc.IntegrityError: (sqlite3.IntegrityError) UNIQUE constraint failed: user_favorites.user_id, user_favorites.course_id
  ```
  Because `course_service.toggle_favorite` does not wrap `await db.flush()` in a `try ... except IntegrityError:` block, this error propagates to FastAPI and returns an unhandled HTTP 500 error.
- **Blast radius**: Limited to the second request of a near-simultaneous duplicate click by the same authenticated student on the same course. Database data is not corrupted because SQLite rolls back the failing transaction.
- **Mitigation**: Wrap `await db.flush()` in `course_service.toggle_favorite` with:
  ```python
  except IntegrityError:
      await db.rollback()
      return {
          "success": True,
          "is_favorite": True,
          "course_id": course_id,
          "message": f"دوره «{course_title}» در نشانه‌گذاری‌ها ثبت است.",
      }
  ```

---

## Stress Test Results

| # | Challenge Vector | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|---|
| 1.1 | DRM Shield | Missing `token` query parameter | HTTP 422 Unprocessable / 403 Forbidden | HTTP 422 Unprocessable Entity | **PASS** |
| 1.2 | DRM Shield | Empty `?token=` parameter | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| 1.3 | DRM Shield | Forged HMAC signature in token | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| 1.4 | DRM Shield | Expired token timestamp (past 3600s) | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| 1.5 | DRM Shield | Cross-chapter reuse (issued for ch1, requested on ch2) | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| 1.6 | DRM Shield | Cross-course reuse (issued for c1, requested on c2) | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| 1.7 | DRM Shield | Playback heartbeat with valid vs forged vs expired token | Valid: 200 OK + watermark; Tampered: 403 | Valid: 200; Tampered: 403 | **PASS** |
| 2.1 | RFC 7233 | Full stream (no Range header) | HTTP 200 OK, Accept-Ranges, exact file bytes | 200 OK, Content-Length: 2,822,444 | **PASS** |
| 2.2 | RFC 7233 | Standard slice `bytes=0-1023` | HTTP 206, Content-Range `0-1023/2822444`, len 1024 | 206, exact binary slice match | **PASS** |
| 2.3 | RFC 7233 | Seek sub-chunk `bytes=100000-165535` | HTTP 206, Content-Range `100000-165535/2822444` | 206, exact 64KB slice match | **PASS** |
| 2.4 | RFC 7233 | Suffix range `bytes=-500` | HTTP 206, tail 500 bytes | 206, exact tail 500 bytes match | **PASS** |
| 2.5 | RFC 7233 | Oversized suffix `bytes=-99999999` | Clamped to entire file, 206 | 206, entire file match | **PASS** |
| 2.6 | RFC 7233 | Open-ended range `bytes=2000000-` | HTTP 206, bytes from 2000000 to EOF | 206, exact 822,444 bytes match | **PASS** |
| 2.7 | RFC 7233 | Single-byte boundary slices (`0-0` and `last-last`) | HTTP 206, len 1 | 206, exact byte 0 and last byte | **PASS** |
| 2.8 | RFC 7233 | Out-of-bounds start `bytes=99999999-` | HTTP 416, `Content-Range: bytes */2822444` | HTTP 416, Content-Range matches | **PASS** |
| 2.9 | RFC 7233 | Inverted range `bytes=500-200` | HTTP 416 Range Not Satisfiable | HTTP 416 Range Not Satisfiable | **PASS** |
| 2.10 | RFC 7233 | Multiple ranges `bytes=0-10,20-30` | HTTP 416 (single range parser) | HTTP 416 Range Not Satisfiable | **PASS** |
| 2.11 | RFC 7233 | Malformed syntax (`bytes=-0`, `abc-def`, `chars=0-10`) | HTTP 416 Range Not Satisfiable | HTTP 416 across all 8 variants | **PASS** |
| 3.1 | Schema | Composite index `ix_enrollments_user_course` | `(user_id, course_id)` in SQLite PRAGMA | Verified in PRAGMA index_info | **PASS** |
| 3.2 | Schema | Composite index `ix_user_favorites_user_course` | `(user_id, course_id)` in SQLite PRAGMA | Verified in PRAGMA index_info | **PASS** |
| 3.3 | Schema | Foreign key integrity and Cascade deletion on `UserFavorite` | Foreign key violation on bad ID; Cascade on User delete | Verified in SQLite directly | **PASS** |
| 3.4 | Schema | Toggle favorite ON and OFF via API | ON: creates row; OFF: deletes row | Verified in SQLite directly | **PASS** |
| 3.5 | Schema | GET `/api/v1/courses/favorites` | Returns list of favorited courses | Verified array of CourseDetail | **PASS** |
| 4.1 | Concurrency | SQLite WAL mode verification | `PRAGMA journal_mode;` returns `wal` | `wal` verified | **PASS** |
| 4.2 | Concurrency | 16 parallel threads creating favorites across distinct pairs | All 16 succeed with HTTP 200, no DB locks | 16/16 HTTP 200 | **PASS** |
| 4.3 | Concurrency | 20 mixed read/write tasks (read, range, favorite, profile) | Zero database lock errors | 20/20 HTTP 200/206 | **PASS** |
| 4.4 | Concurrency | 5 concurrent threads on IDENTICAL `(user, course)` favorite | Graceful handling or IntegrityError | 1 succeeded (200), 4 raised IntegrityError | **LOW (Logged)** |
| 5.1 | selectinload | `Course.lessons` access in async session | Zero `MissingGreenlet` exceptions | Successfully loaded | **PASS** |
| 5.2 | selectinload | `User.enrollments` in `_fetch_user_with_enrollments` | Eagerly loaded without extra queries | Successfully loaded | **PASS** |
| 5.3 | selectinload | `Order.items` and `Order.user` in `get_order_by_id_tx` | Eagerly loaded without extra queries | Successfully loaded | **PASS** |
| 6.1 | Scholar Identity | Name across root `/`, course catalog, seeds | Exactly «حجت الاسلام دکتر زنجیر زن حسینی» | 100% exact match | **PASS** |
| 6.2 | Anti-Slop | Persian error text in AppExceptions | No «می‌باشد», no «می‌گردد» | 100% compliant | **PASS** |

---

## Unchallenged Areas

- **Distributed SQLite Replication (LiteFS / rqlite)**: The platform is deployed as a single-node SQLite database in Docker. Distributed multi-region lock contention is out of scope for the current architecture.
- **Physical audio network latency and TCP throttling**: Range requests were benchmarked via FastAPI TestClient against local disk buffer (`sample_lecture.wav`). Real-world cellular buffering will be tested during PWA media player playback.
