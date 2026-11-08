"""
Dual Storage Engine (Hybrid Local Disk + S3-Compatible Cloud Object Storage).
Supports Liara S3, ArvanCloud S3, ParsPack, MinIO, and AWS S3 with transparent Local Fallback.
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Performance Engine).
Official Platform: حجت الاسلام دکتر زنجیرزن حسینی
"""
import os
import shutil
import logging
from pathlib import Path
from typing import Optional, Union, BinaryIO

from backend.app.core.config import settings

logger = logging.getLogger("platform.storage")


class StorageService:
    """
    Production-ready storage service providing seamless dual-mode storage:
    - Primary: S3-compatible cloud object storage (when configured and operational)
    - Fallback: Local disk storage in static/uploads/ (when S3 is unconfigured, testing, or unreachable)
    """

    def __init__(self):
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL") or getattr(settings, "S3_ENDPOINT_URL", None)
        self.access_key = (
            os.getenv("S3_ACCESS_KEY_ID")
            or os.getenv("S3_ACCESS_KEY")
            or getattr(settings, "S3_ACCESS_KEY_ID", None)
            or getattr(settings, "S3_ACCESS_KEY", None)
        )
        self.secret_key = (
            os.getenv("S3_SECRET_ACCESS_KEY")
            or os.getenv("S3_SECRET_KEY")
            or getattr(settings, "S3_SECRET_ACCESS_KEY", None)
            or getattr(settings, "S3_SECRET_KEY", None)
        )
        self.bucket_name = (
            os.getenv("S3_BUCKET_NAME")
            or getattr(settings, "S3_BUCKET_NAME", "zanjirzan-media")
        )
        self.region_name = (
            os.getenv("S3_REGION")
            or os.getenv("S3_REGION_NAME")
            or getattr(settings, "S3_REGION", None)
            or getattr(settings, "S3_REGION_NAME", "us-east-1")
        )
        self.public_url = os.getenv("S3_PUBLIC_URL") or getattr(settings, "S3_PUBLIC_URL", None)

        self.local_upload_dir = Path(__file__).resolve().parent.parent / "static" / "uploads"
        self.local_upload_dir.mkdir(parents=True, exist_ok=True)

        self._s3_client = None
        self._initialized = False

    def is_s3_enabled(self) -> bool:
        """
        Determines whether S3 credentials and endpoint are configured.
        In test environment, defaults to local fallback unless explicitly forced.
        """
        if (getattr(settings, "TESTING", False) or os.getenv("ENVIRONMENT") == "test") and not os.getenv("FORCE_S3_TEST"):
            return False
        return bool(self.endpoint_url and self.access_key and self.secret_key)

    def _get_client(self):
        """
        Lazy-initializes the boto3 S3 client with resilient connection timeouts.
        Returns None if S3 is disabled or boto3 fails to connect.
        """
        if self._initialized:
            return self._s3_client

        if not self.is_s3_enabled():
            self._initialized = True
            return None

        try:
            import boto3
            from botocore.config import Config

            client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region_name,
                config=Config(signature_version="s3v4", connect_timeout=5, read_timeout=15),
            )
            # Verify bucket accessibility or auto-create if permitted
            try:
                client.head_bucket(Bucket=self.bucket_name)
            except Exception:
                try:
                    client.create_bucket(Bucket=self.bucket_name)
                    logger.info("Successfully created S3 bucket: %s", self.bucket_name)
                except Exception as create_err:
                    logger.warning("Could not auto-create S3 bucket %s: %s", self.bucket_name, create_err)

            self._s3_client = client
            self._initialized = True
            logger.info("S3 Object Storage initialized for endpoint: %s", self.endpoint_url)
            return self._s3_client
        except Exception as exc:
            logger.warning("boto3 unavailable or failed to initialize S3 client; falling back to local disk: %s", exc)
            self._initialized = True
            return None

    def upload_file(
        self,
        file_bytes: Union[bytes, bytearray],
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Uploads raw file bytes to S3 if configured, or saves to local disk fallback.
        Returns the public URL (S3 / CDN URL) or local static path (/static/uploads/filename).
        """
        client = self._get_client()
        if client:
            try:
                import io
                bio = io.BytesIO(file_bytes)
                client.upload_fileobj(
                    bio,
                    self.bucket_name,
                    filename,
                    ExtraArgs={"ContentType": content_type},
                )
                if self.public_url:
                    return f"{self.public_url.rstrip('/')}/{filename}"
                return f"{self.endpoint_url.rstrip('/')}/{self.bucket_name}/{filename}"
            except Exception as exc:
                logger.error("S3 upload failed for '%s', falling back to local storage: %s", filename, exc)

        # Local disk fallback
        local_path = self.local_upload_dir / filename
        local_path.parent.mkdir(parents=True, exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        return f"/static/uploads/{filename}"

    def upload_file_obj(
        self,
        file_obj: BinaryIO,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Uploads a file-like object to S3 or local disk fallback.
        """
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)
        data = file_obj.read()
        return self.upload_file(data, filename, content_type)

    def delete_file(self, file_url_or_key: str) -> bool:
        """
        Deletes the file from S3 object storage or local disk storage.
        Extracts key/filename from URL or path.
        """
        if not file_url_or_key:
            return False

        filename = file_url_or_key.split("?")[0].split("/")[-1]
        deleted_any = False

        # Attempt S3 deletion if client available
        client = self._get_client()
        if client:
            try:
                client.delete_object(Bucket=self.bucket_name, Key=filename)
                deleted_any = True
            except Exception as exc:
                logger.warning("Failed to delete S3 object '%s': %s", filename, exc)

        # Also remove from local disk if present
        local_path = self.local_upload_dir / filename
        if local_path.exists():
            try:
                local_path.unlink()
                deleted_any = True
            except Exception as exc:
                logger.warning("Failed to remove local file '%s': %s", local_path, exc)

        return deleted_any

    def generate_presigned_url(self, file_key: str, expiration_seconds: int = 900) -> str:
        """
        Generates a temporary signed URL for private files (default: 15 minutes / 900 seconds).
        Useful for DRM-protected audio/video streaming or restricted PDF downloads.
        Falls back to local static URL if S3 is not available.
        """
        clean_key = file_key.split("?")[0].split("/")[-1]
        client = self._get_client()
        if client:
            try:
                return client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket_name, "Key": clean_key},
                    ExpiresIn=expiration_seconds,
                )
            except Exception as exc:
                logger.warning("Failed to generate presigned S3 URL for '%s': %s", clean_key, exc)

        return f"/static/uploads/{clean_key}"


storage_service = StorageService()
