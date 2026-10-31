"""
API v1 Router Aggregator.
Combines all domain endpoint routers into a single cohesive, versioned API router.
"""
from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    courses,
    books,
    stream,
    cart,
    coupons,
    orders,
    payment,
    notes,
    qa,
    admin,
    ai,
    certificates,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["1. Authentication & Identity"])
api_router.include_router(courses.router, prefix="/courses", tags=["2. Audio Courses & Syllabus"])
api_router.include_router(books.router, prefix="/books", tags=["3. Books & E-Reader"])
api_router.include_router(stream.router, prefix="/stream", tags=["4. DRM & Audio Streaming"])
api_router.include_router(cart.router, prefix="/cart", tags=["5. Shopping Cart"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["6. Promotion & Coupons"])
api_router.include_router(orders.router, prefix="/orders", tags=["7. Orders & Postal Logistics"])
api_router.include_router(payment.router, prefix="/payment", tags=["8. Banking & Shaparak Payments"])
api_router.include_router(notes.router, prefix="/notes", tags=["9. Student Study Notebook"])
api_router.include_router(qa.router, prefix="/qa", tags=["10. Scholarly Discussions & QA"])
api_router.include_router(admin.router, prefix="/admin", tags=["11. Admin Cockpit & Analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["12. AI Scholarly Assistant"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["13. Academic Certificates"])

observability_router = APIRouter()

@observability_router.get("/metrics")
async def get_metrics():
    from backend.app.api.v1.endpoints.admin import get_observability_metrics
    return await get_observability_metrics()

api_router.include_router(observability_router, prefix="/observability", tags=["14. SRE & Observability"])
