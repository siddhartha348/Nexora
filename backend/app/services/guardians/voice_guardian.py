import re
import uuid
from typing import List, Dict, Any
from app.models.advertisement import AgentFinding, AgentType, AdvertisementSeverity

class VoiceGuardian:
    """
    AGENT 2 — VOICE GUARDIAN
    Audits brand tone, personality, communication style and consistency.
    Detects colloquialisms, aggressive clickbait, abrasive language, and tone drift.
    """

    TONE_FLAGS = [
        (r'\b(crazy\s+cheap|insanely\s+low|dirt\s+cheap)\b', "Abrasive colloquial pricing rhetoric", "Exceptional value offerings"),
        (r'\b(buy\s+now\s+or\s+regret|don\'t\s+miss\s+out\s+loser)\b', "Aggressive high-pressure sales pitch", "Discover our current collection"),
        (r'\b(miracle\s+cure|magic\s+solution)\b', "Unsubstantiated hyperbole in tone", "Engineered for proven reliability"),
        (r'!{2,}', "Excessive punctuation / aggressive exclamation", "Single refined period"),
        (r'\b[A-Z]{4,}\b', "Screaming uppercase text", "Title Case or Sentence case"),
    ]

    @classmethod
    async def audit(
        cls, 
        organization_id: str, 
        ad_text: str, 
        extracted_data: Dict[str, Any]
    ) -> List[AgentFinding]:
        findings: List[AgentFinding] = []

        for pattern, explanation, suggestion in cls.TONE_FLAGS:
            match = re.search(pattern, ad_text, re.IGNORECASE)
            if match:
                matched_token = match.group(0)
                findings.append(AgentFinding(
                    id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                    agent=AgentType.VOICE_GUARDIAN,
                    category="Tone & Personality",
                    original_claim=matched_token,
                    severity=AdvertisementSeverity.YELLOW,
                    status="ToneDrift",
                    explanation=f"{explanation}: '{matched_token}' violates premium brand editorial voice.",
                    confidence=0.88,
                    suggested_correction=f"Replace with '{suggestion}' to maintain brand elegance."
                ))

        if not findings:
            findings.append(AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.VOICE_GUARDIAN,
                category="Tone & Personality",
                original_claim=ad_text[:60] + "..." if len(ad_text) > 60 else ad_text,
                severity=AdvertisementSeverity.GREEN,
                status="Aligned",
                explanation="Voice and editorial tone adhere to approved brand guidelines.",
                confidence=0.92
            ))

        return findings

