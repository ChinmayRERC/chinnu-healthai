# Chinnu AI feature catalogue

Reviewed: 19 October 2026

Sources:

- Live deployment: `https://chinnu-ai.onrender.com/`
- Local source: `/Users/chinmaya/Downloads/naturalgym/chinnu-ai/`
- Local Android build: `/Users/chinmaya/Downloads/naturalgym/chinnu-ai-debug.apk`
- Project documentation and tests in the local source tree
- REA static analysis of the current live JavaScript bundle: Evidence `ev_f66590882fc1244751bd1cd8e005ea8f0c300daf645f7f5d5ce65948971f5aeb`

The live site returned HTTP 200 and served a PWA named **CHINNU-AI**. The live bundle SHA-256 was `33ea7e87f9a1fb573c3ca11050b36eb2ffa818356ba6e9d0b3be5b5f7831aaba`. The local `dist` bundle has a different filename, so live behavior was checked separately from the source tree. REA recovered imports, network endpoints and local-storage relationships, but its deeper semantic pass reached a heap limit; feature details below are therefore cross-checked against the readable local source and tests rather than inferred from the bundle alone.

## Status legend

- **Available** — implemented in the current source and represented by the deployed bundle or verified build records.
- **Partial** — useful implementation exists, but it is intentionally limited or requires user review.
- **Android-only** — depends on the Capacitor Android shell or Android APIs.
- **Cloud-dependent** — needs the Render/NVIDIA service and available quota.
- **Listed, not connected** — the app explains the capability but does not claim that it works.

## 1. App shell, navigation and onboarding

- **Available:** Responsive light web interface.
- **Available:** Installable PWA manifest with standalone display mode.
- **Available:** Capacitor Android application shell and debug APK.
- **Available:** Animated CHINNU-AI launch screen with reduced-motion support.
- **Available:** Desktop sidebar, mobile bottom navigation and mobile feature navigation.
- **Available:** Main destinations: Today, Train, Nutrition, Health, Plans, Progress, Journal, More and Settings.
- **Available:** Three-step local onboarding.
- **Available:** Name, goal, experience level and optional height profile fields.
- **Available:** Goals: Strength, Flexibility, Consistency and General wellbeing.
- **Available:** Experience levels: Beginner, Some experience and Experienced.
- **Available:** Screening for injury/pain, pregnancy, blood-pressure concerns, recent surgery and limited mobility.
- **Available:** Explicit consent for local pose processing and local profile/history storage.
- **Available:** Conservative mode derived from screening and mobility selections.
- **Available:** Restrictions apply consistently to touch, text-agent and voice-agent actions.
- **Available:** Private-by-design and local-first explanations throughout the UI.

## 2. Today dashboard and recommendations

- **Available:** Personalized greeting and current local date.
- **Available:** Current real-session streak.
- **Available:** “Start a session” hero action.
- **Available:** Dashboard statistics for completed sessions, latest estimated form quality and total time in motion.
- **Available:** Suggested practice based on profile goal.
- **Available:** Gentler recommendation when the latest check-in reports high soreness.
- **Available:** Conservative-mode recommendations when screening flags are present.
- **Available:** Quick routes to strength, yoga and breathing practices.
- **Available:** Daily overview cards for food, water, manual steps and active plans.
- **Available:** Educational sleep/wind-down card linked to its public basis.
- **Available:** Voice setup entry point.
- **Available:** Clear “experimental, not medical advice” notices.

## 3. Exercise and yoga library

- **Available:** Searchable exercise library.
- **Available:** Category filtering for All, Gym, Yoga and Breathing.
- **Available:** Six gym references:
  - Squat
  - Push-up
  - Lunge
  - Plank
  - Bicep curl
  - Hip hinge
- **Available:** Eight yoga references:
  - Mountain
  - Warrior II
  - Supported Tree
  - Chair
  - Triangle
  - Downward Dog
  - Cobra
  - Child’s pose
- **Available:** Seated breathing practice.
- **Available:** Each exercise has setup guidance, three written steps and a specific caution.
- **Available:** Original schematic step illustrations.
- **Available:** Animated movement guide.
- **Available:** Front-view or side-view camera instructions per exercise.
- **Available:** Suggested duration per movement.
- **Available:** Restricted-practice badges and conservative-mode blocking.
- **Available:** Gentle four-second inhale/six-second exhale timer.
- **Intentional limit:** Breathing practice does not detect breathing or prescribe breath retention.

## 4. Live camera movement coaching

