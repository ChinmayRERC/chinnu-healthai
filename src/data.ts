import type { AppData } from "./types";

export const initialData: AppData = {
  profile: { gender: null },
  day: {
    water: 5,
    steps: 6842,
    sleep: 7.4,
    weight: 72.4,
    meals: [
      { id: 1, type: "Breakfast", name: "Vegetable poha & curd", calories: 356, protein: 14 },
      { id: 2, type: "Lunch", name: "Rajma rice bowl", calories: 524, protein: 21 },
      { id: 3, type: "Snack", name: "Apple & almonds", calories: 184, protein: 5 },
    ],
  },
  workout: [
    { exerciseId: "squat", sets: 3, target: 10 },
    { exerciseId: "curl", sets: 3, target: 12 },
    { exerciseId: "plank", sets: 2, target: 30 },
  ],
  trainingSessions: [],
  workoutLogs: [],
};

export const insights = [
  "Your protein is strongest at lunch. Add 12-15 g at breakfast for steadier energy.",
  "A 12-minute walk after dinner can help you reach today's movement goal.",
  "You slept 34 minutes more than your 7-day average. Keep tonight's wind-down time consistent.",
];

export function loadData(): AppData {
  try {
    const saved = JSON.parse(localStorage.getItem("chinnu-health-data") || "null") as Partial<AppData> | null;
    const legacy = JSON.parse(localStorage.getItem("chinnu-day") || "null");
    if (!saved) return { ...initialData, day: legacy || initialData.day };
    return {
      profile: saved.profile || initialData.profile,
      day: saved.day || legacy || initialData.day,
      workout: saved.workout || initialData.workout,
      trainingSessions: saved.trainingSessions || [],
      workoutLogs: saved.workoutLogs || [],
    };
  } catch {
    return initialData;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem("chinnu-health-data", JSON.stringify(data));
}
