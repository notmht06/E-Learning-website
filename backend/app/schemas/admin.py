"""
Admin dashboard analytics, course authoring, and student study notes/discussions models.
"""
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, model_validator


class StudyNoteCreate(BaseModel):
    course_id: str = Field(..., example="course-ishraq")
    chapter_id: int = Field(..., example=1)
    title: str = Field(..., example="Ontology of Lights Note")
    content: str = Field(..., example="The Sheikh of Illumination considers Light as self-manifesting...")
    timestamp_sec: int = Field(..., example=345)


class StudyNoteResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    chapter_id: int
    title: str
    content: str
    timestamp_sec: int
    created_at: str


class QAQuestionCreate(BaseModel):
    course_id: str = Field(..., example="course-ishraq")
    chapter_id: int = Field(..., example=1)
    title: str = Field(..., example="Question regarding Light of Lights")
    question_text: str = Field(..., example="How does Suhrawardi solve the problem of multiple emanations?")


class QAAnswerCreate(BaseModel):
    answer_text: str = Field(..., example="Suhrawardi posits reciprocal illuminations among intermediary lights...")


class QAMessageResponse(BaseModel):
    id: str
    course_id: str
    user_name: str
    title: str
    question_text: str
    answer_text: Optional[str] = None
    is_resolved: bool = False
    created_at: str


class AdminAnalyticsResponse(BaseModel):
    total_students: int
    total_revenue_tomans: str
    total_courses_sold: int
    total_books_shipped: int
    active_streams_today: int
    monthly_sales_growth: str


class CourseCreateRequest(BaseModel):
    title: str
    instructor: str
    level: str
    hours: str
    price: str
    description: str


class OrderStatusUpdateRequest(BaseModel):
    order_id: Optional[str] = None
    new_status: Optional[str] = None  # paid | processing | dispatched | delivered | shipped
    status: Optional[str] = None
    postal_barcode: Optional[str] = None
    postal_barcode_24digit: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            status_val = data.get("new_status") or data.get("status")
            if status_val is not None:
                cleaned = str(status_val).strip()
                data["new_status"] = cleaned
                data["status"] = cleaned
            barcode_val = data.get("postal_barcode") or data.get("postal_barcode_24digit")
            if barcode_val is not None:
                cleaned_bc = str(barcode_val).strip()
                data["postal_barcode"] = cleaned_bc
                data["postal_barcode_24digit"] = cleaned_bc
        return data


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    instructor: Optional[str] = None
    level: Optional[str] = None
    hours: Optional[str] = None
    price: Optional[str] = None
    discount_percent: Optional[int] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    thumbnail: Optional[str] = None
    media_type: Optional[str] = None
    course_type: Optional[str] = None  # offline | online
    capacity: Optional[int] = None
    schedule: Optional[str] = None
    skyroom_url: Optional[str] = None
    telegram_url: Optional[str] = None
    tags: Optional[List[str]] = None


