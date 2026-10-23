## 2026-09-30T01:14:23Z
You are Worker 1 responsible for Milestone 1: Catalog Views (/courses, /books) & Shared Components for the Philosophy Zanjirzan App redesign.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_catalog

MANDATORY READING:
You MUST read the authoritative request file before starting:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Project Root:
e:\personal\philosophy_zanjirzan_app

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit or create ONLY these files:
- frontend/src/components/ui/CategoryTabStrip.tsx
- frontend/src/components/ui/CourseCard.tsx
- frontend/src/components/ui/CompactHorizontalCard.tsx
- frontend/src/components/ui/BookCard.tsx
- frontend/src/hooks/useBookmarks.ts
- frontend/src/app/courses/page.tsx
- frontend/src/app/books/page.tsx
- frontend/src/app/courses/[id]/page.tsx
- frontend/src/app/books/[id]/page.tsx
DO NOT modify any other files (other workers are running concurrently on other files).

Reference Architecture:
Read Explorer 1's report:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog\report.md

Requirements to implement (R1, R4, R5):
1. `CategoryTabStrip.tsx`:
   - Active category tab strip with minimal underlines: `border-b-2 border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 -mb-px`.
   - Clean horizontal scroll with subtle border-b (`border-zinc-200 dark:border-zinc-800`).
2. `CourseCard.tsx`:
   - 16:9 media preview (`aspect-video rounded-xl overflow-hidden relative`).
   - Subtle price pill on media corner (`absolute bottom-3 end-3 bg-[#0C0D0E]/80 backdrop-blur-sm text-amber-200 text-xs px-2.5 py-1 rounded-full`).
   - Bookmark button with `backdrop-blur-sm` (`absolute top-3 start-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center`).
   - Star rating with localized numbers, duration (`catalog_hours_suffix`), lessons count (`catalog_sessions_suffix`).
   - Clean instructor footer row with circular avatar (`/images/ostad_zanjirzan.jpg`), official scholar name «حجت الاسلام دکتر زنجیر زن حسینی», and academic credentials.
3. `CompactHorizontalCard.tsx`:
   - Compact horizontal card for secondary "Featured" row below catalog, separated by thin lines (`divide-y divide-zinc-200 dark:divide-zinc-800`).
4. `BookCard.tsx`:
   - Elegant book card with cover thumbnail preview, badges, author credentials, and reader action.
5. `useBookmarks.ts`:
   - Hook managing bookmarked course/book IDs with `localStorage` persistence.
6. Refactor `courses/page.tsx` and `books/page.tsx`:
   - Incorporate `CategoryTabStrip`, `CourseCard` / `BookCard` grid, and secondary "Featured" row with `CompactHorizontalCard`.
   - Use `useLanguage()` and dictionary keys (`catalog_*`, `dict`) so all text works dynamically in Persian, Arabic, and English.
7. Refactor `courses/[id]/page.tsx` and `books/[id]/page.tsx`:
   - Fix 4px spacing scale (remove `p-3.5` / `py-3.5`), ensure circular avatar and official credentials.
8. Anti-AI-slop & Design Rules:
   - ZERO `blur-3xl`, ZERO `bg-clip-text text-transparent`, ZERO `animate-pulse`.
   - Warm paper (`#FAF8F5`) and obsidian (`#0C0D0E`), terracotta accent (`#8A532B`).
   - 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
   - Strict scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero Persian bureaucratic verbs («میباشد», «گردید»).
9. Write handoff report to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_catalog\handoff.md`. Send completion message when done.
