import { useState } from "react";
import { Dumbbell, Play } from "lucide-react";
import type { LibraryExercise } from "../lib/library";
import videoManifest from "../data/videoManifest.json";

type MediaVariant = "card" | "hero" | "thumb" | "player";

export default function ExerciseMedia({
  exercise,
  variant = "card",
  className = "",
}: {
  exercise: LibraryExercise;
  variant?: MediaVariant;
  className?: string;
  autoAlternate?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoSrc = (videoManifest as Record<string, string>)[exercise.id];
  const first = exercise.imageUrls[0];
  const second = exercise.imageUrls[1] || first;

  if (!first || broken) {
    return (
      <div className={`exercise-media fallback ${variant} ${className}`} aria-label={`${exercise.name} illustration unavailable`}>
        <Dumbbell />
        <span>{exercise.name}</span>
      </div>
    );
  }

  if (videoSrc && !videoFailed) {
    return (
      <div className={`exercise-media ${variant} has-video ${className}`}>
        <video
          src={videoSrc}
          poster={first}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onError={() => setVideoFailed(true)}
          aria-label={`${exercise.name} demonstration video`}
        />
        <span className="media-badge"><Play /> Video demo</span>
      </div>
    );
  }

  return (
    <div
      className={`exercise-media ${variant} ${second !== first ? "gif-loop" : ""} ${className}`}
    >
      <img src={first} alt={`${exercise.name} starting position`} loading="lazy" decoding="async" onError={() => setBroken(true)} />
      <img
        src={second}
        alt={`${exercise.name} end position`}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
      {exercise.youtube && (
        <span className="media-badge"><Play /> Demo</span>
      )}
    </div>
  );
}
