"""Listing browse/search + host CRUD + availability + reviews sub-resource."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, distinct
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.db_schema.user import User
from app.db_schema.listing import Listing, Amenity
from app.models.common import Page
from app.models.listing import (
    ListingCard, ListingDetail, ListingCreate, ListingUpdate,
    AmenityOut, AvailabilityOut, DateRange,
)
from app.models.booking import PriceQuote
from app.models.review import ReviewOut, ReviewCreate
from app.services import listings as crud
from app.services import reviews as reviews_crud
from app.services.pricing import compute_quote

router = APIRouter(prefix="/api", tags=["listings"])


@router.get("/listings", response_model=Page[ListingCard])
def search_listings(
    db: Session = Depends(get_db),
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    property_type: str | None = None,
    room_type: str | None = None,
    amenities: str | None = Query(default=None, description="comma-separated amenity ids"),
    min_rating: float | None = None,
    sort: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=48),
):
    amenity_ids = [int(a) for a in amenities.split(",") if a.strip().isdigit()] if amenities else None
    items, total = crud.search_listings(
        db, location=location, check_in=check_in, check_out=check_out, guests=guests,
        min_price=min_price, max_price=max_price, property_type=property_type,
        room_type=room_type, amenity_ids=amenity_ids, min_rating=min_rating,
        sort=sort, page=page, page_size=page_size,
    )
    pages = (total + page_size - 1) // page_size
    return Page(items=items, total=total, page=page, pages=pages, page_size=page_size)


@router.get("/property-types", response_model=list[str])
def property_types(db: Session = Depends(get_db)):
    rows = db.execute(select(distinct(Listing.property_type)).order_by(Listing.property_type)).scalars().all()
    return list(rows)


@router.get("/amenities", response_model=list[AmenityOut])
def amenities(db: Session = Depends(get_db)):
    return db.execute(select(Amenity).order_by(Amenity.name)).scalars().all()


@router.get("/listings/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.get("/listings/{listing_id}/availability", response_model=AvailabilityOut)
def availability(listing_id: int, db: Session = Depends(get_db)):
    if not db.get(Listing, listing_id):
        raise HTTPException(status_code=404, detail="Listing not found")
    ranges = [DateRange(check_in=b.check_in, check_out=b.check_out) for b in crud.booked_ranges(db, listing_id)]
    return AvailabilityOut(listing_id=listing_id, booked_ranges=ranges)


@router.get("/listings/{listing_id}/quote", response_model=PriceQuote)
def quote(listing_id: int, check_in: date, check_out: date, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")
    return compute_quote(listing.price_per_night, check_in, check_out)


# ---- Reviews sub-resource --------------------------------------------------

@router.get("/listings/{listing_id}/reviews", response_model=list[ReviewOut])
def list_reviews(listing_id: int, db: Session = Depends(get_db)):
    return reviews_crud.list_for_listing(db, listing_id)


@router.post("/listings/{listing_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(listing_id: int, payload: ReviewCreate, db: Session = Depends(get_db)):
    if not db.get(Listing, listing_id):
        raise HTTPException(status_code=404, detail="Listing not found")
    # Bonus requirement: only guests who have completed a stay may review.
    if not reviews_crud.has_completed_stay(db, listing_id, payload.author_id):
        raise HTTPException(
            status_code=403,
            detail="You can only review a place after your stay is complete",
        )
    return reviews_crud.create_review(db, listing_id, payload)


# ---- Host CRUD -------------------------------------------------------------

@router.post("/listings", response_model=ListingDetail, status_code=201)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    # The creator is always the owner, regardless of payload host_id.
    payload.host_id = user.id
    return crud.create_listing(db, payload)


@router.put("/listings/{listing_id}", response_model=ListingDetail)
def update_listing(listing_id: int, payload: ListingUpdate, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own listings")
    return crud.update_listing(db, listing, payload)


@router.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    crud.delete_listing(db, listing)
