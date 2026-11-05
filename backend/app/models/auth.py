from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional, List
from datetime import datetime

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    APPROVER = "APPROVER"
    REVIEWER = "REVIEWER"
    CREATOR = "CREATOR"
    VIEWER = "VIEWER"

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    organization_name: Optional[str] = Field(None, min_length=2, max_length=100)
    invite_code: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user_id: str
    email: str
    full_name: str
    role: UserRole
    organization_id: str
    organization_name: str

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    organization_id: str
    organization_name: str
    is_active: bool
    is_verified: bool
    created_at: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class VerifyEmailRequest(BaseModel):
    token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

