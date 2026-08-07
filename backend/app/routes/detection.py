from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from datetime import datetime
import io

from app.models.detection import DetectionRequest, SaveConversationRequest
from app.database import detections_collection, conversations_collection
from app.utils.jwt_handler import get_current_user
from app.services.real_cnn import classify_landmarks, no_hand_detected_response
from app.services.pdf_service import generate_conversation_pdf
from app.services.translation import translate_text

router = APIRouter(prefix="/api/detection", tags=["detection"])


@router.post("/predict")
async def predict(payload: DetectionRequest, user: dict = Depends(get_current_user)):
    if not payload.hands:
        return no_hand_detected_response()

    result = classify_landmarks(payload.hands)

    if result["sign"]:
        await detections_collection.insert_one(
            {
                "user_id": user["_id"],
                "sign": result["sign"],
                "confidence": result["confidence"],
                "category": result["category"],
                "timestamp": datetime.utcnow(),
            }
        )
    return result


@router.get("/history")
async def get_history(limit: int = 50, user: dict = Depends(get_current_user)):
    cursor = (
        detections_collection.find({"user_id": user["_id"]})
        .sort("timestamp", -1)
        .limit(limit)
    )
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.post("/translate")
async def translate(text: str, target_language: str, user: dict = Depends(get_current_user)):
    return {"translated": translate_text(text, target_language)}


@router.post("/conversations")
async def save_conversation(payload: SaveConversationRequest, user: dict = Depends(get_current_user)):
    doc = {
        "user_id": user["_id"],
        "title": payload.title,
        "text": payload.text,
        "history": [h.dict() for h in payload.history],
        "created_at": datetime.utcnow(),
    }
    result = await conversations_collection.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/conversations")
async def list_conversations(user: dict = Depends(get_current_user)):
    cursor = conversations_collection.find({"user_id": user["_id"]}).sort("created_at", -1)
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.get("/conversations/{conversation_id}/pdf")
async def export_conversation_pdf(conversation_id: str, user: dict = Depends(get_current_user)):
    doc = await conversations_collection.find_one(
        {"_id": ObjectId(conversation_id), "user_id": user["_id"]}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Conversation not found")

    pdf_bytes = generate_conversation_pdf(doc["title"], doc["text"], doc.get("history", []))
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=conversation_{conversation_id}.pdf"},
    )
