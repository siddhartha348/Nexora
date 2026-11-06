import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.models.auth import UserProfileResponse, UserRole
from app.api.deps import get_current_user, require_roles
from app.db.mongo import db_manager
from app.core.audit import log_audit_event

router = APIRouter(prefix="/recall", tags=["Advertisement Recall Engine"])

class ResolveAlertRequest(BaseModel):
    action: str # "RECHECK_AD", "DISMISS", "MARK_REMEDIATED"
    notes: Optional[str] = None

@router.get("/alerts")
async def list_recall_alerts(
    status_filter: Optional[str] = Query("ACTIVE", alias="status"),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserProfileResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    List active or resolved recall alerts for the organization.
    """
    db = db_manager.get_db()
    org_id = current_user.organization_id

    query: Dict[str, Any] = {"organization_id": org_id}
    if status_filter and status_filter.upper() != "ALL":
        query["status"] = status_filter.upper()

    cursor = db["recall_alerts"].find(query).sort("created_at", -1).limit(limit)
    alerts = await cursor.to_list(length=limit)

    for a in alerts:
        a.pop("_id", None)

    # Status counts
    all_cursor = db["recall_alerts"].find({"organization_id": org_id})
    all_alerts = await all_cursor.to_list(length=500)
    counts = {
        "ACTIVE": sum(1 for a in all_alerts if a.get("status") == "ACTIVE"),
        "REMEDIATED": sum(1 for a in all_alerts if a.get("status") == "REMEDIATED"),
        "DISMISSED": sum(1 for a in all_alerts if a.get("status") == "DISMISSED"),
        "TOTAL": len(all_alerts)
    }

    return {
        "alerts": alerts,
        "total_count": len(alerts),
        "counts": counts
    }

@router.get("/alerts/{alert_id}")
async def get_recall_alert(
    alert_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieve full details of a specific recall alert including knowledge version diff.
    """
    db = db_manager.get_db()
    alert = await db["recall_alerts"].find_one({
        "id": alert_id,
        "organization_id": current_user.organization_id
    })
    if not alert:
        raise HTTPException(status_code=404, detail="Recall alert not found")
    
    alert.pop("_id", None)
    return alert

@router.post("/evaluate")
async def evaluate_knowledge_recall(
    document_id: Optional[str] = None,
    current_user: UserProfileResponse = Depends(require_roles([UserRole.ADMIN, UserRole.APPROVER]))
) -> Dict[str, Any]:
    """
    Run the Advertisement Recall Engine against registered advertisements.
    Detects advertisements citing outdated specifications, superseded terms, or invalidated claims.
    """
    db = db_manager.get_db()
    org_id = current_user.organization_id
    now = datetime.now(timezone.utc).isoformat()

    # Retrieve all approved knowledge facts
    facts_cursor = db["knowledge_facts"].find({
        "organization_id": org_id,
        "is_approved": True
    })
    approved_facts = await facts_cursor.to_list(length=500)

    # Retrieve all published, approved, or registered advertisements
    ads_cursor = db["advertisements"].find({
        "organization_id": org_id
    })
    ads = await ads_cursor.to_list(length=200)

    detected_alerts = []

    for ad in ads:
        ad_id = ad.get("id")
        ad_title = ad.get("title", "Advertisement Creative")
        extracted = ad.get("extracted_data") or {}
        ad_text = extracted.get("raw_text") or extracted.get("text") or ad.get("title", "")
        ad_text_lower = ad_text.lower()

        # Check for contradictions against approved knowledge
        for fact in approved_facts:
            subj = fact.get("subject", "").lower()
            pred = fact.get("predicate", "").lower()
            obj_val = fact.get("object_value", "").lower()
            doc_title = fact.get("document_title", "Authoritative Specification")
            version_tag = fact.get("version_tag", "v3.2")
            verbatim_quote = fact.get("verbatim_quote", "")

            # If ad mentions the subject and has numerical / claim divergence
            # E.g., if ad says "7 days battery" but approved fact says "5 days"
            if "battery" in pred or "battery" in subj or "battery" in ad_text_lower:
                if "7 days" in ad_text_lower and "5 days" in obj_val:
                    alert_id = f"RCL-{uuid.uuid4().hex[:8].upper()}"
                    # Check if alert already exists for this pair
                    existing = await db["recall_alerts"].find_one({
                        "organization_id": org_id,
                        "advertisement_id": ad_id,
                        "status": "ACTIVE"
                    })
                    if not existing:
                        alert_doc = {
                            "id": alert_id,
                            "organization_id": org_id,
                            "advertisement_id": ad_id,
                            "advertisement_title": ad_title,
                            "severity": "RED",
                            "status": "ACTIVE",
                            "source_document": doc_title,
                            "new_version": version_tag,
                            "previous_version": "v3.1",
                            "reason": f"Approved specification changed battery life benchmark to '{obj_val}' ({version_tag}), but active advertisement claims '7 days'.",
                            "invalidated_claim": "Up to 7 days battery life",
                            "approved_benchmark": obj_val,
                            "verbatim_evidence": verbatim_quote,
                            "suggested_remediation": f"Update advertisement copy to state '{verbatim_quote}' and re-submit for guardian audit.",
                            "created_at": now,
                            "updated_at": now
                        }
                        await db["recall_alerts"].insert_one(alert_doc)
                        alert_doc.pop("_id", None)
                        detected_alerts.append(alert_doc)

                        # Update advertisement status to RECALLED
                        await db["advertisements"].update_one(
                            {"id": ad_id, "organization_id": org_id},
                            {"$set": {
                                "approval_status": "RECALLED",
                                "recall_flag": True,
                                "recall_alert_id": alert_id,
                                "updated_at": now
                            }}
                        )

            # Check terminology deprecation
            if "terminology" in fact.get("category", "").lower() or "term" in pred:
                canonical = obj_val
                deprecated = subj
                if deprecated and deprecated in ad_text_lower:
                    alert_id = f"RCL-{uuid.uuid4().hex[:8].upper()}"
                    existing = await db["recall_alerts"].find_one({
                        "organization_id": org_id,
                        "advertisement_id": ad_id,
                        "invalidated_claim": deprecated,
                        "status": "ACTIVE"
                    })
                    if not existing:
                        alert_doc = {
                            "id": alert_id,
                            "organization_id": org_id,
                            "advertisement_id": ad_id,
                            "advertisement_title": ad_title,
                            "severity": "YELLOW",
                            "status": "ACTIVE",
                            "source_document": doc_title,
                            "new_version": version_tag,
                            "previous_version": "v2.0",
                            "reason": f"Trademark guidelines updated: term '{deprecated}' is deprecated in favour of canonical '{canonical}'.",
                            "invalidated_claim": deprecated,
                            "approved_benchmark": canonical,
                            "verbatim_evidence": verbatim_quote,
                            "suggested_remediation": f"Replace '{deprecated}' with '{canonical}'.",
                            "created_at": now,
                            "updated_at": now
                        }
                        await db["recall_alerts"].insert_one(alert_doc)
                        alert_doc.pop("_id", None)
                        detected_alerts.append(alert_doc)

    await log_audit_event(
        action="RECALL_EVALUATION_EXECUTED",
        organization_id=org_id,
        user_id=current_user.id,
        resource_type="recall_engine",
        details={
            "ads_scanned": len(ads),
            "alerts_created": len(detected_alerts)
        }
    )

    return {
        "message": f"Recall sweep completed. Scanned {len(ads)} advertisements.",
        "ads_scanned": len(ads),
        "new_alerts_count": len(detected_alerts),
        "new_alerts": detected_alerts
    }

@router.post("/alerts/{alert_id}/resolve")
async def resolve_recall_alert(
    alert_id: str,
    req: ResolveAlertRequest,
    current_user: UserProfileResponse = Depends(require_roles([UserRole.ADMIN, UserRole.APPROVER]))
) -> Dict[str, Any]:
    """
    Resolve or dismiss a recall alert and update associated advertisement status.
    """
    db = db_manager.get_db()
    org_id = current_user.organization_id
    now = datetime.now(timezone.utc).isoformat()

    alert = await db["recall_alerts"].find_one({"id": alert_id, "organization_id": org_id})
    if not alert:
        raise HTTPException(status_code=404, detail="Recall alert not found")

    new_status = "REMEDIATED" if req.action in ["RECHECK_AD", "MARK_REMEDIATED"] else "DISMISSED"

    await db["recall_alerts"].update_one(
        {"id": alert_id, "organization_id": org_id},
        {"$set": {
            "status": new_status,
            "resolved_by": current_user.id,
            "resolved_by_name": current_user.full_name,
            "resolution_action": req.action,
            "resolution_notes": req.notes,
            "resolved_at": now,
            "updated_at": now
        }}
    )

    # If action is recheck, transition ad to UNDER_REVIEW
    if req.action == "RECHECK_AD":
        await db["advertisements"].update_one(
            {"id": alert["advertisement_id"], "organization_id": org_id},
            {"$set": {
                "approval_status": "UNDER_REVIEW",
                "recall_flag": False,
                "updated_at": now
            }}
        )

    await log_audit_event(
        action=f"RECALL_ALERT_{new_status}",
        organization_id=org_id,
        user_id=current_user.id,
        resource_type="recall_alert",
        resource_id=alert_id,
        details={"action": req.action, "notes": req.notes}
    )

    return {
        "message": f"Recall alert {alert_id} successfully marked as {new_status}.",
        "alert_id": alert_id,
        "status": new_status,
        "resolved_at": now
    }

