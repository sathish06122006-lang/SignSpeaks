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
    global _model, _labels, _load_attempted
    if _load_attempted:
        return
    _load_attempted = True

    if not (os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH)):
        return

    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(LABELS_PATH) as f:
            _labels = json.load(f)
        print(f"[real_cnn] Loaded trained model with {len(_labels)} classes: {_labels}")
    except Exception as exc:
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
    result = {"Right": None, "Left": None}
    for hand in hands:
        pts = [[p.x, p.y, p.z] for p in hand.landmarks]
        if hand.handedness in result:
            result[hand.handedness] = pts
    return result


def classify_landmarks(hands, seed_hint: str = "") -> dict:
    _try_load_model()

    if not hands:
        return mock_cnn.no_hand_detected_response()

    hands_dict = _hands_payload_to_dict(hands)

    if _model is None:
        primary = hands_dict["Right"] or hands_dict["Left"]
        return mock_cnn.classify_landmarks(primary, seed_hint)

    features = normalize_two_hand_sample(hands_dict).reshape(1, -1, 1)

    probs = _model.predict(features, verbose=0)[0]
    best_idx = int(probs.argmax())
    label = _labels[best_idx]
    confidence = float(round(probs[best_idx], 2))

    top3_idx = probs.argsort()[-3:][::-1]
    top3 = [{"sign": _labels[i], "confidence": float(round(probs[i], 3))} for i in top3_idx]
    print(f"[real_cnn] Prediction: {label} ({confidence:.2f}) | Top-3: {top3}")

    return {
        "sign": label,
        "confidence": confidence,
        "category": _guess_category(label),
        "fps": 0.0,
        "top3": top3,
    }


def no_hand_detected_response() -> dict:
    return mock_cnn.no_hand_detected_response()


def get_available_labels():
    """Which signs can the currently-active classifier actually predict?
    Returns (labels: list[str], source: "model" | "mock"). Used by the
    frontend so AI Practice only offers signs the model genuinely knows."""
    _try_load_model()
    if _model is not None and _labels:
        return list(_labels), "model"
    return mock_cnn.all_sign_labels(), "mock"