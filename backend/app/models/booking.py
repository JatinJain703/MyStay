"""Booking schemas."""
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.db_schema.booking import BookingStatus
from app.models.listing import ListingCard
from app.models.user import UserOut


class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1)

    @model_validator(mode="after")
    def check_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nightly_rate: float
    nights: int
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: BookingStatus
    created_at: datetime


class BookingWithListing(BookingOut):
    """My Trips / host dashboard rows carry the listing summary."""
    listing: ListingCard


class BookingWithGuest(BookingOut):
    """Host view of a booking includes who booked."""
    guest: UserOut


class PriceQuote(BaseModel):
    """Server-computed price breakdown for the booking widget."""
    nightly_rate: float
    nights: int
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total: float
