from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field, field_validator, ValidationInfo
from typing import List, Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"
    APP_NAME: str = "NEXORA Brand Governance"
    API_V1_PREFIX: str = "/api/v1"
    
    SECRET_KEY: str = Field(
        default="nexora_dev_jwt_secret_key_8f93e2b10a9c8d7e6f5a4b3c2d1e0f",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET"),
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias=AliasChoices("ALLOWED_ORIGINS", "CORS_ORIGINS"),
    )
    
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        validation_alias=AliasChoices("MONGODB_URI", "MONGO_URL"),
    )
    MONGODB_DB_NAME: str = "nexora_governance"
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    
    GEMINI_API_KEY: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("GEMINI_API_KEY", "LLM_API_KEY"),
    )
    MOCK_LLM: bool = True
    SHOW_DEMO_ACCOUNTS: bool = True
    DEMO_PASSWORD: str = "NexoraDemo2026!"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_AI_PROVIDER: str = "gemini"

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info: ValidationInfo) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long for cryptographic security.")
        return v

    @property
    def cors_origins(self) -> List[str]:
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        # Allow any *.onrender.com or localhost by default
        if "*" not in origins and "all" not in [o.lower() for o in origins]:
            origins.extend(["https://*.onrender.com", "http://localhost:*"])
        return origins

settings = Settings()
