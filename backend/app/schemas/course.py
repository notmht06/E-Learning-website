"""
Course and audio syllabus Pydantic models.
"""
from typing import List, Optional, Any
from pydantic import BaseModel, Field, model_validator


class ChapterSchema(BaseModel):
    id: int = Field(..., example=1)
    title: str = Field(..., example="Introduction to Illuminationist Philosophy")
    duration: str = Field(..., example="42:15")
    duration_sec: int = Field(default=2700, example=2535)
    is_preview: bool = Field(False, example=True)
    audio_stream_url: str = Field(default="/audio/sample_lecture.wav", example="/api/v1/stream/hls/course-ishraq/1/master.m3u8")
    video_stream_url: Optional[str] = Field(None, example="/api/v1/stream/hls/course-ishraq/1/video.m3u8")
    media_type: Optional[str] = Field("video", example="video")  # audio | video | hybrid

    @model_validator(mode="before")
    @classmethod
    def normalize_chapter(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("audio_stream_url"):
                data["audio_stream_url"] = data.get("audio_url") or data.get("audioUrl") or "/audio/sample_lecture.wav"
            if data.get("duration_sec") is None:
                dur_str = str(data.get("duration", "45:00"))
                parts = dur_str.split(":")
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    data["duration_sec"] = int(parts[0]) * 60 + int(parts[1])
                elif len(parts) == 3 and parts[0].isdigit() and parts[1].isdigit() and parts[2].isdigit():
                    data["duration_sec"] = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
                else:
                    data["duration_sec"] = 2700
        return data


class CourseDetailSchema(BaseModel):
    id: str = Field(..., example="course-ishraq")
    title: str = Field(..., example="Advanced Commentary on Suhrawardi's Hikmat al-Ishraq")
    slug: str = Field(..., example="hikmat-al-ishraq-advanced")
    instructor: str = Field(..., example="Dr. Meysam Zanjirzan Hosseini")
    level: str = Field(..., example="Advanced / Kharij")
    hours: str = Field(..., example="38 Hours")
    sessions_count: int = Field(..., example=24)
    rating: float = Field(..., example=4.95)
    students_count: int = Field(..., example=1420)
    original_price: str = Field(..., example="1,200,000")
    price: str = Field(..., example="890,000")
    discount_percent: int = Field(..., example=26)
    badge: str = Field(..., example="Featured Course")
    thumbnail: str = Field(..., example="/images/ostad_zanjirzan.jpg")
    description: str = Field(..., example="Comprehensive academic commentary analyzing the illuminationist ontology...")
    tags: List[str] = Field(default_factory=list, example=["Islamic Philosophy", "Suhrawardi", "Illuminationism"])
    syllabus: List[ChapterSchema] = Field(default_factory=list)
    media_type: Optional[str] = Field("video", example="video")
    course_type: Optional[str] = Field("offline", example="online")
    platform: Optional[str] = Field(None, example="skyroom")
    capacity: Optional[int] = Field(None, example=30)
    enrolled_count: Optional[int] = Field(None, example=22)
    skyroom_url: Optional[str] = Field(None, example="https://www.skyroom.online/ch/zanjirzan/sadra-ishraq-live")
    schedule: Optional[str] = Field(None, example="دوشنبه‌ها ساعت ۱۸:۰۰ الی ۱۹:۳۰")


class LiveAccessResponse(BaseModel):
    success: bool = Field(True, example=True)
    course_id: str = Field(..., example="course-online-sadra-ishraq")
    course_title: str = Field(..., example="روش‌شناسی اجتهادی متون حکمت صدرایی و اشراق")
    schedule: str = Field(..., example="دوشنبه‌ها ساعت ۱۸:۰۰ الی ۱۹:۳۰")
    is_live_now: bool = Field(True, example=True)
    skyroom_url: str = Field(..., example="https://www.skyroom.online/ch/zanjirzan/sadra-ishraq-live")
    student_display_name: str = Field(..., example="دانش‌پژوه ۴۵۶۷")
    student_phone: Optional[str] = Field(None, example="09123456789")
    ticket_ttl_seconds: int = Field(300, example=300)
    access_role: str = Field("student", example="student")
    notice: str = Field(..., example="ورود به کلاس با شناسه رسمی و احراز هویت شده شما انجام می‌شود.")


class CourseListResponse(BaseModel):
    total: int = Field(..., example=4)
    items: List[CourseDetailSchema]


class ProgressSyncRequest(BaseModel):
    chapter_id: int = Field(..., example=1)
    progress_percent: int = Field(..., ge=0, le=100, example=65)
    last_position_sec: int = Field(..., ge=0, example=1200)


class ProgressSyncResponse(BaseModel):
    success: bool = True
    user_id: Optional[str] = None
    course_id: str
    chapter_id: int
    progress_percent: int
    last_pos_sec: Optional[int] = None
    updated_at: str


class CourseEnrollResponse(BaseModel):
    success: bool = Field(True, example=True)
    message: str = Field(..., example="ثبت‌نام شما در دوره «سلسله جلسات مبادی منطق و تفکر عقلانی» با موفقیت انجام شد.")
    enrollment_id: str = Field(..., example="enr-9b2f3c4d")
    course_id: str = Field(..., example="course-mabadi-mantiq")
    enrolled_at: str = Field(..., example="2026-10-13T10:00:00")
    status: str = Field("active", example="active")


class EnrolledCoursesResponse(BaseModel):
    total: int = Field(..., example=1)
    items: List[CourseDetailSchema]
