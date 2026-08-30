from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from app.models.practice import PracticeSession
from app.database import practice_sessions_collection
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/practice", tags=["practice"])


@router.post("/sessions")
async def save_session(payload: PracticeSession, user: dict = Depends(get_current_user)):
    """Persist one real practice attempt. Only called with actual recognition
    data from the client — no fabricated results reach this endpoint."""
    doc = {
        "user_id": user["_id"],
        "target_sign": payload.target_sign,
        "detected_sign": payload.detected_sign,
        "confidence": payload.confidence,
        "result": payload.result,
        "attempts": payload.attempts,
        "created_at": datetime.utcnow(),
    }
    result = await practice_sessions_collection.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/sessions")
async def list_sessions(limit: int = 50, user: dict = Depends(get_current_user)):
    cursor = (
        practice_sessions_collection.find({"user_id": user["_id"]})
        .sort("created_at", -1)
        .limit(max(1, min(limit, 200)))
    )
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items