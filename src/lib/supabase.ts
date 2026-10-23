import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import type { AppData, CloudConfig } from "../types";

const CLOUD_KEY = "chinnu-cloud-config";
let cached: { signature: string; client: SupabaseClient } | null = null;

function readEnv(): CloudConfig | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getCloudConfig(): CloudConfig | null {
  const env = readEnv();
  if (env) return env;
  try {
    const raw = localStorage.getItem(CLOUD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CloudConfig>;
    if (!parsed.url || !parsed.anonKey) return null;
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(parsed.url)) return null;
    return { url: parsed.url.replace(/\/$/, ""), anonKey: parsed.anonKey };
  } catch {
    return null;
  }
}

export function getPublicCloudConfig(): CloudConfig | null {
  const config = getCloudConfig();
  if (!config) return null;
  return { url: config.url, anonKey: config.anonKey };
}

export function saveCloudConfig(config: CloudConfig): { ok: boolean; error?: string } {
  const url = config.url.trim().replace(/\/$/, "");
  const anonKey = config.anonKey.trim();
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    return { ok: false, error: "Use the Project URL from Supabase: https://<project>.supabase.co" };
  }
  if (anonKey.length < 40) return { ok: false, error: "That does not look like a Supabase anon/public key." };
  try {
    localStorage.setItem(CLOUD_KEY, JSON.stringify({ url, anonKey }));
    cached = null;
    return { ok: true };
  } catch {
    return { ok: false, error: "Browser storage is blocked, so the cloud settings could not be saved." };
  }
}

export function clearCloudConfig() {
  try {
    localStorage.removeItem(CLOUD_KEY);
  } catch {
    // ignore
  }
  cached = null;
}

export function getSupabase(): SupabaseClient | null {
  const config = getCloudConfig();
  if (!config) return null;
  const signature = `${config.url}|${config.anonKey}`;
  if (cached?.signature === signature) return cached.client;
  try {
    const client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: { headers: { "x-application-name": "chinnu-healthai" } },
    });
    cached = { signature, client };
    return client;
  } catch {
    return null;
  }
}

export async function currentSession(): Promise<Session | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: "Cloud sync is not configured yet." };
  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: window.location.origin,
      shouldCreateUser: true,
    },
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function sendOAuth(provider: "google" | "github"): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: "Cloud sync is not configured yet." };
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOutCloud(): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: true };
  const { error } = await client.auth.signOut();
  return error ? { ok: false, error: error.message } : { ok: true };
}

export function subscribeToAuth(callback: (session: Session | null) => void) {
  const client = getSupabase();
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function pullCloudState(
  userId: string,
): Promise<{ state: AppData | null; updatedAt: string | null; error?: string }> {
  const client = getSupabase();
  if (!client) return { state: null, updatedAt: null, error: "Cloud sync is not configured." };
  const { data, error } = await client
    .from("health_state")
    .select("state, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return { state: null, updatedAt: null, error: error.message };
  if (!data?.state) return { state: null, updatedAt: null };
  return { state: data.state as AppData, updatedAt: data.updated_at as string };
}

export async function pushCloudState(userId: string, state: AppData): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) return { ok: false, error: "Cloud sync is not configured." };
  const { error } = await client.from("health_state").upsert(
    {
      user_id: userId,
      state,
      updated_at: state.updatedAt,
    },
    { onConflict: "user_id" },
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export function cloudSetupMessage(): string {
  return "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, or paste them in Profile → Cloud sync.";
}
