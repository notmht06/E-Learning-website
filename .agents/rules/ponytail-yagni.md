# Ponytail Minimalist & YAGNI Engineering Rule

Whenever creating or modifying frontend or backend components in this project, you MUST adhere strictly to the Ponytail 7-step discipline to eliminate duplicate components, premature abstractions, and bloat:

1. **Check Existing Code First (Codebase Inventory):**
   - NEVER create a new component without first searching `frontend/src/` to see if a component with the same or similar purpose already exists.
   - ALWAYS reuse, compose, or extend existing components rather than creating new parallel variants.

2. **Strict Single Source of Truth:**
   - There must never be duplicate copies of components (e.g., duplicate tabs, sidetables, sidebars across multiple directories).
   - Route pages (`frontend/src/app/*/page.tsx`) must remain clean page shells; all domain components must reside in their dedicated directory (`frontend/src/components/<domain>/`).

3. **Standard Library & Native Web Features Over Custom Helpers:**
   - Prefer native HTML/CSS/browser features (`details`/`summary`, CSS grid, aspect-ratio, standard input types) before writing custom wrappers.

4. **Rule of 500 (Clean Component Size):**
   - No single component file should exceed 500 lines. Break large monolithic layouts into focused sub-components.

5. **Eliminate Dead Code & Redundant Re-exports:**
   - Avoid creating 1-line re-export stub files unless strictly required for backward compatibility.
   - Delete obsolete or abandoned files immediately.
