"""Shared FastAPI dependencies.

Auth is mocked: the "current user" is identified by an X-User-Id header or a
user_id query param rather than a real session/token. This keeps a clear
guest-vs-host notion without building real authentication.
"""
from fastapi import Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.db_schema.user import User, UserRole
from app.services import users as users_crud


def get_current_user(
    db: Session = Depends(get_db),
    x_user_id: int | None = Header(default=None, alias="X-User-Id"),
    user_id: int | None = Query(default=None),
) -> User:
    uid = x_user_id or user_id
    if not uid:
        raise HTTPException(status_code=401, detail="Missing user identity (X-User-Id header)")
    user = users_crud.get_user(db, uid)
    if not user:
        raise HTTPException(status_code=401, detail="Unknown user")
    return user


def require_host(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.host:
        raise HTTPException(status_code=403, detail="Host role required")
    return user
