---
name: addy-osmani
description: Senior QA & Google Chrome Web Standards from Addy Osmani. Covers /webperf (Core Web Vitals, font-display, zero CLS, JS bundle budget), /code-simplify (Rule of 500 lines, cognitive load reduction), security-and-hardening, and accessible UI engineering.
---

# Addy Osmani — Senior Web Engineering & Chrome Standards

This skill applies Google Chrome engineering standards to fullstack Next.js + FastAPI architectures.

## Core Workflows

### 1. `/webperf` — Performance Optimization & Core Web Vitals
- **Typography & Font Loading:**
  - Enforce `display: 'swap'` on all fonts (`DanaFaNum`, `Vazirmatn`, `Lalezar`) to prevent Flash of Invisible Text (FOIT).
  - Use `next/font` for automatic self-hosting and zero layout shift.
- **Zero Cumulative Layout Shift (CLS):**
  - All media elements (book covers, course cards, thumbnails) MUST have explicit aspect ratios (`aspect-video`, `aspect-[3/4]`, fixed `h-` and `w-`).
  - Skeleton placeholders or fixed heights for dynamic lists.
- **JavaScript Bundle Budget:**
  - Tree-shake heavy libraries: import icons directly from `lucide-react`.
  - Lazy-load client-only modals using `next/dynamic` with `{ ssr: false }` (`BookReader3D`, `CartModal`, `CommandPalette`, `ScholarlyAIAssistant`).
- **Media Streaming Efficiency:**
  - RFC 7233 HTTP `Range` requests (`206 Partial Content`) with `Accept-Ranges: bytes` for instantaneous audio seek scrub and minimal bandwidth usage.

### 2. `/code-simplify` — Code Simplification & Rule of 500
- **The 500-Line Ceiling:**
  - No file should exceed 500 lines. Files approaching 500 lines must be deconstructed into dedicated sub-components under 200 lines.
- **Architectural Boundary Decoupling:**
  - Separate business logic / API mutations into custom hooks (e.g. `useCourseEnrollment`, `useBookmarks`, `useAuthForm`).
  - Presentation components must receive clean props and focus purely on rendering.

### 3. `security-and-hardening` — Production Security
- **DRM & Streaming Integrity:**
  - Audio and video streams must be accessed via signed, expiring HMAC DRM tokens (`/api/v1/stream/token`).
- **FastAPI Endpoint Hardening:**
  - Strict parameter validation with Pydantic v2.
  - Rate limiting via token-bucket algorithms on LLM and streaming endpoints.
  - Idempotency and replay-attack rejection on checkout and payment callbacks with database-level locks.
  - Role-based route gates (Admin vs Student).

### 4. `accessibility-and-keyboard` — Keyboard & Screen Reader Discipline
- **Keyboard Navigation:** Modals and popovers must support `Escape` to close, and interactive controls must have accessible focus rings (`focus-visible:outline-2 focus-visible:outline-[#8A532B]`).
- **Semantic HTML:** Correct ARIA attributes (`aria-label`, `aria-expanded`, `aria-pressed`, `role="tablist"`).
