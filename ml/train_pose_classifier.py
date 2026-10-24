#!/usr/bin/env python3
"""
Train a pose classification model for gym/yoga exercises using MediaPipe pose landmarks.
Collect data by running the app in "record" mode or export CSV from Trainer.

Usage:
  pip install mediapipe opencv-python numpy scikit-learn tensorflow
  python ml/train_pose_classifier.py --data data/poses.csv --out models/pose-classifier
"""

import argparse
import json
import os
from pathlib import Path
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf

def load_data(csv_path):
    data = []
    labels = []
    with open(csv_path) as f:
        header = f.readline().strip().split(',')
        for line in f:
            parts = line.strip().split(',')
            if len(parts) < 2: continue
            label = parts[0]
            feats = [float(x) for x in parts[1:]]
            data.append(feats)
            labels.append(label)
    return np.array(data), np.array(labels)

def build_model(input_dim, num_classes):
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(input_dim,)),
        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True)
    parser.add_argument('--out', required=True)
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--batch', type=int, default=32)
    args = parser.parse_args()
    
    X, y = load_data(args.data)
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    classes = le.classes_.tolist()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, stratify=y_enc, random_state=42)
    
    model = build_model(X.shape[1], len(classes))
    cb = [tf.keras.callbacks.EarlyStopping(patience=15, restore_best_weights=True),
          tf.keras.callbacks.ReduceLROnPlateau(patience=7, factor=0.5)]
    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=args.epochs, batch_size=args.batch, callbacks=cb)
    
    print(model.evaluate(X_test, y_test))
    
    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)
    model.save(outdir / 'model.keras')
    # Convert to TFJS format
    import tensorflowjs as tfjs
    tfjs.converters.save_keras_model(model, str(outdir))
    with open(outdir / 'labels.json', 'w') as f:
        json.dump(classes, f)
    print(f'Saved to {outdir}')

if __name__ == '__main__':
    main()
