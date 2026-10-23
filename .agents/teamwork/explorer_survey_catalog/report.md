# Comprehensive Investigation & Survey Report: Catalog Views & Shared UI

**Target Scope**: `/courses`, `/books`, Course/Book Detail Pages, and Shared UI Components  
**Investigator**: Explorer 1 (Survey & Catalog Specialist)  
**Date**: 2026-09-30  
**Project**: Official Academic & Educational Platform of **«حجت الاسلام دکتر زنجیر زن حسینی»**  
**Working Directory**: `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_survey_catalog`

---

## ۱. Executive Summary

This investigation surveys the current implementations of the Course and Book catalog views (`src/app/courses`, `src/app/books`), detail views (`src/app/courses/[id]`, `src/app/books/[id]`), and related card components (`MinimalCourseCard.tsx`, `SquircleCard.tsx`, `CourseCatalogBento.tsx`). 

### Core Assessment:
1. **Category Tab Strips**:
   - Current `/courses` uses heavy, fully filled pill buttons (`rounded-full bg-[#8A532B] text-white`) for both course type and categories, creating visual density and pill-clutter.
   - Current `/books` completely lacks category tabs or topic filters.
   - **Requirement R1** mandates an active category tab strip with **minimal underlines** (`border-b-2 border-zinc-900 font-medium` / `dark:border-zinc-100`), reducing visual weight and bringing editorial refinement.
2. **Course Cards**:
   - Current `MinimalCourseCard` uses a square side thumbnail (`w-20 h-20 sm:w-24 sm:h-24`), non-standard border radiuses (`rounded-[2rem] sm:rounded-[2.25rem]`), inline text price, and lacks 16:9 previews, subtle price pills, bookmark buttons, star ratings, and circular avatar credentials.
   - **Requirement R1** mandates: 16:9 media preview (`aspect-video`), subtle price pill on media corner, bookmark button (`backdrop-blur-sm`), star rating, duration, lessons count, and a clean instructor footer row featuring a circular avatar image and official scholar credentials.
3. **Secondary "Featured" Row**:
   - Currently, neither `/courses` nor `/books` contains a secondary "Featured" section below the main catalog.
   - **Requirement R1** mandates a secondary "Featured" row below with compact horizontal cards separated by thin lines (`divide-y` or 1px subtle borders).
4. **Book Catalog (`/books`)**:
   - The existing books page renders raw text cards without visual book mockups or cover previews, missing the rich visual identity present on the homepage and 3D reader.
   - Requires modularization into a dedicated `BookCard` with cover artwork preview, price pill, bookmark button, 3D reader trigger, and author footer row.
5. **System Rules & Anti-Slop (R4 & R5)**:
   - The codebase passes `audit_pipeline.py` at 100/100; however, hardcoded Persian strings in `/courses` and `/books` bypass `LanguageContext`, violating the tri-lingual mandate (Arabic, Persian, English).
   - Strict adherence to the 4px spacing scale (`p-1` through `p-8`), `text-2xl` heading ceiling, warm paper/obsidian contrast, 100% Tailwind logical properties, and exact scholar identity **«حجت الاسلام دکتر زنجیر زن حسینی»** is verified and detailed in this report.

---

## ۲. Detailed Audit of Existing Catalog Implementations

### ۲.۱ `src/app/courses/page.tsx`
- **File Length**: 240 lines (`'use client'`).
- **Dependencies**: Lucide icons (`Headphones`, `Search`, `Radio`, `Calendar`, `Users`, `Clock`, `ArrowUpRight`, `ShieldCheck`), `Navbar`, `CartModal`, `MinimalCourseCard`, `usePlayer`, `useData`, `useLanguage`.
- **Observed Structure**:
  1. *Breadcrumbs & Header* (Lines 68-84):
     - Uses hardcoded Persian text (`صفحه اصلی / درس‌گفتارهای علمی و تربیتی`, `آرشیو دوره‌ها و درس‌گفتارهای تخصصی`).
     - H1 is capped at `text-2xl font-bold` (conforms to R4 ceiling).
  2. *Top Controls* (Lines 86-135):
     - Segmented type toggle: `all`, `offline`, `online` using `px-3.5 py-1.5 rounded-full`.
     - Search input: `relative w-full sm:w-64`, `input ps-9 pe-3 py-1.5 rounded-full`.
  3. *Skyroom Banner* (Lines 138-168):
     - Conditionally renders when `selectedType === 'online'`.
     - Uses hardcoded strings for title and alert dialogs.
  4. *Subject Filter Pills* (Lines 170-196):
     - Uses horizontal scroll pill buttons:
       ```tsx
       <button
         onClick={() => setSelectedSubject(cat.name)}
         className={`px-3 py-1 rounded-full transition shrink-0 cursor-pointer ${
           selectedSubject === cat.name
             ? 'bg-[#8A532B] text-white shadow-xs'
             : 'bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 ...'
         }`}
       >
         {cat.name}
       </button>
       ```
     - **Deficiency**: Violates R1 minimal underline requirement. Clutters UI with bubble pills.
  5. *Main Course Grid* (Lines 198-220):
     - `grid grid-cols-1 md:grid-cols-2 gap-4`.
     - Renders `MinimalCourseCard`.
  6. *Missing Elements*:
     - **No Secondary "Featured" Row**: There is no secondary row below featuring compact horizontal cards separated by thin lines.

