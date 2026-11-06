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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database
    await db_manager.connect_db()
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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Secure Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log internal error securely on server
    print(f"[SECURITY ALERT] Unhandled Server Exception at {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. This anomaly has been logged for security audit."}
    )

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(org_router, prefix=settings.API_V1_PREFIX)
app.include_router(knowledge_router, prefix=settings.API_V1_PREFIX)
app.include_router(ads_router, prefix=settings.API_V1_PREFIX)

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

