# UI/UX Redesign Brief — Persian Learning/Book Platform (Next.js)

Paste this whole file into Antigravity's Manager Surface as the task brief. It is written in English on purpose — the agent reasons about layout/spacing/typography more reliably in English, and the site's RTL/Farsi rendering is a separate, mechanical concern (logical CSS properties + `dir="rtl"`), not a design-taste concern. Keep the app's actual UI copy in Farsi; only the *instructions to the agent* are in English.

---

## 1. Project context

- Stack: Next.js (App Router), TypeScript, Tailwind CSS, some shadcn-derived primitives (`ShadcnBadge`, `SquircleCard`), custom "Bento" section components, Persian font "Dana", RTL layout.
- Domain: religious/academic courses + book sales + a custom 3D book reader + admin dashboard.
- Known-good reference for visual quality: https://cozen.club/ (by https://github.com/sirusmeshki) — clean spacing, restrained palette, squircle cards, strong type hierarchy.
- Behavioral/conversion pattern reference: https://goodui.org/ — use this for *evidence-based UX patterns* (CTA placement, form friction, pricing display), not for visual style.

## 2. Diagnosis — what is actually wrong (confirmed from the code)

This is not a language/RTL problem. Two concrete, structural issues were found:

1. **Information architecture overload on the homepage.** `src/app/page.tsx` stacks 8 heavy sections back to back: `BentoHero`, `PlatformPillarsBento`, `CourseCatalogBento`, `SkyroomWorkshopBento`, `BookPressBento`, `CurriculumRoadmap`, `ScholarlyArticlesBento`, `ScholarDispatchBento`, plus 3 modals. No single landing page should force a visitor through 8 distinct content blocks before the footer.
2. **Aspirational comments instead of enforced constraints.** The code already contains comments like `Clean Squircle Cards with Zero Clutter` and `Cozen-inspired 4 Squircle Stat Boxes` — i.e. a previous AI pass *described* the goal without structurally achieving it. Telling an agent "make it modern" or "like cozen.club" produces this exact failure mode: cosmetic Tailwind tweaks, no real hierarchy change.

**Fix direction:** give the agent measurable constraints (spacing scale, section count limits, one accent color, a type scale) instead of adjectives like "modern" or "2026". Vague taste words don't compile into layout decisions; numbers and rules do.

## 3. How to use each tool/link you already have

| Tool | Use it for | Phase |
|---|---|---|
| **context7** (MCP) | Feed the agent current Next.js / Tailwind / Radix / shadcn docs so it doesn't generate stale API usage. Enable as an MCP server inside Antigravity before starting. | Setup |
| **Playwright / playwright-cli** (MCP or browser tool) | Antigravity's browser-agent should screenshot the *running* site and screenshot cozen.club, then diff them (spacing, contrast, section count, whitespace ratio) — objective comparison instead of vibes. Also use for visual-regression checks after each change. | Every phase |
| **ui-skills** (ibelick/ui-skills) | A set of design-taste/instruction files. Drop the relevant ones into Antigravity's skill/knowledge folder so the agent has consistent, reusable design rules instead of re-deriving them each prompt. | Setup |
| **shadcn-ui-designer skill** (`skills.sh/site/smithery.ai/shadcn-ui-designer`) | This is the concrete, documented shadcn/ui design philosophy — the actual rules behind sites like cozen.club (clean typography, 4px spacing scale, `shadow-sm/md/lg` only, slate/zinc neutrals + one accent, 200–300ms transitions). Add this alongside ui-skills; it's more actionable than "make it look like cozen.club" because it's numbers, not a screenshot to guess from. | Setup |
| **Impeccable** (`impeccable.style`, `npx skills add pbakaus/impeccable`) | An "anti-slop" design skill built specifically to stop the failure mode this project has — its own before/after examples literally name "cards on cards" (using one generic card for everything) as the exact smell to fix. Confirmed to support Antigravity as a harness. Ships 23 commands including `/impeccable audit <page>` — use this to force a pass over every route, not just the homepage. **Recommended primary tool for this task.** | Setup + every phase |
| **Taste Skill** (`tasteskill.dev`, GitHub `Leonxlnx/taste-skill`) | Same category as Impeccable — anti-slop frontend skill with adjustable dials for layout variance, motion intensity, and **visual density** (directly maps to "the site feels crowded"). Framework-agnostic. Use as an alternative to Impeccable, or install both and compare outputs. | Setup + every phase |
| **vercel-labs/agent-skills** (`npx skills add vercel-labs/agent-skills --skill frontend-design`) | Vercel's own official design-guideline skill for agents. Good as a second opinion / cross-check alongside Impeccable or Taste Skill. | Setup |
| **transitions.dev, canvasui.dev, and similar motion/animation snippet sites** | These are micro-interaction and CSS-transition libraries (modal open/close, hover states, skeleton loaders). They matter for polish, not for the clutter/density problem. Save for after the structural and pattern-matching work below is done. | Later, polish pass |
| **goodui.org** | Reference for specific, evidence-backed UX patterns (CTA copy/placement, checkout friction, pricing display) — apply mainly to `/checkout`, course/book detail pages, and the enrollment flow. | Phase 3 |
| **Supabase** | Not needed for this redesign pass. Relevant only if/when you migrate the current data layer (`src/lib/data.ts`, `DataContext`) to a real backend. Keep out of scope for now so the agent doesn't touch data plumbing while doing visual work. | Later, separate task |
| **Strix** | Autonomous security testing agent. Also out of scope for a UI/UX pass — schedule as its own task once the redesign and any backend work are done. | Later, separate task |

