# DESIGN.md — Hayat (حیات) Official Design System
> Inspired by `VoltAgent/awesome-design-md` (Linear + Stripe Press + Apple Music Classical).
> **Single Source of Visual Truth:** Every page, component, modal, badge, table, and state in this repository MUST strictly obey this specification.

## 1. Aesthetic Identity & Brand Persona
* **Platform Title:** پایگاه رسمی نشر آثار و دروس حجت الاسلام دکتر زنجیر زن حسینی (Hayat)
* **Canonical Scholar Name:** `حجت الاسلام دکتر زنجیر زن حسینی` (Must ALWAYS be used consistently across all Persian headers, footers, metadata, and cards).
* **Aesthetic Direction:** *"Scholastic Editorial Minimalism"* — Warm archival chamois paper surfaces (`#FAF8F5`), deep obsidian night surfaces (`#0C0D0E`), 1px hairline borders (`#E6E1D8` / `#22242A`), raw umber leather accents (`#8A532B`), and burnished brass highlights (`#C58B43`).

## 2. Strict Color & Surface Tokens

### Light Mode (Archival Chamois — Default)
* **Page Canvas Background:** `bg-[#FAF8F5]` (Warm Archival Cream — NEVER use pure `#FFFFFF` as the main page background).
* **Elevated Card / Surface:** `bg-white` (`#FFFFFF`) resting on `#FAF8F5`.
* **Muted / Secondary Surface:** `bg-[#EFECE6]` or `bg-[#F2ECE1]` (for filter pills, 3D book stages, and subtle boxes).
* **Primary Ink (Headings & Strong Copy):** `text-[#0C0D0E]` or `text-zinc-900`.
* **Secondary Body Copy:** `text-zinc-600` (`#52525B`).
* **Muted Metadata / Serial Codes:** `text-zinc-500` (`#71717A`).
* **1px Hairline Border:** `border-[#E6E1D8]` or `border-zinc-200`.

### Dark Mode (Obsidian Scholarly Night)
* **Page Canvas Background:** `dark:bg-[#0C0D0E]`.
* **Elevated Card / Surface:** `dark:bg-[#141518]`.
* **Muted / Secondary Surface:** `dark:bg-[#18191D]` or `dark:bg-[#1C1E22]`.
* **Primary Ink:** `dark:text-[#FAF8F5]` or `dark:text-zinc-50`.
* **Secondary Body Copy:** `dark:text-zinc-400`.
* **1px Hairline Border:** `dark:border-[#22242A]` or `dark:border-zinc-800`.

### Brand Accents & Contrast Rules (WCAG AAA)
* **Primary Brand Accent (Raw Umber):** `#8A532B` (Hover state: `#724424`).
* **Secondary Brand Accent (Burnished Gold):** `#C58B43` (Light highlight on dark backgrounds: `#E6CA85`).
* **High-Contrast Floating Pill (Price / DRM Badge):** `bg-[#0C0D0E]/90 text-[#FAF8F5] dark:bg-[#FAF8F5]/95 dark:text-[#0C0D0E] border border-[#8A532B]/40`.
* **Anti-Slop Color Ban:** NEVER use neon cyan, purple/indigo gradients, bright lime, or default uncalibrated Tailwind `blue-500` / `red-500` / `green-500` buttons.

## 3. Typography & Trilingual Rules (`fa`, `ar`, `en`)
* **Persian & Arabic Font Stack:** `'Dana'`, `'Vazirmatn'`, sans-serif.
* **Zero Letter-Spacing Rule for RTL:** `letter-spacing: normal !important` on all RTL elements. NEVER apply `tracking-widest` or `tracking-wider` to Persian or Arabic text because it disconnects cursive letters.
* **English (LTR) Font Stack:** `'Inter'`, `-apple-system`, `BlinkMacSystemFont`, sans-serif.
* **Tabular Numerals:** Always use `.font-num` (`font-variant-numeric: tabular-nums`) and pass numbers through `toLocale(value)` from `useLanguage()`.
* **Heading Scale Discipline:**
  * Page `H1`: `text-xl sm:text-2xl font-bold leading-snug` (Capped at `text-2xl` — never use oversized `text-5xl` marketing headers).
  * Section `H2`: `text-lg sm:text-xl font-bold`.
  * Card Title `H3`: `text-base font-bold leading-snug line-clamp-2 min-h-[2.75rem]`.
  * Body Text: `text-xs sm:text-sm leading-relaxed text-justify`.
  * Archival Serial Tag: `text-[11px] font-mono` (e.g., `[CRS-01]`, `[ ۰۱ ]`).

## 4. Layout, Geometry & Logical RTL/LTR Properties
* **Logical CSS Properties Only:**
  * Forbidden: `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l-*`, `border-r-*`, `rounded-l-*`, `rounded-r-*`.
  * Mandatory: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s-*`, `border-e-*`, `rounded-s-*`, `rounded-e-*`.
* **Directional Icons:** All directional icons (`ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight`, `Send`) MUST include `rtl:rotate-0 ltr:rotate-180` (or appropriate directional flip) so they point accurately in both RTL and LTR.
* **Card Symmetry:** Every card inside a grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) MUST use `flex flex-col justify-between` with fixed-height clamped titles (`line-clamp-2 min-h-[2.75rem]`) so sibling cards have identical heights.

## 5. Motion Physics & Haptics
* **Editorial Spring:** `{ type: 'spring', stiffness: 420, damping: 34, mass: 0.75 }`.
* **Tactile Press Spring:** `{ type: 'spring', stiffness: 520, damping: 28, mass: 0.6 }` with `whileTap={{ scale: 0.96 }}`.
* **Forbidden Animations:** Never use `animate-ping`, `animate-bounce`, or slow `ease-in` transitions.
