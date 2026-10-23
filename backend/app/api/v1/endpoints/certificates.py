"""
Academic Certificate Verification and Issuance API Endpoints.
Complies with BACKEND_SYSTEM_DESIGN.md and Persian Writing Standards.
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.services.certificate_service import certificate_service
from backend.app.api.deps import get_current_user
from backend.app.models.database import get_db

router = APIRouter()


class CertificateIssueRequest(BaseModel):
    course_id: str = Field(..., description="Course ID to issue certificate for")
    score: str = Field(default="عالی (۱۰۰ از ۱۰۰)", description="Final course completion score")


@router.get("/verify/{code}", summary="Verify academic certificate authenticity")
async def verify_certificate(code: str, db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Public endpoint to verify the authenticity of an accredited certificate via its unique code.
    Accessible via QR Code scan.
    """
    return await certificate_service.verify_certificate_tx(db=db, certificate_code=code)


@router.post("/issue", summary="Issue an official course certificate")
async def issue_certificate(
    req: CertificateIssueRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Issues an official certificate for a student who completed a course.
    """
    cert = await certificate_service.issue_certificate_tx(
        db=db,
        user_id=user["id"],
        course_id=req.course_id,
        score=req.score,
    )
    await db.commit()
    return cert


@router.get("/my", summary="List current student certificates")
async def list_my_certificates(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """
    Retrieves all certificates issued for the authenticated student.
    """
    return await certificate_service.get_certificates_for_user_tx(db=db, user_id=user["id"])
