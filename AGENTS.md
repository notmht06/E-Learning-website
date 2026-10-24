# Project rules
- No hardcoded credentials, demo passwords, or seeded admin accounts.
- No fake/mock data in production paths: no initialOrders, no DEFAULT_CERTIFICATES.
- Every new endpoint must declare its auth dependency explicitly.
- Never swallow exceptions with `except: pass` or `.catch(() => {})`.
- Money, enrollments and sessions live in Postgres/Redis, never in module globals.
- Any new Pydantic response field must be added to the frontend type in the same commit.
- Run `python -m pytest backend/tests -q` and `npx tsc --noEmit` before every commit.
- UI strings go through `locales/*`, never inline in JSX.
- Do not modify `.agents/`, `alembic/versions/`, or design-system colors.
- One task per commit; do not mix refactor with behavior change.

Acceptance for this task (all four must pass, paste raw output):
1. python -m pytest backend/tests -q   -> 129 passed
2. npx tsc --noEmit                    -> exit 0
3. python _audit_run/probe4.py         -> asserts pass (it MUST raise on failure)
4. git status --short                  -> empty
Do not edit tests to make them pass. If a test fails, fix the code or report the failure.
