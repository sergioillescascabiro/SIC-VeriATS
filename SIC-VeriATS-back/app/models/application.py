"""Application model with state machine."""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ApplicationStatus(str, enum.Enum):
    """
    Application status with state machine enforcement.
    
    State flow:
    Pending → Verified → Interview → (Rejected/Hired)
    
    Rules:
    - Cannot move to Interview without Verified status
    - Status changes are tracked in ApplicationStatusHistory
    """
    PENDING = "Pending"
    VERIFIED = "Verified"
    INTERVIEW = "Interview"
    REJECTED = "Rejected"
    HIRED = "Hired"


class Application(Base):
    """
    Candidate application to a job.
    
    Applications go through a state machine enforced by business logic.
    All status changes are audited in ApplicationStatusHistory.
    """
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    cover_letter = Column(Text, nullable=True)
    
    # Calculated score based on validated requirements
    score = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    validations = relationship("Validation", back_populates="application", cascade="all, delete-orphan")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application(id={self.id}, candidate_id={self.candidate_id}, job_id={self.job_id}, status={self.status})>"


class ApplicationStatusHistory(Base):
    """
    Audit trail for application status changes.
    
    Tracks who changed the status, when, and what the previous/new status was.
    This is critical for transparency and compliance.
    """
    __tablename__ = "application_status_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    old_status = Column(Enum(ApplicationStatus), nullable=True)
    new_status = Column(Enum(ApplicationStatus), nullable=False)
    notes = Column(Text, nullable=True)
    
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    application = relationship("Application", back_populates="status_history")
    changed_by_user = relationship("User", back_populates="status_changes")

    def __repr__(self):
        return f"<History(app_id={self.application_id}, {self.old_status}→{self.new_status})>"
