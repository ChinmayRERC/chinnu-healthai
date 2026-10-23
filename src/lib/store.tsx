import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { AppData, CloudConfig, DayState, Meal, PersonalRoutine, Profile } from "../types";
import { clearLocalData, initialData, isMeaningful, loadData, normalizeData, saveData } from "../data";
import { calculateTargets, dateKey, emptyDay } from "./profile";
import {
  clearCloudConfig,
  cloudSetupMessage,
  currentSession,
  getCloudConfig,
  getPublicCloudConfig,
  pullCloudState,
  pushCloudState,
  saveCloudConfig,
  sendMagicLink,
  sendOAuth,
  signOutCloud,
  subscribeToAuth,
} from "./supabase";

export type CloudStatus = "local" | "connecting" | "pulling" | "saving" | "synced" | "error";

type StoreValue = {
  data: AppData;
  targets: ReturnType<typeof calculateTargets>;
  todayKey: string;
  update: (mutator: (current: AppData) => AppData) => void;
  patchDay: (patch: Partial<DayState>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addMeal: (meal: Omit<Meal, "id">) => void;
  removeMeal: (id: number) => void;
  setWorkout: (workout: AppData["workout"]) => void;
  setPersonalRoutine: (routine: PersonalRoutine | null) => void;
  markRoutineDay: (dayIndex: number, done: boolean) => void;
  addWorkoutItem: (exerciseId: string, options?: { sets?: number; target?: number; targetType?: "reps" | "seconds" }) => void;
  removeWorkoutItem: (exerciseId: string) => void;
  addWorkoutLog: (log: AppData["workoutLogs"][number]) => void;
  addTrainingSession: (session: AppData["trainingSessions"][number]) => void;
  addChat: (message: AppData["chat"][number]) => void;
  clearChat: () => void;
  resetAll: () => void;
  session: Session | null;
  cloudStatus: CloudStatus;
  cloudError: string;
  cloudConfig: CloudConfig | null;
  saveCloud: (config: CloudConfig) => { ok: boolean; error?: string };
  removeCloud: () => void;
  syncNow: () => Promise<void>;
  signIn: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  cloudSetupMessage: string;
};

const StoreContext = createContext<StoreValue | null>(null);

function ensureToday(data: AppData): AppData {
  const key = dateKey();
  const day = data.days[key] || emptyDay(data.profile.weightKg || data.day.weight || 0);
  return { ...data, day, days: { ...data.days, [key]: day } };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => ensureToday(loadData()));
  const [session, setSession] = useState<Session | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>("local");
  const [cloudError, setCloudError] = useState("");
  const [configVersion, setConfigVersion] = useState(0);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(() => getPublicCloudConfig());
  const dataRef = useRef(data);
  const hydratedUser = useRef<string | null>(null);
  const hydrating = useRef(false);
  const pushTimer = useRef<number | null>(null);
  const lastDay = useRef(dateKey());

  const targets = useMemo(() => calculateTargets(data.profile), [data.profile]);

  useEffect(() => {
    dataRef.current = data;
    saveData(data);
  }, [data]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const key = dateKey();
      if (lastDay.current !== key) {
        lastDay.current = key;
        setData((current) => ensureToday(current));
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const update = useCallback((mutator: (current: AppData) => AppData) => {
    setData((current) => {
      const next = mutator(current);
      const key = dateKey();
      const normalized: AppData = {
        ...next,
        version: 2,
        updatedAt: new Date().toISOString(),
        days: { ...next.days, [key]: next.day },
      };
      dataRef.current = normalized;
      return normalized;
    });
  }, []);

  const patchDay = useCallback(
    (patch: Partial<DayState>) => update((current) => ({ ...current, day: { ...current.day, ...patch } })),
    [update],
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => update((current) => ({ ...current, profile: { ...current.profile, ...patch } })),
    [update],
  );

  const addMeal = useCallback(
    (meal: Omit<Meal, "id">) =>
      update((current) => ({
        ...current,
        day: { ...current.day, meals: [...current.day.meals, { ...meal, id: Date.now() }] },
      })),
    [update],
  );

  const removeMeal = useCallback(
    (id: number) =>
      update((current) => ({
        ...current,
        day: { ...current.day, meals: current.day.meals.filter((meal) => meal.id !== id) },
      })),
    [update],
  );

  const setWorkout = useCallback(
    (workout: AppData["workout"]) => update((current) => ({ ...current, workout })),
    [update],
  );

  const setPersonalRoutine = useCallback(
    (routine: PersonalRoutine | null) =>
      update((current) => ({ ...current, personalRoutine: routine, updatedAt: new Date().toISOString() })),
    [update],
  );

  const markRoutineDay = useCallback(
    (dayIndex: number, done: boolean) =>
      update((current) => {
        const routine = current.personalRoutine;
        if (!routine) return current;
        const key = `${dateKey()}::${dayIndex}`;
        const adherence = { ...(routine.adherence || {}), [key]: done };
        return {
          ...current,
          personalRoutine: { ...routine, adherence, updatedAt: new Date().toISOString() },
          updatedAt: new Date().toISOString(),
        };
      }),
    [update],
  );

  const addWorkoutItem = useCallback(
    (exerciseId: string, options?: { sets?: number; target?: number; targetType?: "reps" | "seconds" }) =>
      update((current) => {
        if (current.workout.some((item) => item.exerciseId === exerciseId)) return current;
        return {
          ...current,
          workout: [
            ...current.workout,
            {
              exerciseId,
              sets: options?.sets ?? 3,
              target: options?.target ?? 10,
              targetType: options?.targetType ?? "reps",
              rest: current.settings.restSeconds,
            },
          ],
        };
      }),
    [update],
  );

  const removeWorkoutItem = useCallback(
    (exerciseId: string) =>
      update((current) => ({
        ...current,
        workout: current.workout.filter((item) => item.exerciseId !== exerciseId),
      })),
    [update],
  );

  const addWorkoutLog = useCallback(
    (log: AppData["workoutLogs"][number]) =>
      update((current) => ({
        ...current,
        workoutLogs: [log, ...current.workoutLogs].slice(0, 500),
      })),
    [update],
  );

  const addTrainingSession = useCallback(
    (session: AppData["trainingSessions"][number]) =>
      update((current) => ({
        ...current,
        trainingSessions: [session, ...current.trainingSessions].slice(0, 500),
      })),
    [update],
  );

  const addChat = useCallback(
    (message: AppData["chat"][number]) =>
      update((current) => ({ ...current, chat: [...current.chat, message].slice(-80) })),
    [update],
  );

  const clearChat = useCallback(() => update((current) => ({ ...current, chat: [] })), [update]);

  const resetAll = useCallback(() => {
    const fresh = ensureToday(initialData());
    setData(fresh);
    dataRef.current = fresh;
    clearLocalData();
    saveData(fresh);
  }, []);

  const hydrate = useCallback(async (nextSession: Session) => {
    const userId = nextSession.user.id;
    if (hydratedUser.current === userId) return;
    hydratedUser.current = userId;
    hydrating.current = true;
    setCloudError("");
    setCloudStatus("pulling");
    try {
      const remote = await pullCloudState(userId);
      if (remote.error) {
        setCloudError(remote.error);
        setCloudStatus("error");
        return;
      }
      const local = dataRef.current;
      if (remote.state) {
        const remoteData = ensureToday(normalizeData(remote.state));
        const remoteTime = new Date(remote.updatedAt || remoteData.updatedAt).getTime();
        const localTime = new Date(local.updatedAt).getTime();
        if (isMeaningful(remoteData) && (!isMeaningful(local) || remoteTime > localTime)) {
          dataRef.current = remoteData;
          setData(remoteData);
        } else {
          const result = await pushCloudState(userId, local);
          if (!result.ok) {
            setCloudError(result.error || "Could not upload your local data.");
            setCloudStatus("error");
            return;
          }
        }
      } else {
        const result = await pushCloudState(userId, local);
        if (!result.ok) {
          setCloudError(result.error || "Could not upload your local data.");
          setCloudStatus("error");
          return;
        }
      }
      setCloudStatus("synced");
    } catch (error) {
      setCloudError(error instanceof Error ? error.message : "Cloud sync failed.");
      setCloudStatus("error");
    } finally {
      hydrating.current = false;
    }
  }, []);

  useEffect(() => {
    const config = getCloudConfig();
    setCloudConfig(getPublicCloudConfig());
    if (!config) {
      setSession(null);
      setCloudStatus("local");
      return;
    }
    let cancelled = false;
    setCloudStatus("connecting");
    void currentSession().then((nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      if (nextSession) void hydrate(nextSession);
      else setCloudStatus("local");
    });
    const unsubscribe = subscribeToAuth((nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      if (nextSession) {
        void hydrate(nextSession);
      } else {
        hydratedUser.current = null;
        setCloudStatus("local");
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [configVersion, hydrate]);

  useEffect(() => {
    if (!session || !getCloudConfig()) return;
    if (hydratedUser.current !== session.user.id || hydrating.current) return;
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(async () => {
      setCloudStatus("saving");
      setCloudError("");
      const result = await pushCloudState(session.user.id, dataRef.current);
      if (result.ok) setCloudStatus("synced");
      else {
        setCloudError(result.error || "Cloud sync failed.");
        setCloudStatus("error");
      }
    }, 1200);
    return () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, [data, session]);

  const syncNow = useCallback(async () => {
    if (!session) return;
    setCloudStatus("saving");
    setCloudError("");
    const result = await pushCloudState(session.user.id, dataRef.current);
    if (result.ok) setCloudStatus("synced");
    else {
      setCloudError(result.error || "Cloud sync failed.");
      setCloudStatus("error");
    }
  }, [session]);

  const saveCloud = useCallback(
    (config: CloudConfig) => {
      const result = saveCloudConfig(config);
      if (result.ok) {
        setCloudConfig(getPublicCloudConfig());
        setConfigVersion((value) => value + 1);
      }
      return result;
    },
    [],
  );

  const removeCloud = useCallback(() => {
    clearCloudConfig();
    setCloudConfig(null);
    setSession(null);
    hydratedUser.current = null;
    setCloudStatus("local");
    setConfigVersion((value) => value + 1);
  }, []);

  const signIn = useCallback((email: string) => sendMagicLink(email), []);
  const signInWithOAuth = useCallback((provider: "google" | "github") => sendOAuth(provider), []);

  const signOut = useCallback(async () => {
    await signOutCloud();
    setSession(null);
    hydratedUser.current = null;
    setCloudStatus("local");
    setCloudError("");
  }, []);

  const value: StoreValue = {
    data,
    targets,
    todayKey: dateKey(),
    update,
    patchDay,
    updateProfile,
    addMeal,
    removeMeal,
    setWorkout,
    setPersonalRoutine,
    markRoutineDay,
    addWorkoutItem,
    removeWorkoutItem,
    addWorkoutLog,
    addTrainingSession,
    addChat,
    clearChat,
    resetAll,
    session,
    cloudStatus,
    cloudError,
    cloudConfig,
    saveCloud,
    removeCloud,
    syncNow,
    signIn,
    signInWithOAuth,
    signOut,
    cloudSetupMessage: cloudSetupMessage(),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
