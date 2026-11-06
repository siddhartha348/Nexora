from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
from app.models.auth import UserProfileResponse, UserRole
from app.api.deps import get_current_user, require_roles
from app.db.mongo import db_manager

router = APIRouter(prefix="/registry", tags=["Advertisement Registry"])

class UpdateAdStatusRequest(BaseModel):
    status: str
    channel: Optional[str] = None
    notes: Optional[str] = None

@router.get("")
async def list_registered_advertisements(
    status_filter: Optional[str] = Query(None, alias="status"),
    channel: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserProfileResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    List registered advertisements in the organization's governance inventory
    with multi-parameter filtering and status counts.
    """
    db = db_manager.get_db()
    org_id = current_user.organization_id

    # Base query scoped strictly to tenant
    query: Dict[str, Any] = {"organization_id": org_id}

    if status_filter and status_filter.upper() != "ALL":
        query["approval_status"] = status_filter.upper()
    if channel and channel.upper() != "ALL":
        query["channel"] = channel
    if severity and severity.upper() != "ALL":
        query["overall_severity"] = severity.upper()

    cursor = db["advertisements"].find(query).sort("updated_at", -1).limit(limit)
    ads = await cursor.to_list(length=limit)

    for ad in ads:
        ad.pop("_id", None)

    # In-memory text search if requested
    if search and search.strip():
        q = search.strip().lower()
        ads = [
            a for a in ads 
            if q in a.get("title", "").lower() 
            or q in a.get("channel", "").lower()
            or q in a.get("id", "").lower()
        ]

    # Aggregate status counts for UI tabs
    all_ads_cursor = db["advertisements"].find({"organization_id": org_id})
    all_ads = await all_ads_cursor.to_list(length=500)
    
    status_counts = {
        "ALL": len(all_ads),
        "DRAFT": 0,
        "UNDER_REVIEW": 0,
        "CHANGES_REQUESTED": 0,
        "APPROVED": 0,
        "REJECTED": 0,
        "RECALLED": 0,
        "PUBLISHED": 0,
    }
    for a in all_ads:
        st = a.get("approval_status", "DRAFT").upper()
        if st in status_counts:
            status_counts[st] += 1

    return {
        "advertisements": ads,
        "total_count": len(ads),
        "status_counts": status_counts
    }

@router.get("/{ad_id}")
async def get_registered_advertisement(
    ad_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieve full metadata, linked knowledge versions, report, and review for an advertisement.
    """
    db = db_manager.get_db()
    ad = await db["advertisements"].find_one({
        "id": ad_id,
        "organization_id": current_user.organization_id
    })
    if not ad:
        raise HTTPException(status_code=404, detail="Advertisement not found in registry")
    
    ad.pop("_id", None)

    # Attach consolidated report if available
    report = await db["consolidated_reports"].find_one({
        "advertisement_id": ad_id
    }) or await db["advertisement_reports"].find_one({
        "advertisement_id": ad_id
    })
    if report:
        report.pop("_id", None)
        ad["report"] = report

    # Attach human review record if exists
    review = await db["advertisement_reviews"].find_one({
        "advertisement_id": ad_id,
        "organization_id": current_user.organization_id
    })
    if review:
        review.pop("_id", None)
        ad["review"] = review

    return ad

@router.patch("/{ad_id}/status")
async def update_advertisement_status(
    ad_id: str,
    req: UpdateAdStatusRequest,
    current_user: UserProfileResponse = Depends(require_roles([UserRole.ADMIN, UserRole.APPROVER]))
) -> Dict[str, Any]:
    """
    Update advertisement lifecycle status (e.g. mark PUBLISHED, ARCHIVED, or RECALLED).
    Requires APPROVER or ADMIN role.
    """
    db = db_manager.get_db()
    now = datetime.now(timezone.utc).isoformat()
    
    update_data: Dict[str, Any] = {
        "approval_status": req.status.upper(),
        "updated_at": now
    }
    if req.channel:
        update_data["channel"] = req.channel

    result = await db["advertisements"].update_one(
        {"id": ad_id, "organization_id": current_user.organization_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Advertisement not found")

    return {
        "message": f"Advertisement status updated to {req.status.upper()}",
        "ad_id": ad_id,
        "status": req.status.upper(),
        "updated_at": now
    }

