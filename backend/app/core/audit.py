from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.db.mongo import db_manager

async def log_audit_event(
    action: str = "SYSTEM_ACTION",
    org_id: Optional[str] = None,
    user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    organization_id: Optional[str] = None,
    **kwargs: Any
) -> str:
    """
    Persist an immutable audit record in the MongoDB audit_logs collection.
    """
    db = db_manager.get_db()
    audit_entry = {
        "action": action,
        "org_id": org_id or organization_id,
        "organization_id": org_id or organization_id,
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details or {},
        "ip_address": ip_address,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    result = await db["audit_logs"].insert_one(audit_entry)
    return str(result.inserted_id)

