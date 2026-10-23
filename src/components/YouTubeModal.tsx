import { useEffect } from "react";
import { ExternalLink, Search, Video, X } from "lucide-react";
import type { LibraryExercise } from "../lib/library";

export function youtubeSearchUrl(exercise: LibraryExercise): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} proper form tutorial`)}`;
}

export default function YouTubeModal({ exercise, onClose }: { exercise: LibraryExercise; onClose: () => void }) {
  const demo = exercise.youtube;
  const embed = demo
    ? `https://www.youtube-nocookie.com/embed/${demo.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : "";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop video-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="video-modal" role="dialog" aria-modal="true" aria-label={`${exercise.name} video demonstration`}>
        <button className="modal-close" onClick={onClose} aria-label="Close video">
          <X />
        </button>
        <div className="video-head">
          <span className="modal-mark"><Video /></span>
          <div>
            <span className="eyebrow">VIDEO DEMONSTRATION</span>
            <h2>{exercise.name}</h2>
            {demo ? (
              <p>{demo.title} · {demo.channel}</p>
            ) : (
              <p>No verified in-app video yet. Search YouTube for a form tutorial.</p>
            )}
          </div>
        </div>
        {demo ? (
          <div className="video-frame">
            <iframe
              src={embed}
              title={`${exercise.name}: ${demo.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="video-search-panel">
            <Search />
            <h3>Find a demonstration</h3>
            <p>YouTube search opens in a new tab. Choose a qualified instructor and stop if anything hurts.</p>
            <a className="primary-btn" href={youtubeSearchUrl(exercise)} target="_blank" rel="noreferrer">
              Search YouTube <ExternalLink />
            </a>
          </div>
        )}
        <div className="video-footer">
          <small>
            {demo
              ? "Embedded with YouTube's privacy-enhanced player. Content belongs to its creator."
              : "Chinnu does not re-host third-party videos."}
          </small>
          {demo && (
            <a href={`https://www.youtube.com/watch?v=${demo.id}`} target="_blank" rel="noreferrer">
              Watch on YouTube <ExternalLink />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
