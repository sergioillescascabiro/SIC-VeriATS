"""User schemas for request/response validation."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user creation."""
    password: str
    role: str  # "Admin", "Company", or "Candidate"


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response (excludes password)."""
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2: allows ORM models


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
