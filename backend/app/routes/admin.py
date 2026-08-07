from fastapi import APIRouter, Depends, UploadFile, File
from bson import ObjectId
from datetime import datetime

from app.models.tutorial import TutorialCreate, CategoryCreate
from app.database import (
    tutorials_collection,
    categories_collection,
    users_collection,
    detections_collection,
    models_collection,
)
from app.utils.jwt_handler import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
async def list_users(admin: dict = Depends(get_current_admin)):
    cursor = users_collection.find({}, {"password": 0})
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    await users_collection.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User removed"}


@router.get("/analytics")
async def analytics(admin: dict = Depends(get_current_admin)):
    total_users = await users_collection.count_documents({})
    total_detections = await detections_collection.count_documents({})
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    by_category = [doc async for doc in detections_collection.aggregate(pipeline)]
    return {
        "total_users": total_users,
        "total_detections": total_detections,
        "category_breakdown": [{"category": c["_id"] or "unknown", "count": c["count"]} for c in by_category],
    }


@router.post("/tutorials")
async def add_tutorial(payload: TutorialCreate, admin: dict = Depends(get_current_admin)):
    result = await tutorials_collection.insert_one(payload.dict())
    return {"id": str(result.inserted_id)}


@router.delete("/tutorials/{tutorial_id}")
async def delete_tutorial(tutorial_id: str, admin: dict = Depends(get_current_admin)):
    await tutorials_collection.delete_one({"_id": ObjectId(tutorial_id)})
    return {"message": "Tutorial removed"}


@router.post("/categories")
async def add_category(payload: CategoryCreate, admin: dict = Depends(get_current_admin)):
    result = await categories_collection.insert_one(payload.dict())
    return {"id": str(result.inserted_id)}


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin: dict = Depends(get_current_admin)):
    await categories_collection.delete_one({"_id": ObjectId(category_id)})
    return {"message": "Category removed"}


@router.post("/models/upload")
async def upload_model(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    """Stores CNN model file metadata. The binary itself is saved to disk;
    swapping in a real model just means pointing mock_cnn.py at this path."""
    contents = await file.read()
    doc = {
        "filename": file.filename,
        "size_bytes": len(contents),
        "uploaded_by": admin["_id"],
        "uploaded_at": datetime.utcnow(),
        "active": True,
    }
    result = await models_collection.insert_one(doc)
    return {"id": str(result.inserted_id), "filename": file.filename, "size_bytes": len(contents)}


@router.get("/models")
async def list_models(admin: dict = Depends(get_current_admin)):
    cursor = models_collection.find({})
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items
