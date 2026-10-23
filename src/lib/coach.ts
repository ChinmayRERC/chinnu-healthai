import type { AppData, Targets } from "../types";
import { mealTotals, displayWeight } from "./profile";
import { libraryById } from "./library";

export type CoachSource = "cloud" | "local";

export type CoachReply = { text: string; source: CoachSource };

export type CoachContext = {
  profile: AppData["profile"];
  targets: Targets;
  day: AppData["day"];
  workout: AppData["workout"];
  trainingSessions: AppData["trainingSessions"];
  workoutLogs: AppData["workoutLogs"];
};

export function buildCoachContext(data: AppData, targets: Targets): CoachContext {
  return {
    profile: data.profile,
    targets,
    day: data.day,
    workout: data.workout,
    trainingSessions: data.trainingSessions.slice(0, 8),
    workoutLogs: data.workoutLogs.slice(0, 8),
  };
}

function compactContext(context: CoachContext) {
  const totals = mealTotals(context.day.meals);
  return {
    name: context.profile.name || "there",
    goal: context.profile.goal,
    experience: context.profile.experience,
    equipment: context.profile.equipment,
    targets: {
      calories: context.targets.calories,
      protein: context.targets.protein,
      water: context.targets.water,
      steps: context.targets.steps,
    },
    today: {
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      water: context.day.water,
      steps: context.day.steps,
      sleep: context.day.sleep,
      weight: context.day.weight,
      meals: context.day.meals.map((meal) => `${meal.type}: ${meal.name}`),
    },
    routine: context.workout.map((item) => {
      const exercise = libraryById.get(item.exerciseId);
      return `${exercise?.name || item.exerciseId} ${item.sets}x${item.target}${item.targetType === "seconds" ? "s" : ""}`;
    }),
    recentWorkouts: context.workoutLogs.map((log) => `${log.title} (${Math.round(log.duration / 60)} min)`),
  };
}

const CRISIS =
  "I’m really glad you told me. This needs a person, not an app. If you might act on these thoughts, call your local emergency number now. In India you can call Tele-MANAS on 14416 (24/7) or KIRAN on 1800-599-0019. If you are outside India, use your local emergency service or a crisis line. Please stay with someone you trust and move away from anything you could use to hurt yourself.";

