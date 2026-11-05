import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Pause, Play, Square, Upload, Volume2, VolumeX, Brain } from "lucide-react";
import { MovementEngine, type Exercise, type Point, type Sample } from "./exercises";
import { createEstimator, drawSkeleton, type PoseEstimator } from "./pose";
import type { Gender, Rep, TrainingSession } from "./types";
import ExerciseGuide from "./ExerciseGuide";
import { aiCoach } from "./lib/aiCoach";
import { attachPoseContext, EQUIPMENT_DETECTION_INTERVAL_MS, EquipmentDetector, type EquipmentDetection } from "./ml/equipmentDetector";
import { useLocale } from "./lib/locale";

const speak = (text: string) => { if (!("speechSynthesis" in window)) return; speechSynthesis.cancel(); const voice = new SpeechSynthesisUtterance(text); voice.rate = 0.95; speechSynthesis.speak(voice); };

function getCoachMode(name: string): "gym" | "yoga" | "pranayama" | "fitness" {
  const n = name.toLowerCase();
  if (n.includes('yoga') || n.includes('warrior') || n.includes('tree') || n.includes('downward') || n.includes('cat') || n.includes('cow')) return 'yoga';
  if (n.includes('breath') || n.includes('prana') || n.includes('kapal') || n.includes('nadi')) return 'pranayama';
  if (n.includes('squat') || n.includes('press') || n.includes('curl') || n.includes('deadlift') || n.includes('lunge')) return 'gym';
  return 'fitness';
}

