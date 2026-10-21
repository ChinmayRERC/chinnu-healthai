import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Pause, Play, Square, Upload, Volume2, VolumeX } from "lucide-react";
import { MovementEngine, type Exercise, type Sample } from "./exercises";
import { createEstimator, drawSkeleton, type PoseEstimator } from "./pose";
import type { Gender, Rep, TrainingSession } from "./types";
import ExerciseGuide from "./ExerciseGuide";

const speak = (text: string) => { if (!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const voice = new SpeechSynthesisUtterance(text); voice.rate = 0.95; speechSynthesis.speak(voice); };

export default function Trainer({ exercise, gender, onClose, onSaved }: { exercise: Exercise; gender: Gender; onClose: () => void; onSaved: (session: TrainingSession) => void }) {
  const video = useRef<HTMLVideoElement>(null), canvas = useRef<HTMLCanvasElement>(null), estimator = useRef<PoseEstimator | null>(null);
  const engine = useRef(new MovementEngine(exercise)), stream = useRef<MediaStream | null>(null), sourceUrl = useRef(""), frame = useRef(0), active = useRef(false), paused = useRef(false), isLocalVideo = useRef(false);
  const started = useRef(0), lastMedia = useRef(-1), observations = useRef(0), tracked = useRef(0), scores = useRef<number[]>([]), reps = useRef<Rep[]>([]), lastSpoken = useRef(0), finished = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "running" | "paused" | "finished">("idle"), [sample, setSample] = useState<Sample | null>(null), [error, setError] = useState(""), [localVideo, setLocalVideo] = useState(false), [sound, setSound] = useState(true), [progress, setProgress] = useState(0), [showGuide, setShowGuide] = useState(true);

  const cleanup = () => { active.current = false; cancelAnimationFrame(frame.current); stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; if (video.current) { video.current.pause(); video.current.srcObject = null; } estimator.current?.close(); estimator.current = null; if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current); sourceUrl.current = ""; speechSynthesis?.cancel(); };
  useEffect(() => () => cleanup(), []);

  async function start(file?: File) {
    setError(""); setState("loading"); cleanup(); finished.current = false; engine.current = new MovementEngine(exercise); observations.current = 0; tracked.current = 0; scores.current = []; reps.current = []; lastMedia.current = -1;
    try {
      estimator.current = await createEstimator();
      if (file) {
        if (file.size > 150 * 1024 * 1024) throw new Error("Choose a video smaller than 150 MB.");
        sourceUrl.current = URL.createObjectURL(file); video.current!.src = sourceUrl.current; isLocalVideo.current = true; setLocalVideo(true);
      } else {
        stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
        video.current!.removeAttribute("src"); video.current!.srcObject = stream.current; isLocalVideo.current = false; setLocalVideo(false);
      }
      await video.current!.play();
      if (file && video.current!.duration > 120) throw new Error("Choose a clip up to two minutes.");
      started.current = performance.now(); active.current = true; paused.current = false; setState("running"); if (sound) speak(`Starting ${exercise.name}. Keep your whole body visible in the ${exercise.view.toLowerCase()} view.`);
      loop();
    } catch (reason) { cleanup(); setState("idle"); setError(reason instanceof Error ? reason.message : "Camera or pose model could not start."); }
  }

  function loop() {
    if (!active.current) return;
    const current = video.current!;
    if (!paused.current && current.readyState >= 2 && current.currentTime !== lastMedia.current) {
      lastMedia.current = current.currentTime;
      try {
        const points = estimator.current!.estimate(current, performance.now());
        const layer = canvas.current!; layer.width = current.videoWidth; layer.height = current.videoHeight;
        const context = layer.getContext("2d")!; context.clearRect(0, 0, layer.width, layer.height); drawSkeleton(context, points, layer.width, layer.height);
        const time = isLocalVideo.current ? current.currentTime : (performance.now() - started.current) / 1000;
        const result = engine.current.update(points, time, layer.width, layer.height); observations.current++; if (result.tracked) tracked.current++; if (result.score !== null) scores.current.push(result.score);
        if (result.reps > reps.current.length) reps.current.push({ number: result.reps, score: result.score, time });
        if (sound && result.cue && result.cue !== sample?.cue && performance.now() - lastSpoken.current > 5500) { speak(result.cue); lastSpoken.current = performance.now(); }
        setSample(result); if (isLocalVideo.current && Number.isFinite(current.duration)) setProgress(current.currentTime / current.duration * 100);
      } catch { setError("Pose processing stopped. Restart the session or choose a smaller video."); cleanup(); setState("idle"); return; }
    }
    if (current.ended && isLocalVideo.current) { finish(); return; }
    frame.current = requestAnimationFrame(loop);
  }

  function togglePause() { paused.current = !paused.current; engine.current.suspend(); setState(paused.current ? "paused" : "running"); if (isLocalVideo.current) paused.current ? video.current?.pause() : void video.current?.play(); speechSynthesis?.cancel(); }
  function finish(stopped = false) {
    if (finished.current) return; finished.current = true;
    const duration = Math.round((performance.now() - started.current) / 1000), score = scores.current.length ? Math.round(scores.current.reduce((a, b) => a + b, 0) / scores.current.length) : null;
    const session: TrainingSession = { id: Date.now(), exerciseId: exercise.id, name: exercise.name, date: new Date().toISOString(), duration, reps: reps.current, hold: Math.round(engine.current.hold), score, coverage: observations.current ? tracked.current / observations.current : 0, stopped };
    cleanup(); setState("finished"); onSaved(session);
  }

  return <div className="trainer-page"><div className="trainer-head"><button className="back-btn" onClick={onClose}><ArrowLeft/>Back</button><div><span className="eyebrow">PRIVATE ON-DEVICE TRAINING</span><h2>{exercise.name}</h2><p>{exercise.view} camera view · pose points stay on this device</p></div><button className="sound-btn" onClick={() => { setSound(!sound); speechSynthesis?.cancel(); }}>{sound ? <Volume2/> : <VolumeX/>}{sound ? "Cues on" : "Cues off"}</button></div>
    <div className="trainer-layout"><div><div className="camera-stage"><video ref={video} muted playsInline/><canvas ref={canvas}/>{state === "idle" && <div className="camera-empty"><span><Camera/></span><h3>Your space. Your pace.</h3><p>Place the camera 2-3 m away with your full body visible and light in front of you.</p><button className="primary-btn" onClick={() => start()}><Camera/>Open camera</button><label className="soft-btn upload"><Upload/>Analyze local video<input type="file" accept="video/*" onChange={event => event.target.files?.[0] && void start(event.target.files[0])}/></label><small>Video never uploads. Maximum 2 minutes / 150 MB.</small></div>}{state === "loading" && <div className="camera-empty"><i className="spinner"/><h3>Loading pose model...</h3><p>The first launch can take a few seconds.</p></div>}{(state === "running" || state === "paused") && <><div className="stage-status"><b>{localVideo ? "LOCAL VIDEO" : "ON DEVICE"}</b><span>{sample?.tracked ? "Pose tracked" : "Finding pose"}</span></div><div className="stage-metrics"><div><strong>{exercise.phase ? sample?.reps ?? 0 : Math.floor(sample?.hold ?? 0)}</strong><small>{exercise.phase ? "REPS" : "HOLD SECONDS"}</small></div><div><strong>{sample?.score ?? "--"}</strong><small>EST. QUALITY</small></div></div><div className="live-cue">{state === "paused" ? "Paused. Take your time." : sample?.cue || "Finding your pose..."}</div></>}</div>{localVideo && state === "running" && <progress value={progress} max="100"/>}{error && <div className="error-box" role="alert">{error}</div>}{(state === "running" || state === "paused") && <div className="session-controls"><button className="soft-btn" onClick={togglePause}>{state === "paused" ? <Play/> : <Pause/>}{state === "paused" ? "Resume" : "Pause"}</button><button className="primary-btn" onClick={() => finish()}><Square/>Finish</button><button className="danger-btn" onClick={() => finish(true)}>Pain / stop</button></div>}{state === "finished" && <div className="success-box"><b>Session saved locally.</b><span>Your progress dashboard has been updated.</span><button className="primary-btn" onClick={onClose}>View exercises</button></div>}</div><aside><button className="guide-toggle" onClick={() => setShowGuide(!showGuide)}>{showGuide ? "Hide" : "Show"} movement guide</button>{showGuide && <ExerciseGuide exercise={exercise} gender={gender}/>}<div className="safety-panel"><b>Know the limit</b><p>Pose estimates can miss joints and cannot assess load, pain, spinal position, or injury risk. Stop if anything hurts and seek qualified guidance when needed.</p></div></aside></div>
  </div>;
}
