# Frontend audit tools (measurable acceptance criteria)

Run from `frontend/`. All scripts are read-only unless stated.

| Command | What it reports |
|---|---|
| `python3 tools/audit/scan.py .` | Counts of slop signs and project-rule violations (hardcoded Persian, gradients, `any`, a11y, RTL, size) |
| `python3 tools/audit/persian_breakdown.py .` | Hardcoded Persian by type and top files |
| `python3 tools/audit/i18n_keys.py .` | `dict.<key>` used but not defined; removable fallbacks |
| `python3 tools/audit/orphans.py .` | Modules nobody imports (dead code) |
| `node tools/audit/count_lang_ternaries.cjs` | Inline `currentLang === 'en' ? ...` conditionals still left |
| `node tools/audit/extract_triples.cjs --dry` | Preview of the trilingual-ternary extraction; drop `--dry` to **write** keys into `locales/*` and rewrite call sites |

Known false positives: `console_log` (the `console.debug` calls live inside `catch` blocks, which is the
project's required way to not swallow errors), `middleware.ts` in the orphan report (Next loads it), and
`gradient` for the dark tonal course-cover gradients (intentional discipline colour coding).
