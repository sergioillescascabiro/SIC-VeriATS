"""Utility functions for data anonymization in blind hiring."""
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import PublicProfile, CV
from app.models.application import Application
from typing import Optional


def get_anonymous_candidate_data(user_id: int, db: Session) -> Optional[dict]:
    """
    Fetch ONLY public profile data for a candidate.
    
    Returns:
        dict with blind_code, score, years_of_experience, skills, bio
        NEVER returns name, email, phone, university, address
    
    Returns None if candidate not found or has no public profile.
    """
    public_profile = db.query(PublicProfile).filter(PublicProfile.user_id == user_id).first()
    
    if not public_profile:
        return None
    
    return {
        "blind_code": public_profile.blind_code,
        "score": public_profile.score,
        "years_of_experience": public_profile.years_of_experience,
        "skills": public_profile.skills,
        "bio": public_profile.bio
    }


def get_cv_by_blind_code(blind_code: str, db: Session) -> Optional[CV]:
    """
    Lookup CV using blind_code as proxy for user_id.
    
    This allows companies to download CVs without knowing the candidate's identity.
    """
    public_profile = db.query(PublicProfile).filter(PublicProfile.blind_code == blind_code).first()
    
    if not public_profile:
        return None
    
    # Get primary CV for this user
    cv = db.query(CV).filter(
        CV.user_id == public_profile.user_id,
        CV.is_primary == True
    ).first()
    
    if not cv:
        # Fallback to most recent CV
        cv = db.query(CV).filter(
            CV.user_id == public_profile.user_id
        ).order_by(CV.created_at.desc()).first()
    
    return cv


def get_user_by_blind_code(blind_code: str, db: Session) -> Optional[User]:
    """Get user entity from blind_code (for internal lookups only)."""
    public_profile = db.query(PublicProfile).filter(PublicProfile.blind_code == blind_code).first()
    
    if not public_profile:
        return None
    
    return db.query(User).filter(User.id == public_profile.user_id).first()
