"""User model with role-based access control."""
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User roles for role-based access control."""
    ADMIN = "Admin"
    COMPANY = "Company"
    CANDIDATE = "Candidate"


class User(Base):
    """
    User model with role-based access.

    Roles:
    - Admin: Can validate skills and manage the system
    - Company: Can post jobs and view blind candidate profiles
    - Candidate: Can apply to jobs
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    auth_id = Column(UUID(as_uuid=True), unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    # Company fields (for users with role=Company)
    company_name = Column(String, nullable=True)        # Official company name
    company_description = Column(String, nullable=True) # Company description
    company_logo_url = Column(String, nullable=True)    # URL to company logo
    company_status = Column(String, default='draft', nullable=True)  # draft/published
    company_industry = Column(String, nullable=True)    # Industry/sector
    company_website = Column(String, nullable=True)     # Company website
    is_sponsor = Column(Integer, default=0, nullable=False)  # Is the company a sponsor? (1=True, 0=False)

    is_active = Column(Integer, default=1, nullable=False)  # Using Integer for boolean (1=True, 0=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sensitive_data = relationship("SensitiveData", back_populates="user", uselist=False, cascade="all, delete-orphan")
    public_profile = relationship("PublicProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    cvs = relationship("CV", back_populates="user", cascade="all, delete-orphan")
    status_changes = relationship("ApplicationStatusHistory", back_populates="changed_by_user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
