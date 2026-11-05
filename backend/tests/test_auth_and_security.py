import pytest
import sys
import os
from datetime import timedelta
import jwt

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from starlette.testclient import TestClient
from app.main import app
from app.core.security import create_jwt_token
from app.core.config import settings

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database_mode" in data

def test_registration_success():
    payload = {
        "email": "lead.architect@pinnacle.gov",
        "password": "SecurePassword123!",
        "full_name": "Vadlapudi Siddhartha",
        "organization_name": "Team PINNACLE"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "lead.architect@pinnacle.gov"
    assert data["role"] == "ADMIN"
    assert data["organization_name"] == "Team PINNACLE"
    assert "access_token" in data
    # Verify HttpOnly cookie was set
    assert "nexora_access_token" in response.cookies

def test_duplicate_registration_fails():
    payload = {
        "email": "lead.architect@pinnacle.gov",
        "password": "SecurePassword123!",
        "full_name": "Duplicate User",
        "organization_name": "Another Org"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_invalid_passwords_rejected():
    invalid_passwords = [
        ("short1!", "at least 8 characters"),
        ("lowercaseonly123!", "uppercase letter"),
        ("UPPERCASEONLY123!", "lowercase letter"),
        ("NoSpecialChar123", "special character"),
        ("NoNumericDigit!@", "numeric digit"),
    ]
    for pwd, expected_err in invalid_passwords:
        payload = {
            "email": f"test_{pwd[:5]}@nexora.internal",
            "password": pwd,
            "full_name": "Policy Tester",
            "organization_name": "Test Org"
        }
        res = client.post("/api/v1/auth/register", json=payload)
        assert res.status_code == 422
        assert expected_err.lower() in str(res.json()["detail"]).lower()

def test_login_success():
    payload = {
        "email": "lead.architect@pinnacle.gov",
        "password": "SecurePassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "lead.architect@pinnacle.gov"
    assert "access_token" in data

def test_login_invalid_password():
    payload = {
        "email": "lead.architect@pinnacle.gov",
        "password": "WrongPassword999!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_unauthorised_api_access():
    # Attempting to access protected /me without credentials
    fresh_client = TestClient(app)
    res = fresh_client.get("/api/v1/auth/me")
    assert res.status_code == 401
    assert "Authentication token required" in res.json()["detail"]

def test_expired_session_token():
    # Craft an intentionally expired token
    expired_payload = {
        "sub": "some-user-id",
        "email": "expired@nexora.internal",
        "org_id": "some-org-id",
        "role": "VIEWER"
    }
    expired_token = create_jwt_token(
        payload=expired_payload,
        expires_delta=timedelta(seconds=-10),
        token_type="access"
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 401
    assert "Session has expired" in res.json()["detail"]

def test_logout():
    # Test logout endpoint clears cookies
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert "Successfully logged out" in res.json()["message"]

def test_role_permissions_rbac():
    # 1. Register Admin User
    admin_payload = {
        "email": "admin.owner@brandcorp.com",
        "password": "AdminPassword123!",
        "full_name": "Brand Administrator",
        "organization_name": "BrandCorp Global"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_res.status_code == 201
    admin_data = admin_res.json()
    admin_token = admin_data["access_token"]
    org_id = admin_data["organization_id"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Admin creates an invite for a CREATOR
    invite_payload = {
        "email": "agency.creator@creativeagency.com",
        "role": "CREATOR"
    }
    invite_res = client.post(
        f"/api/v1/organizations/{org_id}/invitations",
        json=invite_payload,
        headers=admin_headers
    )
    assert invite_res.status_code == 200
    invite_code = invite_res.json()["invite_code"]

    # 3. Creator registers using the invite code
    creator_payload = {
        "email": "agency.creator@creativeagency.com",
        "password": "CreatorPassword123!",
        "full_name": "Agency Creator",
        "invite_code": invite_code
    }
    creator_res = client.post("/api/v1/auth/register", json=creator_payload)
    assert creator_res.status_code == 201
    creator_data = creator_res.json()
    assert creator_data["role"] == "CREATOR"
    assert creator_data["organization_id"] == org_id
    creator_token = creator_data["access_token"]
    creator_headers = {"Authorization": f"Bearer {creator_token}"}

    # 4. Creator tries to perform Admin action (update organization settings) -> MUST BE 403 FORBIDDEN
    forbidden_update = {
        "name": "Hacked Brand Name"
    }
    forbidden_res = client.put(
        f"/api/v1/organizations/{org_id}/settings",
        json=forbidden_update,
        headers=creator_headers
    )
    assert forbidden_res.status_code == 403
    assert "Access forbidden" in forbidden_res.json()["detail"]

    # 5. Creator tries to invite members -> MUST BE 403 FORBIDDEN
    forbidden_invite_res = client.post(
        f"/api/v1/organizations/{org_id}/invitations",
        json={"email": "another@test.com", "role": "VIEWER"},
        headers=creator_headers
    )
    assert forbidden_invite_res.status_code == 403

def test_cross_organisation_access_isolation():
    # 1. Register Org Alpha
    alpha_payload = {
        "email": "admin@orgalpha.com",
        "password": "AlphaPassword123!",
        "full_name": "Alpha Admin",
        "organization_name": "Org Alpha"
    }
    alpha_res = client.post("/api/v1/auth/register", json=alpha_payload)
    alpha_org_id = alpha_res.json()["organization_id"]

    # 2. Register Org Beta
    beta_payload = {
        "email": "admin@orgbeta.com",
        "password": "BetaPassword123!",
        "full_name": "Beta Admin",
        "organization_name": "Org Beta"
    }
    beta_res = client.post("/api/v1/auth/register", json=beta_payload)
    beta_token = beta_res.json()["access_token"]
    beta_headers = {"Authorization": f"Bearer {beta_token}"}

    # 3. User from Org Beta tries to list members of Org Alpha -> 403 Cross-organisation violation
    cross_res = client.get(
        f"/api/v1/organizations/{alpha_org_id}/members",
        headers=beta_headers
    )
    assert cross_res.status_code == 403
    assert "Cross-organisation access violation" in cross_res.json()["detail"]

    # 4. User from Org Beta tries to modify Org Alpha's settings -> 403 Cross-organisation violation
    cross_modify_res = client.put(
        f"/api/v1/organizations/{alpha_org_id}/settings",
        json={"name": "Attacked Alpha"},
        headers=beta_headers
    )
    assert cross_modify_res.status_code == 403
    assert "Cross-organisation access violation" in cross_modify_res.json()["detail"]

def test_password_reset_flow():
    # 1. Request password reset
    forgot_res = client.post("/api/v1/auth/forgot-password", json={"email": "lead.architect@pinnacle.gov"})
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json().get("reset_token")
    assert reset_token is not None

    # 2. Reset password using the token
    reset_res = client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "NewSecurePassword456!"
    })
    assert reset_res.status_code == 200

    # 3. Old password should fail
    old_login = client.post("/api/v1/auth/login", json={
        "email": "lead.architect@pinnacle.gov",
        "password": "SecurePassword123!"
    })
    assert old_login.status_code == 401

    # 4. New password should succeed
    new_login = client.post("/api/v1/auth/login", json={
        "email": "lead.architect@pinnacle.gov",
        "password": "NewSecurePassword456!"
    })
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()
