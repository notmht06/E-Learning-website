# -*- coding: utf-8 -*-
"""
Tests for LangGraph 5-Node StateGraph Course-Scoped AI Tutor.
Verifies all 5 pipeline nodes, grounding validation, scholar identity, and edge cases.
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
)


def test_node_1_scope_guard_course_extraction():
    state = {
        "raw_query": "[دوره فعلی دانشجو: شرح اسفار (course-falsafe-asfar-1) - جلسه 1] سوال",
        "course_id": None,
    }
    updated = node_1_course_scope_guard(state)
    assert updated["course_id"] == "course-falsafe-asfar-1"
    assert updated["scholar_identity"] == SCHOLAR_NAME


def test_node_2_query_rewriter_canonical_expansion():
    state = {"rewritten_query": "اصالت وجود را توضیح دهید"}
    updated = node_2_philosophical_query_rewriter(state)
    assert "صدرالمتالهین" in updated["rewritten_query"]
    assert "اسفار" in updated["rewritten_query"]


def test_node_3_retriever_grounded_chunks():
    state = {
        "raw_query": "اصالت وجود",
        "rewritten_query": "اصالت وجود اعتباریت ماهیت",
        "subject_filter": None,
    }
    updated = node_3_scoped_multimedia_retriever(state)
    assert len(updated["retrieved_chunks"]) > 0


def test_node_4_grader_grounded_flag():
    state_grounded = {"retrieved_chunks": [{"id": "c1", "snippet": "متن"}]}
    assert node_4_grounding_hallucination_grader(state_grounded)["is_grounded"] is True

    state_empty = {"retrieved_chunks": []}
    assert node_4_grounding_hallucination_grader(state_empty)["is_grounded"] is False


def test_node_5_synthesizer_grounded_vs_ungrounded():
    grounded_state = {
        "is_grounded": True,
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
        "retrieved_chunks": [],
    }
    res_ungrounded = node_5_sadrian_response_synthesizer(ungrounded_state)
    assert "خارج از قلمرو مباحث" in res_ungrounded["final_reply"]
    assert len(res_ungrounded["citations"]) == 0


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
