"""User and Authentication Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Payload for user registration."""

    email: EmailStr = Field(..., description="Unique email address for login.")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters).")
    full_name: str = Field(..., min_length=2, max_length=100, description="User full display name.")
    role: Optional[str] = Field("operator", description="Role: 'operator', 'analyst', or 'admin'.")


class UserLoginRequest(BaseModel):
    """Payload for user login."""

    email: EmailStr = Field(..., description="Registered email address.")
    password: str = Field(..., description="Plaintext password.")


class UserResponse(BaseModel):
    """Public user profile response."""

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT access token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class UserUpdateRequest(BaseModel):
    """Payload for updating user profile."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