Only hand the agent **context7 + Playwright + ui-skills + goodui.org + Impeccable (or Taste Skill) + vercel-labs/frontend-design** for this task. Mentioning Supabase/Strix now will pull it toward backend/security work mid-redesign.

## 3b. The real cause of "the site feels crowded": wrong pattern per content type

You already diagnosed this correctly yourself, and it's worth stating as an explicit rule so the agent stops doing it: **the same generic card component is being reused for content types that are structurally different.** A course catalog, a FAQ list, and a curriculum roadmap are not the same kind of content and should not render with the same component. This is exactly the smell Impeccable calls "cards on cards" in its own documentation — it's a recognized, named anti-pattern in AI-generated frontends, not just a subjective taste issue.

Give the agent this mapping explicitly:
- **FAQ / Q&A content** → accordion/disclosure component (collapsed by default), never a grid of cards.
- **Course/book catalogs on the homepage or category pages** → a curated subset (4–6 items) with a "view all" link to the full listing page. Never render the entire dataset on a page whose job is to give an overview.
- **Full catalog/listing pages** (`/courses`, `/books`) → list or compact grid with filters, not the same large marketing-style card used in the hero.
- **Curriculum/roadmap content** → a sequential/timeline pattern, not cards.
- **Stats/numbers** (the "4-pillar" strip) → a stat strip, not cards with borders and padding trying to look important.

## 3c. Scope: this must cover every route, not just the homepage

A prior redesign pass only touched `page.tsx` and the homepage's Bento components — `checkout`, `dashboard`, `admin`, `courses/[id]/learn`, `books/[id]`, and `courses/[id]` were left completely untouched (verified byte-for-byte identical). The `admin` page alone is 165KB in a single file, which is almost certainly the most cluttered part of the app. This pass must include those routes. Use Impeccable's or Taste Skill's per-page audit command on **every route in the sitemap**, not just `/`.

Also: when removing a section from a page, either give it a proper destination route (as was correctly done for the curriculum roadmap → `/roadmap`) or delete the component file entirely. Do not leave unused, unimported component files in the repo — that's dead code hiding a content/feature regression, not a real removal.

## 4. Non-negotiable design constraints (give these verbatim)

A note on cozen.club: its `robots.txt` blocks automated fetching, so it can't be crawled directly for pixel values — but it's built on shadcn/ui, and shadcn/ui's own design philosophy is documented and public. That's a more reliable target than reverse-engineering one specific site, and it's the same system cozen.club itself follows:

- **One accent color** on top of neutral slate/zinc grays — derived from the existing brand brown (`#8A532B` / `#824D23` family). No new hues without approval.
- **Spacing scale**: 4px-based only — `p-1` through `p-8` in Tailwind terms (4 / 8 / 12 / 16 / 20 / 24 / 28 / 32px). No arbitrary padding values.
- **Type scale**: 2–3 font weights max (e.g. regular/medium/semibold), hierarchy capped at `text-2xl` (headings) → `text-base` (body) → `text-sm` (secondary/muted text).
- **Shadows**: `shadow-sm` / `shadow-md` / `shadow-lg` only — no custom box-shadow values.
- **Transitions**: 200–300ms for micro-interactions, nothing slower on hover/focus states.
- **Contrast**: WCAG AA minimum on all text.
- **Max 4 primary sections on the homepage**, in this order: Hero → single value-proposition strip (merge "Platform Pillars" into this) → course/book catalog preview → one closing CTA. Everything else (Skyroom, full curriculum roadmap, scholarly articles, dispatch signup) moves to its own route or a secondary "explore" area, linked from the hero/nav — not stacked on the landing page.
- **One primary CTA per screen fold.** No competing buttons of equal visual weight.
- Keep the 3D book reader — it's a genuine differentiator — but don't let it visually compete with the hero above the fold.
- RTL rule (mechanical, not stylistic): use Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) everywhere instead of `pl-`/`pr-`/`left-`/`right-`, so the same component works in both directions without duplicated CSS.

