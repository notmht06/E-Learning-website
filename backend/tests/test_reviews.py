"""
Unit and Integration Tests for Course Reviews, Ratings, and Admin Moderation.
Complies with BACKEND_SYSTEM_DESIGN.md and project rules.
"""
import pytest
from fastapi.testclient import TestClient


def test_non_enrolled_student_cannot_submit_review(client: TestClient, student_token: str):
    """
    Ensures that a student cannot submit a review for a course they have not enrolled in.
    """
    headers = {"Authorization": f"Bearer {student_token}"}
    payload = {
        "rating": 5,
        "comment": "دیدگاه آزمایشی برای دوره‌ای که ثبت‌نام نشده است."
    }
    # Attempt review on a course the student has NOT enrolled in
    res = client.post("/api/v1/courses/course-nihayah-1/reviews", json=payload, headers=headers)
    assert res.status_code == 403
    data = res.json()
    assert "تنها دانشجویانی که در این دوره ثبت‌نام کرده‌اند" in data.get("detail", "")


def test_enrolled_student_can_submit_and_update_review(client: TestClient, student_token: str):
    """
    Ensures that an enrolled student can submit a 1-5 star rating and comment,
    and updating it replaces their previous review cleanly.
    """
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Enroll student in course-ishraq
    enroll_res = client.post("/api/v1/courses/course-ishraq/enroll", headers=headers)
    assert enroll_res.status_code in [200, 201, 400]

    # 2. Submit initial 5-star review
    review_payload = {
        "rating": 5,
        "comment": "درس‌گفتار بسیار عمیق و برهانی استاد در تبیین اصالت وجود."
    }
    res = client.post("/api/v1/courses/course-ishraq/reviews", json=review_payload, headers=headers)
    assert res.status_code == 200
    review_data = res.json()
    assert review_data["rating"] == 5
    assert review_data["comment"] == review_payload["comment"]
    assert "id" in review_data
    review_id = review_data["id"]

    # 3. Update existing review to 4-star with revised text
    update_payload = {
        "rating": 4,
        "comment": "ویرایش دیدگاه: مباحث سرفصل دوم نیاز به تمرکز بیشتری داشت."
    }
    update_res = client.post("/api/v1/courses/course-ishraq/reviews", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["id"] == review_id
    assert updated_data["rating"] == 4
    assert updated_data["comment"] == update_payload["comment"]


def test_course_reviews_summary_and_distribution(client: TestClient, student_token: str):
    """
    Tests public retrieval of reviews summary, average rating, and distribution.
    """
    headers = {"Authorization": f"Bearer {student_token}"}
    res = client.get("/api/v1/courses/course-ishraq/reviews", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "average_rating" in data
    assert "total_reviews" in data
    assert "rating_distribution" in data
    assert "reviews" in data
    assert data["can_review"] is True
    assert data["user_review"] is not None


def test_admin_moderation_delete_review(client: TestClient, student_token: str, admin_token: str):
    """
    Tests that admin can delete an inappropriate review, and unauthorized users cannot.
    """
    stu_headers = {"Authorization": f"Bearer {student_token}"}
    adm_headers = {"Authorization": f"Bearer {admin_token}"}

    # Student posts a review on course-ishraq (already enrolled or enroll first)
    client.post("/api/v1/courses/course-ishraq/enroll", headers=stu_headers)
    post_res = client.post(
        "/api/v1/courses/course-ishraq/reviews",
        json={"rating": 3, "comment": "پیام تستی برای آزمایش حذف ادمین."},
        headers=stu_headers
    )
    assert post_res.status_code == 200
    review_id = post_res.json()["id"]

    # Student tries to delete -> 403 Forbidden
    stu_del = client.delete(f"/api/v1/admin/reviews/{review_id}", headers=stu_headers)
    assert stu_del.status_code == 403

    # Admin deletes review -> 200 OK
    adm_del = client.delete(f"/api/v1/admin/reviews/{review_id}", headers=adm_headers)
    assert adm_del.status_code == 200
    assert adm_del.json()["success"] is True

    # Check reviews list does not contain deleted review
    list_res = client.get("/api/v1/courses/course-ishraq/reviews")
    assert not any(r["id"] == review_id for r in list_res.json()["reviews"])


def test_admin_ban_and_unban_user_from_comments(client: TestClient, student_token: str, admin_token: str):
    """
    Tests banning a spamming user from submitting comments, verifying 403, and unbanning.
    """
    stu_headers = {"Authorization": f"Bearer {student_token}"}
    adm_headers = {"Authorization": f"Bearer {admin_token}"}

    # Get student user ID
    me_res = client.get("/api/v1/auth/me", headers=stu_headers)
    assert me_res.status_code == 200
    student_id = me_res.json()["id"]

    # 1. Admin bans student from comments
    ban_res = client.post(
        f"/api/v1/admin/users/{student_id}/ban-comments",
        json={"is_banned": True},
        headers=adm_headers
    )
    assert ban_res.status_code == 200
    assert ban_res.json()["is_comment_banned"] is True

    # 2. Student attempts to post a review -> Rejected with 403
    client.post("/api/v1/courses/course-ishraq/enroll", headers=stu_headers)
    banned_post = client.post(
        "/api/v1/courses/course-ishraq/reviews",
        json={"rating": 1, "comment": "تست ارسال با کاربر مسدود شده."},
        headers=stu_headers
    )
    assert banned_post.status_code == 403
    assert "مسدود" in banned_post.json()["detail"]

    # 3. Admin unbans student
    unban_res = client.post(
        f"/api/v1/admin/users/{student_id}/ban-comments",
        json={"is_banned": False},
        headers=adm_headers
    )
    assert unban_res.status_code == 200
    assert unban_res.json()["is_comment_banned"] is False

    # 4. Student can now post review again
    allowed_post = client.post(
        "/api/v1/courses/course-ishraq/reviews",
        json={"rating": 5, "comment": "دیدگاه پس از رفع مسدودیت حساب کاربری."},
        headers=stu_headers
    )
    assert allowed_post.status_code == 200
    assert allowed_post.json()["rating"] == 5
