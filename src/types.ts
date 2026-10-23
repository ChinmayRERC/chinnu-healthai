export type Section = "Today" | "Explore" | "Workout" | "Coach" | "Progress" | "Profile" | "Routine";
export type Gender = "male" | "female";

export type Goal = "lose" | "recomp" | "gain" | "strength";
export type Activity = "sedentary" | "light" | "moderate" | "high";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Units = "metric" | "imperial";

export type Meal = {
  id: number;
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  quantity?: string;
  source?: "manual" | "database" | "barcode";
};

export type DayState = {
  date?: string;
  water: number;
  steps: number;
  sleep: number;
  weight: number;
  meals: Meal[];
  notes?: string;
};

export type WorkoutItem = {
  exerciseId: string;
  sets: number;
  target: number;
  targetType?: "reps" | "seconds";
  rest?: number;
  weight?: number;
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

export type SetResult = {
  reps: number;
  weight: number;
  done: boolean;
  seconds?: number;
};

export type ExerciseResult = {
  exerciseId: string;
  name: string;
  sets: SetResult[];
};

export type WorkoutLog = {
  id: number;
  date: string;
  title: string;
  duration: number;
  completedExercises: number;
  totalExercises: number;
  volume?: number;
  exercises?: ExerciseResult[];
  notes?: string;
};

export type ChatMessage = {
  id: number;
  from: "ai" | "me";
  text: string;
  at: string;
};

export type BodyMeasurements = {
  scannedAt?: string;
  heightCmEst?: number;
  shoulderWidthPx?: number;
  hipWidthPx?: number;
  torsoLengthPx?: number;
  legLengthPx?: number;
  shoulderToHipRatio?: number;
  confidence?: number;
  posture?: "good" | "rounded_shoulders" | "lean_forward" | "unknown";
};

export type Profile = {
  name: string;
  gender: Gender | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: Goal;
  activity: Activity;
  experience: Experience;
  equipment: string[];
  units: Units;
  onboarded: boolean;
  bodyScan?: BodyMeasurements | null;
  scanCompleted?: boolean;
};

export type AppSettings = {
  restSeconds: number;
  sound: boolean;
  cloudConsent: boolean;
};

export type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type RoutineDayType = "strength" | "cardio" | "mobility" | "rest" | "active_recovery";

export type PersonalRoutineDay = {
  day: WeekDay;
  dayIndex: number; // 0-6
  type: RoutineDayType;
  focus: "full" | "upper" | "lower" | "push" | "pull" | "glutes" | "core" | "rest" | "cardio" | "mobility";
  title: string;
  items: WorkoutItem[];
  notes?: string;
  durationEst?: number;
  isRest: boolean;
  rationale?: string;
};

export type PersonalRoutine = {
  id: string;
  createdAt: string;
  updatedAt: string;
  profileSnapshot: Profile;
  days: PersonalRoutineDay[];
  adherence: Record<string, boolean>; // key: YYYY-MM-DD or dayIndex
  aiReasoning?: string;
  lastAdaptedAt?: string;
};

export type AppData = {
  version: 2;
  profile: Profile;
  day: DayState;
  days: Record<string, DayState>;
  workout: WorkoutItem[];
  personalRoutine?: PersonalRoutine | null;
  trainingSessions: TrainingSession[];
  workoutLogs: WorkoutLog[];
  chat: ChatMessage[];
  settings: AppSettings;
  updatedAt: string;
};

export type Targets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
  sleep: number;
  bmr: number;
  tdee: number;
  bmi: number | null;
  healthyWeight: [number, number] | null;
};

export type CloudConfig = { url: string; anonKey: string };
