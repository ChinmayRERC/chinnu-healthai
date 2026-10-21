export type Point = { x: number; y: number; z?: number; visibility?: number; presence?: number };
export type Rule = { feature: string; min: number; max: number; cue: string; explanation: string };
export type Exercise = {
  id: string;
  name: string;
  category: "Gym" | "Yoga" | "Breathing";
  view: "Side" | "Front";
  muscles: string[];
  feature?: string;
  phase?: { low: number; high: number };
  rules: Rule[];
  seconds: number;
  restricted: boolean;
};
export type Flag = Rule & { time: number; rep: number; value: number };
export type Sample = { time: number; score: number | null; tracked: boolean; phase: string; reps: number; hold: number; cue: string; features: Record<string, number>; flags: Flag[] };

export const exercises: Exercise[] = [
  { id: "squat", name: "Squat", category: "Gym", view: "Side", muscles: ["Quads", "Glutes", "Hamstrings"], feature: "knee", phase: { low: 95, high: 155 }, rules: [{ feature: "trunk", min: 0, max: 45, cue: "Try a shallower squat", explanation: "Your trunk inclination moved outside the reference range." }], seconds: 45, restricted: false },
  { id: "pushup", name: "Push-up", category: "Gym", view: "Side", muscles: ["Chest", "Triceps", "Shoulders", "Core"], feature: "elbow", phase: { low: 95, high: 155 }, rules: [{ feature: "body", min: 155, max: 180, cue: "Keep hips in line", explanation: "Your shoulder-hip-ankle angle moved outside the reference range." }], seconds: 40, restricted: true },
  { id: "lunge", name: "Lunge", category: "Gym", view: "Side", muscles: ["Quads", "Glutes", "Hamstrings"], feature: "knee", phase: { low: 100, high: 155 }, rules: [{ feature: "trunk", min: 0, max: 25, cue: "Keep your torso upright", explanation: "Your visible trunk leans beyond the reference range." }], seconds: 40, restricted: true },
  { id: "plank", name: "Plank", category: "Gym", view: "Side", muscles: ["Core", "Shoulders", "Glutes"], rules: [{ feature: "body", min: 160, max: 180, cue: "Bring your hips into line", explanation: "Your shoulder-hip-ankle angle is outside the reference range." }], seconds: 30, restricted: true },
  { id: "curl", name: "Bicep curl", category: "Gym", view: "Side", muscles: ["Biceps", "Forearms"], feature: "elbow", phase: { low: 65, high: 145 }, rules: [{ feature: "upperArm", min: 0, max: 30, cue: "Keep your upper arm still", explanation: "Your upper arm drifted away from your torso." }], seconds: 40, restricted: false },
  { id: "hinge", name: "Hip hinge", category: "Gym", view: "Side", muscles: ["Glutes", "Hamstrings", "Lower back"], feature: "hip", phase: { low: 100, high: 155 }, rules: [{ feature: "knee", min: 135, max: 180, cue: "Soften your knees slightly", explanation: "Your knee angle is outside the unloaded practice range." }], seconds: 40, restricted: true },
  { id: "mountain", name: "Mountain", category: "Yoga", view: "Front", muscles: ["Core", "Shoulders"], rules: [{ feature: "shoulderTilt", min: 0, max: 8, cue: "Relax and level your shoulders", explanation: "The visible shoulder line is tilted." }], seconds: 30, restricted: false },
  { id: "warrior", name: "Warrior II", category: "Yoga", view: "Front", muscles: ["Quads", "Glutes", "Shoulders"], rules: [{ feature: "armLine", min: 150, max: 180, cue: "Reach arms out comfortably", explanation: "Your shoulder-elbow-wrist angle is outside the reference range." }], seconds: 30, restricted: true },
  { id: "tree", name: "Supported Tree", category: "Yoga", view: "Front", muscles: ["Glutes", "Core", "Calves"], rules: [{ feature: "trunk", min: 0, max: 15, cue: "Use support and steady your torso", explanation: "Your visible torso axis is tilted." }], seconds: 20, restricted: true },
  { id: "chair", name: "Chair", category: "Yoga", view: "Side", muscles: ["Quads", "Glutes", "Core"], rules: [{ feature: "knee", min: 95, max: 150, cue: "Adjust to a comfortable chair position", explanation: "Your knee angle differs from the reference." }], seconds: 20, restricted: true },
  { id: "triangle", name: "Triangle", category: "Yoga", view: "Front", muscles: ["Core", "Hamstrings", "Shoulders"], rules: [{ feature: "armLine", min: 150, max: 180, cue: "Lengthen your visible arm comfortably", explanation: "The visible arm is bent relative to the reference." }], seconds: 20, restricted: true },
  { id: "dog", name: "Downward Dog", category: "Yoga", view: "Side", muscles: ["Shoulders", "Hamstrings", "Calves"], rules: [{ feature: "hip", min: 40, max: 100, cue: "Adjust your hips gently", explanation: "The shoulder-hip-knee angle differs from the reference." }], seconds: 20, restricted: true },
  { id: "cobra", name: "Cobra", category: "Yoga", view: "Side", muscles: ["Lower back", "Chest", "Shoulders"], rules: [{ feature: "elbow", min: 95, max: 165, cue: "Keep a comfortable elbow bend", explanation: "Your elbow angle differs from the reference; spinal curvature is not measured." }], seconds: 15, restricted: true },
  { id: "child", name: "Child's pose", category: "Yoga", view: "Side", muscles: ["Lower back", "Shoulders"], rules: [], seconds: 30, restricted: true },
  { id: "breathing", name: "Seated breathing", category: "Breathing", view: "Front", muscles: ["Core"], rules: [{ feature: "shoulderTilt", min: 0, max: 10, cue: "Relax your shoulders", explanation: "Your visible shoulder line is tilted." }], seconds: 60, restricted: false },
];

