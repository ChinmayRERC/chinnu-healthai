import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  Cloud,
  CloudOff,
  Dumbbell,
  Flame,
  LockKeyhole,
  Send,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { useStore } from "../lib/store";
import { buildCoachContext, askCoach, coachOpener, type CoachSource } from "../lib/coach";
import { mealTotals } from "../lib/profile";
import type { ChatMessage } from "../types";

const PROMPTS = [
  "What should I eat for dinner?",
  "Plan a 20-minute home workout",
  "I only have 10 minutes today",
  "How do I stay consistent?",
  "Review my day",
];

export default function Coach({ onNavigate }: { onNavigate: (section: "Workout" | "Explore" | "Today" | "Progress") => void }) {
  const { data, targets, addChat, clearChat, update } = useStore();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastSource, setLastSource] = useState<CoachSource | null>(null);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const consent = data.settings.cloudConsent;
  const totals = mealTotals(data.day.meals);

  const opener = useMemo(() => coachOpener(data, targets), [data, targets]);

  const messages: ChatMessage[] = data.chat.length
    ? data.chat
    : [{ id: -1, from: "ai", text: opener, at: new Date().toISOString() }];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [data.chat.length, busy]);

  async function submit(textOverride?: string) {
    const text = (textOverride || input).trim();
    if (!text || busy) return;
    setInput("");
    setError("");
    setBusy(true);
    const now = new Date().toISOString();
    addChat({ id: Date.now(), from: "me", text, at: now });
    try {
      const reply = await askCoach(
        text,
        buildCoachContext(data, targets),
        [...data.chat, { id: Date.now(), from: "me" as const, text, at: now }].slice(-12).map((message) => ({ from: message.from as "ai" | "me", text: message.text })),
        true,
      );
      addChat({ id: Date.now() + 1, from: "ai", text: reply.text, at: new Date().toISOString() });
      setLastSource(reply.source);
      if (reply.source === "local") setError("");
    } catch {
      setError("The coach could not answer right now. Your local trackers are still working.");
    } finally {
      setBusy(false);
    }
  }

  function toggleConsent() {
    update((current) => ({
      ...current,
      settings: { ...current.settings, cloudConsent: !current.settings.cloudConsent },
    }));
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.97;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="page coach-page-v2">
      <section className="coach-head-v2">
        <div>
          <span className="eyebrow"><Sparkles /> YOUR PRIVATE COACH</span>
          <h1>A clearer next step,<br /><em>without the noise.</em></h1>
          <p>Ground your questions in today&apos;s food, movement, and recovery. The coach gives general wellness guidance—not diagnosis.</p>
        </div>
        <div className="coach-status-card">
          <span className={consent ? "status-orb on" : "status-orb"}>{consent ? <Cloud /> : <CloudOff />}</span>
          <div><b>{consent ? "Cloud AI enabled" : "On-device guidance"}</b><small>{consent ? "Messages and your compact day summary are sent to the AI endpoint." : "Replies use your logs locally. No message leaves the device."}</small></div>
          <button className={consent ? "soft-btn" : "primary-btn"} onClick={toggleConsent}>{consent ? "Use local" : "Enable cloud"}</button>
        </div>
      </section>

      <div className="coach-layout-v2">
        <aside className="coach-context-v2">
          <article className="panel">
            <span className="eyebrow">WHAT THE COACH SEES</span>
            <h2>Today&apos;s context</h2>
            <div className="context-list">
              <span><Flame /><div><b>{Math.max(0, targets.calories - Math.round(totals.calories)).toLocaleString()} kcal</b><small>remaining today</small></div></span>
              <span><Dumbbell /><div><b>{Math.max(0, targets.protein - Math.round(totals.protein))} g</b><small>protein remaining</small></div></span>
              <span><Brain /><div><b>{data.day.sleep || "—"} h</b><small>sleep logged</small></div></span>
              <span><Sparkles /><div><b>{data.workout.length} exercises</b><small>in your plan</small></div></span>
            </div>
            <div className="context-privacy"><LockKeyhole /><p>No camera frames, microphone audio, or browsing data are shared.</p></div>
          </article>

          <article className="panel coach-quick-card">
            <span className="eyebrow">SHORTCUTS</span>
            <h3>Jump to a tool</h3>
            <button onClick={() => onNavigate("Workout")}><Dumbbell /> Open my plan <ArrowRight /></button>
            <button onClick={() => onNavigate("Explore")}><Sparkles /> Find an exercise <ArrowRight /></button>
            <button onClick={() => onNavigate("Progress")}><Flame /> See my progress <ArrowRight /></button>
          </article>

          <article className="panel coach-safety-card">
            <span className="eyebrow">WHEN TO GET A PERSON</span>
            <p>For chest pain, breathing trouble, fainting, severe pain, pregnancy concerns, or an eating disorder, contact a qualified professional or local emergency service. In India, Tele-MANAS is <b>14416</b>.</p>
          </article>
        </aside>

        <section className="chat-panel-v2">
          <header className="chat-header-v2">
            <div className="chat-avatar"><Bot /></div>
            <div>
              <h2>Chinnu Coach</h2>
              <p><i className={busy ? "online" : ""} /> {busy ? "Thinking with your context…" : lastSource === "cloud" ? "Cloud reply · general guidance" : "Ready · private by default"}</p>
            </div>
            {data.chat.length > 0 && <button className="icon-btn" onClick={() => { clearChat(); setLastSource(null); }} title="Clear chat" aria-label="Clear chat"><Trash2 /></button>}
          </header>

          <div className="prompt-row-v2">
            {PROMPTS.map((prompt) => <button key={prompt} onClick={() => void submit(prompt)} disabled={busy}>{prompt}</button>)}
          </div>

          <div className="chat-messages-v2" aria-live="polite">
            {messages.map((message) => (
              <div className={`chat-message ${message.from}`} key={message.id}>
                {message.from === "ai" && <span className="message-avatar"><Bot /></span>}
                <div>
                  <p>{message.text}</p>
                  {message.from === "ai" && message.id !== -1 && (
                    <button className="message-speak" onClick={() => speak(message.text)} aria-label="Read reply aloud"><Volume2 /> Read aloud</button>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="chat-message ai"><span className="message-avatar"><Bot /></span><div className="typing-bubble"><i /><i /><i /></div></div>}
            <div ref={endRef} />
          </div>

          {error && <div className="coach-inline-note">{error}</div>}

          {!consent && (
            <div className="local-mode-note">
              <CloudOff />
              <p><b>Local mode.</b> Replies are built on-device from your logs. Enable cloud AI for a more conversational answer.</p>
              <button onClick={toggleConsent}>Enable</button>
            </div>
          )}

          <form className="chat-composer-v2" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about food, training, sleep, or habits…"
              aria-label="Message the coach"
              maxLength={800}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send message"><Send /></button>
          </form>
          <p className="coach-disclaimer">General wellness support, not medical advice, diagnosis, or emergency care. If you are in immediate danger, call your local emergency number.</p>
        </section>
      </div>
    </div>
  );
}
