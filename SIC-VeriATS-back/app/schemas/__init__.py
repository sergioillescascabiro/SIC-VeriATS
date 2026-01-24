"""Schemas package initialization."""
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.profile import (
    SensitiveDataCreate,
    SensitiveDataResponse,
    PublicProfileCreate,
    PublicProfileResponse,
    BlindCandidateResponse,
)
from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse,
    RequirementCreate,
    RequirementResponse,
)
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationWithHistoryResponse,
    ApplicationStatusHistoryResponse,
)
from app.schemas.validation import (
    ValidationUpdate,
    ValidationResponse,
    ValidationWithDetailsResponse,
)

__all__ = [
    # User
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    # Profile
    "SensitiveDataCreate",
    "SensitiveDataResponse",
    "PublicProfileCreate",
    "PublicProfileResponse",
    "BlindCandidateResponse",
    # Job
    "JobCreate",
    "JobUpdate",
    "JobResponse",
    "RequirementCreate",
    "RequirementResponse",
    # Application
    "ApplicationCreate",
    "ApplicationUpdate",
    "ApplicationResponse",
    "ApplicationWithHistoryResponse",
    "ApplicationStatusHistoryResponse",
    # Validation
    "ValidationUpdate",
    "ValidationResponse",
    "ValidationWithDetailsResponse",
]
