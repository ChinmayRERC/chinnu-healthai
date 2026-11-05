import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Cloud,
  CloudOff,
  Download,
  HeartPulse,
  Info,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
  UserRound,
  Volume2,
} from "lucide-react";
import { useStore } from "../lib/store";
import {
  displayHeight,
  displayWeight,
} from "../lib/profile";
import type { Activity, Experience, Gender, Goal, Profile, Units } from "../types";
import { ConfirmModal } from "../components/LogModals";
import { LegalDialog, type LegalPage } from "../components/LoginPage";
import { useLocale } from "../lib/locale";

const EQUIPMENT = ["body only", "dumbbell", "barbell", "machine", "cable", "bands", "kettlebells", "other"];

const EQUIPMENT_LABEL: Record<string, string> = {
  "body only": "Bodyweight",
  dumbbell: "Dumbbell",
  barbell: "Barbell",
  machine: "Machine",
  cable: "Cable",
  bands: "Bands",
  kettlebells: "Kettlebell",
  other: "Other",
};

const GOALS: { value: Goal; label: string; copy: string }[] = [
  { value: "lose", label: "Lose fat", copy: "Gentle deficit" },
  { value: "gain", label: "Build muscle", copy: "Small surplus" },
  { value: "strength", label: "Get stronger", copy: "Heavier sets" },
  { value: "recomp", label: "Feel better", copy: "Steady consistency" },
];

type Draft = {
  name: string;
  gender: Gender | "";
  age: string;
  heightCm: string;
  weight: string;
  goal: Goal;
  activity: Activity;
  experience: Experience;
  equipment: string[];
  units: Units;
};

function draftFromProfile(profile: Profile): Draft {
  const weight =
    profile.weightKg == null
      ? ""
      : String(profile.units === "imperial" ? Math.round(profile.weightKg * 2.20462 * 10) / 10 : profile.weightKg);
  return {
    name: profile.name,
    gender: profile.gender || "",
    age: profile.age ? String(profile.age) : "",
    heightCm: profile.heightCm ? String(profile.heightCm) : "",
    weight,
    goal: profile.goal,
    activity: profile.activity,
    experience: profile.experience,
    equipment: profile.equipment.length ? profile.equipment : ["body only", "dumbbell"],
    units: profile.units,
  };
}

