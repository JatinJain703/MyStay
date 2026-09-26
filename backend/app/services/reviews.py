"""Review creation and per-listing rating aggregate recalculation."""
from datetime import date

from sqlalchemy import select, func, and_, exists
from sqlalchemy.orm import Session, selectinload

from app.db_schema.review import Review
from app.db_schema.listing import Listing
from app.db_schema.booking import Booking, BookingStatus
from app.models.review import ReviewCreate


def user_stayed_here(db: Session, listing_id: int, user_id: int) -> bool:
    """Returns True when the user has a past non-cancelled booking for this listing."""
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


def get_listing_reviews(db: Session, listing_id: int) -> list[Review]:
    stmt = (
        select(Review)
        .where(Review.listing_id == listing_id)
        .options(selectinload(Review.author))
        .order_by(Review.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def _refresh_rating_stats(db: Session, listing_id: int) -> None:
    """Recompute avg_rating and review_count on the listing row after any review change."""
    avg, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    listing = db.get(Listing, listing_id)
    listing.avg_rating = round(float(avg), 2) if avg is not None else 0.0
    listing.review_count = int(count)


def save_review(db: Session, listing_id: int, payload: ReviewCreate) -> Review:
    """Upsert a review — one per author per listing. Updates if it already exists."""
    review = db.execute(
        select(Review).where(
            Review.listing_id == listing_id, Review.author_id == payload.author_id
        )
    ).scalar_one_or_none()

    if review:
        review.rating = payload.rating
        review.comment = payload.comment
    else:
        review = Review(
            listing_id=listing_id,
            author_id=payload.author_id,
            rating=payload.rating,
            comment=payload.comment,
        )
        db.add(review)

    db.flush()
    _refresh_rating_stats(db, listing_id)
    db.commit()
    db.refresh(review)
    db.refresh(review, attribute_names=["author"])
    return review
