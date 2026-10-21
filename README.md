# Chinnu HealthAI

An original health and movement companion built with React 19, TypeScript, Vite, and Tauri 2.

## Included

- Daily nutrition, hydration, steps, sleep, and weight dashboard
- Interactive front/back muscle map and 15 original guided movements
- Persistent Male or Female profile selection with matching body maps and exercise illustrations
- Search and Gym, Yoga, and Breathing filters
- Original movement diagrams, setup instructions, and safety notes
- Configurable workout builder with sets, targets, set completion, and 60-second rest timer
- On-device MediaPipe camera and local-video pose guidance
- Rep and hold tracking, visible-pose quality estimates, spoken local cues, and session history
- Progress dashboard for measured sessions, completed workouts, and recovery signals
- Chinnu text coach using the existing Render/NVIDIA service
- Explicit-consent NVIDIA microphone coach with a clear offline fallback
- Local persistence through `localStorage`
- Responsive desktop and mobile layouts

## Privacy model

Daily data, workouts, session history, selected videos, and camera frames stay on the device. The pose model runs locally. Selected video files are opened with an object URL and are not uploaded.

Text prompts and the compact day/workout context are sent to `https://chinnu-ai.onrender.com` when the coach is used. Microphone audio is sent only after the user checks the consent box and enables voice. Provider credentials remain on the server.

## Run

```bash
npm install
npm run dev
```

Build the web app:

```bash
npm run build
```

Build the macOS Tauri app:

```bash
npm run tauri build
```

The verified debug bundle is produced at `src-tauri/target/debug/bundle/macos/Chinnu HealthAI.app`.

## Local pose assets

The app bundles MediaPipe Tasks Vision and the Pose Landmarker Lite model under `public/models`. The model and WASM runtime are loaded from the packaged app, not a CDN. The upstream Apache 2.0 notice is retained at `public/mediapipe-LICENSE.txt`.

## Platform notes

- macOS camera and microphone usage descriptions are in `src-tauri/Info.plist`.
- Camera and microphone access still require user approval from the operating system.
- Android packaging requires the Tauri Android prerequisites and generated mobile project permissions before release testing.
- Local speech cues depend on the WebView's speech-synthesis support; visual cues remain available without it.
- Cloud voice requires network access, Web Audio, AudioWorklet, and microphone support in the host WebView.

## Safety limits

This app supports general wellness and exercise practice. Pose estimates can miss joints and cannot assess pain, injury, force, load, spinal curvature, or whether a movement is medically appropriate. Exercise diagrams and thresholds are instructional prototypes and should receive qualified expert review before clinical or prescriptive use.

## Attribution boundary

The product recreates common health and workout workflows with original Chinnu code, copy, diagrams, styling, and exercise data. It does not include MuscleWiki code, branding, artwork, videos, or proprietary exercise content.
