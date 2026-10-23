---
trigger: always_on
description: Enforces backend-skill quality standards (Security, Simplicity, Performance, Reliability).
---

# Backend Engineering Quality Rule (backend-skill)

When editing backend code in `backend/app`:
1. **Security Guardian**: Issue DRM signed tokens for all audio streams. Passwords hashed with bcrypt/argon2.
2. **Simplicity Governor**: Use SQLAlchemy models with parameterized queries. No raw text SQL queries.
3. **Performance Engine**: Keep routes async (`async def`). Support audio Range requests for efficient seek buffering.
4. **Reliability Engine**: Use `AppException` for structured errors. Ensure ACID transaction commits/rollbacks.