const guides: Record<string, { setup: string; steps: string[]; avoid: string }> = {
  squat: { setup: "Side view. Keep a stable chair behind you if useful.", steps: ["Stand with feet around hip width.", "Move hips back and bend within a comfortable range.", "Press through your feet and return without rushing."], avoid: "Do not force depth or push through pain." },
  pushup: { setup: "Side view. A wall or raised surface is a valid starting option.", steps: ["Place hands comfortably under the shoulders.", "Lower as one controlled unit.", "Press away without letting the hips drop."], avoid: "Do not force painful wrist or shoulder angles." },
  lunge: { setup: "Side view. Use a nearby stable support.", steps: ["Take a comfortable split stance.", "Lower both knees only as far as comfortable.", "Push through your feet to rise."], avoid: "Do not force knee depth." },
  plank: { setup: "Side view. Start against a wall or elevated support.", steps: ["Place forearms or hands on the support.", "Maintain a comfortable shoulder-hip-ankle line.", "Breathe normally, hold briefly, then rest."], avoid: "Stop for back or shoulder pain." },
  curl: { setup: "Side view. Begin without weight or with a light object.", steps: ["Keep the arm comfortably at your side.", "Bend the elbow without swinging.", "Lower slowly to the start."], avoid: "Do not swing a heavy weight." },
  hinge: { setup: "Side view. Unloaded practice only.", steps: ["Stand tall with knees soft.", "Send hips backward as the torso inclines.", "Return with control."], avoid: "The camera cannot establish spinal safety." },
};

export function guideFor(exercise: Exercise) {
  return guides[exercise.id] || { setup: `${exercise.view} view with your whole body visible.`, steps: ["Set a comfortable starting position.", "Move slowly and breathe naturally.", "Return gently and rest when needed."], avoid: "Stop if you feel pain, dizziness, or instability." };
}

