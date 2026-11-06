from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.mongo import db_manager
from app.api.v1.auth import router as auth_router
from app.api.v1.organizations import router as org_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.advertisements import router as ads_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.registry import router as registry_router
from app.api.v1.recall import router as recall_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit_logs import router as audit_router
from app.db.seed import seed_demo_data
from app.core.security import hash_password
import uuid
from datetime import datetime, timezone

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database
    await db_manager.connect_db()
    await seed_demo_data()
    yield
    # Shutdown: clean up connections
    await db_manager.close_db()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Multimodal Brand Governance API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware - Strict allowlist, no wildcard origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID", "X-CSRF-Token", "Accept"],
)

# Global Security Headers & Request ID Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = req_id

    response = await call_next(request)
    
    # Helmet-style security headers
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; font-src 'self' data:; frame-ancestors 'none'; "
        "object-src 'none'; base-uri 'self'; form-action 'self'"
    )
    # Remove fingerprinting headers
    if "Server" in response.headers:
        del response.headers["Server"]
    if "X-Powered-By" in response.headers:
        del response.headers["X-Powered-By"]
        
    return response

# Secure Central Exception Handler (No stack traces to clients)
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    # Log internal anomaly server-side only with request ID
    print(f"[{datetime.now(timezone.utc).isoformat()}] [SECURITY ERROR] ReqID: {req_id} Path: {request.url.path} Error: {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "request_id": req_id
        }
    )

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(org_router, prefix=settings.API_V1_PREFIX)
app.include_router(knowledge_router, prefix=settings.API_V1_PREFIX)
app.include_router(ads_router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews_router, prefix=settings.API_V1_PREFIX)
app.include_router(registry_router, prefix=settings.API_V1_PREFIX)
app.include_router(recall_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
@app.get(f"{settings.API_V1_PREFIX}/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database_mode": "mock_memory" if db_manager._is_mock else "mongodb_live",
        "auth_engine": "jwt_bcrypt_argon2"
    }

