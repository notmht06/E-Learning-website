"""
Scholarly Discussions and Student-Professor Q&A Forum Service with DB Persistence.
"""
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.exceptions import EntityNotFoundException
from backend.app.models.models import QADiscussion


class QAService:
    def __init__(self):
        self.qa_messages: List[Dict[str, Any]] = [
            {
                "id": "qa-101",
                "course_id": "course-ishraq",
                "chapter_id": 1,
                "user_name": "سید مهدی موسوی",
                "title": "قاعده الواحد و صدور انوار در حکمت اشراق",
                "question_text": "آیا شیخ اشراق قاعده الواحد مشائیان را در نظام نوری خود به صورت مطلق میپذیرد یا در آن تصرف میکند؟",
                "answer_text": "شیخ اشراق در التلویحات و حکمةالاشراق قاعده الواحد را در نور اول (نور اقرب) صادق میداند، اما در مراتب بعدی کثرت را از حیثیات نوری و اشراقات متقابل توجیه میفرماید.",
                "is_resolved": True,
                "created_at": datetime.utcnow().isoformat(),
            }
        ]

    def get_qa_discussions(self, course_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if course_id:
            return [m for m in self.qa_messages if m.get("course_id") == course_id]
        return list(self.qa_messages)

    async def get_qa_discussions_tx(
        self, db: AsyncSession, course_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        stmt = select(QADiscussion)
        if course_id:
            stmt = stmt.where(QADiscussion.course_id == course_id)
        stmt = stmt.order_by(QADiscussion.created_at.desc())
        res = await db.execute(stmt)
        rows = [q.to_dict() for q in res.scalars().all()]
        if rows:
            return rows
        return self.get_qa_discussions(course_id=course_id)

    def add_qa_question(
        self,
        course_id: str,
        user_name: str,
        title: str,
        question_text: str,
        chapter_id: int = 1,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        qa = {
            "id": f"qa-{uuid.uuid4().hex[:8]}",
            "course_id": course_id,
            "chapter_id": chapter_id,
            "user_id": user_id,
            "user_name": user_name,
            "title": title,
            "question_text": question_text,
            "answer_text": None,
            "is_resolved": False,
            "created_at": datetime.utcnow().isoformat(),
        }
        self.qa_messages.insert(0, qa)
        return qa

    async def add_qa_question_tx(
        self,
        db: AsyncSession,
        course_id: str,
        user_name: str,
        title: str,
        question_text: str,
        chapter_id: int = 1,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        qa_dict = self.add_qa_question(course_id, user_name, title, question_text, chapter_id, user_id)
        db_qa = QADiscussion(
            id=qa_dict["id"],
            course_id=course_id,
            chapter_id=chapter_id,
            user_id=user_id,
            user_name=user_name,
            title=title,
            question_text=question_text,
            answer_text=None,
            is_resolved=False,
            created_at=datetime.utcnow(),
        )
        db.add(db_qa)
        await db.flush()
        return db_qa.to_dict()

    def answer_qa_question(self, question_id: str, answer_text: str) -> Dict[str, Any]:
        for qa in self.qa_messages:
            if qa.get("id") == question_id:
                qa["answer_text"] = answer_text
                qa["is_resolved"] = True
                return qa
        raise EntityNotFoundException(message=f"پرسش علمی با شناسه '{question_id}' یافت نشد.")

    async def answer_qa_question_tx(
        self, db: AsyncSession, question_id: str, answer_text: str
    ) -> Dict[str, Any]:
        stmt = select(QADiscussion).where(QADiscussion.id == question_id)
        res = await db.execute(stmt)
        db_qa = res.scalar_one_or_none()
        if db_qa:
            db_qa.answer_text = answer_text
            db_qa.is_resolved = True
            await db.flush()
            try:
                self.answer_qa_question(question_id, answer_text)
            except Exception:
                pass
            return db_qa.to_dict()
        return self.answer_qa_question(question_id, answer_text)


qa_service = QAService()
