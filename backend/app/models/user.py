from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None
    theme: Optional[str] = None
    large_text: Optional[bool] = None
    high_contrast: Optional[bool] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    preferred_language: str = "English"
    theme: str = "light"
    large_text: bool = False
    high_contrast: bool = False
