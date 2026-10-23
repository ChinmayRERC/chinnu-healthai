import type { Profile, WorkoutItem } from "../types";
import { libraryById } from "./library";

export type Focus = "full" | "upper" | "lower" | "push" | "pull" | "glutes" | "core";

export const FOCUS_LABEL: Record<Focus, string> = {
  full: "Full body",
  upper: "Upper body",
  lower: "Lower body",
  push: "Push",
  pull: "Pull",
  glutes: "Glutes & legs",
  core: "Core",
};

type Slot = {
  label: string;
  candidates: string[];
  region: string;
  hold?: boolean;
};

const SLOTS: Record<Focus, Slot[]> = {
  full: [
    { label: "Squat", region: "Quads", candidates: ["Barbell_Squat", "Goblet_Squat", "Bodyweight_Squat"] },
    { label: "Hinge", region: "Hamstrings", candidates: ["Romanian_Deadlift", "Barbell_Deadlift", "Barbell_Glute_Bridge"] },
    { label: "Push", region: "Chest", candidates: ["Dumbbell_Bench_Press", "Barbell_Bench_Press_-_Medium_Grip", "Pushups"] },
    { label: "Pull", region: "Lower back", candidates: ["Bent_Over_Two-Dumbbell_Row", "Bent_Over_Barbell_Row", "Inverted_Row"] },
    { label: "Press", region: "Shoulders", candidates: ["Dumbbell_Shoulder_Press", "Push_Press", "Side_Lateral_Raise"] },
    { label: "Core", region: "Core", candidates: ["Plank", "Russian_Twist", "Mountain_Climbers"], hold: true },
  ],
  upper: [
    { label: "Horizontal push", region: "Chest", candidates: ["Dumbbell_Bench_Press", "Barbell_Bench_Press_-_Medium_Grip", "Pushups"] },
    { label: "Horizontal pull", region: "Lower back", candidates: ["Bent_Over_Two-Dumbbell_Row", "Seated_Cable_Rows", "Inverted_Row"] },
    { label: "Vertical push", region: "Shoulders", candidates: ["Dumbbell_Shoulder_Press", "Push_Press", "Side_Lateral_Raise"] },
    { label: "Vertical pull", region: "Lower back", candidates: ["Wide-Grip_Lat_Pulldown", "Pullups", "Chin-Up"] },
    { label: "Elbow flexion", region: "Biceps", candidates: ["Dumbbell_Bicep_Curl", "Hammer_Curls", "Barbell_Curl"] },
    { label: "Elbow extension", region: "Triceps", candidates: ["Triceps_Pushdown", "Dips_-_Triceps_Version", "Cable_Rope_Overhead_Triceps_Extension"] },
  ],
  lower: [
    { label: "Squat", region: "Quads", candidates: ["Barbell_Squat", "Goblet_Squat", "Bodyweight_Squat"] },
    { label: "Hinge", region: "Hamstrings", candidates: ["Romanian_Deadlift", "Barbell_Deadlift", "Barbell_Glute_Bridge"] },
    { label: "Single leg", region: "Quads", candidates: ["Barbell_Lunge", "Dumbbell_Lunges", "Step-up_with_Knee_Raise"] },
    { label: "Glute isolation", region: "Glutes", candidates: ["Barbell_Hip_Thrust", "Barbell_Glute_Bridge", "Single_Leg_Glute_Bridge"] },
    { label: "Hamstring isolation", region: "Hamstrings", candidates: ["Lying_Leg_Curls", "Romanian_Deadlift", "Stiff-Legged_Barbell_Deadlift"] },
    { label: "Calves", region: "Calves", candidates: ["Standing_Calf_Raises", "Seated_Calf_Raise", "Calf_Press"] },
  ],
  push: [
    { label: "Chest press", region: "Chest", candidates: ["Dumbbell_Bench_Press", "Barbell_Bench_Press_-_Medium_Grip", "Pushups"] },
    { label: "Incline press", region: "Chest", candidates: ["Incline_Dumbbell_Press", "Barbell_Incline_Bench_Press_-_Medium_Grip", "Decline_Push-Up"] },
    { label: "Shoulder press", region: "Shoulders", candidates: ["Dumbbell_Shoulder_Press", "Push_Press", "Arnold_Press"] },
    { label: "Triceps", region: "Triceps", candidates: ["Triceps_Pushdown", "Dips_-_Triceps_Version", "Cable_Rope_Overhead_Triceps_Extension"] },
    { label: "Side delts", region: "Shoulders", candidates: ["Side_Lateral_Raise", "Lateral_Raise_-_With_Bands", "Cable_Seated_Lateral_Raise"] },
  ],
  pull: [
    { label: "Vertical pull", region: "Lower back", candidates: ["Wide-Grip_Lat_Pulldown", "Pullups", "Chin-Up"] },
    { label: "Horizontal pull", region: "Lower back", candidates: ["Bent_Over_Two-Dumbbell_Row", "Seated_Cable_Rows", "Inverted_Row"] },
    { label: "Rear delts", region: "Shoulders", candidates: ["Face_Pull", "Dumbbell_Lying_Rear_Lateral_Raise", "Lateral_Raise_-_With_Bands"] },
    { label: "Biceps", region: "Biceps", candidates: ["Dumbbell_Bicep_Curl", "Hammer_Curls", "Preacher_Curl"] },
    { label: "Forearms", region: "Forearms", candidates: ["Seated_Palms-Down_Barbell_Wrist_Curl", "Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl", "Palms-Down_Wrist_Curl_Over_A_Bench"] },
  ],
  glutes: [
    { label: "Hip thrust", region: "Glutes", candidates: ["Barbell_Hip_Thrust", "Barbell_Glute_Bridge", "Single_Leg_Glute_Bridge"] },
    { label: "Squat", region: "Quads", candidates: ["Barbell_Squat", "Goblet_Squat", "Bodyweight_Squat"] },
    { label: "Hinge", region: "Hamstrings", candidates: ["Romanian_Deadlift", "Barbell_Deadlift", "Stiff-Legged_Barbell_Deadlift"] },
    { label: "Single leg", region: "Glutes", candidates: ["Barbell_Lunge", "Dumbbell_Lunges", "Step-up_with_Knee_Raise"] },
    { label: "Abduction", region: "Glutes", candidates: ["Barbell_Hip_Thrust", "Single_Leg_Glute_Bridge", "Bodyweight_Squat"] },
    { label: "Core", region: "Core", candidates: ["Plank", "Russian_Twist", "Mountain_Climbers"], hold: true },
  ],
  core: [
    { label: "Anti-extension", region: "Core", candidates: ["Plank", "Ab_Roller", "Stability_Ball_Ab_Rollout"], hold: true },
    { label: "Rotation", region: "Core", candidates: ["Russian_Twist", "Cable_Crunch", "Kneeling_Cable_Crunch_With_Alternating_Oblique_Twists"] },
    { label: "Lower abs", region: "Core", candidates: ["Hanging_Leg_Raise", "Reverse_Crunch", "Decline_Reverse_Crunch"] },
    { label: "Carry", region: "Core", candidates: ["Farmers_Walk", "Side_Bridge", "Mountain_Climbers"], hold: true },
  ],
};

