# End-to-End Visual Manual QA Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perform an exhaustive, end-to-end visual manual QA audit across the Dr. Zanjirzan platform using real browser automation (`chrome-devtools-mcp`), capturing visual evidence for every user flow, and generating a structured `END_TO_END_QA_REPORT.md`.

**Architecture:** Drive the real Chrome browser via Chrome DevTools MCP tools (`navigate_page`, `fill`, `click`, `take_screenshot`, `resize_page`, `evaluate_script`), validating the frontend (port 3000) and backend (port 8000) in real time. Save all screenshots into the brain artifacts directory, inspect them, and synthesize findings into an authoritative QA report.

**Tech Stack:** Chrome DevTools MCP, Next.js 15, FastAPI, React 19, VideoJS, Three.js (3D Book Canvas), Tailwind CSS.

**Spec:** User QA Directive covering 5 core platform workflows:
1. Admin Studio & Course Creation (`/admin`)
2. Public Catalog Verification (`/courses` & `/books`)
3. Learning Environment & Media Player (`/courses/[id]/learn`)
4. 3D Book Reader & Canvas Watermark (`/books/[id]`)
5. Student Dashboard & Metric Strip (`/dashboard`)

## Global Constraints
- Strictly adhere to scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
- Anti-slop: No neon glow balls, no gradient clipped text, no pulsing green dots, Dana Persian typography.
- Hard evidence rule: No completion claims without fresh screenshot evidence and tool outputs.

---

### Task 1: Authenticate and Admin Studio Course Creation Audit
- [ ] Ensure local servers (FastAPI backend :8000, Next.js frontend :3000) are healthy.
- [ ] Navigate to `http://localhost:3000/fa/login` and log in with admin phone `09120000000` / `admin_secret_2026`.
- [ ] Navigate to `http://localhost:3000/fa/admin?tab=courses`.
- [ ] Click "+ افزودن درس‌گفتار جدید" to trigger the course creation modal.
- [ ] Fill in authentic philosophical metadata:
  - Title: `شرح و تعلیقه بر اسفار اربعه: سفر نفس و معاد`
  - Subject Category: `فلسفه`
  - Type: `حضوری / آفلاین`
  - Media Format: `ویدیو + صوت (ترکیبی)`
  - Price: `رایگان`
  - Description: `بررسی جامع مبانی حکمت متعالیه در باب تجرد نفس و معاد جسمانی تحت اشراف حجت الاسلام دکتر زنجیر زن حسینی.`
- [ ] Capture Screenshot 1: `qa_1_course_creation_form.png`.
- [ ] Submit the form and verify the new course appears in the admin courses table.
- [ ] Capture Screenshot 2: `qa_2_admin_course_table_updated.png`.

### Task 2: Public Catalog Verification (`/courses` & `/books`)
- [ ] Navigate to `http://localhost:3000/fa/courses`.
- [ ] Verify 16:9 aspect ratio and 4px spacing tokens on course cards.
- [ ] Test category filtering by clicking category tabs (e.g. `کلام استدلالی`, `فلسفه`).
- [ ] Capture Screenshot 3 (Desktop 1280px): `qa_3_catalog_desktop_1280.png`.
- [ ] Resize viewport to mobile (375x812) using `resize_page` and capture responsive view.
- [ ] Capture Screenshot 4 (Mobile 375px): `qa_4_catalog_mobile_375.png`.
- [ ] Reset viewport to 1280x800 and verify `/books` catalog.

### Task 3: Learning Environment & VideoJS Player Audit (`/courses/[id]/learn`)
- [ ] Navigate to a course learning room (e.g., `http://localhost:3000/fa/courses/course-asfar/learn`).
- [ ] Verify the video player layout, controls alignment, speed controls, and timeline scrubber.
- [ ] Test seeking the playhead and test switching sessions on the vertical episode timeline.
- [ ] Open the Q&A discussion tab / description accordion below the player.
- [ ] Capture Screenshot 5: `qa_5_learn_theater_player_qa.png`.

### Task 4: 3D Book Reader & Canvas Watermark Audit (`/books/[id]`)
- [ ] Navigate to a book detail reader page (e.g. `http://localhost:3000/fa/books/book-bidayah`).
- [ ] Trigger the 3D flipbook reader canvas.
- [ ] Inspect the canvas rendering, page turn animation, and anti-piracy DRM watermark.
- [ ] Capture Screenshot 6: `qa_6_3d_book_reader_canvas.png`.

### Task 5: Student Dashboard Audit (`/dashboard`)
- [ ] Navigate to `http://localhost:3000/fa/dashboard`.
- [ ] Verify the 4-card KPI metric strip (`دوره‌های ثبت‌نامی`, `ساعات آموزش`, `پیشرفت تحصیلی`, `گواهی‌نامه‌ها`).
- [ ] Check ongoing courses progress bar and certificates view.
- [ ] Capture Screenshot 7: `qa_7_student_dashboard_overview.png`.

### Task 6: Report Generation & Synthesis (`END_TO_END_QA_REPORT.md`)
- [ ] Compile comprehensive `END_TO_END_QA_REPORT.md` with visual evidence links, UX audit observations, and verification proofs.
