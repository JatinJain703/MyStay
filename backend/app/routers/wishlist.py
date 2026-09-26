"""Wishlist (saved listings) endpoints."""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.listing import ListingCard
from app.services import wishlist as wishlist_svc

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


class ToggleBody(BaseModel):
    user_id: int
    listing_id: int


class ToggleResult(BaseModel):
    listing_id: int
    favorited: bool


@router.get("", response_model=list[ListingCard])
def get_wishlist(user_id: int = Query(...), db: Session = Depends(get_db)):
    return wishlist_svc.get_saved_listings(db, user_id)


@router.get("/ids", response_model=list[int])
def get_wishlist_ids(user_id: int = Query(...), db: Session = Depends(get_db)):
    """Returns only the listing IDs so the frontend can mark saved cards cheaply."""
    return wishlist_svc.get_saved_ids(db, user_id)


@router.post("", response_model=ToggleResult)
def toggle(body: ToggleBody, db: Session = Depends(get_db)):
    favorited = wishlist_svc.toggle_saved(db, body.user_id, body.listing_id)
    return ToggleResult(listing_id=body.listing_id, favorited=favorited)
