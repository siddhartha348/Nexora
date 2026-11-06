import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.mongo import db_manager
from app.services.auth_service import AuthService
from app.models.auth import UserRegisterRequest, UserRole

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_auth_users():
    """
    Creates test organization with users across different roles:
    - Admin (Full rights)
    - Approver (Can approve/reject ads)
    - Reviewer (Can resolve findings and request changes, but NOT approve/reject)
    - Creator (Can submit ads, read-only on approvals)
    """
    org_id = "test-review-org-001"
    
    # Register Admin
    admin_token_resp = client.post("/api/v1/auth/register", json={
        "email": "review.admin@nexora.internal",
        "password": "SecurePassword123!",
        "full_name": "Governance Admin",
        "organization_name": "Review Test Org"
    }).json()

    admin_token = admin_token_resp.get("access_token")
    real_org_id = admin_token_resp.get("organization_id")

    # Invite Approver
    invite_approver = client.post(
        f"/api/v1/organizations/{real_org_id}/invitations",
        json={"email": "approver@nexora.internal", "role": "APPROVER"},
        headers={"Authorization": f"Bearer {admin_token}"}
    ).json()

    # Register Approver with invite
    approver_token_resp = client.post("/api/v1/auth/register", json={
        "email": "approver@nexora.internal",
        "password": "SecurePassword123!",
        "full_name": "Senior Brand Approver",
        "invite_code": invite_approver["invite_code"]
    }).json()

    # Invite Reviewer
    invite_reviewer = client.post(
        f"/api/v1/organizations/{real_org_id}/invitations",
        json={"email": "reviewer@nexora.internal", "role": "REVIEWER"},
        headers={"Authorization": f"Bearer {admin_token}"}
    ).json()

    # Register Reviewer with invite
    reviewer_token_resp = client.post("/api/v1/auth/register", json={
        "email": "reviewer@nexora.internal",
        "password": "SecurePassword123!",
        "full_name": "Creative Reviewer",
        "invite_code": invite_reviewer["invite_code"]
    }).json()

    return {
        "admin_token": admin_token,
        "approver_token": approver_token_resp.get("access_token"),
        "reviewer_token": reviewer_token_resp.get("access_token"),
        "org_id": real_org_id
    }

def test_full_review_workflow_and_brand_memory(setup_auth_users):
    tokens = setup_auth_users
    admin_headers = {"Authorization": f"Bearer {tokens['admin_token']}"}
    approver_headers = {"Authorization": f"Bearer {tokens['approver_token']}"}
    reviewer_headers = {"Authorization": f"Bearer {tokens['reviewer_token']}"}

    # Step 1: Submit an advertisement for 6-agent analysis
    creative_text = (
        "Introducing the Apex Drone Pro. Priced at only $899 (previously $1200). "
        "Delivers an industry-crushing 55-minute continuous flight time with unbreakable titanium wings. "
        "BUY NOW OR MISS OUT on the world's most unbeatable surveillance experience!"
    )

    submit_resp = client.post(
        "/api/v1/ads/submit-url",
        json={
            "title": "Apex Drone Q4 Campaign",
            "url": "https://example.com/apex-drone-launch"
        },
        headers=admin_headers
    )
    assert submit_resp.status_code == 201
    job = submit_resp.json()
    ad_id = job.get("advertisement_id") or job["id"]

    # Step 2: Initialize Human Review Workspace
    review_resp = client.get(f"/api/v1/reviews/ad/{ad_id}", headers=reviewer_headers)
    assert review_resp.status_code == 200
    review_data = review_resp.json()
    review_id = review_data["id"]

    assert review_data["status"] == "UNDER_REVIEW"
    assert "original_content" in review_data
    assert "proposed_content" in review_data
    assert "finding_resolutions" in review_data

    # Verify report is attached with findings
    report = review_data.get("report")
    assert report is not None
    findings = report.get("findings", [])
    assert len(findings) > 0

    finding_1 = findings[0]
    finding_1_id = finding_1["id"]

    # Step 3: Reviewer Accepts Suggestion on finding 1
    accept_resp = client.post(
        f"/api/v1/reviews/{review_id}/findings/{finding_1_id}/resolve",
        json={
            "decision": "ACCEPTED",
            "comment": "Aligned with brand terminology guidelines."
        },
        headers=reviewer_headers
    )
    assert accept_resp.status_code == 200
    updated_review = accept_resp.json()
    assert updated_review["finding_resolutions"][finding_1_id]["decision"] == "ACCEPTED"
    assert updated_review["finding_resolutions"][finding_1_id]["reviewed_by_name"] == "Creative Reviewer"

    # Step 4: Reviewer Edits Suggestion on finding 2 if exists
    if len(findings) > 1:
        finding_2 = findings[1]
        finding_2_id = finding_2["id"]

        custom_text = "Delivers up to 38 minutes of tested aerial operation."
        edit_resp = client.post(
            f"/api/v1/reviews/{review_id}/findings/{finding_2_id}/resolve",
            json={
                "decision": "EDITED",
                "custom_replacement": custom_text,
                "comment": "Modifying to conservative engineering measured standard."
            },
            headers=reviewer_headers
        )
        assert edit_resp.status_code == 200
        edit_data = edit_resp.json()
        assert edit_data["finding_resolutions"][finding_2_id]["decision"] == "EDITED"
        assert edit_data["finding_resolutions"][finding_2_id]["custom_replacement"] == custom_text

    # Step 5: Verify Brand Memory Engine recorded the reviewer decisions
    memory_resp = client.get("/api/v1/reviews/brand-memory/query", headers=reviewer_headers)
    assert memory_resp.status_code == 200
    memory_entries = memory_resp.json()
    assert len(memory_entries) >= 1

    # Brand Memory Rule: Brand Memory is non-authoritative and must never override approved knowledge
    for entry in memory_entries:
        assert entry["is_official_policy"] is False
        assert "decision" in entry
        assert "original_text" in entry

    # Step 6: Test RBAC Permissions
    # A Reviewer CANNOT approve or reject the advertisement
    unauth_approve = client.post(
        f"/api/v1/reviews/{review_id}/finalize",
        json={"decision": "APPROVED", "comment": "Reviewer trying to approve"},
        headers=reviewer_headers
    )
    assert unauth_approve.status_code == 403
    assert "Only users with role APPROVER or ADMIN" in unauth_approve.json()["detail"]

    # Step 7: Reviewer CAN request changes
    changes_resp = client.post(
        f"/api/v1/reviews/{review_id}/finalize",
        json={
            "decision": "CHANGES_REQUESTED",
            "comment": "Legal review requested on battery claim."
        },
        headers=reviewer_headers
    )
    assert changes_resp.status_code == 200
    assert changes_resp.json()["status"] == "CHANGES_REQUESTED"

    # Step 8: Approver can officially APPROVE the advertisement
    final_approve = client.post(
        f"/api/v1/reviews/{review_id}/finalize",
        json={
            "decision": "APPROVED",
            "comment": "All corrected findings verified against Brand Knowledge Hub. Approved for distribution."
        },
        headers=approver_headers
    )
    assert final_approve.status_code == 200
    final_data = final_approve.json()
    assert final_data["status"] == "APPROVED"
    assert final_data["final_decision"] == "APPROVED"
    assert final_data["final_decision_by_name"] == "Senior Brand Approver"

