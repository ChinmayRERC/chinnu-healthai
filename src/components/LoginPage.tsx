import { useState } from "react";
import { ArrowRight, Check, Cloud, HeartPulse, LoaderCircle, LockKeyhole, Mail, ShieldCheck, X } from "lucide-react";
import { useLocale, LanguageSelect } from "../lib/locale";
import { useStore } from "../lib/store";

export type LegalPage = "terms" | "privacy" | null;

export default function LoginPage({ onContinue }: { onContinue: () => void }) {
  const { t } = useLocale();
  const { signIn, signInWithOAuth, cloudConfig } = useStore();
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [legalPage, setLegalPage] = useState<LegalPage>(null);

  function checkAgreement() {
    if (accepted) return true;
    setError(true);
    setMessage(t("required"));
    return false;
  }

  async function sendLink(event: React.FormEvent) {
    event.preventDefault();
    if (!checkAgreement()) return;
    setBusy(true);
    setMessage("");
    const result = await signIn(email);
    setBusy(false);
    setError(!result.ok);
    setMessage(result.ok ? t("checkInbox") : result.error || t("noConfig"));
  }

  async function oauth(provider: "google" | "github") {
    if (!checkAgreement()) return;
    setBusy(true);
    setMessage("");
    const result = await signInWithOAuth(provider);
    setBusy(false);
    if (!result.ok) {
      setError(true);
      setMessage(result.error || t("noConfig"));
    }
  }

  return (
    <main className="login-page">
      <div className="login-topbar">
        <a className="login-brand" href="#" aria-label="Chinnu HealthAI home" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><HeartPulse /></span>
          <span><b>CHINNU</b><small>HEALTH + MOVEMENT</small></span>
        </a>
        <LanguageSelect />
      </div>

      <div className="login-layout">
        <section className="login-story" aria-label={t("tagline")}>
          <span className="login-kicker"><span /> PRIVATE BY DEFAULT</span>
          <h1>{t("tagline")}</h1>
          <p>{t("intro")}</p>
          <div className="login-story-note"><ShieldCheck /><span>{t("legalTitle")}<small>{t("healthNote")}</small></span></div>
          <div className="login-decor" aria-hidden="true"><i /><i /><i /><span><HeartPulse /></span></div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading"><span className="login-card-icon"><LockKeyhole /></span><span className="login-secure"><ShieldCheck /> SECURE SIGN-IN</span></div>
          <h2 id="login-title">{t("loginTitle")}</h2>
          <p className="login-card-copy">{t("loginCopy")}</p>

          <form onSubmit={sendLink}>
            <label className="login-field"><span>{t("email")}</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} autoComplete="email" required /></label>
            <button className="login-submit" type="submit" disabled={busy || !cloudConfig}>
              {busy ? <LoaderCircle className="spin" /> : <Mail />}{busy ? t("sending") : t("sendLink")} {!busy && <ArrowRight />}
            </button>
          </form>

          {!cloudConfig && <p className="login-config-note"><Cloud /> {t("noConfig")}</p>}

          <div className="login-divider"><span />{t("separator")}<span /></div>
          <div className="login-oauth">
            <button type="button" className="login-oauth-button" disabled={busy || !cloudConfig} onClick={() => void oauth("google")}><GoogleMark />{t("oauthGoogle")}</button>
            <button type="button" className="login-oauth-button" disabled={busy || !cloudConfig} onClick={() => void oauth("github")}><GitHubMark />{t("oauthGithub")}</button>
          </div>

          <label className="login-consent"><input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setError(false); setMessage(""); }} /><span>{t("agree")} <button type="button" onClick={(event) => { event.preventDefault(); setLegalPage("terms"); }}>{t("terms")}</button> {t("and")} <button type="button" onClick={(event) => { event.preventDefault(); setLegalPage("privacy"); }}>{t("privacy")}</button>.</span></label>
          {message && <div className={`login-message${error ? " error" : ""}`} role={error ? "alert" : "status"}>{!error && <Check />} {message}</div>}

          <div className="login-encryption"><LockKeyhole /><span>{t("privacySafe")}<small>{t("encryption")}</small></span></div>
          <div className="login-guest"><p>{t("guestCopy")}</p><button type="button" onClick={onContinue}>{t("guest")} <ArrowRight /></button></div>
        </section>
      </div>
      <footer className="login-footer"><span>© {new Date().getFullYear()} Chinnu HealthAI</span><button onClick={() => setLegalPage("terms")}>{t("terms")}</button><button onClick={() => setLegalPage("privacy")}>{t("privacy")}</button></footer>

      {legalPage && <LegalDialog page={legalPage} onClose={() => setLegalPage(null)} />}
    </main>
  );
}

function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-2 3.02v2.47h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.47c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H3.08v2.55A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.42 13.94a6.02 6.02 0 0 1 0-3.88V7.5H3.08a10 10 0 0 0 0 9Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.78.5 3.82 1.5l2.87-2.87C16.95 2.96 14.7 2 12 2a10 10 0 0 0-8.92 5.5l3.34 2.56C7.2 7.7 9.4 5.94 12 5.94Z"/></svg>;
}

function GitHubMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.74 2.53 3.57 1.8.1-.73.4-1.22.72-1.5-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.1-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.16 1.78 1.16 3 0 4.27-2.61 5.21-5.1 5.49.4.35.76 1.02.76 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>;
}

export function LegalDialog({ page, onClose }: { page: Exclude<LegalPage, null>; onClose: () => void }) {
  const { t } = useLocale();
  const terms = page === "terms";
  const sections = terms
    ? [[t("term1Title"), t("term1")], [t("term2Title"), t("term2")], [t("term3Title"), t("term3")], [t("term4Title"), t("term4")], [t("term5Title"), t("term5")]]
    : [[t("priv1Title"), t("priv1")], [t("priv2Title"), t("priv2")], [t("priv3Title"), t("priv3")], [t("priv4Title"), t("priv4")], [t("priv5Title"), t("priv5")], [t("priv6Title"), t("priv6")]];
  return (
    <div className="legal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <header><div><span className="legal-eyebrow"><ShieldCheck /> {t("legalTitle")}</span><h2 id="legal-title">{terms ? t("termsTitle") : t("privacyTitle")}</h2><small>{t("lastUpdated")}</small></div><button aria-label={t("close")} onClick={onClose}><X /></button></header>
        <p className="legal-intro">{terms ? t("termsIntro") : t("privacyIntro")}</p>
        <div className="legal-sections">{sections.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <footer><span>{t("healthNote")}</span><button className="primary-btn" onClick={onClose}>{t("close")}</button></footer>
      </section>
    </div>
  );
}
