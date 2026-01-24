"""Validation Gateway model."""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ValidationStatus(str, enum.Enum):
    """Validation status for skill verification."""
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"


class Validation(Base):
    """
    Validation Gateway - connects Applications to Requirements.
    
    This is the core of the blind hiring validation system.
    Each validation represents a skill check for a specific candidate
    applying to a specific job requirement.
    
    Only Admin users can change validation status.
    When status changes to Verified, the application score is recalculated.
    """
    __tablename__ = "validations"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    
    status = Column(Enum(ValidationStatus), default=ValidationStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)  # Admin notes on validation
    
    validated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    application = relationship("Application", back_populates="validations")
    requirement = relationship("Requirement", back_populates="validations")

    def __repr__(self):
        return f"<Validation(id={self.id}, app_id={self.application_id}, req_id={self.requirement_id}, status={self.status})>"