### ۲.۲ `src/components/ui/MinimalCourseCard.tsx`
- **File Length**: 210 lines (`'use client'`).
- **Props**: `course: AudioCourse`, `currentLang?: SupportedLang`, `dict?: any`, `isPlaying?: boolean`, `onPlaySample?: () => void`, `statusBadgeText?: string`, `sessionNumber?: number`, `progressPercent?: number`, `showProgress?: boolean`.
- **Observed Layout**:
  - Container (Line 60): `relative rounded-[2rem] sm:rounded-[2.25rem] border border-stone-200/90 dark:border-neutral-800 bg-[#FAF6F0] dark:bg-[#16171B] p-5 sm:p-7`.
  - Row 1: Badges (`ShadcnBadge`, online/offline pill, status pill).
  - Row 2: Thumbnail Image (`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl` square) + title + text instructor + meta/progress.
  - Row 3: Action button row with audition button and Link.
- **Deficiencies Against R1**:
  - ❌ Media Preview is an 80px/96px side square, NOT a **16:9 media preview** (`aspect-video`).
  - ❌ Price is rendered as plain text in the middle column (`شهریه: ...`), NOT a **subtle price pill on media corner**.
  - ❌ Lacks **bookmark button with `backdrop-blur-sm`**.
  - ❌ Lacks **star rating** display.
  - ❌ Instructor section is merely plain text without a **circular avatar and credentials row**.
  - ❌ Non-standard outer radius: `rounded-[2rem]` / `rounded-[2.25rem]`.

### ۲.۳ `src/app/books/page.tsx`
- **File Length**: 175 lines (`'use client'`).
- **Observed Structure**:
  1. *Header & Search* (Lines 58-93):
     - Hardcoded Persian strings (`مونوگراف‌ها، رسائل و آثار مکتوب فلسفی`).
     - Simple search bar without category tabs.
  2. *Books Grid* (Lines 95-152):
     - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
     - Cards are purely textual: badge (`انتشارات دارالحکمة`), title, author, description, price, buttons (`ورق‌زن`, `سفارش کتاب`).
- **Deficiencies Against R1**:
  - ❌ **No Category Tab Strip**: All books are listed indiscriminately.
  - ❌ **No Visual Preview**: Completely omits book cover mockups or 3D spine graphics, despite having `coverGradient`, `coverBorder`, and `cover_image` in `booksDatabase`.
  - ❌ **No Bookmark Button**.
  - ❌ **No Secondary "Featured" Row**: No compact horizontal row for featured works or rare monographs.
  - ❌ **Hardcoded Strings**: No multilingual integration with `dict` or `useLanguage()`.

### ۲.۴ `src/app/courses/[id]/page.tsx` & `src/app/books/[id]/page.tsx`
- **Course Detail (`courses/[id]/page.tsx`)**:
  - Hero header card contains title, level, share button, and metadata.
  - Instructor metadata: `<GraduationCap className="w-4 h-4 text-[#8A532B] ..." /> <span>{dict.course_instructor_label} {instructor}</span>`.
  - Needs upgrade to clean circular avatar (`/images/ostad_zanjirzan.jpg`) and credentials.
  - Spacing cleanup: Replace fractional `p-3.5` and `py-3.5` with clean 4px scale `p-3` or `p-4`.
- **Book Detail (`books/[id]/page.tsx`)**:
  - Hardcover mockup on start, description, specifications, and CTAs on end.
  - Needs clean author circular avatar row with credentials.

