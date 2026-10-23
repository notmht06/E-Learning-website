# Changes Log — Milestone 1 (Phase 6)

## Files Modified

1. **`backend/app/models/models.py`**
   - Added composite `Index("ix_enrollments_user_course", "user_id", "course_id")` to `Enrollment.__table_args__`.
   - Defined `UserFavorite` model with composite index `Index("ix_user_favorites_user_course", "user_id", "course_id")` and unique constraint `uq_user_course_favorite`.
   - Added `favorites` relationship on `User` model.
   - Added `favorited_by` relationship on `Course` model.

2. **`backend/app/models/database.py`**
   - In `init_db()` under `check_and_migrate`, added SQLite DDL migrations for:
     - `ix_enrollments_user_course`
     - `user_favorites` table creation
     - `uq_user_course_favorite` unique index
     - `ix_user_favorites_user_course` composite index

3. **`backend/app/models/__init__.py`**
   - Exported `UserFavorite` in `__all__`.

4. **`backend/app/services/course_service.py`**
   - Imported `selectinload` and `UserFavorite`.
   - Updated `get_enrolled_courses_for_user` to use `selectinload(Enrollment.course).selectinload(Course.lessons)`.
   - Added `get_course_from_db_tx` using `selectinload(Course.lessons)`.
   - Added `toggle_favorite` and `get_user_favorites` using `selectinload(UserFavorite.course).selectinload(Course.lessons)`.

5. **`backend/app/services/order_service.py`**
   - Imported `selectinload`.
   - Added `get_order_by_id_tx` using `selectinload(Order.items)` and `selectinload(Order.user)`.
   - Added `get_orders_for_user_tx` using `selectinload(Order.items)`.

6. **`backend/app/services/auth_service.py`**
   - Imported `selectinload`.
   - Refactored `_fetch_user_with_enrollments` to use `selectinload(User.enrollments)`, removing the secondary query.
   - Refactored `_authenticate_user_tx` and `_update_profile_tx` to use `selectinload(User.enrollments)`.

7. **`backend/app/api/v1/endpoints/stream.py`**
   - Implemented `parse_rfc7233_range(range_header, total_len)`.
   - Supported status 206 Partial Content, suffix ranges (`bytes=-500`), open-ended ranges (`bytes=500-`), and closed ranges (`bytes=0-1023`).
   - Implemented HTTP 416 Range Not Satisfiable with header `Content-Range: bytes */{total_len}`.
   - Cleanly sliced synthetic fallback buffer with accurate offsets and Content-Length.

8. **`backend/app/api/v1/endpoints/orders.py`**
   - Converted `get_order` to `async def` with `db: AsyncSession = Depends(get_db)`, querying via `order_service.get_order_by_id_tx`.

9. **`backend/app/api/v1/endpoints/courses.py`**
   - Added `GET /favorites` and `POST /{course_id}/favorite` endpoints.
   - Updated `get_course` to async def with `get_course_from_db_tx` DB fallback using `selectinload`.

10. **`backend/tests/test_in_memory.py`**
    - Enhanced `test_audio_range_streaming` to test suffix ranges (`bytes=-500`), out-of-range (`bytes=9999999-`), and inverted ranges (`bytes=500-200`) asserting 416.
    - Added `test_user_favorites_and_composite_indexes` verifying database composite indexes, unique constraints, and favorite toggling.
    - Test count increased to 15/15 passing.
