"""One-off smoke test for the SIH 2026 feature set (not committed to the app)."""
import os

# Pin to the explicit IPv4 Mongo instance BEFORE any app import, so the
# TCP/IPv6 localhost ambiguity can't redirect us to a different mongod.
os.environ.setdefault("MONGO_URI", "mongodb://127.0.0.1:27017")

import sys  # noqa: E402

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from pymongo import MongoClient  # noqa: E402
from app.config import settings  # noqa: E402

# Idempotent: remove any prior smoke-test data so assertions are exact.
# NB: practice sessions store user_id as a STRING (the app serialises _id).
_mongo = MongoClient(settings.mongo_uri)
_db = _mongo[settings.db_name]
_test_users = list(_db["users"].find({"email": {"$in": ["smoke_test@example.com", "empty2@example.com"]}}))
for u in _test_users:
    _db["practice_sessions"].delete_many({"user_id": str(u["_id"])})
    print("cleaned prior sessions for", u["email"])

with TestClient(app) as client:
    # 1. Health
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["status"] == "ok", r.text
    print("1. health:", r.json())

    # 2. Signup a fresh test user
    email = "smoke_test@example.com"
    r = client.post("/api/auth/signup", json={"name": "Smoke Tester", "email": email, "password": "secret123"})
    if r.status_code == 400:
        print("2. signup: user exists, logging in instead")
        r = client.post("/api/auth/login", data={"username": email, "password": "secret123"})
    else:
        print("2. signup:", r.status_code, r.json().get("token_type"))
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Detection labels
    r = client.get("/api/detection/labels", headers=headers)
    assert r.status_code == 200, r.text
    labels = r.json()
    print("3. labels:", len(labels["labels"]), "labels, source =", labels["source"], ", confidence_supported =", labels["confidence_supported"])

    # 4. Save a few REAL-looking practice sessions (source data for analytics)
    samples = [
        {"target_sign": "A", "detected_sign": "A", "confidence": 0.94, "result": "correct", "attempts": 1},
        {"target_sign": "A", "detected_sign": "B", "confidence": 0.81, "result": "incorrect", "attempts": 2},
        {"target_sign": "Hello", "detected_sign": "Hello", "confidence": 0.91, "result": "correct", "attempts": 1},
        {"target_sign": "Hello", "detected_sign": "UNKNOWN", "confidence": 0.42, "result": "unclear", "attempts": 2},
        {"target_sign": "Hello", "detected_sign": "Hello", "confidence": 0.88, "result": "correct", "attempts": 3},
    ]
    for s in samples:
        r = client.post("/api/practice/sessions", json=s, headers=headers)
        assert r.status_code == 200, r.text
    print("4. saved", len(samples), "practice sessions")

    # 5. Practice sessions list
    r = client.get("/api/practice/sessions", headers=headers)
    assert r.status_code == 200, r.text
    print("5. practice list count:", len(r.json()))

    # 6. Progress summary
    r = client.get("/api/progress/summary", headers=headers)
    assert r.status_code == 200, r.text
    p = r.json()
    print("6. progress:", {k: p[k] for k in ("has_data", "signs_practiced", "total_sessions", "total_attempts", "correct_attempts", "accuracy_percent", "average_confidence", "streak_days")})
    assert p["has_data"] is True
    assert p["total_attempts"] == 5
    assert p["correct_attempts"] == 3
    assert 59.9 < p["accuracy_percent"] <= 60.1  # 3/5 = 60%
    assert p["signs_practiced"] == 2
    assert p["most_practiced"][0]["sign"] == "Hello"
    print("6. most_practiced:", p["most_practiced"])
    print("6. difficult_signs:", p["difficult_signs"])
    print("6. recent_activity head:", p["recent_activity"][0])

    # 7. Translation (demo dictionary)
    for text, tgt in [("Hello, how are you?", "Tamil"), ("I need help", "Hindi")]:
        r = client.post("/api/detection/translate", params={"text": text, "target_language": tgt}, headers=headers)
        assert r.status_code == 200, r.text
        print("7. translate", repr(text), "->", tgt, ":", r.json())

    # 8. Empty progress for brand-new user
    client.post("/api/auth/signup", json={"name": "Empty User", "email": "empty2@example.com", "password": "secret123"})
    login = client.post("/api/auth/login", data={"username": "empty2@example.com", "password": "secret123"})
    empty_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    r = client.get("/api/progress/summary", headers=empty_headers)
    assert r.status_code == 200 and r.json()["has_data"] is False, r.text
    print("8. empty progress has_data:", r.json()["has_data"])

print("\nALL SMOKE TESTS PASSED ✔")