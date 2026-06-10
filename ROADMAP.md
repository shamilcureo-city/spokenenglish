# FluentMap Roadmap

Status against the approved 5-phase plan. ✅ = done · 🔲 = pending.

---

## Phase 1 — Learning-science engine + foundation  *(in progress)*

**Done**
- ✅ Monorepo + TS toolchain (`node --test` via tsx), build to dist
- ✅ Science engine: FSRS-5, mastery, adaptive sequencer, contrastive L1→L2, evidence ingestion, map metrics — **83 unit tests**
- ✅ Voice orchestrator with the **Gemini config frozen** (guarded by test)
- ✅ 121-skill taxonomy + integrity tests
- ✅ Supabase schema (`0001_init.sql`) + generated seeds (skills, L1 rules, languages)
- ✅ Web `/map` brain-map surface (demo data from the real engine)

**Pending sprints**
- ✅ **1A — Edge functions:** `start-session` / `redeem-session` (token proxy via `live_tokens`) + `score-assessment` (temp 0.2) + `score-session` (skill + L1 tagging). Thin Deno wrappers over the Node-tested `@fluentmap/core/scoring` helpers. Run with `supabase functions serve`.
- ✅ **1B — Web voice pipeline:** web `AudioBridge` (lifted `useGeminiLive.js`/`audio-processor.js` verbatim) + the `useGeminiLive` hook on the core orchestrator + a live **Lesson** screen (status, visualizer, transcript, timer, finish → report). Renders + handles the no-backend error gracefully; live voice needs `supabase functions serve` + key + mic.
- ✅ **1C — Onboarding + assessment flow (web):** profile/L1 capture → 5-min voice assessment (live examiner + `score-assessment`, with a skip→sample path) → CEFR placement → enroll → map. State persisted (localStorage; Supabase in Phase 2).
- ◑ **1D — Port domain modules into `core`:** ✅ assessment, lessons, **subscription** (usage gating), **session** (streak/elapsed/resume), **quality** (moderation + cost), **retention** (reminders) — all tested. Superseded/absorbed: curriculum→lessons, correction→`review_items`, localization→`languages`+contrastive, report→`score-session`. 🔲 remaining: analytics aggregation.
- ✅ **1E — Lessons as data:** 15-lesson library in `core/domain/lessons.ts` (each mapped to real target skills) + `lessons` / `lesson_target_skills` seeds. "Practice" now runs the sequencer (weakest + i+1, over *teachable* skills) → the matching lesson, with the reason shown. 🔲 remaining: `scenarios` table + grow the library to cover more skills.
- ✅ **1F — Close the loop:** Finish session → `score-session` → `ingestSessionEvidence` → skill_states + review queue → `/map` updates. Persists in cloud mode (see Phase 2).

---

## Phase 2 — Accounts, sync, platform-as-API  *(mostly done)*

- ✅ **2A — Auth:** Supabase phone-OTP (`useAuth` + `AuthScreen` + `AuthGate`); RLS already enforced in the schema; profile upsert. App falls back to local/demo mode when Supabase is unconfigured.
- ✅ **2B — Data layer:** `apps/web/src/data` (client, row↔core mappers, repos) — framework-agnostic, extractable to `packages/api-client`. Store hydrates profile + `skill_states` from Postgres on sign-in. 🔲 remaining: offline write-queue + conflict merge (currently write-through).
- ✅ **2C — Live data:** `/map` renders real per-user `skill_states`; lesson Finish persists evidence (`skill_states` + `review_items` + `corrections`); assessment persists to `assessments`. 🔲 remaining: extract `packages/api-client`, reports/streak writers.

---

## Phase 3 — Regional-language correction depth  *(in progress)*

- ✅ **3A — KB breadth:** all five languages (Hindi, Tamil, Telugu, Kannada, Malayalam) — 29 transfer rules with **native-script** explanations; surfaced on the map's "patterns" card. 🔲 remaining: native-speaker linguistic QA pass.
- 🔲 **3B — Pronunciation:** phoneme detectors wired into `score-session`; phonetic-transfer feedback.
- ◑ **3C — Surfaces:** ✅ L1-insight cards (native script) + **spaced-repetition review drills** (Again/Hard/Good/Easy → FSRS reschedule, with the mother-tongue "why"). 🔲 remaining: full mother-tongue UI rendering + code-mix handling.

---

## Phase 4 — Content CMS + scale  🔲

- 🔲 **4A — Admin:** `apps/admin` (or Studio workflows) CRUD for skills / lessons / rules + `lesson_target_skills` authoring.
- 🔲 **4B — Library:** expand lessons & clusters; content versioning.
- ◑ **4C — Analytics:** ✅ activation funnel + engagement ported (`analytics.ts`) and a learner **Progress screen** (streak, this-week, journey funnel, L1 patterns fixed); `quality.ts` ported. 🔲 remaining: ops/cohort dashboards.

---

## Phase 5 — Native mobile + payments  🔲

- 🔲 **5A — Mobile:** `apps/mobile` (Expo) + native `AudioBridge` (`react-native-audio-record`); feature parity via `packages/core`.
- ◑ **5B — Payments:** ✅ Pricing screen (4 plans), mock checkout, **entitlement gating** (live plan + daily-minute usage; sessions blocked when out → upgrade CTA). 🔲 remaining: real Razorpay (web) / RevenueCat (mobile) gateway + webhooks.
- 🔲 **5C — Retention & launch:** push reminders (`retention.js`), store submission, polish.

---

## Cross-cutting

- ◑ Security: ✅ opt-in **ephemeral Gemini tokens** (`GEMINI_USE_EPHEMERAL_TOKENS`, falls back to the verified key path) so the raw key needn't reach the browser. 🔲 needs verification against a live key.
- ✅ CI: GitHub Actions (`.github/workflows/ci.yml`) — builds core, typechecks both packages, runs the test suite on push/PR.
- ✅ Robustness: voice orchestrator now surfaces mic-permission failures as errors (+test); a React `ErrorBoundary` prevents white-screens.
- ✅ Public **"The Science"** explainer page (real engine numbers + forgetting curve), linked from onboarding + the map.
- 🔲 Offline write-queue (currently write-through).