def to_chapter_dict(data: Any, chapter_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Standardizes a chapter data structure from dictionaries or Pydantic models.
    Guarantees id, title, duration, duration_sec, is_preview, is_free,
    audio_stream_url, audio_url, video_stream_url, and media_type are properly populated.
    """
    import re

    if hasattr(data, "model_dump"):
        raw = data.model_dump()
    elif hasattr(data, "dict"):
        raw = data.dict()
    elif isinstance(data, dict):
        raw = dict(data)
    else:
        raw = {}

    # 1. Chapter ID
    if chapter_id is not None:
        try:
            ch_id = int(chapter_id)
        except (ValueError, TypeError):
            ch_id = 1
    elif raw.get("id") is not None:
        try:
            ch_id = int(raw.get("id"))
        except (ValueError, TypeError):
            ch_id = 1
    else:
        ch_id = 1

    # 2. Title
    raw_title = raw.get("title") or raw.get("title_fa")
    title = str(raw_title).strip() if raw_title is not None else ""
    if not title:
        title = f"جلسه {ch_id}"

    # 3. Duration & duration_sec
    def _to_latin(s: str) -> str:
        trans = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
        return str(s).translate(trans)

    dur_sec_raw = raw.get("duration_sec") if raw.get("duration_sec") is not None else raw.get("duration_seconds")
    duration_sec: Optional[int] = None
    if dur_sec_raw is not None:
        try:
            val = int(_to_latin(str(dur_sec_raw)).strip())
            if val > 0:
                duration_sec = val
        except (ValueError, TypeError):
            duration_sec = None

    dur_str = raw.get("duration")
    if dur_str:
        dur_str_clean = _to_latin(str(dur_str)).strip()
        parts = dur_str_clean.split(":")
        parsed_sec = None
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            parsed_sec = int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3 and parts[0].isdigit() and parts[1].isdigit() and parts[2].isdigit():
            parsed_sec = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        elif dur_str_clean.isdigit():
            parsed_sec = int(dur_str_clean)
        else:
            hours_match = re.search(r'(\d+)\s*(?:ساعت|س|hr|hours?|h\b)', dur_str_clean)
            mins_match = re.search(r'(\d+)\s*(?:دقیقه|د|min|mins|minutes?|m\b)', dur_str_clean)
            secs_match = re.search(r'(\d+)\s*(?:ثانیه|ث|sec|secs|seconds?|s\b)', dur_str_clean)
            if hours_match or mins_match or secs_match:
                h = int(hours_match.group(1)) if hours_match else 0
                m = int(mins_match.group(1)) if mins_match else 0
                s = int(secs_match.group(1)) if secs_match else 0
                calc = h * 3600 + m * 60 + s
                if calc > 0:
                    parsed_sec = calc

        if parsed_sec is not None and parsed_sec > 0:
            if duration_sec is None or duration_sec == 2700:
                duration_sec = parsed_sec

    if duration_sec is None or duration_sec <= 0:
        duration_sec = 2700

    if not dur_str or not str(dur_str).strip():
        m = duration_sec // 60
        s = duration_sec % 60
        dur_str = f"{m:02d}:{s:02d}"
    else:
        dur_str = str(dur_str).strip()

    # 4. Audio URL & stream URL
    audio_raw = raw.get("audio_stream_url") or raw.get("audio_url") or raw.get("audioUrl") or ""
    audio_link = str(audio_raw).strip()
    if not audio_link:
        audio_link = "/audio/sample_lecture.wav"

    # 5. Preview & free status
    is_preview = bool(
        raw.get("is_preview", False)
        or raw.get("is_free", False)
        or raw.get("isFreePreview", False)
        or raw.get("is_free_sample", False)
    )
    is_free = is_preview

    # 6. Video stream URL
    video_raw = raw.get("video_stream_url") or raw.get("videoUrl") or ""
    video_link = str(video_raw).strip() if video_raw else None
    if not video_link:
        video_link = None

    # 7. Media type
    media_type = raw.get("media_type") or ("hybrid" if video_link else "audio")

    return {
        "id": ch_id,
        "title": title,
        "duration": dur_str,
        "duration_sec": duration_sec,
        "is_preview": is_preview,
        "is_free": is_free,
        "audio_stream_url": audio_link,
        "audio_url": audio_link,
        "video_stream_url": video_link,
        "media_type": media_type,
    }


class ChapterCreateRequest(BaseModel):
    title: str
    duration: str
    duration_sec: Optional[int] = None
    is_preview: Optional[bool] = False
    audio_stream_url: Optional[str] = "/audio/sample_lecture.wav"
    video_stream_url: Optional[str] = None
    media_type: Optional[str] = "audio"

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("title") and data.get("title_fa"):
                data["title"] = str(data["title_fa"]).strip()
            if "is_preview" not in data and "isFreePreview" in data:
                data["is_preview"] = bool(data["isFreePreview"])
            if not data.get("audio_stream_url") and data.get("audioUrl"):
                data["audio_stream_url"] = str(data["audioUrl"]).strip()
            if not data.get("video_stream_url") and data.get("videoUrl"):
                data["video_stream_url"] = str(data["videoUrl"]).strip()
        return data

    def to_chapter_dict(self, chapter_id: Optional[int] = None) -> Dict[str, Any]:
        return to_chapter_dict(self, chapter_id=chapter_id)


class ChapterUpdateRequest(BaseModel):
    title: Optional[str] = None
    duration: Optional[str] = None
    duration_sec: Optional[int] = None
    is_preview: Optional[bool] = None
    audio_stream_url: Optional[str] = None
    video_stream_url: Optional[str] = None
    media_type: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "title" not in data and "title_fa" in data:
                data["title"] = str(data["title_fa"]).strip()
            if "is_preview" not in data and "isFreePreview" in data:
                data["is_preview"] = bool(data["isFreePreview"])
            if "audio_stream_url" not in data and "audioUrl" in data:
                data["audio_stream_url"] = str(data["audioUrl"]).strip()
        return data


class BookUpdateRequest(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    price: Optional[str] = None
    physical_price: Optional[str] = None
    cover_image: Optional[str] = None
    synopsis: Optional[str] = None
    isbn: Optional[str] = None