export default function ProfilePage({ onNotify }: { onNotify: (message: string) => void }) {
  const { t, tr } = useLocale();
  const [legalPage, setLegalPage] = useState<LegalPage>(null);
  const {
    data,
    targets,
    update,
    updateProfile,
    patchDay,
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
    cloudSetupMessage,
  } = useStore();
  const [draft, setDraft] = useState<Draft>(() => draftFromProfile(data.profile));
  const [cloudUrl, setCloudUrl] = useState(cloudConfig?.url || "");
  const [cloudKey, setCloudKey] = useState(cloudConfig?.anonKey || "");
  const [cloudMessage, setCloudMessage] = useState("");
  const [cloudFormOpen, setCloudFormOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState(session?.user.email || "");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(false);
  const hasEnvConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const initial = (data.profile.name || "You").trim().charAt(0).toUpperCase();
  const goalLabel = GOALS.find((goal) => goal.value === data.profile.goal)?.label || "Feel better";
  const cloudLabel =
    cloudStatus === "synced"
      ? "Synced just now"
      : cloudStatus === "saving"
        ? "Saving changes…"
        : cloudStatus === "pulling"
          ? "Bringing your data down…"
          : cloudStatus === "connecting"
            ? "Connecting…"
            : cloudStatus === "error"
              ? "Sync needs attention"
              : "On this device";
  const equipmentText = draft.equipment.length ? draft.equipment.map((item) => EQUIPMENT_LABEL[item] || item).join(", ") : "Bodyweight";

  const dirty = useMemo(() => {
    const current = draftFromProfile(data.profile);
    return JSON.stringify({ ...current, weight: current.weight }) !== JSON.stringify({ ...draft, weight: draft.weight });
  }, [data.profile, draft]);

  useEffect(() => {
    setDraft(draftFromProfile(data.profile));
  }, [data.profile]);

  useEffect(() => {
    setCloudUrl(cloudConfig?.url || "");
    setCloudKey(cloudConfig?.anonKey || "");
  }, [cloudConfig]);

  function saveProfile() {
    const units = draft.units;
    const weightValue = Number(draft.weight);
    const weightKg = weightValue ? (units === "imperial" ? weightValue / 2.20462 : weightValue) : null;
    const heightValue = Number(draft.heightCm);
    const ageValue = Number(draft.age);
    updateProfile({
      name: draft.name.trim(),
      gender: draft.gender || null,
      age: ageValue ? Math.max(13, Math.min(100, ageValue)) : null,
      heightCm: heightValue ? Math.max(100, Math.min(250, heightValue)) : null,
      weightKg: weightKg ? Math.max(25, Math.min(350, Math.round(weightKg * 10) / 10)) : null,
      goal: draft.goal,
      activity: draft.activity,
      experience: draft.experience,
      equipment: draft.equipment.length ? draft.equipment : ["body only"],
      units,
    });
    if (weightKg) patchDay({ weight: Math.round(weightKg * 10) / 10 });
    setSaved(true);
    onNotify("Profile and targets updated");
    window.setTimeout(() => setSaved(false), 2200);
  }

  function changeUnits(units: Units) {
    if (units === draft.units) return;
    const value = Number(draft.weight);
    const converted = value ? (units === "imperial" ? value * 2.20462 : value / 2.20462) : 0;
    setDraft((current) => ({
      ...current,
      units,
      weight: converted ? String(Math.round(converted * 10) / 10) : "",
    }));
  }

  function toggleEquipment(value: string) {
    setDraft((current) => {
      if (current.equipment.includes(value)) {
        const next = current.equipment.filter((item) => item !== value);
        return { ...current, equipment: next.length ? next : ["body only"] };
      }
      return {
        ...current,
        equipment: value === "body only"
          ? ["body only"]
          : [...current.equipment.filter((item) => item !== "body only"), value],
      };
    });
  }

  function connectCloud() {
    const result = saveCloud({ url: cloudUrl.trim(), anonKey: cloudKey.trim() });
    if (result.ok) {
      setCloudMessage("Cloud sync project saved. If this is the first connection, create the health_state table using the included schema.");
      setCloudFormOpen(false);
      onNotify("Cloud sync configured");
    } else {
      setCloudMessage(result.error || "Could not save the cloud settings.");
    }
  }

  async function sendAuthLink(event: React.FormEvent) {
    event.preventDefault();
    if (!authEmail.trim()) return;
    setAuthBusy(true);
    setAuthMessage("");
    const result = await signIn(authEmail);
    setAuthBusy(false);
    setAuthMessage(result.ok ? "Check your inbox for a sign-in link. You can close this tab after opening it." : result.error || "The sign-in link could not be sent.");
  }

  async function oauth(provider: "google" | "github") {
    setAuthBusy(true);
    setAuthMessage("");
    const result = await signInWithOAuth(provider);
    setAuthBusy(false);
    if (!result.ok) setAuthMessage(result.error || "That sign-in option is not available yet.");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `chinnu-health-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify("Your data export has downloaded");
  }

  return (
    <div className="page profile-page-v2">
      <section className="profile-head-v2">
        <div className="profile-avatar-large">{initial || <UserRound />}</div>
        <div className="profile-head-copy">
          <span className="eyebrow"><Sparkles /> {tr("YOUR SPACE")}</span>
          <h1>{data.profile.name || tr("Your profile")}</h1>
          <p>{tr(goalLabel)} · {tr(data.profile.experience)} · {tr(equipmentText)}</p>
          <div className="profile-badges">
            <span><LockKeyhole /> {tr(cloudConfig ? "Cloud available" : "Saved on this device")}</span>
            <span><ShieldCheck /> {tr(data.settings.cloudConsent ? "Cloud AI on" : "Private AI off")}</span>
            <span><Target /> {targets.calories.toLocaleString()} {tr("kcal target")}</span>
          </div>
        </div>
        <button className="soft-btn" onClick={() => { updateProfile({ onboarded: false }); onNotify("Setup restarted"); }}>
          <RotateCcw /> {tr("Restart setup")}
        </button>
      </section>

      <div className="profile-grid-v2">
        <div className="profile-main-v2">
          <section className="panel account-panel-v2">
            <header className="panel-head">
              <div><span className="eyebrow">{tr("ACCOUNT + SYNC")}</span><h2>{tr(session ? "Your data is connected" : "No account needed")}</h2></div>
              <span className={`cloud-state ${cloudStatus}`}>
                {cloudStatus === "synced" ? <Cloud /> : cloudStatus === "connecting" || cloudStatus === "saving" || cloudStatus === "pulling" ? <LoaderCircle className="spin" /> : cloudStatus === "error" ? <TriangleAlert /> : <CloudOff />}
                {cloudLabel}
              </span>
            </header>

            {!cloudConfig && (
              <>
                <div className="account-local-note">
                  <span><LockKeyhole /></span>
                  <div>
                    <b>{tr("This version saves everything on this device.")}</b>
                    <p>{tr("No sign-up, no email, no algorithm watching you. Cloud sync is optional and only copies the data you choose to sync.")}</p>
                  </div>
                </div>
                <button className="text-btn" onClick={() => setCloudFormOpen((value) => !value)}>
                  {tr(cloudFormOpen ? "Hide advanced setup" : "Connect a Supabase project")} <ArrowRight />
                </button>
                {cloudFormOpen && (
                  <div className="cloud-setup-form">
                    <p><Info /> {cloudSetupMessage}</p>
                    <label className="field"><span>{tr("Project URL")}</span><input value={cloudUrl} onChange={(event) => setCloudUrl(event.target.value)} placeholder="https://your-project.supabase.co" /></label>
                    <label className="field"><span>{tr("Anon / public key")}</span><input value={cloudKey} onChange={(event) => setCloudKey(event.target.value)} placeholder="eyJhbGciOi…" /></label>
                    <button className="primary-btn" onClick={connectCloud}>{tr("Save cloud project")}</button>
                    {cloudMessage && <small className="form-note">{cloudMessage}</small>}
                  </div>
                )}
              </>
            )}

            {cloudConfig && !session && (
              <div className="auth-block">
                <div className="auth-copy">
                  <span className="auth-icon"><Cloud /></span>
                  <div><h3>{tr("Sign in to sync across devices")}</h3><p>{tr("Use a magic link—no password to remember. Your local logs stay available either way.")}</p></div>
                </div>
                <form className="auth-form" onSubmit={sendAuthLink}>
                  <label className="field"><span>{t("email")}</span><input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
                  <button className="primary-btn" type="submit" disabled={authBusy}>{authBusy ? <LoaderCircle className="spin" /> : <Mail />} {tr("Send magic link")}</button>
                </form>
                <div className="oauth-row">
                  <button className="soft-btn" onClick={() => void oauth("google")} disabled={authBusy}>{t("oauthGoogle")}</button>
                  <button className="soft-btn" onClick={() => void oauth("github")} disabled={authBusy}>{t("oauthGithub")}</button>
                </div>
                {authMessage && <div className="auth-message">{authMessage}</div>}
                <div className="auth-footnote"><ShieldCheck /><span>{tr("Cloud data is protected by per-user database rules. This app never receives your email password.")}</span></div>
              </div>
            )}

            {cloudConfig && session && (
              <div className="signed-in-block">
                <div className="signed-in-user">
                  <span>{initial}</span>
                  <div><b>{session.user.email}</b><small>{tr("Signed in")} · {cloudLabel}</small></div>
                  <button className="soft-btn" onClick={() => void syncNow()} disabled={cloudStatus === "saving" || cloudStatus === "pulling"}><RefreshCw className={cloudStatus === "saving" ? "spin" : ""} /> {tr("Sync now")}</button>
                </div>
                {cloudError && <div className="auth-message error"><TriangleAlert /> {cloudError}</div>}
                <div className="signed-in-actions">
                  <button className="text-btn" onClick={() => void signOut().then(() => onNotify(tr("Signed out; your local data remains")))}><LogOut /> {tr("Sign out")}</button>
                  {!hasEnvConfig && <button className="text-btn danger" onClick={() => { removeCloud(); onNotify(tr("Supabase configuration removed")); }}><Trash2 /> {tr("Forget this project")}</button>}
                </div>
                <p className="cloud-help">{tr("If the table is missing, run")} <code>supabase/schema.sql</code> {tr("once in the Supabase SQL editor. Your last local save remains the fallback.")}</p>
              </div>
            )}

            {cloudConfig && <div className="cloud-config-footer"><span><Cloud /> {cloudConfig.url.replace("https://", "")}</span><button className="text-btn" onClick={() => setCloudFormOpen((value) => !value)}>{tr("Change")}</button></div>}
            {cloudConfig && cloudFormOpen && (
              <div className="cloud-setup-form">
                <label className="field"><span>{tr("Project URL")}</span><input value={cloudUrl} onChange={(event) => setCloudUrl(event.target.value)} /></label>
                <label className="field"><span>{tr("Anon / public key")}</span><input value={cloudKey} onChange={(event) => setCloudKey(event.target.value)} /></label>
                <button className="primary-btn" onClick={connectCloud}>{tr("Save cloud project")}</button>
                {cloudMessage && <small className="form-note">{cloudMessage}</small>}
              </div>
            )}
          </section>

          <form className="panel profile-form-panel" onSubmit={(event) => { event.preventDefault(); saveProfile(); }}>
            <header className="panel-head">
              <div><span className="eyebrow">{tr("ABOUT YOU")}</span><h2>{tr("Personal details")}</h2></div>
              {saved && <span className="saved-badge"><Check /> {tr("Saved")}</span>}
            </header>
            <p className="form-intro">{tr("These details set your calorie, protein, water, and step estimates. You can change them whenever life changes.")}</p>

            <div className="form-grid-v2">
              <label className="field"><span>{tr("Name")}</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder={t("callYou")} maxLength={40} /></label>
              <div className="field">
                <span>{tr("Body map")}</span>
                <div className="segmented">
                  <button type="button" className={draft.gender === "female" ? "active" : ""} onClick={() => setDraft({ ...draft, gender: "female" })}>{t("female")}</button>
                  <button type="button" className={draft.gender === "male" ? "active" : ""} onClick={() => setDraft({ ...draft, gender: "male" })}>{t("male")}</button>
                  <button type="button" className={draft.gender === "" ? "active" : ""} onClick={() => setDraft({ ...draft, gender: "" })}>{tr("Neutral")}</button>
                </div>
              </div>
              <label className="field"><span>{t("age")}</span><input inputMode="numeric" value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value.replace(/[^\d]/g, "") })} placeholder="30" /></label>
              <label className="field"><span>{t("height")}</span><input inputMode="decimal" value={draft.heightCm} onChange={(event) => setDraft({ ...draft, heightCm: event.target.value.replace(/[^\d.]/g, "") })} placeholder="170" /></label>
              <label className="field">
                <span>Weight ({draft.units === "imperial" ? "lb" : "kg"})</span>
                <input inputMode="decimal" value={draft.weight} onChange={(event) => setDraft({ ...draft, weight: event.target.value.replace(/[^\d.]/g, "") })} placeholder={draft.units === "imperial" ? "154" : "70"} />
              </label>
              <div className="field">
                <span>{t("units")}</span>
                <div className="segmented">
                  <button type="button" className={draft.units === "metric" ? "active" : ""} onClick={() => changeUnits("metric")}>{tr("kg / cm")}</button>
                  <button type="button" className={draft.units === "imperial" ? "active" : ""} onClick={() => changeUnits("imperial")}>{tr("lb / in")}</button>
                </div>
              </div>
            </div>

            <div className="form-divider" />

            <div className="field">
              <span>{tr("Your main direction")}</span>
              <div className="goal-choice-row">
                {GOALS.map((goal) => (
                  <button type="button" key={goal.value} className={draft.goal === goal.value ? "goal-pill selected" : "goal-pill"} onClick={() => setDraft({ ...draft, goal: goal.value })}>
                    <b>{tr(goal.label)}</b><small>{tr(goal.copy)}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid-v2 three">
              <label className="field"><span>{tr("Activity")}</span><select value={draft.activity} onChange={(event) => setDraft({ ...draft, activity: event.target.value as Activity })}><option value="sedentary">{t("mostlySitting")}</option><option value="light">{t("lightActive")}</option><option value="moderate">{t("active")}</option><option value="high">{t("veryActive")}</option></select><ChevronDown className="select-chevron" /></label>
              <label className="field"><span>{tr("Experience")}</span><select value={draft.experience} onChange={(event) => setDraft({ ...draft, experience: event.target.value as Experience })}><option value="beginner">{t("newToThis")}</option><option value="intermediate">{t("someExperience")}</option><option value="advanced">{t("experienced")}</option></select><ChevronDown className="select-chevron" /></label>
              <div className="field"><span>{tr("Plan uses")}</span><b className="static-value">{tr(equipmentText)}</b></div>
            </div>

            <div className="field">
              <span>{tr("Available equipment")}</span>
              <div className="chip-grid">
                {EQUIPMENT.map((value) => (
                  <button type="button" key={value} className={draft.equipment.includes(value) ? "chip selected" : "chip"} onClick={() => toggleEquipment(value)}>
                    {draft.equipment.includes(value) && <Check />} {tr(EQUIPMENT_LABEL[value])}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <span>{tr(dirty ? "Unsaved changes" : "All changes saved")}</span>
              <button className="primary-btn" type="submit" disabled={!dirty}><Save /> {tr("Save profile")}</button>
            </div>
          </form>

          <section className="panel preferences-panel">
            <header className="panel-head"><div><span className="eyebrow">{tr("PREFERENCES")}</span><h2>{tr("App settings")}</h2></div></header>
            <div className="preference-row">
              <div><b>{tr("Cloud AI coach")}</b><p>{tr("Off by default. When on, your message and compact day summary go to the configured AI endpoint.")}</p></div>
              <button className={data.settings.cloudConsent ? "toggle on" : "toggle"} onClick={() => update((current) => ({ ...current, settings: { ...current.settings, cloudConsent: !current.settings.cloudConsent } }))} aria-pressed={data.settings.cloudConsent} aria-label={tr("Toggle cloud AI")}><i /></button>
            </div>
            <div className="preference-row">
              <div><b>{tr("Sound cues")}</b><p>{tr("Quiet tones during rests and set completion in the workout player.")}</p></div>
              <button className={data.settings.sound ? "toggle on" : "toggle"} onClick={() => update((current) => ({ ...current, settings: { ...current.settings, sound: !current.settings.sound } }))} aria-pressed={data.settings.sound} aria-label={tr("Toggle sound")}><i /></button>
            </div>
            <div className="preference-row">
              <div><b>{tr("Default rest timer")}</b><p>{tr("Used for new exercises. You can change individual rests on the plan.")}</p></div>
              <div className="segmented">
                {[45, 60, 75, 90, 120].map((seconds) => (
                  <button key={seconds} className={data.settings.restSeconds === seconds ? "active" : ""} onClick={() => update((current) => ({ ...current, settings: { ...current.settings, restSeconds: seconds } }))}>{seconds}s</button>
                ))}
              </div>
            </div>
            <div className="preference-row">
              <div><b>{tr("Read-aloud and voice")}</b><p>{tr("Exercise instructions and coach replies can be read aloud using your browser voice.")}</p></div>
              <span className="preference-note"><Volume2 /> {tr("Available")}</span>
            </div>
          </section>

          <section className="panel data-panel">
            <header className="panel-head"><div><span className="eyebrow">{tr("YOUR DATA")}</span><h2>{tr("Export or start over")}</h2></div></header>
            <p>{tr("You own your records. Download a complete JSON copy at any time. Deleting resets every local log, plan, chat, and profile detail on this device.")}</p>
            <div className="data-actions">
              <button className="soft-btn" onClick={exportData}><Download /> {tr("Export my data")}</button>
              <button className="soft-btn danger" onClick={() => setConfirmReset(true)}><Trash2 /> {tr("Delete all data")}</button>
            </div>
            <small>{tr("Exports are unencrypted JSON files. Store them somewhere private. Cloud copies, if enabled, are deleted separately from Supabase when you delete your account there.")}</small>
          </section>
        </div>

        <aside className="profile-rail-v2">
          <article className="panel targets-panel">
            <header className="panel-head compact"><div><span className="eyebrow">{tr("DAILY TARGETS")}</span><h2>{tr("Your starting point")}</h2></div><Target /></header>
            <div className="target-hero"><b>{targets.calories.toLocaleString()}</b><span>kcal / {tr("day")}</span></div>
            <div className="target-list">
              <span><b>{targets.protein} g</b><small>{t("protein")}</small></span>
              <span><b>{targets.carbs} g</b><small>{t("carbs")}</small></span>
              <span><b>{targets.fat} g</b><small>{t("fat")}</small></span>
              <span><b>{targets.water}</b><small>{tr("glasses water")}</small></span>
              <span><b>{targets.steps.toLocaleString()}</b><small>{t("steps")}</small></span>
              <span><b>{targets.sleep} h</b><small>{t("sleep")}</small></span>
            </div>
            <div className="target-math">
              <span>BMR <b>{targets.bmr.toLocaleString()}</b></span>
              <span>{tr("Maintenance")} <b>{targets.tdee.toLocaleString()}</b></span>
              {targets.bmi && <span>BMI <b>{targets.bmi}</b></span>}
            </div>
            {data.profile.heightCm && data.profile.weightKg && (
              <p className="target-note">{tr("You are")} {displayHeight(data.profile.heightCm, data.profile.units)} {tr("and")} {displayWeight(data.profile.weightKg, data.profile.units)}. {tr("Estimates are a starting point, not a prescription.")}</p>
            )}
          </article>

          <article className="panel privacy-panel">
            <span className="privacy-icon"><LockKeyhole /></span>
            <span className="eyebrow">{tr("PRIVACY BY DEFAULT")}</span>
            <h2>{tr("Your health data is not a product.")}</h2>
            <p>{tr("No ads, no sale of personal data, no camera or microphone upload. Cloud sync and cloud AI are both opt-in and can be turned off at any time.")}</p>
            <ul>
              <li><Check /> {tr("Local-first storage")}</li>
              <li><Check /> {tr("Per-user cloud rules")}</li>
              <li><Check /> {tr("One-tap export")}</li>
              <li><Check /> {tr("No third-party analytics in this build")}</li>
            </ul>
          </article>

          <article className="panel safety-card-v2">
            <span className="safety-icon"><HeartPulse /></span>
            <span className="eyebrow">{tr("REAL-WORLD SAFETY")}</span>
            <h2>{tr("When an app is not enough")}</h2>
            <p>{tr("Stop exercising and seek urgent care for chest pain, fainting, severe shortness of breath, or sudden weakness. For mental-health support in India, Tele-MANAS is")} <b>14416</b>. {tr("For emergencies, call")} <b>112</b>.</p>
            <small>{tr("Chinnu is wellness support, not diagnosis or emergency care.")}</small>
          </article>

          <article className="panel about-panel">
            <span className="eyebrow">{tr("ABOUT CHINNU")}</span>
            <h3>{tr("Built for the days between motivation.")}</h3>
            <p>{tr("An independent health and movement companion. Exercise data and photos come from free-exercise-db (public domain). Video demonstrations are embedded from their creators on YouTube.")}</p>
            <span className="version-pill">v0.1 · local-first</span>
          </article>
        </aside>
      </div>

      <footer className="profile-legal-links">
        <span>Chinnu HealthAI</span>
        <button onClick={() => setLegalPage("terms")}>{t("terms")}</button>
        <button onClick={() => setLegalPage("privacy")}>{t("privacy")}</button>
      </footer>

      {legalPage && <LegalDialog page={legalPage} onClose={() => setLegalPage(null)} />}

      {confirmReset && (
        <ConfirmModal
          title={tr("Delete all local data?")}
          description="This removes your profile, meals, water, steps, sleep, plans, chats, training sessions, and workout history from this device. It cannot be undone. Export a copy first if you might need it."
          confirmLabel="Delete everything"
          onClose={() => setConfirmReset(false)}
          onConfirm={() => { resetAll(); onNotify("All local data deleted"); }}
        />
      )}
    </div>
  );
}
