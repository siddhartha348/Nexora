import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.api.deps import require_permission
from app.core.audit import log_audit_event
from app.core.security import hash_password, validate_password_strength, PasswordValidationError
from app.db.mongo import db_manager
from app.models.auth import UserProfileResponse, UserRole
from app.services.org_service import OrganizationService

router = APIRouter(prefix="/users", tags=["Users"])


class CreateUserRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole
    password: str = Field(..., min_length=12)


@router.get("")
async def list_users(
    current_user: UserProfileResponse = Depends(require_permission("users.manage")),
):
    return await OrganizationService.list_members(current_user.organization_id)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(
    req: CreateUserRequest,
    current_user: UserProfileResponse = Depends(require_permission("users.manage")),
):
    try:
        validate_password_strength(req.password)
    except PasswordValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    db = db_manager.get_db()
    email = req.email.lower().strip()
    existing = await db["users"].find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    user_id = f"usr-{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc).isoformat()
    await db["users"].insert_one({
        "_id": user_id,
        "id": user_id,
        "email": email,
        "password_hash": hash_password(req.password),
        "full_name": req.full_name.strip(),
        "role": req.role.value,
        "organization_id": current_user.organization_id,
        "is_active": True,
        "is_verified": True,
        "created_at": now,
    })
    await log_audit_event(
        action="USER_CREATED",
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        resource_type="user",
        resource_id=user_id,
        details={"email": email, "role": req.role.value},
    )
    return {
        "id": user_id,
        "email": email,
        "full_name": req.full_name.strip(),
        "role": req.role.value,
        "organization_id": current_user.organization_id,
    }
