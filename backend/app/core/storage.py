"""
Cloud Object Storage Service (S3 / MinIO / ArvanCloud S3) with resilient Local Disk fallback.
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Performance Engine).
Official Platform: حجت الاسلام دکتر زنجیرزن حسینی
"""
from backend.app.services.storage_service import StorageService, storage_service

__all__ = ["StorageService", "storage_service"]
