# Dispatch — Survey Explorer Frontend

## Objective
Investigate frontend Course details page, CartModal, Learning Player, apiClient, and Auth/Cart contexts for live Course Enrollment and lesson unlocking.

## Working Directory
`e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_frontend`

## Required Readings
- `e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically `## Follow-up — 2026-10-13T03:02:29Z`)
- `e:\personal\philosophy_zanjirzan_app\PROJECT.md`
- `e:\personal\philosophy_zanjirzan_app\GEMINI.md`
- `e:\personal\philosophy_zanjirzan_app\DESIGN.md`

## Target Inspection Paths
- `frontend/src/app/courses/[id]/page.tsx`
- `frontend/src/components/cart/CartModal.tsx` (or cart components)
- `frontend/src/app/courses/[id]/learn/page.tsx` (and learning player components)
- `frontend/src/services/apiClient.ts`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/context/CartContext.tsx`
- `frontend/src/types/` (course, user, order types)

## Deliverables
Produce `survey_frontend.md` and `handoff.md` in your working directory with detailed analysis of current enrollment button behavior, cart checkout, learning player lock/unlock checks, apiClient methods, LOC constraints (<200 LOC), anti-slop rules, and concrete implementation plan for R2.


## 2026-10-13T03:05:28Z
You are the Frontend Survey Explorer (explorer_m4_survey_frontend).
Your working directory is: e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_frontend

Read your dispatch instructions in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\explorer_m4_survey_frontend\DISPATCH.md
and the authoritative user request in:
e:\personal\philosophy_zanjirzan_app\.agents\teamwork\ORIGINAL_REQUEST.md (specifically '## Follow-up — 2026-10-13T03:02:29Z').

Objective:
Investigate frontend Course details page, CartModal, Learning Player, apiClient, and Auth/Cart contexts for live Course Enrollment and lesson unlocking.
Examine:
- frontend/src/app/courses/[id]/page.tsx (enrollment button wiring, enrollment state)
- frontend/src/components/cart/CartModal.tsx (or cart components, checkout actions)
- frontend/src/app/courses/[id]/learn/page.tsx (and learning player components, how lock/unlock is checked)
- frontend/src/services/apiClient.ts (apiClient methods for enrollment, orders, courses)
- frontend/src/context/AuthContext.tsx & CartContext.tsx (state updates upon enrollment/order)
- How to transition enrollment button to 'ورود به محیط یادگیری و پخش دوره' linking to /courses/[id]/learn
- 200 LOC ceiling on all newly created or refactored components
- Strict anti-slop rules, 4px spacing scale, 100% Tailwind logical properties, scholar identity «حجت الاسلام دکتر زنجیر زن حسینی».

Produce survey_frontend.md and handoff.md in your working directory.
When done, notify me via send_message with a summary and the absolute paths to your reports.
