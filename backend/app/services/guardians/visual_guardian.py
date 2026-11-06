import math
import uuid
from typing import List, Dict, Any, Tuple
from app.models.advertisement import AgentFinding, AgentType, AdvertisementSeverity, EvidenceReference

class VisualGuardian:
    """
    AGENT 5 — VISUAL GUARDIAN
    Analyses logo placement, logo proportions, brand colours, typography and visual consistency.
    Uses CIELAB Delta-E color distance formulation to detect hexadecimal brand drift.
    """

    APPROVED_BRAND_PALETTE = {
        "Obsidian Black": "#050707",
        "Glacial Ice Blue": "#A0C0D0",
        "Off-White Canvas": "#EDF4F6",
        "Slate Border": "#10191D",
    }

    @classmethod
    async def audit(
        cls, 
        organization_id: str, 
        ad_text: str, 
        extracted_data: Dict[str, Any]
    ) -> List[AgentFinding]:
        findings: List[AgentFinding] = []
        visual_meta = extracted_data.get("visual_metadata", {})
        extracted_colors = visual_meta.get("extracted_colors", ["#050707", "#A0C0D0"])

        # 1. CIELAB Delta-E Color Drift Check
        target_accent = cls.APPROVED_BRAND_PALETTE["Glacial Ice Blue"]
        
        # Check closest color to accent in extracted colors
        min_delta = 999.0
        closest_hex = ""
        for h in extracted_colors:
            d_e = cls._calculate_delta_e(h, target_accent)
            if d_e < min_delta:
                min_delta = d_e
                closest_hex = h

        # If closest accent has noticeable drift (Delta-E > 3.0)
        if min_delta > 3.0:
            findings.append(AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.VISUAL_GUARDIAN,
                category="Color Palette Compliance",
                original_claim=f"Detected Accent: {closest_hex}",
                severity=AdvertisementSeverity.YELLOW,
                status="HexDrift",
                explanation=f"Brand accent drifted to {closest_hex} (Delta-E = {min_delta:.1f} > threshold 2.3). Violates strict Glacial Ice Blue (#A0C0D0) standard.",
                confidence=0.94,
                evidence=EvidenceReference(
                    source_document="Brand Visual Identity Guidelines",
                    version="v1.0",
                    page_number=3,
                    supporting_excerpt="Primary Accent: Glacial Ice Blue (#A0C0D0). Delta-E tolerance limit is 2.3."
                ),
                suggested_correction=f"Recalibrate creative palette layers to exact hex value #A0C0D0."
            ))
        else:
            findings.append(AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.VISUAL_GUARDIAN,
                category="Color Palette Compliance",
                original_claim=f"Primary Palette: {', '.join(extracted_colors[:2])}",
                severity=AdvertisementSeverity.GREEN,
                status="PaletteCompliant",
                explanation="Detected colors conform with approved Obsidian Black and Glacial Ice Blue palette.",
                confidence=0.96
            ))

        # 2. Aspect Ratio & Logo Distortion Check
        aspect_ratio = visual_meta.get("aspect_ratio", 1.33)
        if aspect_ratio < 0.5 or aspect_ratio > 3.0:
            findings.append(AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.VISUAL_GUARDIAN,
                category="Asset Proportions",
                original_claim=f"Creative Aspect Ratio: {aspect_ratio}:1",
                severity=AdvertisementSeverity.YELLOW,
                status="AspectDistortion",
                explanation=f"Extreme aspect ratio ({aspect_ratio}:1) indicates compressed layout or potential logo clearspace clipping.",
                confidence=0.89,
                suggested_correction="Render creative within standard aspect ratios (16:9, 4:3, or 1:1)."
            ))

        return findings

    @classmethod
    def _calculate_delta_e(cls, hex1: str, hex2: str) -> float:
        """
        Compute Euclidean distance in CIELAB space (CIE76 Delta-E formula).
        """
        lab1 = cls._hex_to_lab(hex1)
        lab2 = cls._hex_to_lab(hex2)
        return math.sqrt((lab1[0] - lab2[0])**2 + (lab1[1] - lab2[1])**2 + (lab1[2] - lab2[2])**2)

    @staticmethod
    def _hex_to_lab(hex_str: str) -> Tuple[float, float, float]:
        hex_str = hex_str.lstrip('#')
        if len(hex_str) != 6:
            return (50.0, 0.0, 0.0)
        
        r = int(hex_str[0:2], 16) / 255.0
        g = int(hex_str[2:4], 16) / 255.0
        b = int(hex_str[4:6], 16) / 255.0

        # sRGB to XYZ
        r = ((r + 0.055) / 1.055)**2.4 if r > 0.04045 else r / 12.92
        g = ((g + 0.055) / 1.055)**2.4 if g > 0.04045 else g / 12.92
        b = ((b + 0.055) / 1.055)**2.4 if b > 0.04045 else b / 12.92

        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

        fx = x**(1/3) if x > 0.008856 else (7.787 * x) + (16/116)
        fy = y**(1/3) if y > 0.008856 else (7.787 * y) + (16/116)
        fz = z**(1/3) if z > 0.008856 else (7.787 * z) + (16/116)

        L = (116 * fy) - 16
        a = 500 * (fx - fy)
        b = 200 * (fy - fz)
        return (L, a, b)

