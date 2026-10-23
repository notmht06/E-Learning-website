# Handoff Report: Catalog Views & Shared UI Survey

**Agent**: Explorer 1 (`explorer_survey_catalog`)  
**Scope**: Catalog Views (`/courses`, `/books`), Detail Views (`/courses/[id]`, `/books/[id]`), Card Primitives, Category Tab Strips, Secondary Featured Rows  
**Date**: 2026-09-30  
**Handoff Type**: Hard (Investigation complete, actionable blueprint produced)

---

### ۱. Observation

1. **`src/app/courses/page.tsx`**:
   - Lines 87-122: Segmented type filter (`all` | `offline` | `online`) uses filled pill buttons (`px-3.5 py-1.5 rounded-full bg-[#8A532B] text-white`).
   - Lines 171-196: 8-subject filter pills use rounded buttons (`px-3 py-1 rounded-full`). Neither uses minimal underlines (`border-b-2 border-zinc-900 font-medium`).
   - Lines 199-220: Course grid renders `MinimalCourseCard` in a 2-column layout (`grid grid-cols-1 md:grid-cols-2 gap-4`).
   - There is NO secondary "Featured" row below the course catalog.
   - Lines 69-82, 129, 142-150: Contains hardcoded Persian text bypassing `LanguageContext` (e.g. `صفحه اصلی / درس‌گفتارهای علمی و تربیتی`, `آرشیو دوره‌ها و درس‌گفتارهای تخصصی`, `جستجو در عناوین دروس...`).

2. **`src/components/ui/MinimalCourseCard.tsx`**:
   - Line 60: Outer wrapper uses `rounded-[2rem] sm:rounded-[2.25rem] border ... p-5 sm:p-7`.
   - Lines 97-114: Renders a small square thumbnail (`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl`), not a 16:9 media preview (`aspect-video`).
   - Lines 159-163: Price is rendered as inline text in the content column (`شهریه: ...`), not as a subtle corner pill on media.
   - Missing: No bookmark button with `backdrop-blur-sm`, no star rating, and instructor is plain text (lines 125-128) lacking a circular avatar and credentials.

3. **`src/app/books/page.tsx`**:
   - Lines 58-93: Simple search bar in `bg-white dark:bg-[#141518] rounded-2xl p-4`.
   - No category tab strip exists for filtering books by subject.
   - Lines 95-151: Renders text-only cards with no book cover/mockup previews.
   - No bookmark button and no secondary "Featured" row.
   - Lines 60-73, 82, 109-121, 138-146: All strings are hardcoded in Persian.

4. **`src/app/courses/[id]/page.tsx` & `src/app/books/[id]/page.tsx`**:
   - Detail pages render titles, audio sessions, and purchase buttons, but lack the standardized circular scholar avatar and academic credentials row.
   - Spacing: Line 243 (`p-3.5`) and line 250 (`py-3.5`) in `courses/[id]/page.tsx` use fractional padding violating the 4px spacing scale.

5. **Quality Gate Verification**:
   - Command `.\backend\.venv\Scripts\python.exe audit_pipeline.py` passed with **100/100**:
     - Scholar identity verified: «حجت الاسلام دکتر زنجیر زن حسینی».
     - Anti-slop verified: 0 forbidden classes (`blur-3xl`, `bg-clip-text text-transparent`, `animate-pulse`).
     - Persian writing verified: 0 instances of «می‌باشد», «گردید», or bureaucratic clichés.
   - Command `npm run build` compiled 15/15 static pages successfully with 0 errors.

---

### ۲. Logic Chain

1. **Category Tab Strip Requirement (R1)**:
   - *Premise*: R1 explicitly demands "an active category tab strip with minimal underlines (`border-b-2 border-zinc-900 font-medium`)."
   - *Observation*: `courses/page.tsx` uses full pill buttons (`rounded-full`), while `books/page.tsx` has no category tabs at all.
   - *Deduction*: Extracting a shared `CategoryTabStrip.tsx` component with `border-b-2 border-zinc-900 dark:border-zinc-100 font-medium -mb-px` will satisfy R1 for both `/courses` and `/books`, providing consistent, minimal editorial navigation.

