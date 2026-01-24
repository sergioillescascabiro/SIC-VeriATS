"""Company router - Read-only access to jobs and anonymized candidates."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import os

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.utils.dependencies import require_company
from app.utils.anonymization import get_anonymous_candidate_data, get_cv_by_blind_code

router = APIRouter()

# --- Schemas ---

class DashboardStats(BaseModel):
    active_jobs: int
    total_candidates: int
    company_name: str

class JobSummary(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: str
    candidate_count: int

class JobDetail(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: str
    requirements: List[dict]

class AnonymousCandidate(BaseModel):
    blind_code: str
    score: int
    years_of_experience: int
    skills: Optional[str]
    bio: Optional[str]
    application_status: str

# --- Endpoints ---

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company)
):
    """Get company dashboard statistics."""
    active_jobs = db.query(Job).filter(
        Job.company_id == current_user.id,
        Job.status == JobStatus.ACTIVE
    ).count()
    
    # Count distinct candidates across all company jobs
    total_candidates = db.query(func.count(func.distinct(Application.candidate_id)))\
        .join(Job)\
        .filter(
            Job.company_id == current_user.id,
            Application.status.in_([ApplicationStatus.VERIFIED, ApplicationStatus.HIRED])
        ).scalar()
    
    return {
        "active_jobs": active_jobs,
        "total_candidates": total_candidates or 0,
        "company_name": current_user.company_name or current_user.email.split('@')[0].replace('_', ' ').title()
    }

@router.get("/jobs", response_model=List[JobSummary])
async def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company)
):
    """List all jobs owned by the company."""
    jobs = db.query(Job).filter(Job.company_id == current_user.id).all()
    
    result = []
    for job in jobs:
        candidate_count = db.query(Application).filter(
            Application.job_id == job.id,
            Application.status.in_([ApplicationStatus.VERIFIED, ApplicationStatus.HIRED])
        ).count()
        
        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "status": job.status.value.lower(),
            "created_at": job.created_at.isoformat(),
            "candidate_count": candidate_count
        })
    
    return result

@router.get("/jobs/{job_id}", response_model=JobDetail)
async def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company)
):
    """Get detailed view of a specific job (read-only)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify job belongs to company
    if job.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    requirements = [
        {
            "skill_name": req.skill_name,
            "proficiency_level": req.proficiency_level.value,
            "description": req.description,
            "is_required": bool(req.is_required)
        }
        for req in job.requirements
    ]
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "status": job.status.value.lower(),
        "created_at": job.created_at.isoformat(),
        "requirements": requirements
    }

@router.get("/jobs/{job_id}/candidates", response_model=List[AnonymousCandidate])
async def get_job_candidates(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company)
):
    """Get anonymized list of selected candidates for a job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get applications with VERIFIED or HIRED status
    applications = db.query(Application).filter(
        Application.job_id == job_id,
        Application.status.in_([ApplicationStatus.VERIFIED, ApplicationStatus.HIRED])
    ).all()
    
    result = []
    for app in applications:
        candidate_data = get_anonymous_candidate_data(app.candidate_id, db)
        if candidate_data:
            result.append({
                **candidate_data,
                "application_status": app.status.value.lower()
            })
    
    return result

@router.get("/candidates/{blind_code}", response_model=AnonymousCandidate)
async def get_candidate_detail(
    blind_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company)
):
    """Get anonymized candidate profile by blind_code."""
    candidate_data = get_anonymous_candidate_data(blind_code, db)
    
    if not candidate_data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Verify company has access to this candidate through an application
    from app.utils.anonymization import get_user_by_blind_code
    candidate_user = get_user_by_blind_code(blind_code, db)
    
    if not candidate_user:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if company has any application from this candidate
    application_exists = db.query(Application).join(Job).filter(
        Job.company_id == current_user.id,
        Application.candidate_id == candidate_user.id,
        Application.status.in_([ApplicationStatus.VERIFIED, ApplicationStatus.HIRED])
    ).first()
    
    if not application_exists:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        **candidate_data,
        "application_status": application_exists.status.value.lower()
    }

@router.get("/candidates/{blind_code}/cv")
async def download_candidate_cv(
    blind_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company)
):
    """Download anonymized CV for a candidate."""
    cv = get_cv_by_blind_code(blind_code, db)
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    
    # Verify company has access
    from app.utils.anonymization import get_user_by_blind_code
    candidate_user = get_user_by_blind_code(blind_code, db)
    
    if not candidate_user:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    application_exists = db.query(Application).join(Job).filter(
        Job.company_id == current_user.id,
        Application.candidate_id == candidate_user.id,
        Application.status.in_([ApplicationStatus.VERIFIED, ApplicationStatus.HIRED])
    ).first()
    
    if not application_exists:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Build file path
    cv_path = os.path.join(settings.UPLOAD_DIR, "cvs", cv.storage_path)
    
    if not os.path.exists(cv_path):
        raise HTTPException(status_code=404, detail="CV file not found on server")
    
    # Return file with anonymized filename
    ext = os.path.splitext(cv.filename)[1]
    anonymized_filename = f"{blind_code}_resume{ext}"
    
    return FileResponse(
        path=cv_path,
        filename=anonymized_filename,
        media_type=cv.content_type
    )
