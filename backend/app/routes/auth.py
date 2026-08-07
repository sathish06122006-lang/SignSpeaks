from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from datetime import datetime

from app.models.user import UserSignup, UserLogin, ForgotPasswordRequest, ResetPasswordRequest, UserProfileUpdate
from app.database import users_collection
from app.utils.security import hash_password, verify_password, create_access_token, create_reset_token, decode_token
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup")
async def signup(payload: UserSignup):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hash_password(payload.password),
        "role": "user",
        "preferred_language": "English",
        "theme": "light",
        "large_text": False,
        "high_contrast": False,
        "created_at": datetime.utcnow(),
    }
    result = await users_collection.insert_one(user_doc)
    token = create_access_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form.username})
    if not user or not verify_password(form.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        # Do not reveal whether the email exists
        return {"message": "If that email exists, a reset link has been generated."}

    reset_token = create_reset_token({"sub": str(user["_id"])})
    # In production this token would be emailed to the user via an SMTP
    # service. For this offline build we return it directly so the
    # frontend can demo the reset flow without a real mail provider.
    return {"message": "Reset token generated.", "reset_token": reset_token}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    decoded = decode_token(payload.token)
    if not decoded or decoded.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    await users_collection.update_one(
        {"_id": ObjectId(decoded["sub"])},
        {"$set": {"password": hash_password(payload.new_password)}},
    )
    return {"message": "Password updated successfully."}


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    user.pop("password", None)
    return user


@router.put("/me")
async def update_me(payload: UserProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if updates:
        await users_collection.update_one({"_id": ObjectId(user["_id"])}, {"$set": updates})
    updated = await users_collection.find_one({"_id": ObjectId(user["_id"])})
    updated["_id"] = str(updated["_id"])
    updated.pop("password", None)
    return updated
