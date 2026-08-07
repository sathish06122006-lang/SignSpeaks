"""
Mock CNN / ISL classification engine.

This module simulates the output of a trained TensorFlow CNN model without
requiring any external API or pretrained weights file. It uses simple,
transparent geometric heuristics on the 21 MediaPipe hand landmarks
(distances between fingertips and the palm) to produce a plausible,
deterministic "sign" prediction with a confidence score.

Swap-in point: replace `classify_landmarks()` with a real
`tf.keras.models.load_model(...)` inference call once a trained CNN/
landmark-classifier model file is available - the rest of the API
(request/response shape) will not need to change.
"""
import math
import random
import time
from typing import List

ALPHABET_SIGNS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
NUMBER_SIGNS = [str(i) for i in range(0, 10)]
WORD_SIGNS = ["Hello", "Thank You", "Please", "Yes", "No", "Help", "Sorry", "Good", "Name", "Water"]

_ALL_SIGNS = (
    [(s, "alphabet") for s in ALPHABET_SIGNS]
    + [(s, "number") for s in NUMBER_SIGNS]
    + [(s, "word") for s in WORD_SIGNS]
)


def _distance(a, b) -> float:
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)


def _feature_vector(landmarks: List) -> List[float]:
    """Derive a simple rotation-agnostic feature vector: distance of each
    fingertip landmark from the wrist, normalized by the palm width."""
    if len(landmarks) < 21:
        return [0.0] * 5

    wrist = landmarks[0]
    palm_width = _distance(landmarks[5], landmarks[17]) or 1e-6
    tips = [4, 8, 12, 16, 20]  # thumb, index, middle, ring, pinky tips
    return [_distance(wrist, landmarks[t]) / palm_width for t in tips]


def classify_landmarks(landmarks: List, seed_hint: str = "") -> dict:
    """Given a list of 21 landmark points, return a deterministic-ish mock
    prediction. The same general hand shape will tend to return the same
    sign, while confidence varies slightly to feel "live"."""
    start = time.time()

    if not landmarks or len(landmarks) < 21:
        return {"sign": None, "confidence": 0.0, "category": None, "fps": 0.0}

    features = _feature_vector(landmarks)
    # Bucket the feature vector into a stable index so the same hand pose
    # maps to the same sign most of the time (simulates model consistency).
    bucket = int(sum(f * 100 for f in features)) % len(_ALL_SIGNS)
    sign, category = _ALL_SIGNS[bucket]

    # Confidence: base + small deterministic jitter from features, clamped
    base_conf = 0.72 + (sum(features) % 1) * 0.25
    confidence = max(0.55, min(0.99, round(base_conf, 2)))

    elapsed = max(time.time() - start, 1e-4)
    fps = round(1 / elapsed, 1) if elapsed < 1 else round(random.uniform(18, 27), 1)
    # In a real webcam loop the frontend computes FPS itself; this is a
    # server-side fallback value.
    fps = round(random.uniform(18, 28), 1)

    return {"sign": sign, "confidence": confidence, "category": category, "fps": fps}


def no_hand_detected_response() -> dict:
    return {"sign": None, "confidence": 0.0, "category": None, "fps": 0.0}
