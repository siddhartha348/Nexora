import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import HTTPException, status
from app.db.mongo import db_manager
from app.models.auth import UserRole
from app.models.organization import (
    OrganizationResponse,
    OrganizationUpdateRequest,
    OrganizationInviteRequest,
    OrganizationInviteResponse,
    MemberResponse
)
from app.core.audit import log_audit_event

class OrganizationService:
    @staticmethod
    async def get_organization(org_id: str) -> OrganizationResponse:
        db = db_manager.get_db()
        org = await db["organisations"].find_one({"_id": org_id})
        if not org:
            raise HTTPException(status_code=404, detail="Organisation not found.")

        member_count = await db["users"].count_documents({"organization_id": org_id, "is_active": True})

        return OrganizationResponse(
            id=org["_id"],
            name=org["name"],
            slug=org.get("slug", ""),
            owner_id=org["owner_id"],
            industry=org.get("industry", "General"),
            settings=org.get("settings", {}),
            member_count=member_count,
            created_at=org.get("created_at", "")
        )

    @staticmethod
    async def update_settings(org_id: str, req: OrganizationUpdateRequest, actor_id: str) -> OrganizationResponse:
        db = db_manager.get_db()
        update_set: Dict[str, Any] = {}
        if req.name:
            update_set["name"] = req.name.strip()
        if req.industry:
            update_set["industry"] = req.industry.strip()
        if req.settings is not None:
            update_set["settings"] = req.settings

        if update_set:
            await db["organisations"].update_one({"_id": org_id}, {"$set": update_set})
            await log_audit_event(
                action="ORGANIZATION_UPDATED",
                org_id=org_id,
                user_id=actor_id,
                resource_type="ORGANIZATION",
                resource_id=org_id,
                details=update_set
            )

        return await OrganizationService.get_organization(org_id)

    @staticmethod
    async def create_invite(org_id: str, req: OrganizationInviteRequest, actor_id: str) -> OrganizationInviteResponse:
        db = db_manager.get_db()
        invite_id = str(uuid.uuid4())
        invite_code = f"NEX-{uuid.uuid4().hex[:8].upper()}"
        expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

        invite_doc = {
            "_id": invite_id,
            "organization_id": org_id,
            "email": req.email.lower().strip(),
            "role": req.role.value,
            "invite_code": invite_code,
            "created_by": actor_id,
            "is_used": False,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db["organisation_invitations"].insert_one(invite_doc)

        await log_audit_event(
            action="INVITATION_CREATED",
            org_id=org_id,
            user_id=actor_id,
            resource_type="INVITATION",
            resource_id=invite_id,
            details={"recipient_email": req.email, "role": req.role.value}
        )

        return OrganizationInviteResponse(
            id=invite_id,
            organization_id=org_id,
            email=req.email.lower().strip(),
            role=req.role,
            invite_code=invite_code,
            expires_at=expires_at,
            created_at=invite_doc["created_at"]
        )

    @staticmethod
    async def list_members(org_id: str) -> List[MemberResponse]:
        db = db_manager.get_db()
        cursor = db["users"].find({"organization_id": org_id})
        members = await cursor.to_list(100)
        return [
            MemberResponse(
                id=m["_id"],
                email=m["email"],
                full_name=m["full_name"],
                role=UserRole(m["role"]),
                is_active=m.get("is_active", True),
                joined_at=m.get("created_at", "")
            )
            for m in members
        ]

    @staticmethod
    async def update_member_role(org_id: str, target_user_id: str, new_role: UserRole, actor_id: str) -> MemberResponse:
        db = db_manager.get_db()
        target = await db["users"].find_one({"_id": target_user_id, "organization_id": org_id})
        if not target:
            raise HTTPException(status_code=404, detail="Member not found in this organisation.")

        if target_user_id == actor_id and new_role != UserRole.ADMIN:
            raise HTTPException(status_code=400, detail="Cannot downgrade your own Administrator privileges.")

        await db["users"].update_one(
            {"_id": target_user_id},
            {"$set": {"role": new_role.value}}
        )

        await log_audit_event(
            action="MEMBER_ROLE_UPDATED",
            org_id=org_id,
            user_id=actor_id,
            resource_type="USER",
            resource_id=target_user_id,
            details={"previous_role": target["role"], "new_role": new_role.value}
        )

        updated = await db["users"].find_one({"_id": target_user_id})
        return MemberResponse(
            id=updated["_id"],
            email=updated["email"],
            full_name=updated["full_name"],
            role=UserRole(updated["role"]),
            is_active=updated.get("is_active", True),
            joined_at=updated.get("created_at", "")
        )

    @staticmethod
    async def deactivate_member(org_id: str, target_user_id: str, actor_id: str) -> bool:
        if target_user_id == actor_id:
            raise HTTPException(status_code=400, detail="Cannot deactivate your own user account.")

        db = db_manager.get_db()
        target = await db["users"].find_one({"_id": target_user_id, "organization_id": org_id})
        if not target:
            raise HTTPException(status_code=404, detail="Member not found in this organisation.")

        await db["users"].update_one(
            {"_id": target_user_id},
            {"$set": {"is_active": False}}
        )

        await log_audit_event(
            action="MEMBER_DEACTIVATED",
            org_id=org_id,
            user_id=actor_id,
            resource_type="USER",
            resource_id=target_user_id
        )
        return True

