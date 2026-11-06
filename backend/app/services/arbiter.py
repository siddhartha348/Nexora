import asyncio
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

from app.models.advertisement import (
    AgentFinding, 
    AgentType, 
    AdvertisementSeverity, 
    ConsolidatedReport
)
from app.services.guardians.fact_guardian import FactGuardian
from app.services.guardians.voice_guardian import VoiceGuardian
from app.services.guardians.terminology_guardian import TerminologyGuardian
from app.services.guardians.claims_guardian import ClaimsGuardian
from app.services.guardians.visual_guardian import VisualGuardian
from app.services.guardians.accessibility_guardian import AccessibilityGuardian

logger = logging.getLogger(__name__)

class RiskArbiter:
    """
    Central orchestration, validation, deduplication, conflict resolution, 
    and risk synthesis engine for NEXORA's Six Specialist AI Guardians.
    """

    GUARDIAN_TIMEOUT_SECONDS = 15.0

    @classmethod
    async def evaluate_advertisement(
        cls, 
        organization_id: str, 
        advertisement_id: str, 
        ad_text: str, 
        extracted_data: Dict[str, Any]
    ) -> ConsolidatedReport:
        """
        Concurrently execute all six guardians, arbitrate results, and generate the consolidated report.
        """
        start_time = datetime.now(timezone.utc)

        # 1. Dispatch all 6 guardians concurrently via asyncio.gather
        tasks = [
            cls._safe_run_guardian("Fact Guardian", FactGuardian.audit(organization_id, ad_text, extracted_data)),
            cls._safe_run_guardian("Voice Guardian", VoiceGuardian.audit(organization_id, ad_text, extracted_data)),
            cls._safe_run_guardian("Terminology Guardian", TerminologyGuardian.audit(organization_id, ad_text, extracted_data)),
            cls._safe_run_guardian("Claims Guardian", ClaimsGuardian.audit(organization_id, ad_text, extracted_data)),
            cls._safe_run_guardian("Visual Guardian", VisualGuardian.audit(organization_id, ad_text, extracted_data)),
            cls._safe_run_guardian("Accessibility Guardian", AccessibilityGuardian.audit(organization_id, ad_text, extracted_data)),
        ]

        results = await asyncio.gather(*tasks)

        raw_findings: List[AgentFinding] = []
        agent_metrics: Dict[str, Any] = {}

        for guardian_name, guardian_findings in results:
            raw_findings.extend(guardian_findings)
            agent_metrics[guardian_name] = {
                "total": len(guardian_findings),
                "red": sum(1 for f in guardian_findings if f.severity == AdvertisementSeverity.RED),
                "yellow": sum(1 for f in guardian_findings if f.severity == AdvertisementSeverity.YELLOW),
                "green": sum(1 for f in guardian_findings if f.severity == AdvertisementSeverity.GREEN),
            }

        # 2. Deduplicate and resolve conflicts across agent findings
        deduped_findings = cls._deduplicate_and_resolve_conflicts(raw_findings)

        # 3. Categorize severities and uncertain claims
        red_count = sum(1 for f in deduped_findings if f.severity == AdvertisementSeverity.RED)
        yellow_count = sum(1 for f in deduped_findings if f.severity == AdvertisementSeverity.YELLOW)
        green_count = sum(1 for f in deduped_findings if f.severity == AdvertisementSeverity.GREEN)

        unverifiable_claims = [
            f.original_claim for f in deduped_findings if f.is_unverifiable
        ]

        # 4. Determine overall status and calculate risk score
        overall_severity, risk_score = cls._calculate_risk(red_count, yellow_count, green_count)

        # 5. Synthesize Executive Governance Summary
        summary = cls._synthesize_summary(overall_severity, red_count, yellow_count, unverifiable_claims)

        return ConsolidatedReport(
            report_id=f"REP-{uuid.uuid4().hex[:8].upper()}",
            advertisement_id=advertisement_id,
            overall_severity=overall_severity,
            risk_score=risk_score,
            summary=summary,
            total_findings=len(deduped_findings),
            red_count=red_count,
            yellow_count=yellow_count,
            green_count=green_count,
            findings=deduped_findings,
            unverifiable_claims=unverifiable_claims,
            agent_metrics=agent_metrics,
            generated_at=datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    async def _safe_run_guardian(cls, name: str, coro) -> Tuple[str, List[AgentFinding]]:
        """
        Execute guardian with strict timeout and exception encapsulation.
        """
        try:
            findings = await asyncio.wait_for(coro, timeout=cls.GUARDIAN_TIMEOUT_SECONDS)
            return (name, findings)
        except asyncio.TimeoutError:
            logger.error(f"{name} timed out after {cls.GUARDIAN_TIMEOUT_SECONDS}s.")
            return (name, [AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.FACT_GUARDIAN if "Fact" in name else AgentType.VOICE_GUARDIAN,
                category="System Anomaly",
                original_claim=name,
                severity=AdvertisementSeverity.YELLOW,
                status="AgentTimeout",
                explanation=f"{name} evaluation exceeded timeout threshold ({cls.GUARDIAN_TIMEOUT_SECONDS}s).",
                confidence=0.5,
                suggested_correction="Re-run audit or review asset manually."
            )])
        except Exception as e:
            logger.error(f"Error in {name}: {e}", exc_info=True)
            return (name, [AgentFinding(
                id=f"FND-{uuid.uuid4().hex[:6].upper()}",
                agent=AgentType.FACT_GUARDIAN if "Fact" in name else AgentType.VOICE_GUARDIAN,
                category="System Exception",
                original_claim=name,
                severity=AdvertisementSeverity.YELLOW,
                status="AgentException",
                explanation=f"Error executing {name}: {str(e)}",
                confidence=0.5,
                suggested_correction="Inspect input formatting."
            )])

    @classmethod
    def _deduplicate_and_resolve_conflicts(cls, findings: List[AgentFinding]) -> List[AgentFinding]:
        """
        Deduplicate overlapping findings and apply conservative brand conflict resolution (RED > YELLOW > GREEN).
        """
        seen: Dict[str, AgentFinding] = {}

        severity_rank = {
            AdvertisementSeverity.RED: 3,
            AdvertisementSeverity.YELLOW: 2,
            AdvertisementSeverity.GREEN: 1,
        }

        for f in findings:
            # Create a normalized signature for the finding based on category and original claim snippet
            sig = f"{f.category.lower()}:{f.original_claim.strip().lower()[:40]}"
            
            if sig not in seen:
                seen[sig] = f
            else:
                existing = seen[sig]
                # Conservative conflict resolution: Higher severity wins
                if severity_rank[f.severity] > severity_rank[existing.severity]:
                    seen[sig] = f
                elif severity_rank[f.severity] == severity_rank[existing.severity]:
                    # Higher confidence wins
                    if f.confidence > existing.confidence:
                        seen[sig] = f

        return list(seen.values())

    @classmethod
    def _calculate_risk(
        cls, 
        red_count: int, 
        yellow_count: int, 
        green_count: int
    ) -> Tuple[AdvertisementSeverity, float]:
        """
        Calculate overall status and 0-100 risk score.
        """
        if red_count > 0:
            severity = AdvertisementSeverity.RED
            # Base risk 70 + weighted calculation up to 100
            score = min(70.0 + (red_count * 10.0) + (yellow_count * 2.0), 100.0)
        elif yellow_count > 0:
            severity = AdvertisementSeverity.YELLOW
            # Base risk 25 to 65
            score = min(25.0 + (yellow_count * 8.0), 65.0)
        else:
            severity = AdvertisementSeverity.GREEN
            # Low risk 0 to 15
            score = max(5.0 - (green_count * 1.0), 0.0)

        return (severity, round(score, 1))

    @classmethod
    def _synthesize_summary(
        cls, 
        overall_severity: AdvertisementSeverity, 
        red_count: int, 
        yellow_count: int, 
        unverifiable_claims: List[str]
    ) -> str:
        if overall_severity == AdvertisementSeverity.RED:
            return (
                f"AUDIT FAILED (CRITICAL): {red_count} critical contradiction(s) or legal violation(s) detected. "
                "Creative publication is strictly blocked pending human approver review and spec correction."
            )
        elif overall_severity == AdvertisementSeverity.YELLOW:
            unv_note = f" Including {len(unverifiable_claims)} unverifiable assertion(s) with missing Hub documentation." if unverifiable_claims else ""
            return (
                f"CONDITIONAL (WARNING): {yellow_count} warning issue(s) detected.{unv_note} "
                "Reviewer sign-off is recommended prior to launch."
            )
        else:
            return (
                "AUDIT PASSED (COMPLIANT): All assertions, tone guidelines, trademarks, and visual standards "
                "are fully verified against the authoritative Brand Knowledge Hub."
            )

