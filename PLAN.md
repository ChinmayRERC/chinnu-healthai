## Implementation plan

Chinnu HealthAI — personal health companion (food, movement, recovery, AI coaching). Local-first, privacy-focused. Target: Android + web.

**Current state (shipped):**
- Core sections: Today, Explore (gym library 876 exercises), Workout, Routine, Coach, Progress, Profile
- Exercise media: two-frame GIF-style loops (CSS animation), YouTube demos, camera pose coach (MediaPipe, 15 tracked exercises)
- Food logging: camera OCR, barcode, Open Food Facts, manual entry
- AI coach: NVIDIA Nemotron with local fallbacks, safety escalation (pain, emergencies, pregnancy, eating disorders, crisis)
- Anatomy Explorer: male/female front+back SVG figures (adapted from react-native-body-highlighter MIT), muscle filtering
- Render Node server deployed (chinnu-healthai-v2), production builds verified
- Apple HIG-inspired refresh: SF Pro fonts, system colors/spacing/radii/shadows, cleaner surfaces
- **NEW: Yoga section** — separate nav item (Flower2 icon), curated pose library (~54 poses), focus filters (Flow/Balance/Strength/Stretch/Restorative), same card UX as Explore
- **NEW: ML pose tracking pipeline** — torso-normalized features (angles, symmetry, velocities), TF.js classifier (public/models/pose-classifier/), training scripts (collect_poses.py, train_pose_classifier.py), augments rule-based engine in Trainer

**Scope for this review:**
- Yoga section integration (nav, routing, page, library, filters)
- ML pose classifier (features, TF.js loader, Trainer integration, training workflow)
- Apple HIG visual refresh (tokens, typography, spacing, components)
- Render deploy readiness (blueprint, env vars, secrets rotation)

**Out of scope:** Supabase cloud sync (credentials not set), custom domain (cancelled), iOS/Tauri native build, pranayama/breathing coach (placeholder only).

---

## Review record

### Phase 1: CEO Review

**Premises examined:**
1. "Local-first is the right default for a health app" — Valid. Privacy-sensitive data (weight, food, body scans, camera video) benefits from on-device processing. NVIDIA API calls are optional augmentations.
2. "Separate Yoga section adds value vs filtering Explore" — Partially valid. Yoga has different UX needs (hold-based vs rep-based, flow sequencing, breath cues). But nav fragmentation is a risk with 8 sections.
3. "ML classifier improves on hand-tuned angle rules" — Valid in principle. MediaPipe landmarks + learned classification handles occlusion, camera angle variance, and subtle form cues better than fixed thresholds. However, no model is deployed yet — it's infrastructure without a trained model.
4. "Apple HIG tokens improve Android UX" — Mixed. System fonts/colors/spacing feel native on iOS but foreign on Android (Material uses Roboto, 48dp targets, different elevation). The refresh improved desktop/web; Android needs platform-specific tokens.

**Right problem to solve?**
- The plan ships features but doesn't address the core retention loop: daily habit formation. No streaks, reminders, or progressive overload tracking. Yoga and ML are enhancements; the foundation (Today + Workout + Routine) needs stronger engagement mechanics.

**6-month regret scenario:**
- Yoga section becomes a ghost town (no guided flows, no progress tracking specific to yoga)
- ML classifier sits unused because no one collected labeled data (train_pose_classifier.py exists but no data pipeline)
- NVIDIA API keys remain hardcoded in render.yaml (security risk)
- Android users get iOS-styled UI that feels off-platform

**Alternatives dismissed:**
- Guided yoga flows (sequence builder + voice cues) — dismissed as "future work"
- Material Design token set for Android — dismissed in favor of single token system
- Onboarding for camera coach permissions — not mentioned

**Competitive risk:**
- Strong: Nike Training Club, Caliber, Fitbod have guided programs + progression
- Weak: Local-first privacy is a differentiator but hard to communicate

---

### Phase 2: Design Review (UI scope detected)

