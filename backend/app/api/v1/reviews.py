from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.models.auth import UserProfileResponse, UserRole
from app.api.deps import get_current_user, require_roles
from app.services.review_service import ReviewService
from app.models.review import (
    ResolveFindingRequest,
    AddCommentRequest,
    FinalizeReviewRequest
)

router = APIRouter(prefix="/reviews", tags=["Human Review & Brand Memory"])

@router.get("/ad/{advertisement_id}")
async def get_or_create_advertisement_review(
    advertisement_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Retrieve or initialize the human review workflow for an audited advertisement.
    """
    return await ReviewService.get_or_create_review(
        advertisement_id=advertisement_id,
        organization_id=current_user.organization_id,
        user=current_user
    )

@router.get("/{review_id}")
async def get_review_by_id(
    review_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Retrieve an existing advertisement review and its finding resolutions.
    """
    return await ReviewService.get_review_by_id(
        review_id=review_id,
        organization_id=current_user.organization_id
    )

@router.post("/{review_id}/findings/{finding_id}/resolve")
async def resolve_finding_suggestion(
    review_id: str,
    finding_id: str,
    req: ResolveFindingRequest,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Accept, reject, or edit an AI Guardian suggestion with optional reviewer rationale.
    Automatically captures precedent into the Brand Memory Engine.
    """
    return await ReviewService.resolve_finding(
        review_id=review_id,
        finding_id=finding_id,
        req=req,
        user=current_user
    )

@router.post("/{review_id}/comments")
async def add_review_comment(
    review_id: str,
    req: AddCommentRequest,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Add a general comment to the human review discussion thread.
    """
    return await ReviewService.add_comment(
        review_id=review_id,
        comment=req.comment,
        user=current_user
    )

@router.post("/{review_id}/finalize")
async def finalize_advertisement_review(
    review_id: str,
    req: FinalizeReviewRequest,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Make final approval or rejection decision. Enforces strict RBAC:
    - APPROVE / REJECT: APPROVER or ADMIN only.
    - CHANGES_REQUESTED: REVIEWER, APPROVER, or ADMIN.
    """
    return await ReviewService.finalize_review(
        review_id=review_id,
        req=req,
        user=current_user
    )

@router.get("/brand-memory/query")
async def query_brand_memory_precedents(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserProfileResponse = Depends(get_current_user)
):
    """
    Retrieve historical reviewer decisions from Brand Memory.
    Notice: Brand Memory is non-authoritative historical precedent and never overrides approved Knowledge Hub specs.
    """
    return await ReviewService.query_brand_memory(
        organization_id=current_user.organization_id,
        category=category,
        search_query=search,
        limit=limit
    )

class PromotePrecedentRequest(BaseModel):
    notes: Optional[str] = None

@router.post("/brand-memory/{entry_id}/promote-exception")
async def promote_brand_memory_precedent(
    entry_id: str,
    req: PromotePrecedentRequest = PromotePrecedentRequest(),
    current_user: UserProfileResponse = Depends(require_roles([UserRole.ADMIN]))
):
    """
    ADMIN GATE: Promote a Brand Memory review precedent to an official approved exception.
    """
    return await ReviewService.promote_precedent_to_exception(
        entry_id=entry_id,
        organization_id=current_user.organization_id,
        user=current_user,
        notes=req.notes
    )

