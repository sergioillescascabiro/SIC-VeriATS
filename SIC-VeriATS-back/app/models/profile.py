from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class SensitiveData(Base):
    """
    CRITICAL: Sensitive data that MUST NEVER be exposed to companies.

    This table contains personally identifiable information that could
    introduce bias in the hiring process. Access should be restricted to:
    - Admin users
    - The candidate themselves

    NEVER include this data in company-facing endpoints.
    """
    __tablename__ = "sensitive_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Sensitive fields - NEVER expose to companies
    full_name = Column(String, nullable=False)
    gender = Column(String, nullable=True)
    university = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)

    # Relationship
    user = relationship("User", back_populates="sensitive_data")

    def __repr__(self):
        return f"<SensitiveData(user_id={self.user_id})>"


class PublicProfile(Base):
    """
    Public profile data for blind hiring.

    This table contains ONLY data that is safe to show to companies
    without introducing bias. All identifying information is excluded.
    """
    __tablename__ = "public_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Anonymized identifier
    blind_code = Column(String, unique=True, index=True, nullable=False, default=lambda: f"CAND-{uuid.uuid4().hex[:8].upper()}")

    # Safe profile information
    years_of_experience = Column(Integer, default=0)
    bio = Column(Text, nullable=True)  # Should be carefully curated to avoid identifying info
    skills = Column(Text, nullable=True)  # Comma-separated or JSON

    # Calculated score based on validated skills
    score = Column(Integer, default=0, nullable=False)

    # Relationship
    user = relationship("User", back_populates="public_profile")

    def __repr__(self):
        return f"<PublicProfile(blind_code={self.blind_code}, score={self.score})>"


class CV(Base):
    """
    Candidate's Resume/CV file metadata.

    Files are stored in the filesystem (or cloud storage) and
    referenced here.
    """
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    is_primary = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="cvs")

    def __repr__(self):
        return f"<CV(id={self.id}, user_id={self.user_id}, filename={self.filename})>"
