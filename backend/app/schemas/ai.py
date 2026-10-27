from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'assistant' or 'system'")
    content: str = Field(..., description="Message text content")
    timestamp: Optional[str] = None


class AIChatRequest(BaseModel):
    message: str = Field(..., description="User philosophical or course inquiry")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Prior multi-turn chat history")
    subject_filter: Optional[str] = Field(default=None, description="Optional discipline filter (e.g. حکمت متعالیه, فلسفه اشراق)")
    file_context: Optional[str] = Field(default=None, description="Extracted content from uploaded PDF/document")
    file_name: Optional[str] = Field(default=None, description="Name of the uploaded file")
    lang: Optional[str] = Field(default=None, description="Target response language ('fa', 'en', 'ar')")


class AICitation(BaseModel):
    source: str = Field(..., description="Reference treatise or course title")
    page_or_session: str = Field(..., description="Section, volume, or session reference")
    snippet: str = Field(..., description="Direct quote or doctrinal summary")
    media_type: Optional[str] = Field(default="text", description="Media type: audio, video, or text")
    timestamp_label: Optional[str] = Field(default=None, description="Timestamp interval e.g. 04:12 - 06:12")
    start_sec: Optional[int] = Field(default=None, description="Start second in media")
    end_sec: Optional[int] = Field(default=None, description="End second in media")


class MediaTranscriptIngestRequest(BaseModel):
    media_id: Optional[str] = Field(default=None, description="Unique media identifier")
    course_id: Optional[str] = Field(default=None, description="Course identifier")
    chapter_id: Optional[int] = Field(default=1, description="Chapter/session index")
    title: Optional[str] = Field(default=None, description="Title of the lecture or seminar")
    course_title: Optional[str] = Field(default=None, description="Course title")
    source: Optional[str] = Field(default=None, description="Course or treatise title")
    transcript: Optional[str] = Field(default=None, description="Full Persian transcript text")
    transcript_text: Optional[str] = Field(default=None, description="Full Persian transcript text")
    media_type: str = Field(default="audio", description="audio or video")
    session_name: Optional[str] = Field(default="", description="Session name or chapter title")
    subject: Optional[str] = Field(default="حکمت متعالیه", description="Discipline/subject")
    chunk_duration_sec: int = Field(default=120, description="Chunk interval in seconds (default 120s / 2min)")


class AIChatResponse(BaseModel):
    reply: str = Field(..., description="Dialectic answer formulated under rational Islamic philosophy standards")
    citations: List[AICitation] = Field(default=[], description="Authoritative grounding citations")
    suggested_followups: List[str] = Field(default=[], description="Related inquiries to advance comprehension")
    scholar_identity: str = Field(default="حجت الاسلام دکتر زنجیر زن حسینی", description="Official scholar name")


class AITranscribeRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64 encoded voice snippet")
    format: Optional[str] = Field(default="webm", description="Audio format")


class AITranscribeResponse(BaseModel):
    text: str = Field(..., description="Transcribed Persian query")
    confidence: float = Field(default=0.95, description="Confidence score")


class AIDocumentAnalysisRequest(BaseModel):
    document_text: str = Field(..., description="Extracted text from document")
    title: Optional[str] = Field(default=None, description="Document title")


class AIDocumentAnalysisResponse(BaseModel):
    summary: str = Field(..., description="Scholarly abstract of the document")
    dialectic_theses: List[str] = Field(default=[], description="Primary philosophical premises")
    philosophical_framework: str = Field(..., description="Discipline classification")
    critique: str = Field(..., description="Critical analysis from Sadrian and Illuminationist perspective")