2. **Course Card Redesign (R1 & R4)**:
   - *Premise*: R1 requires "16:9 media preview, subtle price pill on media corner, bookmark button (`backdrop-blur-sm`), star rating, duration, and lessons count. Use a clean instructor footer row with a circular avatar and credentials."
   - *Observation*: `MinimalCourseCard.tsx` has a square side thumbnail, arbitrary `rounded-[2rem]` radius, inline price text, and lacks bookmark, rating, and circular avatar credentials.
   - *Deduction*: Implementing `CourseCard.tsx` with `aspect-video`, `absolute bottom-3 end-3` price pill, `absolute top-3 start-3 backdrop-blur-sm` bookmark button, `Star` rating with localized digits, and a circular avatar footer (`/images/ostad_zanjirzan.jpg` + credentials) will fulfill R1 and conform to the 4px spacing scale (`rounded-2xl`, `p-4 sm:p-5`).

3. **Secondary "Featured" Row (R1)**:
   - *Premise*: R1 requires "a secondary 'Featured' row below with compact horizontal cards separated by thin lines."
   - *Observation*: Neither `/courses` nor `/books` currently possesses a secondary row below the main grid.
   - *Deduction*: Adding a lower section featuring `CompactHorizontalCard.tsx` divided by `divide-y divide-zinc-200 dark:divide-zinc-800` creates the required secondary layer of curated courses/monographs without cluttering the primary grid.

4. **Multi-Language Architecture (R5)**:
   - *Premise*: R5 mandates dynamic support for Arabic, Persian, and English via `LanguageContext`.
   - *Observation*: Multiple user-facing headers, labels, and placeholders in `/courses` and `/books` are hardcoded in Persian.
   - *Deduction*: Adding dedicated translation keys to `i18nDict` in `src/lib/data.ts` and consuming them via `useLanguage()` guarantees 100% tri-lingual parity.

---

### ۳. Caveats

1. **Audio Audition Functionality**:
   - `CourseCard` includes a sample lecture preview button that interfaces with `usePlayer()`. The player Island must remain responsive when samples are triggered from catalog cards.
2. **Bookmark Persistence Scope**:
   - Bookmarking on catalog cards is designed as a client-side interaction backed by `localStorage` (`zan_bookmarks`). If the backend later introduces a user wishlist/bookmarks API, the hook `useBookmarks` can be cleanly swapped without touching card markup.
3. **Data Model Compatibility**:
   - `MinimalCourseCard.tsx` is only imported by `courses/page.tsx`. Replacing or wrapping it with `CourseCard.tsx` carries zero risk to other routes.

---

### ۴. Conclusion

The existing catalog implementations function correctly at a baseline level, but diverge significantly from the Dribbble-inspired editorial redesign specified in R1. 

**Actionable Implementation Plan**:
1. Create `src/components/ui/CategoryTabStrip.tsx` with minimal underlines.
2. Create `src/components/ui/CourseCard.tsx` with 16:9 media preview, subtle corner price pill, frosted glass bookmark button, star rating, duration, lessons count, and circular avatar instructor footer.
3. Create `src/components/ui/CompactHorizontalCard.tsx` for the secondary "Featured" row.
4. Create `src/components/ui/BookCard.tsx` with visual cover mockups and 3D reader triggers.
5. Create `src/hooks/useBookmarks.ts` for bookmark state management.
6. Refactor `src/app/courses/page.tsx` and `src/app/books/page.tsx` to integrate the tab strips, card grids, secondary featured rows, and multilingual `dict` keys.
7. Normalize detail pages (`courses/[id]`, `books/[id]`) to 4px spacing scale and circular avatar footers.

All findings, component prop schemas, and draft implementations have been documented in:
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog\report.md`.

---

### ۵. Verification Method

To independently verify these findings and check future implementations:

1. **Verify Scholar Identity & Anti-Slop**:
   ```bash
   .\backend\.venv\Scripts\python.exe audit_pipeline.py
   ```
   *Expected outcome*: 100/100 score with all 8 quality gates passing.

2. **Verify Next.js Build**:
   ```bash
   cd frontend
   npm run build
   ```
   *Expected outcome*: 0 TypeScript errors, successful compilation of all routes.

3. **Verify Files Inspected**:
   - Inspect `frontend/src/app/courses/page.tsx` lines 86-196 (tab pills and filters).
   - Inspect `frontend/src/components/ui/MinimalCourseCard.tsx` lines 60-165 (square thumbnail, lack of rating, price placement).
   - Inspect `frontend/src/app/books/page.tsx` lines 95-151 (lack of category tabs and cover images).
   - Inspect `frontend/public/images/ostad_zanjirzan.jpg` (verified avatar asset).
