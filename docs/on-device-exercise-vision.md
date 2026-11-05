# On-device exercise vision

## Runtime flow

- MediaPipe Pose Lite remains the live body tracker. The rule engine continues to count repetitions and report the known form cues.
- The camera requests 640×480 at about 15 frames per second. Pose processing is capped at 15 frames per second.
- An optional YOLOv8 ONNX detector runs on a 320×320 letterboxed frame every 750 ms. It is loaded only when a local model and manifest are both present.
- The detector runs in the browser with ONNX Runtime WebAssembly, which provides a CPU path for mobile browsers. It allows one inference at a time.
- YOLO detections can be paired with MediaPipe wrist positions to show simple visual context such as equipment near a hand. This context does not affect pose scores, rep counts, coaching rules, or safety guidance.
- YOLO frames remain on the device and are not uploaded. Optional AI coaching is a separate feature and may send selected frames to its configured service.

No equipment model weights are included in this repository. A custom model is needed because the generic COCO labels do not include common training equipment such as dumbbells and barbells.

## Add a custom model

Place a YOLOv8 detection model at public/models/equipment/equipment-320.onnx. Export it for a 320×320 input with NCHW float32 input values normalized to 0–1, raw xywh boxes, and one class score per class. The expected output is [1, 4 + classCount, candidates] or [1, candidates, 4 + classCount]; do not include an NMS output head.

Create public/models/equipment/manifest.json. The class list must use the same order as the model output:

    {
      "format": "yolov8-detection-v1",
      "modelFile": "equipment-320.onnx",
      "inputSize": 320,
      "confidenceThreshold": 0.35,
      "iouThreshold": 0.45,
      "classes": [
        {
          "id": "dumbbell",
          "kind": "equipment",
          "names": {
            "en": "Dumbbell",
            "hi": "डम्बल",
            "kn": "ಡಂಬೆಲ್"
          }
        },
        {
          "id": "exercise_mat",
          "kind": "environment",
          "names": {
            "en": "Exercise mat",
            "hi": "व्यायाम मैट",
            "kn": "ವ್ಯಾಯಾಮ ಮ್ಯಾಟ್"
          }
        }
      ]
    }

Use the class names the model was actually trained to recognize. The example labels are a format sample, not bundled detections or model capabilities. Keep the model on the same origin as the app. Vite copies only the ONNX Runtime WebAssembly files needed by this detector when both the manifest and model file exist.

## Boundaries

The detector reports visible object classes only. It must not determine whether an exercise is medically safe, detect injury, or override a user reporting pain. Rep counting and supported form cues remain in the rule engine. A temporal exercise-recognition model is a later addition after collecting and validating representative training data.
