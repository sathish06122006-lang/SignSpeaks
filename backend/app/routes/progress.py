from collections import Counter, defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends

from app.database import practice_sessions_collection
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


def _day(date: datetime) -> str:
    return date.strftime("%Y-%m-%d")


def _compute_streak(day_strings) -> int:
    """Consecutive days with at least one practice record, ending today (or
    yesterday if the user hasn't practised yet today, keeping the streak alive)."""
    days = {datetime.strptime(d, "%Y-%m-%d").date() for d in day_strings}
    if not days:
        return 0
    cursor = datetime.utcnow().date()
    if cursor not in days and (cursor - timedelta(days=1)) in days:
        cursor -= timedelta(days=1)
    streak = 0
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


@router.get("/summary")
async def summary(user: dict = Depends(get_current_user)):
    docs = (
        await practice_sessions_collection.find({"user_id": user["_id"]})
        .sort("created_at", 1)
        .to_list(length=None)
    )

    if not docs:
        return {
            "has_data": False,
            "signs_practiced": 0,
            "total_sessions": 0,
            "total_attempts": 0,
            "correct_attempts": 0,
            "accuracy_percent": 0.0,
            "average_confidence": None,
            "streak_days": 0,
            "most_practiced": [],
            "difficult_signs": [],
            "daily_accuracy": [],
            "daily_activity": [],
            "recent_activity": [],
        }

    total_attempts = len(docs)
    correct_attempts = sum(1 for d in docs if d.get("result") == "correct")

    confidences = [d.get("confidence", 0) for d in docs if d.get("confidence", 0) > 0]
    avg_confidence = round((sum(confidences) / len(confidences)) * 100, 1) if confidences else None
    accuracy = round((correct_attempts / total_attempts) * 100, 1) if total_attempts else 0.0

    target_counts = Counter(d.get("target_sign", "unknown") for d in docs)
    signs_practiced = len(target_counts)
    most_practiced = [
        {"sign": sign, "count": count}
        for sign, count in target_counts.most_common(5)
    ]

    # Difficult signs = lowest per-sign accuracy with >= 2 attempts.
    per_sign = defaultdict(lambda: {"attempts": 0, "correct": 0})
    for d in docs:
        sign = d.get("target_sign", "unknown")
        per_sign[sign]["attempts"] += 1
        if d.get("result") == "correct":
            per_sign[sign]["correct"] += 1
    difficult_signs = sorted(
        (
            {
                "sign": sign,
                "accuracy": round((v["correct"] / v["attempts"]) * 100, 1),
                "attempts": v["attempts"],
            }
            for sign, v in per_sign.items()
            if v["attempts"] >= 2
        ),
        key=lambda x: x["accuracy"],
    )[:5]

    # Daily activity + accuracy for the last 14 days.
    day_attempts = defaultdict(int)
    day_correct = defaultdict(int)
    day_dates = set()
    for d in docs:
        day = _day(d.get("created_at", datetime.utcnow()))
        day_dates.add(day)
        day_attempts[day] += 1
        if d.get("result") == "correct":
            day_correct[day] += 1

    today = datetime.utcnow().date()
    daily_accuracy = []
    daily_activity = []
    for i in range(13, -1, -1):
        day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        attempts = day_attempts.get(day, 0)
        daily_activity.append({"date": day, "attempts": attempts})
        daily_accuracy.append(
            {
                "date": day,
                "accuracy": round((day_correct.get(day, 0) / attempts) * 100, 1) if attempts else None,
            }
        )

    recent = list(reversed(docs))[:10]
    recent_activity = [
        {
            "target": d.get("target_sign"),
            "detected": d.get("detected_sign"),
            "result": d.get("result"),
            "confidence": d.get("confidence", 0),
            "timestamp": d.get("created_at").isoformat() if d.get("created_at") else None,
        }
        for d in recent
    ]

    return {
        "has_data": True,
        "signs_practiced": signs_practiced,
        "total_sessions": len(day_dates),  # distinct days with practice = sessions
        "total_attempts": total_attempts,
        "correct_attempts": correct_attempts,
        "accuracy_percent": accuracy,
        "average_confidence": avg_confidence,
        "streak_days": _compute_streak(day_dates),
        "most_practiced": most_practiced,
        "difficult_signs": difficult_signs,
        "daily_accuracy": daily_accuracy,
        "daily_activity": daily_activity,
        "recent_activity": recent_activity,
    }