---

## ۳. Data Models & State Management Audit

### ۳.۱ `AudioCourse` Model (`src/lib/data.ts`)
```typescript
export interface AudioCourse {
  id: string;
  title_fa: string;
  title_ar: string;
  title_en: string;
  desc_fa?: string;
  desc_ar?: string;
  desc_en?: string;
  instructor_fa: string;
  instructor_ar: string;
  instructor_en: string;
  episodes_count: number;
  duration_fa: string;
  duration_ar: string;
  duration_en: string;
  level_fa: string;
  level_ar: string;
  level_en: string;
  price_fa: string;
  price_ar: string;
  price_en: string;
  sampleAudioUrl: string;
  media_type?: 'audio' | 'video' | 'hybrid';
  thumbnail?: string;
  course_type: 'offline' | 'online';
  subject: string;
  formatCategory?: string;
  subjectCategory?: string;
  // Online course properties
  capacity?: number;
  enrolledCount?: number;
  platform?: 'skyroom';
  skyroomUrl?: string;
  schedule?: string;
  status?: 'registration_open' | 'capacity_full' | 'in_progress';
  // Offline course properties
  telegramUrl?: string;
  cloudStreamUrl?: string;
  driveFolderId?: string;
  chapters: {
    id: number;
    title_fa: string;
    title_ar?: string;
    title_en?: string;
    duration: string;
    isFreePreview?: boolean;
    audioUrl?: string;
    videoUrl?: string;
    cloudUrl?: string;
    media_type?: 'audio' | 'video' | 'hybrid';
  }[];
}
```

#### Observations & Proposed Augmentations:
1. **Rating Field**: `src/types/index.ts` specifies `rating: number;`, but `AudioCourse` in `data.ts` does not have an explicit `rating` property. It is recommended to add `rating?: number;` (defaulting to `5.0` or `4.9` in mock/catalog views).
2. **Instructor Credentials**: Current courses have `instructor_fa: 'حجت الاسلام دکتر زنجیر زن حسینی'`. We should standardize credentials:
   - Persian: `مدرس سطوح عالی حوزه • شارح حکمت متعالیه و اسفار`
   - Arabic: `أستاذ السطوح العليا في الحوزة العلمية • شارح الأسفار الأربعة`
   - English: `Lecturer of Advanced Seminary Studies • Commentator on Transcendent Philosophy`
3. **Instructor Avatar**: Standardized at `/images/ostad_zanjirzan.jpg`.

### ۳.۲ `Book` & `ExtendedBook` Models
- `Book` contains: `id`, `title_fa/ar/en`, `author_fa/ar/en`, `formatCategory`, `subjectCategory`, `desc_fa/ar/en`, `price_fa/ar/en`, `badge_fa/ar/en`, `coverGradient`, `coverBorder`, `cover_image`, `pages`.
- In `booksDatabase`:
  - `book1`: `subjectCategory: 'حکمت متعالیه'`
  - `book2`: `subjectCategory: 'حکمت اشراق'`
  - `book3`: `subjectCategory: 'فلسفه و کلام'`
  - `book4`: `subjectCategory: 'فلسفه تطبیقی'`
- These categories naturally map to the category tab strip for `/books`!

### ۳.۳ Bookmark State Management
- Currently, bookmarking is only implemented inside `BookReader3D.tsx` for book page numbers.
- For catalog views, course and book bookmarking requires a clean state hook:
  - Create `src/hooks/useBookmarks.ts` (persisting to `localStorage` key `'zan_bookmarks'`).
  - Allows instant toggling with `backdrop-blur-sm` bookmark buttons on cards.

---

## ۴. Analysis of Requirements for R1

### ۴.۱ Active Category Tab Strip with Minimal Underlines
- **Exact Requirement**:
  "Active category tab strip with minimal underlines (`border-b-2 border-zinc-900 font-medium`)."
- **Design Specifications**:
  - Light mode active: `border-b-2 border-zinc-900 text-zinc-900 font-medium`
  - Dark mode active: `dark:border-zinc-100 dark:text-zinc-100`
  - Inactive: `text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-normal transition-colors`
  - Container: `border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-6 overflow-x-auto scrollbar-none`
  - Tab spacing: `pb-3 pt-1 -mb-px` so the 2px active border sits flush on the 1px baseline divider.
  - Count pill (optional): `ms-1.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400`.

