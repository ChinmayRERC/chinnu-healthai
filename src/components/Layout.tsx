import {
  Activity,
  Bot,
  CalendarRange,
  Check,
  Cloud,
  CloudOff,
  Dumbbell,
  HeartPulse,
  Home,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import type { Section, Profile } from "../types";
import type { CloudStatus } from "../lib/store";

export const NAV: { label: Section; icon: typeof Home }[] = [
  { label: "Today", icon: Home },
  { label: "Routine", icon: CalendarRange },
  { label: "Explore", icon: Search },
  { label: "Workout", icon: Dumbbell },
  { label: "Coach", icon: Bot },
  { label: "Progress", icon: Activity },
  { label: "Profile", icon: UserRound },
];

export function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-mark"><HeartPulse /></span>
      <span><b>CHINNU</b><small>HEALTH + MOVEMENT</small></span>
    </span>
  );
}

export function CloudBadge({ status, compact = false, onClick }: { status: CloudStatus; compact?: boolean; onClick?: () => void }) {
  const map: Record<CloudStatus, { label: string; icon: typeof Cloud }> = {
    local: { label: "On this device", icon: CloudOff },
    connecting: { label: "Connecting", icon: LoaderCircle },
    pulling: { label: "Syncing", icon: RefreshCw },
    saving: { label: "Saving", icon: RefreshCw },
    synced: { label: "Synced", icon: Cloud },
    error: { label: "Sync issue", icon: TriangleAlert },
  };
  const { label, icon: Icon } = map[status];
  return (
    <button className={`cloud-badge status-${status}`} onClick={onClick} title={label}>
      <Icon className={status === "pulling" || status === "saving" || status === "connecting" ? "spin" : ""} />
      {!compact && <span>{label}</span>}
    </button>
  );
}

export function Sidebar({
  section,
  onNavigate,
  profile,
  cloudStatus,
  onProfile,
}: {
  section: Section;
  onNavigate: (section: Section) => void;
  profile: Profile;
  cloudStatus: CloudStatus;
  onProfile: () => void;
}) {
  const initial = (profile.name || "You").trim().charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate("Today")} aria-label="Go to Today">
        <Brand />
      </button>
      <nav aria-label="Main navigation">
        {NAV.map(({ label, icon: Icon }) => (
          <button key={label} className={section === label ? "active" : ""} aria-current={section === label ? "page" : undefined} onClick={() => onNavigate(label)}>
            <Icon /> {label}
            {label === "Coach" && <i className="nav-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-prompt">
        <span><Sparkles /></span>
        <b>{profile.onboarded ? "Your day, in one place" : "Finish your setup"}</b>
        <p>{profile.onboarded ? "Food, movement, recovery, and a coach that remembers the context." : "Add a few details to get targets and a plan that fit you."}</p>
        <button onClick={() => onNavigate(profile.onboarded ? "Today" : "Profile")}>
          {profile.onboarded ? "See today" : "Complete profile"} <Check />
        </button>
      </div>

      <div className="sidebar-account">
        <CloudBadge status={cloudStatus} onClick={onProfile} />
        <button className="sidebar-profile" onClick={onProfile}>
          <span>{initial}</span>
          <div><b>{profile.name || "Your profile"}</b><small>{profile.goal === "lose" ? "Fat loss" : profile.goal === "gain" ? "Muscle gain" : profile.goal === "strength" ? "Strength" : "Feel better"} · {profile.experience}</small></div>
          <UserRound />
        </button>
      </div>
    </aside>
  );
}

export function Topbar({
  section,
  profile,
  cloudStatus,
  onProfile,
}: {
  section: Section;
  profile: Profile;
  cloudStatus: CloudStatus;
  onProfile: () => void;
}) {
  const today = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(new Date());
  return (
    <header className="topbar">
      <div className="topbar-mobile-brand"><Brand /></div>
      <div className="topbar-copy">
        <span className="topbar-kicker">{section}</span>
        <span className="topbar-separator" aria-hidden="true" />
        <span className="topbar-date">{today}</span>
      </div>
      <div className="topbar-actions">
        <CloudBadge status={cloudStatus} compact onClick={onProfile} />
        <button className="avatar" onClick={onProfile} aria-label="Open profile">
          {(profile.name || "You").trim().charAt(0).toUpperCase() || <UserRound />}
        </button>
      </div>
    </header>
  );
}

export function BottomNav({ section, onNavigate }: { section: Section; onNavigate: (section: Section) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {NAV.filter((item) => item.label !== "Profile").map(({ label, icon: Icon }) => (
        <button key={label} className={section === label ? "active" : ""} aria-current={section === label ? "page" : undefined} onClick={() => onNavigate(label)}>
          <Icon /><small>{label}</small>
        </button>
      ))}
    </nav>
  );
}