- **Available:** Camera permission is requested only when the user starts live training.
- **Available:** Local MediaPipe pose-landmark inference.
- **Available:** Camera frames remain on the device.
- **Available:** Skeleton overlay on the camera feed.
- **Available:** Aspect-correct joint-angle calculation.
- **Available:** Confidence gating before using visible joints.
- **Available:** One Euro smoothing to reduce landmark jitter.
- **Available:** Exercise-specific tracking eligibility checks.
- **Available:** Phase-based repetition counting.
- **Available:** Timed-hold tracking for appropriate practices.
- **Available:** Tracking coverage measurement.
- **Available:** Prioritized correction cues.
- **Available:** Spoken local correction and encouragement cues.
- **Available:** Repositioning prompts when required joints are unreliable.
- **Available:** Pause and resume session controls.
- **Available:** Mute and re-enable spoken coaching.
- **Available:** Finish session control.
- **Available:** Dedicated Pain/Stop action that ends the session conservatively.
- **Available:** Current repetition/hold/status reporting to the in-app agent.
- **Available:** Temporary snapshots for flagged moments.
- **Available:** Session report with duration, repetitions, holds, coverage, estimated quality and flagged moments.
- **Available:** Rep-by-rep timings and estimated scores.
- **Available:** Sustained decline detection described as a form breakdown, not a fatigue diagnosis.
- **Intentional limit:** Scores are experimental form estimates, not safety scores or medical assessments.

## 5. Local workout-video analysis

- **Available:** User-selected local workout video picker.
- **Available:** Local pose analysis without uploading the exercise video.
- **Available:** File limits of approximately two minutes and 150 MB.
- **Available:** Per-repetition estimates and flagged moments.
- **Available:** Temporary annotated snapshots.
- **Partial:** Playback depends on browser/WebView codec support.
- **Available:** Unsupported-codec and oversize-file errors are surfaced to the user.

## 6. Nutrition diary

- **Available:** Date-based food diary.
- **Available:** Meal groups: Breakfast, Lunch, Dinner and Snack.
- **Available:** Searchable starter food catalogue.
- **Available:** 26 generic starter foods with rounded values.
- **Available:** Portion entry in grams.
- **Available:** Calories, protein, carbohydrates, fat and fibre calculations.
- **Available:** Optional sodium, calcium and iron fields when known.
- **Available:** Unknown micronutrients remain unknown rather than being silently treated as zero.
- **Available:** Data-source display for every food.
- **Available:** Allergen/label-warning display.
- **Available:** Vegetarian, vegan and category tags.
- **Available:** Favourite foods.
- **Available:** Custom food creation from a nutrition label.
- **Available:** Meal editing, meal-type changes and deletion.
- **Available:** Historical logs preserve their nutrition snapshot when the food catalogue changes later.
- **Available:** Daily nutrition totals.
- **Available:** User-defined calorie and protein targets.
- **Available:** Diet preference and avoid/allergy notes.
- **Intentional limit:** Starter values are estimates, not a licensed comprehensive food database or medical diet advice.

## 7. Recipes

- **Available:** Searchable recipe collection.
- **Available:** Six original starter recipes.
- **Available:** Ingredient list, estimated combined nutrition, preparation steps, tags and preparation time.
- **Available:** Ingredient-by-ingredient review before logging.
- **Available:** Atomic recipe logging—if one ingredient is missing, the entire multi-food log is rejected.
- **Available:** Recipe ingredients can be logged to a selected meal.
- **Partial:** Small starter catalogue rather than a large content library.

## 8. Food photo and barcode tools

- **Cloud-dependent, partial:** User-selected food-photo estimate using NVIDIA vision.
- **Available:** Separate consent before sending the selected photo.
- **Available:** Image is compressed before sending.
- **Available:** Review/edit screen before saving an estimated food.
- **Available:** Photo estimates never auto-log a meal.
- **Intentional limit:** Photo estimation cannot establish exact portions, hidden ingredients or allergens.
- **Available:** Manual 8–14 digit barcode entry.
- **Cloud-dependent:** Open Food Facts lookup for product-label data.
- **Available:** Product data is reviewable before saving.
- **Not present:** Live camera barcode scanning.
- **Not present:** Background gallery scanning.

## 9. Manual health tracking

- **Available:** Water logging in millilitres.
- **Available:** Weight logging in kilograms.
- **Available:** Sleep-episode logging in hours.
- **Available:** Additional-step logging as a count.
- **Available:** Waist logging in centimetres.
- **Available:** Activity-duration logging in minutes.
- **Available:** Manual glucose-note logging in mg/dL.
- **Available:** Notes and activity names.
- **Available:** Historical records by date.
- **Available:** Daily totals.
- **Available:** User-chosen water, steps, sleep, calorie, protein and weight targets.
- **Available:** Diet preference and allergy/avoid notes.
- **Intentional limit:** No automatic pedometer, wearable measurement, clinical interpretation or automatic health prescription.