### ۴.۲ Redesigned Course Cards
- **Exact Requirement**:
  "Update course cards to feature a 16:9 media preview, subtle price pill on media corner, bookmark button (`backdrop-blur-sm`), star rating, duration, and lessons count. Use a clean instructor footer row with a circular avatar and credentials."
- **Visual Structure Blueprint**:
  ```
  +-------------------------------------------------------------+
  | [Bookmark Button (top-start, backdrop-blur-sm)]             |
  |                                                             |
  |               16:9 Media Preview Image                      |
  |                     (aspect-video)                          |
  |                                                             |
  | [Category Badge]            [Price Pill (bottom-end, blur)] |
  +-------------------------------------------------------------+
  | Star Rating (★ 5.0)  •  Duration (18h)  •  Lessons (24)     |
  |                                                             |
  | Course Title (H3, text-base/lg font-bold, max 1-2 lines)   |
  | Short Description / Level Tag                              |
  +-------------------------------------------------------------+
  | [Avatar 32px]  Scholar Name («حجت الاسلام دکتر...»)        |
  |                Credentials («مدرس سطوح عالی حوزه...»)       |
  |                                      [Action / Arrow CTA]   |
  +-------------------------------------------------------------+
  ```
- **Key Tailwind Classes**:
  - Card outer: `bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 transition duration-200 flex flex-col justify-between space-y-4`
  - Media container: `relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 group/thumb`
  - Bookmark button: `absolute top-3 start-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition cursor-pointer active:scale-95 z-10`
  - Price pill: `absolute bottom-3 end-3 px-2.5 py-1 rounded-md text-xs font-bold font-num bg-black/60 text-white backdrop-blur-sm z-10`
  - Star rating: `flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 font-num` with `<Star className="w-3.5 h-3.5 fill-current" />`
  - Duration & Lessons: `flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-num`
  - Instructor Footer: `pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3`
    - Avatar: `<img src="/images/ostad_zanjirzan.jpg" alt="حجت الاسلام دکتر زنجیر زن حسینی" className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700" />`
    - Scholar Text Stack:
      - Line 1: `text-xs font-bold text-zinc-900 dark:text-zinc-100` -> **حجت الاسلام دکتر زنجیر زن حسینی**
      - Line 2: `text-[11px] text-zinc-500 dark:text-zinc-400 truncate` -> **مدرس سطوح عالی حوزه • شارح حکمت متعالیه**

### ۴.۳ Secondary "Featured" Row with Compact Horizontal Cards
- **Exact Requirement**:
  "Add a secondary 'Featured' row below with compact horizontal cards separated by thin lines."
- **Design & Layout**:
  - Section wrapper: `pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4`
  - Header:
    - Eyebrow: `text-xs font-mono text-[#8A532B] dark:text-[#C58B43] font-bold` -> `[ گزیده کرسی‌های شاخص و برگزیده ]`
    - Title: `text-xl font-bold text-zinc-900 dark:text-zinc-50` -> `دوره‌های شاخص و مباحثات ویژه`
  - Container: `divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] rounded-2xl overflow-hidden`
  - Horizontal Card:
    - Wrapper: `p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#18191D] transition group`
    - Start Item: 16:9 thumbnail (`w-32 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 relative`)
    - Center Item: Category badge, title (`text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B]`), meta row (rating, duration, sessions count), and instructor name.
    - End Item: Price pill, audition button, and direct navigation link (`ArrowLeft` / `ChevronLeft`).

---

## ۵. Design System Constraints (R4) & i18n (R5) Analysis

### ۵.۱ 4px Spacing Scale Compliance
Every padding, margin, and gap class in the catalog views must map to multiples of 4px (`p-1` through `p-8`):
- `p-1`: 4px | `p-2`: 8px | `p-3`: 12px | `p-4`: 16px | `p-5`: 20px | `p-6`: 24px | `p-7`: 28px | `p-8`: 32px
- **Identified Non-Compliant Classes to Replace**:
  - `p-3.5` (14px) in `CourseDetailPage.tsx:243` -> replace with `p-4` (16px).
  - `py-3.5` (14px) in `CourseDetailPage.tsx:250` -> replace with `py-3` (12px) or `py-4` (16px).
  - `px-3.5` in `courses/page.tsx:90` -> replace with `px-4` (16px) or `px-3` (12px).
  - `rounded-[2rem]` / `rounded-[2.25rem]` in `MinimalCourseCard.tsx:60` -> replace with standard `rounded-2xl` (16px).

