This folder holds the trained model artifacts produced by
`backend/training/train_model.py`:

  isl_landmark_model.h5   - the trained TensorFlow/Keras model
  labels.json              - ordered list of sign labels the model predicts

Both files are auto-detected by `app/services/real_cnn.py` at request time.
Until they exist, live detection uses the transparent mock classifier in
`app/services/mock_cnn.py` so the app is fully runnable with zero setup.
