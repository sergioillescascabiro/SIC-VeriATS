"""State machine service for application status transitions."""
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationStatus, ApplicationStatusHistory
from app.models.user import User
from fastapi import HTTPException, status
from datetime import datetime


class ApplicationStateMachine:
    """
    State machine for application status transitions.
    
    Rules:
    - Pending → Verified: When admin validates skills
    - Verified → Interview: Only after verification
    - Any state → Rejected: Can be rejected at any time
    - Interview → Hired: Final positive outcome
    
    State changes are logged in ApplicationStatusHistory.
    """
    
    # Valid transitions
    VALID_TRANSITIONS = {
        ApplicationStatus.PENDING: [ApplicationStatus.VERIFIED, ApplicationStatus.REJECTED],
        ApplicationStatus.VERIFIED: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
        ApplicationStatus.INTERVIEW: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED],
        ApplicationStatus.REJECTED: [],  # Terminal state
        ApplicationStatus.HIRED: [],  # Terminal state
    }

    @staticmethod
    def can_transition(current_status: ApplicationStatus, new_status: ApplicationStatus) -> bool:
        """Check if transition is valid."""
        return new_status in ApplicationStateMachine.VALID_TRANSITIONS.get(current_status, [])

    @staticmethod
    def transition(
        db: Session,
        application: Application,
        new_status: ApplicationStatus,
        changed_by: User,
        notes: str = None
    ) -> Application:
        """
        Transition application to new status.
        
        Args:
            db: Database session
            application: Application to transition
            new_status: New status
            changed_by: User making the change
            notes: Optional notes
            
        Returns:
            Updated application
            
        Raises:
            HTTPException: If transition is invalid
        """
        old_status = application.status
        
        # Check if transition is valid
        if not ApplicationStateMachine.can_transition(old_status, new_status):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition: {old_status.value} → {new_status.value}. "
                       f"Allowed transitions: {[s.value for s in ApplicationStateMachine.VALID_TRANSITIONS[old_status]]}"
            )
        
        # Update application status
        application.status = new_status
        application.updated_at = datetime.utcnow()
        
        # Create history record
        history = ApplicationStatusHistory(
            application_id=application.id,
            changed_by=changed_by.id,
            old_status=old_status,
            new_status=new_status,
            notes=notes
        )
        
        db.add(history)
        db.commit()
        db.refresh(application)
        
        return application