### ۵.۲ Typography & Heading Ceiling
- **Ceiling**: No heading exceeds `text-2xl` (24px - 28px).
  - Page `H1`: `text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight`
  - Section `H2`: `text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100`
  - Card `H3`: `text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100`
  - Body: `text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed`
  - Meta/Digits: `text-xs font-mono font-num`

### ۵.۳ Palette and Contrast
- **Canvas**:
  - Light: `#FAF8F5` (Warm editorial paper)
  - Dark: `#0C0D0E` (Deep obsidian)
- **Surfaces**:
  - Light: `#FFFFFF`
  - Dark: `#141518`
- **Borders**:
  - Light: `#E7E4DC` / `border-zinc-200`
  - Dark: `#23252A` / `border-zinc-800`
- **Accent**:
  - Light mode: `#8A532B` (Traditional warm leather/umber)
  - Dark mode: `#C58B43` (Ancient bronze/copper)

### ۵.۴ 100% Tailwind Logical Properties
All directional classes must be strictly logical:
- `ps-4`, `pe-4` instead of `pl-4`, `pr-4`.
- `ms-auto`, `me-2` instead of `ml-auto`, `mr-2`.
- `start-3`, `end-3` instead of `left-3`, `right-3`.
- `text-start`, `text-end` instead of `text-left`, `text-right`.
- `border-s-2`, `border-e-2` instead of `border-l-2`, `border-r-2`.

### ۵.۵ Strict Scholar Identity
- The scholar identity is non-negotiable and invariant:
  **«حجت الاسلام دکتر زنجیر زن حسینی»**
- In all cards, footers, credentials, and metadata, this exact full string must be rendered.
- Prohibited truncations: *"دکتر زنجیرزن"*, *"استاد حسینی"*, *"دکتر میثم زنجیرزن"*.

### ۵.۶ Multi-Language Support (R5)
- All catalog components must connect to `useLanguage()`:
  - `currentLang`: `'fa' | 'ar' | 'en'`
  - `dict`: localized strings from `i18nDict`
  - `toLocale`: format digits (۰۱۲۳۴۵۶۷۸۹ for fa, ٠١٢٣٤٥٦٧٨٩ for ar, 0123456789 for en).
- **Required New Dictionary Keys in `src/lib/data.ts`**:
  ```typescript
  // Catalog View Keys
  catalog_courses_page_title: string;
  catalog_courses_page_subtitle: string;
  catalog_books_page_title: string;
  catalog_books_page_subtitle: string;
  catalog_type_all: string;
  catalog_type_offline: string;
  catalog_type_online: string;
  catalog_featured_heading: string;
  catalog_featured_subheading: string;
  catalog_search_courses_ph: string;
  catalog_search_books_ph: string;
  catalog_bookmark_add: string;
  catalog_bookmark_remove: string;
  catalog_rating_label: string;
  catalog_hours_suffix: string;
  catalog_instructor_credentials: string;
  ```

---

## ۶. Component Architecture & Implementation Blueprint

### ۶.۱ Modification vs. New Creation Matrix

| File Path | Type | Action Required |
|:---|:---:|:---|
| `src/components/ui/CategoryTabStrip.tsx` | **NEW** | Minimal underline category tab strip (`border-b-2 border-zinc-900 font-medium` / `dark:border-zinc-100`), horizontal scrollable, tri-lingual. |
| `src/components/ui/CourseCard.tsx` | **NEW** | Redesigned course card: 16:9 media preview, subtle corner price pill, bookmark button with `backdrop-blur-sm`, star rating, duration, lessons count, circular avatar footer with scholar credentials. |
| `src/components/ui/CompactHorizontalCard.tsx` | **NEW** | Compact horizontal card for secondary "Featured" row: 16:9 thumbnail, title, rating/duration/session meta, avatar row, thin line separators. |
| `src/components/ui/BookCard.tsx` | **NEW** | Rich visual book card: hardcover/spine cover artwork, corner price pill, bookmark button, 3D reader trigger, order button, author footer with avatar. |
| `src/hooks/useBookmarks.ts` | **NEW** | LocalStorage-backed bookmarking hook for courses and books with instantaneous UI feedback. |
| `src/app/courses/page.tsx` | **MOD** | Integrate `CategoryTabStrip`, replace card grid with `CourseCard`, add secondary "Featured" row with `CompactHorizontalCard`, replace hardcoded strings with `useLanguage()` keys. |
| `src/app/books/page.tsx` | **MOD** | Integrate `CategoryTabStrip`, replace text cards with `BookCard`, add secondary "Featured" row for rare monographs, localize strings. |
| `src/app/courses/[id]/page.tsx` | **MOD** | Upgrade instructor row to circular avatar with credentials, clean spacing to 4px scale. |
| `src/app/books/[id]/page.tsx` | **MOD** | Upgrade author row to circular avatar with credentials, clean spacing to 4px scale. |
| `src/components/ui/MinimalCourseCard.tsx` | **MOD** | Refactor as backwards-compatible facade or replace with `CourseCard`. |
| `src/lib/data.ts` | **MOD** | Add missing catalog translation keys in `i18nDict` for `fa`, `ar`, and `en`. |

