from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # 1. Fetch user from DB
    user = db.query(User).filter(User.email == credentials.email).first()
    
    # 2. Verify existence and password
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Check if active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # 4. Generate access token
    role_str = user.role.value if hasattr(user.role, 'value') else user.role
    access_token = create_access_token(data={"sub": str(user.id), "role": role_str.lower()})
    
    # 5. Build response
    return {
        "access_token": access_token,
        "refresh_token": "refresh-token-not-implemented", # Optional: implement real refresh
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": role_str.lower(),
            "name": user.email.split('@')[0].replace('.', ' ').title()
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": role_str.lower(),
        "name": current_user.email.split('@')[0].replace('.', ' ').title()
    }

@router.post("/refresh")
async def refresh_token():
    # Placeholder for future implementation
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Refresh token not yet implemented")

@router.post("/logout")
async def logout():
    """Simple logout endpoint to satisfy frontend service."""
    return {"message": "Successfully logged out"}
