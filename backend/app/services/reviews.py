"""Review creation with rating-aggregate recomputation."""
from datetime import date

from sqlalchemy import select, func, and_, exists
from sqlalchemy.orm import Session, selectinload

from app.db_schema.review import Review
from app.db_schema.listing import Listing
from app.db_schema.booking import Booking, BookingStatus
from app.models.review import ReviewCreate


def has_completed_stay(db: Session, listing_id: int, user_id: int) -> bool:
    """True if the user has a non-cancelled booking for this listing that has ended.

    We treat any past-checkout, non-cancelled booking as a completed stay rather
    than relying solely on the `completed` status flag (which isn't auto-updated).
    """
    stmt = select(
        exists().where(
            and_(
                Booking.listing_id == listing_id,
                Booking.guest_id == user_id,
                Booking.status != BookingStatus.cancelled,
                Booking.check_out <= date.today(),
            )
        )
    )
    return bool(db.execute(stmt).scalar())


def list_for_listing(db: Session, listing_id: int) -> list[Review]:
    stmt = (
        select(Review)
        .where(Review.listing_id == listing_id)
        .options(selectinload(Review.author))
        .order_by(Review.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def _recompute_aggregates(db: Session, listing_id: int) -> None:
    avg, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    listing = db.get(Listing, listing_id)
    listing.avg_rating = round(float(avg), 2) if avg is not None else 0.0
    listing.review_count = int(count)


def create_review(db: Session, listing_id: int, payload: ReviewCreate) -> Review:
    # Upsert: one review per author per listing. If they've reviewed before,
    # editing simply updates their existing review (avoids a unique-constraint error).
    review = db.execute(
        select(Review).where(
            Review.listing_id == listing_id, Review.author_id == payload.author_id
        )
    ).scalar_one_or_none()

    if review:
        review.rating = payload.rating
        review.comment = payload.comment
    else:
        review = Review(listing_id=listing_id, author_id=payload.author_id,
                        rating=payload.rating, comment=payload.comment)
        db.add(review)

    db.flush()  # persist before recomputing so the change is counted
    _recompute_aggregates(db, listing_id)
    db.commit()
    db.refresh(review)
    # ensure author is loaded for the response
    db.refresh(review, attribute_names=["author"])
    return review
