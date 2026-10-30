# -*- coding: utf-8 -*-
"""
Tests for LangGraph 5-Node StateGraph Course-Scoped AI Tutor.
Verifies all 5 pipeline nodes, grounding validation, scholar identity, multilingual support, and edge cases.
"""
import pytest
from backend.app.services.langgraph_tutor import (
    run_course_tutor,
    node_1_course_scope_guard,
    node_2_philosophical_query_rewriter,
    node_3_scoped_multimedia_retriever,
    node_4_grounding_hallucination_grader,
    node_5_sadrian_response_synthesizer,
    SCHOLAR_NAME,
    SCHOLAR_NAME_AR,
    SCHOLAR_NAME_EN,
)
from backend.app.services.ai_service import ai_service
from backend.app.schemas.ai import AIChatRequest


def test_node_1_scope_guard_course_extraction_and_cleaning():
    state = {
        "raw_query": "[دوره فعلی دانشجو: شرح اسفار (course-falsafe-asfar-1) - جلسه 1] پرسش: اصالت وجود چیست؟",
        "course_id": None,
    }
    updated = node_1_course_scope_guard(state)
    assert updated["course_id"] == "course-falsafe-asfar-1"
    assert updated["rewritten_query"] == "اصالت وجود چیست؟"
    assert updated["scholar_identity"] == SCHOLAR_NAME


def test_node_2_query_rewriter_canonical_expansion():
    state = {"rewritten_query": "اصالت وجود را توضیح دهید"}
    updated = node_2_philosophical_query_rewriter(state)
    assert "صدرالمتالهین" in updated["rewritten_query"]
    assert "اسفار" in updated["rewritten_query"]


def test_node_3_retriever_grounded_chunks_and_scoping():
    state = {
        "raw_query": "اصالت وجود",
        "rewritten_query": "اصالت وجود اعتباریت ماهیت",
        "subject_filter": None,
        "course_id": "course-asfar",
    }
    updated = node_3_scoped_multimedia_retriever(state)
    assert len(updated["retrieved_chunks"]) > 0
    # Top chunk should align with asfar
    top = updated["retrieved_chunks"][0]
    assert "asfar" in top.get("id", "").lower() or "اسفار" in top.get("source", "")


def test_node_4_grader_grounded_flag():
    state_grounded = {"retrieved_chunks": [{"id": "c1", "snippet": "متن"}]}
    assert node_4_grounding_hallucination_grader(state_grounded)["is_grounded"] is True

    state_empty = {"retrieved_chunks": []}
    assert node_4_grounding_hallucination_grader(state_empty)["is_grounded"] is False


def test_node_5_synthesizer_grounded_vs_ungrounded():
    grounded_state = {
        "is_grounded": True,
        "lang": "fa",
        "retrieved_chunks": [
            {
                "id": "c1",
                "source": "اسفار اربعه",
                "page_or_session": "جلسه ۰۱",
                "timestamp_label": "۰۳:۰۰",
                "snippet": "وجود اصیل است و ماهیت اعتباری.",
            }
        ],
    }
    res_grounded = node_5_sadrian_response_synthesizer(grounded_state)
    assert SCHOLAR_NAME in res_grounded["final_reply"]
    assert "وجود اصیل است" in res_grounded["final_reply"]

    ungrounded_state = {
        "is_grounded": False,
        "lang": "fa",
        "retrieved_chunks": [],
    }
    res_ungrounded = node_5_sadrian_response_synthesizer(ungrounded_state)
    assert "خارج از قلمرو مباحث" in res_ungrounded["final_reply"]
    assert len(res_ungrounded["citations"]) == 0


def test_node_5_synthesizer_multilingual_en_and_ar():
    state_en = {
        "is_grounded": True,
        "lang": "en",
        "retrieved_chunks": [
            {
                "id": "c1",
                "source": "Commentary on Asfar",
                "page_or_session": "Session 01",
                "timestamp_label": "03:00",
                "snippet": "Existence is the fundamental reality.",
            }
        ],
    }
    res_en = node_5_sadrian_response_synthesizer(state_en)
    assert SCHOLAR_NAME_EN in res_en["final_reply"]
    assert "demonstrative principles" in res_en["final_reply"]

    state_ar = {
        "is_grounded": True,
        "lang": "ar",
        "retrieved_chunks": [
            {
                "id": "c1",
                "source": "شرح الأسفار الأربعة",
                "page_or_session": "الجلسة ۰۱",
                "timestamp_label": "۰۳:۰۰",
                "snippet": "الوجود هو الحقيقة العينية والماهية اعتبارية.",
            }
        ],
    }
    res_ar = node_5_sadrian_response_synthesizer(state_ar)
    assert SCHOLAR_NAME_AR in res_ar["final_reply"]
    assert "الأسس البرهانية" in res_ar["final_reply"]


def test_run_course_tutor_full_pipeline():
    res = run_course_tutor(
        raw_query="برهان اصالت وجود چیست؟",
        course_id="course-asfar",
        subject_filter="حکمت متعالیه",
    )
    assert res["is_grounded"] is True
    assert SCHOLAR_NAME in res["final_reply"]
    assert len(res["citations"]) > 0
    assert len(res["suggested_followups"]) > 0


def test_run_course_tutor_out_of_scope_query():
    res = run_course_tutor(
        raw_query="دستور پخت غذای مکزیکی تند با گوشت چرخ‌کرده چیست؟",
        course_id="course-asfar",
    )
    assert res["is_grounded"] is False
    assert "خارج از قلمرو مباحث" in res["final_reply"]
    assert len(res["citations"]) == 0


def test_ai_service_integration_with_course_tutor():
    import asyncio

    async def _test():
        req = AIChatRequest(
            message="[دوره فعلی دانشجو: شرح اسفار (course-asfar) - جلسه ۱] پرسش: اصالت وجود چیست؟",
            course_id="course-asfar",
            subject_filter="حکمت متعالیه",
        )
        chat_res = await ai_service.chat(req)
        assert SCHOLAR_NAME in chat_res.reply
        assert len(chat_res.citations) > 0
        assert chat_res.citations[0].source != ""

        # Test stream_chat integration
        events = []
        async for event in ai_service.stream_chat(req):
            events.append(event)
        assert len(events) > 1
        assert any("done" in e for e in events)

    asyncio.run(_test())