function angle(a: Point, b: Point, c: Point) {
  const u = { x: a.x - b.x, y: a.y - b.y }, v = { x: c.x - b.x, y: c.y - b.y };
  const n = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
  return n < 1e-8 ? NaN : Math.acos(Math.max(-1, Math.min(1, (u.x * v.x + u.y * v.y) / n))) * 180 / Math.PI;
}
const visible = (p?: Point) => !!p && Math.min(p.visibility ?? 0, p.presence ?? 1) >= 0.65;
function measure(points: Point[], width: number, height: number) {
  const p = points.map(v => ({ ...v, x: v.x * width, y: v.y * height }));
  const left = [11, 13, 15, 23, 25, 27], right = [12, 14, 16, 24, 26, 28];
  const side = left.filter(i => visible(p[i])).length >= right.filter(i => visible(p[i])).length ? left : right;
  const [s, e, w, h, k, a] = side, out: Record<string, number> = {};
  const joint = (name: string, ids: number[]) => { if (ids.every(i => visible(p[i]))) out[name] = angle(p[ids[0]], p[ids[1]], p[ids[2]]); };
  joint("knee", [h, k, a]); joint("hip", [s, h, k]); joint("elbow", [s, e, w]); joint("body", [s, h, a]); joint("armLine", [s, e, w]); joint("upperArm", [e, s, h]);
  if (visible(p[s]) && visible(p[h])) out.trunk = Math.atan2(Math.abs(p[s].x - p[h].x), Math.abs(p[s].y - p[h].y)) * 180 / Math.PI;
  if (visible(p[11]) && visible(p[12])) out.shoulderTilt = Math.atan2(Math.abs(p[11].y - p[12].y), Math.abs(p[11].x - p[12].x)) * 180 / Math.PI;
  return out;
}

export class MovementEngine {
  reps = 0; hold = 0; phase = "ready"; private previous: number | null = null; private stageAt = 0; private violation = new Map<string, number>(); private lastFlag = new Map<string, number>();
  constructor(public exercise: Exercise) {}
  suspend() { this.previous = null; this.phase = "ready"; this.violation.clear(); }
  update(points: Point[], time: number, width: number, height: number): Sample {
    const gap = this.previous === null ? 0 : time - this.previous; this.previous = time;
    const features = measure(points, width, height);
    const required = [...new Set([...this.exercise.rules.map(r => r.feature), ...(this.exercise.feature ? [this.exercise.feature] : [])])];
    const tracked = required.length ? required.every(name => Number.isFinite(features[name])) : [11, 12, 23, 24].every(i => visible(points[i]));
    if (!tracked) { this.phase = "ready"; this.violation.clear(); return { time, score: null, tracked, phase: this.phase, reps: this.reps, hold: this.hold, cue: "Step into frame and keep the required joints visible", features, flags: [] }; }
    if (this.exercise.phase && this.exercise.feature) {
      const value = features[this.exercise.feature], { low, high } = this.exercise.phase;
      if (this.phase === "ready" && value >= high - 3) { this.phase = "up"; this.stageAt = time; }
      else if (this.phase === "up" && value <= low + 3 && time - this.stageAt > 0.25) { this.phase = "down"; this.stageAt = time; }
      else if (this.phase === "down" && value >= high - 3 && time - this.stageAt > 0.25) { this.reps++; this.phase = "up"; this.stageAt = time; }
    }
    let penalty = 0, cue = "Keep a comfortable, controlled pace"; const flags: Flag[] = [];
    for (const rule of this.exercise.rules) {
      const value = features[rule.feature], delta = Math.max(rule.min - value, value - rule.max, 0); penalty += Math.min(40, delta * 2);
      if (delta > 0) { if (!this.violation.has(rule.feature)) this.violation.set(rule.feature, time); if (time - this.violation.get(rule.feature)! > 0.6) { cue = rule.cue; if (time - (this.lastFlag.get(rule.feature) ?? -10) > 3) { flags.push({ ...rule, time, rep: this.reps + 1, value: Math.round(value) }); this.lastFlag.set(rule.feature, time); } } } else this.violation.delete(rule.feature);
    }
    const score = this.exercise.rules.length ? Math.round(Math.max(0, 100 - penalty)) : null;
    if (!this.exercise.phase && gap > 0 && gap < 0.5 && (score === null || score >= 70)) this.hold += gap;
    return { time, score, tracked, phase: this.phase, reps: this.reps, hold: this.hold, cue: this.exercise.rules.length ? cue : "Rest comfortably; alignment is not scored for this pose", features, flags };
  }
}
