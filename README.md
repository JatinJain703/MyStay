# MyStay — Full-Stack Rental Marketplace

A full-stack property rental marketplace built as a portfolio/assignment project.  
It covers the complete booking flow: browse → view listing → pick dates → book → manage bookings as guest or host.

> **Live Demo:** [my-stay-delta.vercel.app](https://my-stay-delta.vercel.app)  
> **API (Render):** [mystay-hg1b.onrender.com](https://mystay-hg1b.onrender.com)  
> **API Docs:** [mystay-hg1b.onrender.com/docs](https://mystay-hg1b.onrender.com/docs)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Setup & Running Locally](#setup--running-locally)
- [API Reference](#api-reference)
- [Assumptions Made](#assumptions-made)

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | **FastAPI** 0.115 |
| ORM | **SQLAlchemy** 2.0 (declarative, mapped columns) |
| Database | **SQLite** (file-based, zero-config) |
| Validation | **Pydantic** v2 |
| Server | **Uvicorn** (ASGI) |
| Language | Python 3.11+ |

### Frontend
| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) |
| Styling | **Tailwind CSS v3** |
| Date picker | `react-day-picker` v10 |
| Icons | `lucide-react` |
| Notifications | `react-hot-toast` |
| Map | OpenStreetMap via `<iframe>` (no API key required) |
| Language | TypeScript 5 |

---

## Project Structure

```
airbnb/
├── backend/
│   ├── app/
│   │   ├── db.py              # SQLAlchemy engine + session factory
│   │   ├── db_schema/         # ORM table definitions (one file per domain)
│   │   │   ├── user.py
│   │   │   ├── listing.py     # Listing, ListingImage, Amenity, listing_amenities
│   │   │   ├── booking.py
│   │   │   ├── review.py
│   │   │   └── wishlist.py
│   │   ├── models/            # Pydantic request/response schemas
│   │   │   ├── user.py
│   │   │   ├── listing.py
│   │   │   ├── booking.py
│   │   │   ├── review.py
│   │   │   └── common.py      # Generic Page[T] paginated response
│   │   ├── routers/           # FastAPI route handlers (one file per domain)
│   │   │   ├── auth.py        # /api/users  (list, create, become-host)
│   │   │   ├── listings.py    # /api/listings  (CRUD, search, availability)
│   │   │   ├── bookings.py    # /api/bookings  (create, cancel, guest/host views)
│   │   │   ├── wishlist.py    # /api/wishlist  (toggle, list, ids)
│   │   │   └── host.py        # /api/host      (listings + bookings dashboard)
│   │   ├── services/          # Business logic decoupled from HTTP layer
│   │   ├── deps.py            # FastAPI dependency injection (DB session)
│   │   ├── main.py            # App factory, CORS, router registration
│   │   └── seed.py            # One-shot database seeder
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   │   ├── layout.tsx
    │   │   ├── page.tsx       # Home / Discover
    │   │   ├── listings/[id]/ # Listing detail
    │   │   ├── trips/         # Guest bookings (renamed: Bookings)
    │   │   ├── wishlist/      # Saved listings
    │   │   └── host/          # Host dashboard + listing form
    │   ├── components/        # Reusable UI components
    │   │   ├── Navbar.tsx
    │   │   ├── SearchBar.tsx
    │   │   ├── ExploreGrid.tsx
    │   │   ├── ListingCard.tsx
    │   │   ├── BookingWidget.tsx
    │   │   ├── Gallery.tsx
    │   │   ├── FiltersModal.tsx
    │   │   ├── ReviewsSection.tsx
    │   │   ├── StaticMap.tsx
    │   │   ├── GlobeMenu.tsx
    │   │   └── UserMenu.tsx
    │   └── lib/               # Shared utilities
    │       ├── api.ts          # Typed fetch client (all backend calls)
    │       ├── types.ts        # TypeScript interfaces matching API schemas
    │       ├── format.ts       # Currency, date, duration formatters
    │       ├── app-context.tsx # Global state (mock auth + wishlist cache)
    │       └── useClickOutside.ts
    ├── next.config.ts          # API proxy rewrites → localhost:8000
    └── tailwind.config.ts
```

---

## Architecture Overview

```
Browser
  │
  │  All requests go to Next.js (port 3000)
  │
  ▼
Next.js (App Router)
  ├── Server Components  → fetch() at build/request time (listing detail, home page)
  ├── Client Components  → interactive UI (search, booking widget, filters)
  │
  │  /api/* is proxied server-side (next.config.ts rewrites)
  │  → no CORS issues, backend URL never exposed to browser
  │
  ▼
FastAPI (port 8000)
  ├── Routers     → HTTP boundary, request validation, response serialization
  ├── Services    → Business logic (availability checks, price calculation)
  └── SQLAlchemy  → ORM → SQLite (./backend/app.db)
```

### Mock Authentication
There is no real login system. The frontend maintains a `currentUser` in React context (persisted in `localStorage`). Every mutating API call includes an `X-User-Id` header, which the backend reads to identify the acting user. All seeded users are pre-created and can be switched via the **Switch Profile** dropdown.

### Availability / Booking Logic
- Dates are blocked by checking for overlapping `confirmed` bookings.
- `nightly_rate`, `nights`, `cleaning_fee`, `service_fee`, and `total_price` are **frozen at booking time** — editing a listing price later does not affect existing bookings.
- Payments are mocked (no real payment gateway).

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | VARCHAR(120) | Display name |
| `email` | VARCHAR(254) | Unique |
| `photo_url` | VARCHAR(400) | Avatar URL |
| `role` | ENUM | `guest` or `host` |
| `is_superhost` | BOOLEAN | Default false |
| `bio` | VARCHAR(1000) | Optional |
| `created_at` | DATETIME | Server default |

### `listings`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `host_id` | FK → users | CASCADE delete |
| `title` | VARCHAR(200) | |
| `description` | TEXT | |
| `property_type` | VARCHAR(50) | Apartment, Villa, Cabin… |
| `room_type` | VARCHAR(50) | Entire place or Private room |
| `city` | VARCHAR(120) | Indexed |
| `country` | VARCHAR(120) | |
| `address` | VARCHAR(300) | Optional |
| `latitude` | FLOAT | |
| `longitude` | FLOAT | |
| `price_per_night` | FLOAT | Indexed |
| `max_guests` | INTEGER | |
| `bedrooms` | INTEGER | |
| `beds` | INTEGER | |
| `bathrooms` | FLOAT | Allows 0.5 |
| `avg_rating` | FLOAT | Denormalized, updated on review write |
| `review_count` | INTEGER | Denormalized |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | Auto-updated |

### `listing_images`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `listing_id` | FK → listings | CASCADE delete |
| `url` | VARCHAR(600) | |
| `position` | INTEGER | Gallery ordering |

### `amenities`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `name` | VARCHAR(80) | Unique |
| `icon` | VARCHAR(80) | Icon key for frontend |

### `listing_amenities` (join table)
| Column | Type |
|---|---|
| `listing_id` | FK → listings (PK) |
| `amenity_id` | FK → amenities (PK) |

### `bookings`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `listing_id` | FK → listings | CASCADE delete |
| `guest_id` | FK → users | CASCADE delete |
| `check_in` | DATE | Indexed |
| `check_out` | DATE | Indexed |
| `guests` | INTEGER | |
| `nightly_rate` | FLOAT | Frozen at booking time |
| `nights` | INTEGER | Frozen at booking time |
| `cleaning_fee` | FLOAT | |
| `service_fee` | FLOAT | |
| `total_price` | FLOAT | |
| `status` | ENUM | `confirmed`, `cancelled`, `completed` |
| `created_at` | DATETIME | |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `listing_id` | FK → listings | CASCADE delete |
| `author_id` | FK → users | CASCADE delete |
| `rating` | INTEGER | 1–5 |
| `comment` | TEXT | |
| `created_at` | DATETIME | |
| — | UNIQUE | `(listing_id, author_id)` — one review per user per listing |

### `wishlists`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `user_id` | FK → users | CASCADE delete |
| `listing_id` | FK → listings | CASCADE delete |
| `created_at` | DATETIME | |
| — | UNIQUE | `(user_id, listing_id)` |

### Entity Relationship Diagram

```
users ──< listings ──< listing_images
  │           │
  │           ├──< bookings >── users (guest)
  │           ├──< reviews  >── users (author)
  │           └──> listing_amenities <── amenities
  │
  └──< wishlists >── listings
```

---

## Setup & Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+

### 1. Clone the repo
```bash
git clone <repo-url>
cd MyStay
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database (creates app.db with sample data)
python -m app.seed

# Start the API server
uvicorn app.main:app --port 8000 --reload
```

API is now live at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

### 3. Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App is now live at **http://localhost:3000**

> The frontend proxies all `/api/*` requests to `http://localhost:8000` via Next.js rewrites — no CORS setup needed.


---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create a user |
| POST | `/api/users/{id}/become-host` | Upgrade guest to host |
| GET | `/api/listings` | Search/filter listings (paginated) |
| POST | `/api/listings` | Create a listing (host only) |
| GET | `/api/listings/{id}` | Listing detail with reviews |
| PUT | `/api/listings/{id}` | Update listing |
| DELETE | `/api/listings/{id}` | Delete listing |
| GET | `/api/listings/{id}/availability` | Get blocked dates |
| GET | `/api/listings/{id}/price-quote` | Calculate booking price |
| GET | `/api/property-types` | Distinct property type list |
| GET | `/api/amenities` | All amenities |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?guest_id=` | Guest's bookings |
| PATCH | `/api/bookings/{id}/cancel` | Cancel a booking |
| POST | `/api/listings/{id}/reviews` | Add a review |
| POST | `/api/wishlist/toggle` | Save/unsave a listing |
| GET | `/api/wishlist?user_id=` | User's saved listings |
| GET | `/api/wishlist/ids?user_id=` | Just the IDs (for UI state) |
| GET | `/api/host/{id}/listings` | Host's own listings |
| GET | `/api/host/{id}/bookings` | Bookings on host's listings |
| GET | `/api/health` | Health check |

**Search parameters** for `GET /api/listings`:  
`location`, `check_in`, `check_out`, `guests`, `min_price`, `max_price`, `property_type`, `room_type`, `amenities` (comma-separated IDs), `sort`, `page`, `page_size`

---

## Feature Checklist

- ✅ **Home/explore grid** · search (location + dates + guests) · filters · infinite scroll
- ✅ **Listing detail** · gallery · amenities · host card · date-range picker · price breakdown · reviews · static map
- ✅ **Booking flow** · date/guest validation · **overlapping dates blocked (server-enforced)** · mocked checkout · Bookings management · cancel capability
- ✅ **Host features** · create/edit/delete listings · host dashboard (My Properties, bookings overview)
- ✅ **Seeded data** · pre-populated users, listings, images, past & future bookings, reviews
- 🔲 **Mocked placeholders** · payments, messaging (UI only), simplified mock auth

---

## Assumptions Made

1. **Images are URL-based** — Listing photos are stored as external URLs (Unsplash). A production system would use file uploads to object storage (e.g., GCS, S3).

2. **Availability blocking** — Only `confirmed` bookings block dates. Cancelled bookings free up the dates immediately.

3. **`avg_rating` / `review_count` are denormalized** — Stored directly on the `listings` table and updated on every review write for fast card rendering without a JOIN.

4. **One review per user per listing** — Enforced at the database level with a `UNIQUE` constraint on `(listing_id, author_id)`.

5. **`cleaning_fee` and `service_fee`** — Currently set to fixed mock values (10% cleaning, 5% service fee) in the price-quote endpoint. In production these would be configurable per listing.
