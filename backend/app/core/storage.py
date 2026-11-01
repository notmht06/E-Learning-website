"""
Cloud Object Storage Service (S3 / MinIO / ArvanCloud S3) with resilient Local Disk fallback.
Complies with BACKEND_SYSTEM_DESIGN.md (Reliability Engine & Performance Engine).
"""
import os
import shutil
import logging
from pathlib import Path
from typing import Optional, BinaryIO
from backend.app.core.config import settings

logger = logging.getLogger("platform.storage")


class StorageService:
    def __init__(self):
        self.endpoint_url = settings.S3_ENDPOINT_URL
        self.access_key = settings.S3_ACCESS_KEY
        self.secret_key = settings.S3_SECRET_KEY
        self.bucket_name = settings.S3_BUCKET_NAME
        self.public_url = settings.S3_PUBLIC_URL
        self.local_upload_dir = Path(__file__).resolve().parent.parent / "static" / "uploads"
        self.local_upload_dir.mkdir(parents=True, exist_ok=True)
        self._s3_client = None
        self._initialized = False

    def is_s3_enabled(self) -> bool:
        """Checks if S3 credentials and endpoint are fully configured."""
        if settings.TESTING and not os.getenv("FORCE_S3_TEST"):
            return False
        return bool(self.endpoint_url and self.access_key and self.secret_key)

    def _get_client(self):
        """Lazy initialization of boto3 client."""
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
                region_name=settings.S3_REGION_NAME,
                config=Config(signature_version="s3v4", connect_timeout=5, read_timeout=15),
            )
            # Ensure bucket exists
            try:
                client.head_bucket(Bucket=self.bucket_name)
            except Exception:
                try:
                    client.create_bucket(Bucket=self.bucket_name)
                    logger.info("Created S3 bucket: %s", self.bucket_name)
                except Exception as create_err:
                    logger.warning("Could not auto-create S3 bucket %s: %s", self.bucket_name, create_err)

            self._s3_client = client
            self._initialized = True
            logger.info("S3 Object Storage initialized for endpoint: %s", self.endpoint_url)
            return self._s3_client
        except Exception as exc:
            logger.warning("boto3 unavailable or failed to connect to S3; falling back to local disk: %s", exc)
            self._initialized = True
            return None

    def upload_file_obj(
        self,
        file_obj: BinaryIO,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Uploads file to S3/MinIO if configured, or saves to local disk fallback.
        Returns the public URL path for the file.
        """
        client = self._get_client()
        if client:
            try:
                # Seek to start if readable
                if hasattr(file_obj, "seek"):
                    file_obj.seek(0)
                client.upload_fileobj(
                    file_obj,
                    self.bucket_name,
                    filename,
                    ExtraArgs={"ContentType": content_type},
                )
                if self.public_url:
                    return f"{self.public_url.rstrip('/')}/{filename}"
                return f"{self.endpoint_url.rstrip('/')}/{self.bucket_name}/{filename}"
            except Exception as exc:
                logger.error("S3 upload failed for '%s', falling back to local disk: %s", filename, exc)

        # Local disk fallback
        local_path = self.local_upload_dir / filename
        local_path.parent.mkdir(parents=True, exist_ok=True)
        if hasattr(file_obj, "seek"):
            file_obj.seek(0)
        with open(local_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)

        return f"/static/uploads/{filename}"

    def generate_presigned_url(self, object_name: str, expiration: int = 3600) -> str:
        """Generates a presigned URL for secure temporary asset download/streaming."""
        client = self._get_client()
        if client:
            try:
                return client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket_name, "Key": object_name},
                    ExpiresIn=expiration,
                )
            except Exception as exc:
                logger.warning("Failed to generate presigned S3 URL: %s", exc)

        return f"/static/uploads/{object_name}"

    def delete_file(self, object_name_or_url: str) -> bool:
        """Deletes file from S3 or local disk."""
        filename = object_name_or_url.split("/")[-1]
        client = self._get_client()
        if client:
            try:
                client.delete_object(Bucket=self.bucket_name, Key=filename)
                return True
            except Exception as exc:
                logger.warning("Failed to delete object from S3: %s", exc)

        local_path = self.local_upload_dir / filename
        if local_path.exists():
            try:
                local_path.unlink()
                return True
            except Exception:
                pass
        return False


storage_service = StorageService()
