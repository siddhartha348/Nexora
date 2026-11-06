from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class FindingDecisionType(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EDITED = "EDITED"

class ReviewDecisionStatus(str, Enum):
    UNDER_REVIEW = "UNDER_REVIEW"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ReviewComment(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_role: str
    comment: str
    created_at: str

class FindingResolution(BaseModel):
    finding_id: str
    decision: FindingDecisionType = FindingDecisionType.PENDING
    custom_replacement: Optional[str] = None
    reviewer_comment: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[str] = None

class ResolveFindingRequest(BaseModel):
    decision: FindingDecisionType
    custom_replacement: Optional[str] = None
    comment: Optional[str] = None

class AddCommentRequest(BaseModel):
    comment: str

class FinalizeReviewRequest(BaseModel):
    decision: ReviewDecisionStatus # APPROVED, REJECTED, CHANGES_REQUESTED
    comment: Optional[str] = None

class AdvertisementReview(BaseModel):
    id: str
    organization_id: str
    advertisement_id: str
    report_id: str
    advertisement_title: str
    overall_risk: str # RED, YELLOW, GREEN
    status: ReviewDecisionStatus = ReviewDecisionStatus.UNDER_REVIEW
    original_content: str
    proposed_content: str
    finding_resolutions: Dict[str, FindingResolution] = {}
    general_comments: List[ReviewComment] = []
    final_decision: Optional[ReviewDecisionStatus] = None
    final_decision_by: Optional[str] = None
    final_decision_by_name: Optional[str] = None
    final_decision_at: Optional[str] = None
    created_at: str
    updated_at: str

class BrandMemoryEntry(BaseModel):
    id: str
    organization_id: str
    product_name: Optional[str] = None
    category: str
    finding_agent: str
    original_text: str
    decision: FindingDecisionType
    suggested_correction: Optional[str] = None
    final_replacement: Optional[str] = None
    reviewer_comment: Optional[str] = None
    context: Dict[str, Any] = {}
    created_at: str
    created_by: str
    created_by_name: str
    is_official_policy: bool = False # Brand memory never overrides official policy

