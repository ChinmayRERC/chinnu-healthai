import type { Point } from "../exercises";

export function toPixels(points: Point[], w: number, h: number) {
  return points.map(p => ({ ...p, x: p.x * w, y: p.y * h }));
}

export function visible(p?: Point, thr = 0.65) {
  if (!p) return false;
  return Math.min(p.visibility ?? 0, p.presence ?? 1) >= thr;
}

export function dist(a?: Point, b?: Point) {
  if (!a || !b) return NaN;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angle(a?: Point, b?: Point, c?: Point) {
  if (!a || !b || !c) return NaN;
  const u = { x: a.x - b.x, y: a.y - b.y };
  const v = { x: c.x - b.x, y: c.y - b.y };
  const nu = Math.hypot(u.x, u.y);
  const nv = Math.hypot(v.x, v.y);
  const n = nu * nv;
  if (n < 1e-8) return NaN;
  const dot = Math.max(-1, Math.min(1, (u.x * v.x + u.y * v.y) / n));
  return Math.acos(dot) * 180 / Math.PI;
}

// Normalize by torso length for scale/position invariance
export function normalizeByTorso(points: Point[]) {
  const lShoulder = points[11], rShoulder = points[12];
  const lHip = points[23], rHip = points[24];
  const shoulderMid = { x: (lShoulder.x + rShoulder.x)/2, y: (lShoulder.y + rShoulder.y)/2 };
  const hipMid = { x: (lHip.x + rHip.x)/2, y: (lHip.y + rHip.y)/2 };
  const torso = Math.hypot(shoulderMid.x - hipMid.x, shoulderMid.y - hipMid.y) || 1;
  return points.map(p => ({ ...p, x: (p.x - hipMid.x)/torso, y: (p.y - hipMid.y)/torso }));
}

export type KeypointVec = { x:number,y:number,v:number };

export class EMA {
  alpha = 0.4;
  last: KeypointVec[] | null = null;
  smooth(kps: KeypointVec[]) {
    if (!this.last) { this.last = kps.map(k => ({...k})); return this.last; }
    const out = kps.map((k,i) => {
      const l = this.last![i];
      const v = k.v < 0.4 ? l.v : k.v;
      return { x: this.alpha*k.x + (1-this.alpha)*l.x, y: this.alpha*k.y + (1-this.alpha)*l.y, v };
    });
    this.last = out;
    return out;
  }
  reset() { this.last = null; }
}
