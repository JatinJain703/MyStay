"""Wishlist / favorites endpoints."""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.listing import ListingCard
from app.services import wishlist as crud

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


class ToggleBody(BaseModel):
    user_id: int
    listing_id: int


class ToggleResult(BaseModel):
    listing_id: int
    favorited: bool


@router.get("", response_model=list[ListingCard])
def get_wishlist(user_id: int = Query(...), db: Session = Depends(get_db)):
    return crud.list_wishlist(db, user_id)


@router.get("/ids", response_model=list[int])
def get_wishlist_ids(user_id: int = Query(...), db: Session = Depends(get_db)):
    """Just the ids — lets the frontend mark favorited cards cheaply."""
    return crud.ids_for_user(db, user_id)


@router.post("", response_model=ToggleResult)
def toggle(body: ToggleBody, db: Session = Depends(get_db)):
    favorited = crud.toggle(db, body.user_id, body.listing_id)
    return ToggleResult(listing_id=body.listing_id, favorited=favorited)
