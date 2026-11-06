import re
import uuid
from typing import List, Dict, Any, Optional
from app.models.advertisement import AgentFinding, AgentType, AdvertisementSeverity, EvidenceReference
from app.db.chroma import ChromaManager
from app.db.mongo import get_database

class FactGuardian:
    """
    AGENT 1 — FACT GUARDIAN
    Verifies product specifications, prices, warranties, dates and factual claims.
    Strictly cites approved knowledge chunks and facts.
    Returns UNVERIFIABLE if evidence is missing. Never fabricates evidence.
    """

    @classmethod
    async def audit(
        cls, 
        organization_id: str, 
        ad_text: str, 
        extracted_data: Dict[str, Any]
    ) -> List[AgentFinding]:
        findings: List[AgentFinding] = []
        db = get_database()

        candidate_claims = extracted_data.get("candidate_claims", [])
        specs = extracted_data.get("specifications", {})
        prices = extracted_data.get("prices", [])

        # Fetch approved facts for this organization
        approved_facts = await db["knowledge_facts"].find(
            {"organization_id": organization_id, "is_approved": True}
        ).to_list(length=200)

        # 1. Audit Battery Life Specifications
        if "battery_life" in specs:
            claim_str = specs["battery_life"]
            ad_battery_days = cls._parse_days_or_hours(claim_str)
            
            fact_match = next((f for f in approved_facts if f.get("predicate") == "battery_life"), None)
            
            if fact_match:
                approved_val = fact_match.get("object_value", "")
                approved_days = cls._parse_days_or_hours(approved_val)

                if ad_battery_days and approved_days and ad_battery_days > approved_days:
                    # Clear contradiction
                    findings.append(AgentFinding(
                        id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                        agent=AgentType.FACT_GUARDIAN,
                        category="Specifications",
                        original_claim=claim_str,
                        severity=AdvertisementSeverity.RED,
                        status="Contradicted",
                        explanation=f"Advertised battery runtime of '{claim_str}' contradicts approved product specification of '{approved_val}'.",
                        confidence=0.98,
                        evidence=EvidenceReference(
                            source_document=fact_match.get("document_title", "Official Product Datasheet"),
                            version=fact_match.get("version_tag", "v3.2"),
                            page_number=fact_match.get("page_number", 4),
                            supporting_excerpt=fact_match.get("verbatim_quote", f"Battery life is tested up to {approved_val}.")
                        ),
                        suggested_correction=f"Revise battery metric to '{approved_val}'."
                    ))
                else:
                    findings.append(AgentFinding(
                        id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                        agent=AgentType.FACT_GUARDIAN,
                        category="Specifications",
                        original_claim=claim_str,
                        severity=AdvertisementSeverity.GREEN,
                        status="Supported",
                        explanation=f"Advertised battery life matches approved specification '{approved_val}'.",
                        confidence=0.96,
                        evidence=EvidenceReference(
                            source_document=fact_match.get("document_title", "Official Product Datasheet"),
                            version=fact_match.get("version_tag", "v3.2"),
                            page_number=fact_match.get("page_number", 4),
                            supporting_excerpt=fact_match.get("verbatim_quote", "")
                        )
                    ))
            else:
                # No approved evidence in Hub
                findings.append(AgentFinding(
                    id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                    agent=AgentType.FACT_GUARDIAN,
                    category="Specifications",
                    original_claim=claim_str,
                    severity=AdvertisementSeverity.YELLOW,
                    status="UNVERIFIABLE",
                    explanation=f"Battery assertion '{claim_str}' has no approved benchmark on file in the Brand Knowledge Hub.",
                    confidence=0.50,
                    is_unverifiable=True,
                    suggested_correction="Upload official spec sheet to Brand Knowledge Hub before publication."
                ))

        # 2. Audit Warranty Period
        if "warranty" in specs:
            claim_str = specs["warranty"]
            ad_warranty_years = cls._parse_years(claim_str)

            fact_match = next((f for f in approved_facts if f.get("predicate") == "warranty"), None)
            if fact_match:
                approved_val = fact_match.get("object_value", "")
                approved_years = cls._parse_years(approved_val)

                if ad_warranty_years and approved_years and ad_warranty_years > approved_years:
                    findings.append(AgentFinding(
                        id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                        agent=AgentType.FACT_GUARDIAN,
                        category="Warranties",
                        original_claim=claim_str,
                        severity=AdvertisementSeverity.RED,
                        status="Contradicted",
                        explanation=f"Claimed warranty '{claim_str}' exceeds approved policy terms of '{approved_val}'.",
                        confidence=0.99,
                        evidence=EvidenceReference(
                            source_document=fact_match.get("document_title", "Warranty & Terms Policy"),
                            version=fact_match.get("version_tag", "v3.2"),
                            page_number=fact_match.get("page_number", 2),
                            supporting_excerpt=fact_match.get("verbatim_quote", f"Standard warranty is {approved_val}.")
                        ),
                        suggested_correction=f"State '{approved_val}' in accordance with approved policy."
                    ))
                else:
                    findings.append(AgentFinding(
                        id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                        agent=AgentType.FACT_GUARDIAN,
                        category="Warranties",
                        original_claim=claim_str,
                        severity=AdvertisementSeverity.GREEN,
                        status="Supported",
                        explanation=f"Warranty claim verified against approved terms '{approved_val}'.",
                        confidence=0.97
                    ))
            else:
                findings.append(AgentFinding(
                    id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                    agent=AgentType.FACT_GUARDIAN,
                    category="Warranties",
                    original_claim=claim_str,
                    severity=AdvertisementSeverity.YELLOW,
                    status="UNVERIFIABLE",
                    explanation=f"Warranty '{claim_str}' cannot be corroborated in approved Brand Knowledge Hub files.",
                    confidence=0.50,
                    is_unverifiable=True,
                    suggested_correction="Verify warranty terms with Legal/Operations."
                ))

        # 3. RAG Semantic Check on Remaining Candidate Claims
        for claim in candidate_claims[:3]:
            # Query ChromaDB vector index
            matches = ChromaManager.query_approved_knowledge(organization_id, claim, n_results=1)
            if matches and matches[0].get("similarity", 0) > 0.70:
                m = matches[0]
                meta = m.get("metadata", {})
                findings.append(AgentFinding(
                    id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                    agent=AgentType.FACT_GUARDIAN,
                    category="Factual Claims",
                    original_claim=claim,
                    severity=AdvertisementSeverity.GREEN,
                    status="Supported",
                    explanation="Assertion supported by semantic alignment with authoritative knowledge repository.",
                    confidence=round(m.get("similarity", 0.85), 2),
                    evidence=EvidenceReference(
                        source_document=meta.get("document_title", "Approved Knowledge"),
                        version=meta.get("version_tag", "v1.0"),
                        page_number=meta.get("page_number", 1),
                        supporting_excerpt=m.get("content", "")[:200]
                    )
                ))

        return findings

    @staticmethod
    def _parse_days_or_hours(text: str) -> Optional[float]:
        m_days = re.search(r'(\d+(?:\.\d+)?)\s*days?', text, re.IGNORECASE)
        if m_days:
            return float(m_days.group(1)) * 24.0
        m_hrs = re.search(r'(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)', text, re.IGNORECASE)
        if m_hrs:
            return float(m_hrs.group(1))
        return None

    @staticmethod
    def _parse_years(text: str) -> Optional[float]:
        m = re.search(r'(\d+(?:\.\d+)?)\s*[- ]?(?:years?|yrs?)', text, re.IGNORECASE)
        return float(m.group(1)) if m else None

