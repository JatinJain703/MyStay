"""Mocked auth / identity endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.db_schema.user import User
from app.models.user import UserOut, UserCreate
from app.services import users as users_crud

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    """All seeded users — powers the identity switcher in the navbar."""
    return users_crud.list_users(db)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    return users_crud.create_user(db, payload)


@router.post("/{user_id}/become-host", response_model=UserOut)
def become_host(user_id: int, db: Session = Depends(get_db)):
    user = users_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return users_crud.become_host(db, user)
