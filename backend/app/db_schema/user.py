"""User model. Auth is mocked; `role` distinguishes guest vs host."""
import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Enum, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class UserRole(str, enum.Enum):
    guest = "guest"
    host = "host"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.guest, nullable=False)
    is_superhost: Mapped[bool] = mapped_column(Boolean, default=False)
    bio: Mapped[str | None] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # A user can host many listings and, as a guest, make many bookings.
    listings: Mapped[list["Listing"]] = relationship(back_populates="host", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="guest", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="author", cascade="all, delete-orphan")
    wishlist: Mapped[list["Wishlist"]] = relationship(back_populates="user", cascade="all, delete-orphan")
