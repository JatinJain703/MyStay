"""Seed the database with realistic sample data.

Run from the backend/ directory:  python -m app.seed
Drops and recreates all tables, then inserts users, amenities, listings
(with photos), bookings, and reviews so the app is immediately usable.
"""
from datetime import date, timedelta

from app.db import Base, engine, SessionLocal
from app.db_schema.user import User, UserRole
from app.db_schema.listing import Listing, ListingImage, Amenity
from app.db_schema.booking import Booking, BookingStatus
from app.db_schema.review import Review
from app.db_schema.wishlist import Wishlist
from app.services.pricing import compute_quote


AMENITIES = [
    ("Wifi", "wifi"), ("Kitchen", "kitchen"), ("Free parking", "parking"),
    ("Pool", "pool"), ("Hot tub", "hottub"), ("Air conditioning", "ac"),
    ("Heating", "heating"), ("Washer", "washer"), ("Dryer", "dryer"),
    ("TV", "tv"), ("Fireplace", "fireplace"), ("Gym", "gym"),
    ("Beach access", "beach"), ("EV charger", "ev"), ("Workspace", "workspace"),
    ("Pets allowed", "pets"), ("BBQ grill", "bbq"), ("Balcony", "balcony"),
]

USERS = [
    # hosts
    dict(name="Valentina Rossi", email="valentina@host.com", role=UserRole.host, is_superhost=True,
         photo_url="https://i.pravatar.cc/150?img=47",
         bio="Architect and slow-travel advocate. I curate spaces that feel like a second home."),
    dict(name="Liam Sherwood", email="liam@host.com", role=UserRole.host, is_superhost=True,
         photo_url="https://i.pravatar.cc/150?img=12",
         bio="Outdoors obsessive. Every cabin I own has a fireplace and a view worth waking up for."),
    dict(name="Mei Nakashima", email="mei@host.com", role=UserRole.host, is_superhost=False,
         photo_url="https://i.pravatar.cc/150?img=32",
         bio="Lover of clean lines and quiet mornings. My spaces are designed for deep rest."),
    dict(name="Rafael Alves", email="rafael@host.com", role=UserRole.host, is_superhost=True,
         photo_url="https://i.pravatar.cc/150?img=68",
         bio="Coastal living is my religion. Ocean views, salty air, and strong coffee await."),
    # guests
    dict(name="Priya Mehta", email="priya@guest.com", role=UserRole.guest, is_superhost=False,
         photo_url="https://i.pravatar.cc/150?img=45", bio="Slow traveler, bookworm, and avid cook."),
    dict(name="Ethan Kowalski", email="ethan@guest.com", role=UserRole.guest, is_superhost=False,
         photo_url="https://i.pravatar.cc/150?img=15", bio="Digital nomad hunting for great coffee and faster Wi-Fi."),
]

