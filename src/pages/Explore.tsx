import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import AnatomyFigure from "../AnatomyFigure";
import ExerciseMedia from "../components/ExerciseMedia";
import { useStore } from "../lib/store";
import type { Gender } from "../types";
import {
  filterLibrary,
  FLAGSHIP_IDS,
  library,
  LEVEL_LABEL,
  MUSCLE_REGIONS,
  regionLabel,
  regionFor,
  type LibraryExercise,
} from "../lib/library";

const EQUIPMENT_FILTERS = [
  ["", "Any equipment"],
  ["body only", "Bodyweight"],
  ["dumbbell", "Dumbbell"],
  ["barbell", "Barbell"],
  ["machine", "Machine"],
  ["cable", "Cable"],
  ["bands", "Bands"],
  ["kettlebells", "Kettlebell"],
] as const;

const PAGE_SIZE = 24;

export default function Explore({
  onOpenExercise,
  onOpenVideo,
}: {
  onOpenExercise: (id: string) => void;
  onOpenVideo: (id: string) => void;
}) {
  const { data } = useStore();
  const [muscle, setMuscle] = useState("");
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState("");
  const [level, setLevel] = useState("");
  const [bodyGender, setBodyGender] = useState<Gender>(data.profile.gender || "male");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => filterLibrary({ muscle, query, equipment, level }), [muscle, query, equipment, level]);
  const ordered = useMemo(() => {
    const priority = (exercise: LibraryExercise) =>
      FLAGSHIP_IDS.includes(exercise.id) ? 2 : exercise.trackedId ? 1 : 0;
    return [...filtered].sort((a, b) => priority(b) - priority(a) || a.name.localeCompare(b.name));
  }, [filtered]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [muscle, query, equipment, level]);

  const shown = ordered.slice(0, visible);
  const videoExercises = useMemo(
    () => library.filter((exercise) => FLAGSHIP_IDS.includes(exercise.id)).slice(0, 10),
    [],
  );

  function chooseRegion(value: string) {
    if (value === "Obliques") value = "Core";
    setMuscle((current) => (current === value ? "" : value));
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }

  function clearFilters() {
    setMuscle("");
    setQuery("");
    setEquipment("");
    setLevel("");
  }

  const hasFilters = !!(muscle || query || equipment || level);

  return (
    <div className="page explore-page">
      <section className="explore-hero">
        <div className="explore-copy">
          <span className="eyebrow"><Sparkles /> THE MOVEMENT LIBRARY</span>
          <h1>Find a movement<br /><em>that fits your day.</em></h1>
          <p>{library.length} exercises with clear photos, simple instructions, and equipment filters. Start with a video demo or tap a body area.</p>
          <label className="explore-search">
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercise or muscle" aria-label="Search exercises" />
            {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X /></button>}
          </label>
          <div className="explore-meta">
            <span><b>{filtered.length}</b> matching exercises</span>
            <span><b>{FLAGSHIP_IDS.length}</b> video demos</span>
            <span><b>{library.filter((exercise) => exercise.trackedId).length}</b> camera-guided</span>
          </div>
        </div>
        <div className="explore-body-card">
          <div className="body-toggle" role="group" aria-label="Choose anatomy figure">
            <button className={bodyGender === "male" ? "active" : ""} aria-pressed={bodyGender === "male"} onClick={() => setBodyGender("male")}>Male</button>
            <button className={bodyGender === "female" ? "active" : ""} aria-pressed={bodyGender === "female"} onClick={() => setBodyGender("female")}>Female</button>
          </div>
          <div className="anatomy-pair">
            <div className="anatomy-view">
              <span>Front</span>
              <AnatomyFigure gender={bodyGender} view="Front" selected={muscle} onSelect={chooseRegion} />
            </div>
            <div className="anatomy-view">
              <span>Back</span>
              <AnatomyFigure gender={bodyGender} view="Back" selected={muscle} onSelect={chooseRegion} />
            </div>
          </div>
          <div className="body-card-footer">
            <small>{muscle ? `Showing ${regionLabel(muscle)}` : "Tap a muscle to filter"}</small>
            {muscle && <button onClick={() => setMuscle("")}>Clear <X /></button>}
          </div>
        </div>
      </section>

      <section className="video-strip-section">
        <div className="panel-head">
          <div><span className="eyebrow">VERIFIED IN-APP DEMOS</span><h2>Watch before you try</h2></div>
          <span className="video-strip-note"><Video /> {FLAGSHIP_IDS.length} flagship videos</span>
        </div>
        <div className="video-strip">
          {videoExercises.map((exercise) => (
            <button key={exercise.id} className="video-strip-card" onClick={() => onOpenVideo(exercise.id)}>
              <div className="video-strip-image">
                <img src={exercise.imageUrls[0]} alt="" loading="lazy" />
                <span><Play /></span>
              </div>
              <b>{exercise.name}</b>
              <small>{regionLabel(exercise.region)}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="library-section" ref={resultsRef}>
        <div className="library-toolbar">
          <div className="muscle-chips" role="group" aria-label="Filter by muscle region">
            <button className={!muscle ? "active" : ""} onClick={() => setMuscle("")}>All</button>
            {MUSCLE_REGIONS.map((region) => (
              <button key={region} className={muscle === region ? "active" : ""} onClick={() => setMuscle(muscle === region ? "" : region)}>
                {regionLabel(region)}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <label className="select-wrap">
              <Filter />
              <select value={equipment} onChange={(event) => setEquipment(event.target.value)} aria-label="Filter by equipment">
                {EQUIPMENT_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDown />
            </label>
            <label className="select-wrap">
              <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filter by level">
                <option value="">Any level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Advanced</option>
              </select>
              <ChevronDown />
            </label>
            {hasFilters && <button className="text-btn" onClick={clearFilters}><RotateCcw /> Clear filters</button>}
          </div>
        </div>

        {shown.length ? (
          <>
            <div className="library-grid">
              {shown.map((exercise) => (
                <button className="library-card" key={exercise.id} onClick={() => onOpenExercise(exercise.id)}>
                  <ExerciseMedia exercise={exercise} variant="card" />
                  <div className="library-card-body">
                    <div className="card-badges">
                      <span>{regionLabel(exercise.region)}</span>
                      {exercise.youtube && <span className="video-badge"><Play /> Video</span>}
                      {exercise.trackedId && <span className="camera-badge">Camera</span>}
                    </div>
                    <h3>{exercise.name}</h3>
                    <p>{exercise.primaryMuscles.slice(0, 2).map(regionFor).join(" · ")}{exercise.secondaryMuscles.length ? ` + ${exercise.secondaryMuscles.length}` : ""}</p>
                    <footer>
                      <span>{LEVEL_LABEL[exercise.level]}</span>
                      <span>{exercise.equipment === "body only" ? "Bodyweight" : exercise.equipment}</span>
                      <ArrowRight />
                    </footer>
                  </div>
                </button>
              ))}
            </div>
            <div className="load-more-row">
              <p>Showing {shown.length} of {ordered.length} exercises</p>
              {visible < ordered.length && <button className="soft-btn" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Load more <ArrowRight /></button>}
            </div>
          </>
        ) : (
          <div className="empty-state large">
            <Search />
            <h3>No exercises match those filters.</h3>
            <p>Try a different muscle, equipment type, or a simpler search.</p>
            <button className="primary-btn" onClick={clearFilters}>Reset filters</button>
          </div>
        )}
      </section>
    </div>
  );
}
