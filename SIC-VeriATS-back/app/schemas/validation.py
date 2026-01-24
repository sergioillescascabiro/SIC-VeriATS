"""Validation schemas for skill verification."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ValidationUpdate(BaseModel):
    """Schema for updating validation status (Admin only)."""
    status: str  # "Pending", "Verified", "Rejected"
    notes: Optional[str] = None


class ValidationResponse(BaseModel):
    """Schema for validation response."""
    id: int
    application_id: int
    requirement_id: int
    status: str
    notes: Optional[str]
    validated_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ValidationWithDetailsResponse(ValidationResponse):
    """Validation with requirement details."""
    requirement_skill_name: Optional[str] = None
    requirement_proficiency_level: Optional[str] = None
    candidate_blind_code: Optional[str] = None

    class Config:
        from_attributes = True
