"""Job schemas for request/response validation."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RequirementBase(BaseModel):
    """Base requirement schema."""
    skill_name: str
    proficiency_level: str  # "Beginner", "Intermediate", "Advanced", "Expert"
    description: Optional[str] = None
    is_required: bool = True


class RequirementCreate(RequirementBase):
    """Schema for creating a requirement."""
    pass


class RequirementResponse(RequirementBase):
    """Schema for requirement response."""
    id: int
    job_id: int

    class Config:
        from_attributes = True


class JobBase(BaseModel):
    """Base job schema."""
    title: str
    description: str


class JobCreate(JobBase):
    """Schema for creating a job with requirements."""
    requirements: Optional[List[RequirementCreate]] = []


class JobUpdate(BaseModel):
    """Schema for updating a job."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # "Draft", "Active", "Closed"


class JobResponse(JobBase):
    """Schema for job response."""
    id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    requirements: List[RequirementResponse] = []

    class Config:
        from_attributes = True
