from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Dict, Any, List, Optional
from app.models.auth import UserProfileResponse, UserRole
from app.api.deps import require_permission
from app.db.mongo import db_manager

router = APIRouter(prefix="/audit", tags=["Security & Audit Trail"])

@router.get("/logs")
async def list_audit_logs(
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserProfileResponse = Depends(require_permission("audit.view"))
) -> Dict[str, Any]:
    """
    Retrieve immutable audit logs for the organization.
    Restricted to ADMINISTRATORS.
    """
    db = db_manager.get_db()
    org_id = current_user.organization_id

    query: Dict[str, Any] = {
        "$or": [
            {"organization_id": org_id},
            {"org_id": org_id}
        ]
    }

    if action and action.upper() != "ALL":
        query["action"] = action
    if resource_type and resource_type.upper() != "ALL":
        query["resource_type"] = resource_type

    cursor = db["audit_logs"].find(query).sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)

    for log in logs:
        log.pop("_id", None)

    return {
        "logs": logs,
        "count": len(logs)
    }

