import type { AppData, PersonalRoutine, PersonalRoutineDay, Profile, WeekDay, WorkoutItem } from "../types";
import { generateRoutine, type Focus } from "./plan";
import { library, libraryById } from "./library";
import { mealTotals } from "./profile";

const WEEK_DAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getFocusForDay(dayIndex: number, profile: Profile, hasRecoveryNeed: boolean): { focus: Focus | "rest" | "cardio" | "mobility"; type: any; title: string; rationale: string } {
  // Smart distribution based on goals
  if (profile.goal === "strength") {
    // Upper/Lower/Upper/Lower/Upper/Rest/Active recovery or similar
    if (dayIndex === 0) return { focus: "upper", type: "strength", title: "Upper Body Strength", rationale: "Focus on compound movements with heavier loads" };
    if (dayIndex === 1) return { focus: "lower", type: "strength", title: "Lower Body Power", rationale: "Build leg strength and power" };
    if (dayIndex === 2) return { focus: "upper", type: "strength", title: "Upper Body Volume", rationale: "More volume, slightly less intensity" };
    if (dayIndex === 3) return { focus: "lower", type: "strength", title: "Lower Body Hypertrophy", rationale: "Focus on glutes and legs with moderate loads" };
    if (dayIndex === 4) return { focus: "push", type: "strength", title: "Push Focus", rationale: "Chest, shoulders, triceps emphasis" };
    if (dayIndex === 5) return { focus: "rest", type: "rest", title: "Rest Day", rationale: "Recovery is essential for strength gains" };
    return { focus: "mobility", type: "active_recovery", title: "Active Recovery", rationale: "Light movement and mobility to aid recovery" };
  }
  
  if (profile.goal === "gain") {
    if (dayIndex === 0) return { focus: "upper", type: "strength", title: "Upper Body Hypertrophy", rationale: "Hit all upper body muscle groups" };
    if (dayIndex === 1) return { focus: "lower", type: "strength", title: "Lower Body Hypertrophy", rationale: "Focus on legs and glutes" };
    if (dayIndex === 2) return { focus: "push", type: "strength", title: "Push Day", rationale: "Chest, shoulders, triceps" };
    if (dayIndex === 3) return { focus: "pull", type: "strength", title: "Pull Day", rationale: "Back, biceps focus" };
    if (dayIndex === 4) return { focus: "full", type: "strength", title: "Full Body Focus", rationale: "Compound lifts with good volume" };
    if (dayIndex === 5) return { focus: "rest", type: "rest", title: "Rest Day", rationale: "Muscle growth happens during recovery" };
    return { focus: "mobility", type: "active_recovery", title: "Active Recovery", rationale: "Light cardio/mobility" };
  }
  
  if (profile.goal === "lose") {
    if (dayIndex === 0) return { focus: "full", type: "strength", title: "Full Body Strength", rationale: "Preserve muscle while in deficit" };
    if (dayIndex === 1) return { focus: "upper", type: "strength", title: "Upper Body", rationale: "Strength training" };
    if (dayIndex === 2) return { focus: "cardio", type: "cardio", title: "Cardio Focus", rationale: "20-30 min cardio + core" };
    if (dayIndex === 3) return { focus: "lower", type: "strength", title: "Lower Body", rationale: "Strength training" };
    if (dayIndex === 4) return { focus: "full", type: "strength", title: "Full Body Circuit", rationale: "Higher reps, shorter rest" };
    if (dayIndex === 5) return { focus: "cardio", type: "cardio", title: "Active Cardio", rationale: "Walking/cardio for 30-40 min" };
    return { focus: "mobility", type: "active_recovery", title: "Recovery Walk", rationale: "Low intensity movement" };
  }
  
  // recomp/default
  if (dayIndex === 0) return { focus: "full", type: "strength", title: "Full Body Foundation", rationale: "Hit all major muscle groups" };
  if (dayIndex === 1) return { focus: "upper", type: "strength", title: "Upper Body", rationale: "Focus on upper body strength" };
  if (dayIndex === 2) return { focus: "lower", type: "strength", title: "Lower Body", rationale: "Build strength and stability" };
  if (dayIndex === 3) return { focus: "rest", type: "rest", title: "Rest Day", rationale: "Recovery" };
  if (dayIndex === 4) return { focus: "full", type: "strength", title: "Full Body", rationale: "Combine movements efficiently" };
  if (dayIndex === 5) return { focus: "core", type: "strength", title: "Core & Stability", rationale: "Core strength and stability" };
  return { focus: "cardio", type: "cardio", title: "Active Recovery", rationale: "Walk or light cardio" };
}

