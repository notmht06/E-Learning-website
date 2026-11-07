"""
Course Review and Student Ratings Service.
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Simplicity Governor).
"""
import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.models import CourseReview, User, Course, Enrollment
from backend.app.core.exceptions import AppException, EntityNotFoundException

logger = logging.getLogger("backend.review_service")


class ReviewService:
    async def get_course_reviews(
        self,
        db: AsyncSession,
        course_id: str,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Retrieves reviews summary and list for a specific course.
        """
        stmt = (
            select(CourseReview)
            .options(selectinload(CourseReview.user), selectinload(CourseReview.course))
            .where(CourseReview.course_id == course_id)
            .order_by(CourseReview.created_at.desc())
        )
        res = await db.execute(stmt)
        reviews_list = res.scalars().all()

        total = len(reviews_list)
        dist: Dict[str, int] = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        for r in reviews_list:
            star_key = str(min(max(r.rating, 1), 5))
            dist[star_key] = dist.get(star_key, 0) + 1

        avg = round(sum(r.rating for r in reviews_list) / total, 1) if total > 0 else 5.0

        is_enrolled = False
        is_comment_banned = False
        user_review: Optional[Dict[str, Any]] = None

        if current_user:
            user_id = current_user.get("id")
            # Fetch fresh user record from DB to verify current ban status
            user_rec = await db.get(User, user_id)
            if user_rec:
                is_comment_banned = bool(user_rec.is_comment_banned)

            if current_user.get("role") == "admin":
                is_enrolled = True
            else:
                enr_res = await db.execute(
                    select(Enrollment).where(
                        Enrollment.user_id == user_id,
                        Enrollment.course_id == course_id,
                        Enrollment.status == "active",
                    )
                )
                is_enrolled = enr_res.scalar_one_or_none() is not None

            for r in reviews_list:
                if r.user_id == user_id:
                    user_review = r.to_dict()
                    break

        can_review = bool(is_enrolled and not is_comment_banned)

        return {
            "course_id": course_id,
            "average_rating": avg,
            "total_reviews": total,
            "rating_distribution": dist,
            "reviews": [r.to_dict() for r in reviews_list],
            "user_review": user_review,
            "can_review": can_review,
            "is_enrolled": is_enrolled,
            "is_comment_banned": is_comment_banned,
        }

    async def submit_review(
        self,
        db: AsyncSession,
        course_id: str,
        user_id: str,
        rating: int,
        comment: str,
    ) -> Dict[str, Any]:
        """
        Submits or updates a student review for an enrolled course.
        Enforces enrollment and ban checks.
        """
        user = await db.get(User, user_id)
        if not user:
            raise EntityNotFoundException("کاربر یافت نشد.")

        if bool(user.is_comment_banned):
            raise AppException(
                "حساب کاربری شما از ثبت دیدگاه و امتیاز مسدود شده است.",
                status_code=403,
            )

        # Verify enrollment if not admin
        if user.role != "admin":
            enr_res = await db.execute(
                select(Enrollment).where(
                    Enrollment.user_id == user_id,
                    Enrollment.course_id == course_id,
                    Enrollment.status == "active",
                )
            )
            if not enr_res.scalar_one_or_none():
                raise AppException(
                    "تنها دانشجویانی که در این دوره ثبت‌نام کرده‌اند می‌توانند دیدگاه و امتیاز ثبت کنند.",
                    status_code=403,
                )

        # Check existing review to update or insert
        existing_res = await db.execute(
            select(CourseReview).where(
                CourseReview.user_id == user_id,
                CourseReview.course_id == course_id,
            )
        )
        existing = existing_res.scalar_one_or_none()

        clean_comment = comment.strip()
        clean_rating = min(max(rating, 1), 5)

        if existing:
            existing.rating = clean_rating
            existing.comment = clean_comment
            existing.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(existing)
            existing.user = user
            logger.info("Updated review for user %s on course %s", user_id, course_id)
            return existing.to_dict()

        new_review = CourseReview(
            id=f"rev-{uuid.uuid4().hex[:12]}",
            course_id=course_id,
            user_id=user_id,
            rating=clean_rating,
            comment=clean_comment,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_review)
        await db.commit()
        await db.refresh(new_review)
        new_review.user = user
        logger.info("Created new review %s for user %s on course %s", new_review.id, user_id, course_id)
        return new_review.to_dict()

    async def delete_review_by_admin(self, db: AsyncSession, review_id: str) -> bool:
        """
        Deletes a review by admin.
        """
        review = await db.get(CourseReview, review_id)
        if not review:
            raise EntityNotFoundException("دیدگاه مورد نظر یافت نشد.")

        await db.delete(review)
        await db.commit()
        logger.info("Admin deleted review %s", review_id)
        return True

    async def get_all_reviews_for_admin(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Retrieves all reviews across all courses for the admin moderation console.
        """
        stmt = (
            select(CourseReview)
            .options(selectinload(CourseReview.user), selectinload(CourseReview.course))
            .order_by(CourseReview.created_at.desc())
        )
        res = await db.execute(stmt)
        reviews = res.scalars().all()
        return [r.to_dict() for r in reviews]

    async def ban_user_from_comments(
        self,
        db: AsyncSession,
        user_id: str,
        is_banned: bool,
    ) -> Dict[str, Any]:
        """
        Bans or unbans a user from commenting.
        """
        user = await db.get(User, user_id)
        if not user:
            raise EntityNotFoundException("کاربر یافت نشد.")

        user.is_comment_banned = is_banned
        await db.commit()
        logger.info("Admin updated comment ban status for user %s to %s", user_id, is_banned)
        status_msg = "مسدود شد" if is_banned else "رفع مسدودیت شد"
        return {
            "success": True,
            "user_id": user_id,
            "is_comment_banned": is_banned,
            "detail": f"دسترسی کاربر جهت ثبت دیدگاه {status_msg}.",
        }


review_service = ReviewService()
