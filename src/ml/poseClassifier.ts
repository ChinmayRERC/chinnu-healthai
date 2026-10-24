import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface PosePrediction {
  class: string;
  confidence: number;
  probs: Record<string, number>;
}

export class PoseClassifier {
  private model: tf.LayersModel | tf.GraphModel | null = null;
  private labels: string[] = [];
  private ready = false;
  
  async load(modelUrl = '/models/pose-classifier/model.json', labelsUrl = '/models/pose-classifier/labels.json') {
    try {
      await tf.ready();
      const [model, labels] = await Promise.all([
        tf.loadLayersModel(modelUrl).catch(() => tf.loadGraphModel(modelUrl)),
        fetch(labelsUrl).then(r => r.json()).catch(() => [])
      ]);
      this.model = model;
      this.labels = labels;
      this.ready = true;
      return true;
    } catch (e) {
      console.warn('Pose classifier load failed:', e);
      return false;
    }
  }
  
  async predict(features: number[]): Promise<PosePrediction | null> {
    if (!this.ready || !this.model) return null;
    const input = tf.tensor2d([features]);
    const out = this.model.predict(input) as tf.Tensor;
    const probs = await out.data();
    input.dispose(); out.dispose();
    
    const arr = Array.from(probs as Float32Array | Int32Array | Uint8Array);
    const maxIdx = arr.indexOf(Math.max(...arr));
    const confidence = arr[maxIdx] as number;
    const probsMap: Record<string,number> = {};
    this.labels.forEach((l,i) => probsMap[l] = arr[i] as number);
    
    return { class: this.labels[maxIdx] || `class_${maxIdx}`, confidence, probs: probsMap };
  }
  
  isReady() { return this.ready; }
}

export const poseClassifier = new PoseClassifier();
