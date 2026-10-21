# HealthifyMe v31.5 static feature findings

## Scope and evidence

The supplied XAPK was inspected statically and was not executed. Its SHA-256 is `559e918e73a0b89efcec46a591c17bd2e265461dfea10a90ba5dc4eff9e0a5ff`; REA recorded artifact Evidence `ev_d071f33be83ffb082ee939147c8f0ef8175c9f3fb96070c19bd887c38a905cc0` and inventory Evidence `ev_90a686d1923c122242137b2d316e4d83410bac6db2e57db843216c6ac33b1976`.

The XAPK contains a 145,362,314-byte base APK (`com.healthifyme.basic.apk`), CPU and density splits, English/Indic/other language splits, and separate AutoSnap modules. The extracted base APK SHA-256 is `b2dc63a44d1cf022262dd4207afad47ee55280addd51eba7b0c9690b661464b0`.

## Observed product modules

APK metadata directly names these first-party feature areas:

- AI diet plan and AI food suggestions
- food tracking, meal types, nutrition insights, recipes, and plans
- camera capture, barcode scanning, AutoSnap, and image cropping
- do-it-yourself diet and workout plans
- intermittent fasting
- trackers, calendar, budget, progress, and engagement hooks
- coaching chat, real-time calling, and escalation
- Health Connect integrations
- CGM and smart-scale integrations
- onboarding, returning-user flows, growth, ratings, freemium, payments, Stripe, and order management
- React Native/Expo and Jetpack Compose user-interface layers

Packaged assets also directly identify food/water logging schedules, AI diet-plan loading, barcode scanning, camera flows, celebrations, custom meals, and an encrypted/local SQLite store.

## Chinnu reconstruction choices

The initial Chinnu HealthAI implementation covers the core observable consumer journey with original branding and UI:

- daily calorie and macronutrient dashboard
- breakfast, lunch, dinner, and snack logging
- AI scan, barcode, food, and water shortcuts
- movement, steps, sleep, hydration, fasting, and weight views
- AI coach conversation shell and contextual insight cards
- adaptive diet, workout, and fasting plans
- responsive web UI plus Tauri shells for Android and macOS
- local persistence for meal and hydration entries

## Known limits

REA's Android semantic inspection requires a caller-supplied `jadx-headless-mcp` 0.7.1 JAR and Java 17+. Neither is currently available on this machine, so manifest decoding, class/method decompilation, and static reference tracing remain unresolved. Static metadata does not establish runtime behavior, server APIs, recommendation algorithms, proprietary content, or visual parity for screens not present in supplied screenshots/runtime evidence.

The rebuild therefore uses observed feature boundaries and original Chinnu product decisions. It does not copy HealthifyMe trademarks, text, proprietary backend behavior, paid content, or hidden implementation details.
