"""Listing schemas: create/update payloads and read models."""
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import HostPublic
from app.models.review import ReviewOut


class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    icon: str | None = None


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    position: int


class ListingBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    property_type: str
    room_type: str
    city: str
    country: str
    address: str | None = None
    latitude: float
    longitude: float
    price_per_night: float = Field(gt=0)
    max_guests: int = Field(ge=1)
    bedrooms: int = Field(ge=0)
    beds: int = Field(ge=0)
    bathrooms: float = Field(ge=0)


class ListingCreate(ListingBase):
    host_id: int
    image_urls: list[str] = Field(default_factory=list)
    amenity_ids: list[int] = Field(default_factory=list)


class ListingUpdate(BaseModel):
    """All fields optional for PATCH-style partial edits (sent via PUT)."""
    title: str | None = None
    description: str | None = None
    property_type: str | None = None
    room_type: str | None = None
    city: str | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: float | None = Field(default=None, gt=0)
    max_guests: int | None = Field(default=None, ge=1)
    bedrooms: int | None = None
    beds: int | None = None
    bathrooms: float | None = None
    image_urls: list[str] | None = None
    amenity_ids: list[int] | None = None


class ListingCard(BaseModel):
    """Compact shape for the explore grid."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    city: str
    country: str
    property_type: str
    price_per_night: float
    avg_rating: float
    review_count: int
    latitude: float
    longitude: float
    images: list[ImageOut]


class ListingDetail(ListingBase):
    """Full listing for the detail page."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    avg_rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    host: HostPublic
    images: list[ImageOut]
    amenities: list[AmenityOut]
    reviews: list[ReviewOut] = Field(default_factory=list)


class DateRange(BaseModel):
    check_in: date
    check_out: date


class AvailabilityOut(BaseModel):
    """Booked ranges the calendar must disable."""
    listing_id: int
    booked_ranges: list[DateRange]