export function screenSafety(text: string): string | null {
  const value = text.toLowerCase();
  if (/(suicide|kill myself|end my life|self[- ]harm|hurt myself|want to die|not want to live)/.test(value)) return CRISIS;
  if (/(chest pain|can't breathe|cannot breathe|fainting|passed out|severe headache|numb on one side|slurred speech)/.test(value)) {
    return "That combination can be an emergency. Stop exercising and call your local emergency number now. Do not drive yourself. This app cannot assess chest pain, breathing difficulty, fainting, or stroke symptoms.";
  }
  if (/(eating disorder|anorexia|bulimia|purge|binge and vomit|starve myself)/.test(value)) {
    return "Thank you for being honest. Food and body concerns deserve qualified, compassionate care, not a calorie target. Please talk with a doctor or a registered dietitian who works with eating disorders. In India, Tele-MANAS (14416) can also help you find mental-health support. I will not give restriction or compensatory-exercise advice.";
  }
  return null;
}

function localReply(text: string, context: CoachContext): string {
  const safety = screenSafety(text);
  if (safety) return safety;
  const value = text.toLowerCase();
  const totals = mealTotals(context.day.meals);
  const remainingCalories = Math.max(0, context.targets.calories - totals.calories);
  const remainingProtein = Math.max(0, context.targets.protein - totals.protein);
  const name = context.profile.name ? `, ${context.profile.name}` : "";
  const water = `${context.day.water}/${context.targets.water} glasses`;
  const steps = `${context.day.steps.toLocaleString()}/${context.targets.steps.toLocaleString()} steps`;
  const routine = context.workout.length
    ? `${context.workout.length} exercises are in your routine`
    : "your routine is empty right now";

  if (/(pain|injur|hurt|sore|knee|back pain|shoulder pain)/.test(value)) {
    return `I can’t diagnose pain or decide whether a movement is safe for you${name}. Stop the movement that causes sharp pain, swelling, numbness, or instability. For persistent pain, see a physiotherapist or doctor. If you want to keep moving gently, choose a comfortable walk or a pain-free range and keep the session short.`;
  }
  if (/(pregnan|postpartum|post-natal|prenatal)/.test(value)) {
    return "Pregnancy and postpartum training needs individual clearance and a provider who knows your history. General guidance: avoid breath-holding and high fall-risk work, keep intensity conversational, and stop for pain, bleeding, dizziness, or fluid leakage. Please ask your obstetrician or a prenatal physio before starting a new plan.";
  }
  if (/(calorie|weight loss|lose weight|fat loss|deficit|diet)/.test(value)) {
    return `Your current target is about ${context.targets.calories} kcal with ${context.targets.protein} g protein. You have logged ${totals.calories} kcal and ${totals.protein} g protein today, so roughly ${remainingCalories} kcal and ${remainingProtein} g protein remain. Aim for a small, sustainable deficit, keep protein at each meal, and avoid dropping below about ${context.profile.gender === "female" ? 1200 : 1500} kcal without medical supervision. Weight trend over 2–3 weeks matters more than one day.`;
  }
  if (/(protein|meal|food|eat|dinner|lunch|breakfast|snack|hungry|craving)/.test(value)) {
    return `You have ${remainingProtein} g protein left today. A simple option: dal or rajma, curd or paneer, plus a roti or rice portion and vegetables. If you are short on time, curd + fruit + nuts, or eggs on toast, works. Log the meal with an estimate; precision can come later. You have ${remainingCalories} kcal left, so choose the portion that fits your hunger rather than skipping meals to “save” calories.`;
  }
  if (/(water|hydrat|drink)/.test(value)) {
    return `You are at ${water}. A practical next step is one glass now and another with your next meal. Pale-yellow urine and thirst are reasonable everyday cues. If you have kidney or heart conditions, follow your clinician’s fluid advice instead of a generic target.`;
  }
  if (/(sleep|tired|recovery|rest|fatigue)/.test(value)) {
    return `You logged ${context.day.sleep || 0} hours of sleep. If you feel drained, keep today’s session lighter: a short walk, easy mobility, or one or two sets instead of chasing a personal best. A consistent wind-down time and less late caffeine usually help more than an extra supplement.`;
  }
  if (/(steps|walk|cardio|run|running)/.test(value)) {
    return `You are at ${steps}. A 10–15 minute walk after a meal is a low-friction way to add movement without turning it into punishment. If running is new, alternate short jogging and walking intervals and increase weekly time gradually.`;
  }
  if (/(workout|exercise|gym|routine|training|plan|beginner|muscle)/.test(value)) {
    const first = context.workout.slice(0, 3).map((item) => libraryById.get(item.exerciseId)?.name).filter(Boolean);
    return `Right now ${routine}${first.length ? `: ${first.join(", ")}` : ""}. For a simple session, do 5–6 exercises: one squat, one hinge, one push, one pull, one press, and a core hold. Use ${context.profile.experience === "beginner" ? "2–3" : "3–4"} sets and leave 1–2 reps in reserve. If you tell me your available equipment, I can suggest a more specific plan.`;
  }
  if (/(motivat|consisten|habit|discipline|lazy|give up)/.test(value)) {
    return "Make the next action embarrassingly small: one glass of water, a 5-minute walk, or one set. Consistency is built from a version of the habit you can repeat on a bad day. Pick a fixed cue—after brushing your teeth, after lunch—and track only whether you showed up, not whether it was perfect.";
  }
  if (/(supplement|creatine|vitamin|whey|bcaa)/.test(value)) {
    return "Food first is the safe default. Whey is simply a convenient protein source if you struggle to meet your target. Creatine monohydrate is well studied for many adults, but check with a clinician if you have kidney disease or take medicines. I would avoid fat burners and unregulated blends. This is general information, not a prescription.";
  }
  if (/(bmi|body fat|weight)/.test(value)) {
    const weight = context.profile.weightKg ? displayWeight(context.profile.weightKg, context.profile.units) : "not set";
    return `Your profile weight is ${weight}. BMI is only a rough screening number and does not measure muscle, body composition, or health. Use the 7-day weight trend alongside energy, sleep, strength, and waist measurements. If weight is changing quickly without trying, or you have other symptoms, speak with a clinician.`;
  }
  return `I can help with food, movement, sleep, hydration, and habits${name}. You have ${remainingCalories} kcal and ${remainingProtein} g protein left today, ${water}, and ${steps}. Try: “Plan a 20-minute home workout”, “What should I eat for dinner?”, or “I’m short on time—what matters most?”`;
}

export function localCoachReply(message: string, context: CoachContext): string {
  return localReply(message, context);
}

export async function askCoach(
  message: string,
  context: CoachContext,
  history: { from: "ai" | "me"; text: string }[] = [],
  allowCloud = true,
): Promise<CoachReply> {
  const safety = screenSafety(message);
  if (safety) return { text: safety, source: "local" };
  if (!allowCloud) return { text: localCoachReply(message, context), source: "local" };

  try {
    const { agent } = await import('./agent');
    const resp = await agent.think(message, compactContext(context), history.slice(-10));
    if (resp.text) {
      return { text: resp.text, source: resp.source };
    }
  } catch {}

  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: compactContext(context),
        history: history.slice(-8),
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error("Coach endpoint unavailable");
    const data = await response.json();
    if (typeof data.text !== "string" || !data.text.trim()) throw new Error("Empty coach response");
    return { text: data.text.trim(), source: "cloud" };
  } catch {
    return { text: localReply(message, context), source: "local" };
  }
}

export function coachOpener(data: AppData, targets: Targets): string {
  const totals = mealTotals(data.day.meals);
  const remaining = Math.max(0, targets.protein - totals.protein);
  if (!data.day.meals.length) {
    return "Start with one real meal and one glass of water. I can help you choose something that fits your target—what do you have at home?";
  }
  if (remaining > 30) {
    return `You have about ${remaining} g of protein left today. Tell me what you have in the kitchen and I’ll suggest a simple option.`;
  }
  if (!data.workout.length) {
    return "Your routine is empty. I can build a short session for your equipment—how much time do you have?";
  }
  return "Your day is taking shape. Ask me about food, training, recovery, or building a habit that survives a busy week.";
}
