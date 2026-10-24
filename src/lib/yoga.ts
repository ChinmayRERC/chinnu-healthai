import { library, type LibraryExercise, regionFor, regionLabel } from "./library";

export type YogaCategory = "flow" | "balance" | "stretch" | "strength" | "breath" | "restorative";

const YOGA_KEYWORDS = [
  "pose",
  "stretch",
  "child",
  "cat",
  "cobra",
  "bridge",
  "pigeon",
  "warrior",
  "triangle",
  "downward",
  "upward",
  "plank",
  "tree",
  "crow",
  "boat",
  "wheel",
  "camel",
  "seated",
  "fold",
  "twist",
  "lunge",
  "chair",
  "dog",
  "child's",
  "happy baby",
  "sphinx",
  "pyramid",
  "locust",
  "bow",
  "hero",
  "lotus",
  "pigeon",
  "side angle",
  "revolved",
  "garland",
  "eagle",
  "half",
  "moon",
];

const YOGA_NAMES = new Set([
  "Child's Pose",
  "Cat Stretch",
  "Cobra",
  "Pelvic Tilt Into Bridge",
  "Downward Dog",
  "Upward Dog",
  "Warrior I",
  "Warrior II",
  "Warrior III",
  "Triangle Pose",
  "Tree Pose",
  "Chair Pose",
  "Crow Pose",
  "Boat Pose",
  "Pigeon Pose",
  "Half Pigeon",
  "Reclining Pigeon Pose",
  "Double Pigeon Pose",
  "Happy Baby",
  "Sphinx Pose",
  "Bow Pose",
  "Camel Pose",
  "Wheel Pose",
  "Urdhva Dhanurasana Wheel Pose",
  "Seated Forward Bend",
  "Pyramid Pose",
  "Side Angle Pose",
  "Extended Side Angle Pose",
  "Revolved Head To Knee",
  "Revolved Side Angle Pose With Prayer Hands",
  "Revolved Side Angle Pose With Prayer Hands Beginner",
  "Gate Pose Variation Arm Extended on Side",
  "Seated Side Bend Pose",
  "Seated Twist",
  "Supine Twist Lying",
  "Eagle Arms Chin Into Chest",
  "Criss Cross Bow Tie Pose",
  "Wide Legged Forward Fall",
  "Crescent Moon Pose",
  "Crescent Moon Pose Quad Stretch",
  "Crescent Moon Pose Quad Stretch With Block",
  "Pyramid Pose Blocks",
  "Pyramid Pose Calf Blocks",
  "Downward Dog Toe To Heel",
  "Walk Your Downward Dog",
  "Downward Dog With Fingers Facing Feet",
  "Child Pose Arms Extended",
  "Child Pose Arms Extended Left Right",
  "Child Pose Arms On Side",
  "Child Pose Elbows On Block",
  "Puppy Pose",
  "One Arm Cow Face Pose",
  "Pyramid Prayer",
  "Yogi Arm Clock",
  "Mountain",
  "Table Top Pose Variation 1",
  "Table Top Pose Variation 2",
  "Table Top Pose Variation 3",
  "Vajrasana Variation 1",
  "Corpse Pose",
  "Easy Pose Neck Stretch",
  "Half Neck Rolls",
  "Half Monkey Pose",
  "Half Lotus",
  "Headstand",
  "One Half Locust",
  "Hug Knees To Chest",
  "Knee To Chest",
  "One Knee To Chest",
]);

function isYoga(exercise: LibraryExercise): boolean {
  if (YOGA_NAMES.has(exercise.name)) return true;
  const text = `${exercise.name} ${exercise.primaryMuscles.join(" ")} ${exercise.secondaryMuscles.join(" ")}`.toLowerCase();
  if (exercise.category === "stretching" && /pose|yoga/.test(text)) return true;
  if (YOGA_KEYWORDS.some((k) => text.includes(k))) {
    if (exercise.category === "stretching" || exercise.category === "strength" || exercise.category === "cardio") {
      return true;
    }
  }
  if (/wheel pose|urdhva dhanurasana|child's pose|sphinx|pigeon|downward dog|cobra pose/i.test(exercise.name)) return true;
  return false;
}

export function getYogaLibrary(): LibraryExercise[] {
  const yoga = library.filter(isYoga);
  const seen = new Set<string>();
  const unique = yoga.filter((ex) => {
    if (seen.has(ex.name)) return false;
    seen.add(ex.name);
    return true;
  });
  return unique.sort((a, b) => {
    const priority = (ex: LibraryExercise) => {
      if (/warrior|tree|downward dog|cat|cobra|child|bridge|pigeon/i.test(ex.name)) return 4;
      if (/flow|sun|salute/i.test(ex.name)) return 3;
      if (/balance|tree|crow|eagle|warrior iii/i.test(ex.name)) return 3;
      if (/rest|corpse|child/i.test(ex.name)) return 1;
      return 2;
    };
    return priority(b) - priority(a) || a.name.localeCompare(b.name);
  });
}

export const yogaLibrary = getYogaLibrary();

export const YOGA_FOCUSES = [
  { id: "all", label: "All", desc: "Full library" },
  { id: "flow", label: "Flow", desc: "Sun salutations" },
  { id: "balance", label: "Balance", desc: "Stability & focus" },
  { id: "strength", label: "Strength", desc: "Core & power" },
  { id: "stretch", label: "Stretch", desc: "Flexibility" },
  { id: "restorative", label: "Restorative", desc: "Calm & restore" },
] as const;

export function categorizeYoga(exercise: LibraryExercise): YogaCategory {
  const name = exercise.name.toLowerCase();
  if (/corpse|rest|savasana|child.*rest|reclining/i.test(name)) return "restorative";
  if (/tree|crow|eagle|warrior iii|balance/i.test(name)) return "balance";
  if (/plank|boat|wheel|bow|locust|chair|warrior/i.test(name) && /hold|strength/i.test(name + exercise.category)) return "strength";
  if (/flow|salute|sun/i.test(name)) return "flow";
  if (/stretch|fold|twist|pigeon|hamstring|hip/i.test(name) && exercise.category === "stretching") return "stretch";
  if (exercise.category === "stretching") return "stretch";
  return "flow";
}

export function filterYoga(filters: { query?: string; focus?: string; muscle?: string; level?: string }) {
  let results = yogaLibrary;
  const { query, focus, muscle, level } = filters;
  if (focus && focus !== "all") {
    results = results.filter((ex) => categorizeYoga(ex) === focus);
  }
  if (muscle) {
    results = results.filter((ex) => [...ex.primaryMuscles, ...ex.secondaryMuscles].some((m) => regionFor(m) === muscle));
  }
  if (level) results = results.filter((ex) => ex.level === level);
  if (query) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    results = results.filter((ex) => {
      const haystack = `${ex.name} ${ex.primaryMuscles.join(" ")} ${ex.secondaryMuscles.join(" ")}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }
  return results;
}

export function yogaRegionLabel(exercise: LibraryExercise): string {
  const cat = categorizeYoga(exercise);
  const labels = {
    flow: "Flow",
    balance: "Balance",
    stretch: "Stretch",
    strength: "Strength",
    breath: "Breath",
    restorative: "Restorative",
  };
  return labels[cat];
}
