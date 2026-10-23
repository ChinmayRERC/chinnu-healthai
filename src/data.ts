import type { AppData, DayState, Meal, Profile, WorkoutItem, WorkoutLog } from "./types";
import { DEFAULT_PROFILE, dateKey, emptyDay } from "./lib/profile";

export const STORAGE_KEY = "chinnu-health-data";

export function initialData(): AppData {
  const day = emptyDay();
  return {
    version: 2,
    profile: { ...DEFAULT_PROFILE },
    day,
    days: { [dateKey()]: day },
    workout: [],
    personalRoutine: null,
    trainingSessions: [],
    workoutLogs: [],
    chat: [],
    settings: { restSeconds: 75, sound: true, cloudConsent: false },
    updatedAt: new Date().toISOString(),
  };
}

const OLD_WORKOUT_IDS: Record<string, string> = {
  squat: "Barbell_Squat",
  pushup: "Pushups",
  lunge: "Barbell_Lunge",
  plank: "Plank",
  curl: "Dumbbell_Bicep_Curl",
  hinge: "Barbell_Deadlift",
  mountain: "Mountain_Climbers",
};

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function string(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeMeal(value: any): Meal | null {
  if (!value || typeof value !== "object") return null;
  const type = ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value.type) ? value.type : "Snack";
  const name = string(value.name).trim();
  if (!name) return null;
  return {
    id: number(value.id, Date.now() + Math.random()),
    type,
    name,
    calories: Math.max(0, number(value.calories)),
    protein: Math.max(0, number(value.protein)),
    carbs: Math.max(0, number(value.carbs)),
    fat: Math.max(0, number(value.fat)),
    fiber: Math.max(0, number(value.fiber)),
    quantity: string(value.quantity),
    source: value.source === "database" || value.source === "barcode" ? value.source : "manual",
  };
}

export function normalizeDay(value: any, fallbackWeight = 0): DayState {
  const meals = Array.isArray(value?.meals) ? value.meals.map(normalizeMeal).filter(Boolean) as Meal[] : [];
  return {
    date: typeof value?.date === "string" ? value.date : undefined,
    water: Math.max(0, Math.min(30, number(value?.water))),
    steps: Math.max(0, number(value?.steps)),
    sleep: Math.max(0, Math.min(24, number(value?.sleep))),
    weight: Math.max(0, number(value?.weight, fallbackWeight)),
    meals,
    notes: string(value?.notes) || undefined,
  };
}

function normalizeProfile(value: any): Profile {
  if (!value || typeof value !== "object") return { ...DEFAULT_PROFILE };
  const gender = value.gender === "male" || value.gender === "female" ? value.gender : null;
  const goal = ["lose", "recomp", "gain", "strength"].includes(value.goal) ? value.goal : "recomp";
  const activity = ["sedentary", "light", "moderate", "high"].includes(value.activity) ? value.activity : "light";
  const experience = ["beginner", "intermediate", "advanced"].includes(value.experience)
    ? value.experience
    : "beginner";
  return {
    ...DEFAULT_PROFILE,
    name: string(value.name),
    gender,
    age: value.age ? Math.max(13, Math.min(100, number(value.age))) : null,
    heightCm: value.heightCm ? Math.max(100, Math.min(250, number(value.heightCm))) : null,
    weightKg: value.weightKg ? Math.max(25, Math.min(350, number(value.weightKg))) : null,
    goal,
    activity,
    experience,
    equipment: Array.isArray(value.equipment) ? value.equipment.filter((item: unknown) => typeof item === "string") : DEFAULT_PROFILE.equipment,
    units: value.units === "imperial" ? "imperial" : "metric",
    onboarded: !!value.onboarded,
  };
}

function normalizeWorkout(value: any): WorkoutItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rawId = string(item.exerciseId);
      const exerciseId = OLD_WORKOUT_IDS[rawId] || rawId;
      if (!exerciseId) return null;
      return {
        exerciseId,
        sets: Math.max(1, Math.min(10, number(item.sets, 3))),
        target: Math.max(1, Math.min(600, number(item.target, 10))),
        targetType: item.targetType === "seconds" ? "seconds" : "reps",
        rest: Math.max(0, Math.min(300, number(item.rest, 75))),
        weight: Math.max(0, number(item.weight)),
      } as WorkoutItem;
    })
    .filter(Boolean) as WorkoutItem[];
}

