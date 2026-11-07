# -*- coding: utf-8 -*-
"""
Tests for Student Profile Settings, Name Updating for Certificates, and Password Changes.
Complies with BACKEND_SYSTEM_DESIGN.md and project rules.
"""
import pytest
from fastapi.testclient import TestClient


def test_update_student_profile_identity(client: TestClient, student_token: str):
    """
    Verifies that a student can update their full_name (for certificates) and email.
    """
    headers = {"Authorization": f"Bearer {student_token}"}
    payload = {
        "full_name": "سید مهدی طباطبایی",
        "email": "tabatabaei@hayat.ir",
    }
    res = client.put("/api/v1/auth/profile", json=payload, headers=headers)
    assert res.status_code == 200, f"Update profile failed: {res.text}"
    data = res.json()
    assert data["full_name"] == "سید مهدی طباطبایی"
    assert data["email"] == "tabatabaei@hayat.ir"

    # Verify /auth/me returns updated details
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["full_name"] == "سید مهدی طباطبایی"
    assert me_data["email"] == "tabatabaei@hayat.ir"


def test_change_password_validation(client: TestClient):
    """
    Verifies password change validation:
    - Rejects wrong current password
    - Rejects too short password (< 6 chars)
    - Successfully changes password with valid current password and allows login with new password
    """
    phone = "09129990011"
    old_pass = "InitialPass123"
    reg = client.post("/api/v1/auth/register", json={
        "full_name": "تست رمز عبور",
        "phone": phone,
        "password": old_pass,
    })
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Weak password rejection
    res_weak = client.put("/api/v1/auth/profile", json={
        "password": "123",
        "current_password": old_pass,
    }, headers=headers)
    assert res_weak.status_code == 422 or res_weak.status_code == 400

    # 2. Wrong current password rejection
    res_wrong = client.put("/api/v1/auth/profile", json={
        "password": "NewStrongPass456!",
        "current_password": "WrongPassword999",
    }, headers=headers)
    assert res_wrong.status_code == 400
    assert "نادرست" in res_wrong.text

    # 3. Successful password change
    new_pass = "NewStrongPass456!"
    res_ok = client.put("/api/v1/auth/profile", json={
        "password": new_pass,
        "current_password": old_pass,
    }, headers=headers)
    assert res_ok.status_code == 200

    # 4. Login with old password must fail
    res_fail = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": old_pass,
    })
    assert res_fail.status_code == 401

    # 5. Login with new password must succeed
    res_success = client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": new_pass,
    })
    assert res_success.status_code == 200
    assert res_success.json()["access_token"]
