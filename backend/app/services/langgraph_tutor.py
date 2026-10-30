# -*- coding: utf-8 -*-
"""
LangGraph 5-Node StateGraph Architecture for Course-Scoped Scholarly AI Tutor.
Official Platform of حجت الاسلام دکتر زنجیر زن حسینی.
Nodes:
1. course_scope_guard -> Extracts course_id / chapter_id context & validates scope
2. philosophical_query_rewriter -> Expands query with canonical Sadrian/Illuminationist terms
3. scoped_multimedia_retriever -> Retrieves timestamped audio/video chunks from rag_engine
4. grounding_hallucination_grader -> Verifies strict closed-book grounding threshold
5. sadrian_response_synthesizer -> Synthesizes final answer with timestamped citations
"""
import re
from typing import TypedDict, List, Dict, Any, Optional, Callable
from backend.app.services.rag_engine import rag_engine
from backend.app.core.config import settings

SCHOLAR_NAME = "حجت الاسلام دکتر زنجیر زن حسینی"
SCHOLAR_NAME_AR = "حجة الإسلام الدكتور زنجير زن حسيني"
SCHOLAR_NAME_EN = "Hojjat al-Islam Dr. Zanjirzan Hosseini"


class ScholarTutorGraphState(TypedDict, total=False):
    raw_query: str
    rewritten_query: str
    course_id: Optional[str]
    subject_filter: Optional[str]
    lang: Optional[str]
    retrieved_chunks: List[Dict[str, Any]]
    is_grounded: bool
    final_reply: str
    citations: List[Dict[str, Any]]
    suggested_followups: List[str]
    scholar_identity: str


def _get_scholar_identity(lang: Optional[str] = "fa") -> str:
    if lang == "en":
        return SCHOLAR_NAME_EN
    if lang == "ar":
        return SCHOLAR_NAME_AR
    return SCHOLAR_NAME


def node_1_course_scope_guard(state: ScholarTutorGraphState) -> ScholarTutorGraphState:
    query = (state.get("raw_query") or "").strip()
    lang = state.get("lang") or "fa"
    state["scholar_identity"] = _get_scholar_identity(lang)

    # Extract course_id from query if embedded, e.g. "[دوره فعلی دانشجو: ... (course-xxx) - ...]"
    if not state.get("course_id"):
        match = re.search(r"\((course-[^\)]+)\)", query)
        if match:
            state["course_id"] = match.group(1)

    # Clean query if wrapped in contextual prompt
    clean_query = re.sub(r"^\[دوره فعلی دانشجو:[^\]]+\]\s*(پرسش:)?\s*", "", query).strip()
    state["rewritten_query"] = clean_query or query
    return state


def node_2_philosophical_query_rewriter(state: ScholarTutorGraphState) -> ScholarTutorGraphState:
    q = state.get("rewritten_query", "")
    expansions = {
        "اصالت وجود": "اصالت وجود اعتباریت ماهیت صدرالمتالهین اسفار",
        "اشراق": "حکمت اشراق سهروردی نورالانوار علم حضوری",
        "منطق": "مبادی منطق تصور تصدیق برهان صناعات خمس",
        "استصحاب": "اصول فقه استصحاب شیخ انصاری لا تنقض الیقین",
        "حرکت جوهری": "حرکت جوهری زمان ربط حادث به قدیم",
    }
    for term, expanded in expansions.items():
        if term in q:
            q = f"{q} {expanded}"
            break
    state["rewritten_query"] = q
    return state


def node_3_scoped_multimedia_retriever(state: ScholarTutorGraphState) -> ScholarTutorGraphState:
    subject = state.get("subject_filter")
    if subject == "همه":
        subject = None

    chunks = rag_engine.search(
        query=state["rewritten_query"],
        subject_filter=subject,
        top_k=4,
        min_score=settings.AI_MIN_SIMILARITY_THRESHOLD,
    )

    course_id = state.get("course_id")
    if course_id and chunks:
        # Prioritize chunks that align with the student's current course
        def course_match_priority(c: Dict[str, Any]) -> int:
            cid = str(c.get("course_id", "") or "")
            chunk_id = str(c.get("id", "") or "")
            source = str(c.get("source", "") or "")
            if cid and cid == course_id:
                return 3
            if course_id in chunk_id or course_id in source:
                return 2
            cid_slug = course_id.replace("course-", "").split("-")[0]
            if cid_slug and (cid_slug in chunk_id or cid_slug in source):
                return 1
            return 0

        chunks = sorted(chunks, key=course_match_priority, reverse=True)

    state["retrieved_chunks"] = chunks
    return state


def node_4_grounding_hallucination_grader(state: ScholarTutorGraphState) -> ScholarTutorGraphState:
    chunks = state.get("retrieved_chunks", [])
    state["is_grounded"] = len(chunks) > 0
    return state


