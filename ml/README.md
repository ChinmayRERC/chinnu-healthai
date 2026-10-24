# Pose Tracking ML Model

This adds a trainable ML classifier on top of MediaPipe Pose for better rep counting, phase detection, and form scoring for gym and yoga.

## Quick Start (Inference)

1. Train a model (see below) and export to `public/models/pose-classifier/` with `model.json`, `*.bin`, and `labels.json`
2. The app will auto-load it in Trainer - ML predictions augment the rule-based engine

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

## Features

- Scale/position invariant (torso-normalized)
- Joint angles, symmetry, velocities
- Temporal smoothing (EMA)
- Works for gym (reps) and yoga (holds/alignment)
- GPU accelerated in browser via WebGL

## Model Architecture

Simple MLP: 96 input features -> 256 -> 128 -> 64 -> num_classes (softmax)
Trained with dropout + batch norm for generalization.
