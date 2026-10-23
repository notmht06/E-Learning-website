"""
Scholarly Discussions and Student-Professor Q&A Forum Endpoints with DB Persistence.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.schemas.qa import QAQuestionCreate, QAAnswerCreate, QAMessageResponse
from backend.app.services.qa_service import qa_service
from backend.app.api.deps import get_current_user, get_current_admin
from backend.app.models.database import get_db

router = APIRouter()


@router.get("/", response_model=List[QAMessageResponse], summary="List scholarly discussions")
async def list_discussions(
    course_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await qa_service.get_qa_discussions_tx(db=db, course_id=course_id)


@router.post("/ask", response_model=QAMessageResponse, summary="Submit question to the professor")
async def ask_question(
    req: QAQuestionCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await qa_service.add_qa_question_tx(
        db=db,
        course_id=req.course_id,
        chapter_id=req.chapter_id,
        user_id=user.get("id"),
        user_name=user.get("full_name", "دانش‌پژوه حکمت"),
        title=req.title,
        question_text=req.question_text,
    )


@router.post("/{question_id}/answer", response_model=QAMessageResponse, summary="Publish official answer")
async def answer_question(
    question_id: str,
    req: QAAnswerCreate,
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await qa_service.answer_qa_question_tx(
            db=db, question_id=question_id, answer_text=req.answer_text
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
