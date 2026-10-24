import { ANATOMY } from "./data/anatomyAssets";
import type { Gender } from "./types";

type View = "Front" | "Back";

/**
 * Muscle map geometry adapted from react-native-body-highlighter 3.2.0 (MIT).
 * Copyright (c) 2022 ELABBASSI Hicham. See THIRD_PARTY_NOTICES.md.
 */

/* Dataset slugs map onto the muscle regions used by the exercise library. */
const REGION_BY_SLUG: Record<string, string> = {
  chest: "Chest",
  biceps: "Biceps",
  triceps: "Triceps",
  forearm: "Forearms",
  deltoids: "Shoulders",
  trapezius: "Shoulders",
  obliques: "Core",
  abs: "Core",
  "upper-back": "Lower back",
  "lower-back": "Lower back",
  gluteal: "Glutes",
  quadriceps: "Quads",
  adductors: "Quads",
  hamstring: "Hamstrings",
  calves: "Calves",
  tibialis: "Calves",
};

/* Structural parts keep the dark silhouette look of the reference charts. */
const STRUCTURAL = new Set(["head", "hair", "neck", "hands", "feet", "ankles", "knees"]);

const CHART_KEY = {
  male: { Front: "maleFront", Back: "maleBack" },
  female: { Front: "femaleFront", Back: "femaleBack" },
} as const;

export default function AnatomyFigure({
  gender,
  view,
  selected,
  onSelect,
  compact = false,
}: {
  gender: Gender;
  view: View;
  selected?: string;
  onSelect?: (muscle: string) => void;
  compact?: boolean;
}) {
  const chart = ANATOMY[CHART_KEY[gender][view]];
  const interactive = Boolean(onSelect);

  const structural: string[] = [];
  const regions = new Map<string, string[]>();

  for (const part of chart.parts) {
    const paths = [...part.common, ...part.left, ...part.right];
    if (STRUCTURAL.has(part.slug)) {
      structural.push(...paths);
      continue;
    }
    const region = REGION_BY_SLUG[part.slug];
    if (!region) {
      structural.push(...paths);
      continue;
    }
    const bucket = regions.get(region) ?? [];
    bucket.push(...paths);
    regions.set(region, bucket);
  }

  return (
    <svg
      className={`anatomy-figure ${gender} ${view.toLowerCase()}${compact ? " compact" : ""}`}
      viewBox={chart.viewBox}
      role="img"
      aria-label={`${gender} ${view.toLowerCase()} anatomical muscle chart`}
    >
      <path className="anatomy-base" d={chart.outline} aria-hidden="true" />

      <g className="anatomy-body" aria-hidden="true">
        {structural.map((d, index) => (
          <path key={`s${index}`} d={d} />
        ))}
      </g>

      {[...regions.entries()].map(([region, paths]) => {
        const active = selected === region;
        return (
          <g
            key={region}
            className={`anatomy-region${active ? " selected" : ""}${interactive ? " interactive" : ""}`}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-pressed={interactive ? active : undefined}
            aria-label={interactive ? `${active ? "Clear" : "Select"} ${region}` : undefined}
            onClick={() => onSelect?.(active ? "" : region)}
            onKeyDown={(event) => {
              if (interactive && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect?.(active ? "" : region);
              }
            }}
          >
            <title>{region}</title>
            {paths.map((d, index) => (
              <path key={`${region}${index}`} d={d} />
            ))}
          </g>
        );
      })}

      <path className="anatomy-outline" d={chart.outline} aria-hidden="true" />
    </svg>
  );
}
