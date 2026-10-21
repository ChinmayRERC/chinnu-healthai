# MuscleWiki feature, theme and motion catalogue

Reviewed: 19 October 2026

Target: [https://musclewiki.com/](https://musclewiki.com/)

## Inspection status

This is a reconstruction-oriented catalogue, not a claim that MuscleWiki source code was obtained.

- **Directly verified:** current indexed first-party pages, first-party API documentation, Google Play listing, accessible page semantics and public screenshots.
- **Runtime blocked:** both a normal HTTP request and a controlled REA Chromium replay were stopped by MuscleWiki's Cloudflare edge with HTTP 403. REA evidence: `ev_7dcac9d50745e69f7de77ebee304a47f8483522caa28dc99ab49114ff437a79c`.
- **Not attempted:** bypassing Cloudflare, solving challenges, account-only inspection, or copying proprietary code/assets.
- **Exactness rule:** feature names and documented body-map variants are exact where cited. Consumer-site CSS tokens, durations and easing curves are marked unverified because the production stylesheet was inaccessible.

## Status legend

- **Verified** — present in a current first-party page or official store listing.
- **Observed visually** — visible in a current public screenshot, but implementation details are unavailable.
- **Inferred** — expected interaction implied by controls/content; needs a successful hands-on session to confirm.
- **Unknown** — cannot be established from accessible evidence.

## 1. Product shell and navigation

- **Verified:** responsive website plus Android and iOS applications.
- **Verified:** global search action and collapsible sidebar action.
- **Verified:** exercise library, workout generator, workouts/programs and editorial articles.
- **Verified:** locale-aware routes and a language selector.
- **Verified:** App Store and Google Play download routes.
- **Verified:** footer routes for Terms, Privacy, API and About.
- **Observed visually:** uncluttered, card-based interface with generous white space and blue calls to action.
- **Inferred:** desktop navigation collapses into a drawer/sidebar on smaller screens.

## 2. Interactive anatomical discovery

- **Verified:** interactive body map for choosing a target muscle.
- **Verified:** male and female body variants.
- **Verified:** front and back body views.
- **Verified:** muscle-group selection leads into matching exercises.
- **Verified:** workout previews visualize accumulated training volume.
- **Verified:** workout maps use a low-to-high volume scale.
- **Verified:** hatching identifies a primary mover in the generator preview.
- **Verified in the API:** exercise maps distinguish primary, secondary and tertiary muscle roles.
- **Verified in the API:** red = primary, orange = secondary, yellow = tertiary.
- **Verified in the API:** body maps support `light` and `dark` themes.
- **Verified in the API:** body maps support `male` and `female`, and `front` and `back`, as independent variants.

## 3. Exercise library and discovery

- **Verified:** 1,900+ exercises and 7,700+ video demonstrations are advertised by the current first-party API; the consumer app listing describes 1,700+ exercises, so counts vary by surface/release.
- **Verified:** browse by muscle.
- **Verified:** browse by equipment.
- **Verified:** full-text search across exercise names and instruction steps.
- **Verified:** relevance-ranked search.
- **Verified:** pagination.
- **Verified:** random exercise discovery.
- **Verified:** difficulty filters: beginner/novice, intermediate and advanced.
- **Verified:** gender filter for demonstrations.
- **Verified:** force filters such as push, pull and static.
- **Verified:** mechanic filters such as isolation and compound.
- **Verified:** grip filtering.
- **Verified:** primary, secondary and tertiary muscle metadata.
- **Verified equipment families:** band, barbell, bodyweight, Bosu ball, cables, dumbbells, kettlebells, machine, medicine ball, Pilates, plate, Smith machine, stretches, TRX and yoga.
- **Verified:** at-home/bodyweight discovery and gym-equipment discovery.
- **Verified:** equipment filter panel with a Featured option.

## 4. Exercise detail experience

- **Verified:** breadcrumb navigation.
- **Verified:** exercise name and difficulty.
- **Verified:** two demonstration media views/angles on sampled pages.
- **Verified:** numbered step-by-step form instructions.
- **Verified:** male/female demonstration selector.
- **Verified:** primary, secondary and tertiary muscle display.
- **Verified:** difficulty, force, grip and mechanic metadata.
- **Verified:** topical/search tags.
- **Verified:** body-map imagery for the exercise.
- **Verified:** multiple camera angles and gender variants are supported by the exercise data platform.
- **Verified:** video/media streaming rather than text-only instruction.
- **Unknown:** playback controls, speed control, captions, audio behavior and picture-in-picture on the consumer website.

## 5. Workout generation

- **Verified:** three entry modes:
  - Generate today's workout — a targeted single session based on muscles, equipment and goal.
  - Generate a weekly plan — a progressive 3–6 day routine.
  - Build manually — choose exercises, sets and repetitions from the library.
- **Verified:** no login is needed to begin.
- **Verified:** a draft is saved on the current device.
- **Verified:** live muscle-map preview.
- **Verified:** workout summary with exercise, set and estimated-minute totals.
- **Verified:** ordered exercise stack.
- **Verified:** prescriptions such as sets and rep ranges.
- **Verified:** equipment shown per exercise.
- **Verified:** weekly overview with day, exercise and time totals.
- **Verified:** push, pull and leg day grouping in the example program.
- **Verified:** add-exercise control.
- **Verified:** manual builder is auto-saved.

## 6. Workout and routine catalogue

- **Verified:** separate MuscleWiki Workouts and My Workouts views.
- **Verified:** build-your-own-workout entry point.
- **Verified:** workout cards with title, difficulty, goal, equipment and description.
- **Verified:** sharing control.
- **Verified:** add/save workout control.
- **Verified:** sorting and filters.
- **Verified:** workouts can be filtered by goal, equipment and target muscle.
- **Verified:** structured routines contain workouts, and workouts contain prescribed exercises.
- **Verified:** prescriptions support sets, reps or duration.
- **Verified:** superset grouping exists in the workout data model.
- **Verified:** beginner, intermediate and advanced programs.
- **Observed visually:** Workouts/Routines segmented tabs, keyword search and filter chips in the mobile app.

## 7. Training and progress tracking

- **Verified in the official mobile listing:** workout log.
- **Verified:** log lifts and completed workouts.
- **Verified:** progress visualization.
- **Verified:** gym-oriented and home/bodyweight plans.
- **Verified:** beginner through advanced strength programs.
- **Verified:** offline access to core exercise-library content in the mobile app.
- **Verified:** ad-free mobile experience is advertised.
- **Verified:** Apple Watch, HealthKit and Google Health support is advertised in the current Android listing.
- **Unknown for web:** exact charts, measurements, personal-record rules, rest timer, history editing and export behavior.

## 8. AI and personalization

- **Verified in the official mobile listing:** AI personal trainer/workout planner.
- **Verified:** routines can be customized around goals such as muscle gain and weight loss.
- **Verified:** generation accepts target muscles and available equipment.
- **Verified:** weekly programs are presented as progressive.
- **Unknown:** model/provider, prompt design, safety controls, adaptation algorithm and whether plans change from logged performance.

## 9. Educational content

- **Verified:** articles hub.
- **Verified categories:** Nutrition, Muscle Gain, Science Simplified, Body Fat Loss, Exercise Form, For Total Newbies, App and Site Updates, Golden Programs, Workouts and Equipment Reviews.
- **Verified:** featured articles.
- **Verified:** author, date, category, title and summary metadata.
- **Verified:** training guides, form education, anatomy explanations and equipment reviews.
- **Verified:** category filtering.

## 10. Localization and accessibility-relevant behavior

- **Verified:** 14 documented languages: English, Brazilian Portuguese, Spanish, Hindi, German, Arabic, French, Turkish, Italian, Persian, Polish, Russian, Simplified Chinese and Japanese.
- **Verified:** translated exercise names, steps, muscles, categories and workout/routine text.
- **Verified:** Arabic and Persian localized pages imply right-to-left layout support.
- **Verified:** semantic buttons and headings are exposed in indexed page content.
- **Unknown:** keyboard focus design, screen-reader announcements, contrast ratios and reduced-motion handling.

## 11. Theme specification

### Consumer website and app

- **Observed visually:** light-first presentation.
- **Observed visually:** white main surfaces.
- **Observed visually:** saturated medium/royal blue for primary buttons, selections and headers.
- **Observed visually:** dark charcoal/black primary text.
- **Observed visually:** pale blue promotional/onboarding backgrounds.
- **Observed visually:** rounded rectangular cards and controls.
- **Observed visually:** simple line-art anatomical figures and restrained iconography.
- **Observed visually:** bold, modern sans-serif headings with a neutral sans-serif body face.
- **Unknown:** exact font family, CSS variables, hexadecimal colors, radii, shadows and spacing scale. These were not exposed through accessible first-party HTML and must not be represented as exact tokens.

### Anatomical body-map themes — exact documented behavior

- `theme=light`: white background; default body-map rendering.
- `theme=dark`: dark background intended for dark-mode interfaces.
- Role colors: red primary, orange secondary, yellow tertiary.
- View dimension: front or back.
- Model dimension: male or female.
- Generator dimension: low-to-high training-volume visualization plus a hatch for the primary mover.

## 12. Animation and motion catalogue

### Directly verified motion/media behavior

- **Verified:** exercise demonstrations are videos; movement itself loops or plays as instructional media rather than being represented by static diagrams alone.
- **Verified:** multiple media angles can be displayed for an exercise.
- **Verified:** generator previews update a live muscle map as the workout composition changes.
- **Verified:** selecting male/female and front/back changes the anatomical visual state.

### Interaction motion strongly implied, but not runtime-verified

- Sidebar/drawer enter and exit transition.
- Search overlay or search-panel transition.
- Filter panel expand/collapse.
- Selected muscle highlight transition on the body map.
- Male/female and front/back image cross-fade or replacement.
- Card hover/focus feedback.
- Button hover, press and disabled-state transitions.
- Modal/sheet transition for filters and exercise selection.
- Progressive workout-summary and body-map refresh as exercises are added or removed.
- Loading placeholders or progress indicators while media and generated workouts load.

### Exact motion values unavailable

No reliable duration, easing curve, transform distance, opacity keyframe, hover elevation or spring value could be extracted because Cloudflare blocked the production runtime and stylesheet. A faithful rebuild should first match the interaction hierarchy, then establish an original motion system rather than claiming unverified MuscleWiki timing values.

## 13. Mobile-specific capabilities

- **Verified:** onboarding with language selection.
- **Verified:** Google sign-in is shown in a public app screenshot.
- **Verified:** mobile Programs experience with Workouts/Routines tabs, search and filters.
- **Verified:** workout log and progress views.
- **Verified:** offline exercise access.
- **Verified:** wearable/health-platform synchronization is advertised.
- **Verified:** Android app contains in-app purchases; exact premium boundaries need account-level inspection.
- **Unknown:** notification types, live activities, widgets and watch-app screens.

## 14. Developer/API platform

- **Verified:** REST/JSON API with API-key authentication.
- **Verified:** exercise listing, detail, search, random, filters, categories, muscles and statistics endpoints.
- **Verified:** routine and workout endpoints with expanded variants.
- **Verified:** media and body-map streaming.
- **Verified:** response detail levels intended to reduce bandwidth.
- **Verified:** official MCP package for AI assistants.
- **Verified:** commercial-use plans, quotas and tier-gated data.
- **Verified:** body-map, secondary/tertiary-muscle, routine and workout access are tier restricted.

## 15. Feature groups suitable for Chinnu HealthAI discussion

These are candidates only; no decision to copy or implement them is made here.

- Interactive male/female front/back muscle atlas.
- Muscle → equipment → exercise discovery flow.
- Much larger exercise catalogue with demonstration media.
- Rich exercise metadata: force, mechanic, grip and muscle roles.
- Daily workout generator.
- Progressive weekly program generator.
- Drag/add/remove manual workout builder with local drafts.
- Live training-volume heat map.
- Workout/routine catalogue with filters and saved items.
- Structured workout execution and lift logging.
- Progress charts and personal training history.
- Offline exercise library in native apps.
- HealthKit, Apple Watch and Google Health synchronization.
- Educational article hub with categories and featured content.
- Fourteen-language content and RTL layouts.
- Light/dark anatomical assets and explicit muscle-role colors.
- Public exercise API/MCP integration as an alternative to reproducing proprietary content.

## Sources

- [MuscleWiki exercise library](https://musclewiki.com/exercises)
- [MuscleWiki workout generator](https://musclewiki.com/generator)
- [MuscleWiki articles](https://musclewiki.com/articles)
- [Sample MuscleWiki exercise page](https://musclewiki.com/exercise/supermans)
- [MuscleWiki Android listing](https://play.google.com/store/apps/details?id=com.musclewiki.macro)
- [MuscleWiki API overview](https://api.musclewiki.com/)
- [MuscleWiki API documentation](https://api.musclewiki.com/documentation)

## Remaining gaps for an exact clone-level specification

A successful authorized interactive session is still required to measure exact web typography, color tokens, grid breakpoints, radii, shadows, focus states, animation durations/easing, authenticated screens, premium boundaries and error/empty/loading states. The present catalogue is strong enough for feature prioritization and an original implementation plan, but not for claiming pixel-for-pixel or motion-for-motion identity.
