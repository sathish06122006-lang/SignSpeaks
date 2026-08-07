from fastapi import APIRouter, Depends

from app.models.tutorial import FeedbackCreate
from app.database import tutorials_collection, categories_collection, feedback_collection
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api", tags=["tutorials"])


@router.get("/tutorials")
async def list_tutorials(category: str = None, search: str = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    cursor = tutorials_collection.find(query)
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.get("/categories")
async def list_categories():
    cursor = categories_collection.find({})
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.post("/contact")
async def submit_feedback(payload: FeedbackCreate):
    await feedback_collection.insert_one(payload.dict())
    return {"message": "Thanks for reaching out — we'll get back to you soon."}
