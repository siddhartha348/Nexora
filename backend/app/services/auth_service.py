import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.db.mongo import db_manager
from app.core.config import settings
from app.core.security import (
    validate_password_strength,
    hash_password,
    verify_password,
    create_jwt_token,
    decode_jwt_token,
    rate_limiter,
    PasswordValidationError
)
from app.core.audit import log_audit_event
from app.models.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse,
    UserRole
)

class AuthService:
    @staticmethod
    async def register(req: UserRegisterRequest, ip_address: Optional[str] = None) -> TokenResponse:
        db = db_manager.get_db()
        email_clean = req.email.lower().strip()

        # Check existing user
        existing_user = await db["users"].find_one({"email": email_clean})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

        # Validate password security policy
        try:
            validate_password_strength(req.password)
        except PasswordValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )

        user_id = str(uuid.uuid4())
        org_id = None
        org_name = None
        assigned_role = UserRole.ADMIN

        # Handle joining via invite code if provided
        if req.invite_code:
            invite = await db["organisation_invitations"].find_one({
                "invite_code": req.invite_code,
                "is_used": False
            })
            if not invite:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired invitation code."
                )
            
            # Check expiry
            expires_at = datetime.fromisoformat(invite["expires_at"])
            if datetime.now(timezone.utc) > expires_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invitation code has expired."
                )

            org = await db["organisations"].find_one({"_id": invite["organization_id"]})
            if not org:
                raise HTTPException(status_code=404, detail="Referenced organisation no longer exists.")

            org_id = org["_id"]
            org_name = org["name"]
            assigned_role = UserRole(invite["role"])

            # Mark invite used
            await db["organisation_invitations"].update_one(
                {"_id": invite["_id"]},
                {"$set": {"is_used": True, "used_by": user_id, "used_at": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            # Create new Organization
            org_id = str(uuid.uuid4())
            org_name = req.organization_name.strip() if req.organization_name else f"{req.full_name.split()[0]}'s Brand"
            org_slug = org_name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:6]

            org_doc = {
                "_id": org_id,
                "name": org_name,
                "slug": org_slug,
                "owner_id": user_id,
                "industry": "General",
                "settings": {
                    "strict_mode": True,
                    "default_confidence_threshold": 0.85,
                    "auto_recall_on_spec_update": True
                },
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db["organisations"].insert_one(org_doc)

        # Hash password securely using bcrypt
        password_hash = hash_password(req.password)

        user_doc = {
            "_id": user_id,
            "email": email_clean,
            "password_hash": password_hash,
            "full_name": req.full_name.strip(),
            "role": assigned_role.value,
            "organization_id": org_id,
            "is_active": True,
            "is_verified": True, # Set active for seamless development testing
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db["users"].insert_one(user_doc)

        # Log audit trail
        await log_audit_event(
            action="USER_REGISTERED",
            org_id=org_id,
            user_id=user_id,
            resource_type="USER",
            resource_id=user_id,
            details={"email": email_clean, "role": assigned_role.value},
            ip_address=ip_address
        )

        # Generate tokens
        token_payload = {
            "sub": user_id,
            "email": email_clean,
            "org_id": org_id,
            "role": assigned_role.value
        }
        access_token = create_jwt_token(
            payload=token_payload,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            token_type="access"
        )

        return TokenResponse(
            access_token=access_token,
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user_id,
            email=email_clean,
            full_name=req.full_name.strip(),
            role=assigned_role,
            organization_id=org_id,
            organization_name=org_name
        )

    @staticmethod
    async def login(req: UserLoginRequest, ip_address: Optional[str] = None) -> TokenResponse:
        email_clean = req.email.lower().strip()
        rate_key = f"{ip_address or '0.0.0.0'}:{email_clean}"

        # Rate limiter check
        is_locked, remaining_sec = rate_limiter.is_locked(rate_key)
        if is_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed login attempts. Account temporarily locked. Try again in {remaining_sec} seconds."
            )

        db = db_manager.get_db()
        user = await db["users"].find_one({"email": email_clean})

        if not user or not verify_password(req.password, user["password_hash"]):
            rate_limiter.record_failure(rate_key)
            await log_audit_event(
                action="LOGIN_FAILED",
                user_id=user["_id"] if user else None,
                org_id=user["organization_id"] if user else None,
                resource_type="AUTH",
                details={"email": email_clean, "reason": "invalid_credentials"},
                ip_address=ip_address
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated. Contact your administrator."
            )

        # Clear failed login attempts on success
        rate_limiter.record_success(rate_key)

        org = await db["organisations"].find_one({"_id": user["organization_id"]})
        org_name = org["name"] if org else "Default Organization"

        await log_audit_event(
            action="LOGIN_SUCCESS",
            org_id=user["organization_id"],
            user_id=user["_id"],
            resource_type="AUTH",
            details={"email": email_clean},
            ip_address=ip_address
        )

        token_payload = {
            "sub": user["_id"],
            "email": email_clean,
            "org_id": user["organization_id"],
            "role": user["role"]
        }
        access_token = create_jwt_token(
            payload=token_payload,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            token_type="access"
        )

        return TokenResponse(
            access_token=access_token,
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user["_id"],
            email=email_clean,
            full_name=user["full_name"],
            role=UserRole(user["role"]),
            organization_id=user["organization_id"],
            organization_name=org_name
        )

    @staticmethod
    async def get_user_profile(user_id: str) -> UserProfileResponse:
        db = db_manager.get_db()
        user = await db["users"].find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        org = await db["organisations"].find_one({"_id": user["organization_id"]})
        org_name = org["name"] if org else "Unknown Organization"

        return UserProfileResponse(
            id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            role=UserRole(user["role"]),
            organization_id=user["organization_id"],
            organization_name=org_name,
            is_active=user.get("is_active", True),
            is_verified=user.get("is_verified", True),
            created_at=user.get("created_at", "")
        )

    @staticmethod
    async def create_password_reset_token(email: str) -> str:
        db = db_manager.get_db()
        user = await db["users"].find_one({"email": email.lower().strip()})
        if not user:
            # Avoid user enumeration by returning a generic dummy token
            return "simulated-reset-token-for-unregistered-address"

        payload = {"sub": user["_id"], "email": user["email"]}
        reset_token = create_jwt_token(
            payload=payload,
            expires_delta=timedelta(minutes=30),
            token_type="reset_password"
        )
        return reset_token

    @staticmethod
    async def reset_password(token: str, new_password: str) -> bool:
        try:
            payload = decode_jwt_token(token, expected_type="reset_password")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        user_id = payload.get("sub")
        try:
            validate_password_strength(new_password)
        except PasswordValidationError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

        db = db_manager.get_db()
        new_hash = hash_password(new_password)
        res = await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"password_hash": new_hash}}
        )

        await log_audit_event(
            action="PASSWORD_RESET_SUCCESS",
            user_id=user_id,
            resource_type="AUTH"
        )
        return res.modified_count > 0