# (title, type, room_type, city, country, lat, lng, price, guests, br, beds, ba, [image urls], [amenity names], desc)
LISTINGS = [
    ("Luminous harborside loft", "Loft", "Entire place", "Barcelona", "Spain",
     41.3851, 2.1734, 145, 4, 2, 2, 1.5,
     ["photo-1502672260266-1c1ef2d93688", "photo-1522708323590-d24dbb6b0267",
      "photo-1560448204-e02f11c3d0e2", "photo-1493809842364-78817add7ffb"],
     ["Wifi", "Kitchen", "Air conditioning", "Washer", "Workspace", "Balcony"],
     "Soak in Mediterranean light from this open-plan loft perched above the marina. "
     "Vaulted ceilings, terracotta floors, and a wraparound balcony make it an instant retreat."),

    ("Alpine hideout with cedar hot tub", "Cabin", "Entire place", "Aspen", "United States",
     39.1911, -106.8175, 320, 6, 3, 4, 2,
     ["photo-1449158743715-0a90ebb6d2d8", "photo-1518732714860-b62714ce0c59",
      "photo-1520250497591-112f2f40a3f4", "photo-1600585154340-be6161a56a0c"],
     ["Wifi", "Kitchen", "Free parking", "Hot tub", "Heating", "Fireplace", "TV"],
     "Hand-hewn timbers, a roaring stone hearth, and a cedar hot tub waiting outside. "
     "Ski-in ski-out access puts the slopes steps from your door — après-ski perfection."),

    ("Zen micro-apartment in Shimokitazawa", "Apartment", "Entire place", "Tokyo", "Japan",
     35.6762, 139.6503, 98, 2, 1, 1, 1,
     ["photo-1554995207-c18c203602cb", "photo-1522708323590-d24dbb6b0267",
      "photo-1502005229762-cf1b2da7c5d6"],
     ["Wifi", "Kitchen", "Air conditioning", "Heating", "Workspace", "TV"],
     "A curated bolt-hole in Tokyo's coolest neighbourhood. Tatami nook, hand-ground coffee, "
     "and the city's best vintage stores and ramen joints just outside."),

    ("Oceanfront villa with horizon pool", "Villa", "Entire place", "Tulum", "Mexico",
     20.2114, -87.4654, 480, 8, 4, 5, 3.5,
     ["photo-1512917774080-9991f1c4c750", "photo-1613490493576-7fde63acd811",
      "photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c"],
     ["Wifi", "Kitchen", "Pool", "Free parking", "Air conditioning", "Beach access", "BBQ grill"],
     "Step off the deck straight onto powdery white sand. This sleek villa has a horizon pool, "
     "an outdoor kitchen, and a jungle shower — pure Riviera Maya indulgence."),

    ("Honey-stone cottage with rose garden", "Cottage", "Entire place", "Cotswolds", "United Kingdom",
     51.8330, -1.8433, 175, 4, 2, 2, 1,
     ["photo-1568605114967-8130f3a36994", "photo-1523217582562-09d0def993a6",
      "photo-1512917774080-9991f1c4c750"],
     ["Wifi", "Kitchen", "Free parking", "Heating", "Fireplace", "Pets allowed"],
     "Rambling roses, a bubbling stream, and centuries-old limestone walls. Curl up beside "
     "the Aga, explore meadow footpaths, and bring the dog — all are welcome here."),

    ("Glass-tower apartment, Manhattan skyline", "Apartment", "Entire place", "New York", "United States",
     40.7128, -74.0060, 265, 3, 1, 2, 1,
     ["photo-1502672260266-1c1ef2d93688", "photo-1493809842364-78817add7ffb",
      "photo-1560448204-e02f11c3d0e2"],
     ["Wifi", "Kitchen", "Air conditioning", "Heating", "Gym", "Workspace", "EV charger"],
     "Floor-to-ceiling glass frames an unbroken panorama of Manhattan. Concierge, rooftop gym, "
     "and a subway entrance fifty steps from the lobby — the city is yours."),

    ("Family-run vineyard suite, Chianti hills", "Guesthouse", "Private room", "Tuscany", "Italy",
     43.7696, 11.2558, 130, 2, 1, 1, 1,
     ["photo-1523217582562-09d0def993a6", "photo-1600585154340-be6161a56a0c",
      "photo-1568605114967-8130f3a36994"],
     ["Wifi", "Kitchen", "Free parking", "Pool", "Air conditioning", "BBQ grill"],
     "Sleep among centuries-old vines and wake to espresso and fresh figs. "
     "Our private suite opens onto an olive grove — sunset Chianti tastings included."),

    ("Glass A-frame deep in the redwoods", "Cabin", "Entire place", "Big Sur", "United States",
     36.2704, -121.8081, 295, 4, 2, 2, 1.5,
     ["photo-1449158743715-0a90ebb6d2d8", "photo-1520250497591-112f2f40a3f4",
      "photo-1518732714860-b62714ce0c59"],
     ["Wifi", "Kitchen", "Free parking", "Hot tub", "Heating", "Fireplace", "Pets allowed"],
     "Ancient redwoods tower over this architect-designed A-frame. Cathedral windows, "
     "a wood-burning stove, and total silence — exactly the reset you've been looking for."),

    ("Golden-era canal apartment, Jordaan", "Apartment", "Entire place", "Amsterdam", "Netherlands",
     52.3676, 4.9041, 210, 4, 2, 2, 1,
     ["photo-1560448204-e02f11c3d0e2", "photo-1502672260266-1c1ef2d93688",
      "photo-1522708323590-d24dbb6b0267"],
     ["Wifi", "Kitchen", "Heating", "Washer", "TV", "Workspace"],
     "Original ship's-timber beams, leaning bookshelves, and a canal view straight from "
     "a Vermeer painting. Cycle everywhere, drift past houseboats, live like an Amsterdammer."),

    ("Riad with courtyard pool, medina edge", "Villa", "Entire place", "Marrakech", "Morocco",
     31.6295, -7.9811, 220, 6, 3, 3, 2,
     ["photo-1600596542815-ffad4c1539a9", "photo-1613490493576-7fde63acd811",
      "photo-1600607687939-ce8a6c25118c"],
     ["Wifi", "Kitchen", "Pool", "Air conditioning", "Free parking", "BBQ grill", "Balcony"],
     "Mosaic fountains, bougainvillea-draped walls, and a jade-blue plunge pool at the centre. "
     "The souks are a ten-minute stroll; your own rooftop terrace never gets old."),

    ("Fjord-edge cabin with sauna & kayaks", "Cabin", "Entire place", "Bergen", "Norway",
     60.3913, 5.3221, 240, 5, 3, 3, 2,
     ["photo-1520250497591-112f2f40a3f4", "photo-1449158743715-0a90ebb6d2d8",
      "photo-1600585154340-be6161a56a0c"],
     ["Wifi", "Kitchen", "Free parking", "Hot tub", "Heating", "Fireplace"],
     "Birch-lined shores, a wood-fired sauna, and two kayaks at the dock. "
     "Chase the northern lights in winter or paddle under the midnight sun in summer."),

    ("Azulejo townhouse, hilltop Alfama", "Townhouse", "Entire place", "Lisbon", "Portugal",
     38.7223, -9.1393, 160, 5, 2, 3, 2,
     ["photo-1493809842364-78817add7ffb", "photo-1568605114967-8130f3a36994",
      "photo-1523217582562-09d0def993a6"],
     ["Wifi", "Kitchen", "Air conditioning", "Heating", "Washer", "Balcony", "TV"],
     "Hand-painted tiles on every wall, a terrace with sweeping Tagus views, "
     "and fado drifting up from the lane below. Lisbon's most romantic neighbourhood, all yours."),
]


