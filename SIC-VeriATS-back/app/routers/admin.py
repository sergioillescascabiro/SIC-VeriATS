"""Admin router - Full CRUD for companies and system statistics."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.admin import (
    AdminStats,
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyListItem,
    JobListItem
)
from app.utils.dependencies import require_admin
from app.utils.security import hash_password

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get global system statistics for admin dashboard."""
    
    # Count companies
    total_companies = db.query(User).filter(User.role == UserRole.COMPANY).count()
    published_companies = db.query(User).filter(
        User.role == UserRole.COMPANY,
        User.company_status == 'published'
    ).count()
    
    # Count jobs
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == JobStatus.ACTIVE).count()
    
    # Count candidates
    total_candidates = db.query(User).filter(User.role == UserRole.CANDIDATE).count()
    
    # Count applications by status
    # In a real system, you'd have an evaluation_status field
    # For now, we'll use application status as proxy
    pending_evaluation = db.query(Application).filter(
        Application.status == ApplicationStatus.PENDING
    ).count()
    
    selected_candidates = db.query(func.count(func.distinct(Application.candidate_id))).filter(
        Application.status.in_([ApplicationStatus.VERIFIED, ApplicationStatus.HIRED])
    ).scalar() or 0
    
    return {
        "total_companies": total_companies,
        "published_companies": published_companies,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_candidates": total_candidates,
        "pending_evaluation": pending_evaluation,
        "selected_candidates": selected_candidates
    }


@router.get("/companies", response_model=List[CompanyListItem])
async def get_companies(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all companies with optional status filter."""
    
    query = db.query(User).filter(User.role == UserRole.COMPANY)
    
    if status:
        query = query.filter(User.company_status == status)
    
    companies = query.all()
    
    result = []
    for company in companies:
        job_count = db.query(Job).filter(Job.company_id == company.id).count()
        
        result.append({
            "id": company.id,
            "company_name": company.company_name or "Unnamed Company",
            "email": company.email,
            "company_status": company.company_status or 'draft',
            "is_sponsor": bool(company.is_sponsor),
            "company_logo_url": company.company_logo_url,
            "job_count": job_count
        })
    
    return result


@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed company information."""
    
    company = db.query(User).filter(
        User.id == company_id,
        User.role == UserRole.COMPANY
    ).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    job_count = db.query(Job).filter(Job.company_id == company.id).count()
    
    return {
        "id": company.id,
        "email": company.email,
        "company_name": company.company_name or "Unnamed Company",
        "company_description": company.company_description,
        "company_logo_url": company.company_logo_url,
        "company_status": company.company_status or 'draft',
        "company_industry": company.company_industry,
        "company_website": company.company_website,
        "is_sponsor": bool(company.is_sponsor),
        "created_at": company.created_at,
        "job_count": job_count
    }


@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new company user."""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == company_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new company user
    new_company = User(
        email=company_data.email,
        hashed_password=hash_password(company_data.password),
        role=UserRole.COMPANY,
        company_name=company_data.company_name,
        company_description=company_data.company_description,
        company_logo_url=company_data.company_logo_url,
        company_status='draft',  # New companies start as draft
        company_industry=company_data.company_industry,
        company_website=company_data.company_website,
        is_sponsor=1 if company_data.is_sponsor else 0,
        is_active=1
    )
    
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    
    return {
        "id": new_company.id,
        "email": new_company.email,
        "company_name": new_company.company_name,
        "company_description": new_company.company_description,
        "company_logo_url": new_company.company_logo_url,
        "company_status": new_company.company_status,
        "company_industry": new_company.company_industry,
        "company_website": new_company.company_website,
        "is_sponsor": bool(new_company.is_sponsor),
        "created_at": new_company.created_at,
        "job_count": 0
    }


@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update company information."""
    
    company = db.query(User).filter(
        User.id == company_id,
        User.role == UserRole.COMPANY
    ).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update fields if provided
    update_data = company_data.dict(exclude_unset=True)
    
    # Check email uniqueness if email is being updated
    if 'email' in update_data and update_data['email'] != company.email:
        existing = db.query(User).filter(User.email == update_data['email']).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    for field, value in update_data.items():
        if field == 'is_sponsor':
            setattr(company, field, 1 if value else 0)
        else:
            setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    job_count = db.query(Job).filter(Job.company_id == company.id).count()
    
    return {
        "id": company.id,
        "email": company.email,
        "company_name": company.company_name or "Unnamed Company",
        "company_description": company.company_description,
        "company_logo_url": company.company_logo_url,
        "company_status": company.company_status or 'draft',
        "company_industry": company.company_industry,
        "company_website": company.company_website,
        "is_sponsor": bool(company.is_sponsor),
        "created_at": company.created_at,
        "job_count": job_count
    }


@router.patch("/companies/{company_id}/status", response_model=CompanyResponse)
async def toggle_company_status(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Toggle company status between draft and published."""
    
    company = db.query(User).filter(
        User.id == company_id,
        User.role == UserRole.COMPANY
    ).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Toggle status
    current_status = company.company_status or 'draft'
    company.company_status = 'published' if current_status == 'draft' else 'draft'
    
    db.commit()
    db.refresh(company)
    
    job_count = db.query(Job).filter(Job.company_id == company.id).count()
    
    return {
        "id": company.id,
        "email": company.email,
        "company_name": company.company_name or "Unnamed Company",
        "company_description": company.company_description,
        "company_logo_url": company.company_logo_url,
        "company_status": company.company_status,
        "company_industry": company.company_industry,
        "company_website": company.company_website,
        "is_sponsor": bool(company.is_sponsor),
        "created_at": company.created_at,
        "job_count": job_count
    }


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a company and all associated data (jobs, applications, etc.)."""
    
    company = db.query(User).filter(
        User.id == company_id,
        User.role == UserRole.COMPANY
    ).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # SQLAlchemy will handle cascade deletion of related entities
    db.delete(company)
    db.commit()
    
    return None


@router.get("/jobs", response_model=List[JobListItem])
async def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all jobs in the system for admin overview."""
    
    jobs = db.query(Job).all()
    
    result = []
    for job in jobs:
        candidate_count = db.query(Application).filter(Application.job_id == job.id).count()
        
        # Normalize status to match frontend expectations
        status_map = {
            JobStatus.DRAFT: "draft",
            JobStatus.ACTIVE: "published",
            JobStatus.CLOSED: "closed"
        }
        
        result.append({
            "id": job.id,
            "title": job.title,
            "status": status_map.get(job.status, "draft"),
            "company_name": job.company.company_name or "Unknown Company",
            "company_id": job.company_id,
            "company_logo": job.company.company_logo_url,
            "candidate_count": candidate_count,
            "created_at": job.created_at,
            "location": "Remote", 
            "type": "Full-time"
        })
    
    return result
