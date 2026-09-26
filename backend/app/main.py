"""FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app import db_schema  # noqa: F401  (registers models on Base.metadata)
from app.routers import auth, listings, bookings, wishlist, host

# Create tables on startup if they don't exist (SQLite, no migrations for this scope).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airbnb Clone API",
    version="1.0.0",
    description="Backend for the Airbnb clone assignment (FastAPI + SQLAlchemy + SQLite).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(wishlist.router)
app.include_router(host.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