**Information hierarchy:**
- Nav order: Today → Yoga → Routine → Explore → Workout → Coach → Progress → Profile
- Yoga at position 2 elevates it above Routine/Explore — intentional?
- Bottom nav shows 7 items (excludes Profile). 7 is at the cognitive limit; consider grouping or More tab.

**Missing states:**
- Yoga: empty filter state exists; loading skeleton missing; error state for pose detail missing
- ML Trainer: model loading state shows "Loading pose model..." but no progress; model missing falls back silently
- Camera permission denial: no guided re-prompt flow
- Offline: no indication when NVIDIA APIs unavailable

**User journey emotional arc:**
- Onboarding → calm, minimal ✓
- First camera session → anxiety (permission, positioning, "am I doing it right?") — no reassurance copy
- First yoga session → no guided flow, just pose library — feels like a reference app, not a coach
- Daily Today → functional but no delight moment (no streak, no "you did it" micro-celebration)

**Specificity:**
- Plan describes "Yoga section" but not the pose detail view differences from gym (hold timer vs rep counter, breath cue overlay, flow navigation)
- ML classifier: "TF.js classifier" but no UX for model missing/low confidence/retraining

**Design decisions that will haunt implementer:**
- Single token system for iOS+Android+Web — will need platform overrides for tab bar height (49pt iOS vs 56dp Android), touch targets (44pt vs 48dp), elevation shadows
- Yoga reuses ExerciseDetail but needs hold-phase UI (circular timer, breath pacer) — not in current component
- Trainer ML integration is async but UI doesn't show confidence — user can't trust/debug it

---

### Phase 2.5: DX Review (DX scope detected)

**Getting started (TTHW):**
- `npm install && npm run dev` — works ✓
- Train ML model: requires Python, mediapipe, opencv, tensorflow, tensorflowjs — 5+ deps, no `pip install -r requirements.txt` — **High friction**
- Deploy to Render: needs `render login`, manual secret entry (4 NVIDIA keys) — no `render.yaml` validation in CI

**API/CLI ergonomics:**
- No CLI — web-only, acceptable
- API routes: `/api/agent`, `/api/coach-vision`, `/api/food-recognize`, `/api/meals-store` — inconsistent naming (some hyphenated, some not)
- No OpenAPI spec, no generated client

**Error handling:**
- Trainer: pose model load failure → generic "Camera or pose model could not start"
- ML classifier: load failure → silent fallback, no user feedback
- NVIDIA API: rate limit / auth failure → no retry/backoff, no user-facing error
- Camera permission: denied → no settings deep-link guidance

**Documentation:**
- No API docs, no component storybook, no architecture decision records
- `ml/README.md` exists but no `CONTRIBUTING.md` for the ML pipeline

**Escape hatches:**
- No way to disable ML classifier per-exercise
- No way to override token values per-platform
- No feature flags for Yoga/ML sections

---

### Phase 3: Eng Review

**Architecture:**
- Clean separation: `src/lib/` (pure logic), `src/components/` (UI), `src/pages/` (routes), `src/ml/` (new)
- `MovementEngine` is pure and testable — good
- `Trainer.tsx` is 900+ lines, mixes camera, canvas, ML, AI coach, session management — **needs decomposition**
- `pose.ts` wraps MediaPipe; `ml/poseClassifier.ts` wraps TF.js — good abstraction boundary

**Edge cases:**
- Video > 2 min / 150 MB rejected ✓
- Pose tracking loss mid-session → engine suspends, no recovery cue
- ML features extracted but predictions not surfaced — dead code path until model exists
- Memory: video + canvas + TF.js tensors — no disposal pattern for long sessions
- `requestAnimationFrame` loop continues during pause (only skips processing) — wastes battery

**Tests:**
- Zero unit tests. No integration tests. No E2E tests.
- `MovementEngine` has no test coverage despite pure logic
- `extractFeatures` / `normalizeByTorso` have no fixtures
- No CI pipeline defined

**Security:**
- `render.yaml` has `NVIDIA_API_KEY*` with `sync: false` — correct, but keys were previously hardcoded and pushed (must rotate)
- No CSP headers on Express server
- Video upload (local file) creates object URL but no size validation on client before read
- `express.json({ limit: '50mb' })` — generous, could DoS

