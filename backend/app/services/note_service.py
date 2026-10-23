"""
Student Study Notebook and Lecture Marginalia Service with SQLite/PostgreSQL Persistence.
Complies with Clean Architecture and BACKEND_SYSTEM_DESIGN.md.
"""
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.models import StudyNote


class NoteService:
    def __init__(self):
        self.notes: List[Dict[str, Any]] = [
            {
                "id": "note-1",
                "user_id": "usr-140301",
                "course_id": "course-ishraq",
                "chapter_id": 1,
                "title": "نورالانوار و قاعده الواحد",
                "content": "شیخ اشراق قاعده الواحد را در صدور انوار قاهره با رویکرد تشکیک نوری تقریر می‌فرماید.",
                "timestamp_sec": 412,
                "created_at": datetime.utcnow().isoformat(),
            }
        ]

    def get_study_notes(self, user_id: str, course_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves marginalia notes from memory cache."""
        results = [n for n in self.notes if n.get("user_id") == user_id]
        if course_id:
            results = [n for n in results if n.get("course_id") == course_id]
        return results

    async def get_study_notes_tx(
        self, db: AsyncSession, user_id: str, course_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves marginalia notes from persistent SQLite/PostgreSQL database."""
        stmt = select(StudyNote).where(StudyNote.user_id == user_id)
        if course_id:
            stmt = stmt.where(StudyNote.course_id == course_id)
        stmt = stmt.order_by(StudyNote.created_at.desc())
        res = await db.execute(stmt)
        db_notes = [n.to_dict() for n in res.scalars().all()]
        if db_notes:
            return db_notes
        return self.get_study_notes(user_id=user_id, course_id=course_id)

    def add_study_note(
        self,
        user_id: str,
        course_id: str,
        chapter_id: int,
        title: str,
        content: str,
        timestamp_sec: int,
    ) -> Dict[str, Any]:
        """Adds a student study note in memory."""
        note = {
            "id": f"note-{uuid.uuid4().hex[:8]}",
            "user_id": user_id,
            "course_id": course_id,
            "chapter_id": chapter_id,
            "title": title,
            "content": content,
            "timestamp_sec": timestamp_sec,
            "created_at": datetime.utcnow().isoformat(),
        }
        self.notes.insert(0, note)
        return note

    async def add_study_note_tx(
        self,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        chapter_id: int,
        title: str,
        content: str,
        timestamp_sec: int,
    ) -> Dict[str, Any]:
        """Persists a new study note in SQLite/PostgreSQL and syncs memory."""
        note_dict = self.add_study_note(user_id, course_id, chapter_id, title, content, timestamp_sec)
        db_note = StudyNote(
            id=note_dict["id"],
            user_id=user_id,
            course_id=course_id,
            chapter_id=chapter_id,
            title=title,
            content=content,
            timestamp_sec=timestamp_sec,
            created_at=datetime.utcnow(),
        )
        db.add(db_note)
        await db.flush()
        return db_note.to_dict()

    def update_study_note(self, note_id: str, user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates a study note belonging to the student."""
        for note in self.notes:
            if note.get("id") == note_id and note.get("user_id") == user_id:
                for key, val in data.items():
                    if val is not None:
                        note[key] = val
                return note
        return None

    async def update_study_note_tx(
        self, db: AsyncSession, note_id: str, user_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Updates a study note in SQLite/PostgreSQL database."""
        stmt = select(StudyNote).where(StudyNote.id == note_id, StudyNote.user_id == user_id)
        res = await db.execute(stmt)
        db_note = res.scalar_one_or_none()
        if db_note:
            if "title" in data and data["title"] is not None:
                db_note.title = data["title"]
            if "content" in data and data["content"] is not None:
                db_note.content = data["content"]
            if "timestamp_sec" in data and data["timestamp_sec"] is not None:
                db_note.timestamp_sec = data["timestamp_sec"]
            await db.flush()
            self.update_study_note(note_id, user_id, data)
            return db_note.to_dict()
        return self.update_study_note(note_id, user_id, data)

    def delete_study_note(self, note_id: str, user_id: str) -> bool:
        """Deletes a study note from memory."""
        initial_len = len(self.notes)
        self.notes = [n for n in self.notes if not (n.get("id") == note_id and n.get("user_id") == user_id)]
        return len(self.notes) < initial_len

    async def delete_study_note_tx(self, db: AsyncSession, note_id: str, user_id: str) -> bool:
        """Deletes a study note from SQLite/PostgreSQL database."""
        stmt = select(StudyNote).where(StudyNote.id == note_id, StudyNote.user_id == user_id)
        res = await db.execute(stmt)
        db_note = res.scalar_one_or_none()
        deleted_db = False
        if db_note:
            await db.delete(db_note)
            await db.flush()
            deleted_db = True
        deleted_mem = self.delete_study_note(note_id, user_id)
        return deleted_db or deleted_mem


note_service = NoteService()
