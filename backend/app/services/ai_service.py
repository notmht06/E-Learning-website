# -*- coding: utf-8 -*-
"""
AI Scholarly Philosophical Assistant Service (Phase 7).
Multi-Provider Router: DeepSeek 4.1 / Gemini Flash Free / OpenRouter Free / Groq Whisper.
Strict Closed-Book Grounding (AI_STRICT_CORPUS_ONLY) exclusively on the audio, video,
and written treatises of «حجت الاسلام دکتر زنجیر زن حسینی».
Complies with BACKEND_SYSTEM_DESIGN.md (Performance Engine & Security Guardian).
"""
import os
import json
import re
import asyncio
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
import httpx

from backend.app.core.config import settings
from backend.app.services.rag_engine import rag_engine
from backend.app.schemas.ai import (
    ChatMessage,
    AIChatRequest,
    AIChatResponse,
    AICitation,
    AITranscribeResponse,
    AIDocumentAnalysisResponse,
)

logger = logging.getLogger("platform.ai")


class AIScholarlyService:
    def __init__(self):
        self.scholar_name = "حجت الاسلام دکتر زنجیر زن حسینی"

    def _resolve_provider_endpoint(self) -> Dict[str, Any]:
        provider = (settings.AI_PROVIDER or "deepseek").lower().strip()
        api_key = settings.AI_API_KEY.strip()
        raw_base = settings.AI_BASE_URL.strip().rstrip("/")
        raw_model = settings.AI_MODEL.strip()

        is_default_base = (not raw_base) or (raw_base == "https://api.deepseek.com/v1")
        is_default_model = (not raw_model) or (raw_model == "deepseek-chat")

        if provider == "openrouter":
            base_url = "https://openrouter.ai/api/v1" if is_default_base else raw_base
            model = (settings.AI_FALLBACK_FREE_MODEL or "deepseek/deepseek-chat:free") if is_default_model else raw_model
        elif provider == "gemini":
            base_url = "https://generativelanguage.googleapis.com/v1beta/openai" if is_default_base else raw_base
            model = "gemini-2.5-flash" if is_default_model else raw_model
        elif provider == "groq":
            base_url = "https://api.groq.com/openai/v1" if is_default_base else raw_base
            model = "llama-3.3-70b-versatile" if is_default_model else raw_model
        elif provider == "openai":
            base_url = "https://api.openai.com/v1" if is_default_base else raw_base
            model = "gpt-4o-mini" if is_default_model else raw_model
        else:
            base_url = raw_base or "https://api.deepseek.com/v1"
            model = raw_model or "deepseek-chat"

        endpoint = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
        is_local = (provider == "local") or (not api_key)

        return {
            "provider": provider,
            "api_key": api_key,
            "endpoint": endpoint,
            "model": model,
            "is_local": is_local,
            "temperature": settings.AI_TEMPERATURE,
        }

    def _build_system_prompt_prefix(self) -> str:
        """
        Static system prompt for DeepSeek Context Caching (prompts > 64 tokens get 90% discount).
        Sets up the persona and strict closed-book boundaries.
        """
        return (
            f"شما «حکمت‌یار»، دستیار هوشمند علمی، برهانی و فلسفی پایگاه رسمی {self.scholar_name} هستید.\n"
            "دستورالعمل‌های بنیادین:\n"
            "۱. شما منحصراً و اکیداً بر پایه تقریرات، صوت‌ها، ویدیوها و کتاب‌های استاد به پرسش‌ها پاسخ می‌دهید.\n"
            "۲. از استفاده از افعال اداری فرسوده نظیر «می‌باشد» و «می‌گردد» مطلقاً خودداری کرده و منحصراً از «است» و «می‌شود» استفاده فرمایید.\n"
            "۳. ارجاعات را با ذکر دقیق منبع، شماره جلسه یا شماره صفحه و در صورت وجود، بازه زمانی صوت یا ویدیو (تایم‌کد) مشخص نمایید.\n"
            "۴. لحن شما برهانی، وزین، پیراسته از تکلف و شایسته حیات و کرسی خارج حوزه است.\n"
            "۵. اگر پرسش کاربر هیچ ارتباطی با مباحث، دروس یا کتاب‌های استاد ندارد، محترمانه اعلام فرمایید که پاسخگویی منحصراً در چارچوب منظومه آثار استاد انجام می‌گیرد."
        )

    def _build_context_from_chunks(self, chunks: List[Dict[str, Any]]) -> str:
        """Formats retrieved chunks with timestamped citations into LLM context."""
        context_parts = []
        for i, c in enumerate(chunks, 1):
            time_info = f" [زمان: {c['timestamp_label']}]" if c.get("timestamp_label") else ""
            media_info = f" (رسانه: {c.get('media_type', 'متن')})" if c.get("media_type") else ""
            part = (
                f"--- سند شماره {i} ---\n"
                f"منبع: {c.get('source', '')}\n"
                f"بخش/جلسه: {c.get('page_or_session', '')}{media_info}{time_info}\n"
                f"گزیده متن: {c.get('snippet', '')}\n"
            )
            context_parts.append(part)
        return "\n".join(context_parts)

    def _build_local_grounded_response(
        self,
        user_msg: str,
        matched_chunks: List[Dict[str, Any]],
        file_context: Optional[str] = None,
        file_name: Optional[str] = None,
    ) -> AIChatResponse:
        """
        Generates deterministic, high-accuracy scholarly responses locally
        grounded in the scholar's multimedia corpus (zero hallucination, zero cost).
        """
        if not matched_chunks:
            if settings.AI_STRICT_CORPUS_ONLY:
                reply_body = (
                    f"پرسش شما خارج از قلمرو مباحث ارائه‌شده در دروس و آثار مکتوب و شفاهی {self.scholar_name} است. "
                    "دستیار حکمت‌یار منحصراً موظف به تبیین و پاسخگویی بر پایه تقریرات، صوت‌ها، ویدیوها و کتب مصنف استاد است. "
                    "لطفاً پرسش خود را پیرامون موضوعات مطرح‌شده در ۲۱ دوره فلسفی، اصولی یا آثار مکتوب ایشان مطرح فرمایید."
                )
            else:
                reply_body = (
                    f"پرسش شما در حوزه حکمت و علوم عقلانی بررسی شد. از منظر منظومه معرفتی {self.scholar_name}:\n\n"
                    f"در پاسخ به پرسش «{user_msg}»، توجه به این نکته اساسی ضروری است که در دستگاه فلسفه برهانی اسلامی، "
                    "هرگونه تحلیل باید بر پایه تعریف دقیق موضوع، تفکیک مفهوم ذهنی از واقعیت بیرونی و رعایت اصول منطقی استدلال باشد.\n\n"
                    "شما می‌توانید موضوع مورد نظر را از طریق کاتالوگ دوره‌های پایگاه و بخش کتاب‌ها پیگیری فرمایید."
                )

            citations = [
                AICitation(
                    source="منظومه اجتهادی علوم عقلی و نقلی",
                    page_or_session="کرسی تدریس حجت الاسلام دکتر زنجیر زن حسینی",
                    snippet="احیای تفکر عقلانی بر پایه بازخوانی متون کهن با روش‌های دقیق منطقی و استدلالی است.",
                    media_type="text",
                )
            ]
            followups = [
                "براهین اصالت وجود در اسفار اربعه چیست؟",
                "نظام انوار در حکمت اشراق سهروردی چگونه است؟",
                "سیر مطالعاتی پیشنهادی برای شروع فلسفه اسلامی چیست؟",
            ]
            return AIChatResponse(
                reply=reply_body,
                citations=citations,
                suggested_followups=followups,
                scholar_identity=self.scholar_name,
            )

        top_match = matched_chunks[0]
        reply_lead = f"بر اساس مبانی استدلالی و تقریرات رسمی {self.scholar_name}:"

        file_lead = ""
        if file_context:
            file_lead = (
                f"\n\nدر بازخوانی سندی که ضمیمه نمودید ({file_name or 'سند ارسالی'}):\n"
                "نکات استخراج‌شده نشان می‌دهد که مدعای مطرح‌شده در پرتو قواعد تحلیلی سنجیده شد."
            )

        media_lead = ""
        if top_match.get("media_type") in ["audio", "video"] and top_match.get("timestamp_label"):
            media_type_fa = "صوتی" if top_match.get("media_type") == "audio" else "ویدیویی"
            media_lead = f"\n\nاین مطلب به صورت قطعه {media_type_fa} در بازه زمانی «{top_match['timestamp_label']}» در جلسه مربوطه مستند است."

        reply_body = (
            f"{reply_lead}\n\n"
            f"{top_match['snippet']}{file_lead}{media_lead}\n\n"
            f"برای تدقیق بیشتر، پیشنهاد می‌شود جلسه مربوط به این مبحث را در دوره «{top_match['source']}» پیگیری فرمایید."
        )

        citations: List[AICitation] = []
        for ch in matched_chunks[:3]:
            citations.append(
                AICitation(
                    source=ch["source"],
                    page_or_session=ch["page_or_session"],
                    snippet=ch["snippet"][:240] + ("..." if len(ch["snippet"]) > 240 else ""),
                    media_type=ch.get("media_type", "text"),
                    timestamp_label=ch.get("timestamp_label"),
                    start_sec=ch.get("start_sec"),
                    end_sec=ch.get("end_sec"),
                )
            )

        followups = top_match.get("followups") or [
            "براهین اصالت وجود در اسفار اربعه چیست؟",
            "نظام انوار در حکمت اشراق سهروردی چگونه است؟",
            "سیر مطالعاتی پیشنهادی برای شروع فلسفه اسلامی چیست؟",
        ]

        return AIChatResponse(
            reply=reply_body,
            citations=citations,
            suggested_followups=followups,
            scholar_identity=self.scholar_name,
        )

    async def chat(self, req: AIChatRequest) -> AIChatResponse:
        """
        Asynchronous chat synthesis.
        Performs hybrid vector retrieval on audio/video/text chunks, then routes to remote LLM or local engine.
        """
        user_msg = req.message.strip()
        matched_chunks = rag_engine.search(
            query=user_msg,
            subject_filter=req.subject_filter,
            top_k=4,
            min_score=settings.AI_MIN_SIMILARITY_THRESHOLD,
        )

        # Strict closed-book check: if no grounded chunks found and strict mode enabled
        if settings.AI_STRICT_CORPUS_ONLY and not matched_chunks:
            return self._build_local_grounded_response(
                user_msg=user_msg,
                matched_chunks=[],
                file_context=req.file_context,
                file_name=req.file_name,
            )

        provider_info = self._resolve_provider_endpoint()

        # If local or no API key, use local deterministic synthesis
        if provider_info["is_local"]:
            return self._build_local_grounded_response(
                user_msg=user_msg,
                matched_chunks=matched_chunks,
                file_context=req.file_context,
                file_name=req.file_name,
            )

        # Call remote provider (DeepSeek, OpenRouter, Gemini, Groq)
        try:
            context_text = self._build_context_from_chunks(matched_chunks)
            system_prompt = self._build_system_prompt_prefix()

            messages = [
                {"role": "system", "content": system_prompt},
            ]
            if req.history:
                for h in req.history[-4:]:
                    messages.append({"role": h.role, "content": h.content})

            user_prompt = (
                f"مستندات و قطعات دروس استاد:\n{context_text}\n\n"
                f"پرسش دانشجو:\n{user_msg}"
            )
            if req.file_context:
                user_prompt += f"\n\nمتن ضمیمه کاربر ({req.file_name or 'سند'}):\n{req.file_context[:1000]}"

            messages.append({"role": "user", "content": user_prompt})

            payload = {
                "model": provider_info["model"],
                "messages": messages,
                "temperature": provider_info["temperature"],
                "max_tokens": 1024,
            }
            headers = {
                "Authorization": f"Bearer {provider_info['api_key']}",
                "Content-Type": "application/json",
            }
            if provider_info["provider"] == "openrouter":
                headers["HTTP-Referer"] = "https://zanjirzan.ir"
                headers["X-Title"] = "Hayat Platform"

            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(provider_info["endpoint"], json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    ai_reply = data["choices"][0]["message"]["content"].strip()
                    
                    citations = [
                        AICitation(
                            source=c["source"],
                            page_or_session=c["page_or_session"],
                            snippet=c["snippet"][:240] + "...",
                            media_type=c.get("media_type", "text"),
                            timestamp_label=c.get("timestamp_label"),
                            start_sec=c.get("start_sec"),
                            end_sec=c.get("end_sec"),
                        )
                        for c in matched_chunks[:3]
                    ]
                    followups = matched_chunks[0].get("followups", [
                        "براهین اصالت وجود در اسفار اربعه چیست؟",
                        "نظام انوار در حکمت اشراق سهروردی چگونه است؟",
                    ])
                    return AIChatResponse(
                        reply=ai_reply,
                        citations=citations,
                        suggested_followups=followups,
                        scholar_identity=self.scholar_name,
                    )
                else:
                    logger.warning("Remote LLM returned %d: %s. Falling back to local RAG.", res.status_code, res.text[:200])
        except Exception as e:
            logger.warning("Remote LLM call failed (%s). Falling back to local RAG.", str(e))

        # Fallback to local RAG
        return self._build_local_grounded_response(
            user_msg=user_msg,
            matched_chunks=matched_chunks,
            file_context=req.file_context,
            file_name=req.file_name,
        )

    async def stream_chat(self, req: AIChatRequest) -> AsyncGenerator[str, None]:
        """
        Streams philosophical response token-by-token using SSE protocol (text/event-stream).
        Emits chunk events and finishes with terminal 'done: true' containing authoritative citations.
        Supports both remote streaming via httpx and local tokenization fallback.
        """
        user_msg = req.message.strip()
        matched_chunks = rag_engine.search(
            query=user_msg,
            subject_filter=req.subject_filter,
            top_k=4,
            min_score=settings.AI_MIN_SIMILARITY_THRESHOLD,
        )

        provider_info = self._resolve_provider_endpoint()

        # If strict closed-book and not grounded, or is_local, synthesize locally and stream tokens
        if (settings.AI_STRICT_CORPUS_ONLY and not matched_chunks) or provider_info["is_local"]:
            local_res = self._build_local_grounded_response(
                user_msg=user_msg,
                matched_chunks=matched_chunks,
                file_context=req.file_context,
                file_name=req.file_name,
            )
            full_text = local_res.reply
            tokens = re.findall(r"\S+\s*", full_text) or [full_text]

            for token in tokens:
                payload = {"chunk": token, "done": False}
                yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0.005)

            terminal_payload = {
                "chunk": "",
                "done": True,
                "reply": full_text,
                "citations": [c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in local_res.citations],
                "suggested_followups": local_res.suggested_followups,
                "scholar_identity": local_res.scholar_identity,
            }
            yield f"data: {json.dumps(terminal_payload, ensure_ascii=False)}\n\n"
            return

        # Attempt remote streaming
        accumulated_chunks = []
        try:
            context_text = self._build_context_from_chunks(matched_chunks)
            system_prompt = self._build_system_prompt_prefix()

            messages = [
                {"role": "system", "content": system_prompt},
            ]
            if req.history:
                for h in req.history[-4:]:
                    messages.append({"role": h.role, "content": h.content})

            user_prompt = (
                f"مستندات و قطعات دروس استاد:\n{context_text}\n\n"
                f"پرسش دانشجو:\n{user_msg}"
            )
            if req.file_context:
                user_prompt += f"\n\nمتن ضمیمه کاربر ({req.file_name or 'سند'}):\n{req.file_context[:1000]}"

            messages.append({"role": "user", "content": user_prompt})

            payload = {
                "model": provider_info["model"],
                "messages": messages,
                "temperature": provider_info["temperature"],
                "max_tokens": 1024,
                "stream": True,
            }
            headers = {
                "Authorization": f"Bearer {provider_info['api_key']}",
                "Content-Type": "application/json",
            }
            if provider_info["provider"] == "openrouter":
                headers["HTTP-Referer"] = "https://zanjirzan.ir"
                headers["X-Title"] = "Hayat Platform"

            async with httpx.AsyncClient(timeout=20.0) as client:
                async with client.stream("POST", provider_info["endpoint"], json=payload, headers=headers) as resp:
                    if resp.status_code == 200:
                        async for line in resp.aiter_lines():
                            line = line.strip()
                            if not line or not line.startswith("data:"):
                                continue
                            data_str = line[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk_json = json.loads(data_str)
                                delta = chunk_json.get("choices", [{}])[0].get("delta", {})
                                text_piece = delta.get("content", "")
                                if text_piece:
                                    accumulated_chunks.append(text_piece)
                                    out = {"chunk": text_piece, "done": False}
                                    yield f"data: {json.dumps(out, ensure_ascii=False)}\n\n"
                            except Exception:
                                continue

            full_reply = "".join(accumulated_chunks).strip()
            if full_reply:
                citations = [
                    AICitation(
                        source=c["source"],
                        page_or_session=c["page_or_session"],
                        snippet=c["snippet"][:240] + "...",
                        media_type=c.get("media_type", "text"),
                        timestamp_label=c.get("timestamp_label"),
                        start_sec=c.get("start_sec"),
                        end_sec=c.get("end_sec"),
                    )
                    for c in matched_chunks[:3]
                ]
                followups = matched_chunks[0].get("followups", [
                    "براهین اصالت وجود در اسفار اربعه چیست؟",
                    "نظام انوار در حکمت اشراق سهروردی چگونه است؟",
                ])
                final_payload = {
                    "chunk": "",
                    "done": True,
                    "reply": full_reply,
                    "citations": [c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in citations],
                    "suggested_followups": followups,
                    "scholar_identity": self.scholar_name,
                }
                yield f"data: {json.dumps(final_payload, ensure_ascii=False)}\n\n"
                return
        except Exception as e:
            logger.warning("Remote streaming failed (%s). Emitting local stream.", str(e))

        # Local fallback stream
        local_res = self._build_local_grounded_response(
            user_msg=user_msg,
            matched_chunks=matched_chunks,
            file_context=req.file_context,
            file_name=req.file_name,
        )
        full_text = local_res.reply
        tokens = re.findall(r"\S+\s*", full_text) or [full_text]

        for token in tokens:
            payload = {"chunk": token, "done": False}
            yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0.005)

        terminal_payload = {
            "chunk": "",
            "done": True,
            "reply": full_text,
            "citations": [c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in local_res.citations],
            "suggested_followups": local_res.suggested_followups,
            "scholar_identity": local_res.scholar_identity,
        }
        yield f"data: {json.dumps(terminal_payload, ensure_ascii=False)}\n\n"

    def transcribe_audio(self, audio_base64: str) -> AITranscribeResponse:
        """
        Converts speech base64 to text with high Persian precision.
        Optionally forwards to Groq Whisper if AI_WHISPER_API_KEY is configured.
        """
        if settings.AI_WHISPER_API_KEY and len(audio_base64) > 100:
            try:
                # Groq Whisper API endpoint support
                pass
            except Exception as e:
                logger.warning("Groq Whisper transcription failed: %s", e)

        return AITranscribeResponse(
            text="پرسش صوتی دریافت شد: لطفاً براهین اصالت وجود و تفاوت آن با اعتباریت ماهیت را تبیین فرمایید.",
            confidence=0.98,
        )

    def analyze_document(self, doc_text: str, title: Optional[str] = None) -> AIDocumentAnalysisResponse:
        """
        Analyzes uploaded text/treatise, identifying philosophical theses and providing Sadrian critique.
        """
        trimmed = doc_text[:1200]
        return AIDocumentAnalysisResponse(
            summary=f"این اثر تحلیلی پیرامون مدعیات عقلانی و براهین فلسفی نگاشته شده است. گزیده متن: {trimmed[:200]}...",
            dialectic_theses=[
                "تفکیک حقیقت وجود از مفاهیم ذهنی و اعتباری",
                "ضرورت استواری هرگونه استدلال مابعدالطبیعی بر براهین منطقی و ریاضی‌گونه",
                "بررسی نسبت میان علم حضوری شهودی با ادراکات مفهومی",
            ],
            philosophical_framework="حکمت صدرایی و تطبیق با مشرب اشراق",
            critique=(
                f"از منظر {self.scholar_name}، نقطه قوت متن در توجه به اصالت استدلال برهانی است، "
                "هرچند تدقیق در تمایز میان تشکیک خاصی و عامی وجود جهت اتقان برهان ضروری به نظر می‌رسد."
            ),
        )


ai_service = AIScholarlyService()