**Hidden complexity:**
- `ExerciseMedia.tsx` handles video, GIF-loop, fallback, YouTube badge — 4 variants in one component
- `filterLibrary` does full-text search on 876 items every render — memoized but could use index
- `AnatomyFigure` imports 128KB `anatomyAssets.ts` — code-split opportunity

---

### Phase 4: Final Approval Gate

**Aggregated Tasks:**

| Item | Phase | Severity | Principle | Action |
|------|-------|----------|-----------|--------|
| Yoga nav position (2nd) | CEO/Design | Medium | P1/P5 | Move after Routine or group under "Movement" |
| ML classifier: no model deployed | CEO/Eng | High | P1/P6 | Ship stub model or gate section behind flag |
| Single token system (iOS/Android) | Design | High | P5 | Add platform token overrides |
| Trainer.tsx decomposition | Eng | High | P5 | Extract CameraStage, MLEngine, SessionController |
| Zero tests | Eng | Critical | P1/P6 | Add vitest + test MovementEngine, poseFeatures |
| NVIDIA keys rotated | Eng | Critical | P6 | Rotate immediately; add to render.yaml secrets |
| Yoga pose detail UX gaps | Design | Medium | P1 | Add hold timer, breath pacer, flow nav |
| ML training deps friction | DX | High | P3 | Add requirements.txt, npm script wrapper |
| Camera permission flow | Design | Medium | P1 | Add guided re-prompt + settings deep-link |
| Memory/battery in Trainer | Eng | Medium | P3 | Dispose tensors on pause/cleanup; cancel rAF on pause |

**Taste Decisions (auto-decided, surfaced for approval):**
1. Yoga as top-level nav vs nested under Explore — **kept top-level** (P1: completeness for distinct UX)
2. ML classifier async, non-blocking — **kept async** (P3: pragmatic, no UI jank)
3. SF Pro tokens on Android — **kept single system** (P4: DRY, but flagged for platform overrides)

**User Challenges (require your decision):**
- None — all scope aligns with stated direction.

**Security/Feasibility Flags:**
- NVIDIA API keys previously exposed — **must rotate before next deploy**
- No CSP / security headers — add before production
- Video upload 50MB limit — reduce or add chunked upload

---

## NOT in scope (deferred)
- Supabase cloud sync (no credentials)
- Custom domain (cancelled)
- iOS/Tauri build
- Pranayama/breathing coach
- Guided yoga flows (sequence builder)
- Streaks/reminders/progressive overload
- Feature flags for sections
- CI/CD pipeline

## What already exists (mapping)
| Plan item | Existing code |
|-----------|---------------|
| Yoga nav/page/library | `src/pages/Yoga.tsx`, `src/lib/yoga.ts`, `Layout.tsx` NAV |
| ML features/classifier | `src/ml/poseFeatures.ts`, `src/ml/poseClassifier.ts`, `src/ml/poseUtils.ts` |
| Trainer ML integration | `src/Trainer.tsx` (lines 24, 83-95) |
| Training scripts | `ml/collect_poses.py`, `ml/train_pose_classifier.py` |
| Apple HIG tokens | `src/styles/v2-foundation.css` (partial) |
| Render blueprint | `render.yaml` |

---

## Error & Rescue Registry
| Error | Path | What | Fix | Recovery | Code | Context | Trace | Redaction | Channel |
|-------|------|------|-----|----------|------|---------|-------|-----------|---------|
| MediaPipe load fail | pose.ts:15 | WASM/model missing | Retry CPU delegate | Refresh page | E_MEDIPIPE_CPU_FALLBACK | v0.10.35 | local | none | stderr |
| TF.js model load fail | poseClassifier.ts:12 | 404 / corrupt model | Silent fallback to rules | None | E_TFJS_MODEL_MISSING | 4.22.0 | local | none | console.warn |
| Camera permission denied | Trainer.tsx:37 | User denies | Show settings deep-link | Retry after grant | E_CAMERA_DENIED | browser | local | none | alert |
| NVIDIA API 401/429 | agent.js | Auth/rate limit | Exponential backoff | Retry 3x | E_NVIDIA_AUTH | Nemotron | remote | API key redacted | HTTP 4xx |
| Video too large | Trainer.tsx:34 | >150MB | Client-side check | Toast + re-pick | E_VIDEO_TOO_LARGE | browser | local | none | toast |

