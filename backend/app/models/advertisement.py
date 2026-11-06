from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class AdvertisementSeverity(str, Enum):
    RED = "RED"          # Critical contradiction or legal violation
    YELLOW = "YELLOW"    # Warning, tone drift, or unverified assertion
    GREEN = "GREEN"      # No critical issue detected / compliant

class AgentType(str, Enum):
    FACT_GUARDIAN = "Fact Guardian"
    VOICE_GUARDIAN = "Voice Guardian"
    TERMINOLOGY_GUARDIAN = "Terminology Guardian"
    CLAIMS_GUARDIAN = "Claims Guardian"
    VISUAL_GUARDIAN = "Visual Guardian"
    ACCESSIBILITY_GUARDIAN = "Accessibility Guardian"

class JobStatus(str, Enum):
    PENDING = "PENDING"
    EXTRACTING = "EXTRACTING"
    REVIEWING = "REVIEWING"
    CONSOLIDATING = "CONSOLIDATING"
    AUDITING = "AUDITING" # Alias for backward compatibility
    COMPLETED = "COMPLETED"
    READY = "READY"       # Alias for COMPLETED
    FAILED = "FAILED"

class EvidenceReference(BaseModel):
    source_document: str = Field(..., description="Title of the approved source document")
    version: str = Field(..., description="Document version tag, e.g. v3.2")
    page_number: int = Field(default=1, description="Page number of the citation")
    supporting_excerpt: str = Field(..., description="Verbatim approved quote from authoritative knowledge")

class AgentFinding(BaseModel):
    id: str = Field(..., description="Unique finding ID, e.g. FND-001")
    agent: AgentType
    category: str = Field(..., description="Audit category (e.g. Specifications, Pricing, Trademarks, Contrast)")
    original_claim: str = Field(..., description="Excerpt or element from the advertisement creative")
    severity: AdvertisementSeverity
    status: str = Field(..., description="Domain classification (Contradicted, Supported, ProhibitedToken, etc.)")
    explanation: str = Field(..., description="Clear explanation of the finding and reason for flag")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score")
    evidence: Optional[EvidenceReference] = None
    suggested_correction: Optional[str] = None
    is_unverifiable: bool = False

class ConsolidatedReport(BaseModel):
    report_id: str
    advertisement_id: str
    overall_severity: AdvertisementSeverity
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Calculated brand risk score 0 to 100")
    summary: str
    total_findings: int
    red_count: int
    yellow_count: int
    green_count: int
    findings: List[AgentFinding]
    unverifiable_claims: List[str] = []
    agent_metrics: Dict[str, Any] = {}
    generated_at: str

class AdvertisementJob(BaseModel):
    id: str
    organization_id: str
    title: str
    source_type: str  # FILE or URL
    file_type: Optional[str] = None
    file_path: Optional[str] = None
    target_url: Optional[str] = None
    status: JobStatus = JobStatus.PENDING
    progress: int = 0
    created_at: str
    completed_at: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    report: Optional[ConsolidatedReport] = None
    error_message: Optional[str] = None

