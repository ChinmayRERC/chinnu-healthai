# Experimental pose-classifier training

This folder keeps optional data collection and training scripts for future model work. The browser app currently uses MediaPipe Pose Lite and its rule engine. The TensorFlow.js classifier described here is not loaded by the app and does not affect repetitions, form cues, or safety guidance.

## Experimental export

The training script can export a TensorFlow.js model for experiments. It is not part of the current mobile tracking path. Exercise recognition over time is a later feature and should be evaluated on representative data before it is connected to the app.

## Collect Training Data

In the app, you can record poses. Or collect via Python:

```bash
pip install mediapipe opencv-python numpy
python ml/collect_poses.py --video ./squat.mp4 --label squat --out data/poses.csv
```

## Train Model

```bash
pip install tensorflow scikit-learn tensorflowjs
python ml/train_pose_classifier.py --data data/poses.csv --out public/models/pose-classifier --epochs 100
```

## Feature preparation

- Scale/position invariant (torso-normalized)
- Joint angles, symmetry, velocities
- Produces pose features for offline experiments.
- Current rep counts and supported form cues remain in the app's rule engine.

## Model Architecture

The current experimental script trains a simple MLP from collected pose features. It is not a temporal exercise-recognition model and should not be treated as a medical or safety system.
