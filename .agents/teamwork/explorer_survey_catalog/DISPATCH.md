## 2026-09-30T00:58:38Z
You are Explorer 1 investigating the Catalog Views (/courses, /books) and Shared UI components for the Philosophy Zanjirzan App redesign.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog

MANDATORY READING:
You MUST read the authoritative request file before starting:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Project Root:
e:\personal\philosophy_zanjirzan_app

Your Tasks:
1. Examine existing course and book catalog implementations:
   - Check `src/app/courses`, `src/app/books`, course detail pages, card components, category tab strips, filters, search bars, instructor info sections, and featured sections.
   - Inspect their data models, API/mock data fetching, props, and existing Tailwind classes.
2. Analyze requirements for R1:
   - Active category tab strip with minimal underlines (`border-b-2 border-zinc-900 font-medium`).
   - Course cards: 16:9 media preview, subtle price pill on media corner, bookmark button (`backdrop-blur-sm`), star rating, duration, and lessons count.
   - Clean instructor footer row with circular avatar and credentials.
   - Secondary "Featured" row below with compact horizontal cards separated by thin lines.
3. Analyze design system constraints (R4) & i18n (R5):
   - 4px spacing scale (p-1 to p-8), text-2xl heading ceiling.
   - Warm paper/obsidian contrast (`bg-[#FAF8F5]` / `bg-[#0C0D0E]`), terracotta/copper accent (`#8A532B`).
   - 100% Tailwind logical properties (ps-, pe-, ms-, me-).
   - Strict scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero AI slop (no `blur-3xl`, no text gradients `bg-clip-text text-transparent`, no pulsing dots `animate-pulse`).
   - Multi-language support (Arabic, Persian, English) via `src/context/LanguageContext.tsx`.
4. Identify existing code files that need modification vs new modular components to create.
5. Write your comprehensive analysis report to:
   `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog\report.md`
   and write your standard handoff report to:
   `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog\handoff.md`.
6. When done, send a message to parent with your summary and report path.
