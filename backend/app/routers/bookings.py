"""Booking flow endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.booking import BookingCreate, BookingOut, BookingWithListing
from app.services import bookings as crud

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    return crud.create_booking(db, payload)


@router.get("", response_model=list[BookingWithListing])
def my_trips(guest_id: int = Query(...), db: Session = Depends(get_db)):
    return crud.list_guest_bookings(db, guest_id)


@router.get("/{booking_id}", response_model=BookingWithListing)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return crud.cancel_booking(db, booking)
