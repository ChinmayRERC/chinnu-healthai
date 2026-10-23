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
  const weightLabel = units === "imperial" ? "Weight (lb)" : "Weight (kg)";

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
            <button className="skip-link" onClick={onSkip}>Skip setup</button>
          </header>

          <div className="onboarding-progress" aria-label={`Step ${step + 1} of 3`}>
            {[0, 1, 2].map((index) => <i key={index} className={index <= step ? "active" : ""} />)}
            <span>{step + 1} of 3</span>
          </div>

          <div className="onboarding-body">
            {step === 0 && (
              <div className="onboarding-step">
                <span className="eyebrow"><Sparkles /> A CALMER WAY TO GET FIT</span>
                <h1>Let’s make this <em>yours.</em></h1>
                <p className="step-intro">No perfect answers needed. You can change everything later.</p>
                <label className="field">
                  <span>What should we call you?</span>
                  <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Your first name" maxLength={40} />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Age</span>
                    <input inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value.replace(/\D/g, ""))} placeholder="30" />
                  </label>
                  <div className="field">
                    <span>Units</span>
                    <div className="segmented compact">
                      <button className={units === "metric" ? "active" : ""} onClick={() => changeUnits("metric")}>kg / cm</button>
                      <button className={units === "imperial" ? "active" : ""} onClick={() => changeUnits("imperial")}>lb / in</button>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <span>How should we tailor the body map?</span>
                  <div className="choice-row gender-choice">
                    {([
                      { value: "female", label: "Female" },
                      { value: "male", label: "Male" },
                      { value: null, label: "Prefer not to say" },
                    ] as { value: Gender | null; label: string }[]).map((option) => (
                      <button key={option.label} className={gender === option.value ? "choice selected" : "choice"} onClick={() => setGender(option.value)}>
                        <UserRound />
                        <span>{option.label}</span>
                        {gender === option.value && <Check />}
                      </button>
                    ))}
                  </div>
                  <small className="field-note">Used for illustrations and a calorie estimate—not a medical assessment.</small>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="onboarding-step">
                <span className="eyebrow"><Target /> YOUR DIRECTION</span>
                <h1>What matters <em>most</em> right now?</h1>
                <p className="step-intro">Pick the outcome you would be proud to keep. We will adjust the plan around it.</p>
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
                  <span>How active is a normal week?</span>
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
                <span className="eyebrow"><Dumbbell /> YOUR STARTING POINT</span>
                <h1>Meet yourself <em>where you are.</em></h1>
                <p className="step-intro">These numbers set your starting targets. They are estimates, not a diagnosis.</p>
                <div className="field-row">
                  <label className="field">
                    <span>Height (cm)</span>
                    <input inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value.replace(/[^\d.]/g, ""))} placeholder="170" />
                  </label>
                  <label className="field">
                    <span>{weightLabel}</span>
                    <input inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value.replace(/[^\d.]/g, ""))} placeholder={units === "imperial" ? "154" : "70"} />
                  </label>
                </div>
                <div className="field">
                  <span>Training experience</span>
                  <div className="segmented experience-segmented">
                    {([
                      ["beginner", "New to this"],
                      ["intermediate", "Some experience"],
                      ["advanced", "Experienced"],
                    ] as [Experience, string][]).map(([value, label]) => (
                      <button key={value} className={experience === value ? "active" : ""} onClick={() => setExperience(value)}>{label}</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span>What can you train with?</span>
                  <div className="chip-grid">
                    {EQUIPMENT.map((value) => (
                      <button key={value} className={equipment.includes(value) ? "chip selected" : "chip"} onClick={() => toggleEquipment(value)}>
                        {equipment.includes(value) && <Check />}
                        {equipmentLabel(value)}
                      </button>
                    ))}
                  </div>
                  <small className="field-note">Choose what you can access most weeks. Bodyweight is always included.</small>
                </div>
                <div className="onboarding-privacy-note">
                  <ShieldCheck />
                  <p><b>Private by default.</b> Your profile and logs stay on this device. Cloud sync and cloud AI are optional.</p>
                </div>
              </div>
            )}
          </div>

          <footer className="onboarding-footer">
            {step > 0 ? (
              <button className="soft-btn" onClick={() => setStep(step - 1)}><ArrowLeft /> Back</button>
            ) : (
              <span className="onboarding-footnote"><ActivityIcon /> Takes about 60 seconds</span>
            )}
            {step < 2 ? (
              <button className="primary-btn" onClick={() => setStep(step + 1)}>Continue <ArrowRight /></button>
            ) : (
              <button className="primary-btn" onClick={finish}>Build my plan <Check /></button>
            )}
          </footer>
        </section>

        <aside className="onboarding-visual">
          {hero && <img src={hero.imageUrls[0]} alt="" aria-hidden="true" />}
          <div className="onboarding-visual-overlay" />
          <div className="onboarding-visual-copy">
            <span className="eyebrow"><Sparkles /> DESIGNED FOR REAL LIFE</span>
            <h2>Small steps.<br />Visible change.</h2>
            <p>A realistic plan for food, movement, sleep, and the days when motivation is low.</p>
            <div className="onboarding-points">
              <span><Check /> 876 exercises with real photos</span>
              <span><Check /> 25 video demonstrations</span>
              <span><Check /> Works without an account</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
