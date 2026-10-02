import os
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException

from app.database import sign_images_collection
from app.utils.jwt_handler import get_current_admin

router = APIRouter(tags=["sign-images"])

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "sign_images")
os.makedirs(STATIC_DIR, exist_ok=True)


def _normalize_label(label: str) -> str:
    """Lowercase + collapse spaces to hyphens so 'Thank You', 'thank you',
    and 'thankyou' all resolve to the same canonical key 'thank-you'."""
    return "".join(c if c.isalnum() else "-" for c in label.lower()).strip("-")


def _safe_filename(label: str, original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1].lower() or ".jpg"
    safe_label = "".join(c for c in label if c.isalnum() or c in ("-", "_")).strip() or "sign"
    return f"{safe_label}{ext}"


@router.get("/api/sign-images")
async def list_sign_images():
    """Public: returns { normalized_label: image_url } for every uploaded
    reference image, so Learn ISL / Practice can show the real handshape when a
    sign is clicked. Keys are normalised (lowercase, spaces→hyphens) so
    'Thank You', 'thank you', and 'thankyou' all map to 'thank-you'."""
    cursor = sign_images_collection.find({})
    result = {}
    async for doc in cursor:
        key = _normalize_label(doc["label"])
        result[key] = doc["image_url"]
    return result


@router.post("/api/admin/sign-images")
async def upload_sign_image(
    label: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
):
    """Admin-only: upload a real ISL reference photo/illustration for a
    sign. Stored on disk under app/static/sign_images and served via
    the /static mount, so no external image API or hotlinking is needed."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    filename = _safe_filename(label, file.filename or "")
    filepath = os.path.join(STATIC_DIR, filename)

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    image_url = f"/static/sign_images/{filename}"
    await sign_images_collection.update_one(
        {"label": label},
        {"$set": {
            "label": label,
            "category": category,
            "image_url": image_url,
            "uploaded_by": admin["_id"],
            "uploaded_at": datetime.utcnow(),
        }},
        upsert=True,
    )
    return {"label": label, "image_url": image_url}


@router.delete("/api/admin/sign-images/{label}")
async def delete_sign_image(label: str, admin: dict = Depends(get_current_admin)):
    norm = _normalize_label(label)
    doc = None
    async for d in sign_images_collection.find({}):
        if _normalize_label(d["label"]) == norm:
            doc = d
            break
    if doc:
        filepath = os.path.join(STATIC_DIR, os.path.basename(doc["image_url"]))
        if os.path.exists(filepath):
            os.remove(filepath)
        await sign_images_collection.delete_one({"label": label})
    return {"message": f"Removed image for '{label}'"}