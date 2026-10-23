## 2026-09-30T01:14:23Z
You are Worker 3 responsible for Milestone 3: Learning Environment & Roadmap Stepper for the Philosophy Zanjirzan App redesign.

Your working directory is:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_learning_roadmap

MANDATORY READING:
You MUST read the authoritative request file before starting:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md

Project Root:
e:\personal\philosophy_zanjirzan_app

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit or create ONLY these files:
- frontend/src/components/learn/AudioVideoPlayerEngine.tsx
- frontend/src/components/learn/CoursePlaylistSidebar.tsx
- frontend/src/components/CurriculumRoadmap.tsx
- frontend/src/app/courses/[id]/learn/page.tsx
- frontend/src/app/roadmap/page.tsx
DO NOT modify any other files (other workers are running concurrently on other files).

Reference Architecture:
Read Explorer 3's report:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_learning_roadmap\report.md

Requirements to implement (R3, R4, R5):
1. `AudioVideoPlayerEngine.tsx`:
   - Adjust container border-radius to `rounded-2xl` (from `rounded-3xl`).
   - Add a frosted glass play button (`w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-xl hover:scale-105 transition`) centered on the player canvas.
2. `CoursePlaylistSidebar.tsx`:
   - Implement a Vertical Timeline Stepper for the playlist.
   - Vertical connecting line: `border-s-2 border-zinc-100 dark:border-zinc-800`.
   - Completed nodes: Solid checkmark nodes (`w-6 h-6 rounded-full bg-[#8A532B] text-white flex items-center justify-center`).
   - Pending nodes: Hollow circle pending steps (`w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141518]`).
   - Active step: Accent ring or highlighted circle.
   - Accordion-based metadata disclosure for descriptions, session notes, and handouts.
3. `CurriculumRoadmap.tsx`:
   - Implement Vertical Timeline Stepper for roadmap stages.
   - Connecting line: `border-s-2 border-zinc-100 dark:border-zinc-800`.
   - Completed stages: Solid checkmark nodes (`bg-[#8A532B] text-white`).
   - Upcoming stages: Hollow circle pending steps.
   - Accordion-based metadata disclosure for each stage (descriptions, books, prerequisites) to eliminate text clutter.
4. Refactor `courses/[id]/learn/page.tsx`:
   - Ensure all hardcoded Persian strings read dynamically from `dict` / `useLanguage()`.
5. Refactor `roadmap/page.tsx`:
   - Localize the FAQ items across Persian, Arabic, and English using `dict.roadmap_faq_*`.
6. Anti-AI-slop & Design Rules:
   - ZERO `blur-3xl`, ZERO `bg-clip-text text-transparent`, ZERO `animate-pulse`.
   - 4px spacing scale (`p-1` through `p-8`), `text-2xl` heading ceiling.
   - 100% Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`).
   - Strict scholar identity: «حجت الاسلام دکتر زنجیر زن حسینی».
   - Zero Persian bureaucratic verbs («میباشد», «گردید»).
7. Write handoff report to `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\worker_phase2_learning_roadmap\handoff.md`. Send completion message when done.
