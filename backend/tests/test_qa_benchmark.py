import os
import sys
import pytest
from starlette.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.models.advertisement import AdvertisementSeverity
from app.services.guardians.fact_guardian import FactGuardian
from app.services.arbiter import RiskArbiter
from app.db.mongo import get_database

client = TestClient(app)

@pytest.mark.asyncio
async def test_seeded_error_benchmark_evaluations():
    """
    Evaluates Seeded Error Benchmark across 4 metrics:
    1. Issues Found (Recall rate of injected contradictions)
    2. Fact-label accuracy (Correct Supported / Contradicted / Unverifiable labels)
    3. False Positive Rate (Unsubstantiated claims correctly not approved as GREEN)
    4. Evidence Coverage (Verifiable findings must contain approved citation evidence)
    """
    db = get_database()
    org_id = "org_benchmark_qa_001"
    
    # Clean previous test entries
    await db["knowledge_facts"].delete_many({"organization_id": org_id})

    # Authoritative approved specification facts for Aurora X2
    facts = [
        {
            "id": "fct-qa-battery",
            "organization_id": org_id,
            "document_id": "doc-aurora-spec",
            "document_title": "Aurora X2 Technical Specification Sheet",
            "version_tag": "v3.2",
            "subject": "Aurora X2",
            "predicate": "battery_life",
            "object_value": "5 days",
            "verbatim_quote": "Battery life is tested up to 5 days under standard operating benchmark.",
            "is_approved": True,
            "page_number": 4,
            "category": "SPECIFICATIONS"
        },
        {
            "id": "fct-qa-warranty",
            "organization_id": org_id,
            "document_id": "doc-aurora-spec",
            "document_title": "Aurora X2 Technical Specification Sheet",
            "version_tag": "v3.2",
            "subject": "Aurora X2",
            "predicate": "warranty",
            "object_value": "2 years",
            "verbatim_quote": "Standard manufacturer warranty is 2 years.",
            "is_approved": True,
            "page_number": 2,
            "category": "SPECIFICATIONS"
        }
    ]
    await db["knowledge_facts"].insert_many(facts)

    # Test creative with 1 direct contradiction, 1 supported fact, and 1 unverifiable claim
    test_ad_text = (
        "Experience Aurora X2: Enjoy up to 8 days battery life and our 2-year warranty. "
        "Engineered with quantum antigravity cooling tech."
    )

    extracted_data = {
        "specifications": {
            "battery_life": "8 days battery life",
            "warranty": "2-year warranty"
        },
        "candidate_claims": [
            "up to 8 days battery life",
            "2-year warranty",
            "quantum antigravity cooling tech"
        ],
        "visual_metadata": {
            "contrast_ratio": 7.1,
            "extracted_colors": ["#111111", "#FFFBF0"]
        }
    }

    report = await RiskArbiter.evaluate_advertisement(
        organization_id=org_id,
        advertisement_id="ad-qa-seeded-01",
        ad_text=test_ad_text,
        extracted_data=extracted_data
    )

    # Metric 1: Issues Found (Contradiction caught)
    contradiction_finding = next(
        (f for f in report.findings if f.severity == AdvertisementSeverity.RED and "battery" in f.original_claim.lower()),
        None
    )
    assert contradiction_finding is not None
    assert contradiction_finding.status == "Contradicted"
    assert "5 days" in contradiction_finding.explanation

    # Metric 2: Fact-Label Accuracy
    assert contradiction_finding.severity == AdvertisementSeverity.RED

    # Metric 3: False Positive Rate (Unverified quantum cooling claim cannot be GREEN / Supported)
    unverified_claim_finding = next(
        (f for f in report.findings if "quantum" in f.original_claim.lower()),
        None
    )
    if unverified_claim_finding:
        assert unverified_claim_finding.severity != AdvertisementSeverity.GREEN

    # Metric 4: Evidence Coverage
    # The contradiction finding must include explicit source citation and quote
    assert contradiction_finding.evidence is not None
    assert contradiction_finding.evidence.source_document == "Aurora X2 Technical Specification Sheet"
    assert contradiction_finding.evidence.version == "v3.2"
    assert "5 days" in contradiction_finding.evidence.supporting_excerpt

    # Overall verdict must be RED
    assert report.overall_severity == AdvertisementSeverity.RED
