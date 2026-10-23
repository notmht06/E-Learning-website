"""
Certificate Issuance and Verification Service.
Complies with BACKEND_SYSTEM_DESIGN.md (Academic Integrity & Scholarly Assurance).
"""
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.models import Certificate, User, Course


class CertificateService:
    async def issue_certificate_tx(
        self,
        db: AsyncSession,
        user_id: str,
        course_id: str,
        score: str = "عالی (۱۰۰ از ۱۰۰)"
    ) -> Dict[str, Any]:
        """Issues an official accredited certificate for course completion."""
        stmt = select(Certificate).where(
            Certificate.user_id == user_id,
            Certificate.course_id == course_id,
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return existing.to_dict()

        cert_id = f"cert-{uuid.uuid4().hex[:8]}"
        import hashlib
        digest = hashlib.sha256(f"{user_id}:{course_id}".encode("utf-8")).hexdigest()[:6].upper()
        cert_code = f"ZAN-CERT-1403-{digest}"

        new_cert = Certificate(
            id=cert_id,
            user_id=user_id,
            course_id=course_id,
            certificate_code=cert_code,
            score=score,
            issued_at=datetime.utcnow(),
        )
        db.add(new_cert)
        await db.flush()
        return new_cert.to_dict()

    async def verify_certificate_tx(
        self,
        db: AsyncSession,
        certificate_code: str,
    ) -> Dict[str, Any]:
        """Verifies the authenticity of a certificate using its unique code."""
        code_clean = (certificate_code or "").strip()
        if not code_clean:
            return {
                "valid": False,
                "message": "کد استعلام گواهینامه ارائه نشده است."
            }

        stmt = select(Certificate).where(Certificate.certificate_code == code_clean)
        res = await db.execute(stmt)
        cert = res.scalar_one_or_none()
        if not cert:
            return {
                "valid": False,
                "message": "گواهینامه مورد نظر با این کد در سامانه حیات یافت نشد."
            }

        # Fetch student and course name
        user_res = await db.execute(select(User).where(User.id == cert.user_id))
        user = user_res.scalar_one_or_none()

        course_res = await db.execute(select(Course).where(Course.id == cert.course_id))
        course = course_res.scalar_one_or_none()
        course_title = course.title_fa if (course and course.title_fa) else cert.course_id

        return {
            "valid": True,
            "certificate_code": cert.certificate_code,
            "student_name": user.full_name if (user and user.full_name) else "دانش‌پژوه حیات",
            "course_title": course_title,
            "course_id": cert.course_id,
            "score": cert.score,
            "issued_at": cert.issued_at.isoformat() if cert.issued_at else "",
            "institute": "مؤسسه علمی و پژوهشی حیات (حجت الاسلام دکتر زنجیر زن حسینی)",
            "message": "اصالت این گواهینامه مورد تأیید رسمی است."
        }

    async def get_certificates_for_user_tx(
        self,
        db: AsyncSession,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Retrieves all certificates issued for a user."""
        stmt = select(Certificate).where(Certificate.user_id == user_id).order_by(Certificate.issued_at.desc())
        res = await db.execute(stmt)
        certs = res.scalars().all()
        return [c.to_dict() for c in certs]


certificate_service = CertificateService()
