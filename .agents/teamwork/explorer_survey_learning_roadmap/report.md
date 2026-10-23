# Comprehensive Investigation Report: Learning Environment, Roadmap, Localization & Quality Verification Pipeline

**Explorer**: Explorer 3 (Learning, Roadmap, Localization & Audit Pipeline)  
**Date**: 2026-09-30  
**Project**: Philosophy Zanjirzan App Redesign  
**Status**: Investigation Complete — Ready for Implementation  

---

## Executive Summary

This report delivers a full architectural survey of:
1. **The Learning Environment** (`src/app/courses/[id]/learn/page.tsx` and `src/components/learn/*`).
2. **The Curriculum Roadmap** (`src/app/roadmap/page.tsx` and `src/components/CurriculumRoadmap.tsx`).
3. **Multi-Language Localization (R5)** (`src/context/LanguageContext.tsx`, `src/lib/localization.ts`, and `i18nDict` in `src/lib/data.ts`).
4. **The Automated Quality Verification Pipeline & Build Pipeline** (`audit_pipeline.py`, `package.json`, `npm run build`, `tailwind.config.js`).

### Baseline Health Status
- **Build Status**: `npm run build` compiles with **0 errors** (all 15 Next.js App Router routes compiled cleanly, including `/courses/[id]/learn` and `/roadmap`).
- **Audit Pipeline Score**: `backend\.venv\Scripts\python.exe audit_pipeline.py` passes with **100/100** across all 8 quality gates.
- **AI Slop Scan**: 0 instances of `blur-3xl`, 0 gradient clipped text (`bg-clip-text text-transparent`), 0 pulsing green dots (`animate-pulse`).
- **Scholar Identity**: 100% adherence to «حجت الاسلام دکتر زنجیر زن حسینی».
- **Persian Writing**: 100% clean of forbidden administrative copulas («می‌باشد/گردید») and bureaucratic clichés.

---

## 1. Learning Environment (`/courses/[id]/learn`) Deep Dive

### 1.1 File Structure & Component Inventory
```
frontend/src/
├── app/courses/[id]/learn/
│   └── page.tsx                         # Main Theater View (2-column layout)
└── components/learn/
    ├── AudioVideoPlayerEngine.tsx       # Media playback container, scrubbers, DRM watermark
    ├── CoursePlaylistSidebar.tsx        # Chapter list (needs Vertical Stepper refactor)
    ├── CourseQaAccordion.tsx            # Scholarly Q&A accordion disclosure
    └── CourseHandoutsTab.tsx            # Session handouts and transcripts download
```

### 1.2 Analysis of `src/app/courses/[id]/learn/page.tsx`
- **Route Handling**: Handles dynamic route parameter via `use(params)`: `resolvedParams.id || 'course1'`.
- **State Management**:
  - `activeChapterIndex`: currently selected session (0-indexed).
  - `activeSubTab`: toggles between `'qa'` and `'handouts'`.
  - `completedChapters`: array of finished chapter IDs `[1]`.