def node_5_sadrian_response_synthesizer(state: ScholarTutorGraphState) -> ScholarTutorGraphState:
    chunks = state.get("retrieved_chunks", [])
    lang = state.get("lang") or "fa"
    scholar = _get_scholar_identity(lang)
    state["scholar_identity"] = scholar

    if not state.get("is_grounded") or not chunks:
        if lang == "en":
            state["final_reply"] = (
                f"Your inquiry lies outside the scope of the topics presented in the courses and official treatises of {scholar}. "
                "The HekmatYar assistant is strictly authorized to explain and answer queries grounded in the lectures, audio-visual recordings, and authored books of the scholar. "
                "Please frame your question around subjects covered in this course."
            )
            state["suggested_followups"] = [
                "What is the main thesis of this course?",
                "Explain the key terminology of this session.",
                "How does the professor prove the Primacy of Existence?",
            ]
        elif lang == "ar":
            state["final_reply"] = (
                f"سؤالكم خارج عن نطاق الأبحاث المطروحة في دروس ومؤلفات سماحة {scholar}. "
                "المساعد حكمت‌یار مكلّف حصراً بالبيان والإجابة بالاستناد إلى تقريرات، تسجيلات وكتب الأستاذ المعتمدة. "
                "يرجى طرح الأسئلة المتعلقة بمباحث هذه الدورة."
            )
            state["suggested_followups"] = [
                "ما هي المسألة المحورية في هذه الدورة؟",
                "اشرح المصطلحات الأساسية في هذه الجلسة.",
                "كيف يقرر الأستاذ برهان أصالة الوجود؟",
            ]
        else:
            state["final_reply"] = (
                f"پرسش شما خارج از قلمرو مباحث ارائه‌شده در دروس و آثار مکتوب و شفاهی {scholar} است. "
                "دستیار حکمت‌یار منحصراً موظف به تبیین و پاسخگویی بر پایه تقریرات، صوت‌ها، ویدیوها و کتب مصنف استاد است. "
                "لطفاً پرسش خود را پیرامون موضوعات مطرح‌شده در دوره فعلی یا دروس مرتبط مطرح فرمایید."
            )
            state["suggested_followups"] = [
                "محور اصلی مباحث این دوره چیست؟",
                "اصطلاحات کلیدی جلسه را تبیین کن.",
                "تقریر استاد از براهین اصالت وجود چیست؟",
            ]

        state["citations"] = []
        return state

    top_chunk = chunks[0]
    time_label = top_chunk.get("timestamp_label", "")
    session_ref = f"«{top_chunk.get('page_or_session', '')}»"
    source_ref = f"«{top_chunk.get('source', '')}»"

    if lang == "en":
        time_ref = f" at minute «{time_label}»" if time_label else ""
        lead = f"Based on the demonstrative principles and official lectures of {scholar} in {source_ref} ({session_ref}{time_ref}):"
        explanation = top_chunk.get("snippet_en") or top_chunk.get("snippet", "")
        conclusion = "This inquiry is systematically grounded in the official recorded segments of this curriculum."
        state["suggested_followups"] = [
            "What are the detailed proofs for this thesis?",
            "How does the professor address objections to this theory?",
            "What is the recommended study sequence for this topic?",
        ]
    elif lang == "ar":
        time_ref = f" في الدقيقة «{time_label}»" if time_label else ""
        lead = f"بناءً على الأسس البرهانية والتقريرات الرسمية لسماحة {scholar} في {source_ref} ({session_ref}{time_ref}):"
        explanation = top_chunk.get("snippet", "")
        conclusion = "تم تثبيت هذا البحث في القطعة الزمنية المحددة من الدرس."
        state["suggested_followups"] = [
            "ما هي البراهين التفصيلية لهذه المسألة؟",
            "كيف يقرر الأستاذ الإشكالات الواردة على هذه النظرية؟",
            "ما هو السير الدراسي المرتبط بهذا المبحث؟",
        ]
    else:
        time_ref = f" در دقیقه «{time_label}»" if time_label else ""
        lead = f"بر اساس مبانی برهانی و تقریرات درسی {scholar} در {source_ref} ({session_ref}{time_ref}):"
        explanation = top_chunk.get("snippet", "")
        conclusion = "این مبحث در قطعه زماندار درس تثبیت شده است."
        state["suggested_followups"] = [
            "براهین تفصیلی این مسئله چیست؟",
            "تقریر استاد از اشکالات وارد بر این نظریه چیست؟",
            "سیر مطالعاتی مرتبط با این مبحث کدام است؟",
        ]

    state["final_reply"] = f"{lead}\n\n{explanation}\n\n{conclusion}"

    clean_citations: List[Dict[str, Any]] = []
    for c in chunks:
        clean_citations.append({
            "source": c.get("source", ""),
            "page_or_session": c.get("page_or_session", ""),
            "snippet": c.get("snippet", "")[:240] + ("..." if len(c.get("snippet", "")) > 240 else ""),
            "media_type": c.get("media_type", "text"),
            "timestamp_label": c.get("timestamp_label"),
            "start_sec": c.get("start_sec"),
            "end_sec": c.get("end_sec"),
        })
    state["citations"] = clean_citations
    return state


