"""
Shared landmark normalization logic used by BOTH the training script and
the inference service, so predictions are made on features in exactly the
same coordinate space the model was trained on.

Signs may use one hand or two hands. To keep the feature vector a fixed
size regardless of how many hands are present, we reserve a consistent
slot per hand label:

    features = normalize(Right hand) [63]  ++  normalize(Left hand) [63]
             = 126 features total

If a hand is absent for a given sample (single-hand sign), its slot is
filled with zeros. "Right"/"Left" are exactly the labels MediaPipe Hands
reports per detected hand.
"""
import numpy as np

NUM_LANDMARKS = 21
FEATURES_PER_HAND = NUM_LANDMARKS * 3  # 63
TOTAL_FEATURES = FEATURES_PER_HAND * 2  # 126 (Right slot + Left slot)


def normalize_single_hand(landmarks) -> np.ndarray:
    """landmarks: list/array of 21 [x, y, z] points -> flat 63-length vector,
    translated so the wrist is the origin and scaled by palm width."""
    pts = np.array(landmarks, dtype=np.float32).reshape(NUM_LANDMARKS, 3)
    wrist = pts[0].copy()
    pts -= wrist

    palm_width = np.linalg.norm(pts[5] - pts[17])
    if palm_width < 1e-6:
        palm_width = 1e-6
    pts /= palm_width

    return pts.flatten()


# Backwards-compatible alias (single-hand call sites / older code paths).
def normalize_landmarks(landmarks) -> np.ndarray:
    return normalize_single_hand(landmarks)


def normalize_two_hand_sample(hands: dict) -> np.ndarray:
    """hands: {"Right": [[x,y,z]x21] | None, "Left": [[x,y,z]x21] | None}
    -> flat 126-length vector (Right slot ++ Left slot), zero-padded for
    any missing hand."""
    right = hands.get("Right")
    left = hands.get("Left")

    right_features = normalize_single_hand(right) if right is not None else np.zeros(FEATURES_PER_HAND, dtype=np.float32)
    left_features = normalize_single_hand(left) if left is not None else np.zeros(FEATURES_PER_HAND, dtype=np.float32)

    return np.concatenate([right_features, left_features])