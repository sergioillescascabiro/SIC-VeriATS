"""Profile schemas with CRITICAL blind hiring data protection."""
from pydantic import BaseModel
from typing import Optional


class SensitiveDataCreate(BaseModel):
    """Schema for creating sensitive data (candidate registration)."""
    full_name: str
    gender: Optional[str] = None
    university: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class SensitiveDataResponse(BaseModel):
    """
    CRITICAL: Only for Admin and the candidate themselves.
    NEVER use this schema in company-facing endpoints.
    """
    id: int
    user_id: int
    full_name: str
    gender: Optional[str]
    university: Optional[str]
    phone: Optional[str]
    address: Optional[str]

    class Config:
        from_attributes = True


class PublicProfileCreate(BaseModel):
    """Schema for creating a public profile."""
    years_of_experience: int = 0
    bio: Optional[str] = None
    skills: Optional[str] = None  # Comma-separated


class PublicProfileResponse(BaseModel):
    """Public profile data (safe for companies)."""
    id: int
    user_id: int
    blind_code: str
    years_of_experience: int
    bio: Optional[str]
    skills: Optional[str]
    score: int

    class Config:
        from_attributes = True


class BlindCandidateResponse(BaseModel):
    """
    CRITICAL: This is the ONLY schema companies can see.

    This schema ENFORCES blind hiring by excluding:
    - full_name
    - email (from User table)
    - gender
    - university
    - phone
    - address

    Only includes anonymized data and validated skills.
    """
    blind_code: str
    years_of_experience: int
    bio: Optional[str]
    skills: Optional[str]
    score: int
    # Application-specific data (if querying applications)
    application_id: Optional[int] = None
    application_status: Optional[str] = None
    verified_skills_count: Optional[int] = None

    class Config:
        from_attributes = True
