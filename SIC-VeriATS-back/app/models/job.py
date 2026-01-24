"""Job and Requirement models."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class JobStatus(str, enum.Enum):
    """Job posting status."""
    DRAFT = "Draft"
    ACTIVE = "Active"
    CLOSED = "Closed"


class Job(Base):
    """
    Job posting created by companies.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("User", back_populates="jobs")
    requirements = relationship("Requirement", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, status={self.status})>"


class ProficiencyLevel(str, enum.Enum):
    """Skill proficiency levels."""
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    EXPERT = "Expert"


class Requirement(Base):
    """
    Skill requirements for a job.
    
    Each requirement is validated independently for each candidate.
    """
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    skill_name = Column(String, nullable=False)
    proficiency_level = Column(Enum(ProficiencyLevel), default=ProficiencyLevel.INTERMEDIATE, nullable=False)
    description = Column(Text, nullable=True)
    is_required = Column(Integer, default=1, nullable=False)  # 1=required, 0=optional

    # Relationships
    job = relationship("Job", back_populates="requirements")
    validations = relationship("Validation", back_populates="requirement", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Requirement(id={self.id}, skill={self.skill_name}, level={self.proficiency_level})>"
