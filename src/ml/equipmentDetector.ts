import type { InferenceSession } from "onnxruntime-web/wasm";
import type { Point } from "../exercises";
import type { Locale } from "../lib/locale";

export const EQUIPMENT_DETECTION_INTERVAL_MS = 750;
const MANIFEST_URL = "/models/equipment/manifest.json";
const YOLO_FORMAT = "yolov8-detection-v1";

export type EquipmentClass = {
  id: string;
  kind: "equipment" | "environment";
  names?: Partial<Record<Locale, string>>;
};

export type EquipmentDetection = EquipmentClass & {
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  nearHand?: boolean;
};

type EquipmentManifest = {
  format: typeof YOLO_FORMAT;
  modelFile: string;
  inputSize?: number;
  confidenceThreshold?: number;
  iouThreshold?: number;
  classes: EquipmentClass[];
};

type Letterbox = { scale: number; padX: number; padY: number };
type OrtRuntime = typeof import("onnxruntime-web/wasm");
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function isManifest(value: unknown): value is EquipmentManifest {
  if (!value || typeof value !== "object") return false;
  const manifest = value as Partial<EquipmentManifest>;
  return manifest.format === YOLO_FORMAT
    && typeof manifest.modelFile === "string"
    && /^[a-zA-Z0-9][a-zA-Z0-9._-]*[.]onnx$/.test(manifest.modelFile)
    && Array.isArray(manifest.classes)
    && manifest.classes.length > 0
    && manifest.classes.every((item) => item
      && typeof item.id === "string"
      && (item.kind === "equipment" || item.kind === "environment"));
}

function intersectionOverUnion(a: EquipmentDetection, b: EquipmentDetection) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
  const union = a.width * a.height + b.width * b.height - intersection;
  return union > 0 ? intersection / union : 0;
}

function suppressOverlaps(candidates: EquipmentDetection[], threshold: number) {
  const sorted = candidates.sort((a, b) => b.confidence - a.confidence);
  const kept: EquipmentDetection[] = [];
  for (const candidate of sorted) {
    if (kept.some((item) => item.id === candidate.id && intersectionOverUnion(item, candidate) > threshold)) continue;
    kept.push(candidate);
    if (kept.length >= 12) break;
  }
  return kept;
}

export class EquipmentDetector {
  private runtime: OrtRuntime | null = null;
  private session: InferenceSession | null = null;
  private manifest: EquipmentManifest | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private loadPromise: Promise<boolean> | null = null;
  private generation = 0;
  private lastInferenceAt = 0;
  private inferenceInFlight = false;

  isReady() {
    return !!this.session && !!this.manifest && !!this.runtime;
  }

  load() {
    if (this.isReady()) return Promise.resolve(true);
    if (!this.loadPromise) this.loadPromise = this.initialize();
    return this.loadPromise;
  }