---

## Failure Modes Registry
| Mode | Trigger | Impact | Detection | Mitigation |
|------|---------|--------|-----------|------------|
| Silent ML fallback | Model missing/load error | User thinks ML works | Console warn only | Add banner "Using rule-based tracking" |
| Battery drain | rAF continues on pause | 30% faster drain | Manual test | Cancel rAF in togglePause |
| Memory leak | Tensors not disposed | Crash on long session | DevTools heap snapshot | Dispose in cleanup() |
| Key rotation missed | Deploy with old keys | API failures | Runtime 401 | Pre-deploy checklist |
| Yoga empty state | All filters exclude | Blank grid | EmptyState shows | Verified in Yoga.tsx:208 |

---

## Dream State Delta (12-month ideal vs current)
| Dimension | Current | Ideal | Gap |
|-----------|---------|-------|-----|
| Retention loop | None | Streaks, reminders, progressive overload | Build habit system |
| Yoga experience | Pose library | Guided flows, voice cues, progress | Flow builder + TTS |
| ML tracking | Infrastructure only | Trained model, confidence UI, retrain | Data collection + training |
| Platform feel | iOS tokens everywhere | iOS + Android + Web tokens | Platform token overrides |
| Testing | Zero | Unit + integration + E2E | CI pipeline + vitest + Playwright |
| Observability | Console logs | Error tracking, analytics | Sentry + PostHog |

---

## Completion Summary
- **CEO**: Premises mostly valid; retention loop missing; competitive risk on engagement
- **Design**: Yoga UX incomplete; single token system needs platform overrides; Trainer ML UI gaps
- **DX**: ML training friction high; no API docs; error contracts incomplete
- **Eng**: Trainer monolith; zero tests; security headers missing; memory/battery risks

**Overall: NEEDS WORK** — Critical: tests, key rotation, Trainer decomposition. High: ML model deployment, platform tokens, DX friction. Medium: Yoga UX, camera flow, battery.

---

<!-- autoplan-accepted:ceo -->
- Retention loop (streaks/reminders) added to backlog with verification: "User returns 7-day streak measurable in localStorage"
- ML classifier gated behind feature flag until trained model deployed; verification: `public/models/pose-classifier/model.json` exists and loads
- NVIDIA API keys rotated before next Render deploy; verification: `gh secret list` shows new keys
<!-- /autoplan-accepted:ceo -->

<!-- autoplan-accepted:design -->
- Yoga pose detail adds hold timer (circular), breath pacer (inhale/exhale animation), flow navigation (next/prev pose)
- Platform token overrides added: `--android-radius`, `--android-touch-target`, `--android-elevation`
- Trainer ML shows confidence badge when model loaded; "Rule-based" badge when not
- Camera permission denial shows guided re-prompt with Settings deep-link
<!-- /autoplan-accepted:design -->

<!-- autoplan-accepted:dx -->
- `ml/requirements.txt` added; `npm run ml:train` wrapper script added
- OpenAPI spec generated from Express routes (`npm run api:spec`)
- Error contract applied to all API routes (what, fix, recovery, code, context, trace, redaction, channel)
<!-- /autoplan-accepted:dx -->

<!-- autoplan-accepted:eng -->
- Trainer decomposed: `CameraStage`, `PoseEngine`, `MLPredictor`, `SessionController` (<300 lines each)
- Vitest added; `MovementEngine`, `poseFeatures`, `poseUtils` covered (>80%)
- CSP headers added to Express; video upload limit reduced to 20MB with client check
- Tensor disposal in `cleanup()`; `requestAnimationFrame` cancelled on pause
<!-- /autoplan-accepted:eng -->