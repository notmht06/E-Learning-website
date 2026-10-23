---
name: perfection-loop
description: Autonomous 4-Sub-Agent Review-Fix-Verify Loop inspired by mathofdynamic/perfection-loop. Forces rigorous auditing of Design System compliance, RTL/Trilingual parity, Full-Stack API persistence, and TypeScript/Python build health before completing any task.
---

# Perfection Loop Skill (Review → Fix → Verify)

## Mandatory Rule
You are strictly forbidden from stopping after your first implementation pass.
Before concluding ANY task or phase, you MUST run the **4 Sub-Agent Audits** below. If ANY sub-agent detects even 1 defect, you must fix the code immediately and re-run the loop until **Defect Count = 0**.

## Audit 1: `DesignSystemCritic` (Enforces `/DESIGN.md`)
1. Verify all backgrounds use `#FAF8F5` (light canvas), `#FFFFFF` (light card), `#0C0D0E` (dark canvas), `#141518` (dark card), `#8A532B` (raw umber), and `#C58B43` (burnished gold).
2. Verify all price pills and floating badges have WCAG AAA contrast (`bg-[#0C0D0E]/90 text-[#FAF8F5]`).
3. Verify card grids have aligned heights (`flex flex-col justify-between` and `line-clamp-2 min-h-[2.75rem]` on titles).
4. Verify `letter-spacing: normal` is preserved for Persian/Arabic and no `animate-ping` or `animate-bounce` exists.

## Audit 2: `RTLAndLocalizationCritic` (Enforces `fa`, `ar`, `en` Symmetry)
1. Scan modified files for forbidden physical classes (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`) and replace with logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).
2. Verify all numbers are formatted via `toLocale()` and `.font-num`.
3. Verify all user-facing strings use `dict` keys or trilingual `currentLang` branches (`fa` / `ar` / `en`) with zero untranslated Persian strings in `en` or `ar` mode.

## Audit 3: `FullStackStateCritic` (Enforces Real API & DB Persistence)
1. Verify every interactive button ("Add to Cart", "Enroll", "Save Note", "Ask Question", "Subscribe", "Create/Update Course") calls `apiClient` and updates the global React Context (`CartContext`, `AuthContext`, `DataContext`).
2. Verify every async operation has a clear loading state (`disabled` + spinner/skeleton), error state (`InlineAlert`), and empty state (`EmptyStateCard`).

## Audit 4: `BuildAndSecurityCritic` (Enforces Zero-Error Build & Rule of 500)
1. Verify TypeScript types in `frontend/src/types/index.ts` and `apiClient.ts` match FastAPI Pydantic schemas in `backend/app/schemas/*.py`.
2. Verify no file exceeds 500 lines (split into modular sub-components if needed).
3. Verify all `setTimeout` / `setInterval` / event listeners in React `useEffect` hooks have proper cleanup functions.

## Output Requirement
At the end of your response, print a **Perfection Loop Verification Table** listing:
- Issues caught in Iteration 1 and how they were fixed.
- Final status of all 4 Critics (`PASS`).
