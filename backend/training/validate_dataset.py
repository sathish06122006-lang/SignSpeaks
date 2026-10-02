"""
Validate the ISL landmark dataset without training anything.
Checks: shape, missing values, duplicates, class balance, and pose
variety per label, so you can catch data problems before spending
time training a model.

Usage:
    cd backend
    python training/validate_dataset.py
"""
import os
import sys

import pandas as pd

DATASET_PATH = os.path.join(os.path.dirname(__file__), "isl_landmark_dataset.csv")


def main():
    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}.")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)
    print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns\n")

    print("=== Label counts ===")
    print(df["label"].value_counts().sort_index())

    print("\n=== Category counts ===")
    print(df["category"].value_counts())

    print("\n=== num_hands distribution ===")
    print(df["num_hands"].value_counts())

    missing = df.isnull().sum().sum()
    dupes = df.duplicated().sum()
    print(f"\nMissing values: {missing}")
    print(f"Duplicate rows: {dupes}")

    min_samples = df["label"].value_counts().min()
    max_samples = df["label"].value_counts().max()
    print(f"\nSamples per label - min: {min_samples}, max: {max_samples}")
    sparse = df["label"].value_counts()
    sparse = sparse[sparse < 30]
    if len(sparse):
        print("\nWarning - labels with fewer than 30 samples (may hurt accuracy):")
        print(sparse)
    else:
        print("\nAll labels have 30+ samples. Good.")

    landmark_cols = [c for c in df.columns if c.startswith("right_") or c.startswith("left_")]
    grouped_std = df.groupby("label")[landmark_cols].std().mean(axis=1).sort_values()
    print("\n=== Lowest pose-variety labels (may need more varied captures) ===")
    print(grouped_std.head(5))
    print("\n=== Highest pose-variety labels ===")
    print(grouped_std.tail(5))

    print("\nValidation complete. No model was trained.")


if __name__ == "__main__":
    main()
