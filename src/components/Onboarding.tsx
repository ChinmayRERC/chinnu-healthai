import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";
import type { Activity, Experience, Gender, Goal, Profile, Units } from "../types";
import { libraryById } from "../lib/library";
import { useLocale } from "../lib/locale";

const GOALS: { value: Goal; title: string; copy: string; icon: typeof Target }[] = [
  { value: "lose", title: "Lose fat", copy: "A gentle deficit with enough protein", icon: TrendingUp },
  { value: "gain", title: "Build muscle", copy: "A small surplus and progressive training", icon: Dumbbell },
  { value: "strength", title: "Get stronger", copy: "Heavier sets and steady recovery", icon: Zap },
  { value: "recomp", title: "Feel better", copy: "Energy, consistency, and body recomposition", icon: HeartPulse },
];

const ACTIVITIES: { value: Activity; title: string; copy: string }[] = [
  { value: "sedentary", title: "Mostly sitting", copy: "Desk work, little planned movement" },
  { value: "light", title: "Lightly active", copy: "Some walking or 1–2 workouts a week" },
  { value: "moderate", title: "Active", copy: "3–4 workouts or active days a week" },
  { value: "high", title: "Very active", copy: "5+ hard sessions or an active job" },
];

const EQUIPMENT = ["body only", "dumbbell", "barbell", "machine", "cable", "bands", "kettlebells", "other"];

const equipmentLabel = (value: string) =>
  value === "body only" ? "Bodyweight" : value.charAt(0).toUpperCase() + value.slice(1);

