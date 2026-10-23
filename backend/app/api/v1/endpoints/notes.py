"""
Student Study Notebook and Lecture Marginalia API Endpoints with DB Persistence.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.schemas.note import StudyNoteCreate, StudyNoteResponse, StudyNoteUpdate
from backend.app.services.note_service import note_service
from backend.app.api.deps import get_current_user
from backend.app.models.database import get_db

router = APIRouter()


@router.get("/", response_model=List[StudyNoteResponse], summary="List student study notes")
async def get_notes(
    course_id: Optional[str] = None,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await note_service.get_study_notes_tx(db=db, user_id=user["id"], course_id=course_id)


@router.post("/create", response_model=StudyNoteResponse, summary="Create a new study note")
async def create_note(
    req: StudyNoteCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await note_service.add_study_note_tx(
        db=db,
        user_id=user["id"],
        course_id=req.course_id,
        chapter_id=req.chapter_id,
        title=req.title,
        content=req.content,
        timestamp_sec=req.timestamp_sec,
    )


@router.put("/{note_id}", response_model=StudyNoteResponse, summary="Update student study note")
async def update_note(
    note_id: str,
    req: StudyNoteUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await note_service.update_study_note_tx(
        db=db,
        note_id=note_id,
        user_id=user["id"],
        data=req.model_dump(exclude_unset=True),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="یادداشت مورد نظر یافت نشد یا دسترسی به آن مجاز نیست.")
    return updated


@router.delete("/{note_id}", summary="Delete student study note")
async def delete_note(
    note_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    success = await note_service.delete_study_note_tx(db=db, note_id=note_id, user_id=user["id"])
    return {"success": success}
