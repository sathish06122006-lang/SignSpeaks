from pydantic import BaseModel
from typing import Optional


class TutorialCreate(BaseModel):
    title: str
    youtube_url: str
    category: str  # Beginner | Intermediate | Advanced
    description: Optional[str] = ""
    thumbnail: Optional[str] = ""


class TutorialOut(TutorialCreate):
    id: str


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class CategoryOut(CategoryCreate):
    id: str


class FeedbackCreate(BaseModel):
    name: str
    email: str
    message: str
