"""
Student study notes and marginalia Pydantic v2 schemas.
"""
from typing import Optional
from pydantic import BaseModel, Field


class StudyNoteCreate(BaseModel):
    course_id: str = Field(..., example="course-ishraq")
    chapter_id: int = Field(..., example=1)
    title: str = Field(..., min_length=2, max_length=255, example="Ontology of Lights Note")
    content: str = Field(..., min_length=1, example="The Sheikh of Illumination considers Light as self-manifesting...")
    timestamp_sec: int = Field(default=0, ge=0, example=345)


class StudyNoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    timestamp_sec: Optional[int] = Field(None, ge=0)


class StudyNoteResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    chapter_id: int
    title: str
    content: str
    timestamp_sec: int
    created_at: str
