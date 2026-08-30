from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from datetime import datetime
import io
import asyncio

from app.models.detection import DetectionRequest, SaveConversationRequest
from app.database import detections_collection, conversations_collection
from app.utils.jwt_handler import get_current_user
from app.services.real_cnn import classify_landmarks, no_hand_detected_response, get_available_labels
from app.services.pdf_service import generate_conversation_pdf
from app.services.translation import translate_text

router = APIRouter(prefix="/api/detection", tags=["detection"])

# Cache the last saved sign per user to avoid redundant DB writes on every frame.
_last_saved = {}


@router.get("/labels")
async def available_labels(user: dict = Depends(get_current_user)):
    """Which signs the currently-active classifier supports + whether it
    outputs confidence natively. Lets AI Practice show only real, supported
    targets and guarantees the UI never offers an unsupported sign as
    'recognizable'."""
    labels, source = get_available_labels()
    return {
        "labels": labels,
        "source": source,  # "model" (trained CNN) | "mock" (placeholder classifier)
        "confidence_supported": True,
    }


@router.post("/predict")
async def predict(payload: DetectionRequest, user: dict = Depends(get_current_user)):
    if not payload.hands:
        return no_hand_detected_response()

    result = classify_landmarks(payload.hands)

    # Only persist to DB when the sign actually changes (or is new) — this
    # avoids a blocking MongoDB insert on every single frame, which was the
    # main cause of slow detection. The DB write is also fire-and-forget so
    # the response returns immediately.
    if result["sign"]:
        user_id = str(user["_id"])
        last = _last_saved.get(user_id)
        if last != result["sign"]:
            _last_saved[user_id] = result["sign"]

            async def _save():
                try:
                    await detections_collection.insert_one(
                        {
                            "user_id": user["_id"],
                            "sign": result["sign"],
                            "confidence": result["confidence"],
                            "category": result["category"],
                            "timestamp": datetime.utcnow(),
                        }
                    )
                except Exception:
                    pass  # never block detection on a DB failure

            asyncio.create_task(_save())

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