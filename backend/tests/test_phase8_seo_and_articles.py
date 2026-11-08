# -*- coding: utf-8 -*-
"""
Automated Phase 8 SEO & Articles Compliance Test
پایگاه رسمی و جامع علمی و پژوهشی حجت الاسلام دکتر زنجیرزن حسینی
"""

import sys
from pathlib import Path

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent

def test_phase8_seo_and_articles():
    frontend_app = ROOT_DIR / "frontend/src/app"
    articles_slug_dir = frontend_app / "articles/[slug]"
    
    assert articles_slug_dir.exists(), "frontend/src/app/articles/[slug] directory missing!"
    
    # 1. Check ArticleDetailClient.tsx
    client_code = (articles_slug_dir / "ArticleDetailClient.tsx").read_text(encoding="utf-8")
    assert "'use client';" in client_code
    assert "handleShare" in client_code
    assert "navigator.share" in client_code
    assert "print:hidden" in client_code, "Missing print:hidden styling for academic PDF printout!"
    assert "SCHOLAR_NAME" in client_code
    constants_code = (ROOT_DIR / "frontend/src/lib/constants.ts").read_text(encoding="utf-8")
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in constants_code
    assert "می‌باشد" not in client_code and "می باشد" not in client_code
    assert "به شمار می‌آیند" not in client_code

    # 2. Check Server page.tsx for /articles/[slug]
    page_code = (articles_slug_dir / "page.tsx").read_text(encoding="utf-8")
    assert "generateStaticParams" in page_code
    assert "generateMetadata" in page_code
    assert "notFound()" in page_code, "notFound() call missing for invalid slugs (Soft 404 risk)!"
    assert "ScholarlyArticle" in page_code
    assert "BreadcrumbList" in page_code
    assert "datePublished" in page_code
    assert "image" in page_code
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in page_code

    # 3. Check /articles/page.tsx
    archive_code = (frontend_app / "articles/page.tsx").read_text(encoding="utf-8")
    assert "'use client';" in archive_code
    assert "scholarlyArticlesDatabase" in archive_code
    assert "categoryOptions" in archive_code
    assert "EmptyStateCard" in archive_code
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in archive_code
    assert "می‌باشد" not in archive_code

    # 4. Check sitemap.ts
    sitemap_code = (frontend_app / "sitemap.ts").read_text(encoding="utf-8")
    assert "scholarlyArticlesDatabase" in sitemap_code
    assert "coursesDatabase" in sitemap_code
    assert "booksDatabase" in sitemap_code
    assert "baseUrl = 'https://zanjirzan.ir'" in sitemap_code
    assert "/articles/${article.slug}" in sitemap_code

    # 5. Check opengraph-image.tsx
    og_code = (frontend_app / "opengraph-image.tsx").read_text(encoding="utf-8")
    assert "export const runtime = 'edge';" in og_code
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in og_code
    assert "#0C0D0E" in og_code and "#FAF8F5" in og_code and "#8A532B" in og_code and "#C58B43" in og_code
    assert "تخصصی‌ترین درگاه پژوهش و آموزش حکمت اسلامی" in og_code
    assert "۲۱ دوره تخصصی" in og_code

    # 6. Check llms.txt
    llms_text = (ROOT_DIR / "frontend/public/llms.txt").read_text(encoding="utf-8")
    assert "حجت الاسلام دکتر زنجیرزن حسینی" in llms_text
    assert "مقالات و جستارهای علمی" in llms_text
    assert "/articles/aslat-vojood-seddiqin" in llms_text

    print("✅ All Phase 8 SEO, Articles, and Scholarly Compliance checks PASSED successfully!")
    return True

if __name__ == "__main__":
    test_phase8_seo_and_articles()
