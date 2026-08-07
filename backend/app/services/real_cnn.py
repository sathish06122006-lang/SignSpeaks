"""
Live-detection classifier that transparently upgrades from the mock
heuristic classifier to a real trained TensorFlow model the moment one
exists at app/model_store/isl_landmark_model.h5 (produced by
training/train_model.py). No other code needs to change -- routes/
detection.py always imports `classify_landmarks` from this module.

Accepts one or two hands per request (matching how the sign was
originally captured during data collection) keyed by MediaPipe's own
Right/Left handedness label.
"""
import json
import os

from app.services.feature_utils import normalize_two_hand_sample
from app.services import mock_cnn

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model_store")
MODEL_PATH = os.path.join(MODEL_DIR, "isl_landmark_model.h5")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")

_model = None
_labels = None
_load_attempted = False


def _try_load_model():
    """Lazily attempt to load the trained model + label map exactly once.
    If TensorFlow isn't installed, or no model has been trained yet, this
    silently leaves _model as None and callers fall back to the mock
    classifier -- so the API works fine with zero setup, and gets real
    predictions the moment a model shows up."""
    global _model, _labels, _load_attempted
    if _load_attempted:
        return
    _load_attempted = True

    if not (os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH)):
        return

    try:
        import tensorflow as tf  # heavy import, only pulled in if a model exists
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(LABELS_PATH) as f:
            _labels = json.load(f)
        print(f"[real_cnn] Loaded trained model with {len(_labels)} classes: {_labels}")
    except Exception as exc:  # pragma: no cover - defensive
        print(f"[real_cnn] Could not load trained model, falling back to mock classifier: {exc}")
        _model = None
        _labels = None


def _guess_category(label: str) -> str:
    if label.isdigit():
        return "number"
    if len(label) == 1 and label.isalpha():
        return "alphabet"
    return "word"


def _hands_payload_to_dict(hands) -> dict:
    """hands: list of {handedness, landmarks: [LandmarkPoint x21]} (Pydantic
    objects) -> {"Right": [[x,y,z]x21] | None, "Left": [[x,y,z]x21] | None}"""
    result = {"Right": None, "Left": None}
    for hand in hands:
        pts = [[p.x, p.y, p.z] for p in hand.landmarks]
        if hand.handedness in result:
            result[hand.handedness] = pts
    return result


def classify_landmarks(hands, seed_hint: str = "") -> dict:
    """hands: list of HandLandmarks (1 or 2 entries)."""
    _try_load_model()

    if not hands:
        return mock_cnn.no_hand_detected_response()

    hands_dict = _hands_payload_to_dict(hands)

    if _model is None:
        # No trained model yet -- use the transparent geometric fallback
        # (based on whichever hand is present) so the app is fully
        # demoable before any training has happened.
        primary = hands_dict["Right"] or hands_dict["Left"]
        return mock_cnn.classify_landmarks(primary, seed_hint)

    features = normalize_two_hand_sample(hands_dict).reshape(1, -1, 1)

    probs = _model.predict(features, verbose=0)[0]
    best_idx = int(probs.argmax())
    label = _labels[best_idx]
    confidence = float(round(probs[best_idx], 2))

    return {
        "sign": label,
        "confidence": confidence,
        "category": _guess_category(label),
        "fps": 0.0,  # measured client-side; kept for response-shape parity
    }


def no_hand_detected_response() -> dict:
    return mock_cnn.no_hand_detected_response()
