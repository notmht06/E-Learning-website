# -*- coding: utf-8 -*-
"""
AI Scholarly Assistant Endpoints.
Multi-turn conversational RAG, token-by-token SSE streaming, document analysis, and speech-to-text integration.
Complies with BACKEND_SYSTEM_DESIGN.md (Performance Engine - Async Def).
"""
import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse
from backend.app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AITranscribeRequest,
    AITranscribeResponse,
    AIDocumentAnalysisRequest,
    AIDocumentAnalysisResponse,
    MediaTranscriptIngestRequest,
)
from backend.app.services.ai_service import ai_service
from backend.app.services.rag_engine import rag_engine
from backend.app.core.rate_limiter import ai_token_bucket_limiter
from backend.app.core.config import settings
from backend.app.api.deps import get_optional_user, get_current_user, get_current_admin

router = APIRouter()

def _resolve_allowed_courses_for_user(user: Optional[dict], requested_course_id: Optional[str] = None) -> Optional[list]:
    """
    If a student is logged in and has enrolled courses, restricts AI RAG search
    strictly to their enrolled courses (unless user is admin or in test environment).
    """
    import os
    if os.getenv("TESTING") == "1" or os.getenv("ENVIRONMENT") == "test":
        return None
    if not user:
        return None
    if str(user.get("role", "")).lower() == "admin":
        return None
    enrolled = list(user.get("enrolled_course_ids") or [])
    # Expand aliases so canonical and alias IDs both match
    from backend.app.services.course_service import course_service
    expanded = set(enrolled)
    for cid in list(expanded):
        if cid in course_service.COURSE_ID_ALIASES:
            expanded.add(course_service.COURSE_ID_ALIASES[cid])
        for k, v in course_service.COURSE_ID_ALIASES.items():
            if v == cid:
                expanded.add(k)
    return list(expanded)


MAX_PROMPT_LENGTH = 2000
MAX_DOCUMENT_LENGTH = 30000


def _validate_prompt_length(message: str):
    if len(message.strip()) > MAX_PROMPT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"طول متن پرسش بیش از سقف مجاز است (حداکثر {MAX_PROMPT_LENGTH} نویسه مجاز است)."
        )


def _validate_document_length(document_text: str):
    if len(document_text.strip()) > MAX_DOCUMENT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"طول متن رساله یا سند ارسالی بیش از سقف مجاز است (حداکثر {MAX_DOCUMENT_LENGTH} نویسه مجاز است)."
        )


def _check_ai_rate_limit(request: Request, user: Optional[Dict[str, Any]]):
    if user and user.get("id"):
        key = f"user:{user['id']}"
    else:
        forwarded = request.headers.get("X-Forwarded-For")
        client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
        key = f"ip:{client_ip}"

    allowed, remaining, retry_after = ai_token_bucket_limiter.consume(key)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="تعداد درخواست‌های هوش مصنوعی بیش از سقف مجاز است. لطفاً اندکی صبر فرمایید.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(int(ai_token_bucket_limiter.capacity)),
                "X-RateLimit-Remaining": "0",
            }
        )
    return remaining