# ============================================================================
# STATEGRAPH ENGINE (LangGraph Integration with Zero-Dependency Fallback)
# ============================================================================
try:
    from langgraph.graph import StateGraph as LangGraphStateGraph, END as LANGGRAPH_END
    _HAS_LANGGRAPH = True
except ImportError:
    _HAS_LANGGRAPH = False
    LANGGRAPH_END = "__end__"


class FallbackCompiledGraph:
    def __init__(self, node_order: List[Callable[[ScholarTutorGraphState], ScholarTutorGraphState]]):
        self.node_order = node_order

    def invoke(self, state: ScholarTutorGraphState) -> ScholarTutorGraphState:
        current = dict(state)
        for fn in self.node_order:
            current = fn(current)
        return current


class FallbackStateGraph:
    def __init__(self, state_schema=None):
        self.state_schema = state_schema
        self.nodes: Dict[str, Callable[[ScholarTutorGraphState], ScholarTutorGraphState]] = {}
        self.edges: List[tuple] = []
        self.entry_point: Optional[str] = None

    def add_node(self, name: str, func: Callable[[ScholarTutorGraphState], ScholarTutorGraphState]):
        self.nodes[name] = func

    def set_entry_point(self, name: str):
        self.entry_point = name

    def add_edge(self, from_node: str, to_node: str):
        self.edges.append((from_node, to_node))

    def compile(self) -> FallbackCompiledGraph:
        ordered_nodes = [
            self.nodes.get("course_scope_guard", node_1_course_scope_guard),
            self.nodes.get("philosophical_query_rewriter", node_2_philosophical_query_rewriter),
            self.nodes.get("scoped_multimedia_retriever", node_3_scoped_multimedia_retriever),
            self.nodes.get("grounding_hallucination_grader", node_4_grounding_hallucination_grader),
            self.nodes.get("sadrian_response_synthesizer", node_5_sadrian_response_synthesizer),
        ]
        return FallbackCompiledGraph(ordered_nodes)


def create_tutor_graph():
    if _HAS_LANGGRAPH:
        builder = LangGraphStateGraph(ScholarTutorGraphState)
        builder.add_node("course_scope_guard", node_1_course_scope_guard)
        builder.add_node("philosophical_query_rewriter", node_2_philosophical_query_rewriter)
        builder.add_node("scoped_multimedia_retriever", node_3_scoped_multimedia_retriever)
        builder.add_node("grounding_hallucination_grader", node_4_grounding_hallucination_grader)
        builder.add_node("sadrian_response_synthesizer", node_5_sadrian_response_synthesizer)

        builder.set_entry_point("course_scope_guard")
        builder.add_edge("course_scope_guard", "philosophical_query_rewriter")
        builder.add_edge("philosophical_query_rewriter", "scoped_multimedia_retriever")
        builder.add_edge("scoped_multimedia_retriever", "grounding_hallucination_grader")
        builder.add_edge("grounding_hallucination_grader", "sadrian_response_synthesizer")
        builder.add_edge("sadrian_response_synthesizer", LANGGRAPH_END)
        return builder.compile()
    else:
        builder = FallbackStateGraph(ScholarTutorGraphState)
        builder.add_node("course_scope_guard", node_1_course_scope_guard)
        builder.add_node("philosophical_query_rewriter", node_2_philosophical_query_rewriter)
        builder.add_node("scoped_multimedia_retriever", node_3_scoped_multimedia_retriever)
        builder.add_node("grounding_hallucination_grader", node_4_grounding_hallucination_grader)
        builder.add_node("sadrian_response_synthesizer", node_5_sadrian_response_synthesizer)

        builder.set_entry_point("course_scope_guard")
        builder.add_edge("course_scope_guard", "philosophical_query_rewriter")
        builder.add_edge("philosophical_query_rewriter", "scoped_multimedia_retriever")
        builder.add_edge("scoped_multimedia_retriever", "grounding_hallucination_grader")
        builder.add_edge("grounding_hallucination_grader", "sadrian_response_synthesizer")
        return builder.compile()


tutor_graph = create_tutor_graph()


def run_course_tutor(
    raw_query: str,
    course_id: Optional[str] = None,
    subject_filter: Optional[str] = None,
    lang: str = "fa",
) -> ScholarTutorGraphState:
    """Executes the 5-node LangGraph pipeline for course-scoped inquiries."""
    initial_state: ScholarTutorGraphState = {
        "raw_query": raw_query,
        "rewritten_query": raw_query,
        "course_id": course_id,
        "subject_filter": subject_filter,
        "lang": lang,
        "retrieved_chunks": [],
        "is_grounded": False,
        "final_reply": "",
        "citations": [],
        "suggested_followups": [],
        "scholar_identity": _get_scholar_identity(lang),
    }
    return tutor_graph.invoke(initial_state)
