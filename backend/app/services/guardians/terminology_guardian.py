import re
import uuid
from typing import List, Dict, Any
from app.models.advertisement import AgentFinding, AgentType, AdvertisementSeverity, EvidenceReference
from app.db.mongo import get_database

class TerminologyGuardian:
    """
    AGENT 3 — TERMINOLOGY GUARDIAN
    Identifies incorrect product names, restricted terminology and unapproved wording.
    Enforces canonical brand trademarks and approved glossaries.
    """

    DEFAULT_PROHIBITED_TERMS = [
        ("eco-magic chassis", "UltraGlide Recycled Alloy", "Terminology Registry v2.1: Informal colloquialism prohibited in public creatives."),
        ("unbreakable", "Impact-Resistant Engineered Alloy", "Absolute durability guarantees are strictly forbidden without legal indemnity."),
        ("cheap", "Accessible / Value-Oriented", "Brand style guide forbids 'cheap' in product positioning."),
        ("guaranteed 100%", "Engineered for high dependability", "Unqualified 100% guarantees violate trade compliance standards."),
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

        # Fetch custom terminology facts from Hub
        custom_terms = await db["knowledge_facts"].find({
            "organization_id": organization_id,
            "category": "TERMINOLOGY",
            "is_approved": True
        }).to_list(length=100)

        # Check default + custom prohibited terms
        all_rules = list(cls.DEFAULT_PROHIBITED_TERMS)
        for ct in custom_terms:
            subj = ct.get("subject", "").lower()
            obj = ct.get("object_value", "")
            if subj and obj:
                all_rules.append((subj, obj, f"Brand Hub Terminology Guide: Use '{obj}' instead of '{subj}'."))

        for term, approved_alt, reason in all_rules:
            pattern = re.compile(rf'\b{re.escape(term)}\b', re.IGNORECASE)
            match = pattern.search(ad_text)
            if match:
                matched_token = match.group(0)
                findings.append(AgentFinding(
                    id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                    agent=AgentType.TERMINOLOGY_GUARDIAN,
                    category="Restricted Terminology",
                    original_claim=matched_token,
                    severity=AdvertisementSeverity.YELLOW,
                    status="ProhibitedToken",
                    explanation=f"Prohibited nomenclature '{matched_token}' detected. {reason}",
                    confidence=1.0,
                    evidence=EvidenceReference(
                        source_document="Terminology & Trademark Guide",
                        version="v2.1",
                        page_number=1,
                        supporting_excerpt=f"Prohibited Term: '{term}' -> Canonical Term: '{approved_alt}'"
                    ),
                    suggested_correction=f"Replace '{matched_token}' with canonical approved term '{approved_alt}'."
                ))

        if not findings:
            findings.append(AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.TERMINOLOGY_GUARDIAN,
                category="Restricted Terminology",
                original_claim="All nomenclature verified",
                severity=AdvertisementSeverity.GREEN,
                status="ApprovedAlternative",
                explanation="No restricted or prohibited brand nomenclature detected in creative.",
                confidence=0.95
            ))

        return findings

