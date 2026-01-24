"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    # TODO: Portfolio refactor — do not use default secrets in production
    DATABASE_URL: str = ""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # JWT
    # TODO: Portfolio refactor — do not use default secrets in production
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://localhost:8000", "http://localhost:5173", "http://localhost:4173", "http://localhost:4174"]
    
    # App
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    UPLOAD_DIR: str = "uploads"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        """Customise settings sources to prioritize env vars and ignore missing .env."""
        return (
            init_settings,
            env_settings,
            dotenv_settings,
        )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str) and not isinstance(v, list):
            return [origin.strip() for origin in v.split(",")]
        return v


# Global settings instance
settings = Settings()
