import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { exercises } from "./exercises";
import type { Gender } from "./types";
import AnatomyFigure from "./AnatomyFigure";

type View = "Front" | "Back";
export default function MuscleMap({ selected, onSelect, gender }: { selected: string; onSelect: (value: string) => void; gender: Gender }) {
  const [view, setView] = useState<View>("Front");
  return <article className="muscle-card"><div className="muscle-copy"><span className="eyebrow">INTERACTIVE {gender.toUpperCase()} MUSCLE MAP</span><h2>Choose where you want to work.</h2><p>Tap a muscle region on the detailed front or back view. The map filters supported movements and is not an anatomy or pain assessment.</p><div className="segmented"><button className={view === "Front" ? "active" : ""} aria-pressed={view === "Front"} onClick={() => setView("Front")}>Front</button><button className={view === "Back" ? "active" : ""} aria-pressed={view === "Back"} onClick={() => setView("Back")}>Back</button></div>{selected ? <div className="muscle-summary"><small>SELECTED</small><h3>{selected}</h3><b>{exercises.filter(e => e.muscles.includes(selected)).length} matching practices</b><button onClick={() => onSelect("")}><RotateCcw/>Clear filter</button></div> : <div className="muscle-summary anatomy-hint"><small>SELECT A REGION</small><h3>Front and back muscles</h3><p>Every shaded muscle is interactive. Coral circles mark major joints for orientation.</p></div>}</div><div className={`body-map detailed ${gender}`}><AnatomyFigure gender={gender} view={view} selected={selected} onSelect={onSelect}/><button className="body-flip" onClick={() => setView(view === "Front" ? "Back" : "Front")} aria-label={`Show ${view === "Front" ? "back" : "front"} body view`}><AnatomyFigure gender={gender} view={view === "Front" ? "Back" : "Front"} compact/><span>{view === "Front" ? "Back" : "Front"}</span></button></div></article>;
}
