# -*- coding: utf-8 -*-
"""
Unit and integration tests for Dual Storage Engine (Hybrid Local + S3-Compatible Object Storage).
Verifies:
1. Local fallback upload, path generation, reading, and deletion.
2. S3 upload, public URL generation, and presigned URL generation.
3. Resilient fallback to local disk when S3 encounters errors or is unconfigured.
Official Platform: حجت الاسلام دکتر زنجیر زن حسینی
"""
import os
import io
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from backend.app.services.storage_service import StorageService


def test_local_storage_fallback_upload_and_delete(tmp_path):
    """Verifies that in local mode files are saved to static/uploads and deleted cleanly."""
    storage = StorageService()
    # Force local mode
    storage.local_upload_dir = tmp_path
    storage.endpoint_url = None
    storage.access_key = None
    storage.secret_key = None
    storage._initialized = True
    storage._s3_client = None

    test_content = b"PDF Handout by Hojjat al-Islam Dr. Zanjirzan Hosseini"
    filename = "test_handout.pdf"

    # 1. Upload
    url = storage.upload_file(test_content, filename, content_type="application/pdf")
    assert url == f"/static/uploads/{filename}"

    saved_file = tmp_path / filename
    assert saved_file.exists()
    assert saved_file.read_bytes() == test_content

    # 2. Presigned URL fallback
    presigned = storage.generate_presigned_url(filename, expiration_seconds=600)
    assert presigned == f"/static/uploads/{filename}"

    # 3. Delete
    deleted = storage.delete_file(url)
    assert deleted is True
    assert not saved_file.exists()


def test_s3_storage_mocked_upload_and_presigned_url():
    """Verifies that when S3 is enabled, boto3 client methods are invoked with correct parameters."""
    storage = StorageService()
    storage.endpoint_url = "https://s3.ir-thr-at1.arvanstorage.ir"
    storage.access_key = "test-access-key"
    storage.secret_key = "test-secret-key"
    storage.bucket_name = "zanjirzan-media"
    storage.region_name = "ir-thr-at1"
    storage.public_url = "https://media.zanjirzan.ir"

    mock_client = MagicMock()
    mock_client.generate_presigned_url.return_value = "https://media.zanjirzan.ir/lecture1.mp4?sign=xyz"
    storage._s3_client = mock_client
    storage._initialized = True

    test_bytes = b"Audio lecture slice"
    filename = "lecture1.mp4"

    # 1. Upload to S3
    url = storage.upload_file(test_bytes, filename, content_type="video/mp4")
    assert url == f"https://media.zanjirzan.ir/{filename}"
    mock_client.upload_fileobj.assert_called_once()

    # 2. Presigned URL from S3
    presigned = storage.generate_presigned_url(filename, expiration_seconds=900)
    assert presigned == "https://media.zanjirzan.ir/lecture1.mp4?sign=xyz"
    mock_client.generate_presigned_url.assert_called_once_with(
        "get_object",
        Params={"Bucket": "zanjirzan-media", "Key": "lecture1.mp4"},
        ExpiresIn=900,
    )

    # 3. Delete from S3
    deleted = storage.delete_file(filename)
    assert deleted is True
    mock_client.delete_object.assert_called_once_with(
        Bucket="zanjirzan-media",
        Key="lecture1.mp4",
    )


def test_s3_error_graceful_fallback_to_local(tmp_path):
    """Verifies that if S3 upload raises an exception, the service falls back to local disk without raising."""
    storage = StorageService()
    storage.local_upload_dir = tmp_path
    storage.endpoint_url = "https://s3.example.com"
    storage.access_key = "key"
    storage.secret_key = "secret"
    storage.bucket_name = "bucket"

    mock_client = MagicMock()
    mock_client.upload_fileobj.side_effect = RuntimeError("S3 Connection Timeout")
    storage._s3_client = mock_client
    storage._initialized = True

    test_bytes = b"Course Audio File"
    filename = "fallback_audio.mp3"

    url = storage.upload_file(test_bytes, filename, content_type="audio/mpeg")
    assert url == f"/static/uploads/{filename}"

    saved_file = tmp_path / filename
    assert saved_file.exists()
    assert saved_file.read_bytes() == test_bytes