function normalizeWorkoutLog(value: any): WorkoutLog | null {
  if (!value || typeof value !== "object" || !value.date) return null;
  return {
    id: number(value.id, Date.now()),
    date: string(value.date, new Date().toISOString()),
    title: string(value.title, "Workout"),
    duration: Math.max(0, number(value.duration)),
    completedExercises: Math.max(0, number(value.completedExercises)),
    totalExercises: Math.max(0, number(value.totalExercises)),
    volume: Math.max(0, number(value.volume)),
    exercises: Array.isArray(value.exercises) ? value.exercises : undefined,
    notes: string(value.notes) || undefined,
  };
}

function looksLikeSeed(day: DayState): boolean {
  return (
    day.water === 5 &&
    day.steps === 6842 &&
    day.sleep === 7.4 &&
    day.weight === 72.4 &&
    day.meals.length === 3 &&
    day.meals.every((meal) => [1, 2, 3].includes(meal.id))
  );
}

export function normalizeData(value: unknown): AppData {
  const base = initialData();
  if (!value || typeof value !== "object") return base;
  const raw = value as any;
  const profile = normalizeProfile(raw.profile);
  const today = dateKey();
  const days: Record<string, DayState> = {};

  if (raw.days && typeof raw.days === "object") {
    for (const [key, day] of Object.entries(raw.days)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) days[key] = normalizeDay(day, profile.weightKg || 0);
    }
  }

  const oldDay = raw.day ? normalizeDay(raw.day, profile.weightKg || 0) : null;
  if (oldDay && !looksLikeSeed(oldDay)) days[today] = oldDay;
  if (!days[today]) days[today] = emptyDay(profile.weightKg || 0);

  const trainingSessions = Array.isArray(raw.trainingSessions)
    ? raw.trainingSessions.filter((item: any) => item && item.exerciseId && item.date)
    : [];

  const chat = Array.isArray(raw.chat)
    ? raw.chat
        .filter((message: any) => message && (message.from === "ai" || message.from === "me") && typeof message.text === "string")
        .map((message: any, index: number) => ({
          id: number(message.id, Date.now() + index),
          from: message.from,
          text: message.text,
          at: string(message.at, new Date().toISOString()),
        }))
        .slice(-80)
    : [];

  return {
    version: 2,
    profile,
    day: days[today],
    days,
    workout: normalizeWorkout(raw.workout),
    personalRoutine: raw.personalRoutine && typeof raw.personalRoutine === "object" ? (raw.personalRoutine as any) : null,
    trainingSessions,
    workoutLogs: Array.isArray(raw.workoutLogs)
      ? (raw.workoutLogs.map(normalizeWorkoutLog).filter(Boolean) as WorkoutLog[])
      : [],
    chat,
    settings: {
      restSeconds: Math.max(10, Math.min(300, number(raw.settings?.restSeconds, 75))),
      sound: raw.settings?.sound !== false,
      cloudConsent: !!raw.settings?.cloudConsent,
    },
    updatedAt: string(raw.updatedAt, new Date().toISOString()),
  };
}

export function loadData(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialData();
    return normalizeData(JSON.parse(saved));
  } catch {
    return initialData();
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be full or blocked; the in-memory app still works.
  }
}

export function clearLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("chinnu-day");
  } catch {
    // Ignore blocked storage.
  }
}

export function isMeaningful(data: AppData): boolean {
  const totals = data.day.meals.reduce((sum, meal) => sum + meal.calories, 0);
  return (
    data.profile.onboarded ||
    data.workout.length > 0 ||
    data.workoutLogs.length > 0 ||
    data.trainingSessions.length > 0 ||
    totals > 0 ||
    data.day.water > 0 ||
    data.day.steps > 0
  );
}
