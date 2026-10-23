"""
Scholarly discussions and student Q&A Pydantic v2 schemas.
"""
from typing import Optional
from pydantic import BaseModel, Field


class QAQuestionCreate(BaseModel):
    course_id: str = Field(..., example="course-ishraq")
    chapter_id: int = Field(default=1, ge=1, example=1)
    title: str = Field(..., min_length=3, max_length=255, example="Question regarding Light of Lights")
    question_text: str = Field(..., min_length=5, example="How does Suhrawardi solve the problem of multiple emanations?")


class QAAnswerCreate(BaseModel):
    answer_text: str = Field(..., min_length=5, example="Suhrawardi posits reciprocal illuminations among intermediary lights...")


class QAQuestionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    question_text: Optional[str] = Field(None, min_length=5)
    is_resolved: Optional[bool] = None


class QAMessageResponse(BaseModel):
    id: str
    course_id: str
    user_name: str
    title: str
    question_text: str
    answer_text: Optional[str] = None
    is_resolved: bool = False
    created_at: str
