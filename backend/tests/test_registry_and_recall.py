import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def admin_client():
    with TestClient(app) as c:
        login_resp = c.post("/api/v1/auth/login", json={
            "email": "admin@nexora.com",
            "password": "NexoraAdmin2026!"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        c.headers.update({"Authorization": f"Bearer {token}"})
        yield c

def test_advertisement_registry_listing(admin_client):
    """Verify Advertisement Registry returns registered ads with status counts."""
    resp = admin_client.get("/api/v1/registry")
    assert resp.status_code == 200
    data = resp.json()
    assert "advertisements" in data
    assert "status_counts" in data
    assert len(data["advertisements"]) >= 1
    assert "ALL" in data["status_counts"]

def test_advertisement_registry_detail_and_status_update(admin_client):
    """Verify inspecting single ad detail and updating publication status."""
    list_resp = admin_client.get("/api/v1/registry")
    ads = list_resp.json()["advertisements"]
    assert len(ads) > 0
    ad_id = ads[0]["id"]

    detail_resp = admin_client.get(f"/api/v1/registry/{ad_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == ad_id

    # Update status to PUBLISHED
    patch_resp = admin_client.patch(
        f"/api/v1/registry/{ad_id}/status",
        json={"status": "PUBLISHED", "channel": "Web Landing Page"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "PUBLISHED"

def test_recall_engine_alerts_listing(admin_client):
    """Verify Recall Engine lists active alerts."""
    resp = admin_client.get("/api/v1/recall/alerts?status=ALL")
    assert resp.status_code == 200
    data = resp.json()
    assert "alerts" in data
    assert "counts" in data
    assert len(data["alerts"]) >= 1

def test_recall_engine_evaluate_sweep(admin_client):
    """Verify Recall Engine can run a full evaluation sweep across registered advertisements."""
    resp = admin_client.post("/api/v1/recall/evaluate")
    assert resp.status_code == 200
    data = resp.json()
    assert "ads_scanned" in data
    assert data["ads_scanned"] >= 1

def test_governance_analytics_overview(admin_client):
    """Verify Governance Analytics returns calculated metrics, guardian frequencies, and insights."""
    resp = admin_client.get("/api/v1/analytics/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "severity_distribution" in data
    assert "guardian_flag_counts" in data
    assert "actionable_insights" in data
    assert "honest_positioning" in data
    assert "GREEN means" in data["honest_positioning"]["green_meaning"]

def test_audit_logs_endpoint(admin_client):
    """Verify Administrators can retrieve immutable audit logs."""
    resp = admin_client.get("/api/v1/audit/logs")
    assert resp.status_code == 200
    data = resp.json()
    assert "logs" in data
    assert "count" in data
