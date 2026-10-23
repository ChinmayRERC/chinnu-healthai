import rawExercises from "../data/exercises.json";
import { exercises as trackedExercises, type Exercise as TrackedExercise } from "../exercises";

export type LibraryExercise = {
  id: string;
  name: string;
  force: string | null;
  level: "beginner" | "intermediate" | "expert";
  mechanic: string | null;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  imageUrls: string[];
  region: string;
  trackedId?: string;
  youtube?: YoutubeDemo;
};

type RawExercise = {
  id: string;
  name: string;
  force?: string | null;
  level?: string | null;
  mechanic?: string | null;
  equipment?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[] | null;
  category?: string | null;
  images?: string[] | null;
};

export type YoutubeDemo = {
  id: string;
  title: string;
  channel: string;
};

export const IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export const MUSCLE_REGIONS = [
  "Shoulders",
  "Chest",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Lower back",
  "Glutes",
  "Quads",
  "Hamstrings",
  "Calves",
] as const;

export type MuscleRegion = (typeof MUSCLE_REGIONS)[number];

const MUSCLE_REGION: Record<string, MuscleRegion> = {
  abdominals: "Core",
  chest: "Chest",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  shoulders: "Shoulders",
  traps: "Shoulders",
  neck: "Shoulders",
  lats: "Lower back",
  "middle back": "Lower back",
  "lower back": "Lower back",
  glutes: "Glutes",
  abductors: "Glutes",
  hamstrings: "Hamstrings",
  quadriceps: "Quads",
  adductors: "Quads",
  calves: "Calves",
};

export function regionFor(muscle: string): MuscleRegion {
  return MUSCLE_REGION[muscle.toLowerCase()] || "Core";
}

export function regionLabel(region: string): string {
  if (region === "Lower back") return "Back";
  return region;
}

const TRACKED: Record<string, string> = {
  Barbell_Squat: "squat",
  Bodyweight_Squat: "squat",
  Barbell_Front_Squat: "squat",
  Goblet_Squat: "squat",
  Pushups: "pushup",
  Pushups_Close_and_Wide_Hand_Positions: "pushup",
  Barbell_Lunge: "lunge",
  Dumbbell_Lunges: "lunge",
  Bodyweight_Walking_Lunge: "lunge",
  Plank: "plank",
  Barbell_Curl: "curl",
  Dumbbell_Bicep_Curl: "curl",
  Hammer_Curls: "curl",
  Barbell_Deadlift: "hinge",
  Romanian_Deadlift: "hinge",
  Sumo_Deadlift: "hinge",
  "Stiff-Legged_Barbell_Deadlift": "hinge",
};

