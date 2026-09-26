"""Wishlist toggle + listing."""
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db_schema.wishlist import Wishlist
from app.db_schema.listing import Listing


def list_wishlist(db: Session, user_id: int) -> list[Listing]:
    stmt = (
        select(Listing)
        .join(Wishlist, Wishlist.listing_id == Listing.id)
        .where(Wishlist.user_id == user_id)
        .options(selectinload(Listing.images))
        .order_by(Wishlist.created_at.desc())
    )
    return list(db.execute(stmt).unique().scalars().all())


def toggle(db: Session, user_id: int, listing_id: int) -> bool:
    """Add if absent, remove if present. Returns True when now favorited."""
    existing = db.execute(
        select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.listing_id == listing_id)
    ).scalar_one_or_none()
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(Wishlist(user_id=user_id, listing_id=listing_id))
    db.commit()
    return True


def ids_for_user(db: Session, user_id: int) -> list[int]:
    stmt = select(Wishlist.listing_id).where(Wishlist.user_id == user_id)
    return list(db.execute(stmt).scalars().all())