- **Layout Architecture**:
  - Max width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`.
  - Breadcrumb header with direct navigation back to course landing: `/courses/${courseId}`.
  - 12-column grid:
    - 8 columns: `AudioVideoPlayerEngine` + Subtabs (`CourseQaAccordion` / `CourseHandoutsTab`).
    - 4 columns: `CoursePlaylistSidebar` (sticky at `top-6`) + Scholar Office Notice card.
- **Identified Deficiencies & Gaps against R3/R4/R5**:
  1. *Localization*: Several UI strings are hardcoded in Persian (e.g., `'درس‌گفتارها'`, `'مدرس: حجت الاسلام دکتر زنجیر زن حسینی'`, `'مشاهده صفحه معرفی دوره'`, `'پرسش‌ها و مباحثات علمی'`, `'تقریرات و جزوات درسی'`, and DRM notice).
  2. *Heading Ceiling*: Main title uses `text-xl sm:text-2xl font-bold` (compliant with `text-2xl` ceiling).
  3. *Spacing scale*: Uses clean 4px scale (`space-y-6`, `p-4`, `py-6`).

### 1.3 Analysis of `AudioVideoPlayerEngine.tsx`
- **Current State**:
  - Container: `bg-[#0C0D0E] border border-zinc-800 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between text-start relative select-none`.
  - DRM Watermark: Dynamic rotating banner cycling every 14 seconds across 4 corners with subtle glass badge (`bg-black/60 backdrop-blur-xs text-[10px] font-mono text-zinc-400 border border-zinc-800/80`).
  - Media Mode: Supports switching between Audio (`صوت ۴۸kHz`) and Video (`ویدیو`).
  - Canvas area: Currently displays a static colored circle icon (`w-16 h-16 rounded-full bg-[#8A532B]`).
- **Identified Deficiencies & Gaps against R3**:
  1. **Container Border Radius**: Currently `rounded-3xl`. R3 specifically mandates `rounded-2xl` for a clean media player container.
  2. **Play Button**: The screen center lacks the mandated **frosted glass play button (`bg-black/40 backdrop-blur-md`)**. Currently, the play button is only present in the bottom control bar (`w-10 h-10 rounded-full bg-[#8A532B]`).
  3. **RTL / Logical Properties**: Mostly compliant (`ps-`, `start-`, `end-`), but control tooltips and button labels are hardcoded Persian.

### 1.4 Analysis of `CoursePlaylistSidebar.tsx`
- **Current State**:
  - Renders a plain vertical list of button elements:
    `<button className="w-full p-3 rounded-2xl text-xs flex items-center justify-between text-start transition cursor-pointer ...">`
  - Chapter number is displayed in brackets `[{toLocale(idx + 1)}]`.
  - Completed items show a trailing `CheckCircle2` icon.
- **Identified Deficiencies & Gaps against R3**:
  1. **Missing Vertical Timeline Stepper**: There is NO vertical connecting line running through the chapters.
  2. **Missing Node Types**: Lacks completed solid checkmark nodes (`bg-[#8A532B]`) and hollow circle pending steps.
  3. **Missing Accordion Metadata Disclosure**: Currently, clicking an item only changes the active index. There is no accordion disclosure showing lesson summary, topics discussed, duration breakdown, or free preview badges.

---

## 2. Curriculum Roadmap (`/roadmap` & `CurriculumRoadmap.tsx`) Deep Dive

### 2.1 File Structure
```
frontend/src/
├── app/roadmap/
│   └── page.tsx                     # Roadmap route page + FAQ Accordion
└── components/
    └── CurriculumRoadmap.tsx        # 5-Stage Curriculum Timeline Stepper
```

### 2.2 Analysis of `src/app/roadmap/page.tsx`
- Breadcrumb + H1: `text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight` (strictly adheres to `text-2xl` ceiling).
- Embeds `<CurriculumRoadmap />`.
- FAQ section uses `<details className="group rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 ...">`.
- **Gaps against R5**:
  - `faqItems` array in `page.tsx` is hardcoded only in Persian. It must be localized or driven by `currentLang` to support Arabic and English.

### 2.3 Analysis of `CurriculumRoadmap.tsx`
- **Current State**:
  - Contains rich 5-stage data (`roadmapStagesData`):
    - Stage 1: مبادی تفکر و منطق اجتهادی (Logic)
    - Stage 2: حکمت و هستی‌شناسی پایه (Fundamental Metaphysics)
    - Stage 3: اصول فقه و متدولوژی استنباط (Legal Epistemology & Usul)
    - Stage 4: حکمت متعالیه و فلسفه اشراق (Transcendent Theosophy & Illuminationism)
    - Stage 5: عرفان نظری و شهود سلوکی (Theoretical Mysticism)
  - All 5 stages have full tri-lingual fields (`title_fa`, `title_ar`, `title_en`, `outcomes_fa/ar/en`, `keyBooks_fa/ar/en`, `coursesList`).
  - Connecting line: `border-s-2 border-[#8A532B]/30` (line 522).
  - Stage indicator node: `<div className="absolute -start-[37px] sm:-start-[45px] top-0 w-8 h-8 rounded-full border-2 border-[#8A532B] bg-[#FAF8F5] dark:bg-[#0C0D0E] ..."> ۰{stage.stepNumber} </div>` (line 532).
  - Each stage displays a heavy card with all descriptions, outcomes list, reference books, and course grid always expanded simultaneously.
- **Identified Deficiencies & Gaps against R3**:
  1. **Line Style**: Currently `border-s-2 border-[#8A532B]/30`. R3 requires `border-l-2 border-zinc-100` (or `border-s-2 border-zinc-100 dark:border-zinc-800`).
  2. **Node Styling**: Currently displays numbers (`۰۱`, `۰۲`). R3 mandates **completed solid checkmark nodes (`bg-[#8A532B]`)** for completed milestones, and **hollow circle pending steps** for pending/upcoming stages.
  3. **Accordion Disclosure**: Descriptions and metadata are currently fully static and uncollapsed. R3 mandates **accordion-based metadata disclosure for descriptions**, allowing students to cleanly expand/collapse syllabi and reading lists without text clutter.

---

## 3. Localization Architecture (R5) Deep Dive

### 3.1 Architecture Overview
The application localization is built on a clean three-tiered design:
1. **Tier 1: Global Language Context (`LanguageContext.tsx`)**
   - Stored preference: `localStorage.getItem('zan_lang')`.
   - `dir` and `lang` applied to `document.documentElement`.
   - Exposes:
     - `currentLang`: `'fa' | 'ar' | 'en'`
     - `setLanguage(lang: SupportedLang)`
     - `dict`: dictionary of current language from `i18nDict`
     - `isRtl`: boolean (`currentLang !== 'en'`)
     - `dir`: `'rtl' | 'ltr'`
     - `toLocale(num)`: digits converted according to language numeral system.
     - `t(key, fallback)`: string lookup.
2. **Tier 2: Entity Localization Helper (`src/lib/localization.ts`)**
   - Suffix getter: `getLocalized(item, field, lang, fallbackLang)` reads `${field}_${lang}`.
   - Domain wrappers:
     - `getLocalizedCourse(course, lang)`
     - `getLocalizedBook(book, lang)`
     - `getLocalizedCategory(category, lang)`
     - `getLocalizedArticle(article, lang)`
3. **Tier 3: Core Dictionary (`src/lib/data.ts` - `i18nDict`)**
   - Three complete dictionary objects: `fa` (lines 2088-2549), `ar` (lines 2550-3011), `en` (lines 3012-3473).
   - Covers over 200 UI keys.

### 3.2 Required Additions for R3 & R5
To ensure 100% localization in the Learning Environment and Roadmap without any hardcoded strings, the following keys must be present in all 3 dictionaries (`fa`, `ar`, `en`):

| Key | Persian (`fa`) | Arabic (`ar`) | English (`en`) |
|---|---|---|---|
| `learn_breadcrumb_courses` | درس‌گفتارها | الدروس والمحاضرات | Lectures & Courses |
| `learn_instructor_prefix` | مدرس: | المدرس: | Instructor: |
| `learn_view_course_intro` | مشاهده صفحه معرفی دوره | عرض صفحة التعريف بالدورة | View Course Overview |
| `learn_tab_qa` | پرسش‌ها و مباحثات علمی | الأسئلة والمباحثات العلمية | Scholarly Q&A |
| `learn_tab_handouts` | تقریرات و جزوات درسی | التقريرات والكراريس الدراسية | Lecture Transcripts & Handouts |
| `learn_playlist_title` | سرفصل جلسات درس‌گفتار | فصول ومحاضرات الدورة | Course Syllabus & Sessions |
| `learn_drm_title` | استماع قانونی با رعایت حقوق شرعی مؤلف | الاستماع القانوني مع رعاية الحقوق الشرعية للمؤلف | Authorized Listening & Copyright Compliance |
| `learn_drm_desc` | تمامی فایل‌های صوتی منحصراً برای استفاده شخصی دانش‌پژوه ثبت‌نام‌شده است... | جميع الملفات الصوتية مخصصة حصرياً للاستخدام الشخصي للطالب المسجل... | All audio files are exclusively for the personal use of enrolled students... |
| `learn_step_completed` | تکمیل‌شده | مكتمل | Completed |
| `learn_step_current` | در حال فراگیری | قيد الاستماع | In Progress |
| `learn_step_pending` | در انتظار فراگیری | قيد الانتظار | Pending |
| `learn_free_preview` | نمونه رایگان | معاينة مجانية | Free Preview |
| `learn_session_handout_dl` | دریافت جزوه جلسه | تحميل الكراس | Download Handout |
| `roadmap_quick_jump` | جهش سریع به مرحله: | الانتقال السريع للمرحلة: | Quick Jump to Stage: |
| `roadmap_step_completed` | مرحله سپری‌شده | مرحلة مكتملة | Completed Stage |
| `roadmap_step_pending` | مرحله در انتظار | مرحلة قادمة | Upcoming Stage |
| `roadmap_toggle_details` | جزئیات سرفصل‌ها و منابع | تفاصيل المحاور والمصادر | View Syllabus & Resources |
| `roadmap_collapse_details` | بستن جزئیات | إغلاق التفاصيل | Collapse Details |
| `player_mode_audio` | صوت ۴۸kHz | صوت ٤٨ كيلوهرتز | 48kHz Studio Audio |
| `player_mode_video` | ویدیوی استودیویی | فيديو استوديو | Studio Video Stream |

---

## 4. Quality Verification Pipeline (`audit_pipeline.py`) Detailed Analysis

### 4.1 Audit Engine Architecture
The audit engine (`audit_pipeline.py`) contains 8 specific quality verification functions executed sequentially. Each function returns `(score: int, details: str)`:
```
Final Score = round(sum(scores) / 8)
100/100 required for production pass
```

### 4.2 Detailed Analysis of All 8 Checks

#### Gate 1: `check_scholar_identity()`
- **Weight**: 12.5%
- **Exact Scholar String**: `"حجت الاسلام دکتر زنجیر زن حسینی"`
- **Files Inspected**:
  1. `frontend/src/lib/data.ts`
  2. `frontend/src/app/page.tsx`
  3. `frontend/src/components/Navbar.tsx`
  4. `backend/app/core/config.py`
  5. `backend/app/main.py`
  6. `frontend/public/llms.txt`
- **Rule**: If `"دکتر میثم زنجیرزن"` or `"دکتر زنجیرزن حسینی"` occurs without the full exact title, score drops to 50/100.
- **Current Result**: **100/100** (Passed).

#### Gate 2: `check_anti_slop_rules()`
- **Weight**: 12.5%
- **Target Directories**: `frontend/src/app` and `frontend/src/components` (recursively scanning all `*.tsx`).
- **Exact Regexes Prohibited**:
  1. `r'blur-3xl\s+bg-(?:amber|emerald|purple|indigo)-500/10'` (ambient neon glow balls)
  2. `r'bg-clip-text\s+text-transparent\s+bg-gradient'` (multicolor gradient text)
  3. `r'w-2\s+h-2\s+rounded-full\s+bg-emerald-500\s+animate-pulse'` (generic pulsing green tag dots)
- **Current Result**: **100/100** (Clean).

#### Gate 3: `check_backend_tests()`
- **Weight**: 12.5%
- **Command Executed**: `backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py`
- **Verification**: Verifies database models, DRM token signing, auth hashing, and API error contracts.
- **Current Result**: **100/100** (Passed).

#### Gate 4: `check_seo_artifacts()`
- **Weight**: 12.5%
- **Target Files**:
  1. `frontend/src/app/sitemap.ts`
  2. `frontend/src/app/robots.ts`
  3. `frontend/public/llms.txt`
  4. `SEO_STANDARDS.md`
- **Current Result**: **100/100** (All present).

#### Gate 5: `check_audio_processing_assets()`
- **Weight**: 12.5%
- **Target Files**: `audio_enhance_colab.ipynb` and `audio_enhance_kaggle.ipynb`.
- **Criteria**: Must include `"ProcessPoolExecutor"` for parallel 48kHz audio enhancement.
- **Current Result**: **100/100** (Passed).

#### Gate 6: `check_root_standards()`
- **Weight**: 12.5%
- **Target Documents**: `DESIGN.md`, `BACKEND_SYSTEM_DESIGN.md`, `SEO_STANDARDS.md`, `GEMINI.md`, `.agents/rules/anti-slop.md`, `.agents/rules/persian-writing.md`, `.agents/skills/persian-writing/SKILL.md`.
- **Current Result**: **100/100** (All present).

#### Gate 7: `check_persian_writing_quality()`
- **Weight**: 12.5%
- **Target Directories**: `frontend/src/app`, `frontend/src/lib`, `frontend/src/components`, `frontend/src/context` (recursively scanning `.ts`, `.tsx`, `.js`, `.jsx`).
- **Forbidden Regex Patterns**:
  1. `r'می‌باشد|می باشد'` (use `است`)
  2. `r'می‌باشند|می باشند'` (use `هستند`)
  3. `r'(?<![بازبر])گردید'` (use `شد` - negative lookbehind preserves بازگردید and برگردید)
  4. `r'(?<![بازبر])می‌گردد'` (use `می‌شود` - preserves بازمی‌گردد and برمی‌گردد)
  5. `r'لازم به ذکر است'`
  6. `r'شایان ذکر است'`
  7. `r'نقش بسزایی'`
  8. `r'از اهمیت ویژه‌ای برخوردار'`
  9. `r'سپری نمودن'`
- **Current Result**: **100/100** (Clean).

#### Gate 8: `check_spec_kit_compliance()`
- **Weight**: 12.5%
- **Target Files**: `specs/constitution.md`, `specs/001-bespoke-editorial-experience/spec.md`, `plan.md`, `tasks.md`, `MotionPrimitives.tsx`.
- **Criteria**: `specs/constitution.md` must contain `"حجت الاسلام دکتر زنجیر زن حسینی"` and `"Bespoke Editorial Press"`.
- **Current Result**: **100/100** (Passed).

---

## 5. Architectural Blueprints for R3 Implementation

### 5.1 Vertical Timeline Stepper Component Pattern
For both `CoursePlaylistSidebar` and `CurriculumRoadmap`, the stepper should implement the following unified structure:

```tsx
<div className="relative border-s-2 border-zinc-100 dark:border-zinc-800 ms-4 ps-6 space-y-6">
  {steps.map((step, idx) => {
    const isCompleted = step.isCompleted;
    const isCurrent = step.isCurrent;

    return (
      <div key={step.id} className="relative group">
        {/* Node on Vertical Line */}
        <div
          className={`absolute -start-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-[#8A532B] text-white shadow-xs'
              : isCurrent
              ? 'border-2 border-[#8A532B] bg-white dark:bg-[#141518] text-[#8A532B]'
              : 'border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#141518] text-transparent'
          }`}
        >
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : isCurrent ? (
            <div className="w-2 h-2 rounded-full bg-[#8A532B]" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          )}
        </div>

        {/* Stepper Card with Accordion Disclosure */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] p-4">
          {/* Header trigger & details */}
        </div>
      </div>
    );
  })}
</div>
```

### 5.2 Clean Media Player Container (`rounded-2xl`) with Frosted Glass Play Button
In `AudioVideoPlayerEngine.tsx`:
1. Change outer wrapper from `rounded-3xl` to `rounded-2xl`.
2. Center screen play button:
```tsx
<div className="relative min-h-[300px] sm:min-h-[420px] bg-zinc-950 rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
  {/* Frosted Glass Play Button Overlay */}
  <button
    onClick={() => setIsPlaying(!isPlaying)}
    className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xl z-20 group-hover:bg-black/50"
    aria-label={isPlaying ? dict.player_pause : dict.player_play}
  >
    {isPlaying ? (
      <Pause className="w-6 h-6 fill-current" />
    ) : (
      <Play className="w-6 h-6 fill-current ps-0.5" />
    )}
  </button>
</div>
```

---

## 6. Verification Method

To independently verify all findings and validate future implementations:

1. **Compilation Check**:
   ```bash
   cd e:\personal\philosophy_zanjirzan_app\frontend
   npm run build
   ```
   *Expected outcome*: 0 errors, successful static page generation for all 15 routes.

2. **Quality Gate Pipeline**:
   ```bash
   cd e:\personal\philosophy_zanjirzan_app
   backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *Expected outcome*: 100/100 final score across all 8 validation steps.

3. **Anti-Slop Pattern Verification**:
   Verify no forbidden tokens are present:
   - `grep_search` for `blur-3xl`, `bg-clip-text`, `animate-pulse` in `frontend/src/app` and `frontend/src/components`.

4. **Persian Writing Verification**:
   Verify absence of `می‌باشد`, `می باشد`, `گردید`, `می‌گردد`, `لازم به ذکر است`, `شایان ذکر است`.

---

## 7. Actionable Implementation Checklist

- [ ] **Step 1 (Localization Dictionary)**: Add missing `learn_*`, `player_*`, and `roadmap_*` keys to `fa`, `ar`, `en` in `frontend/src/lib/data.ts`.
- [ ] **Step 2 (`AudioVideoPlayerEngine.tsx`)**:
  - Update outer radius to `rounded-2xl`.
  - Add prominent frosted glass play button (`w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10`).
  - Connect text labels to `dict`.
- [ ] **Step 3 (`CoursePlaylistSidebar.tsx`)**:
  - Refactor into Vertical Timeline Stepper with connecting line (`border-s-2 border-zinc-100 dark:border-zinc-800`).
  - Solid checkmark nodes (`bg-[#8A532B]`) for completed chapters.
  - Hollow circle pending steps for upcoming chapters.
  - Accordion disclosure (`<details>` or collapsible section) for chapter synopsis, duration, and handouts.
- [ ] **Step 4 (`CurriculumRoadmap.tsx` & `/roadmap/page.tsx`)**:
  - Update connecting line to `border-s-2 border-zinc-100 dark:border-zinc-800`.
  - Refactor stage markers to use solid checkmark nodes (`bg-[#8A532B]`) for completed stages and hollow circles for pending stages.
  - Wrap detailed syllabus and book lists into clean accordion disclosures.
  - Localize FAQ items in `/roadmap/page.tsx` for `fa`, `ar`, `en`.
- [ ] **Step 5 (Full Verification)**:
  - Run `npm run build` in `frontend/`.
  - Run `backend\.venv\Scripts\python.exe audit_pipeline.py`.
  - Verify 100/100 score and 0 compilation errors.
