import type { Point } from "../exercises";
import { angle, dist, normalizeByTorso, visible, toPixels } from "./poseUtils";

export type PoseFeatureVector = number[];

// MediaPipe Pose Landmarks
export const LM = {
  NOSE:0, LEFT_EYE_INNER:1, LEFT_EYE:2, LEFT_EYE_OUTER:3, RIGHT_EYE_INNER:4, RIGHT_EYE:5, RIGHT_EYE_OUTER:6,
  LEFT_EAR:7, RIGHT_EAR:8, MOUTH_LEFT:9, MOUTH_RIGHT:10,
  LEFT_SHOULDER:11, RIGHT_SHOULDER:12, LEFT_ELBOW:13, RIGHT_ELBOW:14, LEFT_WRIST:15, RIGHT_WRIST:16,
  LEFT_PINKY:17, RIGHT_PINKY:18, LEFT_INDEX:19, RIGHT_INDEX:20, LEFT_THUMB:21, RIGHT_THUMB:22,
  LEFT_HIP:23, RIGHT_HIP:24, LEFT_KNEE:25, RIGHT_KNEE:26, LEFT_ANKLE:27, RIGHT_ANKLE:28,
  LEFT_HEEL:29, RIGHT_HEEL:30, LEFT_FOOT_INDEX:31, RIGHT_FOOT_INDEX:32
};

function safeAngle(a?:Point,b?:Point,c?:Point){ const v = angle(a,b,c); return Number.isFinite(v)?v:0; }
function safeDist(a?:Point,b?:Point){ const v = dist(a,b); return Number.isFinite(v)?v:0; }

export function extractFeatures(points: Point[], width:number, height:number, prev?: Point[]): PoseFeatureVector {
  if (!points || points.length < 33) return Array(128).fill(0);
  const p = toPixels(points, width, height);
  const n = normalizeByTorso(points);
  const side = [LM.LEFT_SHOULDER,LM.LEFT_HIP,LM.LEFT_KNEE,LM.LEFT_ANKLE].filter(i=>visible(p[i])).length >= 
               [LM.RIGHT_SHOULDER,LM.RIGHT_HIP,LM.RIGHT_KNEE,LM.RIGHT_ANKLE].filter(i=>visible(p[i])).length ? 'left':'right';
  
  const S = side==='left'?LM.LEFT_SHOULDER:LM.RIGHT_SHOULDER;
  const E = side==='left'?LM.LEFT_ELBOW:LM.RIGHT_ELBOW;
  const W = side==='left'?LM.LEFT_WRIST:LM.RIGHT_WRIST;
  const H = side==='left'?LM.LEFT_HIP:LM.RIGHT_HIP;
  const K = side==='left'?LM.LEFT_KNEE:LM.RIGHT_KNEE;
  const A = side==='left'?LM.LEFT_ANKLE:LM.RIGHT_ANKLE;
  
  const features: number[] = [];
  // Angles
  features.push(safeAngle(p[S],p[E],p[W])); // elbow
  features.push(safeAngle(p[E],p[S],p[H])); // shoulder
  features.push(safeAngle(p[S],p[H],p[K])); // hip
  features.push(safeAngle(p[H],p[K],p[A])); // knee
  features.push(safeAngle(p[S],p[H],p[A])); // body
  features.push(safeAngle(p[11],p[12],p[24])); // torso-hips
  
  // Normalized keypoints (hip-centered, torso-scaled)
  const keyIdx = [LM.NOSE,LM.LEFT_SHOULDER,LM.RIGHT_SHOULDER,LM.LEFT_ELBOW,LM.RIGHT_ELBOW,LM.LEFT_WRIST,LM.RIGHT_WRIST,LM.LEFT_HIP,LM.RIGHT_HIP,LM.LEFT_KNEE,LM.RIGHT_KNEE,LM.LEFT_ANKLE,LM.RIGHT_ANKLE];
  for (const i of keyIdx) {
    features.push(n[i]?.x||0, n[i]?.y||0, visible(p[i])?1:0);
  }
  
  // Distances (normalized)
  features.push(safeDist(n[LM.LEFT_SHOULDER],n[LM.RIGHT_SHOULDER]));
  features.push(safeDist(n[LM.LEFT_HIP],n[LM.RIGHT_HIP]));
  features.push(safeDist(n[LM.LEFT_SHOULDER],n[LM.LEFT_HIP]));
  features.push(safeDist(n[LM.RIGHT_SHOULDER],n[LM.RIGHT_HIP]));
  
  // Symmetry
  const shDiff = Math.abs((n[LM.LEFT_SHOULDER]?.y||0)-(n[LM.RIGHT_SHOULDER]?.y||0));
  const hipDiff = Math.abs((n[LM.LEFT_HIP]?.y||0)-(n[LM.RIGHT_HIP]?.y||0));
  features.push(shDiff, hipDiff);
  
  // Velocity if previous frame exists
  if (prev && prev.length === points.length) {
    const pn = normalizeByTorso(prev);
    features.push(safeDist(n[LM.LEFT_WRIST],pn[LM.LEFT_WRIST]), safeDist(n[LM.RIGHT_WRIST],pn[LM.RIGHT_WRIST]));
    features.push(safeDist(n[LM.LEFT_ANKLE],pn[LM.LEFT_ANKLE]), safeDist(n[LM.RIGHT_ANKLE],pn[LM.RIGHT_ANKLE]));
    features.push(safeDist(n[LM.NOSE],pn[LM.NOSE]));
  } else {
    features.push(0,0,0,0,0);
  }
  
  // Pad to fixed size
  while (features.length < 96) features.push(0);
  return features.slice(0, 96);
}
