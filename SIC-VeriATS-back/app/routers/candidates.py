from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import shutil
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.profile import SensitiveData, PublicProfile, CV
from app.utils.dependencies import get_current_user, require_candidate

router = APIRouter()

class CandidateProfile(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    cv_url: Optional[str] = None
    cv_filename: Optional[str] = None
    completed: bool
    experience: str
    blind_code: str

class CVResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: str
    url: str

class UpdateProfileRequest(BaseModel):
    phone: Optional[str] = None
    experience: Optional[str] = None
    full_name: Optional[str] = None

@router.get("/me", response_model=CandidateProfile)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate)
):
    # Fetch sensitive data (name, phone)
    sensitive = db.query(SensitiveData).filter(SensitiveData.user_id == current_user.id).first()
    # Fetch public profile (experience, blind code)
    public = db.query(PublicProfile).filter(PublicProfile.user_id == current_user.id).first()
    # Fetch primary CV
    primary_cv = db.query(CV).filter(CV.user_id == current_user.id, CV.is_primary == True).first()
    if not primary_cv:
        primary_cv = db.query(CV).filter(CV.user_id == current_user.id).order_by(CV.created_at.desc()).first()

    return {
        "id": str(current_user.id),
        "full_name": sensitive.full_name if sensitive else current_user.email.split('@')[0].title(),
        "email": current_user.email,
        "phone": sensitive.phone if sensitive else "Not set",
        "cv_url": f"/static/cvs/{primary_cv.storage_path}" if primary_cv else None,
        "cv_filename": primary_cv.filename if primary_cv else None,
        "completed": True if (sensitive and public and primary_cv) else False,
        "experience": f"{public.years_of_experience} years" if public else "No experience set",
        "blind_code": public.blind_code if public else "N/A"
    }

@router.patch("/me", response_model=CandidateProfile)
async def update_my_profile(
    profile_update: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate)
):
    sensitive = db.query(SensitiveData).filter(SensitiveData.user_id == current_user.id).first()
    if not sensitive:
        sensitive = SensitiveData(user_id=current_user.id, full_name=profile_update.full_name or current_user.email.split('@')[0])
        db.add(sensitive)

    if profile_update.phone:
        sensitive.phone = profile_update.phone
    if profile_update.full_name:
        sensitive.full_name = profile_update.full_name

    public = db.query(PublicProfile).filter(PublicProfile.user_id == current_user.id).first()
    if not public:
        public = PublicProfile(user_id=current_user.id)
        db.add(public)

    if profile_update.experience:
        try:
            public.years_of_experience = int(''.join(filter(str.isdigit, profile_update.experience)))
        except:
            pass

    db.commit()
    db.refresh(sensitive)
    db.refresh(public)

    return await get_my_profile(db, current_user)

@router.post("/me/cv", response_model=CVResponse)
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate)
):
    # 1. Validate file type
    allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are allowed.")

    # 2. Create unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"

    # 3. Ensure candidate CV directory exists
    cv_dir = os.path.join(settings.UPLOAD_DIR, "cvs")
    if not os.path.exists(cv_dir):
        os.makedirs(cv_dir)

    file_path = os.path.join(cv_dir, unique_filename)

    # 4. Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # 5. Save metadata to DB
    # Mark others as NOT primary if this is the first or if we want to make it primary
    db.query(CV).filter(CV.user_id == current_user.id).update({"is_primary": False})

    new_cv = CV(
        user_id=current_user.id,
        filename=file.filename,
        storage_path=unique_filename,
        content_type=file.content_type,
        size=0,  # Could be improved by checking file size
        is_primary=True
    )
    db.add(new_cv)
    db.commit()
    db.refresh(new_cv)

    return {
        "id": new_cv.id,
        "filename": new_cv.filename,
        "uploaded_at": new_cv.created_at.isoformat(),
        "url": f"/static/cvs/{new_cv.storage_path}"
    }

@router.get("/me/cvs", response_model=List[CVResponse])
async def get_my_cvs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate)
):
    cvs = db.query(CV).filter(CV.user_id == current_user.id).order_by(CV.created_at.desc()).all()
    return [
        {
            "id": cv.id,
            "filename": cv.filename,
            "uploaded_at": cv.created_at.isoformat(),
            "url": f"/static/cvs/{cv.storage_path}"
        } for cv in cvs
    ]