---

### ۶.۲ Code Design Specifications for New Components

#### Component 1: `CategoryTabStrip.tsx`
```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface CategoryTabStripProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function CategoryTabStrip({
  tabs,
  activeTab,
  onChange,
  className,
}: CategoryTabStripProps) {
  const { toLocale } = useLanguage();

  return (
    <nav
      role="tablist"
      aria-label="Category Filters"
      className={cn(
        'flex items-center gap-6 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 scrollbar-none text-sm select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'pb-3 pt-1 -mb-px whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer',
              isActive
                ? 'border-b-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-medium'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-normal'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[11px] font-mono font-num',
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                )}
              >
                {toLocale(tab.count)}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
```

#### Component 2: `CourseCard.tsx`
```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Clock, BookOpen, Bookmark, Play, Pause, Radio, Video, Headphones } from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';
import { useBookmarks } from '@/hooks/useBookmarks';

interface CourseCardProps {
  course: AudioCourse;
  isPlaying?: boolean;
  onPlaySample?: () => void;
}

export function CourseCard({ course, isPlaying = false, onPlaySample }: CourseCardProps) {
  const { currentLang, dict, toLocale } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(course.id);

  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const isOnline = course.course_type === 'online';
  const totalSessions = course.chapters?.length || course.episodes_count || 12;
  const duration = loc?.duration || course.duration_fa;
  const price = loc?.price || course.price_fa || (currentLang === 'en' ? 'Free' : 'رایگان');
  const rating = 4.9; // Standard scholar course rating

  return (
    <div className="bg-white dark:bg-[#141518] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#8A532B]/40 dark:hover:border-[#C58B43]/40 transition duration-200 flex flex-col justify-between space-y-4 group">
      
      {/* 16:9 Media Preview */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 group/media">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 gap-2">
            {isOnline ? <Radio className="w-8 h-8 text-emerald-500" /> : <Headphones className="w-8 h-8 text-[#C58B43]" />}
            <span className="text-xs font-mono">{loc?.subject || course.subject}</span>
          </div>
        )}

        {/* Bookmark Button (backdrop-blur-sm) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleBookmark(course.id);
          }}
          className="absolute top-3 start-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition cursor-pointer active:scale-95 z-10"
          title={bookmarked ? dict.catalog_bookmark_remove || 'حذف نشانک' : dict.catalog_bookmark_add || 'نشانک‌گذاری'}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current text-[#C58B43]' : ''}`} />
        </button>

        {/* Subtle Price Pill on Media Corner */}
        <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-md text-xs font-bold font-num bg-black/60 text-white backdrop-blur-sm z-10">
          {price}
        </div>

        {/* Play Audition Sample Overlay */}
        {onPlaySample && (
          <button
            onClick={onPlaySample}
            className="absolute inset-0 bg-black/30 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer z-0"
            title="شنیدن نمونه"
          >
            <div className="w-10 h-10 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-md">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ps-0.5" />}
            </div>
          </button>
        )}
      </div>

      {/* Meta Row: Rating, Duration, Lessons */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-num">
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{toLocale(rating)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
          <span>{toLocale(totalSessions)} {dict.course_unit_sessions || 'جلسه'}</span>
        </div>
      </div>

      {/* Course Title */}
      <Link href={`/courses/${course.id}`} className="block group/title">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover/title:text-[#8A532B] dark:group-hover/title:text-[#C58B43] transition">
          {title}
        </h3>
      </Link>

      {/* Clean Instructor Footer Row with Circular Avatar and Credentials */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/images/ostad_zanjirzan.jpg"
            alt="حجت الاسلام دکتر زنجیر زن حسینی"
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
          />
          <div className="min-w-0">
            <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              حجت الاسلام دکتر زنجیر زن حسینی
            </span>
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              مدرس سطوح عالی حوزه • شارح حکمت متعالیه
            </span>
          </div>
        </div>

        <Link
          href={`/courses/${course.id}`}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <span className="sr-only">مشاهده دوره</span>
          <BookOpen className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
```

#### Component 3: `CompactHorizontalCard.tsx`
```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Clock, BookOpen, ChevronLeft, ArrowLeft } from 'lucide-react';
import { AudioCourse } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { useLanguage } from '@/context/LanguageContext';

interface CompactHorizontalCardProps {
  course: AudioCourse;
}

export function CompactHorizontalCard({ course }: CompactHorizontalCardProps) {
  const { currentLang, dict, toLocale } = useLanguage();
  const loc = getLocalizedCourse(course, currentLang);
  const title = loc?.title || course.title_fa;
  const duration = loc?.duration || course.duration_fa;
  const sessions = course.chapters?.length || course.episodes_count || 12;
  const price = loc?.price || course.price_fa;

  return (
    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#18191D] transition group">
      
      {/* 16:9 Thumbnail Preview */}
      <div className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <img
          src={course.thumbnail || '/images/ostad_zanjirzan.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute bottom-1.5 end-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-num bg-black/70 text-white backdrop-blur-xs">
          {price}
        </span>
      </div>

      {/* Content Stack */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8A532B]/10 text-[#8A532B] dark:text-[#C58B43]">
            {loc?.subject || course.subject}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold font-num">
            <Star className="w-3 h-3 fill-current" />
            <span>{toLocale(4.9)}</span>
          </div>
        </div>

        <Link href={`/courses/${course.id}`} className="block">
          <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#8A532B] dark:group-hover:text-[#C58B43] transition truncate">
            {title}
          </h4>
        </Link>

        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-num">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            {duration}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-zinc-400" />
            {toLocale(sessions)} {dict.course_unit_sessions || 'جلسه'}
          </span>
        </div>
      </div>

      {/* Instructor Snippet & Action */}
      <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
        <div className="hidden lg:flex items-center gap-2">
          <img
            src="/images/ostad_zanjirzan.jpg"
            alt="حجت الاسلام دکتر زنجیر زن حسینی"
            className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
          />
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            حجت الاسلام دکتر زنجیر زن حسینی
          </span>
        </div>

        <Link
          href={`/courses/${course.id}`}
          className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-[#8A532B] hover:text-white dark:hover:bg-[#C58B43] dark:hover:text-zinc-950 transition flex items-center gap-1 cursor-pointer"
        >
          <span>مشاهده</span>
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </div>

    </div>
  );
}
```

---

## ۷. Step-by-Step Implementation Roadmap for Next Phase

1. **Step 1: Create Shared Primitives**:
   - Write `src/hooks/useBookmarks.ts` for bookmark toggle & persistence.
   - Write `src/components/ui/CategoryTabStrip.tsx`.
   - Write `src/components/ui/CourseCard.tsx`.
   - Write `src/components/ui/CompactHorizontalCard.tsx`.
   - Write `src/components/ui/BookCard.tsx`.
2. **Step 2: Add Multilingual Keys**:
   - Update `src/lib/data.ts` to add catalog keys to `i18nDict` for `fa`, `ar`, `en`.
3. **Step 3: Refactor `/courses` Page**:
   - Integrate `CategoryTabStrip` (with minimal underlines).
   - Use `CourseCard` grid.
   - Insert Secondary "Featured" row below with `CompactHorizontalCard`s.
   - Clean up hardcoded text to dynamic `dict.*` calls.
4. **Step 4: Refactor `/books` Page**:
   - Integrate `CategoryTabStrip`.
   - Use `BookCard` with cover artwork, price pill, bookmark button, 3D reader trigger.
   - Add secondary "Featured" row for rare monographs.
   - Clean up hardcoded text to dynamic `dict.*` calls.
5. **Step 5: Polish Detail Pages**:
   - Update instructor rows on `/courses/[id]` and `/books/[id]` to circular avatar + credentials.
   - Normalize spacing classes to 4px scale.
6. **Step 6: Quality Gate Audit**:
   - Run `npm run build` (confirm 0 errors).
   - Run `.\backend\.venv\Scripts\python.exe audit_pipeline.py` (confirm 100/100 score).
