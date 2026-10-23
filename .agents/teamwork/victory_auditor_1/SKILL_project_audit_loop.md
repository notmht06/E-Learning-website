---
name: project-audit-loop
description: Executes the complete 0-to-100 automated audit and refinement loop for the Dr. Zanjirzan platform. Verifies frontend build, backend tests, anti-slop rules, and SEO standards.
---

# Project Quality & Auto-Audit Loop

This skill guides the automated verification and refinement loop for the platform.

## Execution Steps:
1. **Frontend Compilation Check**:
   Run `npm run build` in `frontend/`. Must exit with code 0.
2. **Backend Test Suite**:
   Run `.\backend\.venv\Scripts\python.exe backend/tests/test_in_memory.py`. Must pass 100%.
3. **Anti-Slop Linter**:
   Run `py audit_pipeline.py`. Verifies zero forbidden AI-slop classes in JSX/TSX.
4. **Scholar Identity Audit**:
   Ensures «حجت الاسلام دکتر زنجیر زن حسینی» is properly formatted everywhere.
