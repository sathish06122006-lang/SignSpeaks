import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.models.dataset import DatasetSampleCreate
from app.database import dataset_samples_collection
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/dataset", tags=["dataset"])

# CSV column layout: label, category, num_hands,
# then Right-hand slot (63 cols, zero-filled if absent),
# then Left-hand slot (63 cols, zero-filled if absent).
_HAND_SLOTS = ["Right", "Left"]


@router.post("/samples")
async def add_sample(payload: DatasetSampleCreate, user: dict = Depends(get_current_user)):
    """Store one captured landmark sample for a given sign label. Accepts
    one hand (single-hand signs) or two hands (two-handed signs) per
    sample, keyed by MediaPipe's own Right/Left handedness label."""
    hands_doc = {}
    for hand in payload.hands:
        hands_doc[hand.handedness] = [[p.x, p.y, p.z] for p in hand.landmarks]

    doc = {
        "label": payload.label,
        "category": payload.category,
        "hands": hands_doc,  # e.g. {"Right": [[x,y,z]x21]} or both keys present
        "num_hands": len(hands_doc),
        "contributed_by": user["_id"],
        "created_at": datetime.utcnow(),
    }
    result = await dataset_samples_collection.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/summary")
async def dataset_summary(user: dict = Depends(get_current_user)):
    """Sample counts per label, so the collection UI can show progress
    toward a usable training set (recommend 40-60+ samples per sign)."""
    pipeline = [
        {
            "$group": {
                "_id": {"label": "$label", "category": "$category"},
                "count": {"$sum": 1},
                "max_hands": {"$max": "$num_hands"},
            }
        },
        {"$sort": {"_id.label": 1}},
    ]
    results = [doc async for doc in dataset_samples_collection.aggregate(pipeline)]
    return [
        {
            "label": r["_id"]["label"],
            "category": r["_id"]["category"],
            "count": r["count"],
            "two_handed": r["max_hands"] >= 2,
        }
        for r in results
    ]


@router.delete("/samples")
async def clear_label(label: str, user: dict = Depends(get_current_user)):
    """Remove all captured samples for a label (e.g. to redo a bad batch)."""
    result = await dataset_samples_collection.delete_many({"label": label})
    return {"deleted": result.deleted_count}


@router.get("/export")
async def export_dataset(user: dict = Depends(get_current_user)):
    """Export the full collected dataset as CSV for training/train_model.py.
    Each row: label, category, num_hands, then 63 raw x/y/z columns for the
    Right-hand slot, then 63 for the Left-hand slot (zero-filled if that
    hand wasn't present in the sample)."""
    cursor = dataset_samples_collection.find({})
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    header = ["label", "category", "num_hands"]
    for slot in _HAND_SLOTS:
        header += [f"{slot.lower()}_p{i}_{axis}" for i in range(21) for axis in ("x", "y", "z")]
    writer.writerow(header)

    async for doc in cursor:
        hands = doc.get("hands", {})
        row = [doc["label"], doc["category"], doc.get("num_hands", len(hands))]
        for slot in _HAND_SLOTS:
            points = hands.get(slot)
            if points:
                flat = []
                for point in points:
                    flat.extend(point)
                flat = (flat + [0.0] * 63)[:63]
            else:
                flat = [0.0] * 63
            row += flat
        writer.writerow(row)

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=isl_landmark_dataset.csv"},
    )
