"""
Train a real ISL sign classifier on landmark data collected through the
Sign Speaks Data Collection page. Supports both single-hand and two-handed
signs -- each sample stores a Right-hand slot and a Left-hand slot,
zero-filled for whichever hand wasn't used for that particular sign.

Usage:
    1. Collect samples in-app (Data Collection page) for each sign you want
       to recognize -- aim for 40-60+ samples per label, varying hand
       angle/position slightly between captures. Use one or both hands,
       whichever the sign actually requires.
    2. Export the dataset (Export Dataset button, or GET /api/dataset/export)
       and save it as backend/training/isl_landmark_dataset.csv
    3. Run this script:
           cd backend
           pip install -r training/requirements-train.txt
           python training/train_model.py
    4. The trained model is written to
       backend/app/model_store/isl_landmark_model.h5
       plus backend/app/model_store/labels.json
    5. Restart the API. app/services/real_cnn.py auto-detects the model
       file and switches live predictions from the mock classifier to
       your trained model -- no other code changes needed.
"""
import json
import os
import sys

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.services.feature_utils import normalize_two_hand_sample, FEATURES_PER_HAND  # noqa: E402

import tensorflow as tf
from tensorflow.keras import layers, models

DATASET_PATH = os.path.join(os.path.dirname(__file__), "isl_landmark_dataset.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "app", "model_store")
MODEL_PATH = os.path.join(MODEL_DIR, "isl_landmark_model.h5")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")

MIN_SAMPLES_PER_LABEL = 15
HAND_SLOTS = ["right", "left"]


def load_dataset():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}.")
        print("Export it from the app first: Data Collection page -> Export Dataset,")
        print("or GET /api/dataset/export, and save it to that path.")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)

    counts = df["label"].value_counts()
    sparse = counts[counts < MIN_SAMPLES_PER_LABEL]
    if len(sparse):
        print("Warning: these labels have very few samples and may hurt accuracy:")
        print(sparse)

    two_handed_labels = df.groupby("label")["num_hands"].max()
    print("Signs detected (1-handed vs 2-handed):")
    for label, max_hands in two_handed_labels.items():
        print(f"  {label}: {'two-handed' if max_hands >= 2 else 'single-hand'}")

    features = []
    for _, row in df.iterrows():
        hands = {}
        for slot in HAND_SLOTS:
            cols = [f"{slot}_p{i}_{axis}" for i in range(21) for axis in ("x", "y", "z")]
            values = row[cols].values.astype(np.float32)
            if np.any(values):  # slot wasn't all-zero -> hand was present
                hands[slot.capitalize()] = values.reshape(21, 3)
            else:
                hands[slot.capitalize()] = None
        features.append(normalize_two_hand_sample(hands))

    features = np.array(features)
    labels = df["label"].values
    return features, labels


def build_model(input_dim: int, num_classes: int):
    """A lightweight 1D-CNN over the 126 landmark features (63 for the
    Right-hand slot + 63 for the Left-hand slot). Convolution lets the
    network learn local relationships between neighboring landmark
    coordinates, within and across the two hand slots, before the dense
    classification head."""
    inputs = layers.Input(shape=(input_dim, 1))
    x = layers.Conv1D(32, 3, activation="relu", padding="same")(inputs)
    x = layers.Conv1D(64, 3, activation="relu", padding="same")(x)
    x = layers.MaxPooling1D(2)(x)
    x = layers.Conv1D(64, 3, activation="relu", padding="same")(x)
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = models.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    print("Loading dataset...")
    features, raw_labels = load_dataset()

    encoder = LabelEncoder()
    y = encoder.fit_transform(raw_labels)
    num_classes = len(encoder.classes_)
    print(f"Found {len(features)} samples across {num_classes} sign classes: {list(encoder.classes_)}")

    X_train, X_test, y_train, y_test = train_test_split(
        features, y, test_size=0.2, random_state=42, stratify=y if num_classes > 1 else None
    )

    X_train = X_train.reshape(-1, features.shape[1], 1)
    X_test = X_test.reshape(-1, features.shape[1], 1)

    model = build_model(features.shape[1], num_classes)
    model.summary()

    early_stop = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True)

    print("Training...")
    model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=100,
        batch_size=16,
        callbacks=[early_stop],
        verbose=2,
    )

    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest accuracy: {acc * 100:.1f}%  (loss: {loss:.3f})")

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(MODEL_PATH)
    with open(LABELS_PATH, "w") as f:
        json.dump(list(encoder.classes_), f)

    print(f"\nSaved model to {MODEL_PATH}")
    print(f"Saved label mapping to {LABELS_PATH}")
    print("Restart the backend API to start serving real predictions.")


if __name__ == "__main__":
    main()