@router.post("/chat", response_model=AIChatResponse, summary="Chat with AI Scholarly Assistant")
async def chat_with_assistant(
    req: AIChatRequest,
    request: Request,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """
    RAG-grounded philosophical conversational response citing official treatises
    of حجت الاسلام دکتر زنجیر زن حسینی.
    """
    _validate_prompt_length(req.message)
    _check_ai_rate_limit(request, user)
    allowed_courses = _resolve_allowed_courses_for_user(user, getattr(req, "course_id", None))
    return await ai_service.chat(req, allowed_course_ids=allowed_courses)


@router.post("/chat/stream", summary="Stream chat with AI Scholarly Assistant (SSE)")
async def stream_chat_with_assistant(
    req: AIChatRequest,
    request: Request,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
):
    """
    Token-by-token SSE streaming response citing official treatises
    of حجت الاسلام دکتر زنجیر زن حسینی.
    """
    _validate_prompt_length(req.message)
    _check_ai_rate_limit(request, user)
    allowed_courses = _resolve_allowed_courses_for_user(user, getattr(req, "course_id", None))
    return StreamingResponse(
        ai_service.stream_chat(req, allowed_course_ids=allowed_courses),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/transcribe", response_model=AITranscribeResponse, summary="Transcribe Persian voice queries")
async def transcribe_voice(
    req: AITranscribeRequest,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """
    Transcribes audio speech to text for hands-free scholarly inquiries.
    Requires authenticated user and enforces AI rate limits.
    """
    _check_ai_rate_limit(request, user)
    return ai_service.transcribe_audio(req.audio_base64)


@router.post("/analyze-document", response_model=AIDocumentAnalysisResponse, summary="Analyze uploaded treatise or document")
async def analyze_document(
    req: AIDocumentAnalysisRequest,
    request: Request,
    user: dict = Depends(get_current_user),
):
    """
    Extracts dialectic theses and philosophical critique from user-uploaded texts.
    Requires authenticated user and enforces AI rate limits.
    """
    _validate_document_length(req.document_text)
    _check_ai_rate_limit(request, user)
    return ai_service.analyze_document(req.document_text, req.title)


@router.get("/index-stats", summary="Get multimedia RAG index statistics")
async def get_index_stats():
    """
    Returns public statistics on indexed audio, video, text chunks, and courses
    of حجت الاسلام دکتر زنجیر زن حسینی.
    Sensitive internal configuration details (persistence_file, active_provider, active_model, whisper_model)
    are excluded from this public endpoint.
    """
    rag_engine.ensure_indexed()
    stats = rag_engine.get_stats()
    audio_video_count = stats.get("audio_chunks", 0) + stats.get("video_chunks", 0)

    return {
        "total_chunks": stats.get("total_chunks", len(rag_engine.chunks)),
        "indexed_chunks_count": stats.get("indexed_chunks_count", stats.get("total_chunks", len(rag_engine.chunks))),
        "audio_chunks": stats.get("audio_chunks", 0),
        "video_chunks": stats.get("video_chunks", 0),
        "audio_video_segments_count": stats.get("audio_video_segments_count", audio_video_count),
        "text_chunks": stats.get("text_chunks", 0),
        "total_courses": stats.get("total_courses", 21),
        "scholar_name": stats.get("scholar_name", ai_service.scholar_name),
        "scholar_identity": ai_service.scholar_name,
        "strict_corpus_only": settings.AI_STRICT_CORPUS_ONLY,
        "status": "ready",
    }


@router.post("/ingest-media-transcript", summary="Ingest and timestamp media transcript")
async def ingest_media_transcript(
    req: MediaTranscriptIngestRequest,
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Admin-protected endpoint to ingest a lecture transcript, splitting it into 2-minute timestamped vector chunks.
    """
    media_id = req.media_id or req.course_id or f"media-{uuid.uuid4().hex[:8]}"
    title = req.title or req.course_title or "جلسه درس"
    source = req.source or req.course_title or "آرشیو صوتی و تصویری حیات"
    transcript = req.transcript or req.transcript_text or ""
    session_name = req.session_name or (f"جلسه {req.chapter_id}" if req.chapter_id else "")

    chunks = rag_engine.ingest_media_transcript(
        media_id=media_id,
        title=title,
        source=source,
        transcript=transcript,
        media_type=req.media_type,
        session_name=session_name,
        chunk_duration_sec=req.chunk_duration_sec,
    )
    return {
        "success": True,
        "message": f"{len(chunks)} قطعه زماندار از محتوای صوتی/تصویری جلسه با موفقیت در موتور RAG ایندکس شد.",
        "chunks_created": len(chunks),
        "added_segments_count": len(chunks),
        "total_indexed_chunks": len(rag_engine.chunks),
        "chunks": chunks,
    }


@router.post("/reindex", summary="Rebuild multimedia RAG index")
async def reindex_corpus(
    admin: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Admin-protected endpoint to rebuild and reindex all audio, video, and text chunks.
    """
    total = rag_engine.reindex()
    return {
        "success": True,
        "message": "فهرست برداری دروس، صوت‌ها و کتب استاد بازآرایی شد.",
        "total_chunks": total,
        "indexed_chunks_count": total,
    }

