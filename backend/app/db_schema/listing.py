"""Listing, its photos, and amenities (M:N)."""
from datetime import datetime

from sqlalchemy import (
    String, Integer, Float, Text, DateTime, ForeignKey, Table, Column, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

# M:N join table between listings and amenities.
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(80))  # icon key for the frontend

    listings: Mapped[list["Listing"]] = relationship(
        secondary=listing_amenities, back_populates="amenities"
    )


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    property_type: Mapped[str] = mapped_column(String(50), index=True)  # e.g. "Apartment", "Cabin"
    room_type: Mapped[str] = mapped_column(String(50))                  # "Entire place" | "Private room"

    # Location
    city: Mapped[str] = mapped_column(String(120), index=True)
    country: Mapped[str] = mapped_column(String(120), index=True)
    address: Mapped[str | None] = mapped_column(String(300))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)

    # Pricing & capacity
    price_per_night: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    max_guests: Mapped[int] = mapped_column(Integer, default=2)
    bedrooms: Mapped[int] = mapped_column(Integer, default=1)
    beds: Mapped[int] = mapped_column(Integer, default=1)
    bathrooms: Mapped[float] = mapped_column(Float, default=1)

    # Denormalized rating aggregates for fast card rendering & sorting.
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    host: Mapped["User"] = relationship(back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.position"
    )
    amenities: Mapped[list["Amenity"]] = relationship(
        secondary=listing_amenities, back_populates="listings"
    )
    bookings: Mapped[list["Booking"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(600), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0)  # ordering in the gallery

    listing: Mapped["Listing"] = relationship(back_populates="images")
