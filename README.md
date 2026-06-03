# SpeakSaathi AI Coach Prototype

SpeakSaathi is an India-first AI spoken-English coach prototype. It demonstrates the first buildable slice of the product plan: learner setup, a structured 30-minute lesson flow, AI-style spoken-English corrections, and a detailed daily report.

## What is included

- Static browser app with no third-party runtime dependencies.
- MVP language selection and localized support copy for Hindi, Tamil, Telugu, Kannada, and Malayalam.
- Local learner profile persistence for name, goal, level, selected plan, privacy controls, streak, and lesson progress.
- Course catalog with four seed lessons plus India-first localized role-play scenarios across interview, college, customer-support, travel, and workplace English.
- 30-minute session runtime with start/resume controls, phase progress, elapsed time, completion status, streak updates, and reminder settings.
- Browser speech-recognition controls for dictating learner turns, plus speech synthesis for AI replies where supported.
- Correction modes for gentle, real-time, and fluency practice, plus a repeatable mistake notebook.
- Mock AI tutor service that models gentle correction behavior and mother-tongue explanations.
- Report engine that generates overall score, talk time, score breakdowns, strengths, corrections, pronunciation focus, vocabulary, homework, weekly progress, and saved report history from transcript events.
- Prototype subscription plan screen with local checkout simulation, daily minute entitlements, usage tracking, billing events, privacy/safety controls, quality metrics, cost estimates, retention policy, beta analytics cockpit, pilot export, and B2B cohort dashboard.
- Node test coverage for analytics, course setup, correction flows, quality, subscriptions, voice support, and report generation.

## Run locally

```bash
npm run dev
```

Open `http://localhost:4173`.

## Validate and build

```bash
npm test
npm run lint
npm run build
```

The build command copies the static app into `dist/`.

## Next implementation steps

1. Replace the mock AI tutor and correction-mode logic with a backend AI provider adapter and production rubric.
2. Replace browser speech-recognition fallback with Gemini Live API-compatible streaming voice sessions for real-time conversation.
3. Persist users, transcripts, corrections, and reports in a database.
4. Add auth, subscriptions, privacy controls, and B2B dashboards.
5. Port the browser prototype into an Android-first mobile shell when the UX is validated.
6. Use `docs/sprint-status.md` to track which sprint slices are prototyped versus still pending for production.
