# -*- coding: utf-8 -*-
"""
Tests for 6-digit OTP dispatch and verification on registration and login.
Complies with BACKEND_SYSTEM_DESIGN.md (Security Guardian & Reliability Engine).
"""
import uuid
import pytest
from backend.app.core.sms_provider import sms_provider
from backend.app.services.auth_service import auth_service


def test_registration_dispatches_6digit_otp(client):
    """
    Ensure that when a user registers for the first time via /api/v1/auth/register,
    a 6-digit OTP code is generated, stored, and dispatched via the SMS provider service.
    """
    test_phone = f"0912{uuid.uuid4().int % 10000000:07d}"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "دانشجوی آزمایشی",
        "phone": test_phone,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200
    user_data = reg_res.json()
    assert "access_token" in user_data
    assert user_data["phone"] == test_phone

    # Verify 6-digit OTP was generated and stored
    pending = auth_service.get_pending_otp(test_phone)
    assert pending is not None
    assert len(str(pending)) == 6
    assert str(pending).isdigit()

    # Verify SMS provider received the dispatched OTP
    assert test_phone in sms_provider.last_sent
    dispatched_code = sms_provider.last_sent[test_phone]
    assert len(dispatched_code) == 6
    assert dispatched_code == str(pending)


def test_otp_send_and_verify_first_time_user(client):
    """
    Ensure that a first-time user can request a 6-digit OTP, receive it,
    and verify it with their full_name to create an authenticated account.
    """
    new_phone = f"0935{uuid.uuid4().int % 10000000:07d}"
    student_name = "پژوهشگر حکمت متعالیه"

    # 1. Request OTP
    send_res = client.post("/api/v1/auth/otp/send", json={"phone": new_phone})
    assert send_res.status_code == 200
    data = send_res.json()
    assert data["success"] is True
    assert data["expires_in_seconds"] == 120
    code = data.get("mock_code") or sms_provider.last_sent.get(new_phone)
    assert code is not None
    assert len(str(code)) == 6

    # 2. Verify OTP with full_name to provision new user
    verify_res = client.post("/api/v1/auth/otp/verify", json={
        "phone": new_phone,
        "code": str(code),
        "full_name": student_name,
    })
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["phone"] == new_phone
    assert verified_data["full_name"] == student_name
    assert "access_token" in verified_data

    # 3. Subsequent profile fetch via token
    headers = {"Authorization": f"Bearer {verified_data['access_token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == student_name


def test_otp_brute_force_shield_and_persian_digits(client):
    """
    Ensure brute-force rate-limiting kicks in after 5 failed attempts (HTTP 429),
    and Persian digits (۰-۹) are accepted and normalized.
    """
    shield_phone = f"0990{uuid.uuid4().int % 10000000:07d}"
    send_res = client.post("/api/v1/auth/otp/send", json={"phone": shield_phone})
    assert send_res.status_code == 200

    # 5 failed attempts return 401
    for i in range(5):
        fail_res = client.post("/api/v1/auth/otp/verify", json={
            "phone": shield_phone,
            "code": f"00000{i}"
        })
        assert fail_res.status_code == 401

    # 6th attempt blocked with 429
    blocked_res = client.post("/api/v1/auth/otp/verify", json={
        "phone": shield_phone,
        "code": "111111"
    })
    assert blocked_res.status_code == 429

    # Re-sending OTP clears attempts
    resend = client.post("/api/v1/auth/otp/send", json={"phone": shield_phone})
    assert resend.status_code == 200
    code = resend.json().get("mock_code") or sms_provider.last_sent.get(shield_phone)

    # Convert to Persian digits and verify
    trans = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
    persian_code = str(code).translate(trans)

    success_res = client.post("/api/v1/auth/otp/verify", json={
        "phone": shield_phone,
        "code": persian_code,
    })
    assert success_res.status_code == 200
    assert "access_token" in success_res.json()
