"""
Audio streaming DRM security token and heartbeat Pydantic models.
"""
from typing import Optional
from pydantic import BaseModel, Field


class DRMTokenRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, example="usr-140301")
    course_id: str = Field(..., example="course-ishraq")
    chapter_id: int = Field(..., example=1)


class DRMTokenResponse(BaseModel):
    token: str = Field(..., example="a9f43b67e21a8d...1715000000")
    expires_in_seconds: int = Field(..., example=900)
    forensic_watermark: str = Field(..., example="UID: usr-***01 • DRM-A9F43B67")
    stream_url: str = Field(..., example="/api/v1/stream/hls/course-ishraq/1/master.m3u8?token=...")


class DRMHeartbeatRequest(BaseModel):
    token: str = Field(...)
    user_id: Optional[str] = Field(default=None)
    course_id: str = Field(...)
    chapter_id: int = Field(...)
    playback_position_sec: int = Field(..., ge=0)


class DRMHeartbeatResponse(BaseModel):
    valid: bool = True
    next_heartbeat_in_seconds: int = 30
    watermark: str
