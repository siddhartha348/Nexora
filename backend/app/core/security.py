import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import re
from app.core.config import settings

class PasswordValidationError(Exception):
    pass

def validate_password_strength(password: str) -> None:
    """
    Enforces high-security enterprise password rules:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 numeric digit
    - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
    """
    if len(password) < 8:
        raise PasswordValidationError("Password must contain at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        raise PasswordValidationError("Password must include at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", password):
        raise PasswordValidationError("Password must include at least one lowercase letter (a-z).")
    if not re.search(r"[0-9]", password):
        raise PasswordValidationError("Password must include at least one numeric digit (0-9).")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-\+=~`\[\]/\\;]", password):
        raise PasswordValidationError("Password must include at least one special character.")

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with 12 work rounds."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_jwt_token(
    payload: Dict[str, Any],
    expires_delta: timedelta,
    token_type: str = "access"
) -> str:
    """Generate a signed JWT token with explicit expiration and type claims."""
    now = datetime.now(timezone.utc)
    to_encode = payload.copy()
    to_encode.update({
        "exp": now + expires_delta,
        "iat": now,
        "nbf": now,
        "type": token_type
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_jwt_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    """Decode and validate signature, expiration, and token type."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "iat", "type", "sub"]}
        )
        if payload.get("type") != expected_type:
            raise jwt.InvalidTokenError(f"Token type mismatch: expected {expected_type}, got {payload.get('type')}")
        return payload
    except jwt.ExpiredSignatureError:
        raise jwt.ExpiredSignatureError("Token has expired.")
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError(f"Invalid token: {str(e)}")

def sanitize_mongo_input(data: Any) -> Any:
    """
    Recursively strips MongoDB operator injection keys (starting with $ or containing .)
    from query and input payloads.
    """
    if isinstance(data, dict):
        clean_dict = {}
        for key, value in data.items():
            if isinstance(key, str) and (key.startswith("$") or "." in key):
                continue
            clean_dict[key] = sanitize_mongo_input(value)
        return clean_dict
    elif isinstance(data, list):
        return [sanitize_mongo_input(item) for item in data]
    return data

# Rate limiting store for brute-force defense
class LoginRateLimiter:
    def __init__(self, max_attempts: int = 5, lockout_minutes: int = 15):
        self.max_attempts = max_attempts
        self.lockout_minutes = lockout_minutes
        self._attempts: Dict[str, list] = {} # key -> list of datetime

    def _clean_old_attempts(self, key: str, now: datetime):
        window_start = now - timedelta(minutes=self.lockout_minutes)
        if key in self._attempts:
            self._attempts[key] = [t for t in self._attempts[key] if t > window_start]
            if not self._attempts[key]:
                del self._attempts[key]

    def is_locked(self, key: str) -> Tuple[bool, int]:
        now = datetime.now(timezone.utc)
        self._clean_old_attempts(key, now)
        attempts = self._attempts.get(key, [])
        if len(attempts) >= self.max_attempts:
            earliest = min(attempts)
            remaining_seconds = int((earliest + timedelta(minutes=self.lockout_minutes) - now).total_seconds())
            return True, max(1, remaining_seconds)
        return False, 0

    def record_failure(self, key: str) -> None:
        now = datetime.now(timezone.utc)
        self._clean_old_attempts(key, now)
        if key not in self._attempts:
            self._attempts[key] = []
        self._attempts[key].append(now)

    def record_success(self, key: str) -> None:
        if key in self._attempts:
            del self._attempts[key]

rate_limiter = LoginRateLimiter(
    max_attempts=settings.MAX_LOGIN_ATTEMPTS,
    lockout_minutes=settings.LOCKOUT_DURATION_MINUTES
)

