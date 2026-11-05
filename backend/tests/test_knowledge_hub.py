import pytest
import sys
import os
import io

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_context():
    # 1. Register Admin in Org Alpha
    admin_payload = {
        "email": "brand.admin@alphacorp.com",
        "password": "AdminPassword123!",
        "full_name": "Alpha Brand Admin",
        "organization_name": "Alpha Corp"
    }
    admin_res = client.post("/api/v1/auth/register", json=admin_payload)
    assert admin_res.status_code == 201
    admin_data = admin_res.json()
    admin_token = admin_data["access_token"]
    org_id = admin_data["organization_id"]

    # 2. Invite a Creator
    invite_res = client.post(
        f"/api/v1/organizations/{org_id}/invitations",
        json={"email": "creator@alphacorp.com", "role": "CREATOR"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    invite_code = invite_res.json()["invite_code"]

    # 3. Register Creator
    creator_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "creator@alphacorp.com",
            "password": "CreatorPassword123!",
            "full_name": "Alpha Creator",
            "invite_code": invite_code
        }
    )
    creator_token = creator_res.json()["access_token"]

    return {
        "admin_token": admin_token,
        "creator_token": creator_token,
        "org_id": org_id
    }

def test_upload_sample_product_specification(auth_context):
    admin_headers = {"Authorization": f"Bearer {auth_context['admin_token']}"}

    sample_spec_content = (
        "Aurora X2 Ultra Audio - Product Specification Sheet v1.0\n\n"
        "1. Performance and Battery\n"
        "The Aurora X2 delivers up to 5 days of battery runtime on a single charge.\n\n"
        "2. Commercial Terms\n"
        "Retail pricing is set at $499 USD.\n"
        "Backed by our standard 2-year warranty covering all hardware defects.\n\n"
        "3. Physical Specifications\n"
        "Net weight: 450g with ergonomic earcups.\n\n"
        "4. Promotional Claims\n"
        "Features the fastest wireless sync protocol in the audio market."
    )

    file_bytes = io.BytesIO(sample_spec_content.encode("utf-8"))

    upload_data = {
        "title": "Aurora X2 Technical Specification Sheet",
        "category": "SPECIFICATIONS",
        "product_association": "Aurora X2",
        "effective_date": "2026-11-06T00:00:00Z",
        "version_tag": "v1.0"
    }

    files = {
        "file": ("aurora_x2_spec_v1.0.txt", file_bytes, "text/plain")
    }

    res = client.post("/api/v1/knowledge/upload", data=upload_data, files=files, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Aurora X2 Technical Specification Sheet"
    assert data["current_version"] == "v1.0"
    assert data["approval_status"] == "PENDING"
    assert len(data["versions"]) >= 1

    doc_id = data["id"]
    auth_context["doc_id"] = doc_id

    # Verify document detail and extracted facts
    detail_res = client.get(f"/api/v1/knowledge/documents/{doc_id}", headers=admin_headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["extracted_facts"]) >= 3

    # Check extracted facts for battery, warranty, price
    predicates = [f["predicate"] for f in detail_data["extracted_facts"]]
    assert "battery_life" in predicates
    assert "warranty_period" in predicates
    assert "msrp_price" in predicates

def test_unapproved_document_not_retrievable_by_rag(auth_context):
    admin_headers = {"Authorization": f"Bearer {auth_context['admin_token']}"}

    # Query for "warranty" while document is still PENDING
    search_payload = {
        "query": "warranty period and coverage",
        "limit": 5
    }
    search_res = client.post("/api/v1/knowledge/search", json=search_payload, headers=admin_headers)
    assert search_res.status_code == 200
    results = search_res.json()

    # MUST BE ZERO because unapproved knowledge must never become authoritative evidence
    assert len(results) == 0

def test_non_admin_cannot_approve(auth_context):
    creator_headers = {"Authorization": f"Bearer {auth_context['creator_token']}"}
    doc_id = auth_context["doc_id"]

    # Creator tries to approve -> 403 Forbidden
    approve_res = client.post(
        f"/api/v1/knowledge/documents/{doc_id}/approve",
        json={"notes": "Illegal attempt"},
        headers=creator_headers
    )
    assert approve_res.status_code == 403
    assert "Access forbidden" in approve_res.json()["detail"]

def test_admin_approval_gate_and_rag_activation(auth_context):
    admin_headers = {"Authorization": f"Bearer {auth_context['admin_token']}"}
    doc_id = auth_context["doc_id"]

    # Admin approves document
    approve_res = client.post(
        f"/api/v1/knowledge/documents/{doc_id}/approve",
        json={"notes": "Verified against engineering baseline v1.0"},
        headers=admin_headers
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["approval_status"] == "APPROVED"

    # Now query knowledge search for "warranty"
    search_payload = {
        "query": "warranty period and terms",
        "limit": 5
    }
    search_res = client.post("/api/v1/knowledge/search", json=search_payload, headers=admin_headers)
    assert search_res.status_code == 200
    results = search_res.json()

    # Now returns approved results with source document and version
    assert len(results) > 0
    assert any("2-year" in r["content"].lower() or "warranty" in r["content"].lower() for r in results)
    assert results[0]["is_approved"] is True

def test_version_replacement_and_diff(auth_context):
    admin_headers = {"Authorization": f"Bearer {auth_context['admin_token']}"}
    doc_id = auth_context["doc_id"]

    # Upload Version 1.1 with modified values (Warranty changed from 2 years to 3 years, Battery from 5 days to 7 days)
    v1_1_content = (
        "Aurora X2 Ultra Audio - Product Specification Sheet v1.1\n\n"
        "1. Performance and Battery\n"
        "The Aurora X2 delivers up to 7 days of battery runtime on a single charge.\n\n"
        "2. Commercial Terms\n"
        "Retail pricing is updated to $549 USD.\n"
        "Backed by our extended 3-year warranty covering all hardware defects.\n\n"
        "3. Physical Specifications\n"
        "Net weight: 440g with aerospace magnesium frame.\n\n"
        "4. Promotional Claims\n"
        "Features the fastest wireless sync protocol in the audio market."
    )

    file_bytes = io.BytesIO(v1_1_content.encode("utf-8"))

    upload_data = {
        "title": "Aurora X2 Technical Specification Sheet",
        "category": "SPECIFICATIONS",
        "existing_doc_id": doc_id,
        "version_tag": "v1.1"
    }

    files = {
        "file": ("aurora_x2_spec_v1.1.txt", file_bytes, "text/plain")
    }

    res = client.post("/api/v1/knowledge/upload", data=upload_data, files=files, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["current_version"] == "v1.1"

    # Compare v1.0 and v1.1
    diff_res = client.get(
        f"/api/v1/knowledge/documents/{doc_id}/diff?v_old=v1.0&v_new=v1.1",
        headers=admin_headers
    )
    assert diff_res.status_code == 200
    diff_data = diff_res.json()
    assert diff_data["old_version"] == "v1.0"
    assert diff_data["new_version"] == "v1.1"
    assert len(diff_data["modified_facts"]) > 0

    modified_preds = [m["predicate"] for m in diff_data["modified_facts"]]
    # Should detect modified battery and/or warranty
    assert "battery_life" in modified_preds or "warranty_period" in modified_preds
