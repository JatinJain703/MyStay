from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

# 1. Set the DATABASE_URL directly
DATABASE_URL = "sqlite:///./airbnb.db"

# 3. Create the SQLAlchemy Engine
# Note: check_same_thread=False is specifically required when using SQLite with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool if DATABASE_URL.endswith(":memory:") else None,
)

# 4. Set up the Session and Base Model
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    """FastAPI dependency that yields a scoped DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
