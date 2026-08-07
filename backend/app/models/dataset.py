from pydantic import BaseModel
from typing import List, Optional


class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float = 0.0


class HandLandmarks(BaseModel):
    handedness: str  # "Right" or "Left" (as reported by MediaPipe)
    landmarks: List[LandmarkPoint]  # exactly 21 points


class DatasetSampleCreate(BaseModel):
    label: str          # e.g. "A", "5", "Hello"
    category: str        # alphabet | number | word
    hands: List[HandLandmarks]  # 1 or 2 entries, depending on the sign


class DatasetSummaryEntry(BaseModel):
    label: str
    category: str
    count: int
    two_handed: Optional[bool] = None
