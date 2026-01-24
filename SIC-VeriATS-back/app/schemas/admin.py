"""Admin schemas for company management and statistics."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class AdminStats(BaseModel):
    """Dashboard statistics for admin."""
    total_companies: int
    published_companies: int
    total_jobs: int
    active_jobs: int
    total_candidates: int
    pending_evaluation: int
    selected_candidates: int


class CompanyBase(BaseModel):
    """Base company schema with common fields."""
    company_name: str
    company_description: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_industry: Optional[str] = None
    company_website: Optional[str] = None
    is_sponsor: bool = False


class CompanyCreate(CompanyBase):
    """Schema for creating a new company."""
    email: EmailStr
    password: str


class CompanyUpdate(BaseModel):
    """Schema for updating a company (all fields optional)."""
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_industry: Optional[str] = None
    company_website: Optional[str] = None
    email: Optional[EmailStr] = None
    is_sponsor: Optional[bool] = None


class CompanyResponse(CompanyBase):
    """Schema for company response."""
    id: int
    email: str
    company_status: str
    created_at: datetime
    job_count: int = 0

    class Config:
        from_attributes = True


class CompanyListItem(BaseModel):
    """Simplified company schema for list view."""
    id: int
    company_name: str
    email: str
    company_status: str
    is_sponsor: bool = False
    company_logo_url: Optional[str] = None
    job_count: int

    class Config:
        from_attributes = True


class JobListItem(BaseModel):
    """Job schema for Admin list view."""
    id: int
    title: str
    status: str
    company_name: str
    company_id: int
    company_logo: Optional[str] = None
    candidate_count: int
    created_at: datetime
    location: Optional[str] = "Remote"
    type: Optional[str] = "Full-time"

    class Config:
        from_attributes = True
