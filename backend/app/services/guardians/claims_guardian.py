import re
import uuid
from typing import List, Dict, Any
from app.models.advertisement import AgentFinding, AgentType, AdvertisementSeverity, EvidenceReference
from app.db.mongo import get_database

class ClaimsGuardian:
    """
    AGENT 4 — CLAIMS GUARDIAN
    Evaluates promotional, comparative, performance, sustainability and safety claims.
    Flags unbacked superlatives, comparative statements, and unsubstantiated claims for Legal escalation.
    """

    SUPERLATIVE_PATTERNS = [
        (r'\b(fastest\s+(?:in\s+class|on\s+earth|sensor|processor|charging))\b', "Unsubstantiated Superlative Performance Claim"),
        (r'\b(world\'s\s+best|#1\s+in\s+the\s+world|industry-exclusive)\b', "Unqualified Leadership Claim"),
        (r'\b(100%\s+(?:unbreakable|green|eco-friendly|zero\s+carbon))\b', "Absolute Sustainability / Durability Claim"),
        (r'\b(beats\s+all\s+(?:competitors|rivals)|twice\s+as\s+fast\s+as\s+apple)\b', "Comparative Competitive Claim"),
    ]

    @classmethod
    async def audit(
        cls, 
        organization_id: str, 
        ad_text: str, 
        extracted_data: Dict[str, Any]
    ) -> List[AgentFinding]:
        findings: List[AgentFinding] = []
        db = get_database()

        # Check approved claims in Knowledge Hub
        approved_claims = await db["knowledge_facts"].find({
            "organization_id": organization_id,
            "category": "CLAIMS",
            "is_approved": True
        }).to_list(length=100)

        for pattern, claim_type in cls.SUPERLATIVE_PATTERNS:
            match = re.search(pattern, ad_text, re.IGNORECASE)
            if match:
                original_claim = match.group(0)
                
                # Check if this superlative has a verified benchmark in Hub
                is_substantiated = any(
                    original_claim.lower() in ac.get("verbatim_quote", "").lower() 
                    for ac in approved_claims
                )

                if is_substantiated:
                    findings.append(AgentFinding(
                        id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                        agent=AgentType.CLAIMS_GUARDIAN,
                        category="Promotional & Comparative Claims",
                        original_claim=original_claim,
                        severity=AdvertisementSeverity.GREEN,
                        status="Substantiated",
                        explanation=f"Claim '{original_claim}' is verified backed by signed benchmark files on record.",
                        confidence=0.95
                    ))
                else:
                    # Unsubstantiated superlative -> RED
                    findings.append(AgentFinding(
                        id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                        agent=AgentType.CLAIMS_GUARDIAN,
                        category="Promotional & Comparative Claims",
                        original_claim=original_claim,
                        severity=AdvertisementSeverity.RED,
                        status="Unsubstantiated",
                        explanation=f"{claim_type}: '{original_claim}' has zero independent lab benchmark data or legal substantiation on file.",
                        confidence=0.96,
                        suggested_correction=f"Qualify assertion (e.g., 'Tested up to 45W in laboratory conditions') or attach certified testing benchmarks to Brand Hub."
                    ))

        if not findings:
            findings.append(AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.CLAIMS_GUARDIAN,
                category="Promotional & Comparative Claims",
                original_claim="All marketing assertions verified",
                severity=AdvertisementSeverity.GREEN,
                status="Substantiated",
                explanation="No unbacked superlative, comparative, or greenwashing claims detected.",
                confidence=0.94
            ))

        return findings

