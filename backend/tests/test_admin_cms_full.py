# -*- coding: utf-8 -*-
"""
Automated Comprehensive Test Suite for Dynamic Database-Backed Admin CMS.
Platform: پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی
"""
import pytest


def test_site_config_cms_flow(client, admin_token, student_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Public config accessible unauthenticated
    res = client.get("/api/v1/admin/public-config")
    assert res.status_code == 200
    cfg = res.json()
    assert cfg["scholar_name_fa"] == "حجت الاسلام دکتر زنجیر زن حسینی"
    assert "announcement_bar_text" in cfg
    assert "stat_years" in cfg

    # 2. Courses alias also works
    res_alias = client.get("/api/v1/courses/site-config")
    assert res_alias.status_code == 200
    assert res_alias.json()["scholar_name_fa"] == "حجت الاسلام دکتر زنجیر زن حسینی"

    # 3. RBAC: anonymous or student cannot update site config
    res_anon = client.put("/api/v1/admin/site-config", json={"announcement_bar_text": "تست هک"})
    assert res_anon.status_code == 401

    res_stu = client.put("/api/v1/admin/site-config", json={"announcement_bar_text": "تست هک"}, headers=student_headers)
    assert res_stu.status_code == 403

    # 4. Admin updates config
    new_banner = "ثبت‌نام سال تحصیلی جدید دروس خارج فقه و فلسفه آغاز شد"
    res_update = client.put(
        "/api/v1/admin/site-config",
        json={
            "announcement_bar_text": new_banner,
            "stat_students": "۶,۲۰۰+",
            "announcement_bar_active": True,
        },
        headers=admin_headers,
    )
    assert res_update.status_code == 200
    assert res_update.json()["success"] is True
    assert res_update.json()["config"]["announcement_bar_text"] == new_banner

    # 5. Public config reflects update immediately from database
    res_check = client.get("/api/v1/admin/public-config")
    assert res_check.status_code == 200
    assert res_check.json()["announcement_bar_text"] == new_banner
    assert res_check.json()["stat_students"] == "۶,۲۰۰+"


def test_articles_cms_crud(client, admin_token, student_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Public articles list
    res = client.get("/api/v1/admin/public-articles")
    assert res.status_code == 200
    articles = res.json()
    assert isinstance(articles, list)

    # 2. RBAC check on article creation
    res_anon = client.post("/api/v1/admin/articles", json={"title_fa": "مقاله جعلی"})
    assert res_anon.status_code == 401

    res_stu = client.post("/api/v1/admin/articles", json={"title_fa": "مقاله جعلی"}, headers=student_headers)
    assert res_stu.status_code == 403

    # 3. Admin creates article
    article_payload = {
        "id": "art-test-101",
        "slug": "burhan-seddiqin-analysis",
        "title_fa": "بررسی روش‌شناختی برهان صدیقین در فلسفه صدرایی",
        "title_ar": "دراسة منهجية لبرهان الصديقين في الفلسفة الصدرائية",
        "title_en": "Methodological Analysis of Burhan al-Siddiqin in Sadrian Philosophy",
        "category_fa": "فلسفه",
        "read_time_fa": "۱۴ دقیقه مطالعه",
        "publish_date_fa": "آبان ۱۴۰۳",
        "abstract_fa": "این مقاله به تبیین مقدمات برهانی ملاصدرا در اثبات واجب تعالی بدون وساطت خلق می‌پردازد.",
        "content_fa": "حقیقت وجود، خیر محض و اصیل است و تشکیک در مراتب آن راهگشای حل معضل ربط حادث به قدیم است...",
        "pdf_url": "/sample-books/burhan.pdf",
        "author": "حجت الاسلام دکتر زنجیر زن حسینی",
    }
    res_create = client.post("/api/v1/admin/articles", json=article_payload, headers=admin_headers)
    assert res_create.status_code == 200
    created = res_create.json()["article"]
    assert created["id"] == "art-test-101"
    assert created["title_fa"] == article_payload["title_fa"]

    # 4. Article appears in public listing
    res_pub = client.get("/api/v1/admin/public-articles")
    ids = [a["id"] for a in res_pub.json()]
    assert "art-test-101" in ids

    # 5. Admin updates article
    res_up = client.put(
        "/api/v1/admin/articles/art-test-101",
        json={"read_time_fa": "۱۸ دقیقه مطالعه", "abstract_fa": "چکیده به‌روزشده مقاله برهان صدیقین"},
        headers=admin_headers,
    )
    assert res_up.status_code == 200
    assert res_up.json()["article"]["readTime"] == "۱۸ دقیقه مطالعه"

    # 6. Admin deletes article
    res_del = client.delete("/api/v1/admin/articles/art-test-101", headers=admin_headers)
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True

    # 7. Deleted article is gone
    res_after = client.get("/api/v1/admin/public-articles")
    ids_after = [a["id"] for a in res_after.json()]
    assert "art-test-101" not in ids_after


def test_categories_cms_crud(client, admin_token, student_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Public categories
    res = client.get("/api/v1/admin/public-categories")
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 8

    # 2. Admin creates category
    cat_payload = {
        "id": "cat-test-kalam-jadid",
        "name": "کلام جدید و فلسفه دین",
        "slug": "kalam-jadid",
        "description": "پاسخ به شبهات الحادی، معرفت‌شناسی دینی و نسبت علم و دین",
        "icon_name": "ShieldCheck",
        "display_order": 9,
    }
    res_create = client.post("/api/v1/admin/categories", json=cat_payload, headers=admin_headers)
    assert res_create.status_code == 200
    created = res_create.json()["category"]
    assert created["name_fa"] == "کلام جدید و فلسفه دین"

    # 3. Update category
    res_up = client.put(
        "/api/v1/admin/categories/cat-test-kalam-jadid",
        json={"name": "کلام معاصر و فلسفه دین"},
        headers=admin_headers,
    )
    assert res_up.status_code == 200
    assert res_up.json()["category"]["name_fa"] == "کلام معاصر و فلسفه دین"

    # 4. Delete category
    res_del = client.delete("/api/v1/admin/categories/cat-test-kalam-jadid", headers=admin_headers)
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True


def test_books_cms_crud(client, admin_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Admin creates book
    book_payload = {
        "id": "book-test-asfar-vol1",
        "title": "شرح برهان صدیقین اسفار اربعه",
        "subtitle": "تقریرات دروس خارج حکمت متعالیه",
        "author": "حجت الاسلام دکتر زنجیر زن حسینی",
        "publisher": "انتشارات حکمت و فلسفه اسلامی",
        "print_edition": "چاپ اول (جلد گالینگور)",
        "pages_count": 520,
        "isbn": "978-622-00-1122-3",
        "price": "۴۵۰,۰۰۰",
        "physical_price": "۵۲۰,۰۰۰",
        "stock": 40,
        "cover_image": "/images/book_cover_real.jpg",
        "synopsis": "اثری جامع در تشریح موضع ملاصدرا در مرحله ششم اسفار اربعه.",
        "is_coming_soon": False,
    }
    res_create = client.post("/api/v1/admin/books", json=book_payload, headers=admin_headers)
    assert res_create.status_code == 200
    b = res_create.json()["book"]
    assert b["id"] == "book-test-asfar-vol1"
    assert b["title"] == book_payload["title"]

    # 2. Update book
    res_up = client.put(
        "/api/v1/admin/books/book-test-asfar-vol1",
        json={"price": "۴۸۰,۰۰۰", "stock": 35},
        headers=admin_headers,
    )
    assert res_up.status_code == 200
    assert res_up.json()["book"]["price"] == "۴۸۰,۰۰۰"

    # 3. Delete book
    res_del = client.delete("/api/v1/admin/books/book-test-asfar-vol1", headers=admin_headers)
    assert res_del.status_code == 200
    assert res_del.json()["success"] is True


def test_coupons_cms_crud(client, admin_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Admin creates coupon
    coupon_payload = {
        "code": "RAMADAN1404",
        "discount_percent": 35,
        "max_uses": 200,
        "expires_at": "2027-12-30T23:59:59",
        "is_active": True,
    }
    res_create = client.post("/api/v1/admin/coupons", json=coupon_payload, headers=admin_headers)
    assert res_create.status_code == 200
    c = res_create.json()["coupon"]
    assert c["code"] == "RAMADAN1404"
    assert c["discount_percent"] == 35

    # 2. Validate created coupon in checkout engine
    val_res = client.post("/api/v1/coupons/validate", json={"code": "RAMADAN1404", "cart_total": 1000000})
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["valid"] is True
    assert val_data["discount_amount"] == 350000

    # 3. Toggle coupon to inactive
    toggle_res = client.put("/api/v1/admin/coupons/RAMADAN1404/toggle", headers=admin_headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["active"] is False

    # 4. Inactive coupon cannot be used
    inv_res = client.post("/api/v1/coupons/validate", json={"code": "RAMADAN1404", "cart_total": 1000000})
    assert inv_res.status_code == 400

    # 5. Delete coupon
    del_res = client.delete("/api/v1/admin/coupons/RAMADAN1404", headers=admin_headers)
    assert del_res.status_code == 200


def test_observability_metrics(client):
    res = client.get("/api/v1/observability/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["scholar_identity"] == "حجت الاسلام دکتر زنجیر زن حسینی"
    assert "system" in data
    assert "performance" in data
    assert "security_logs" in data


def test_courses_and_chapters_cms_update(client, admin_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Update existing course
    course_id = "course-ishraq"
    update_data = {
        "title": "حکمت اشراق و مطابقت با اصول عقلی (ویرایش ادمین)",
        "level": "سطح خارج و اجتهادی",
        "capacity": 45,
        "skyroom_url": "https://www.skyroom.online/ch/zanjirzan/ishraq-live",
        "schedule": "دوشنبه‌ها و چهارشنبه‌ها ساعت ۱۶:۰۰",
        "price": "رایگان پژوهشی",
    }
    res_up = client.put(f"/api/v1/admin/courses/{course_id}", json=update_data, headers=admin_headers)
    assert res_up.status_code == 200
    assert res_up.json()["success"] is True

    # 2. Add chapter
    ch_payload = {
        "title": "جلسه آزمایشی جدید حکمت اشراق",
        "duration": "۵۲:۰۰",
        "is_preview": True,
        "audio_stream_url": "/audio/sample_lecture.wav",
    }
    res_add_ch = client.post(f"/api/v1/admin/courses/{course_id}/chapters", json=ch_payload, headers=admin_headers)
    assert res_add_ch.status_code == 200
    ch_data = res_add_ch.json()["chapter"]
    ch_id = ch_data["id"]

    # 3. Update chapter
    up_ch_payload = {
        "title": "جلسه آزمایشی حکمت اشراق (به‌روزشده)",
        "duration": "۵۵:۰۰",
        "is_preview": False,
        "audio_stream_url": "/audio/sample_lecture_updated.wav",
    }
    res_up_ch = client.put(f"/api/v1/admin/courses/{course_id}/chapters/{ch_id}", json=up_ch_payload, headers=admin_headers)
    assert res_up_ch.status_code == 200
    assert res_up_ch.json()["success"] is True

    # 4. Delete chapter
    res_del_ch = client.delete(f"/api/v1/admin/courses/{course_id}/chapters/{ch_id}", headers=admin_headers)
    assert res_del_ch.status_code == 200