function equipmentAllowed(profile: Profile, equipment: string): boolean {
  const selected = profile.equipment.length ? profile.equipment : ["body only", "dumbbell"];
  if (selected.includes(equipment)) return true;
  if (equipment === "body only") return true;
  if (equipment === "other") return true;
  return false;
}

function choose(slot: Slot, profile: Profile, used: Set<string>): string | null {
  for (const id of slot.candidates) {
    const exercise = libraryById.get(id);
    if (!exercise || used.has(id)) continue;
    if (!equipmentAllowed(profile, exercise.equipment)) continue;
    used.add(id);
    return id;
  }
  const fallback = [...libraryById.values()].find(
    (exercise) =>
      !used.has(exercise.id) &&
      exercise.region === slot.region &&
      equipmentAllowed(profile, exercise.equipment) &&
      (profile.experience !== "beginner" || exercise.level !== "expert"),
  );
  if (!fallback) return null;
  used.add(fallback.id);
  return fallback.id;
}

export function generateRoutine(profile: Profile, focus: Focus): WorkoutItem[] {
  const used = new Set<string>();
  const slots = SLOTS[focus];
  const count = profile.experience === "beginner" ? Math.min(5, slots.length) : slots.length;
  const sets =
    profile.goal === "strength" ? 4 : profile.goal === "gain" ? 4 : profile.experience === "beginner" ? 2 : 3;
  const reps = profile.goal === "strength" ? 5 : profile.goal === "gain" ? 8 : 12;
  const rest = profile.goal === "strength" ? 150 : profile.goal === "gain" ? 105 : 75;

  return slots.slice(0, count).flatMap((slot) => {
    const id = choose(slot, profile, used);
    if (!id) return [];
    const exercise = libraryById.get(id);
    const isHold = slot.hold || exercise?.primaryMuscles.includes("abdominals");
    return [
      {
        exerciseId: id,
        sets,
        target: isHold ? 35 : reps,
        targetType: isHold ? "seconds" : "reps",
        rest,
      } satisfies WorkoutItem,
    ];
  });
}

export function workoutTitle(focus: Focus): string {
  return `${FOCUS_LABEL[focus]} session`;
}
