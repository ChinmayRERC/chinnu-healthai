import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  ExternalLink,
  HeartPulse,
  Info,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Volume2,
} from "lucide-react";
import { useMemo } from "react";
import ExerciseMedia from "../components/ExerciseMedia";
import { youtubeSearchUrl } from "../components/YouTubeModal";
import { useStore } from "../lib/store";
import {
  getExercise,
  LEVEL_LABEL,
  library,
  regionFor,
  regionLabel,
  trackedExerciseFor,
} from "../lib/library";

export default function ExerciseDetail({
  id,
  onBack,
  onOpenVideo,
  onStartTrainer,
  onNotify,
  onOpenExercise,
  backLabel = "All exercises",
}: {
  id: string;
  onBack: () => void;
  backLabel?: string;
  onOpenVideo: (id: string) => void;
  onStartTrainer: (id: string) => void;
  onNotify: (message: string) => void;
  onOpenExercise: (id: string) => void;
}) {
  const { data, addWorkoutItem, removeWorkoutItem } = useStore();
  const exercise = getExercise(id);
  const related = useMemo(() => {
    if (!exercise) return [];
    const region = exercise.region;
    const choices = library.filter((item) => item.id !== exercise.id && (item.region === region || item.primaryMuscles.some((muscle) => regionFor(muscle) === region)));
    const curated = choices.filter((item) => Boolean(item.youtube) || Boolean(item.trackedId));
    return [...curated, ...choices.filter((item) => !curated.includes(item))].slice(0, 4);
  }, [exercise]);

  if (!exercise) {
    return (
      <div className="page">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> {backLabel}</button>
        <div className="empty-state large"><Search /><h3>Exercise not found</h3><p>It may have been renamed. Search the library again.</p></div>
      </div>
    );
  }

  const activeExercise = exercise;
  const added = data.workout.some((item) => item.exerciseId === activeExercise.id);
  const tracked = trackedExerciseFor(activeExercise.id);
  const isHold = activeExercise.primaryMuscles.includes("abdominals");

  function toggleWorkout() {
    if (added) {
      removeWorkoutItem(activeExercise.id);
      onNotify(`${activeExercise.name} removed from your plan`);
    } else {
      addWorkoutItem(activeExercise.id, { sets: 3, target: isHold ? 35 : 10, targetType: isHold ? "seconds" : "reps" });
      onNotify(`${activeExercise.name} added to your plan`);
    }
  }

  function readAloud() {
    if (!("speechSynthesis" in window)) {
      onNotify("Read aloud is not supported in this browser.");
      return;
    }
    speechSynthesis.cancel();
    const text = `${activeExercise.name}. ${activeExercise.instructions.join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="page detail-page-v2">
      <div className="detail-topline">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> {backLabel}</button>
        <span className="detail-crumb">Explore <ChevronRight /> {regionLabel(exercise.region)} <ChevronRight /> {exercise.name}</span>
      </div>

      <section className="exercise-detail-hero">
        <div className="detail-copy">
          <span className="eyebrow"><Sparkles /> {exercise.category.toUpperCase()} · {LEVEL_LABEL[exercise.level].toUpperCase()}</span>
          <h1>{exercise.name}</h1>
          <p className="detail-lede">
            {exercise.primaryMuscles.map(regionLabel).join(" · ")}
            {exercise.secondaryMuscles.length ? ` + ${exercise.secondaryMuscles.map(regionLabel).join(", ")}` : ""}
          </p>
          <div className="detail-tags">
            <span><Dumbbell /> {exercise.equipment === "body only" ? "Bodyweight" : exercise.equipment}</span>
            <span><Target /> {regionLabel(exercise.region)}</span>
            <span><Info /> {exercise.force ? `${exercise.force} pattern` : exercise.mechanic || "Controlled movement"}</span>
          </div>
          <div className="detail-actions">
            <button className={added ? "soft-btn" : "primary-btn"} onClick={toggleWorkout}>
              {added ? <Trash2 /> : <Plus />} {added ? "Remove from plan" : "Add to my plan"}
            </button>
            {exercise.youtube ? (
              <button className="soft-btn" onClick={() => onOpenVideo(exercise.id)}><Play /> Watch demo</button>
            ) : (
              <a className="soft-btn" href={youtubeSearchUrl(exercise)} target="_blank" rel="noreferrer"><Play /> Find a demo</a>
            )}
            {tracked && <button className="soft-btn" onClick={() => onStartTrainer(exercise.id)}><Camera /> Camera coach</button>}
          </div>
          {!tracked && (
            <p className="camera-note"><Camera /> Camera form coaching is available for 15 foundational movements. This exercise includes photo and written guidance.</p>
          )}
        </div>
        <div className="detail-media-wrap">
          <ExerciseMedia exercise={exercise} variant="hero" autoAlternate />
          <div className="media-caption">
            <span>{exercise.youtube ? <><Play /> Video demo available</> : <><Info /> Photo demonstration</>}</span>
            <small>Images: free-exercise-db · public domain</small>
          </div>
        </div>
      </section>

      <div className="detail-facts-v2">
        <article><Clock3 /><div><small>Suggested work</small><b>{isHold ? "3 × 30–45 sec" : "3 × 8–12 reps"}</b></div></article>
        <article><Dumbbell /><div><small>Equipment</small><b>{exercise.equipment === "body only" ? "None" : exercise.equipment}</b></div></article>
        <article><Target /><div><small>Primary muscles</small><b>{exercise.primaryMuscles.map(regionLabel).join(", ")}</b></div></article>
        <article><ShieldCheck /><div><small>Level</small><b>{LEVEL_LABEL[exercise.level]}</b></div></article>
      </div>

      <div className="detail-content-grid">
        <article className="panel instructions-panel">
          <header className="panel-head">
            <div><span className="eyebrow">STEP BY STEP</span><h2>How to do it</h2></div>
            <button className="text-btn" onClick={readAloud}><Volume2 /> Read aloud</button>
          </header>
          <ol className="instruction-list">
            {exercise.instructions.map((step, index) => (
              <li key={`${index}-${step.slice(0, 16)}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
            {!exercise.instructions.length && <li><span>01</span><p>Use a comfortable range, move slowly, and breathe throughout.</p></li>}
          </ol>
          <div className="form-cues">
            <h3>Keep these three things true</h3>
            <div>
              <span><Check /> Use a range you can control.</span>
              <span><Check /> Breathe; do not hold your breath.</span>
              <span><Check /> Stop for sharp pain, numbness, or dizziness.</span>
            </div>
          </div>
        </article>

        <aside className="detail-side">
          <article className="panel safety-panel-v2">
            <span className="safety-icon"><HeartPulse /></span>
            <span className="eyebrow">BEFORE YOU START</span>
            <h2>Safety is part of form.</h2>
            <p>Photos and instructions cannot assess your joints, load, pain, or medical history. Reduce the range or skip the movement if something feels wrong.</p>
            <ul>
              <li>Warm up for 3–5 minutes.</li>
              <li>Start lighter than you think you need.</li>
              <li>Ask a qualified coach or clinician about persistent pain.</li>
            </ul>
          </article>

          <article className="panel video-side-card">
            <span className="video-side-icon"><Play /></span>
            <div><span className="eyebrow">FORM DEMO</span><h3>{exercise.youtube ? exercise.youtube.title : "Find a trusted tutorial"}</h3></div>
            <p>{exercise.youtube ? `${exercise.youtube.channel} · embedded with privacy-enhanced YouTube` : "Search YouTube for a qualified instructor. Chinnu does not re-host third-party video."}</p>
            {exercise.youtube ? (
              <button className="primary-btn wide" onClick={() => onOpenVideo(exercise.id)}><Play /> Play video</button>
            ) : (
              <a className="primary-btn wide" href={youtubeSearchUrl(exercise)} target="_blank" rel="noreferrer">Search YouTube <ExternalLink /></a>
            )}
          </article>
        </aside>
      </div>

      <section className="related-section">
        <div className="panel-head">
          <div><span className="eyebrow">KEEP EXPLORING</span><h2>Similar movements</h2></div>
          <button className="text-btn" onClick={onBack}>Browse all <ArrowRight /></button>
        </div>
        <div className="related-grid">
          {related.map((item) => (
            <button className="related-card" key={item.id} onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); onOpenExercise(item.id); }}>
              <ExerciseMedia exercise={item} variant="thumb" />
              <div><b>{item.name}</b><small>{regionLabel(item.region)} · {LEVEL_LABEL[item.level]}</small></div>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>

      <p className="attribution-note">
        Exercise data and photos: free-exercise-db (Unlicense / public domain). Video content remains the property of its creator. Chinnu does not provide medical advice.
      </p>
    </div>
  );
}
