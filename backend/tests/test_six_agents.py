import pytest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.services.guardians.fact_guardian import FactGuardian
from app.services.guardians.voice_guardian import VoiceGuardian
from app.services.guardians.terminology_guardian import TerminologyGuardian
from app.services.guardians.claims_guardian import ClaimsGuardian
from app.services.guardians.visual_guardian import VisualGuardian
from app.services.guardians.accessibility_guardian import AccessibilityGuardian
from app.services.arbiter import RiskArbiter
from app.models.advertisement import AdvertisementSeverity, AgentType
from app.db.mongo import get_database

async def seed_test_org_facts():
    db = get_database()
    org_id = "test_org_guardians"
    
    # Clean previous test entries
    await db["knowledge_facts"].delete_many({"organization_id": org_id})
    await db["document_versions"].delete_many({"organization_id": org_id})

    # Ingest approved knowledge facts
    facts = [
        {
            "id": "fact-1",
            "organization_id": org_id,
            "document_id": "doc-spec-01",
            "document_title": "Aurora X2 Technical Specification Sheet",
            "version_tag": "v3.2",
            "page_number": 4,
            "category": "SPECIFICATIONS",
            "subject": "Aurora X2",
            "predicate": "battery_life",
            "object_value": "5 days",
            "verbatim_quote": "Battery life is tested up to 5 days under standard operating benchmark.",
            "is_approved": True
        },
        {
            "id": "fact-2",
            "organization_id": org_id,
            "document_id": "doc-spec-01",
            "document_title": "Aurora X2 Warranty Policy",
            "version_tag": "v3.2",
            "page_number": 2,
            "category": "SPECIFICATIONS",
            "subject": "Aurora X2",
            "predicate": "warranty",
            "object_value": "2 years",
            "verbatim_quote": "Standard manufacturer warranty is 2 years.",
            "is_approved": True
        },
        {
            "id": "fact-3",
            "organization_id": org_id,
            "document_id": "doc-term-01",
            "document_title": "Brand Trademark Registry",
            "version_tag": "v2.1",
            "page_number": 1,
            "category": "TERMINOLOGY",
            "subject": "eco-magic chassis",
            "predicate": "canonical_term",
            "object_value": "UltraGlide Recycled Alloy",
            "verbatim_quote": "Replace colloquial 'eco-magic chassis' with canonical 'UltraGlide Recycled Alloy'.",
            "is_approved": True
        }
    ]
    await db["knowledge_facts"].insert_many(facts)

@pytest.mark.asyncio
async def test_fact_guardian_catches_specification_contradiction():
    """Verify Fact Guardian catches a 7 days vs 5 days battery contradiction."""
    await seed_test_org_facts()
    org_id = "test_org_guardians"
    ad_text = "Experience Aurora X2: up to 7 days battery life with our standard 2-year warranty."
    extracted_data = {
        "specifications": {"battery_life": "up to 7 days battery life", "warranty": "2-year warranty"},
        "candidate_claims": [ad_text],
    }

    findings = await FactGuardian.audit(org_id, ad_text, extracted_data)
    assert len(findings) >= 2

    battery_finding = next((f for f in findings if f.category == "Specifications"), None)
    assert battery_finding is not None
    assert battery_finding.severity == AdvertisementSeverity.RED
    assert battery_finding.status == "Contradicted"
    assert "7 days" in battery_finding.original_claim
    assert "5 days" in battery_finding.explanation
    assert battery_finding.evidence is not None
    assert battery_finding.evidence.version == "v3.2"
    assert battery_finding.evidence.page_number == 4

@pytest.mark.asyncio
async def test_fact_guardian_flags_unverifiable_when_evidence_missing():
    """Verify Fact Guardian returns UNVERIFIABLE without hallucinating when metric is not in Hub."""
    org_id = "org_without_knowledge"
    ad_text = "Nebula Z9 featuring 14 days of battery life."
    extracted_data = {
        "specifications": {"battery_life": "14 days battery life"}, # Not in Hub
        "candidate_claims": [ad_text],
    }

    findings = await FactGuardian.audit(org_id, ad_text, extracted_data)
    unv = next((f for f in findings if f.status == "UNVERIFIABLE"), None)
    assert unv is not None
    assert unv.is_unverifiable is True
    assert unv.severity == AdvertisementSeverity.YELLOW

