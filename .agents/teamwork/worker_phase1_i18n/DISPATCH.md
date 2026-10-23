## 2026-09-30T01:07:18Z

You are Worker 0 responsible for Phase 1: Shared Infrastructure & Trilingual Localization Dictionaries for the Philosophy Zanjirzan App redesign.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase1_i18n

MANDATORY READING:
You MUST read the authoritative request file before starting:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Project Root:
e:\personal\philosophy_zanjirzan_app

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit:
- frontend/src/lib/data.ts
- frontend/next.config.js
Do NOT modify any other files.

Context & Reference Reports:
Read the reports prepared by the Survey Explorers:
- Explorer 1 (Catalog): e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog\report.md
- Explorer 2 (Dashboard & Admin): e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_admin_dashboard\report.md
- Explorer 3 (Learning & Roadmap): e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_learning_roadmap\report.md

Your Tasks:
1. In `frontend/src/lib/data.ts`, inspect `i18nDict` (which holds dictionary objects for 'fa', 'ar', and 'en').
2. Add comprehensive, consistent trilingual dictionary entries for all required sections across Persian (`fa`), Arabic (`ar`), and English (`en`):
   - Catalog: catalog titles, search placeholders, type filters (all/offline/online), duration, lessons count, star rating, bookmarks, sample lecture preview, instructor credentials («استاد سطوح عالی حوزه علمیه و مدرس فلسفه و کلام اسلامی»), book catalog categories and details.
   - Dashboard & Admin: tab titles (`overview`, `courses`, `saved`, `notes`, `orders`, `profile`, `stats`, `media`, `coupons`, `users`, `settings`), KPI metric labels and units, ongoing courses table columns (`course`, `category`, `progress`, `action`, `resume`), bar chart titles/labels, auth gate title/description/login button.
   - Learning Theater & Roadmap: player status labels, playlist stepper labels (completed, pending, current, handouts, session notes), roadmap stage indicators (completed, upcoming, expand, collapse), and trilingual roadmap FAQs.
3. Strict Persian Writing Rules:
   - NEVER use «میباشد / میباشند» -> use «است / هستند».
   - NEVER use «میگردد / گردید» -> use «میشود / شد».
   - Use proper ZWNJ (نیمفاصله) where needed.
   - Scholar identity must strictly be «حجت الاسلام دکتر زنجیر زن حسینی».
4. In `frontend/next.config.js`:
   - Inspect configuration. If `output: 'standalone'` causes Windows ENOENT errors on 500.html during Next.js 15 static export, remove or adjust `output: 'standalone'` to ensure clean compilation.
5. Verification:
   - Run `cd frontend && npm run build` to verify 0 errors.
   - Run `..\backend\.venv\Scripts\python.exe audit_pipeline.py` (from project root or `backend\.venv\Scripts\python.exe audit_pipeline.py`) to verify 100/100 score.
6. Write your handoff report to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase1_i18n\handoff.md` and message parent when complete.
