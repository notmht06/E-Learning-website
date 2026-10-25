import os
import uuid
import shutil
import asyncio
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.core.exceptions import AppException
from backend.app.schemas.admin import (
    AdminAnalyticsResponse,
    CourseCreateRequest,
    CourseUpdateRequest,
    ChapterCreateRequest,
    ChapterUpdateRequest,
    BookUpdateRequest,
    OrderStatusUpdateRequest,
)
from backend.app.services.admin_service import admin_service
from backend.app.api.deps import get_current_admin
from backend.app.models.database import get_db

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/", summary="Admin management status and scholar identity verification")
async def admin_root(admin: dict = Depends(get_current_admin)):
    """
    Root status check for administrative portal.
    Strictly restricted to admin role; unauthorized students receive HTTP 403.
    """
    return {
        "status": "ok",
        "role": "admin",
        "scholar_name": "حجت الاسلام دکتر زنجیر زن حسینی",
        "message": "پنل مدیریت حجت الاسلام دکتر زنجیر زن حسینی"
    }


@router.get("/analytics", response_model=AdminAnalyticsResponse, summary="Get dashboard KPI analytics")
async def get_analytics(admin: dict = Depends(get_current_admin)):
    """
    Returns real-time platform metrics: revenue, student enrollments, and audio streams.
    """
    return admin_service.get_analytics()


@router.post("/courses/create", summary="Create new academic lecture series")
async def create_course(
    req: CourseCreateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Publishes a new audio course series into the catalog and SQLite database.
    """
    course = await admin_service.create_course(req.dict(), db=db)
    return {"success": True, "course": course}


@router.put("/courses/{course_id}", summary="Update course metadata and settings")
async def update_course(
    course_id: str,
    req: CourseUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates course metadata, price, level, and description in memory and SQLite.
    """
    updated = await admin_service.update_course(course_id=course_id, data=req.dict(exclude_unset=True), db=db)
    return {"success": True, "course": updated}


@router.post("/courses/{course_id}/chapters", summary="Add audio lecture chapter")
async def add_chapter(
    course_id: str,
    req: ChapterCreateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Adds a new lesson chapter to the course curriculum in memory and SQLite.
    """
    new_chapter = await admin_service.add_chapter(course_id=course_id, data=req.dict(), db=db)
    return {"success": True, "chapter": new_chapter}


@router.put("/courses/{course_id}/chapters/{chapter_id}", summary="Update chapter metadata")
async def update_chapter(
    course_id: str,
    chapter_id: int,
    req: ChapterUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates chapter title, audio URL, or sample status in memory and SQLite.
    """
    updated = await admin_service.update_chapter(course_id=course_id, chapter_id=chapter_id, data=req.dict(exclude_unset=True), db=db)
    return {"success": True, "chapter": updated}


@router.delete("/courses/{course_id}/chapters/{chapter_id}", summary="Delete chapter from course")
async def delete_chapter(
    course_id: str,
    chapter_id: int,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.services.course_service import course_service
    from backend.app.models.models import Lesson
    from sqlalchemy import select
    deleted = course_service.delete_chapter(course_id=course_id, chapter_id=chapter_id)
    if db is not None:
        stmt = select(Lesson).where(Lesson.course_id == course_id, Lesson.session_number == chapter_id)
        res = await db.execute(stmt)
        lesson = res.scalar_one_or_none()
        if lesson:
            await db.delete(lesson)
            await db.flush()
    return {"success": deleted, "course_id": course_id, "chapter_id": chapter_id}


@router.put("/books/{book_id}", summary="Update book metadata and price")
async def update_book(book_id: str, req: BookUpdateRequest, admin: dict = Depends(get_current_admin)):
    """
    Updates book details, stock status, and price.
    """
    updated = admin_service.update_book(book_id=book_id, data=req.dict(exclude_unset=True))
    return {"success": True, "book": updated}


@router.post("/orders/update-status", summary="Update student order fulfillment status (POST)")
async def update_order_status_post(
    req: OrderStatusUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    if not req.order_id:
        raise AppException("شناسه سفارش (order_id) الزامی است.", status_code=400)
    target_status = req.new_status or req.status
    if not target_status:
        raise AppException("وضعیت جدید سفارش (new_status) الزامی است.", status_code=400)
    updated = await admin_service.update_order_status_db(
        order_id=req.order_id,
        status=target_status,
        postal_barcode=req.postal_barcode or req.postal_barcode_24digit,
        db=db,
    )
    return {"success": True, "order": updated}


@router.put("/orders/{order_id}/status", summary="Update student order fulfillment status (PUT)")
async def update_order_status(
    order_id: str,
    req: OrderStatusUpdateRequest,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    target_status = req.new_status or req.status
    if not target_status:
        raise AppException("وضعیت جدید سفارش (new_status) الزامی است.", status_code=400)
    updated = await admin_service.update_order_status_db(
        order_id=order_id,
        status=target_status,
        postal_barcode=req.postal_barcode or req.postal_barcode_24digit,
        db=db,
    )
    return {"success": True, "order": updated}


@router.delete("/courses/{course_id}", summary="Delete course from catalog")
async def delete_course(
    course_id: str,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Removes a course from the catalog and SQLite database.
    """
    deleted = await admin_service.delete_course(course_id=course_id, db=db)
    return {"success": True, "course": deleted}


ALLOWED_MEDIA_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".jpg", ".jpeg", ".png", ".webp", ".pdf"}


@router.post("/upload", summary="Upload media file (audio/cover image)")
async def upload_media(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin)
):
    """
    Uploads a media file to backend/app/static/uploads/ and returns relative URL.
    Enforces maximum file size limit (MAX_UPLOAD_SIZE_MB) chunk-by-chunk.
    Removes partial files and raises HTTP 413 if upload exceeds size limit.
    """
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_MEDIA_EXTENSIONS:
        raise AppException(
            "فرمت فایل ارسالی مجاز نیست. تنها فایل‌های صوتی، تصویری و اسناد PDF پشتیبانی می‌شوند.",
            status_code=400
        )

    upload_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "static", "uploads")
    )
    os.makedirs(upload_dir, exist_ok=True)
    safe_name = f"{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(upload_dir, safe_name)

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    chunk_size = 1024 * 1024  # 1 MB chunks
    total_bytes = 0

    try:
        with open(dest_path, "wb") as buffer:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    buffer.close()
                    if os.path.exists(dest_path):
                        try:
                            os.remove(dest_path)
                        except OSError:
                            pass
                    raise AppException(
                        f"حجم فایل بیش از سقف مجاز ({settings.MAX_UPLOAD_SIZE_MB} مگابایت) است.",
                        code="PAYLOAD_TOO_LARGE",
                        status_code=413,
                    )
                buffer.write(chunk)
    except AppException:
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except OSError:
                pass
        raise
    except Exception as exc:
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except OSError:
                pass
        raise AppException(
            f"خطا در پردازش یا ذخیره‌سازی فایل: {str(exc)}",
            code="FILE_UPLOAD_ERROR",
            status_code=500,
        )

    return {
        "success": True,
        "file_url": f"/static/uploads/{safe_name}",
        "filename": safe_name,
        "original_filename": file.filename,
    }

