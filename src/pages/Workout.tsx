import { useMemo, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  Flame,
  GripVertical,
  Minus,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import { formatShortDate } from "../lib/profile";
import { filterLibrary, FLAGSHIP_IDS, getExercise, LEVEL_LABEL, library, regionLabel, trackedExerciseFor } from "../lib/library";
import { FOCUS_LABEL, generateRoutine, workoutTitle, type Focus } from "../lib/plan";
import ExerciseMedia from "../components/ExerciseMedia";

const FOCUSES: Focus[] = ["full", "upper", "lower", "push", "pull", "glutes", "core"];

export default function Workout({
  onOpenExercise,
  onStartWorkout,
  onTrain,
  onNotify,
  onNavigateExplore,
}: {
  onOpenExercise: (id: string) => void;
  onStartWorkout: () => void;
  onTrain: (id: string) => void;
  onNotify: (message: string) => void;
  onNavigateExplore: () => void;
}) {
  const { data, setWorkout, addWorkoutItem, removeWorkoutItem, update } = useStore();
  const [showGenerate, setShowGenerate] = useState(data.workout.length === 0);
  const [focus, setFocus] = useState<Focus>("full");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [query, setQuery] = useState("");

  const estimates = useMemo(() => {
    const sets = data.workout.reduce((sum, item) => sum + item.sets, 0);
    const seconds = data.workout.reduce((sum, item) => sum + item.sets * (item.rest || data.settings.restSeconds) + 40, 0);
    return { sets, minutes: Math.max(8, Math.round(seconds / 60)) };
  }, [data.workout, data.settings.restSeconds]);

  const suggestions = useMemo(() => {
    const allowed = data.profile.equipment.length ? data.profile.equipment : ["body only", "dumbbell"];
    const base = query.trim()
      ? filterLibrary({ query })
      : library.filter((exercise) => allowed.includes(exercise.equipment) || exercise.equipment === "body only");
    return [...base]
      .sort((a, b) => Number(FLAGSHIP_IDS.includes(b.id)) - Number(FLAGSHIP_IDS.includes(a.id)) || Number(Boolean(b.trackedId)) - Number(Boolean(a.trackedId)) || a.name.localeCompare(b.name))
      .filter((exercise) => !data.workout.some((item) => item.exerciseId === exercise.id))
      .slice(0, 8);
  }, [data.workout, data.profile.equipment, query]);

  function buildPlan(nextFocus = focus) {
    const routine = generateRoutine(data.profile, nextFocus);
    setWorkout(routine);
    setShowGenerate(false);
    onNotify(`${workoutTitle(nextFocus)} built with ${routine.length} exercises`);
  }

  function changeItem(index: number, patch: Partial<typeof data.workout[number]>) {
    update((current) => ({
      ...current,
      workout: current.workout.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function addExercise(id: string) {
    const exercise = getExercise(id);
    if (!exercise) return;
    const hold = exercise.primaryMuscles.includes("abdominals");
    addWorkoutItem(id, { sets: 3, target: hold ? 35 : 10, targetType: hold ? "seconds" : "reps" });
    onNotify(`${exercise.name} added to your plan`);
    setBuilderOpen(false);
    setQuery("");
  }

  return (
    <div className="page workout-page">
      <section className="workout-head-v2">
        <div>
          <span className="eyebrow"><Sparkles /> YOUR ADAPTABLE PLAN</span>
          <h1>Train with a plan,<br /><em>not a guess.</em></h1>
          <p>{data.workout.length ? `${data.workout.length} exercises · ${estimates.sets} sets · about ${estimates.minutes} minutes. Adjust anything as your week changes.` : "Choose a focus and we will build a routine around your equipment, experience, and goal."}</p>
        </div>
        <div className="workout-head-actions">
          <button className="soft-btn" onClick={() => setShowGenerate((value) => !value)}><RefreshCw /> {data.workout.length ? "Regenerate" : "Build a plan"}</button>
          <button className="primary-btn" disabled={!data.workout.length} onClick={onStartWorkout}><Play /> Start workout</button>
        </div>
      </section>

      {showGenerate && (
        <section className="plan-builder-card">
          <div className="plan-builder-copy">
            <span className="eyebrow">ONE-TAP PLAN</span>
            <h2>What do you want to train?</h2>
            <p>We use your profile and available equipment. You can swap any movement afterwards.</p>
          </div>
          <div className="plan-focus-grid">
            {FOCUSES.map((option) => (
              <button key={option} className={focus === option ? "plan-focus selected" : "plan-focus"} onClick={() => setFocus(option)}>
                <span>{FOCUS_LABEL[option].charAt(0)}</span>
                <b>{FOCUS_LABEL[option]}</b>
                {focus === option && <Check />}
              </button>
            ))}
          </div>
          <div className="plan-builder-footer">
            <small><Target /> {data.profile.experience === "beginner" ? "Beginner-friendly volume" : `${data.profile.experience} volume`} · {data.profile.equipment.length ? data.profile.equipment.join(", ") : "bodyweight"}</small>
            <div>
              <button className="text-btn" onClick={() => setShowGenerate(false)}>Cancel</button>
              <button className="primary-btn" onClick={() => buildPlan()}><Sparkles /> Build my plan</button>
            </div>
          </div>
        </section>
      )}

      <div className="workout-layout-v2">
        <div className="workout-main">
          <section className="panel">
            <header className="panel-head">
              <div><span className="eyebrow">YOUR ROUTINE</span><h2>{data.workout.length ? `${data.workout.length} exercises` : "A blank slate"}</h2></div>
              <button className="text-btn" onClick={() => setBuilderOpen(true)}><Plus /> Add exercise</button>
            </header>

            {data.workout.length ? (
              <div className="routine-list">
                {data.workout.map((item, index) => {
                  const exercise = getExercise(item.exerciseId);
                  const tracked = trackedExerciseFor(item.exerciseId);
                  if (!exercise) return null;
                  return (
                    <article className="routine-row" key={item.exerciseId}>
                      <span className="routine-drag"><GripVertical /><b>{String(index + 1).padStart(2, "0")}</b></span>
                      <button className="routine-thumb" onClick={() => onOpenExercise(exercise.id)} aria-label={`Open ${exercise.name}`}>
                        <ExerciseMedia exercise={exercise} variant="thumb" />
                      </button>
                      <button className="routine-name" onClick={() => onOpenExercise(exercise.id)}>
                        <b>{exercise.name}</b>
                        <small>{regionLabel(exercise.region)} · {exercise.equipment} · {LEVEL_LABEL[exercise.level]}</small>
                      </button>
                      <label className="routine-field">SETS<input type="number" min="1" max="10" value={item.sets} onChange={(event) => changeItem(index, { sets: Math.max(1, Math.min(10, Number(event.target.value) || 1)) })} /></label>
                      <label className="routine-field">{item.targetType === "seconds" ? "SECONDS" : "REPS"}<input type="number" min="1" max="600" value={item.target} onChange={(event) => changeItem(index, { target: Math.max(1, Math.min(600, Number(event.target.value) || 1)) })} /></label>
                      <div className="routine-actions">
                        {tracked && <button className="icon-btn" onClick={() => onTrain(exercise.id)} title="Open camera form coach"><Camera /></button>}
                        <button className="icon-btn danger" onClick={() => { removeWorkoutItem(exercise.id); onNotify(`${exercise.name} removed`); }} title={`Remove ${exercise.name}`}><Trash2 /></button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="routine-empty">
                <span className="empty-icon"><Dumbbell /></span>
                <h3>Your routine is empty.</h3>
                <p>Build a balanced plan in one tap, or add individual exercises from the library.</p>
                <div><button className="primary-btn" onClick={() => setShowGenerate(true)}><Sparkles /> Build a plan</button><button className="soft-btn" onClick={() => setBuilderOpen(true)}><Plus /> Add exercise</button></div>
              </div>
            )}

            {data.workout.length > 0 && (
              <button className="add-exercise-row" onClick={() => setBuilderOpen(true)}><Plus /> Add another exercise <ArrowRight /></button>
            )}
          </section>

          <section className="panel warmup-panel">
            <span className="warmup-icon"><Flame /></span>
            <div>
              <span className="eyebrow">5-MINUTE WARM-UP</span>
              <h2>Make the first set feel easier.</h2>
              <p>Walk or march in place for 2 minutes, then do 8 slow bodyweight squats, 8 arm circles, and 10 gentle hip hinges.</p>
            </div>
            <button className="text-btn" onClick={onStartWorkout} disabled={!data.workout.length}><Play /> Start</button>
          </section>

          <section className="panel">
            <header className="panel-head">
              <div><span className="eyebrow">RECENT SESSIONS</span><h2>Workout history</h2></div>
              <span className="history-count">{data.workoutLogs.length} logged</span>
            </header>
            {data.workoutLogs.length ? (
              <div className="workout-history-v2">
                {data.workoutLogs.slice(0, 4).map((log) => (
                  <div className="history-v2-row" key={log.id}>
                    <span><Trophy /></span>
                    <div><b>{log.title}</b><small>{formatShortDate(log.date.slice(0, 10))} · {Math.round(log.duration / 60)} min · {log.completedExercises}/{log.totalExercises} exercises</small></div>
                    <strong>{log.volume ? `${Math.round(log.volume).toLocaleString()} kg` : `${log.completedExercises} done`}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mini-empty"><Trophy /><p>Complete your first session and it will appear here.</p></div>
            )}
          </section>
        </div>

        <aside className="workout-rail">
          <article className="panel session-summary">
            <span className="eyebrow">SESSION SNAPSHOT</span>
            <h2>{data.workout.length ? workoutTitle(focus) : "Ready when you are"}</h2>
            <div className="summary-stats">
              <span><Clock3 /><b>{estimates.minutes}</b><small>minutes est.</small></span>
              <span><Dumbbell /><b>{estimates.sets}</b><small>total sets</small></span>
              <span><Target /><b>{data.workout.reduce((sum, item) => sum + item.target, 0)}</b><small>target reps</small></span>
            </div>
            <div className="summary-note"><Sparkles /><p>{data.profile.experience === "beginner" ? "Leave 2–3 reps in reserve and stop each set while form still feels solid." : "Keep 1–2 reps in reserve on most sets. Add load gradually, not every session."}</p></div>
            <button className="primary-btn wide" onClick={onStartWorkout} disabled={!data.workout.length}><Play /> Start workout</button>
            <button className="text-btn wide" onClick={() => setShowGenerate(true)}><RefreshCw /> Change focus</button>
          </article>

          <article className="panel rail-tip">
            <span className="rail-tip-icon"><Target /></span>
            <span className="eyebrow">TODAY&apos;S TARGET</span>
            <h3>{data.profile.goal === "lose" ? "Keep the muscle you have." : data.profile.goal === "gain" ? "Add a little load." : data.profile.goal === "strength" ? "Quality reps first." : "Move consistently."}</h3>
            <p>{data.profile.goal === "lose" ? "Protein and strength work protect muscle while the scale moves slowly." : data.profile.goal === "gain" ? "A small surplus and progressive sets beat a perfect plan you cannot repeat." : "A session that fits your energy today is better than one you skip."}</p>
          </article>

          <article className="panel rail-tip">
            <span className="rail-tip-icon camera"><Camera /></span>
            <span className="eyebrow">FORM COACH</span>
            <h3>{library.filter((exercise) => exercise.trackedId).length} camera-guided movements</h3>
            <p>Pose tracking runs on your device. It estimates reps and visible angles; it cannot judge load, pain, or spinal position.</p>
            <button className="text-btn" onClick={onNavigateExplore}>Browse movements <ArrowRight /></button>
          </article>
        </aside>
      </div>

      {builderOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setBuilderOpen(false)}>
          <div className="modal exercise-picker" role="dialog" aria-modal="true" aria-label="Add an exercise">
            <button className="modal-close" onClick={() => setBuilderOpen(false)} aria-label="Close exercise picker"><X /></button>
            <span className="modal-mark"><Dumbbell /></span>
            <span className="eyebrow">ADD TO YOUR PLAN</span>
            <h2>Pick a movement</h2>
            <p>Suggested for your equipment and goal. Search all {library.length} exercises if you want something else.</p>
            <label className="search-input">
              <Search />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercise or muscle" aria-label="Search exercises to add" />
              {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X /></button>}
            </label>
            <div className="picker-results">
              {suggestions.map((exercise) => (
                <button className="picker-row" key={exercise.id} onClick={() => addExercise(exercise.id)}>
                  <ExerciseMedia exercise={exercise} variant="thumb" />
                  <div><b>{exercise.name}</b><small>{regionLabel(exercise.region)} · {exercise.equipment}</small></div>
                  <Plus />
                </button>
              ))}
              {!suggestions.length && <div className="mini-empty"><Search /><p>No more matching exercises. Try another search or browse the full library.</p></div>}
            </div>
            <button className="soft-btn wide" onClick={() => { setBuilderOpen(false); onNavigateExplore(); }}>Browse all exercises <ArrowRight /></button>
          </div>
        </div>
      )}
    </div>
  );
}
