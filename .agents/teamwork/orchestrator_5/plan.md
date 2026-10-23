# Implementation Plan: Dr. Zanjirzan Platform Phases 6-9 Refactoring & Hardening

## Overview & Scope
Comprehensive refactoring and hardening of the Dr. Zanjirzan Platform across Phases 6 through 9:
- **Phase 6 / Milestone 1**: Event Loop Optimization, Database Models (`UserFavorite`, composite indexes), Query Optimization (`selectinload`), and RFC 7233 Range Streaming.
- **Phase 7 / Milestone 2**: Payment Replay-Attack Protection, Server-Side Pricing & Coupon Validation, AI SSE Token-by-Token Streaming with Rate Limiter, and Strict Admin RBAC.
- **Phase 8 / Milestone 3**: Font Unification (`next/font`), Docker Standalone Config & Security Headers, Documentation & Palette Harmony.
- **Phase 9 / Milestone 4**: Edge-Case Test Suite Completion (`backend/tests/test_api_v1.py` & `backend/tests/test_in_memory.py`), and 100/100 Audit Pipeline Verification.

## Survey Strategy
Spawn 3 Explorers in parallel:
1. `explorer_survey_p6_p7`: Backend, Database, Models, DRM/Streaming, Payment, AI, and RBAC endpoints.
2. `explorer_survey_p8`: Frontend layout, next/font, next.config.js, docker-compose.yml, .env.example, docs/archive.
3. `explorer_survey_p9`: Test suites (test_api_v1.py, test_in_memory.py), notes & QA endpoints, audit_pipeline.py.

## Milestone Lifecycle
Each milestone follows:
Explorer(s) -> Worker -> Reviewer(s) -> Challenger(s) -> Forensic Auditor -> Gate.
Zero tolerance on audit violations.
Passing test suites + 100/100 on audit_pipeline.py required.
