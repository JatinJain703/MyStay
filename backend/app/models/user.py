"""User schemas."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

from app.db_schema.user import UserRole


class UserBase(BaseModel):
    name: str
    email: EmailStr
    photo_url: str | None = None
    bio: str | None = None


class UserCreate(UserBase):
    role: UserRole = UserRole.guest


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_superhost: bool
    created_at: datetime


class HostPublic(BaseModel):
    """Lightweight host card shown on listing detail."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str | None = None
    is_superhost: bool
    bio: str | None = None
    created_at: datetime