  private async initialize(): Promise<boolean> {
    const generation = this.generation;
    try {
      const response = await fetch(MANIFEST_URL, { cache: "force-cache" });
      if (!response.ok) return false;
      const manifest: unknown = await response.json();
      if (!isManifest(manifest) || generation !== this.generation) return false;

      const inputSize = manifest.inputSize ?? 320;
      if (!Number.isInteger(inputSize) || inputSize < 256 || inputSize > 640) return false;
      const modelUrl = new URL("/models/equipment/" + manifest.modelFile, window.location.origin);
      const modelResponse = await fetch(modelUrl, { method: "HEAD", cache: "force-cache" });
      if (!modelResponse.ok || generation !== this.generation) return false;

      // The runtime is loaded only after a complete local model is found.
      const runtime = await import("onnxruntime-web/wasm");
      runtime.env.wasm.wasmPaths = new URL("/onnxruntime/", window.location.origin).href;
      runtime.env.wasm.numThreads = 1;
      const session = await runtime.InferenceSession.create(modelUrl.href, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      if (generation !== this.generation) {
        await session.release();
        return false;
      }

      this.runtime = runtime;
      this.session = session;
      this.manifest = manifest;
      this.canvas = document.createElement("canvas");
      this.canvas.width = inputSize;
      this.canvas.height = inputSize;
      this.context = this.canvas.getContext("2d", { willReadFrequently: true });
      if (!this.context) {
        this.close();
        return false;
      }
      return true;
    } catch (error) {
      console.info("Optional equipment model is not ready:", error);
      return false;
    }
  }

  async detect(video: HTMLVideoElement): Promise<EquipmentDetection[] | null> {
    if (!this.isReady() || !this.manifest || !this.session || !this.runtime
      || this.inferenceInFlight || performance.now() - this.lastInferenceAt < EQUIPMENT_DETECTION_INTERVAL_MS
      || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;

    this.inferenceInFlight = true;
    this.lastInferenceAt = performance.now();
    try {
      const inputSize = this.manifest.inputSize ?? 320;
      const letterbox = this.prepareInput(video, inputSize);
      if (!letterbox || !this.context) return null;
      const pixels = this.context.getImageData(0, 0, inputSize, inputSize).data;
      const tensorData = new Float32Array(3 * inputSize * inputSize);
      const plane = inputSize * inputSize;
      for (let pixel = 0; pixel < plane; pixel++) {
        const source = pixel * 4;
        tensorData[pixel] = pixels[source] / 255;
        tensorData[plane + pixel] = pixels[source + 1] / 255;
        tensorData[plane * 2 + pixel] = pixels[source + 2] / 255;
      }

      const input = new this.runtime.Tensor("float32", tensorData, [1, 3, inputSize, inputSize]);
      let outputs: Awaited<ReturnType<InferenceSession["run"]>>;
      try {
        outputs = await this.session.run({ [this.session.inputNames[0]]: input });
      } finally {
        input.dispose();
      }

      try {
        const output = outputs[this.session.outputNames[0]];
        if (!output || output.dims.length !== 3 || output.dims[0] !== 1) {
          throw new Error("Expected one YOLOv8 detection output.");
        }
        return this.decode(output.data as unknown as ArrayLike<number>, output.dims, letterbox, video.videoWidth, video.videoHeight);
      } finally {
        Object.values(outputs).forEach((tensor) => tensor.dispose());
      }
    } catch (error) {
      console.warn("Equipment detection skipped:", error);
      return null;
    } finally {
      this.inferenceInFlight = false;
    }
  }

  private prepareInput(video: HTMLVideoElement, size: number): Letterbox | null {
    if (!this.canvas || !this.context) return null;
    const scale = Math.min(size / video.videoWidth, size / video.videoHeight);
    const drawWidth = Math.round(video.videoWidth * scale);
    const drawHeight = Math.round(video.videoHeight * scale);
    const padX = Math.floor((size - drawWidth) / 2);
    const padY = Math.floor((size - drawHeight) / 2);
    this.context.fillStyle = "rgb(114, 114, 114)";
    this.context.fillRect(0, 0, size, size);
    this.context.drawImage(video, padX, padY, drawWidth, drawHeight);
    return { scale, padX, padY };
  }

  private decode(
    data: ArrayLike<number>,
    dims: readonly number[],
    letterbox: Letterbox,
    frameWidth: number,
    frameHeight: number,
  ): EquipmentDetection[] {
    if (!this.manifest) return [];
    const classCount = this.manifest.classes.length;
    const channelCount = classCount + 4;
    const channelsFirst = dims[1] === channelCount && dims[2] > channelCount;
    const channelsLast = dims[2] === channelCount && dims[1] > channelCount;
    if (!channelsFirst && !channelsLast) {
      throw new Error("Expected YOLOv8 output [1, 4 + classes, candidates].");
    }

    const candidateCount = channelsFirst ? dims[2] : dims[1];
    const get = (candidate: number, channel: number) => Number(data[
      channelsFirst ? channel * candidateCount + candidate : candidate * channelCount + channel
    ]);
    const threshold = this.manifest.confidenceThreshold ?? 0.35;
    const candidates: EquipmentDetection[] = [];

    for (let index = 0; index < candidateCount; index++) {
      let classIndex = 0;
      let confidence = 0;
      for (let label = 0; label < classCount; label++) {
        const score = get(index, label + 4);
        if (score > confidence) {
          confidence = score;
          classIndex = label;
        }
      }
      if (confidence < threshold) continue;

      const centerX = get(index, 0);
      const centerY = get(index, 1);
      const boxWidth = get(index, 2);
      const boxHeight = get(index, 3);
      const left = clamp01((centerX - boxWidth / 2 - letterbox.padX) / letterbox.scale / frameWidth);
      const top = clamp01((centerY - boxHeight / 2 - letterbox.padY) / letterbox.scale / frameHeight);
      const right = clamp01((centerX + boxWidth / 2 - letterbox.padX) / letterbox.scale / frameWidth);
      const bottom = clamp01((centerY + boxHeight / 2 - letterbox.padY) / letterbox.scale / frameHeight);
      if (right <= left || bottom <= top) continue;
      const item = this.manifest.classes[classIndex];
      candidates.push({
        ...item,
        confidence,
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      });
    }
    return suppressOverlaps(candidates, this.manifest.iouThreshold ?? 0.45);
  }

  close() {
    this.generation++;
    const session = this.session;
    this.session = null;
    if (session) void session.release();
    this.runtime = null;
    this.manifest = null;
    this.canvas = null;
    this.context = null;
    this.loadPromise = null;
    this.lastInferenceAt = 0;
    this.inferenceInFlight = false;
  }
}

// Equipment-to-wrist proximity is context for the interface only. It never
// changes rep counts, form cues, scores, or medical/safety decisions.
export function attachPoseContext(detections: EquipmentDetection[], points: Point[]): EquipmentDetection[] {
  const wrists = [points[15], points[16]].filter((point) =>
    point && Math.min(point.visibility ?? 0, point.presence ?? 1) >= 0.5);
  return detections.map((detection) => {
    if (detection.kind !== "equipment" || wrists.length === 0) return detection;
    const centerX = detection.x + detection.width / 2;
    const centerY = detection.y + detection.height / 2;
    const nearHand = wrists.some((wrist) => Math.hypot(wrist.x - centerX, wrist.y - centerY) <= 0.14);
    return { ...detection, nearHand };
  });
}