def run():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Amenities
        amenity_map: dict[str, Amenity] = {}
        for name, icon in AMENITIES:
            a = Amenity(name=name, icon=icon)
            db.add(a)
            amenity_map[name] = a
        db.flush()

        # Users
        users = [User(**u) for u in USERS]
        db.add_all(users)
        db.flush()
        hosts = [u for u in users if u.role == UserRole.host]
        guests = [u for u in users if u.role == UserRole.guest]

        # Listings (round-robin hosts)
        listing_objs: list[Listing] = []
        for i, row in enumerate(LISTINGS):
            (title, ptype, room, city, country, lat, lng, price, mg, br, beds, ba,
             imgs, ams, desc) = row
            host = hosts[i % len(hosts)]
            listing = Listing(
                host_id=host.id, title=title, description=desc, property_type=ptype,
                room_type=room, city=city, country=country, latitude=lat, longitude=lng,
                address=f"{city}, {country}", price_per_night=price, max_guests=mg,
                bedrooms=br, beds=beds, bathrooms=ba,
            )
            listing.images = [
                ListingImage(url=f"https://images.unsplash.com/{p}?auto=format&fit=crop&w=1200&q=80",
                             position=pos)
                for pos, p in enumerate(imgs)
            ]
            listing.amenities = [amenity_map[a] for a in ams if a in amenity_map]
            db.add(listing)
            listing_objs.append(listing)
        db.flush()

        # Bookings — a mix of past (completed) and future (confirmed) reservations.
        today = date.today()
        booking_plan = [
            # (listing index, guest index, start offset days, nights, status)
            (0, 0, -40, 4, BookingStatus.completed),
            (0, 1, 12, 5, BookingStatus.confirmed),
            (1, 0, 20, 3, BookingStatus.confirmed),
            (3, 1, -20, 6, BookingStatus.completed),
            (3, 0, 30, 4, BookingStatus.confirmed),
            (5, 1, 8, 2, BookingStatus.confirmed),
            (7, 0, -10, 3, BookingStatus.completed),
            (9, 1, 45, 5, BookingStatus.confirmed),
            (10, 0, 15, 4, BookingStatus.confirmed),
        ]
        for li, gi, offset, nights, status in booking_plan:
            listing = listing_objs[li]
            guest = guests[gi % len(guests)]
            check_in = today + timedelta(days=offset)
            check_out = check_in + timedelta(days=nights)
            quote = compute_quote(listing.price_per_night, check_in, check_out)
            db.add(Booking(
                listing_id=listing.id, guest_id=guest.id, check_in=check_in,
                check_out=check_out, guests=min(2, listing.max_guests),
                nightly_rate=listing.price_per_night, nights=quote.nights,
                cleaning_fee=quote.cleaning_fee, service_fee=quote.service_fee,
                total_price=quote.total, status=status,
            ))

        # Reviews on the completed-stay listings + a few others.
        review_plan = [
            (0, 0, 5, "The loft was even better than the photos. That balcony view over the harbour at dusk — unforgettable."),
            (0, 1, 4, "Spacious, spotless, and perfectly located. A little traffic noise at night but nothing a fan couldn't fix."),
            (3, 1, 5, "We never wanted to leave. The infinity pool at sunrise and the sound of the ocean was pure magic."),
            (3, 0, 5, "Best holiday we've had in years. The villa, the beach, the outdoor kitchen — absolutely flawless."),
            (7, 0, 4, "Waking up inside a redwood forest is surreal. Pack your own groceries — the remoteness is the whole point."),
            (1, 1, 5, "Sliding into that hot tub after a powder day on the mountain was the highlight of our whole trip."),
            (5, 0, 4, "Breakfast with an espresso looking out over the Chianti hills. Simple, perfect, would go back tomorrow."),
            (10, 1, 5, "Every corner of this cabin had something beautiful. The sauna by the fjord sealed it — truly special."),
        ]
        for li, gi, rating, comment in review_plan:
            db.add(Review(
                listing_id=listing_objs[li].id, author_id=guests[gi % len(guests)].id,
                rating=rating, comment=comment,
            ))
        db.flush()

        # Recompute rating aggregates.
        from sqlalchemy import select, func
        for listing in listing_objs:
            avg, count = db.execute(
                select(func.avg(Review.rating), func.count(Review.id))
                .where(Review.listing_id == listing.id)
            ).one()
            listing.avg_rating = round(float(avg), 2) if avg else 0.0
            listing.review_count = int(count)

        # A couple of wishlist favorites.
        db.add_all([
            Wishlist(user_id=guests[0].id, listing_id=listing_objs[3].id),
            Wishlist(user_id=guests[0].id, listing_id=listing_objs[9].id),
            Wishlist(user_id=guests[1].id, listing_id=listing_objs[1].id),
        ])

        db.commit()
        print(f"Seeded {len(users)} users, {len(listing_objs)} listings, "
              f"{len(booking_plan)} bookings, {len(review_plan)} reviews.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
