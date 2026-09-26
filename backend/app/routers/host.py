"""Host dashboard endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.db_schema.listing import Listing
from app.models.listing import ListingCard
from app.models.booking import BookingWithGuest
from app.services import bookings as bookings_crud

router = APIRouter(prefix="/api/host", tags=["host"])


@router.get("/{host_id}/listings", response_model=list[ListingCard])
def host_listings(host_id: int, db: Session = Depends(get_db)):
    stmt = (
        select(Listing)
        .where(Listing.host_id == host_id)
        .options(selectinload(Listing.images))
        .order_by(Listing.created_at.desc())
    )
    return db.execute(stmt).unique().scalars().all()


@router.get("/{host_id}/bookings", response_model=list[BookingWithGuest])
def host_bookings(host_id: int, db: Session = Depends(get_db)):
    return bookings_crud.list_host_bookings(db, host_id)
