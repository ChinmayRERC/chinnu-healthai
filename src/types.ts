export type Section = "Today" | "Explore" | "Workout" | "Coach" | "Progress";
export type Gender = "male" | "female";

export type Meal = {
  id: number;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  name: string;
  calories: number;
  protein: number;
};

export type DayState = {
  water: number;
  steps: number;
  sleep: number;
  weight: number;
  meals: Meal[];
};

export type WorkoutItem = {
  exerciseId: string;
  sets: number;
  target: number;
};

export type Rep = { number: number; score: number | null; time: number };

export type TrainingSession = {
  id: number;
  exerciseId: string;
  name: string;
  date: string;
  duration: number;
  reps: Rep[];
  hold: number;
  score: number | null;
  coverage: number;
  stopped?: boolean;
};

export type WorkoutLog = {
  id: number;
  date: string;
  title: string;
  duration: number;
  completedExercises: number;
  totalExercises: number;
};

export type AppData = {
  profile: { gender: Gender | null };
  day: DayState;
  workout: WorkoutItem[];
  trainingSessions: TrainingSession[];
  workoutLogs: WorkoutLog[];
};
