import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Camera,
  Dumbbell,
  Flame,
  Footprints,
  Moon,
  Plus,
  Scale,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
} from "lucide-react";
import { useStore } from "../lib/store";
import { useLocale } from "../lib/locale";
import {
  calorieStreak,
  dateKey,
  displayWeight,
  formatShortDate,
  mealTotals,
  shiftDate,
  workoutVolume,
} from "../lib/profile";
import { BarChart, ChartEmpty, LineChart, Ring, StatCard } from "../components/Charts";

export default function Progress({ onLogWeight }: { onLogWeight: () => void }) {
  const { data, targets } = useStore();
  const { tr } = useLocale();
  const [range, setRange] = useState<7 | 30>(7);
  const unit = data.profile.units;
  const today = dateKey();

  const dates = useMemo(
    () => Array.from({ length: range }, (_, index) => shiftDate(today, -(range - 1 - index))),
    [range, today],
  );

  const dayData = useMemo(
    () => dates.map((key) => {
      const day = data.days[key];
      const totals = day ? mealTotals(day.meals) : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      return { key, day, totals };
    }),
    [dates, data.days],
  );

  const caloriePoints = dayData
    .filter((entry) => range === 7 || entry.totals.calories > 0)
    .map((entry) => ({ label: formatShortDate(entry.key), value: Math.round(entry.totals.calories) }));
  const stepPoints = dayData
    .filter((entry) => range === 7 || (entry.day?.steps || 0) > 0)
    .map((entry) => ({ label: formatShortDate(entry.key), value: entry.day?.steps || 0 }));
  const weightPoints = dayData
    .filter((entry) => (entry.day?.weight || 0) > 0)
    .map((entry) => ({ label: formatShortDate(entry.key), value: Number(entry.day?.weight) }));
  const sleepPoints = dayData
    .filter((entry) => (entry.day?.sleep || 0) > 0)
    .map((entry) => ({ label: formatShortDate(entry.key), value: Number(entry.day?.sleep) }));

  const loggedNutritionDays = dayData.filter((entry) => entry.totals.calories > 0);
  const avgCalories = loggedNutritionDays.length
    ? Math.round(loggedNutritionDays.reduce((sum, entry) => sum + entry.totals.calories, 0) / loggedNutritionDays.length)
    : 0;
  const avgProtein = loggedNutritionDays.length
    ? Math.round(loggedNutritionDays.reduce((sum, entry) => sum + entry.totals.protein, 0) / loggedNutritionDays.length)
    : 0;
  const onTargetDays = loggedNutritionDays.filter((entry) => Math.abs(entry.totals.calories - targets.calories) <= targets.calories * 0.2).length;
  const latestWeight = [...weightPoints].reverse()[0]?.value || data.profile.weightKg || 0;
  const weightChange = weightPoints.length >= 2 ? weightPoints[weightPoints.length - 1].value - weightPoints[0].value : 0;
  const workoutsInRange = data.workoutLogs.filter((log) => log.date.slice(0, 10) >= dates[0]);
  const sessionsInRange = data.trainingSessions.filter((session) => session.date.slice(0, 10) >= dates[0]);
  const volume = workoutVolume(workoutsInRange);
  const streak = calorieStreak(data.days, targets);
  const loggedDayCount = dates.filter((key) => {
    const day = data.days[key];
    return !!day && (day.meals.length > 0 || day.water > 0 || day.steps > 0 || day.sleep > 0 || day.weight > 0);
  }).length;
  const hasAnyData = loggedDayCount > 0;

  const rangeLabel = range === 7 ? tr("Last 7 days") : tr("Last 30 days");

  return (
    <div className="page progress-page-v2">
      <section className="progress-head">
        <div>
          <span className="eyebrow"><TrendingUp /> {tr("THE LONG VIEW")}</span>
          <h1>{tr("Small signals.")}<br /><em>{tr("Real direction.")}</em></h1>
          <p>{tr("Look for the trend, not the single day. Weight, food, movement, and sleep all tell part of the story.")}</p>
        </div>
        <div className="progress-head-actions">
          <div className="segmented">
            <button className={range === 7 ? "active" : ""} onClick={() => setRange(7)}>{tr("7 days")}</button>
            <button className={range === 30 ? "active" : ""} onClick={() => setRange(30)}>{tr("30 days")}</button>
          </div>
          <button className="primary-btn" onClick={onLogWeight}><Scale /> {tr("Log weight")}</button>
        </div>
      </section>

      {!hasAnyData ? (
        <section className="panel progress-empty">
          <ChartEmpty>{tr("Your trend will appear after you log a meal, weight, steps, water, or sleep.")}</ChartEmpty>
          <button className="primary-btn" onClick={onLogWeight}><Plus /> {tr("Add your first check-in")}</button>
        </section>
      ) : (
        <>
          <section className="progress-stats-v2">
            <StatCard icon={<Scale />} label={tr("Current weight")} value={latestWeight ? displayWeight(latestWeight, unit) : "—"} detail={weightPoints.length >= 2 ? `${weightChange > 0 ? "+" : ""}${unit === "imperial" ? Math.round(weightChange * 2.20462) : weightChange.toFixed(1)} ${unit === "imperial" ? "lb" : "kg"} · ${rangeLabel.toLowerCase()}` : tr("Log again to see a trend")} tone="green" />
            <StatCard icon={<Flame />} label={tr("Average intake")} value={avgCalories ? `${avgCalories.toLocaleString()} kcal` : "—"} detail={`${onTargetDays} / ${loggedNutritionDays.length} ${tr("logged days near target")}`} tone="amber" />
            <StatCard icon={<Dumbbell />} label={tr("Workouts")} value={String(workoutsInRange.length)} detail={`${sessionsInRange.length} ${tr("camera sessions")} · ${volume ? `${Math.round(volume).toLocaleString()} kg ${tr("volume")}` : tr("bodyweight or unloaded")}`} tone="blue" />
            <StatCard icon={<Target />} label={tr("Calorie streak")} value={`${streak} ${tr(streak === 1 ? "day" : "days")}`} detail={`${loggedDayCount} / ${range} ${tr("days with a check-in")}`} tone="rose" />
          </section>

          <div className="progress-chart-grid">
            <article className="panel chart-panel wide">
              <header className="panel-head">
                <div><span className="eyebrow">{tr("ENERGY")}</span><h2>{tr("Calories logged")}</h2></div>
                <span className="chart-caption">{rangeLabel} · target {targets.calories.toLocaleString()} kcal</span>
              </header>
              {range === 7 ? (
                <BarChart data={caloriePoints} color="#6f9638" suffix=" kcal" />
              ) : (
                <LineChart data={caloriePoints} color="#6f9638" suffix=" kcal" />
              )}
              <div className="chart-foot"><span>{tr("Protein average")} <b>{avgProtein || "—"} g</b></span><span>{tr("Target")} <b>{targets.protein} g</b></span><span>{tr("Logged days")} <b>{loggedNutritionDays.length}</b></span></div>
            </article>

            <article className="panel chart-panel">
              <header className="panel-head">
                <div><span className="eyebrow">{tr("WEIGHT TREND")}</span><h2>{tr("Body weight")}</h2></div>
                <Scale />
              </header>
              {weightPoints.length >= 2 ? (
                <LineChart data={weightPoints} color="#668fb0" suffix={unit === "imperial" ? " lb" : " kg"} />
              ) : (
                <ChartEmpty>{tr("Log weight on two or more days to see the direction.")}</ChartEmpty>
              )}
              <div className="chart-foot"><span>{tr("Healthy range")} <b>{targets.healthyWeight ? `${displayWeight(targets.healthyWeight[0], unit)}–${displayWeight(targets.healthyWeight[1], unit)}` : tr("add height")}</b></span></div>
            </article>

            <article className="panel chart-panel">
              <header className="panel-head">
                <div><span className="eyebrow">{tr("DAILY MOVEMENT")}</span><h2>{tr("Steps")}</h2></div>
                <Footprints />
              </header>
              {stepPoints.some((point) => point.value > 0) ? (
                range === 7 ? <BarChart data={stepPoints} color="#c7913f" suffix=" steps" /> : <LineChart data={stepPoints} color="#c7913f" suffix=" steps" />
              ) : (
                <ChartEmpty>{tr("Log steps from your phone or watch to see this trend.")}</ChartEmpty>
              )}
              <div className="chart-foot"><span>{tr("Target")} <b>{targets.steps.toLocaleString()} / {tr("day")}</b></span><span>{tr("Average")} <b>{stepPoints.length ? Math.round(stepPoints.reduce((sum, point) => sum + point.value, 0) / stepPoints.length).toLocaleString() : "—"}</b></span></div>
            </article>

            <article className="panel chart-panel">
              <header className="panel-head">
                <div><span className="eyebrow">{tr("RECOVERY")}</span><h2>{tr("Sleep")}</h2></div>
                <Moon />
              </header>
              {sleepPoints.some((point) => point.value > 0) ? (
                <BarChart data={sleepPoints} color="#8573aa" suffix=" h" />
              ) : (
                <ChartEmpty>{tr("Add last night’s sleep to connect recovery to training.")}</ChartEmpty>
              )}
              <div className="chart-foot"><span>{tr("Target")} <b>{targets.sleep} h</b></span><span>{tr("Average")} <b>{sleepPoints.length ? (sleepPoints.reduce((sum, point) => sum + point.value, 0) / sleepPoints.length).toFixed(1) : "—"} h</b></span></div>
            </article>
          </div>

          <div className="progress-lower-grid">
            <article className="panel consistency-panel">
              <header className="panel-head">
                <div><span className="eyebrow">{tr("CONSISTENCY")}</span><h2>{tr("Showing up")}</h2></div>
                <Ring value={loggedDayCount} max={range} label={tr("Check-in days")} detail={`/ ${range}`} size={94} color="#6f9638" />
              </header>
              <div className="consistency-heatmap" aria-label={`${loggedDayCount} of ${range} days with a check-in`}>
                {dayData.map((entry) => {
                  const intensity = entry.totals.calories > 0 ? Math.min(1, entry.totals.calories / targets.calories) : entry.day?.water || entry.day?.steps ? 0.35 : 0;
                  return <span key={entry.key} title={`${entry.key}: ${entry.totals.calories} kcal`} data-level={intensity > 0.8 ? "high" : intensity > 0.4 ? "medium" : intensity > 0 ? "low" : "none"} />;
                })}
              </div>
              <p>{tr("A check-in is enough. The goal is a usable record, not a flawless streak.")}</p>
              <div className="consistency-legend"><span><i className="none" /> {tr("no entry")}</span><span><i className="low" /> {tr("partial")}</span><span><i className="high" /> {tr("logged")}</span></div>
            </article>

            <article className="panel activity-history-panel">
              <header className="panel-head">
                <div><span className="eyebrow">{tr("RECENT ACTIVITY")}</span><h2>{tr("Sessions")}</h2></div>
                <span className="history-count">{workoutsInRange.length + sessionsInRange.length} in range</span>
              </header>
              {workoutsInRange.length || sessionsInRange.length ? (
                <div className="progress-activity-list">
                  {workoutsInRange.slice(0, 3).map((log) => (
                    <div key={`log-${log.id}`} className="progress-activity-row">
                      <span><Trophy /></span>
                      <div><b>{log.title}</b><small>{formatShortDate(log.date.slice(0, 10))} · {Math.round(log.duration / 60)} min · {log.completedExercises}/{log.totalExercises} exercises</small></div>
                      <strong>{log.completedExercises} done</strong>
                    </div>
                  ))}
                  {sessionsInRange.slice(0, 3).map((session) => (
                    <div key={`session-${session.id}`} className="progress-activity-row">
                      <span><Camera /></span>
                      <div><b>{session.name}</b><small>{formatShortDate(session.date.slice(0, 10))} · {session.reps.length ? `${session.reps.length} reps` : `${Math.round(session.hold)}s hold`} · score {session.score ?? "—"}</small></div>
                      <strong>{tr("camera")}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mini-empty"><Activity /><p>{tr("Your completed workouts and camera sessions will show up here.")}</p></div>
              )}
            </article>
          </div>

          <section className="progress-insight">
            <div><Utensils /><span><b>{tr("One useful pattern")}</b> <p>{tr(avgProtein && avgProtein < targets.protein * 0.8 ? "Your average protein is below your target. Add a protein source to breakfast." : avgCalories && avgCalories > targets.calories * 1.15 ? "Your logged intake is above target. Check portions, drinks, and cooking oils before cutting meals." : "Your check-ins are building a useful pattern. Keep the next action small and repeatable.")}</p></span></div>
            <button className="text-btn" onClick={onLogWeight}>{tr("Add today")} <ArrowRight /></button>
          </section>
        </>
      )}
    </div>
  );
}