## 10. Fasting/time-since-meal journal

- **Available:** Neutral start/stop time-since-meal timer.
- **Available:** Optional note attached to a timing record.
- **Available:** Current elapsed-time display.
- **Available:** Blocked when screening indicates a conservative limitation.
- **Intentional limit:** It is a journal timer, not a prescribed fasting programme.

## 11. Plans and routines

- **Available:** User-created meal plans.
- **Available:** User-created workout plans.
- **Available:** User-created yoga plans.
- **Available:** Plan name and notes.
- **Available:** Exercise items with sets, repetitions and seconds.
- **Available:** Meal items with food, grams and meal type.
- **Available:** Pause and resume plans.
- **Available:** Delete plans.
- **Available:** Mark plan completion by local date.
- **Available:** Launch an exercise from a saved plan.
- **Available:** Log a saved meal plan to today after confirmation.
- **Available:** Meal-plan logging is atomic.
- **Available:** Conservative screening prevents restricted exercise plans.
- **Intentional limit:** Plans are user-built; there is no automatic calorie deficit, clinical diet prescription or fully automated circuit runner.

## 12. Reminders and notifications

- **Available:** Reminder types: Water, Meal, Movement, Sleep and Check-in.
- **Available:** Daily local time and custom message/title.
- **Available:** Enable, disable and delete reminder.
- **Available:** In-app due reminder banner.
- **Android-only:** Opt-in local Android notification scheduling.
- **Android-only:** Refresh/reschedule notifications after edits.
- **Partial:** Android delivery is inexact and subject to notification permission and battery restrictions.
- **Intentional limit:** No remote push-notification service.

## 13. Progress and reports

- **Available:** Real session count, current streak and total recorded minutes.
- **Available:** Recent estimated-quality chart.
- **Available:** Session-history list.
- **Available:** Detailed saved-session report modal.
- **Available:** Labeled demo history, visually distinguished from real sessions.
- **Available:** Seven-day table for food calories, water, sleep, steps and sessions.
- **Available:** Weekly pattern reflection using real recorded days.
- **Available:** Weekly JSON export.
- **Available:** Full timeline PDF export containing sessions, flags, journal entries, health metrics and meals.
- **Available:** Coach-handoff-style user-controlled summary export.
- **Intentional limit:** Reports avoid causal and clinical conclusions.

## 14. Journal and personal check-ins

- **Available:** Energy rating from 1–5.
- **Available:** Soreness rating from 1–5.
- **Available:** Sleep hours.
- **Available:** Mood: Great, Okay, Low or Stressed.
- **Available:** Free-text habit, symptom or thought note.
- **Available:** Local journal history.
- **Available:** Agent-assisted structured check-in logging when all required values are supplied.
- **Available:** The agent asks for missing values rather than inventing them.

## 15. Private challenges

- **Available:** Private, data-backed personal challenges.
- **Available:** Three-day logging and movement-style goals.
- **Available:** Progress bars and personal milestone state.
- **Intentional limit:** No public leaderboard, fake users, purchased points, prizes or weight-loss competitions.

## 16. Chinnu AI text and voice agent

- **Available:** Persistent in-app agent panel.
- **Available:** Typed requests.
- **Cloud-dependent:** English voice input through NVIDIA Parakeet speech recognition.
- **Cloud-dependent:** General request decisions through NVIDIA Nemotron.
- **Cloud-dependent:** Spoken replies through NVIDIA Magpie, configured for an Indian-locale voice.
- **Available:** Fast deterministic handling for explicit commands without an unnecessary LLM call.
- **Available:** Wake phrases including “Hey Chinnu” and close recognition variants while the app is open.
- **Available:** Short-utterance endpointing after a pause.
- **Available:** Echo reduction by pausing microphone transmission during replies.
- **Available:** Sustained user speech can interrupt playback.
- **Available:** Explicit “Interrupt · listen” fallback.
- **Available:** Conversation and current action state in the agent panel.
- **Available:** Audit list of actions actually executed.
- **Available:** The agent confirms actions only after receiving the real on-device result.
- **Available:** Schema validation rejects unsupported or malformed actions.
- **Available:** One different-model fallback with bounded timeout.
- **Available:** Raw provider error strings are hidden from users.
- **Available:** Voice session reconnect/recovery behavior.
- **Available:** Cloud microphone disconnects when the app becomes hidden.
- **Available:** No user API key or access code is requested.
- **Available:** Operator credentials remain on the Render server.
- **Available agent actions:** navigation, open exercise, show guide, camera/video setup, pause/resume/stop/pain, coaching mute, breathing timer, progress query, recommendation query, latest report, check-in, PDF export, delete data, water/metric logging, food search/logging, daily summary, reminder creation and fasting timer.
- **Intentional limits:** No OS-wide Siri-style automation, shell access, arbitrary URLs, automatic permissions, diagnosis, medication/supplement advice or phone-wide background wake word.