export default function Trainer({ exercise, gender, onClose, onSaved }: { exercise: Exercise; gender: Gender; onClose: () => void; onSaved: (session: TrainingSession) => void }) {
  const { locale, tr } = useLocale();
  const video = useRef<HTMLVideoElement>(null), canvas = useRef<HTMLCanvasElement>(null), estimator = useRef<PoseEstimator | null>(null);
  const engine = useRef(new MovementEngine(exercise)), stream = useRef<MediaStream | null>(null), sourceUrl = useRef(""), frame = useRef(0), active = useRef(false), paused = useRef(false), isLocalVideo = useRef(false);
  const started = useRef(0), lastMedia = useRef(-1), observations = useRef(0), tracked = useRef(0), scores = useRef<number[]>([]), reps = useRef<Rep[]>([]), lastSpoken = useRef(0), finished = useRef(false);
  const aiInterval = useRef<number | null>(null), lastAICue = useRef("");
  const sceneDetector = useRef<EquipmentDetector | null>(null), detectorGeneration = useRef(0), lastPoseAt = useRef(0), lastSceneAt = useRef(0), sceneInferenceInFlight = useRef(false), latestPosePoints = useRef<Point[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "running" | "paused" | "finished">("idle"), [sample, setSample] = useState<Sample | null>(null), [error, setError] = useState(""), [localVideo, setLocalVideo] = useState(false), [sound, setSound] = useState(true), [progress, setProgress] = useState(0), [showGuide, setShowGuide] = useState(true), [aiEnabled, setAiEnabled] = useState(true), [detectorReady, setDetectorReady] = useState(false), [sceneDetections, setSceneDetections] = useState<EquipmentDetection[]>([]);

  const cleanup = () => {
    active.current = false;
    detectorGeneration.current++;
    sceneDetector.current?.close();
    sceneDetector.current = null;
    sceneInferenceInFlight.current = false;
    latestPosePoints.current = [];
    cancelAnimationFrame(frame.current);
    if (aiInterval.current) { clearInterval(aiInterval.current); aiInterval.current = null; }
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) { video.current.pause(); video.current.srcObject = null; }
    estimator.current?.close();
    estimator.current = null;
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    sourceUrl.current = "";
    speechSynthesis?.cancel();
  };
  useEffect(() => () => cleanup(), []);

  async function start(file?: File) {
    setError(""); setState("loading"); cleanup(); setDetectorReady(false); setSceneDetections([]); lastPoseAt.current = 0; lastSceneAt.current = 0; finished.current = false; engine.current = new MovementEngine(exercise); observations.current = 0; tracked.current = 0; scores.current = []; reps.current = []; lastMedia.current = -1;
    const generation = detectorGeneration.current;
    try {
      estimator.current = await createEstimator();
      if (file) {
        if (file.size > 150 * 1024 * 1024) throw new Error(tr("Choose a video smaller than 150 MB."));
        sourceUrl.current = URL.createObjectURL(file); video.current!.src = sourceUrl.current; isLocalVideo.current = true; setLocalVideo(true);
      } else {
        stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 24 } }, audio: false });
        video.current!.removeAttribute("src"); video.current!.srcObject = stream.current; isLocalVideo.current = false; setLocalVideo(false);
      }
      await video.current!.play();
      if (file && video.current!.duration > 120) throw new Error(tr("Choose a clip up to two minutes."));
      const detector = new EquipmentDetector();
      sceneDetector.current = detector;
      void detector.load().then(ready => {
        if (generation !== detectorGeneration.current || sceneDetector.current !== detector) return;
        setDetectorReady(ready);
      });
      started.current = performance.now(); active.current = true; paused.current = false; setState("running"); if (sound) speak(`Hey, let's do ${exercise.name} together. I'm right here with you.`); 
      if (aiEnabled) {
        aiCoach.setEnabled(true);
        aiCoach.speak(`I've got you. We'll go at your pace. Focus on form, I'll guide you along.`, true);
        aiInterval.current = window.setInterval(async () => {
          if (paused.current || !video.current || !canvas.current || !active.current) return;
          const cue = await aiCoach.getCue(video.current, canvas.current, {
            exercise: exercise.name,
            mode: getCoachMode(exercise.name),
            reps: reps.current.length,
            phase: sample?.phase,
            lastCue: lastAICue.current
          });
          if (cue && sound && cue !== lastAICue.current) {
            lastAICue.current = cue;
            aiCoach.speak(cue);
          }
        }, 5000);
      }
      loop();
    } catch (reason) { cleanup(); setState("idle"); 
    const msg = reason instanceof Error ? reason.message : String(reason);
    if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
      setError(tr("Camera access denied. Please allow camera permissions in your browser settings and try again."));
    } else {
      setError(tr(msg || "Camera or pose model could not start."));
    }
  }
  }

  function loop() {
    if (!active.current) return;
    const current = video.current!;
    const now = performance.now();
    const detector = sceneDetector.current;
    if (!paused.current && detector?.isReady() && !sceneInferenceInFlight.current && now - lastSceneAt.current >= EQUIPMENT_DETECTION_INTERVAL_MS) {
      sceneInferenceInFlight.current = true;
      lastSceneAt.current = now;
      const generation = detectorGeneration.current;
      void detector.detect(current).then(detections => {
        if (detections === null || generation !== detectorGeneration.current || sceneDetector.current !== detector) return;
        const combinedScene = attachPoseContext(detections, latestPosePoints.current);
        setSceneDetections(combinedScene);
      }).catch(() => {
        // Optional scene inference must never interrupt pose tracking.
      }).finally(() => {
        if (generation === detectorGeneration.current) sceneInferenceInFlight.current = false;
      });
    }
    if (!paused.current && current.readyState >= 2 && current.currentTime !== lastMedia.current && now - lastPoseAt.current >= 1000 / 15) {
      lastMedia.current = current.currentTime;
      lastPoseAt.current = now;
      try {
        const points = estimator.current!.estimate(current, now);
        latestPosePoints.current = points;
        const layer = canvas.current!; layer.width = current.videoWidth; layer.height = current.videoHeight;
        const context = layer.getContext("2d")!; context.clearRect(0, 0, layer.width, layer.height); drawSkeleton(context, points, layer.width, layer.height);
        const time = isLocalVideo.current ? current.currentTime : (performance.now() - started.current) / 1000;
        const result = engine.current.update(points, time, layer.width, layer.height);
        observations.current++; if (result.tracked) tracked.current++; if (result.score !== null) scores.current.push(result.score);
        if (result.reps > reps.current.length) reps.current.push({ number: result.reps, score: result.score, time });
        if (sound && result.cue && result.cue !== sample?.cue && performance.now() - lastSpoken.current > 6500) { speak(result.cue); lastSpoken.current = performance.now(); }
        setSample(result); if (isLocalVideo.current && Number.isFinite(current.duration)) setProgress(current.currentTime / current.duration * 100);
      } catch { setError(tr("Pose processing stopped. Restart the session or choose a smaller video.")); cleanup(); setState("idle"); return; }
    }
    if (current.ended && isLocalVideo.current) { finish(); return; }
    frame.current = requestAnimationFrame(loop);
  }

  function togglePause() { 
    paused.current = !paused.current; 
    engine.current.suspend(); 
    setState(paused.current ? "paused" : "running"); 
    if (isLocalVideo.current) paused.current ? video.current?.pause() : void video.current?.play(); 
    speechSynthesis?.cancel(); 
    if (paused.current) {
      cancelAnimationFrame(frame.current);
    } else if (active.current) {
      loop();
    }
  }
  function finish(stopped = false) {
    if (finished.current) return; finished.current = true;
    const duration = Math.round((performance.now() - started.current) / 1000), score = scores.current.length ? Math.round(scores.current.reduce((a, b) => a + b, 0) / scores.current.length) : null;
    const session: TrainingSession = { id: Date.now(), exerciseId: exercise.id, name: exercise.name, date: new Date().toISOString(), duration, reps: reps.current, hold: Math.round(engine.current.hold), score, coverage: observations.current ? tracked.current / observations.current : 0, stopped };
    cleanup(); setState("finished"); onSaved(session);
  }

  const sceneReadyText = locale === "kn" ? "ದೃಶ್ಯ ಪರಿಶೀಲನೆ · ಸಾಧನದಲ್ಲೇ" : locale === "hi" ? "दृश्य जाँच · डिवाइस पर" : "Scene check · on device";
  const poseRuleText = locale === "kn" ? "ಪೋಸ್ + ನಿಯಮ ಆಧಾರಿತ ಟ್ರ್ಯಾಕಿಂಗ್" : locale === "hi" ? "पोज़ + नियम आधारित ट्रैकिंग" : "Pose + rule tracking";
  const nearHandText = locale === "kn" ? "ಕೈ ಹತ್ತಿರ" : locale === "hi" ? "हाथ के पास" : "near hand";
  const sceneAriaLabel = locale === "kn" ? "ಗುರುತಿಸಿದ ಉಪಕರಣ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ವಸ್ತುಗಳು" : locale === "hi" ? "पहचाने गए उपकरण और आसपास की वस्तुएँ" : "Detected equipment and surroundings";
  const yoloSafetyText = locale === "kn" ? "ವಸ್ತು ಗುರುತಿಸುವಿಕೆ ಕಾಣುವ ವಸ್ತುಗಳನ್ನು ಮಾತ್ರ ಗುರುತಿಸುತ್ತದೆ; ಅದು ವ್ಯಾಯಾಮ ಅಥವಾ ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತೆಯನ್ನು ನಿರ್ಧರಿಸುವುದಿಲ್ಲ." : locale === "hi" ? "वस्तु पहचान केवल दिखाई देने वाली चीज़ों को बताती है; यह व्यायाम या चिकित्सीय सुरक्षा का आकलन नहीं करती।" : "Object detection only identifies visible objects; it does not assess exercise or medical safety.";
  return <div className="trainer-page"><div className="trainer-head"><button className="back-btn" onClick={onClose}><ArrowLeft/>{tr("Back")}</button><div><span className="eyebrow">{tr("AI CAMERA COACH · GYM • YOGA • PRANAYAMA • FITNESS")}</span><h2>{exercise.name}</h2><p>{tr(exercise.view)} {tr("view · AI coach speaks naturally to guide you")}</p></div><div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}><span className="trainer-mode">{poseRuleText}</span><button className="sound-btn" onClick={() => { setAiEnabled(v=>{ aiCoach.setEnabled(!v); if(v) aiCoach.speak("AI coach paused. I'll stay quiet now.", true); else aiCoach.speak("AI coach back. Let's keep going together.", true); return !v; }); }} title={tr("Toggle AI Coach")}><Brain/> {tr(aiEnabled ? "AI On" : "AI Off")}</button><button className="sound-btn" onClick={() => { setSound(!sound); speechSynthesis?.cancel(); }}>{sound ? <Volume2/> : <VolumeX/>}{tr(sound ? "Voice on" : "Voice off")}</button></div></div>
    <div className="trainer-layout"><div><div className="camera-stage"><video ref={video} muted playsInline/><canvas ref={canvas}/>{state === "idle" && <div className="camera-empty"><span><Camera/></span><h3>{tr("Your space. Your pace.")}</h3><p>{tr("Place the camera 2-3 m away with your full body visible and light in front of you.")}</p><button className="primary-btn" onClick={() => start()}><Camera/>{tr("Open camera")}</button><label className="soft-btn upload"><Upload/>{tr("Analyze local video")}<input type="file" accept="video/*" onChange={event => event.target.files?.[0] && void start(event.target.files[0])}/></label><small>{tr("Video never uploads. Maximum 2 minutes / 150 MB.")}</small></div>}{state === "loading" && <div className="camera-empty"><i className="spinner"/><h3>{tr("Loading pose model...")}</h3><p>{tr("The first launch can take a few seconds.")}</p></div>}{(state === "running" || state === "paused") && <><div className="stage-status"><b>{tr(localVideo ? "LOCAL VIDEO" : "ON DEVICE")}</b><span>{tr(sample?.tracked ? "Pose tracked" : "Finding pose")}</span></div>{detectorReady && <span className="scene-ready">{sceneReadyText}</span>}{detectorReady && sceneDetections.length > 0 && <div className="scene-context" aria-label={sceneAriaLabel}>{sceneDetections.slice(0, 4).map((item, index) => <span key={item.id + index}>{item.names?.[locale] || item.id.replace(/[_-]/g, " ")}{item.nearHand && <small>{nearHandText}</small>}</span>)}</div>}<div className="stage-metrics"><div><strong>{exercise.phase ? sample?.reps ?? 0 : Math.floor(sample?.hold ?? 0)}</strong><small>{tr(exercise.phase ? "REPS" : "HOLD SECONDS")}</small></div><div><strong>{sample?.score ?? "--"}</strong><small>{tr("EST. QUALITY")}</small></div></div><div className="live-cue">{state === "paused" ? tr("Paused. Take your time.") : sample?.cue || tr("Finding your pose...")}</div></>}</div>{localVideo && state === "running" && <progress value={progress} max="100"/>}{error && <div className="error-box" role="alert">{error}</div>}{(state === "running" || state === "paused") && <div className="session-controls"><button className="soft-btn" onClick={togglePause}>{state === "paused" ? <Play/> : <Pause/>}{tr(state === "paused" ? "Resume" : "Pause")}</button><button className="primary-btn" onClick={() => finish()}><Square/>{tr("Finish")}</button><button className="danger-btn" onClick={() => finish(true)}>{tr("Pain / stop")}</button></div>}{state === "finished" && <div className="success-box"><b>{tr("Session saved locally.")}</b><span>{tr("Your progress dashboard has been updated.")}</span><button className="primary-btn" onClick={onClose}>{tr("View exercises")}</button></div>}</div><aside><button className="guide-toggle" onClick={() => setShowGuide(!showGuide)}>{tr(showGuide ? "Hide" : "Show")} {tr("movement guide")}</button>{showGuide && <ExerciseGuide exercise={exercise} gender={gender}/>}<div className="safety-panel"><b>{tr("Know the limit")}</b><p>{tr("Pose estimates can miss joints and cannot assess load, pain, spinal position, or injury risk. Stop if anything hurts and seek qualified guidance when needed.")}</p><small className="scene-safety-note">{yoloSafetyText}</small></div></aside></div>
  </div>;
}