export const YOUTUBE_DEMOS: Record<string, YoutubeDemo> = {
  Barbell_Squat: {
    id: "gcNh17Ckjgg",
    title: "How to Properly Squat for Growth",
    channel: "Jeremy Ethier",
  },
  Bodyweight_Squat: {
    id: "P-yaD24bUE8",
    title: "Bodyweight Squat Tutorial",
    channel: "Runna",
  },
  Barbell_Bench_Press__Medium_Grip: {
    id: "4Y2ZdHCOXok",
    title: "How to Properly Bench Press for Growth",
    channel: "Jeremy Ethier",
  },
  "Barbell_Bench_Press_-_Medium_Grip": {
    id: "4Y2ZdHCOXok",
    title: "How to Properly Bench Press for Growth",
    channel: "Jeremy Ethier",
  },
  Barbell_Deadlift: {
    id: "XxWcirHIwVo",
    title: "How to Properly Deadlift for Growth",
    channel: "Jeremy Ethier",
  },
  Romanian_Deadlift: {
    id: "3VXmecChYYM",
    title: "How to do the Romanian Deadlift",
    channel: "Max Euceda",
  },
  Barbell_Hip_Thrust: {
    id: "pBH7pKHn-dI",
    title: "How to Perform Barbell Hip Thrusts",
    channel: "Buff Dudes Workouts",
  },
  Barbell_Lunge: {
    id: "NcDtORTfVNQ",
    title: "How to Properly Barbell Lunge",
    channel: "Colossus Fitness",
  },
  Dumbbell_Lunges: {
    id: "RZKXLMxPF_I",
    title: "Dumbbell Reverse Lunges",
    channel: "FITTR",
  },
  Leg_Press: {
    id: "K5n2vg3oZa4",
    title: "How to Properly Leg Press",
    channel: "Colossus Fitness",
  },
  Lying_Leg_Curls: {
    id: "jxctD6fL_FQ",
    title: "Lying Leg Curls",
    channel: "Bodybuilding.com",
  },
  Leg_Extensions: {
    id: "YyvSfVjQeL0",
    title: "How To: Leg Extension",
    channel: "ScottHermanFitness",
  },
  Standing_Calf_Raises: {
    id: "3UWi44yN-wM",
    title: "How To: Standing Barbell Calf Raise",
    channel: "ScottHermanFitness",
  },
  "Chin-Up": {
    id: "mRy9m2Q9_1I",
    title: "Proper Chin-Up Form",
    channel: "KILO Strength Society",
  },
  "Wide-Grip_Lat_Pulldown": {
    id: "SALxEARiMkw",
    title: "How to do Lat Pulldowns",
    channel: "ATHLEAN-X",
  },
  Face_Pull: {
    id: "eTCBSFlCJ_s",
    title: "How to do a Face Pull",
    channel: "NASM",
  },
  Dumbbell_Shoulder_Press: {
    id: "qEwKCR5JCog",
    title: "How To: Dumbbell Shoulder Press",
    channel: "ScottHermanFitness",
  },
  Side_Lateral_Raise: {
    id: "pgrWjBfaFe8",
    title: "How to Properly Dumbbell Lateral Raise",
    channel: "Colossus Fitness",
  },
  Dumbbell_Bicep_Curl: {
    id: "XE_pHwbst04",
    title: "Bicep Curls: Dumbbell Form & Technique",
    channel: "Fit Father Project",
  },
  Hammer_Curls: {
    id: "8XLxfXROrTo",
    title: "How To: Dumbbell Hammer Curl",
    channel: "ScottHermanFitness",
  },
  "Dips_-_Triceps_Version": {
    id: "TrJVszDm7ik",
    title: "How to do the Bodyweight Dip",
    channel: "Max Euceda",
  },
  Plank: {
    id: "A2b2EmIg0dA",
    title: "How To Plank: Proper Form, Cues, Progressions",
    channel: "E3 Rehab",
  },
  Russian_Twist: {
    id: "fCHFQTBqm-U",
    title: "How to Properly Do Russian Twists",
    channel: "Colossus Fitness",
  },
  Mountain_Climbers: {
    id: "cnyTQDSE884",
    title: "How to Do Mountain Climbers",
    channel: "Well+Good",
  },
  Barbell_Glute_Bridge: {
    id: "wPM8icPu6H8",
    title: "How To Do A Glute Bridge",
    channel: "Well+Good",
  },
  "One-Arm_Kettlebell_Swings": {
    id: "bDCeXbMJVNs",
    title: "How To Kettlebell Swing",
    channel: "Zack Henderson",
  },
};

export const FLAGSHIP_IDS = Object.keys(YOUTUBE_DEMOS);

const raw = rawExercises as RawExercise[];

export const library: LibraryExercise[] = raw.map((exercise) => {
  const level = exercise.level === "expert" ? "expert" : exercise.level === "intermediate" ? "intermediate" : "beginner";
  const primaryMuscles = exercise.primaryMuscles || [];
  return {
    id: exercise.id,
    name: exercise.name,
    force: exercise.force || null,
    level,
    mechanic: exercise.mechanic || null,
    equipment: exercise.equipment || "body only",
    primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles || [],
    instructions: (exercise.instructions || []).filter(Boolean),
    category: exercise.category || "strength",
    images: exercise.images || [],
    imageUrls: (exercise.images || []).map((path) => IMAGE_BASE + path),
    region: primaryMuscles[0] ? regionFor(primaryMuscles[0]) : "Core",
    trackedId: TRACKED[exercise.id],
    youtube: YOUTUBE_DEMOS[exercise.id],
  };
});

