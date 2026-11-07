from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
import jwt
from app.core.audit import log_audit_event
from app.core.permissions import role_has_permission
from app.core.security import decode_jwt_token
from app.db.mongo import db_manager
from app.models.auth import UserRole, UserProfileResponse

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> UserProfileResponse:
    token: Optional[str] = None

    # Check Authorization header first
    if creds and creds.credentials:
        token = creds.credentials
    else:
        # Fallback to HttpOnly cookie
        token = request.cookies.get("nexora_access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Sign in to access this endpoint.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = decode_jwt_token(token, expected_type="access")
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please re-authenticate.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token payload malformed.")

    db = db_manager.get_db()
    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User account no longer exists.")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account is deactivated.")

    org = await db["organisations"].find_one({"_id": user["organization_id"]})
    org_name = org["name"] if org else "Default Organization"

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

def require_permission(permission: str):
    """
    Authorize from shared/permissions.json. Missing permission is 403 and is audited.
    """

    async def checker(
        request: Request,
        current_user: UserProfileResponse = Depends(get_current_user),
    ) -> UserProfileResponse:
        if role_has_permission(current_user.role.value, permission):
            return current_user
        try:
            await log_audit_event(
                action="ACCESS_DENIED",
                organization_id=current_user.organization_id,
                user_id=current_user.id,
                resource_type="permission",
                resource_id=permission,
                details={
                    "role": current_user.role.value,
                    "path": request.url.path,
                    "method": request.method,
                },
                ip_address=request.client.host if request.client else None,
            )
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: missing permission '{permission}'.",
        )

    return checker


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency factory checking if current user holds one of the required roles.
    """
    async def role_checker(current_user: UserProfileResponse = Depends(get_current_user)) -> UserProfileResponse:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {[r.value for r in allowed_roles]}. Current role: {current_user.role.value}"
            )
        return current_user
    return role_checker

async def verify_org_isolation(
    org_id: str,
    current_user: UserProfileResponse = Depends(get_current_user)
) -> UserProfileResponse:
    """
    Enforces that users can only access or mutate resources in their own organisation.
    """
    if current_user.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-organisation access violation: You cannot access or modify another tenant's resources."
        )
    return current_user

