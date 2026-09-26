"""Review schemas."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserOut


class ReviewCreate(BaseModel):
    author_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    rating: int
    comment: str
    created_at: datetime
    author: UserOut
