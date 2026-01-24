from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.application import Application as DBApplication, ApplicationStatus
from app.utils.dependencies import get_current_user, require_candidate

router = APIRouter()

# --- Schemas ---

class Company(BaseModel):
    id: str
    name: str
    vacancy_count: int
    description: Optional[str] = None
    logo_url: Optional[str] = None

class JobVacancy(BaseModel):
    id: str
    company_id: str
    title: str
    location: str
    type: str
    category: str
    description: str
    requirements: List[str]
    status: str

class Application(BaseModel):
    id: str
    vacancy_id: str
    vacancy_title: str
    company_name: str
    applied_at: str
    status: str
    requirements_met: bool

# --- Endpoints ---

@router.get("/companies", response_model=List[Company])
async def get_companies(db: Session = Depends(get_db)):
    companies = db.query(User).filter(User.role == UserRole.COMPANY).all()
    result = []
    for c in companies:
        job_count = db.query(Job).filter(Job.company_id == c.id).count()
        result.append({
            "id": str(c.id),
            "name": c.email.split('@')[0].replace('_', ' ').title(),
            "vacancy_count": job_count,
            "description": "Company registered in SIC-VeriATS",
            "logo_url": None
        })
    return result

@router.get("/companies/{id}", response_model=Company)
async def get_company(id: str, db: Session = Depends(get_db)):
    try:
        c_id = int(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    c = db.query(User).filter(User.id == c_id, User.role == UserRole.COMPANY).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")

    job_count = db.query(Job).filter(Job.company_id == c.id).count()
    return {
        "id": str(c.id),
        "name": c.email.split('@')[0].replace('_', ' ').title(),
        "vacancy_count": job_count,
        "description": "Company registered in SIC-VeriATS",
        "logo_url": None
    }

@router.get("/companies/{id}/vacancies", response_model=List[JobVacancy])
async def get_company_vacancies(id: str, db: Session = Depends(get_db)):
    try:
        c_id = int(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    jobs = db.query(Job).filter(Job.company_id == c_id).all()
    result = []
    for j in jobs:
        result.append({
            "id": str(j.id),
            "company_id": str(j.company_id),
            "title": j.title,
            "location": "Remote",
            "type": "Full-time",
            "category": "Engineering",
            "description": j.description,
            "requirements": [r.skill_name for r in j.requirements],
            "status": j.status.value.lower()
        })
    return result

@router.get("/vacancies/{id}", response_model=JobVacancy)
async def get_vacancy(id: str, db: Session = Depends(get_db)):
    try:
        v_id = int(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    j = db.query(Job).filter(Job.id == v_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Vacancy not found")

    return {
        "id": str(j.id),
        "company_id": str(j.company_id),
        "title": j.title,
        "location": "Remote",
        "type": "Full-time",
        "category": "Engineering",
        "description": j.description,
        "requirements": [r.skill_name for r in j.requirements],
        "status": j.status.value.lower()
    }

@router.post("/vacancies/{id}/apply", response_model=Application)
async def apply_vacancy(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate)
):
    try:
        v_id = int(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    j = db.query(Job).filter(Job.id == v_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Vacancy not found")

    # Check for existing application
    existing = db.query(DBApplication).filter(
        DBApplication.job_id == v_id,
        DBApplication.candidate_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    # Create new application
    new_app = DBApplication(
        job_id=v_id,
        candidate_id=current_user.id,
        status=ApplicationStatus.PENDING,
        score=0  # Initial score
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return {
        "id": str(new_app.id),
        "vacancy_id": str(j.id),
        "vacancy_title": j.title,
        "company_name": j.company.email.split('@')[0].title(),
        "applied_at": new_app.created_at.isoformat(),
        "status": new_app.status.value.lower(),
        "requirements_met": True
    }

@router.get("/applications/me", response_model=List[Application])
async def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate)
):
    apps = db.query(DBApplication).filter(DBApplication.candidate_id == current_user.id).all()
    result = []
    for a in apps:
        result.append({
            "id": str(a.id),
            "vacancy_id": str(a.job_id),
            "vacancy_title": a.job.title,
            "company_name": a.job.company.email.split('@')[0].title(),
            "applied_at": a.created_at.isoformat(),
            "status": a.status.value.lower(),
            "requirements_met": True
        })
    return result
