from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float = 0.0


class HandLandmarks(BaseModel):
    handedness: str  # "Right" or "Left"
    landmarks: List[LandmarkPoint]  # 21 points


class DetectionRequest(BaseModel):
    hands: List[HandLandmarks]  # 1 or 2 entries, depending on the sign


class DetectionResult(BaseModel):
    sign: str
    confidence: float
    category: str  # alphabet | number | word
    fps: float = 0.0


class DetectionLogEntry(BaseModel):
    sign: str
    confidence: float
    timestamp: Optional[datetime] = None


class SaveConversationRequest(BaseModel):
    title: str
    text: str
    history: List[DetectionLogEntry] = []


class ConversationOut(BaseModel):
    id: str
    title: str
    text: str
    created_at: datetime
