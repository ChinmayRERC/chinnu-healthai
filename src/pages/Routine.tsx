import { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CalendarRange,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import { generatePersonalRoutine, getRoutineForToday, getWeekDays, adaptRoutineWithAI } from "../lib/routine";
import { getExercise, regionLabel } from "../lib/library";
import ExerciseMedia from "../components/ExerciseMedia";
import type { WeekDay } from "../types";

const DAY_LABEL: Record<WeekDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export default function Routine({
  onOpenExercise,
  onStartRoutineDay,
  onNavigate,
  onNotify,
}: {
  onOpenExercise: (id: string) => void;
  onStartRoutineDay: (dayIndex: number) => void;
  onNavigate: (section: "Today" | "Workout" | "Coach" | "Explore" | "Progress" | "Profile") => void;
  onNotify: (message: string) => void;
}) {
  const { data, setPersonalRoutine, markRoutineDay, update } = useStore();
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const weekDays = useMemo(() => getWeekDays(), []);
  const today = useMemo(() => new Date().getDay(), []); // 0 Sun
  const todayIndex = today === 0 ? 6 : today - 1; // Mon=0
  const routine = data.personalRoutine;
  const todayRoutine = routine ? getRoutineForToday(routine) : null;

  async function generate() {
    setGenerating(true);
    try {
      const r = await generatePersonalRoutine(data.profile, data);
      setPersonalRoutine(r);
      onNotify("Your 7-day personalized routine is ready");
    } finally {
      setGenerating(false);
    }
  }

  async function adapt() {
    if (!routine) return;
    setAdapting(true);
    try {
      const adapted = await adaptRoutineWithAI(routine, data);
      if (adapted) {
        setPersonalRoutine(adapted);
        onNotify("Routine adapted to your recent activity");
      } else {
        onNotify("Using local adaptation for now");
      }
    } finally {
      setAdapting(false);
    }
  }

  function startDay(dayIndex: number) {
    if (!routine) return;
    const day = routine.days[dayIndex];
    if (day.isRest) {
      onNotify("Rest day — recovery is part of progress");
      return;
    }
    // Load today's workout items
    update((current) => ({ ...current, workout: day.items }));
    markRoutineDay(dayIndex, true);
    onStartRoutineDay(dayIndex);
  }

  return (
    <div className="page routine-page">
      <section className="routine-head">
        <div>
          <span className="eyebrow"><CalendarRange /> 7-DAY PERSONAL ROUTINE</span>
          <h1>Built for <em>you</em>, adjusted over time</h1>
          <p>AI-driven plan based on your goals, experience, equipment, recovery, and recent activity. Each day is tailored to your energy and schedule.</p>
        </div>
        <div className="routine-head-actions">
          {routine && (
            <>
              <button className="soft-btn" onClick={adapt} disabled={adapting}>
                <Brain /> {adapting ? "Adapting..." : "Adapt with AI"}
              </button>
              <button className="soft-btn" onClick={generate} disabled={generating}>
                <RefreshCw /> {generating ? "Regenerating..." : "Regenerate"}
              </button>
            </>
          )}
          {!routine && (
            <button className="primary-btn" onClick={generate} disabled={generating}>
              <Wand2 /> {generating ? "Building your plan..." : "Generate my 7-day routine"}
            </button>
          )}
        </div>
      </section>

      {!routine && (
        <section className="panel routine-hero">
          <div className="routine-hero-content">
            <Sparkles />
            <h2>Let AI build your personal workout routine</h2>
            <p>We'll analyze your profile, goals, experience, equipment, and current activity to create a balanced 7-day plan with strength, recovery, and progression built in.</p>
            <div className="routine-features">
              <span><Target /> Goal-aligned</span>
              <span><Dumbbell /> Equipment-aware</span>
              <span><Clock3 /> Time-optimized</span>
              <span><Flame /> Progressive overload</span>
            </div>
            <button className="primary-btn" onClick={generate} disabled={generating}>
              <Wand2 /> {generating ? "Building..." : "Generate 7-day routine"}
            </button>
          </div>
        </section>
      )}

      {routine && (
        <>
          {todayRoutine && !todayRoutine.isRest && (
            <section className="panel today-routine-card">
              <div className="today-routine-header">
                <div>
                  <span className="eyebrow"><Sparkles /> TODAY'S ROUTINE</span>
                  <h2>{todayRoutine.title}</h2>
                  <p>{todayRoutine.rationale}</p>
                </div>
                <button className="primary-btn" onClick={() => startDay(todayIndex)}>
                  <Play /> Start today's workout
                </button>
              </div>
              <div className="today-routine-preview">
                {todayRoutine.items.slice(0, 4).map((item) => {
                  const ex = getExercise(item.exerciseId);
                  if (!ex) return null;
                  return (
                    <button key={item.exerciseId} className="today-routine-item" onClick={() => onOpenExercise(ex.id)}>
                      <ExerciseMedia exercise={ex} variant="thumb" />
                      <div>
                        <b>{ex.name}</b>
                        <small>{item.sets} × {item.target}{item.targetType === "seconds" ? "s" : " reps"}</small>
                      </div>
                      <ChevronRight />
                    </button>
                  );
                })}
                {todayRoutine.items.length > 4 && <span className="more-items">+{todayRoutine.items.length - 4} more</span>}
              </div>
            </section>
          )}

          <section className="panel week-routine-panel">
            <header className="panel-head">
              <div>
                <span className="eyebrow">YOUR WEEK</span>
                <h2>7-day breakdown</h2>
              </div>
              {routine.aiReasoning && <p className="routine-ai-reason">{routine.aiReasoning}</p>}
            </header>
            <div className="week-grid">
              {routine.days.map((day, idx) => {
                const isToday = idx === todayIndex;
                const done = routine.adherence?.[`${new Date().toISOString().split('T')[0]}::${idx}`] || false;
                return (
                  <article key={day.day} className={`week-day-card ${day.isRest ? 'rest' : ''} ${isToday ? 'today' : ''} ${done ? 'done' : ''}`}>
                    <header className="week-day-header">
                      <div>
                        <span className="day-label">{day.day}</span>
                        <b>{DAY_LABEL[day.day]}</b>
                        {isToday && <span className="today-badge">Today</span>}
                        {done && <span className="done-badge"><Check /> Done</span>}
                      </div>
                      {!day.isRest && (
                        <button className="icon-btn" onClick={() => startDay(idx)}>
                          <Play />
                        </button>
                      )}
                    </header>
                    <div className="week-day-body">
                      <h3>{day.title}</h3>
                      <p>{day.notes || day.rationale}</p>
                      {day.isRest ? (
                        <div className="rest-indicator">
                          <span>Rest & Recovery</span>
                          <small>Let your body repair and adapt</small>
                        </div>
                      ) : (
                        <>
                          <div className="day-stats">
                            <span><Dumbbell /> {day.items.length} exercises</span>
                            <span><Clock3 /> ~{day.durationEst || 45} min</span>
                          </div>
                          <button className="text-btn" onClick={() => setShowDetails(idx)}>
                            View details <ArrowRight />
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      {showDetails !== null && routine && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowDetails(null)}>
          <div className="modal routine-detail-modal" role="dialog" aria-modal="true">
            <button className="modal-close" onClick={() => setShowDetails(null)}><X /></button>
            <span className="modal-mark"><Dumbbell /></span>
            <span className="eyebrow">{routine.days[showDetails].day}</span>
            <h2>{routine.days[showDetails].title}</h2>
            <p>{routine.days[showDetails].rationale}</p>
            <div className="routine-detail-list">
              {routine.days[showDetails].items.map((item, i) => {
                const ex = getExercise(item.exerciseId);
                if (!ex) return null;
                return (
                  <button key={item.exerciseId} className="routine-detail-item" onClick={() => { setShowDetails(null); onOpenExercise(ex.id); }}>
                    <span className="detail-num">{String(i + 1).padStart(2, "0")}</span>
                    <ExerciseMedia exercise={ex} variant="thumb" />
                    <div>
                      <b>{ex.name}</b>
                      <small>{regionLabel(ex.region)} · {ex.equipment}</small>
                    </div>
                    <strong>{item.sets} × {item.target}{item.targetType === "seconds" ? "s" : ""}</strong>
                    <ChevronRight />
                  </button>
                );
              })}
            </div>
            <button className="primary-btn wide" onClick={() => { setShowDetails(null); startDay(showDetails); }}>
              <Play /> Start this day
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
