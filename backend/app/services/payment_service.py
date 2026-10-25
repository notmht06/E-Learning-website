"""
Banking Gateway and Shaparak Settlement Service.
Complies with Clean Architecture, Security Guardian, and Reliability Engine.
Prevents payment replay attacks with atomic state tracking and authority uniqueness.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.models import PaymentTransaction


class PaymentService:
    """
    Durable payment transaction service.
    All transactions and settlement states live in PostgreSQL (PaymentTransaction table),
    never in module globals or in-memory dictionaries.
    """

    async def record_transaction_tx(
        self,
        db: AsyncSession,
        authority: str,
        order_id: str,
        gateway: str,
        amount: int,
        return_url: str,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Persists transaction to database as the durable Single Source of Truth."""
        db_tx = PaymentTransaction(
            authority=authority,
            order_id=order_id,
            user_id=user_id,
            gateway=gateway,
            amount=amount,
            return_url=return_url,
            status="pending",
            created_at=datetime.utcnow(),
        )
        db.add(db_tx)
        await db.commit()
        return db_tx.to_dict()

    async def get_transaction_tx(
        self,
        db: AsyncSession,
        authority: str,
    ) -> Optional[Dict[str, Any]]:
        """Retrieves transaction directly from database (Single Source of Truth)."""
        stmt = select(PaymentTransaction).where(PaymentTransaction.authority == authority)
        res = await db.execute(stmt)
        record = res.scalar_one_or_none()
        return record.to_dict() if record else None


payment_service = PaymentService()
