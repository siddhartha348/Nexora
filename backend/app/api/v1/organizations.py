from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.organization import (
    OrganizationResponse,
    OrganizationUpdateRequest,
    OrganizationInviteRequest,
    OrganizationInviteResponse,
    MemberUpdateRequest,
    MemberResponse
)
from app.models.auth import UserRole, UserProfileResponse
from app.services.org_service import OrganizationService
from app.api.deps import get_current_user, require_permission, verify_org_isolation

router = APIRouter(prefix="/organizations", tags=["Organizations & Access Control"])

@router.get("/current", response_model=OrganizationResponse)
async def get_current_organization(
    current_user: UserProfileResponse = Depends(get_current_user)
):
    return await OrganizationService.get_organization(current_user.organization_id)

@router.put("/{org_id}/settings", response_model=OrganizationResponse)
async def update_organization_settings(
    org_id: str,
    req: OrganizationUpdateRequest,
    current_user: UserProfileResponse = Depends(require_permission("users.manage"))
):
    await verify_org_isolation(org_id, current_user)
    return await OrganizationService.update_settings(org_id, req, actor_id=current_user.id)

@router.post("/{org_id}/invitations", response_model=OrganizationInviteResponse)
async def invite_member(
    org_id: str,
    req: OrganizationInviteRequest,
    current_user: UserProfileResponse = Depends(require_permission("users.manage"))
):
    await verify_org_isolation(org_id, current_user)
    return await OrganizationService.create_invite(org_id, req, actor_id=current_user.id)

@router.get("/{org_id}/members", response_model=List[MemberResponse])
async def list_members(
    org_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
):
    await verify_org_isolation(org_id, current_user)
    return await OrganizationService.list_members(org_id)

@router.put("/{org_id}/members/{user_id}/role", response_model=MemberResponse)
async def update_member_role(
    org_id: str,
    user_id: str,
    req: MemberUpdateRequest,
    current_user: UserProfileResponse = Depends(require_permission("users.manage"))
):
    await verify_org_isolation(org_id, current_user)
    return await OrganizationService.update_member_role(org_id, user_id, req.role, actor_id=current_user.id)

@router.delete("/{org_id}/members/{user_id}")
async def deactivate_member(
    org_id: str,
    user_id: str,
    current_user: UserProfileResponse = Depends(require_permission("users.manage"))
):
    await verify_org_isolation(org_id, current_user)
    await OrganizationService.deactivate_member(org_id, user_id, actor_id=current_user.id)
    return {"message": "Member successfully deactivated."}