@pytest.mark.asyncio
async def test_voice_guardian_detects_tone_drift():
    """Verify Voice Guardian flags clickbait, abrasive language, and screaming caps."""
    org_id = "test_org_guardians"
    ad_text = "Crazy cheap deals! Buy now or regret forever! UNBEATABLE OFFERS!!!"
    extracted_data = {"candidate_claims": [ad_text]}

    findings = await VoiceGuardian.audit(org_id, ad_text, extracted_data)
    drift_findings = [f for f in findings if f.status == "ToneDrift"]
    assert len(drift_findings) >= 1
    assert any("Abrasive" in f.explanation or "Aggressive" in f.explanation for f in drift_findings)

@pytest.mark.asyncio
async def test_terminology_guardian_catches_prohibited_tokens():
    """Verify Terminology Guardian catches unapproved colloquialisms and suggests approved alternatives."""
    await seed_test_org_facts()
    org_id = "test_org_guardians"
    ad_text = "Crafted with our revolutionary eco-magic chassis and unbreakable glass."
    extracted_data = {"candidate_claims": [ad_text]}

    findings = await TerminologyGuardian.audit(org_id, ad_text, extracted_data)
    prohibited = [f for f in findings if f.status == "ProhibitedToken"]
    assert len(prohibited) >= 1
    
    eco_finding = next((f for f in prohibited if "eco-magic chassis" in f.original_claim.lower()), None)
    assert eco_finding is not None
    assert "UltraGlide Recycled Alloy" in eco_finding.suggested_correction

@pytest.mark.asyncio
async def test_claims_guardian_flags_unsubstantiated_superlatives():
    """Verify Claims Guardian flags unbacked superlatives for mandatory legal escalation."""
    org_id = "test_org_guardians"
    ad_text = "Aurora X2 features the fastest sensor on earth and is 100% unbreakable."
    extracted_data = {"candidate_claims": [ad_text]}

    findings = await ClaimsGuardian.audit(org_id, ad_text, extracted_data)
    unsubstantiated = [f for f in findings if f.status == "Unsubstantiated"]
    assert len(unsubstantiated) >= 1
    assert unsubstantiated[0].severity == AdvertisementSeverity.RED

@pytest.mark.asyncio
async def test_visual_guardian_calculates_delta_e_color_drift():
    """Verify Visual Guardian calculates CIELAB Delta-E distance and detects off-palette colors."""
    org_id = "test_org_guardians"
    ad_text = "Visual test"
    # Off-palette accent #00FFFF (cyan) vs approved #A0C0D0 (Glacial Ice Blue)
    extracted_data = {
        "visual_metadata": {
            "extracted_colors": ["#050707", "#70B0FF"], # Drifted color
            "aspect_ratio": 1.78,
            "contrast_ratio": 7.5
        }
    }

    findings = await VisualGuardian.audit(org_id, ad_text, extracted_data)
    drift = next((f for f in findings if f.status == "HexDrift"), None)
    assert drift is not None
    assert "Delta-E" in drift.explanation

@pytest.mark.asyncio
async def test_accessibility_guardian_catches_wcag_contrast_failures():
    """Verify Accessibility Guardian flags contrast ratios under 4.5:1."""
    org_id = "test_org_guardians"
    ad_text = "Accessible copy test."
    extracted_data = {
        "visual_metadata": {
            "contrast_ratio": 2.8, # Severe violation (< 3:1)
            "extracted_colors": ["#444444", "#555555"]
        }
    }

    findings = await AccessibilityGuardian.audit(org_id, ad_text, extracted_data)
    contrast_f = next((f for f in findings if f.status == "ContrastViolation"), None)
    assert contrast_f is not None
    assert contrast_f.severity == AdvertisementSeverity.RED

@pytest.mark.asyncio
async def test_arbiter_orchestration_and_conflict_resolution():
    """Verify Risk Arbiter executes all 6 guardians concurrently, deduplicates, and assigns overall RED."""
    await seed_test_org_facts()
    org_id = "test_org_guardians"
    ad_text = "Aurora X2 with 7 days battery life, crazy cheap deals, and eco-magic chassis."
    extracted_data = {
        "specifications": {"battery_life": "7 days battery life"},
        "candidate_claims": [ad_text],
        "visual_metadata": {"contrast_ratio": 6.8, "extracted_colors": ["#050707", "#A0C0D0"]}
    }

    report = await RiskArbiter.evaluate_advertisement(
        organization_id=org_id,
        advertisement_id="ad-test-01",
        ad_text=ad_text,
        extracted_data=extracted_data
    )

    assert report.overall_severity == AdvertisementSeverity.RED
    assert report.risk_score >= 70.0
    assert report.red_count >= 1
    assert report.total_findings >= 3
    assert "AUDIT FAILED (CRITICAL)" in report.summary
    assert len(report.agent_metrics) == 6
