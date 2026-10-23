import type { ReactNode } from "react";
import {
  Apple,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Moon,
  Play,
  Plus,
  Scale,
  Sparkles,
  Target,
  Trash2,
  Utensils,
} from "lucide-react";
import { useStore } from "../lib/store";
import { dateKey, formatLongDate, mealTotals, readiness, timeOfDayGreeting } from "../lib/profile";
import { displayWeight } from "../lib/profile";
import { exercisesForRegion, libraryById, regionLabel } from "../lib/library";
import { FOCUS_LABEL as PLAN_FOCUS_LABEL, type Focus } from "../lib/plan";
import ExerciseMedia from "../components/ExerciseMedia";
import { MacroBar, Ring } from "../components/Charts";
import type { Meal } from "../types";

const MEAL_TYPES: Meal["type"][] = ["Breakfast", "Lunch", "Snack", "Dinner"];

export default function Today({
  onLogFood,
  onLogWater,
  onLogSteps,
  onLogSleep,
  onLogWeight,
  onOpenExercise,
  onStartWorkout,
  onGeneratePlan,
  onNavigate,
}: {
  onLogFood: (type?: Meal["type"]) => void;
  onLogWater: () => void;
  onLogSteps: () => void;
  onLogSleep: () => void;
  onLogWeight: () => void;
  onOpenExercise: (id: string) => void;
  onStartWorkout: () => void;
  onGeneratePlan: (focus: Focus) => void;
  onNavigate: (section: "Explore" | "Workout" | "Coach" | "Progress" | "Profile") => void;
}) {
  const { data, targets, cloudConfig, removeMeal } = useStore();
  const totals = mealTotals(data.day.meals);
  const remainingCalories = Math.max(0, targets.calories - totals.calories);
  const remainingProtein = Math.max(0, targets.protein - totals.protein);
  const readinessInfo = readiness(data.day, targets);
  const latestWeight = data.day.weight || data.profile.weightKg || 0;
  const movement = libraryById.get("Goblet_Squat") || libraryById.get("Barbell_Squat") || libraryById.get("Pushups");
  const workoutPreview = data.workout
    .map((item) => ({ item, exercise: libraryById.get(item.exerciseId) }))
    .filter((entry) => entry.exercise)
    .slice(0, 3);
  const firstName = (data.profile.name || "").trim().split(/\s+/)[0];
  const greeting = timeOfDayGreeting();
  const hour = new Date().getHours();
  const dayPart = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const narrative = !data.profile.onboarded
    ? "Add a few details and we will set a realistic starting point for food, movement, and recovery."
    : !data.day.meals.length
      ? `Start with one real meal. You have about ${targets.calories.toLocaleString()} kcal and ${targets.protein} g protein to work with today.`
      : remainingCalories > 0
        ? `${remainingCalories.toLocaleString()} kcal and ${remainingProtein} g protein left. ${data.workout.length ? `Your ${data.workout.length}-exercise session is ready when you are.` : "A short session would fit well."}`
        : "You have reached your calorie target. Focus on water, a gentle walk, and recovery rather than chasing a perfect number.";

  const quickActions = [
    { label: "Add food", detail: `${remainingCalories.toLocaleString()} kcal left`, icon: Apple, tone: "green", onClick: () => onLogFood() },
    { label: "Water", detail: `${data.day.water} of ${targets.water} glasses`, icon: Droplets, tone: "blue", onClick: onLogWater },
    { label: "Steps", detail: `${data.day.steps.toLocaleString()} today`, icon: Footprints, tone: "amber", onClick: onLogSteps },
    { label: "Sleep", detail: data.day.sleep ? `${data.day.sleep} hours` : "Add last night", icon: Moon, tone: "violet", onClick: onLogSleep },
  ] as const;

  const discovery = [
    ...exercisesForRegion("Glutes", 2),
    ...exercisesForRegion("Chest", 2),
  ].filter((exercise, index, all) => all.findIndex((item) => item.id === exercise.id) === index);

  return (
    <div className="page today-page">
      <section className="today-hero">
        <div className="today-hero-copy">
          <span className="eyebrow"><Sparkles /> {formatLongDate().toUpperCase()}</span>
          <h1>{greeting}{firstName ? `, ${firstName}` : ""}.<br /><em>One good choice at a time.</em></h1>
          <p>{narrative}</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => onLogFood()}><Plus /> Log food</button>
            <button className="soft-btn" onClick={data.workout.length ? onStartWorkout : () => onNavigate("Workout")}>
              <Play /> {data.workout.length ? "Start workout" : "Build my plan"}
            </button>
          </div>
          <div className="hero-signals">
            <span><Flame /> <b>{remainingCalories.toLocaleString()}</b> kcal left</span>
            <span><Dumbbell /> <b>{data.workout.length || "—"}</b> exercises</span>
            <span><Droplets /> <b>{data.day.water}</b> glasses</span>
          </div>
        </div>
        <button className="today-hero-visual" onClick={() => movement && onOpenExercise(movement.id)} aria-label={movement ? `Open ${movement.name}` : "Explore exercises"}>
          {movement && <img src={movement.imageUrls[0]} alt="" aria-hidden="true" />}
          <span className="hero-visual-shade" />
          <span className="hero-mini-card">
            <span className="hero-mini-label">TODAY&apos;S MOVEMENT</span>
            <b>{movement?.name || "Explore the library"}</b>
            <small>{movement ? `${regionLabel(movement.region)} · ${movement.equipment}` : "876 exercises"}</small>
            <i><ArrowRight /></i>
          </span>
        </button>
      </section>

      <section className="quick-log-grid" aria-label="Quick log">
        {quickActions.map(({ label, detail, icon: Icon, tone, onClick }) => (
          <button className={`quick-action tone-${tone}`} key={label} onClick={onClick}>
            <span><Icon /></span>
            <div><b>{label}</b><small>{detail}</small></div>
            <Plus />
          </button>
        ))}
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <article className="panel nutrition-panel">
            <header className="panel-head">
              <div><span className="eyebrow">TODAY&apos;S PLATE</span><h2>Nutrition</h2></div>
              <button className="text-btn" onClick={() => onLogFood()}><Plus /> Add food</button>
            </header>
            <div className="nutrition-summary">
              <div className="nutrition-ring">
                <Ring value={totals.calories} max={targets.calories} label="Calories logged" detail={`of ${targets.calories.toLocaleString()}`} size={150} />
                <span className={remainingCalories > 0 ? "" : "reached"}>{remainingCalories > 0 ? `${remainingCalories.toLocaleString()} left` : "Target reached"}</span>
              </div>
              <div className="nutrition-macros">
                <div className="macro-total">
                  <span><b>{Math.round(totals.protein)}</b> / {targets.protein} g protein</span>
                  <span><b>{Math.round(totals.carbs)}</b> / {targets.carbs} g carbs</span>
                  <span><b>{Math.round(totals.fat)}</b> / {targets.fat} g fat</span>
                  <span><b>{Math.round(totals.fiber)}</b> g fibre</span>
                </div>
                <MacroBar protein={totals.protein} carbs={totals.carbs} fat={totals.fat} targets={targets} />
              </div>
            </div>

            <div className="meal-list-v2">
              {MEAL_TYPES.map((type) => {
                const meals = data.day.meals.filter((meal) => meal.type === type);
                const calories = meals.reduce((sum, meal) => sum + meal.calories, 0);
                return (
                  <div className="meal-group" key={type}>
                    <button className="meal-group-head" onClick={() => onLogFood(type)}>
                      <span className={`meal-icon ${type.toLowerCase()}`}><Utensils /></span>
                      <div><b>{type}</b><small>{meals.length ? `${meals.length} item${meals.length === 1 ? "" : "s"}` : "Nothing logged"}</small></div>
                      <strong>{calories ? `${Math.round(calories)} kcal` : "+ Add"}</strong>
                      <ChevronRight />
                    </button>
                    {meals.length > 0 && (
                      <div className="meal-items">
                        {meals.map((meal) => (
                          <div className="meal-item" key={meal.id}>
                            <span>{meal.name}<small>{meal.quantity || "1 serving"} · {Math.round(meal.calories)} kcal · {Math.round(meal.protein)} g protein</small></span>
                            <button onClick={() => removeMeal(meal.id)} aria-label={`Remove ${meal.name}`}><Trash2 /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>

          <article className="panel move-panel">
            <header className="panel-head">
              <div><span className="eyebrow">TODAY&apos;S TRAINING</span><h2>Move</h2></div>
              <button className="text-btn" onClick={() => onNavigate("Workout")}>Open plan <ArrowRight /></button>
            </header>

            {workoutPreview.length ? (
              <>
                <div className="move-preview-list">
                  {workoutPreview.map(({ item, exercise }) => exercise && (
                    <button className="move-preview-row" key={item.exerciseId} onClick={() => onOpenExercise(exercise.id)}>
                      <ExerciseMedia exercise={exercise} variant="thumb" />
                      <div><b>{exercise.name}</b><small>{regionLabel(exercise.region)} · {exercise.equipment}</small></div>
                      <strong>{item.sets} × {item.target}{item.targetType === "seconds" ? "s" : ""}</strong>
                      <ChevronRight />
                    </button>
                  ))}
                </div>
                <div className="move-footer">
                  <div><b>{data.workout.length} exercises</b><small>About {Math.max(12, data.workout.length * 6)} minutes · {readinessInfo.label.toLowerCase()}</small></div>
                  <button className="primary-btn" onClick={onStartWorkout}><Play /> Start session</button>
                </div>
              </>
            ) : (
              <div className="move-empty">
                <div>
                  <span className="empty-icon"><Dumbbell /></span>
                  <h3>No routine yet. Let&apos;s fix that in one tap.</h3>
                  <p>Choose a focus. We will pick exercises that match your equipment and experience.</p>
                  <div className="focus-chips">
                    {(["full", "upper", "lower", "core"] as Focus[]).map((focus) => (
                      <button key={focus} onClick={() => onGeneratePlan(focus)}>{PLAN_FOCUS_LABEL[focus]}</button>
                    ))}
                  </div>
                </div>
                <button className="text-btn" onClick={() => onNavigate("Workout")}>Full builder <ArrowRight /></button>
              </div>
            )}
          </article>

          <section className="discovery-section">
            <div className="panel-head">
              <div><span className="eyebrow">EXPLORE NEXT</span><h2>Movements worth knowing</h2></div>
              <button className="text-btn" onClick={() => onNavigate("Explore")}>All exercises <ArrowRight /></button>
            </div>
            <div className="discovery-grid">
              {discovery.slice(0, 4).map((exercise) => (
                <button className="discovery-card" key={exercise.id} onClick={() => onOpenExercise(exercise.id)}>
                  <ExerciseMedia exercise={exercise} variant="card" />
                  <span>{regionLabel(exercise.region)}</span>
                  <b>{exercise.name}</b>
                  <small>{exercise.level} · {exercise.equipment}</small>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="dashboard-rail">
          <article className="panel readiness-panel">
            <header className="panel-head compact">
              <div><span className="eyebrow">READINESS</span><h2>{readinessInfo.label}</h2></div>
              <Ring value={readinessInfo.score} max={100} label="Readiness" detail="/ 100" size={70} color="#6f9638" />
            </header>
            <p>{readinessInfo.detail}</p>
            <div className="signal-list">
              <Signal icon={<Moon />} label="Sleep" value={data.day.sleep ? `${data.day.sleep} h` : "—"} progress={data.day.sleep / targets.sleep} detail={`${targets.sleep} h target`} />
              <Signal icon={<Droplets />} label="Water" value={`${data.day.water}`} progress={data.day.water / targets.water} detail={`of ${targets.water} glasses`} />
              <Signal icon={<Footprints />} label="Steps" value={data.day.steps.toLocaleString()} progress={data.day.steps / targets.steps} detail={`of ${targets.steps.toLocaleString()}`} />
            </div>
            <button className="soft-btn wide" onClick={onLogSleep}><Moon /> Update recovery</button>
          </article>

          <article className="panel water-panel">
            <header className="panel-head compact">
              <div><span className="eyebrow">HYDRATION</span><h2>{data.day.water} of {targets.water} glasses</h2></div>
              <span className="water-drop"><Droplets /></span>
            </header>
            <div className="water-glasses" aria-hidden="true">
              {Array.from({ length: Math.max(targets.water, 8) }, (_, index) => (
                <i key={index} className={index < data.day.water ? "filled" : ""} />
              ))}
            </div>
            <button className="primary-btn wide" onClick={onLogWater}><Plus /> Add water</button>
          </article>

          <article className="panel coach-panel">
            <span className="coach-orb"><Bot /></span>
            <span className="eyebrow">CHINNU COACH</span>
            <h2>A little clarity for the next hour.</h2>
            <p>
              {!data.day.meals.length
                ? "Tell me what is in your kitchen and I will suggest a simple first meal."
                : remainingProtein > 25
                  ? `You still need about ${Math.round(remainingProtein)} g protein. Ask me for a quick option.`
                  : "Your food is in a good place. Want a short session or a recovery plan?"}
            </p>
            <button className="text-btn" onClick={() => onNavigate("Coach")}>Ask the coach <ArrowRight /></button>
            <small>{cloudConfig ? "Cloud AI when enabled · private by default" : "Local guidance · works without an account"}</small>
          </article>

          <article className="panel mini-progress-panel">
            <div className="mini-progress-head"><span className="eyebrow">THIS WEEK</span><button onClick={() => onNavigate("Progress")}><ArrowRight /></button></div>
            <div className="weekly-mini">
              {Array.from({ length: 7 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                const key = dateKey(date);
                const day = data.days[key];
                const total = day ? mealTotals(day.meals) : null;
                const height = total ? Math.min(100, (total.calories / targets.calories) * 100) : 4;
                return <span key={key}><i style={{ height: `${height}%` }} className={total?.calories ? "" : "empty"} /><small>{["S", "M", "T", "W", "T", "F", "S"][date.getDay()]}</small></span>;
              })}
            </div>
            <div className="mini-progress-stats">
              <span><b>{latestWeight ? displayWeight(latestWeight, data.profile.units) : "—"}</b><small>current weight</small></span>
              <span><b>{data.workoutLogs.length}</b><small>workouts logged</small></span>
            </div>
            <button className="text-btn" onClick={onLogWeight}><Scale /> Update weight</button>
          </article>
        </aside>
      </div>

      <section className="today-footer-note">
        <Target />
        <p><b>Progress, not perfection.</b> Estimates are fine. One logged meal, one short walk, and one glass of water still count.</p>
        <Check />
      </section>
    </div>
  );
}

function Signal({ icon, label, value, progress, detail }: { icon: ReactNode; label: string; value: string; progress: number; detail: string }) {
  return (
    <div className="signal-row">
      <span className="signal-icon">{icon}</span>
      <div><b>{label}</b><small>{detail}</small></div>
      <strong>{value}</strong>
      <i><em style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }} /></i>
    </div>
  );
}
