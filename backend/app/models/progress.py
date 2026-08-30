from pydantic import BaseModel
from typing import List, Optional


class ProgressSummary(BaseModel):
    """Aggregated, REAL practice analytics computed from stored sessions.
    No fabricated numbers — every field derives from saved practice data."""

    has_data: bool
    signs_practiced: int          # distinct target signs attempted
    total_sessions: int           # recorded practice sessions (days active)
    total_attempts: int           # every recorded "Check Signature" attempt
    correct_attempts: int
    accuracy_percent: float       # correct / total attempts * 100
    average_confidence: Optional[float]  # mean real model confidence (0-100), None if unavailable
    streak_days: int
    most_practiced: List[dict]    # [{ sign, count }] top signs
    difficult_signs: List[dict]   # [{ sign, accuracy, attempts }] lowest accuracy (>=2 attempts)
    daily_accuracy: List[dict]    # [{ date, accuracy }] last 14 days
    daily_activity: List[dict]    # [{ date, attempts }] last 14 days
    recent_activity: List[dict]   # [{ target, detected, result, confidence, timestamp }]