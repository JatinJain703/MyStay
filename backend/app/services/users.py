"""User lookups for the mocked identity switcher."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db_schema.user import User, UserRole
from app.models.user import UserCreate


def list_users(db: Session) -> list[User]:
    return list(db.execute(select(User).order_by(User.id)).scalars().all())


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def create_user(db: Session, payload: UserCreate) -> User:
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def become_host(db: Session, user: User) -> User:
    user.role = UserRole.host
    db.commit()
    db.refresh(user)
    return user
