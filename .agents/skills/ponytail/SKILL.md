---
name: ponytail
description: YAGNI Codebase Map & Minimalist Senior Programmer. Prevents duplicate components, premature abstractions, and code bloat by enforcing a 7-step YAGNI ladder and codebase inventory before writing any code. Use when adding features, refactoring, or cleaning up components.
---

# Ponytail — The Minimalist Senior Programmer (YAGNI & Anti-Bloat)

Ponytail acts as the architectural brake for AI coding assistants. It enforces the principle: **The best code is the code you never had to write.**

## The 7-Step YAGNI Ladder

Before creating ANY new file or writing any block of code, climb this ladder:

1. **Need Verification:** Is this component or function strictly required by the user prompt, or is it a speculative abstraction? If speculative, stop.
2. **Codebase Inventory (Zero Duplication):**
   - Check existing components first. Search `frontend/src/components/` and `backend/app/` using search tools.
   - If a similar component exists (e.g. an audio player, a sidebar, a tab), **reuse or extend it**. NEVER create a parallel duplicate.
3. **Platform Primitives First:** Can native HTML5 / CSS3 / Web APIs or Python standard library handle this without a new package or custom hook?
4. **Existing Dependency Reuse:** Is there already a library installed in `package.json` (e.g. `motion/react`, `lucide-react`, `sonner`) that solves this?
5. **Direct & Concise Implementation:** Can the logic be written in a straightforward, readable manner without multiple layers of indirection?
6. **Rule of 500 Lines:** No single component file should exceed 500 lines. Deconstruct monolithic layouts into domain sub-components under 200 lines.
7. **Single Source of Truth:**
   - App router files (`app/*/page.tsx`) must be clean page shells.
   - Domain components belong in `components/<domain>/`.
   - Never leave dead 1-line re-export files that introduce circular dependency chains.

## Ponytail Action Commands

- **`/ponytail lite`**: Quick pre-flight check. List target directories, check for existing components, and propose the minimal diff.
- **`/ponytail-review`**: Post-change review. Verify no duplicate files were introduced, no dead imports exist, and all files adhere to the Rule of 500.
- **`/ponytail-audit`**: Whole codebase audit. Detect orphan files, identical component names across directories, and bloated monolithic files.
- **`/ponytail-debt`**: Identify technical debt, temporary workarounds, and redundant re-exports.
