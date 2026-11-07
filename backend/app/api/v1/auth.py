from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from app.models.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest
)
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_auth_cookies(response: Response, token: str):
    """Set secure HttpOnly cookies for session management."""
    response.set_cookie(
        key="nexora_access_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

def clear_auth_cookies(response: Response):
    """Clear session cookies upon logout."""
    response.delete_cookie(key="nexora_access_token", path="/")

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest, request: Request, response: Response):
    ip_address = request.client.host if request.client else "0.0.0.0"
    token_resp = await AuthService.register(req, ip_address=ip_address)
    set_auth_cookies(response, token_resp.access_token)
    return token_resp

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, request: Request, response: Response):
    ip_address = request.client.host if request.client else "0.0.0.0"
    token_resp = await AuthService.login(req, ip_address=ip_address)
    set_auth_cookies(response, token_resp.access_token)
    return token_resp

@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Successfully logged out. Session terminated."}

@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: UserProfileResponse = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
async def demo_accounts():
    """One-click demo identities. Passwords are returned only when the flag is on."""
    if not settings.SHOW_DEMO_ACCOUNTS:
        return {"enabled": False, "accounts": []}
    password = settings.DEMO_PASSWORD
    accounts = [
        {"role": "ADMIN", "email": "admin@nexora.com", "full_name": "Audrey Vance", "password": password},
        {"role": "APPROVER", "email": "approver@nexora.com", "full_name": "Marcus Kane", "password": password},
        {"role": "REVIEWER", "email": "reviewer@nexora.com", "full_name": "Elena Rostova", "password": password},
        {"role": "CREATOR", "email": "creator@nexora.com", "full_name": "Liam Chen", "password": password},
        {"role": "VIEWER", "email": "viewer@nexora.com", "full_name": "Sophia Zhang", "password": password},
    ]
    return {"enabled": True, "accounts": accounts}

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    reset_token = await AuthService.create_password_reset_token(req.email)
    # In production, dispatch via SMTP; return reset_token in dev/test environment
    return {
        "message": "If this email is registered, a password reset link has been dispatched.",
        "reset_token": reset_token if settings.ENVIRONMENT == "development" else None
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    success = await AuthService.reset_password(req.token, req.new_password)
    return {"message": "Password successfully updated. You may now log in with your new credentials."}

@router.get("/verify-email")
async def verify_email(token: str):
    # Simulated email verification handler
    return {"message": "Email address verified successfully. Full platform privileges activated."}

