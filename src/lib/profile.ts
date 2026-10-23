import type { AppData, DayState, Profile, Targets } from "../types";

export const DEFAULT_PROFILE: Profile = {
  name: "",
  gender: null,
  age: null,
  heightCm: null,
  weightKg: null,
  goal: "recomp",
  activity: "light",
  experience: "beginner",
  equipment: ["body only", "dumbbell"],
  units: "metric",
  onboarded: false,
};

export function emptyDay(weight = 0): DayState {
  return { water: 0, steps: 0, sleep: 0, weight, meals: [] };
}

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function shiftDate(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function formatShortDate(key: string): string {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(parseDateKey(key));
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

export function timeOfDayGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function calculateTargets(profile: Profile): Targets {
  const weight = profile.weightKg || 72;
  const height = profile.heightCm || 170;
  const age = profile.age || 30;
  const male = profile.gender !== "female";

  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (male ? 5 : -161));
  const activityFactor =
    profile.activity === "sedentary"
      ? 1.2
      : profile.activity === "light"
        ? 1.375
        : profile.activity === "moderate"
          ? 1.55
          : 1.725;
  const tdee = Math.round(bmr * activityFactor);
  const adjustment =
    profile.goal === "lose" ? -400 : profile.goal === "gain" ? 250 : profile.goal === "strength" ? 150 : 0;
  const floor = male ? 1500 : 1200;
  const calories = Math.round(Math.max(floor, tdee + adjustment) / 10) * 10;

  const proteinPerKg =
    profile.goal === "lose" ? 2 : profile.goal === "gain" ? 1.8 : profile.goal === "strength" ? 1.8 : 1.9;
  const protein = Math.round(Math.min(230, Math.max(80, weight * proteinPerKg)));
  const fat = Math.round((calories * 0.27) / 9);
  const carbs = Math.max(60, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = Math.max(6, Math.min(14, Math.round((weight * 35) / 250)));
  const steps = profile.activity === "sedentary" ? 7000 : profile.activity === "light" ? 8000 : 10000;
  const bmi = profile.heightCm && profile.weightKg ? profile.weightKg / (profile.heightCm / 100) ** 2 : null;
  const healthyWeight: [number, number] | null =
    profile.heightCm ? [18.5 * (profile.heightCm / 100) ** 2, 24.9 * (profile.heightCm / 100) ** 2] : null;

  return {
    calories,
    protein,
    carbs,
    fat,
    water,
    steps,
    sleep: 7.5,
    bmr,
    tdee,
    bmi: bmi ? Math.round(bmi * 10) / 10 : null,
    healthyWeight: healthyWeight
      ? [Math.round(healthyWeight[0] * 10) / 10, Math.round(healthyWeight[1] * 10) / 10]
      : null,
  };
}

export function mealTotals(meals: DayState["meals"]) {
  return meals.reduce(
    (totals, meal) => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      totals.fiber += meal.fiber || 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export function workoutVolume(logs: AppData["workoutLogs"]): number {
  return logs.reduce((sum, log) => sum + (log.volume || log.exercises?.reduce((inner, exercise) =>
    inner + exercise.sets.reduce((setSum, set) => setSum + (set.done ? set.reps * set.weight : 0), 0), 0) || 0), 0);
}

export function calorieStreak(days: Record<string, DayState>, targets: Targets): number {
  let streak = 0;
  const today = new Date();
  for (let offset = 0; offset < 60; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const day = days[dateKey(date)];
    const calories = day ? mealTotals(day.meals).calories : 0;
    if (offset === 0 && calories === 0) continue;
    if (!calories || Math.abs(calories - targets.calories) > targets.calories * 0.3) break;
    streak += 1;
  }
  return streak;
}

export function readiness(day: DayState, targets: Targets): { score: number; label: string; detail: string } {
  let score = 0;
  score += day.sleep ? Math.min(35, (day.sleep / targets.sleep) * 35) : 0;
  score += Math.min(25, (day.water / targets.water) * 25);
  score += Math.min(25, (day.steps / targets.steps) * 25);
  score += day.meals.length ? 15 : 0;
  const rounded = Math.round(score);
  if (rounded >= 80) return { score: rounded, label: "Green light", detail: "Sleep, fuel, and movement are all on track." };
  if (rounded >= 50) return { score: rounded, label: "Steady", detail: "A normal session is reasonable. Fill the biggest gap first." };
  return { score: rounded, label: "Take it easy", detail: "Prioritise sleep, water, and a gentle walk before intensity." };
}

export function displayWeight(weightKg: number, units: Profile["units"]): string {
  return units === "imperial" ? `${Math.round(weightKg * 2.20462)} lb` : `${weightKg.toFixed(1)} kg`;
}

export function displayHeight(heightCm: number, units: Profile["units"]): string {
  if (units === "imperial") {
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    return `${feet}' ${Math.round(totalInches % 12)}"`;
  }
  return `${Math.round(heightCm)} cm`;
}

export function displayVolume(volume: number, units: Profile["units"]): string {
  if (!volume) return "0";
  if (units === "imperial") return `${Math.round(volume * 2.20462).toLocaleString()} lb`;
  return `${Math.round(volume).toLocaleString()} kg`;
}
