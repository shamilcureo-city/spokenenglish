# Sprint Status After the Prototype Expansion

This repository now implements a browser-based MVP foundation across the planned sprint roadmap. It does not claim to replace production mobile, backend, Gemini Live, payment, or analytics work. Instead, it gives each remaining sprint a concrete UI/domain starting point that can be connected to real services.

## Implemented in this repo

| Sprint area | Prototype coverage |
| --- | --- |
| Sprint 1: App shell and onboarding | Learner profile, name, support language, goal, level, and local persistence. |
| Sprint 2: Course and lesson engine | Four seed lessons, course cards, lesson selection, 30-minute phase model, and progress counts. |
| Sprint 3: Voice session MVP | Browser speech-recognition controls, speech-synthesis playback, typed fallback, and transcript turns; Gemini Live streaming remains pending. |
| Sprint 4: Live corrections | Gentle/real-time/fluency correction modes, correction cards, repeat-practice actions, mastery counts, and mistake notebook summary. |
| Sprint 5: Daily report | Overall score, talk time, score breakdowns, top corrections, pronunciation focus, homework, weekly progress, and saved report history. |
| Sprint 6: Retention | Start/resume session runtime, phase progress, elapsed time, completion status, daily reminder settings, streak logic, and lesson completion tracking. |
| Sprint 7: Localization | Localized support copy, native language profiles, code-mixed examples, and India-first scenario prompts for five MVP languages; full UI translation QA remains pending. |
| Sprint 8: Payments | Pricing UI, local checkout simulation, daily minute entitlements, upgrade prompts, usage tracking, and billing events; real payment gateway remains pending. |
| Sprint 9: Safety and privacy | Local privacy controls, safety moderation events, quality/latency/cost dashboard, retention policy, fallback tracking, and delete-local-data action; production privacy workflows remain pending. |
| Sprint 12: B2B pilot | Demo cohort dashboard with learners, completion, speaking minutes, and weak areas. |

## Still pending for production

1. Android-first mobile implementation or mobile wrapper.
2. Backend authentication and learner profile APIs.
3. Database persistence for users, transcripts, corrections, reports, plans, and organizations.
4. Gemini Live API-compatible streaming voice integration.
5. Production audio streaming, reconnect handling, server-side session orchestration, and low-latency turn-taking.
6. Production correction prompts, AI evaluation rubrics, and server-side mistake notebook persistence.
7. Full localized UI copy and Indian-accent/code-mixed QA test sets.
8. Payment gateway integration and subscription entitlement enforcement.
9. Production privacy, consent, child-safety, moderation, and delete-my-data workflows.
10. Analytics, cost dashboards, load testing, closed beta workflow, app-store launch, and real B2B pilot onboarding.
