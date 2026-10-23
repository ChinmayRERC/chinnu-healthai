import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Pause,
  Play,
  SkipForward,
  TimerReset,
  X,
} from "lucide-react";
import type { ExerciseResult, WorkoutItem, WorkoutLog } from "../types";
import { useStore } from "../lib/store";
import { getExercise, regionLabel, trackedExerciseFor } from "../lib/library";

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function WorkoutPlayer({
  items,
  onClose,
  onTrain,
  onFinish,
}: {
  items: WorkoutItem[];
  onClose: () => void;
  onTrain: (id: string) => void;
  onFinish: (log: WorkoutLog) => void;
}) {
  const { data } = useStore();
  const restDefault = data.settings.restSeconds || 75;
  const [index, setIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [rest, setRest] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(Date.now());
  const finished = useRef(false);
  const [results, setResults] = useState<ExerciseResult[]>(() =>
    items.map((item) => ({
      exerciseId: item.exerciseId,
      name: getExercise(item.exerciseId)?.name || item.exerciseId,
      sets: Array.from({ length: item.sets }, () => ({ reps: 0, weight: item.weight || 0, done: false })),
    })),
  );

  const currentItem = items[index];
  const current = currentItem ? getExercise(currentItem.exerciseId) : null;
  const tracked = current ? trackedExerciseFor(current.id) : undefined;
  const totalSets = useMemo(() => items.reduce((sum, item) => sum + item.sets, 0), [items]);
  const completedSets = results.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.done).length, 0);
  const overallProgress = totalSets ? (completedSets / totalSets) * 100 : 0;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setInterval(() => setElapsed(Math.round((Date.now() - started.current) / 1000)), 1000);
    return () => { document.body.style.overflow = previous; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!rest || paused) return;
    const timer = window.setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [rest, paused]);

  if (!currentItem || !current) {
    return (
      <div className="workout-player-overlay">
        <div className="player-empty">
          <Dumbbell />
          <h2>No exercises in this session.</h2>
          <button className="primary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  function finish(finalResults = results) {
    if (finished.current) return;
    finished.current = true;
    const completedExercises = finalResults.filter((exercise) => exercise.sets.some((set) => set.done)).length;
    const volume = finalResults.reduce(
      (sum, exercise) => sum + exercise.sets.reduce((inner, set) => inner + (set.done ? set.reps * set.weight : 0), 0),
      0,
    );
    onFinish({
      id: Date.now(),
      date: new Date().toISOString(),
      title: "Training session",
      duration: Math.max(1, Math.round((Date.now() - started.current) / 1000)),
      completedExercises,
      totalExercises: items.length,
      volume: Math.round(volume),
      exercises: finalResults.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set, reps: set.reps || 0 })),
      })),
    });
  }

  function completeSet() {
    const nextResults = results.map((exercise, exerciseIndex) => {
      if (exerciseIndex !== index) return exercise;
      return {
        ...exercise,
        sets: exercise.sets.map((set, setIndex) =>
          setIndex === setNumber - 1
            ? { ...set, done: true, reps: currentItem.targetType === "seconds" ? 1 : currentItem.target, seconds: currentItem.targetType === "seconds" ? currentItem.target : undefined }
            : set,
        ),
      };
    });
    setResults(nextResults);

    if (setNumber < currentItem.sets) {
      setSetNumber(setNumber + 1);
      setRest(currentItem.rest || restDefault);
      return;
    }
    if (index < items.length - 1) {
      setIndex(index + 1);
      setSetNumber(1);
      setRest(currentItem.rest || restDefault);
      return;
    }
    finish(nextResults);
  }

  function nextExercise() {
    if (index < items.length - 1) {
      setIndex(index + 1);
      setSetNumber(1);
      setRest(0);
    } else {
      finish();
    }
  }

  const isHold = currentItem.targetType === "seconds";

  return (
    <div className="workout-player-overlay">
      <div className="player-top">
        <span className="player-brand"><span><Flame /></span> SESSION IN PROGRESS</span>
        <div className="player-top-right">
          <span><Clock3 /> {formatClock(elapsed)}</span>
          <button className="player-close" onClick={onClose} aria-label="Exit workout"><X /></button>
        </div>
      </div>
      <div className="player-progress"><i style={{ width: `${overallProgress}%` }} /></div>

      <div className="player-body">
        <div className="player-media">
          <img src={current.imageUrls[0]} alt={`${current.name} demonstration`} />
          <div className="player-media-gradient" />
          <span className="player-exercise-count">EXERCISE {index + 1} OF {items.length}</span>
          <div className="player-media-caption">
            <span>{regionLabel(current.region)} · {current.equipment}</span>
            <b>{current.name}</b>
            <small>{currentItem.sets} sets · {isHold ? "timed hold" : "controlled reps"}</small>
          </div>
        </div>

        <div className="player-work">
          {rest > 0 ? (
            <div className="rest-panel" aria-live="polite">
              <span className="eyebrow">REST & RESET</span>
              <strong>{rest}</strong>
              <p>Seconds. Breathe. Loosen your grip.</p>
              <div className="rest-actions">
                <button className="soft-btn" onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}{paused ? "Resume" : "Pause"}</button>
                <button className="text-btn" onClick={() => setRest(0)}><SkipForward /> Skip rest</button>
              </div>
            </div>
          ) : (
            <div className="set-panel" aria-live="polite">
              <div className="set-counter">
                <span><small>SET</small><b>{setNumber}<i>/{currentItem.sets}</i></b></span>
                <span><small>{isHold ? "HOLD" : "TARGET"}</small><b>{currentItem.target}<i>{isHold ? "s" : ""}</i></b></span>
              </div>
              <div className="set-dots" aria-label={`${setNumber} of ${currentItem.sets} sets`}>
                {Array.from({ length: currentItem.sets }, (_, dot) => <i key={dot} className={dot < setNumber - 1 ? "done" : dot === setNumber - 1 ? "current" : ""} />)}
              </div>
              <div className="player-actions">
                <button className="primary-btn complete-set-btn" onClick={completeSet}><Check /> {isHold ? "Hold complete" : "Set complete"}</button>
                <div className="player-secondary-actions">
                  {tracked && <button className="soft-btn" onClick={() => onTrain(current.id)}><Camera /> Camera form coach</button>}
                  <button className="soft-btn" onClick={nextExercise}><SkipForward /> Skip exercise</button>
                </div>
              </div>
            </div>
          )}

          <div className="player-next">
            <span className="eyebrow">UP NEXT</span>
            <div>
              <span className="next-thumb"><img src={current.imageUrls[0]} alt="" /></span>
              <div><b>{current.name}</b><small>{completedSets} of {totalSets} sets completed</small></div>
              <ChevronRight />
            </div>
          </div>
          <button className="player-finish-link" onClick={() => setShowFinish(true)}>Finish workout early</button>
        </div>
      </div>

      {showFinish && (
        <div className="player-confirm">
          <div>
            <TimerReset />
            <h3>Finish this session?</h3>
            <p>We will save the sets you have completed so far. You can pick up the rest later.</p>
            <div>
              <button className="soft-btn" onClick={() => setShowFinish(false)}>Keep training</button>
              <button className="primary-btn" onClick={() => finish()}>Save and finish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
