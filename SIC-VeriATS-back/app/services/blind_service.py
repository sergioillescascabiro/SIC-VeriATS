"""Blind hiring service - data anonymization logic."""
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.validation import Validation, ValidationStatus
from app.models.profile import PublicProfile
from app.schemas.profile import BlindCandidateResponse
from typing import List


class BlindHiringService:
    """
    Service for blind hiring data operations.
    
    CRITICAL: This service ensures sensitive data is NEVER exposed to companies.
    """
    
    @staticmethod
    def calculate_application_score(db: Session, application: Application) -> int:
        """
        Calculate application score based on verified validations.
        
        Args:
            db: Database session
            application: Application to score
            
        Returns:
            Calculated score (number of verified skills)
        """
        verified_count = db.query(Validation).filter(
            Validation.application_id == application.id,
            Validation.status == ValidationStatus.VERIFIED
        ).count()
        
        return verified_count

    @staticmethod
    def get_blind_candidate_data(
        db: Session,
        application_id: int
    ) -> BlindCandidateResponse:
        """
        Get blind candidate data for an application.
        
        CRITICAL: This method returns ONLY anonymized data.
        SensitiveData is NEVER queried or returned.
        
        Args:
            db: Database session
            application_id: Application ID
            
        Returns:
            Blind candidate response with anonymized data only
        """
        # Get application with relationships
        application = db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            return None
        
        # Get public profile (NOT sensitive data)
        public_profile = db.query(PublicProfile).filter(
            PublicProfile.user_id == application.candidate_id
        ).first()
        
        if not public_profile:
            return None
        
        # Count verified skills
        verified_count = db.query(Validation).filter(
            Validation.application_id == application.id,
            Validation.status == ValidationStatus.VERIFIED
        ).count()
        
        # Return ONLY anonymized data
        return BlindCandidateResponse(
            blind_code=public_profile.blind_code,
            years_of_experience=public_profile.years_of_experience,
            bio=public_profile.bio,
            skills=public_profile.skills,
            score=application.score,
            application_id=application.id,
            application_status=application.status.value,
            verified_skills_count=verified_count
        )

    @staticmethod
    def get_all_blind_candidates_for_job(
        db: Session,
        job_id: int
    ) -> List[BlindCandidateResponse]:
        """
        Get all blind candidate data for a job.
        
        CRITICAL: Returns ONLY anonymized data for ALL candidates.
        
        Args:
            db: Database session
            job_id: Job ID
            
        Returns:
            List of blind candidate responses
        """
        applications = db.query(Application).filter(
            Application.job_id == job_id
        ).all()
        
        blind_candidates = []
        for app in applications:
            blind_data = BlindHiringService.get_blind_candidate_data(db, app.id)
            if blind_data:
                blind_candidates.append(blind_data)
        
        return blind_candidates