## 5. Phased task list for the agent

**Phase 0 — Setup**
- [ ] Enable context7 MCP in Antigravity.
- [ ] Install Impeccable (`npx skills add pbakaus/impeccable`) or Taste Skill as the primary anti-slop design skill; optionally also add `vercel-labs/agent-skills --skill frontend-design` for a second opinion.
- [ ] Add ui-skills and shadcn-ui-designer files to the project's skill/context folder.
- [ ] Enable browser/Playwright tool for screenshot diffing.

**Phase 1 — Audit (no code changes)**
- [ ] Run the design skill's audit command (e.g. `/impeccable audit`) against every route: `/`, `/courses`, `/books`, `/books/[id]`, `/courses/[id]`, `/courses/[id]/learn`, `/checkout`, `/dashboard`, `/admin`, `/roadmap`.
- [ ] For each route, log: section/card count, whether the content-pattern rules in §3b are being followed (accordion vs. card vs. list), spacing/type/shadow violations of §4.
- [ ] Flag `admin/page.tsx` (165KB) and `dashboard/page.tsx` (70KB) specifically for component decomposition — a file that size needs to be split into sub-components as part of this pass, not just restyled in place.

**Phase 2 — Information architecture**
- [ ] Rewrite `src/app/page.tsx` to the 4-section structure in §4.
- [ ] Decide destination routes for the sections being removed from the homepage (new `/community` or `/resources` page, or fold into existing `/courses` and `/books`).

**Phase 3 — Component pass**
- [ ] Rebuild `BentoHero`, `PlatformPillarsBento`, `CourseCatalogBento` against the spacing/type constraints in §4.
- [ ] Apply goodui.org-backed patterns to `/checkout` and the enrollment flow in `SkyroomWorkshopBento`.
- [ ] Convert any remaining physical-direction Tailwind classes to logical properties.

**Phase 4 — Verification**
- [ ] Re-screenshot every page, diff against Phase 1 baseline and against cozen.club.
- [ ] Confirm section count, color count, and type-size count against the limits in §4 before marking done.

## 6. Ready-to-paste agent instruction (short version)

> Redesign this Next.js/Tailwind/RTL Persian site's UI following shadcn/ui's own design philosophy (the same system cozen.club is built on — see the shadcn-ui-designer skill), with Impeccable (or Taste Skill) installed as the anti-slop design skill: 4px-based spacing (`p-1`–`p-8`), 2–3 font weights, `shadow-sm/md/lg` only, slate/zinc neutrals plus one accent color, 200–300ms transitions, WCAG AA contrast. Critical rule: match the component pattern to the content type — FAQ content gets an accordion, curated catalogs on overview pages show 4–6 items with a "view all" link (never the full dataset), curriculum content gets a timeline, not everything as a card. This applies to the ENTIRE site, not just the homepage: audit and fix `/`, `/courses`, `/books`, `/books/[id]`, `/courses/[id]`, `/courses/[id]/learn`, `/checkout`, `/dashboard`, `/admin`, and `/roadmap`. The `admin` and `dashboard` pages are single oversized files and need to be split into components as part of this work. Use goodui.org patterns for conversion-critical flows (checkout, enrollment). Do not add new dependencies beyond what's already used and what the design skill requires. Use Tailwind logical properties for all direction-sensitive spacing so RTL and LTR share the same code. cozen.club itself can't be crawled (robots.txt blocks it) — don't try to scrape it; follow the documented shadcn design rules and the anti-slop skill instead. Before writing code, run the design skill's audit command on every route above and list concrete violations — do not proceed on adjectives like "modern" alone. After each phase, re-audit and verify against these constraints before moving on. When removing a section from any page, either give it a real destination route or delete the component file — never leave an unused, unimported component in the repo.
