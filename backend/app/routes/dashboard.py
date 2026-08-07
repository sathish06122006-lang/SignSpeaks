from fastapi import APIRouter, Depends
from datetime import datetime, timedelta

from app.database import detections_collection
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
async def summary(user: dict = Depends(get_current_user)):
    total = await detections_collection.count_documents({"user_id": user["_id"]})

    pipeline = [
        {"$match": {"user_id": user["_id"]}},
        {"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence"}}},
    ]
    agg = [doc async for doc in detections_collection.aggregate(pipeline)]
    accuracy = round((agg[0]["avg_confidence"] * 100), 1) if agg else 0.0

    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_pipeline = [
        {"$match": {"user_id": user["_id"], "timestamp": {"$gte": week_ago}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    weekly = [doc async for doc in detections_collection.aggregate(weekly_pipeline)]

    category_pipeline = [
        {"$match": {"user_id": user["_id"]}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
    ]
    by_category = [doc async for doc in detections_collection.aggregate(category_pipeline)]

    return {
        "total_signs_detected": total,
        "accuracy_percent": accuracy,
        "practice_time_minutes": round(total * 0.5, 1),  # ~30s per detection, estimated
        "weekly_progress": [{"date": d["_id"], "count": d["count"]} for d in weekly],
        "category_breakdown": [{"category": c["_id"] or "unknown", "count": c["count"]} for c in by_category],
    }
