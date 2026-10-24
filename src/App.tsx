import { useCallback, useEffect, useRef, useState } from "react";
import { Check, HeartPulse, X } from "lucide-react";
import { StoreProvider, useStore } from "./lib/store";
import { generateRoutine } from "./lib/plan";
import { getExercise, trackedExerciseFor } from "./lib/library";
import type { Meal, Section, WorkoutItem } from "./types";
import { BottomNav, Sidebar, Topbar } from "./components/Layout";
import Onboarding from "./components/Onboarding";
import FoodLogger from "./components/FoodLogger";
import YouTubeModal from "./components/YouTubeModal";
import WorkoutPlayer from "./components/WorkoutPlayer";
import { ConfirmModal, ValueModal, WaterModal } from "./components/LogModals";
import Today from "./pages/Today";
import Yoga from "./pages/Yoga";
import Explore from "./pages/Explore";
import ExerciseDetail from "./pages/ExerciseDetail";
import Workout from "./pages/Workout";
import Coach from "./pages/Coach";
import Progress from "./pages/Progress";
import ProfilePage from "./pages/Profile";
import Routine from "./pages/Routine";
import Trainer from "./Trainer";

type ModalMetric = "steps" | "sleep" | "weight" | null;

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const {
    data,
    targets,
    cloudStatus,
    updateProfile,
    patchDay,
    addMeal,
    addWorkoutLog,
    addTrainingSession,
    setWorkout,
  } = useStore();
  const [section, setSection] = useState<Section>("Today");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOrigin, setDetailOrigin] = useState<Section>("Explore");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [foodOpen, setFoodOpen] = useState(false);
  const [foodMeal, setFoodMeal] = useState<Meal["type"] | undefined>(undefined);
  const [waterOpen, setWaterOpen] = useState(false);
  const [metric, setMetric] = useState<ModalMetric>(null);
  const [playerItems, setPlayerItems] = useState<WorkoutItem[] | null>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [exitConfirm, setExitConfirm] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const activeSection = detailId ? detailOrigin : section;
  const detailExercise = detailId ? getExercise(detailId) : undefined;
  const videoExercise = videoId ? getExercise(videoId) : undefined;
  const trainerExercise = trainerId ? trackedExerciseFor(trainerId) : undefined;
  const metricWeightUnit = data.profile.units === "imperial" ? "lb" : "kg";

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [section, detailId]);

  useEffect(() => {
    document.title = detailId ? "Exercise guide · Chinnu HealthAI" : `${section} · Chinnu HealthAI`;
  }, [section, detailId]);

  function go(next: Section) {
    setDetailId(null);
    setSection(next);
  }

  function openExercise(id: string) {
    setDetailOrigin(section);
    setDetailId(id);
    setVideoId(null);
  }

  function openFood(type?: Meal["type"]) {
    setFoodMeal(type);
    setFoodOpen(true);
  }

  function handleGeneratePlan(focus: Parameters<typeof generateRoutine>[1]) {
    const routine = generateRoutine(data.profile, focus);
    if (!routine.length) {
      notify("Add available equipment in your profile so we can build a plan.");
      return;
    }
    setWorkout(routine);
    notify(`${routine.length}-exercise plan ready`);
    go("Workout");
  }

  function startWorkout() {
    let items = data.workout;
    if (!items.length) {
      items = generateRoutine(data.profile, "full");
      if (!items.length) {
        notify("Add available equipment in your profile, then build a plan.");
        return;
      }
      setWorkout(items);
    }
    setPlayerItems(items);
  }

  function startRoutineDay(dayIndex: number) {
    const items = data.workout.length ? data.workout : data.personalRoutine?.days[dayIndex]?.items || [];
    if (!items.length) {
      notify("No exercises for this day");
      return;
    }
    setPlayerItems(items);
  }

  function handleTrain(id: string) {
    const tracked = trackedExerciseFor(id);
    if (!tracked) {
      notify("Camera coaching is available for the 15 foundational movements.");
      return;
    }
    setTrainerId(id);
  }

  function finishWorkout(log: Parameters<typeof addWorkoutLog>[0]) {
    addWorkoutLog(log);
    setPlayerItems(null);
    setExitConfirm(false);
    notify(log.completedExercises ? `Session saved · ${log.completedExercises}/${log.totalExercises} exercises` : "Session closed");
  }

  function completeOnboarding(patch: Partial<typeof data.profile>) {
    updateProfile({ ...patch, onboarded: true });
    if (patch.weightKg) patchDay({ weight: patch.weightKg });
    notify("Your starting targets are ready");
  }

  const detailBackLabel =
    detailOrigin === "Today"
      ? "Back to today"
      : detailOrigin === "Workout"
        ? "Back to plan"
        : detailOrigin === "Progress"
          ? "Back to progress"
          : detailOrigin === "Profile"
            ? "Back to profile"
            : "All exercises";

  if (!data.profile.onboarded) {
    return (
      <>
        <Onboarding
          profile={data.profile}
          onComplete={completeOnboarding}
          onSkip={() => {
            updateProfile({ onboarded: true });
            notify("Setup skipped — you can add details in Profile");
          }}
        />
        {toast && <div className="toast" role="status"><Check /> {toast}</div>}
      </>
    );
  }

  return (
    <>
      <a className="skip-to-content" href="#main-content">Skip to content</a>
      <div className="app-shell">
        <Sidebar
          section={activeSection}
          onNavigate={go}
          profile={data.profile}
          cloudStatus={cloudStatus}
          onProfile={() => go("Profile")}
        />
        <div className="app-main">
          <Topbar
            section={activeSection}
            profile={data.profile}
            cloudStatus={cloudStatus}
            onProfile={() => go("Profile")}
          />
          <main id="main-content" className="main-content">
            {detailId ? (
              <ExerciseDetail
                id={detailId}
                onBack={() => { setDetailId(null); setSection(detailOrigin); }}
                backLabel={detailBackLabel}
                onOpenVideo={(id) => setVideoId(id)}
                onStartTrainer={handleTrain}
                onNotify={notify}
                onOpenExercise={openExercise}
              />
            ) : section === "Today" ? (
              <Today
                onLogFood={openFood}
                onLogWater={() => setWaterOpen(true)}
                onLogSteps={() => setMetric("steps")}
                onLogSleep={() => setMetric("sleep")}
                onLogWeight={() => setMetric("weight")}
                onOpenExercise={openExercise}
                onStartWorkout={startWorkout}
                onGeneratePlan={handleGeneratePlan}
                onNavigate={go}
              />
            ) : section === "Yoga" ? (
              <Yoga onOpenExercise={openExercise} onOpenVideo={(id) => setVideoId(id)} onStartTrainer={handleTrain} />
            ) : section === "Explore" ? (
              <Explore onOpenExercise={openExercise} onOpenVideo={(id) => setVideoId(id)} />
            ) : section === "Routine" ? (
              <Routine
                onOpenExercise={openExercise}
                onStartRoutineDay={startRoutineDay}
                onNavigate={go}
                onNotify={notify}
              />
            ) : section === "Workout" ? (
              <Workout
                onOpenExercise={openExercise}
                onStartWorkout={startWorkout}
                onTrain={handleTrain}
                onNotify={notify}
                onNavigateExplore={() => go("Explore")}
              />
            ) : section === "Coach" ? (
              <Coach onNavigate={go} />
            ) : section === "Progress" ? (
              <Progress onLogWeight={() => setMetric("weight")} />
            ) : (
              <ProfilePage onNotify={notify} />
            )}
          </main>
          <BottomNav section={activeSection} onNavigate={go} />
        </div>
      </div>

      {foodOpen && (
        <FoodLogger
          onClose={() => setFoodOpen(false)}
          initialMeal={foodMeal}
          onAdd={(meal) => {
            addMeal(meal);
            notify(`${meal.name} added to ${meal.type.toLowerCase()}`);
          }}
        />
      )}

      {waterOpen && (
        <WaterModal
          current={data.day.water}
          target={targets.water}
          onClose={() => setWaterOpen(false)}
          onSave={(water) => {
            patchDay({ water });
            notify(`Water set to ${water} glasses`);
          }}
        />
      )}

      {metric === "steps" && (
        <ValueModal
          title="Log today's steps"
          eyebrow="DAILY MOVEMENT"
          description="An approximate phone or watch total is enough. The trend matters more than one exact number."
          icon="steps"
          unit="steps"
          initial={data.day.steps}
          step={100}
          min={0}
          max={100000}
          presets={[2000, 5000, 8000, 10000]}
          onClose={() => setMetric(null)}
          onSave={(value) => {
            patchDay({ steps: Math.round(value) });
            notify(`${Math.round(value).toLocaleString()} steps logged`);
          }}
        />
      )}

      {metric === "sleep" && (
        <ValueModal
          title="How did you sleep?"
          eyebrow="RECOVERY"
          description="Use last night's actual sleep, not the time you spent in bed. A rough estimate is fine."
          icon="sleep"
          unit="hours"
          initial={data.day.sleep}
          step={0.5}
          min={0}
          max={16}
          presets={[6, 7, 7.5, 8]}
          onClose={() => setMetric(null)}
          onSave={(value) => {
            patchDay({ sleep: Math.round(value * 10) / 10 });
            notify(`${value} hours of sleep logged`);
          }}
        />
      )}

      {metric === "weight" && (
        <ValueModal
          title="Log your weight"
          eyebrow="BODY TREND"
          description="Use the same scale and time of day when you can. A single weigh-in is noise; the weekly trend is the signal."
          icon="weight"
          unit={metricWeightUnit}
          initial={data.profile.units === "imperial" ? Math.round((data.day.weight || data.profile.weightKg || 0) * 2.20462) : data.day.weight || data.profile.weightKg || 0}
          step={0.1}
          min={data.profile.units === "imperial" ? 55 : 25}
          max={data.profile.units === "imperial" ? 770 : 350}
          onClose={() => setMetric(null)}
          onSave={(value) => {
            const kg = data.profile.units === "imperial" ? value / 2.20462 : value;
            const rounded = Math.round(kg * 10) / 10;
            patchDay({ weight: rounded });
            updateProfile({ weightKg: rounded });
            notify(`Weight set to ${data.profile.units === "imperial" ? `${Math.round(value)} lb` : `${rounded} kg`}`);
          }}
        />
      )}

      {videoId && videoExercise && (
        <YouTubeModal exercise={videoExercise} onClose={() => setVideoId(null)} />
      )}

      {playerItems && (
        <WorkoutPlayer
          items={playerItems}
          onClose={() => setExitConfirm(true)}
          onTrain={handleTrain}
          onFinish={finishWorkout}
        />
      )}

      {trainerId && trainerExercise && (
        <div className="trainer-overlay" role="dialog" aria-modal="true" aria-label={`${trainerExercise.name} camera coach`}>
          <div className="trainer-overlay-bar">
            <span><HeartPulse /> On-device camera coach</span>
            <button className="soft-btn" onClick={() => setTrainerId(null)}><X /> Close</button>
          </div>
          <Trainer
            exercise={trainerExercise}
            gender={data.profile.gender || "male"}
            onClose={() => setTrainerId(null)}
            onSaved={(session) => {
              addTrainingSession(session);
              setTrainerId(null);
              notify(`${session.name} session saved${session.score !== null ? ` · score ${session.score}` : ""}`);
            }}
          />
        </div>
      )}

      {exitConfirm && (
        <ConfirmModal
          title="Leave this session?"
          description="Nothing from this workout will be saved. Your plan stays exactly as it is."
          confirmLabel="Leave without saving"
          onClose={() => setExitConfirm(false)}
          onConfirm={() => { setPlayerItems(null); setExitConfirm(false); notify("Workout ended without saving"); }}
        />
      )}

      {toast && <div className="toast" role="status"><Check /> {toast}</div>}
    </>
  );
}
