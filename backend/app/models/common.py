"""Shared schema helpers."""
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Generic paginated envelope returned by list endpoints."""
    items: list[T]
    total: int
    page: int
    pages: int
    page_size: int