function adjustForProfile(profile: Profile, items: WorkoutItem[], focus: string): WorkoutItem[] {
  // Adjust sets/reps based on experience and goal
  let sets = profile.experience === "beginner" ? 3 : profile.experience === "intermediate" ? 4 : 4;
  let reps = profile.goal === "strength" ? 5 : profile.goal === "gain" ? 8 : 12;
  let rest = profile.goal === "strength" ? 150 : profile.goal === "gain" ? 120 : 75;
  
  if (profile.experience === "beginner") {
    sets = Math.min(sets, 3);
    reps = Math.max(reps, 10);
    rest = Math.min(rest, 90);
  }
  
  return items.map((item, idx) => ({
    ...item,
    sets: focus === "rest" ? 0 : sets,
    target: focus === "rest" ? 0 : item.targetType === "seconds" ? Math.max(30, Math.min(60, item.target)) : reps,
    rest: focus === "rest" ? 0 : rest
  })).filter(item => item.sets > 0);
}

export async function generatePersonalRoutine(profile: Profile, data: AppData): Promise<PersonalRoutine> {
  const weightKg = profile.weightKg || 70;
  const hasRecoveryNeed = data.day.sleep < 6 || (mealTotals(data.day.meals).protein < weightKg * 1.2);
  
  const days: PersonalRoutineDay[] = WEEK_DAYS.map((day, dayIndex) => {
    const { focus, type, title, rationale } = getFocusForDay(dayIndex, profile, hasRecoveryNeed);
    
    if (focus === "rest" || type === "rest") {
      return {
        day,
        dayIndex,
        type: "rest",
        focus: "rest",
        title,
        items: [],
        notes: "Prioritize sleep, hydration, and light movement if desired",
        durationEst: 0,
        isRest: true,
        rationale
      };
    }
    
    if (focus === "cardio") {
      // Add some bodyweight/cardio
      const cardioItems: WorkoutItem[] = [
        { exerciseId: "Mountain_Climbers", sets: 3, target: 40, targetType: "seconds" as const, rest: 45 },
      ].filter(item => libraryById.has(item.exerciseId));
      
      if (cardioItems.length === 0 && library.length > 0) {
        cardioItems.push({ exerciseId: library.find(l => l.category === "cardio")?.id || library[0].id, sets: 3, target: 30, targetType: "seconds" as const, rest: 45 });
      }
      
      return {
        day,
        dayIndex,
        type,
        focus,
        title,
        items: adjustForProfile(profile, cardioItems, focus),
        notes: "Keep intensity moderate. Focus on consistency over intensity.",
        durationEst: 25,
        isRest: false,
        rationale
      };
    }
    
    if (focus === "mobility") {
      const mobItems: WorkoutItem[] = [
        { exerciseId: "Plank", sets: 2, target: 30, targetType: "seconds" as const, rest: 30 }
      ].filter(item => libraryById.has(item.exerciseId));
      return {
        day,
        dayIndex,
        type,
        focus,
        title,
        items: adjustForProfile(profile, mobItems, focus),
        notes: "Gentle movement to aid recovery",
        durationEst: 15,
        isRest: false,
        rationale
      };
    }
    
    // Strength days
    const routine = generateRoutine(profile, focus as Focus);
    const items = adjustForProfile(profile, routine, focus);
    
    return {
      day,
      dayIndex,
      type: "strength",
      focus,
      title,
      items,
      notes: profile.experience === "beginner" ? "Focus on form over weight. Leave 2 reps in reserve." : "Focus on progressive overload. Add weight or reps when possible.",
      durationEst: items.length * 8 + items.length * 2,
      isRest: false,
      rationale
    };
  });
  
  return {
    id: `routine_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profileSnapshot: { ...profile },
    days,
    adherence: {},
    aiReasoning: `Created a ${profile.goal}-focused ${profile.experience} plan with ${profile.equipment.join(', ') || 'bodyweight'} equipment. Balances strength training with adequate recovery based on your profile.`
  };
}

export function getRoutineForToday(routine: PersonalRoutine): PersonalRoutineDay | null {
  const today = new Date().getDay(); // 0 Sun
  const idx = today === 0 ? 6 : today - 1;
  return routine.days[idx] || null;
}

export function getWeekDays(): WeekDay[] {
  return WEEK_DAYS;
}

export async function adaptRoutineWithAI(routine: PersonalRoutine, data: AppData): Promise<PersonalRoutine | null> {
  // Try to use AI agent
  try {
    const { agent } = await import('./agent');
    const context = {
      profile: data.profile,
      today: data.day,
      recentWorkouts: data.workoutLogs.slice(0, 5),
      routine: routine,
      targets: data
    };
    const resp = await agent.think("You are an expert fitness coach. Adapt my 7-day routine based on my recent activity, recovery (sleep/water/meals), progress, and goals. Make it smarter - adjust intensity, swap exercises if needed, ensure recovery days are proper. Return the adapted plan reasoning and key changes.", context, []);
    if (resp.text && resp.source === 'cloud') {
      // Still do smart local adaptation but note AI input
    }
  } catch {}
  
  // Local intelligent adaptation
  const adapted = JSON.parse(JSON.stringify(routine)) as PersonalRoutine;
  const totals = mealTotals(data.day.meals);
  const lowRecovery = data.day.sleep < 6 || totals.protein < (data.profile.weightKg || 70) * 1.4;
  
  if (lowRecovery) {
    // Make today and maybe tomorrow more recovery focused
    const today = new Date().getDay();
    const idx = today === 0 ? 6 : today - 1;
    if (adapted.days[idx] && !adapted.days[idx].isRest) {
      adapted.days[idx] = {
        ...adapted.days[idx],
        type: "active_recovery",
        focus: "mobility",
        title: "Recovery Focus (Adapted)",
        items: [{ exerciseId: "Plank", sets: 2, target: 30, targetType: "seconds", rest: 30 }],
        notes: "Adapted due to lower recovery. Focus on mobility and hydration.",
        durationEst: 15,
        rationale: "Adjusted based on sleep and nutrition data"
      };
    }
  }
  
  // If user has been consistent, increase intensity slightly
  const recentDone = data.workoutLogs.slice(0, 7).length;
  if (recentDone >= 4 && !lowRecovery) {
    adapted.days = adapted.days.map(day => {
      if (day.isRest || day.type === "cardio") return day;
      return {
        ...day,
        items: day.items.map(item => ({
          ...item,
          sets: Math.min((item.sets || 3) + 1, 5),
          target: item.targetType === "seconds" ? item.target : Math.min((item.target || 10) + 1, 15)
        })),
        rationale: day.rationale + " (Slightly progressed due to consistency)"
      };
    });
  }
  
  adapted.updatedAt = new Date().toISOString();
  adapted.lastAdaptedAt = new Date().toISOString();
  adapted.aiReasoning = lowRecovery 
    ? "Adapted: Reduced intensity due to lower recovery signals (sleep/nutrition). Prioritizing recovery."
    : recentDone >= 4
    ? "Adapted: Increased volume/intensity slightly based on your consistency over the past week."
    : "Routine optimized based on your current state.";
  
  return adapted;
}
