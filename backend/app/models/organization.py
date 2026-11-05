from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.auth import UserRole

class OrganizationCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    industry: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class OrganizationUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    industry: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    owner_id: str
    industry: Optional[str] = None
    settings: Dict[str, Any]
    member_count: int
    created_at: str

class OrganizationInviteRequest(BaseModel):
    email: str
    role: UserRole = UserRole.CREATOR

class OrganizationInviteResponse(BaseModel):
    id: str
    organization_id: str
    email: str
    role: UserRole
    invite_code: str
    expires_at: str
    created_at: str

class JoinOrganizationRequest(BaseModel):
    invite_code: str

class MemberUpdateRequest(BaseModel):
    role: UserRole

class MemberResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    joined_at: str

