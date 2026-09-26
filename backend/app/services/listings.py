"""Handles all listing queries: browsing, filtering, sorting, pagination, CRUD, and date availability."""
from datetime import date

from sqlalchemy import select, func, and_, or_, exists
from sqlalchemy.orm import Session, selectinload

from app.db_schema.listing import Listing, ListingImage, Amenity, listing_amenities
from app.db_schema.booking import Booking, BookingStatus
from app.db_schema.review import Review
from app.models.listing import ListingCreate, ListingUpdate


# ---- internal helpers -------------------------------------------------------

def _full_load_opts():
    """Returns selectinload options to fetch all related data needed for the detail view."""
    return (
        selectinload(Listing.images),
        selectinload(Listing.amenities),
        selectinload(Listing.host),
        selectinload(Listing.reviews).selectinload(Review.author),
    )


def _dates_conflict(check_in: date, check_out: date):
    """Booking conflicts when it starts before the requested checkout and ends after the requested checkin."""
    return and_(
        Booking.status == BookingStatus.confirmed,
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )


# ---- read -------------------------------------------------------------------

def find_listing(db: Session, listing_id: int) -> Listing | None:
    stmt = select(Listing).where(Listing.id == listing_id).options(*_full_load_opts())
    return db.execute(stmt).unique().scalar_one_or_none()


def fetch_listings(
    db: Session,
    *,
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    property_type: str | None = None,
    room_type: str | None = None,
    amenity_ids: list[int] | None = None,
    min_rating: float | None = None,
    sort: str | None = None,
    page: int = 1,
    page_size: int = 12,
) -> tuple[list[Listing], int]:
    stmt = select(Listing)

    if location:
        pattern = f"%{location}%"
        stmt = stmt.where(or_(Listing.city.ilike(pattern), Listing.country.ilike(pattern)))
    if guests:
        stmt = stmt.where(Listing.max_guests >= guests)
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if property_type:
        stmt = stmt.where(Listing.property_type == property_type)
    if room_type:
        stmt = stmt.where(Listing.room_type == room_type)
    if min_rating is not None:
        stmt = stmt.where(Listing.avg_rating >= min_rating)

    # All requested amenities must be present (AND logic).
    if amenity_ids:
        for aid in amenity_ids:
            stmt = stmt.where(
                exists().where(
                    and_(
                        listing_amenities.c.listing_id == Listing.id,
                        listing_amenities.c.amenity_id == aid,
                    )
                )
            )

    # Filter out listings that have a confirmed booking overlapping requested dates.
    if check_in and check_out:
        conflict = exists().where(
            and_(Booking.listing_id == Listing.id, _dates_conflict(check_in, check_out))
        )
        stmt = stmt.where(~conflict)

    # Count total results before applying pagination.
    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()

    order_options = {
        "price_asc": Listing.price_per_night.asc(),
        "price_desc": Listing.price_per_night.desc(),
        "rating": Listing.avg_rating.desc(),
        "newest": Listing.created_at.desc(),
    }
    stmt = stmt.order_by(order_options.get(sort, Listing.id.asc()))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    stmt = stmt.options(selectinload(Listing.images))

    items = db.execute(stmt).unique().scalars().all()
    return list(items), total


def get_blocked_ranges(db: Session, listing_id: int) -> list[Booking]:
    stmt = (
        select(Booking)
        .where(Booking.listing_id == listing_id, Booking.status == BookingStatus.confirmed)
        .order_by(Booking.check_in)
    )
    return list(db.execute(stmt).scalars().all())


def dates_are_taken(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    stmt = select(
        exists().where(and_(Booking.listing_id == listing_id, _dates_conflict(check_in, check_out)))
    )
    return bool(db.execute(stmt).scalar())


# ---- write ------------------------------------------------------------------

def _set_images(db: Session, listing: Listing, urls: list[str]):
    listing.images.clear()
    for position, url in enumerate(urls):
        listing.images.append(ListingImage(url=url, position=position))


def _set_amenities(db: Session, listing: Listing, amenity_ids: list[int]):
    amenities = db.execute(select(Amenity).where(Amenity.id.in_(amenity_ids))).scalars().all()
    listing.amenities = list(amenities)


def create_listing(db: Session, payload: ListingCreate) -> Listing:
    data = payload.model_dump(exclude={"image_urls", "amenity_ids"})
    listing = Listing(**data)
    _set_images(db, listing, payload.image_urls)
    _set_amenities(db, listing, payload.amenity_ids)
    db.add(listing)
    db.commit()
    return find_listing(db, listing.id)


def update_listing(db: Session, listing: Listing, payload: ListingUpdate) -> Listing:
    data = payload.model_dump(exclude_unset=True, exclude={"image_urls", "amenity_ids"})
    for field, value in data.items():
        setattr(listing, field, value)
    if payload.image_urls is not None:
        _set_images(db, listing, payload.image_urls)
    if payload.amenity_ids is not None:
        _set_amenities(db, listing, payload.amenity_ids)
    db.commit()
    return find_listing(db, listing.id)


def remove_listing(db: Session, listing: Listing) -> None:
    db.delete(listing)
    db.commit()
