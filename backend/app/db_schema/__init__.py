"""Import all models here so Base.metadata.create_all sees them."""
from app.db_schema.user import User
from app.db_schema.listing import Listing, ListingImage, Amenity, listing_amenities
from app.db_schema.booking import Booking, BookingStatus
from app.db_schema.review import Review
from app.db_schema.wishlist import Wishlist

__all__ = [
    "User",
    "Listing",
    "ListingImage",
    "Amenity",
    "listing_amenities",
    "Booking",
    "BookingStatus",
    "Review",
    "Wishlist",
]
