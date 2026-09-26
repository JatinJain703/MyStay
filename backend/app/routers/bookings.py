"""Booking endpoints — creation, listing, and cancellation."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.booking import BookingCreate, BookingOut, BookingWithListing
from app.services import bookings as bookings_svc

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    return bookings_svc.make_booking(db, payload)


@router.get("", response_model=list[BookingWithListing])
def my_trips(guest_id: int = Query(...), db: Session = Depends(get_db)):
    return bookings_svc.get_guest_bookings(db, guest_id)


@router.get("/{booking_id}", response_model=BookingWithListing)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = bookings_svc.get_single_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = bookings_svc.get_single_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return bookings_svc.cancel_booking(db, booking)
