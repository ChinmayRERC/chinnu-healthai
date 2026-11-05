import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  ChevronDown,
  Filter,
  Flower2,
  HeartPulse,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Wind,
  X,
} from "lucide-react";
import ExerciseMedia from "../components/ExerciseMedia";
import { useStore } from "../lib/store";
import { useLocale } from "../lib/locale";
import {
  categorizeYoga,
  filterYoga,
  getYogaLibrary,
  yogaLibrary,
  YOGA_FOCUSES,
  yogaRegionLabel,
} from "../lib/yoga";
import { library, LEVEL_LABEL, MUSCLE_REGIONS, regionLabel, trackedExerciseFor } from "../lib/library";
import type { LibraryExercise } from "../lib/library";

const EQUIPMENT_FILTERS = [
  ["", "Any"],
  ["body only", "Bodyweight"],
  ["foam roll", "Foam roll"],
  ["exercise ball", "Stability ball"],
  ["other", "Props"],
] as const;

const PAGE_SIZE = 24;

export default function Yoga({
  onOpenExercise,
  onOpenVideo,
  onStartTrainer,
}: {
  onOpenExercise: (id: string) => void;
  onOpenVideo: (id: string) => void;
  onStartTrainer: (id: string) => void;
}) {
  const { data } = useStore();
  const { tr } = useLocale();
  const [focus, setFocus] = useState<string>("all");
  const [muscle, setMuscle] = useState("");
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState("");
  const [level, setLevel] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allYoga = useMemo(() => getYogaLibrary(), []);
  const filtered = useMemo(() => {
    let results = filterYoga({ query, focus, muscle, level });
    if (equipment) results = results.filter((ex) => ex.equipment === equipment);
    return results;
  }, [query, focus, muscle, level, equipment]);

  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [focus, muscle, query, equipment, level]);

  const shown = ordered.slice(0, visible);
  const featured = useMemo(() => {
    const picks = ["Downward Dog", "Warrior II", "Tree Pose", "Pigeon Pose", "Child's Pose", "Cobra Pose", "Urdhva Dhanurasana Wheel Pose"];
    const found = picks.map((name) => allYoga.find((ex) => ex.name === name)).filter(Boolean) as LibraryExercise[];
    if (found.length >= 4) return found.slice(0, 6);
    return allYoga.slice(0, 6);
  }, [allYoga]);

  function clearFilters() {
    setFocus("all");
    setMuscle("");
    setQuery("");
    setEquipment("");
    setLevel("");
  }

  const hasFilters = !!(focus !== "all" || muscle || query || equipment || level);

  return (
    <div className="page yoga-page">
      <section className="yoga-hero">
        <div className="yoga-hero-copy">
            <span className="eyebrow">
            <Flower2 /> {tr("YOGA · MOBILITY · BREATH")}
          </span>
          <h1>
            {tr("Flow with intention,")}
            <br />
            <em>{tr("move with ease.")}</em>
          </h1>
          <p>{tr("A calm library of yoga, mobility and stretching. Focus on form, hold with control, and build consistency — one breath at a time.")} {yogaLibrary.length} {tr("poses curated for your practice.")}</p>
          <label className="explore-search yoga-search">
            <Search />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Search pose or muscle")} aria-label={tr("Search yoga poses")} />
            {query && <button onClick={() => setQuery("")} aria-label={tr("Clear search")}><X /></button>}
          </label>
          <div className="yoga-meta">
            <span><b>{allYoga.length}</b> {tr("poses")}</span>
            <span><b>{YOGA_FOCUSES.filter((f) => f.id !== "all").length}</b> {tr("focuses")}</span>
            <span><b>{allYoga.filter((ex) => ex.category === "stretching").length}</b> {tr("stretches")}</span>
          </div>
        </div>
        <div className="yoga-hero-panel">
          <div className="yoga-panel-head">
            <div>
              <span className="eyebrow"><Wind /> {tr("PRACTICE PRINCIPLES")}</span>
              <h3>{tr("Flow smarter")}</h3>
            </div>
            <HeartPulse />
          </div>
          <div className="yoga-principles">
            <article>
              <b>01</b>
              <div>
                <strong>{tr("Breathe first")}</strong>
                <p>{tr("Move with your breath, not against it. Inhale to lengthen, exhale to deepen.")}</p>
              </div>
            </article>
            <article>
              <b>02</b>
              <div>
                <strong>{tr("Go easy")}</strong>
                <p>{tr("Use props, modify ranges, and never force a shape. Stability beats depth.")}</p>
              </div>
            </article>
            <article>
              <b>03</b>
              <div>
                <strong>{tr("Listen in")}</strong>
                <p>{tr("Sharp pain, numbness or dizziness = stop and adjust. Safety is part of practice.")}</p>
              </div>
            </article>
          </div>
          <div className="yoga-panel-footer">
            <span><Camera /> {tr("Form guidance available on select poses")}</span>
          </div>
        </div>
      </section>

      <section className="yoga-focus-section">
        <div className="panel-head">
          <div>
            <span className="eyebrow">{tr("CHOOSE YOUR FOCUS")}</span>
            <h2>{tr("Practice by intention")}</h2>
          </div>
        </div>
        <div className="yoga-focus-grid">
          {YOGA_FOCUSES.map((f) => (
            <button key={f.id} className={`yoga-focus-card ${focus === f.id ? "active" : ""}`} onClick={() => setFocus(focus === f.id && f.id !== "all" ? "all" : f.id)}>
              <div>
                <b>{tr(f.label)}</b>
                <p>{tr(f.desc)}</p>
              </div>
              {focus === f.id && <Sparkles />}
            </button>
          ))}
        </div>
      </section>

      <section className="yoga-featured">
        <div className="panel-head">
          <div>
            <span className="eyebrow">{tr("START HERE")}</span>
            <h2>{tr("Foundational poses")}</h2>
          </div>
        </div>
        <div className="yoga-featured-grid">
          {featured.map((ex) => (
            <button key={ex.id} className="yoga-featured-card" onClick={() => onOpenExercise(ex.id)}>
              <ExerciseMedia exercise={ex} variant="thumb" />
              <div>
                <b>{ex.name}</b>
              <small>{tr(yogaRegionLabel(ex))} · {tr(ex.equipment === "body only" ? "Bodyweight" : ex.equipment)}</small>
              </div>
              <ArrowRight />
            </button>
          ))}
        </div>
      </section>

      <section className="library-section yoga-library" ref={resultsRef}>
        <div className="library-toolbar">
          <div className="muscle-chips" role="group" aria-label={tr("Filter by muscle region")}>
            <button className={!muscle ? "active" : ""} onClick={() => setMuscle("")}>{tr("All muscles")}</button>
            {MUSCLE_REGIONS.map((region) => (
              <button key={region} className={muscle === region ? "active" : ""} onClick={() => setMuscle(muscle === region ? "" : region)}>
                {tr(regionLabel(region))}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <label className="select-wrap">
              <Filter />
              <select value={equipment} onChange={(e) => setEquipment(e.target.value)} aria-label={tr("Filter by props")}>
                {EQUIPMENT_FILTERS.map(([v, l]) => (
                  <option key={v} value={v}>{tr(l)}</option>
                ))}
              </select>
              <ChevronDown />
            </label>
            <label className="select-wrap">
              <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label={tr("Filter by level")}>
                <option value="">{tr("Any level")}</option>
                <option value="beginner">{tr("Beginner")}</option>
                <option value="intermediate">{tr("Intermediate")}</option>
                <option value="expert">{tr("Advanced")}</option>
              </select>
              <ChevronDown />
            </label>
            {hasFilters && (
              <button className="text-btn" onClick={clearFilters}>
                <RotateCcw /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="panel-head">
          <div>
            <span className="eyebrow">{tr("POSE LIBRARY")}</span>
            <h2>{filtered.length} poses</h2>
          </div>
          <span className="video-strip-note">
            <Flower2 /> Breath-led practice
          </span>
        </div>

        {shown.length ? (
          <>
            <div className="library-grid yoga-grid">
              {shown.map((ex) => {
                const tracked = trackedExerciseFor(ex.id);
                return (
                  <button className="library-card yoga-card" key={ex.id} onClick={() => onOpenExercise(ex.id)}>
                    <ExerciseMedia exercise={ex} variant="card" />
                    <div className="library-card-body">
                      <div className="card-badges">
                        <span>{yogaRegionLabel(ex)}</span>
                        {ex.category === "stretching" && <span>{tr("Stretch")}</span>}
                        {tracked && <span className="camera-badge">{tr("Camera")}</span>}
                      </div>
                      <h3>{ex.name}</h3>
                      <p>{ex.primaryMuscles.slice(0, 2).map(regionLabel).join(" · ")}{ex.secondaryMuscles.length ? ` + ${ex.secondaryMuscles.length}` : ""}</p>
                      <footer>
                        <span>{LEVEL_LABEL[ex.level]}</span>
                        <span>{tr(ex.equipment === "body only" ? "Bodyweight" : ex.equipment)}</span>
                        <ArrowRight />
                      </footer>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="load-more-row">
              <p>Showing {shown.length} of {ordered.length} poses</p>
              {visible < ordered.length && (
                <button className="soft-btn" onClick={() => setVisible((c) => c + PAGE_SIZE)}>
                  Load more <ArrowRight />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state large">
            <Search />
            <h3>{tr("No poses match those filters")}</h3>
            <p>{tr("Try a different focus, muscle, or search term.")}</p>
            <button className="primary-btn" onClick={clearFilters}>{tr("Reset filters")}</button>
          </div>
        )}
      </section>
    </div>
  );
}