export const libraryById = new Map(library.map((exercise) => [exercise.id, exercise]));

export function getExercise(id: string): LibraryExercise | undefined {
  return libraryById.get(id);
}

export function trackedExerciseFor(id: string): TrackedExercise | undefined {
  const libraryExercise = libraryById.get(id);
  const trackedId = libraryExercise?.trackedId;
  if (!trackedId) return undefined;
  return trackedExercises.find((exercise) => exercise.id === trackedId);
}

export function recommendedVideo(exercise: LibraryExercise): { mp4: string; poster: string } | null {
  if (!exercise.youtube) return null;
  return {
    mp4: `/videos/${exercise.id}.mp4`,
    poster: exercise.imageUrls[0] || "",
  };
}

export type LibraryFilters = {
  query?: string;
  muscle?: string;
  equipment?: string;
  level?: string;
  category?: string;
};

export const EQUIPMENT_OPTIONS = Array.from(new Set(library.map((exercise) => exercise.equipment))).sort();
export const CATEGORY_OPTIONS = Array.from(new Set(library.map((exercise) => exercise.category))).sort();
export const ALL_MUSCLES = Array.from(
  new Set(library.flatMap((exercise) => [...exercise.primaryMuscles, ...exercise.secondaryMuscles])),
).sort();

function matchesMuscle(exercise: LibraryExercise, muscle: string) {
  if (!muscle) return true;
  if (MUSCLE_REGIONS.includes(muscle as MuscleRegion)) {
    return [...exercise.primaryMuscles, ...exercise.secondaryMuscles].some(
      (value) => regionFor(value) === muscle,
    );
  }
  return [...exercise.primaryMuscles, ...exercise.secondaryMuscles].includes(muscle.toLowerCase());
}

export function filterLibrary(filters: LibraryFilters): LibraryExercise[] {
  const query = (filters.query || "").trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const results = library.filter((exercise) => {
    if (filters.muscle && !matchesMuscle(exercise, filters.muscle)) return false;
    if (filters.equipment && exercise.equipment !== filters.equipment) return false;
    if (filters.level && exercise.level !== filters.level) return false;
    if (filters.category && exercise.category !== filters.category) return false;
    if (terms.length) {
      const haystack = `${exercise.name} ${exercise.primaryMuscles.join(" ")} ${exercise.secondaryMuscles.join(" ")} ${exercise.equipment} ${exercise.category}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return false;
    }
    return true;
  });
  if (!query) return results;
  return results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    return Number(!aName.startsWith(query)) - Number(!bName.startsWith(query)) || aName.localeCompare(bName);
  });
}

export function exercisesForRegion(region: string, limit = 6): LibraryExercise[] {
  return filterLibrary({ muscle: region }).slice(0, limit);
}

export function getExercisesByMuscleGroup(group: string, limit = 12): LibraryExercise[] {
  const g = group.toLowerCase();
  if (g === "core") return filterLibrary({ muscle: "Core" }).slice(0, limit);
  if (g === "legs" || g === "lower") return filterLibrary({ muscle: "Quads" }).concat(filterLibrary({ muscle: "Hamstrings" })).concat(filterLibrary({ muscle: "Glutes" })).filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, limit);
  if (g === "push") return filterLibrary({ muscle: "Chest" }).concat(filterLibrary({ muscle: "Shoulders" })).concat(filterLibrary({ muscle: "Triceps" })).filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, limit);
  if (g === "pull") return filterLibrary({ muscle: "Lower back" }).concat(filterLibrary({ muscle: "Biceps" })).filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, limit);
  if (g === "upper") return filterLibrary({ muscle: "Chest" }).concat(filterLibrary({ muscle: "Shoulders" })).concat(filterLibrary({ muscle: "Lower back" })).concat(filterLibrary({ muscle: "Biceps" })).concat(filterLibrary({ muscle: "Triceps" })).filter((v, i, a) => a.findIndex(x => x.id === v.id) === i).slice(0, limit);
  return filterLibrary({}).slice(0, limit);
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

export const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Advanced",
};
