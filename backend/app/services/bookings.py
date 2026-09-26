"""Booking creation, guest booking list, and cancellation logic."""
from datetime import date

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db_schema.booking import Booking, BookingStatus
from app.db_schema.listing import Listing
from app.services import listings as listings_svc
from app.services.pricing import build_quote
from app.models.booking import BookingCreate


def make_booking(db: Session, payload: BookingCreate) -> Booking:
    """Validate the request and persist a new confirmed booking."""
    listing = listings_svc.find_listing(db, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if payload.check_in < date.today():
        raise HTTPException(status_code=400, detail="Cannot book dates in the past")
    if payload.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"This place allows a maximum of {listing.max_guests} guests",
        )
    if listings_svc.dates_are_taken(db, listing.id, payload.check_in, payload.check_out):
        raise HTTPException(status_code=409, detail="Selected dates are no longer available")

    quote = build_quote(listing.price_per_night, payload.check_in, payload.check_out)
    booking = Booking(
        listing_id=listing.id,
        guest_id=payload.guest_id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nightly_rate=listing.price_per_night,
        nights=quote.nights,
        cleaning_fee=quote.cleaning_fee,
        service_fee=quote.service_fee,
        total_price=quote.total,
        status=BookingStatus.confirmed,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def _booking_load_opts():
    return (selectinload(Booking.listing).selectinload(Listing.images),)


def get_guest_bookings(db: Session, guest_id: int) -> list[Booking]:
    stmt = (
        select(Booking)
        .where(Booking.guest_id == guest_id)
        .options(*_booking_load_opts())
        .order_by(Booking.check_in.desc())
    )
    return list(db.execute(stmt).unique().scalars().all())


def get_single_booking(db: Session, booking_id: int) -> Booking | None:
    stmt = select(Booking).where(Booking.id == booking_id).options(*_booking_load_opts())
    return db.execute(stmt).unique().scalar_one_or_none()


def cancel_booking(db: Session, booking: Booking) -> Booking:
    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)
    return booking


def get_host_bookings(db: Session, host_id: int) -> list[Booking]:
    """Fetch all bookings across every listing owned by this host."""
    stmt = (
        select(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(Listing.host_id == host_id)
        .options(selectinload(Booking.listing).selectinload(Listing.images), selectinload(Booking.guest))
        .order_by(Booking.created_at.desc())
    )
    return list(db.execute(stmt).unique().scalars().all())