## 17. Data, privacy and portability

- **Available:** Local IndexedDB persistence.
- **Available:** Separate local histories between browser and APK installs.
- **Available:** Versioned database migration from v1 to v2.
- **Available:** Local JSON backup.
- **Available:** Validated restore that replaces current local data only after confirmation.
- **Available:** Restore validation for version, types, row limits, units and ranges.
- **Available:** Complete local-data deletion.
- **Available:** Reminder cancellation during deletion and restore.
- **Available:** Export excludes backend credentials, microphone audio and photo/video files.
- **Available:** Non-content diagnostic export with application/platform and record counts.
- **Available:** Exercise video stays local.
- **Available:** Food photos are transmitted only after selection and consent and are not intentionally persisted by the app.
- **Available:** Health data passed to the cloud agent is limited to the user-requested agent operation.
- **Intentional limit:** No account system or automatic cloud sync.

## 18. Deployment and operational features

- **Available:** Combined Express server for the web app and cloud gateway.
- **Available:** Render deployment in Singapore.
- **Available:** HTTP text-agent endpoint.
- **Available:** WebSocket voice gateway.
- **Available:** Static hosting of MediaPipe model/WASM assets.
- **Available:** Anonymous short-lived app sessions.
- **Available:** Per-IP session-creation throttling.
- **Available:** Per-session HTTP action limits.
- **Available:** Concurrent voice-session limit.
- **Available:** Voice-session lifetime and turn limits.
- **Available:** Daily in-process provider-call budget.
- **Available:** CORS and no-store HTML responses.
- **Partial:** In-memory limits reset when the Render instance restarts.
- **Partial:** Render free-tier cold starts can delay initial connection.
- **Partial:** NVIDIA testing keys have quotas and expiry.

## 19. Quality and safety checks represented in the files

- **Verified in project records:** Frontend TypeScript and production build.
- **Verified in project records:** Backend TypeScript check.
- **Verified in project records:** Unit tests covering movement geometry, rep lifecycle, tracking loss, coaching cadence, nutrition arithmetic, data migration, backups, validation, agent boundaries, session throttling, audio bounds and model fallback.
- **Verified in project records:** Chrome integration flows for onboarding, wellness data, plans, agent behavior and local persistence.
- **Verified in project records:** Android debug build and update installation on an Oppo A5 2020.
- **Verified in project records:** Synthetic NVIDIA TTS-to-ASR voice round trip and deployed browser tool execution.
- **Intentional limit:** Synthetic tests do not establish real noisy-gym microphone quality, pose accuracy or clinical validity.

## 20. Listed but not connected

These are shown honestly in the current app as future integrations rather than working features:

- Health Connect, Google Fit and Samsung Health.
- Fitbit, Garmin and smart scales.
- CGM sensor sync, glucose prediction and metabolic scoring.
- Human diet, fitness and yoga coaches.
- Practitioner scheduling, calls and service operations.
- Community, teams, group chat and referrals.
- User accounts and cross-device cloud sync.
- Subscriptions, premium trials, billing and entitlements.
- NFC features, widgets and background Auto Snap.
- Comprehensive licensed nutrition database.
- Native camera barcode scanning.
- Native CameraX/inference worker and native audio-capture optimisation.
- iOS application.
- Expert-validated exercise thresholds, calibration and progression.

## Suggested decision groups for the next discussion

To decide what belongs in the new Chinnu HealthAI app, review the catalogue in these groups:

1. **Foundation:** onboarding, local profile, navigation, privacy and local storage.
2. **Daily health:** meals, water, weight, sleep, steps, waist, activity, glucose notes and goals.
3. **Training:** exercise library, camera pose tracking, local video analysis, reports and spoken cues.
4. **Planning:** meal/workout/yoga routines, reminders, fasting journal and recommendations.
5. **AI:** typed agent, NVIDIA voice, food-photo estimation and validated app actions.
6. **Reflection:** journal, streaks, private challenges, weekly reports, PDF and backups.
7. **External services:** accounts, cloud sync, wearables, human coaches, community and payments.

No keep/remove recommendation has been applied in this document. It is an inventory for the next product discussion.