export default function Onboarding({
  profile,
  onComplete,
  onSkip,
}: {
  profile: Profile;
  onComplete: (patch: Partial<Profile>) => void;
  onSkip: () => void;
}) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [age, setAge] = useState(profile.age ? String(profile.age) : "");
  const [height, setHeight] = useState(profile.heightCm ? String(profile.heightCm) : "");
  const [weight, setWeight] = useState(
    profile.weightKg
      ? String(profile.units === "imperial" ? Math.round(profile.weightKg * 2.20462 * 10) / 10 : profile.weightKg)
      : "",
  );
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [activity, setActivity] = useState<Activity>(profile.activity);
  const [experience, setExperience] = useState<Experience>(profile.experience);
  const [equipment, setEquipment] = useState<string[]>(profile.equipment.length ? profile.equipment : ["body only", "dumbbell"]);
  const [units, setUnits] = useState<Units>(profile.units);
  const hero = useMemo(() => libraryById.get("Goblet_Squat") || libraryById.get("Barbell_Squat"), []);

  const weightValue = Number(weight);
  const heightValue = Number(height);
  const ageValue = Number(age);
  const weightLabel = units === "imperial" ? (locale === "hi" ? "वज़न (पाउंड)" : locale === "kn" ? "ತೂಕ (ಪೌಂಡ್)" : "Weight (lb)") : t("weightKg");
  const stepLabel = locale === "hi" ? `3 में से ${step + 1}` : locale === "kn" ? `3 ರಲ್ಲಿ ${step + 1}` : `${step + 1} of 3`;

  function changeUnits(next: Units) {
    if (next === units) return;
    const value = Number(weight);
    if (value) {
      const converted = next === "imperial" ? value * 2.20462 : value / 2.20462;
      setWeight(String(Math.round(converted * 10) / 10));
    }
    setUnits(next);
  }

  function toggleEquipment(value: string) {
    setEquipment((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value);
        return next.length ? next : ["body only"];
      }
      return value === "body only" ? ["body only"] : [...current.filter((item) => item !== "body only"), value];
    });
  }

  function finish() {
    const weightKg = weightValue ? (units === "imperial" ? weightValue / 2.20462 : weightValue) : null;
    onComplete({
      name: name.trim(),
      gender,
      age: ageValue ? Math.max(13, Math.min(100, ageValue)) : null,
      heightCm: heightValue ? Math.max(100, Math.min(250, heightValue)) : null,
      weightKg: weightKg ? Math.max(25, Math.min(350, Math.round(weightKg * 10) / 10)) : null,
      goal,
      activity,
      experience,
      equipment,
      units,
      onboarded: true,
    });
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">
        <section className="onboarding-form-panel">
          <header className="onboarding-top">
            <div className="brand-lockup">
              <span className="brand-mark"><HeartPulse /></span>
              <span><b>CHINNU</b><small>HEALTH + MOVEMENT</small></span>
            </div>
            <button className="skip-link" onClick={onSkip}>{t("skipSetup")}</button>
          </header>

          <div className="onboarding-progress" aria-label={stepLabel}>
            {[0, 1, 2].map((index) => <i key={index} className={index <= step ? "active" : ""} />)}
            <span>{stepLabel}</span>
          </div>

          <div className="onboarding-body">
            {step === 0 && (
              <div className="onboarding-step">
                <span className="eyebrow"><Sparkles /> {t("calmFitness")}</span>
                <h1>{t("onboardingTitle0")}</h1>
                <p className="step-intro">{t("onboardingCopy0")}</p>
                <label className="field">
                  <span>{t("callYou")}</span>
                  <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={t("firstName")} maxLength={40} />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>{t("age")}</span>
                    <input inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value.replace(/\D/g, ""))} placeholder="30" />
                  </label>
                  <div className="field">
                    <span>{t("units")}</span>
                    <div className="segmented compact">
                      <button className={units === "metric" ? "active" : ""} onClick={() => changeUnits("metric")}>kg / cm</button>
                      <button className={units === "imperial" ? "active" : ""} onClick={() => changeUnits("imperial")}>lb / in</button>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <span>{t("bodyMap")}</span>
                  <div className="choice-row gender-choice">
                    {([
                      { value: "female", label: t("female") },
                      { value: "male", label: t("male") },
                      { value: null, label: t("preferNot") },
                    ] as { value: Gender | null; label: string }[]).map((option) => (
                      <button key={option.label} className={gender === option.value ? "choice selected" : "choice"} onClick={() => setGender(option.value)}>
                        <UserRound />
                        <span>{option.label}</span>
                        {gender === option.value && <Check />}
                      </button>
                    ))}
                  </div>
                  <small className="field-note">{t("illustrationNote")}</small>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="onboarding-step">
                <span className="eyebrow"><Target /> {t("direction")}</span>
                <h1>{t("goalQuestion")}</h1>
                <p className="step-intro">{t("goalCopy")}</p>
                <div className="goal-grid">
                  {GOALS.map(({ value, title, copy, icon: Icon }) => (
                    <button key={value} className={goal === value ? "goal-card selected" : "goal-card"} onClick={() => setGoal(value)}>
                      <span><Icon /></span>
                      <div><b>{title}</b><small>{copy}</small></div>
                      {goal === value && <Check />}
                    </button>
                  ))}
                </div>
                <div className="field">
                  <span>{t("activityQuestion")}</span>
                  <div className="activity-list">
                    {ACTIVITIES.map((option) => (
                      <button key={option.value} className={activity === option.value ? "activity-option selected" : "activity-option"} onClick={() => setActivity(option.value)}>
                        <i />
                        <div><b>{option.title}</b><small>{option.copy}</small></div>
                        {activity === option.value && <Check />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-step">
                <span className="eyebrow"><Dumbbell /> {t("startingPoint")}</span>
                <h1>{t("startingTitle")}</h1>
                <p className="step-intro">{t("startingCopy")}</p>
                <div className="field-row">
                  <label className="field">
                    <span>{t("height")}</span>
                    <input inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value.replace(/[^\d.]/g, ""))} placeholder="170" />
                  </label>
                  <label className="field">
                    <span>{weightLabel}</span>
                    <input inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value.replace(/[^\d.]/g, ""))} placeholder={units === "imperial" ? "154" : "70"} />
                  </label>
                </div>
                <div className="field">
                  <span>{t("trainingExperience")}</span>
                  <div className="segmented experience-segmented">
                    {([
                      ["beginner", t("newToThis")],
                      ["intermediate", t("someExperience")],
                      ["advanced", t("experienced")],
                    ] as [Experience, string][]).map(([value, label]) => (
                      <button key={value} className={experience === value ? "active" : ""} onClick={() => setExperience(value)}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span>{t("equipmentQuestion")}</span>
                  <div className="chip-grid">
                    {EQUIPMENT.map((value) => (
                      <button key={value} className={equipment.includes(value) ? "chip selected" : "chip"} onClick={() => toggleEquipment(value)}>
                        {equipment.includes(value) && <Check />}
                        {equipmentLabel(value)}
                      </button>
                    ))}
                  </div>
                  <small className="field-note">{t("equipmentCopy")}</small>
                </div>
                <div className="onboarding-privacy-note">
                  <ShieldCheck />
                  <p><b>{t("privateByDefault")}</b> {t("privateCopy")}</p>
                </div>
              </div>
            )}
          </div>

          <footer className="onboarding-footer">
            {step > 0 ? (
              <button className="soft-btn" onClick={() => setStep(step - 1)}><ArrowLeft /> {t("back")}</button>
            ) : (
              <span className="onboarding-footnote"><ActivityIcon /> {t("about60")}</span>
            )}
            {step < 2 ? (
              <button className="primary-btn" onClick={() => setStep(step + 1)}>{t("continue")} <ArrowRight /></button>
            ) : (
              <button className="primary-btn" onClick={finish}>{t("buildPlan")} <Check /></button>
            )}
          </footer>
        </section>

        <aside className="onboarding-visual">
          {hero && <img src={hero.imageUrls[0]} alt="" aria-hidden="true" />}
          <div className="onboarding-visual-overlay" />
          <div className="onboarding-visual-copy">
            <span className="eyebrow"><Sparkles /> {t("designedLife")}</span>
            <h2>{t("smallSteps")}</h2>
            <p>{t("realisticPlan")}</p>
            <div className="onboarding-points">
              <span><Check /> {t("exercisesWithPhotos")}</span>
              <span><Check /> {t("videoDemos")}</span>
              <span><Check /> {t("worksOffline")}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
