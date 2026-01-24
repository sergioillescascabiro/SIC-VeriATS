"""Application schemas for request/response validation."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ApplicationCreate(BaseModel):
    """Schema for creating an application."""
    job_id: int
    cover_letter: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating application status."""
    status: str  # "Pending", "Verified", "Interview", "Rejected", "Hired"
    notes: Optional[str] = None


class ApplicationStatusHistoryResponse(BaseModel):
    """Schema for application status history."""
    id: int
    application_id: int
    changed_by: int
    old_status: Optional[str]
    new_status: str
    notes: Optional[str]
    changed_at: datetime

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    """Schema for application response (full data)."""
    id: int
    candidate_id: int
    job_id: int
    status: str
    cover_letter: Optional[str]
    score: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ApplicationWithHistoryResponse(ApplicationResponse):
    """Application response with status history."""
    status_history: List[ApplicationStatusHistoryResponse] = []

    class Config:
        from_attributes = True
