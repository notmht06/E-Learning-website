"""
Pydantic schemas for course reviews, ratings, and admin moderation.
Complies with BACKEND_SYSTEM_DESIGN.md.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ReviewCreateRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="امتیاز دوره از ۱ تا ۵")
    comment: str = Field(..., min_length=2, max_length=2000, description="متن دیدگاه")


class ReviewResponse(BaseModel):
    id: str
    course_id: str
    course_title: Optional[str] = None
    user_id: str
    user_name: str
    user_phone: Optional[str] = None
    user_avatar: Optional[str] = None
    rating: int
    comment: str
    created_at: Optional[str] = None
    is_user_banned: bool = False


class CourseReviewsSummaryResponse(BaseModel):
    course_id: str
    average_rating: float
    total_reviews: int
    rating_distribution: Dict[str, int]
    reviews: List[ReviewResponse]
    user_review: Optional[ReviewResponse] = None
    can_review: bool = False
    is_enrolled: bool = False
    is_comment_banned: bool = False


class UserBanCommentRequest(BaseModel):
    is_banned: bool = Field(..., description="وضعیت مسدودیت دسترسی کاربر به ثبت دیدگاه")


class UserBanCommentResponse(BaseModel):
    success: bool
    user_id: str
    is_comment_banned: bool
    detail: str
