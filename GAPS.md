# Speakwell — What's Missing: Prioritized Launch Review

> Full-product audit (7 parallel auditors over the real code + flow traces → synthesis).
> **48 gaps** across journey, voice/drill, data, production, security, content, testing.
> Verified ground-truth note: the **active backend `server/index.mjs:115` sends the raw
> `GEMINI_API_KEY` to the browser** (`?key=${GEMINI_API_KEY}`) on an unauthenticated,
> wildcard-CORS, no-rate-limit endpoint. There is **no ephemeral-token minting in the
> code path actually used** — the only ephemeral implementation lives in *unused* Supabase
> functions and is self-marked UNVERIFIED. Harmless on localhost; a hard blocker for deploy.

---

## 1. Verdict

Speakwell is a **well-architected prototype that's one or two weekends of glue-work from being demoable, but is not yet launchable to real users** — and critically, *cannot be safely deployed in its current state*. The pedagogy engine (scoring, mastery, curriculum) is genuinely good and tested; the React shell, voice pipeline, and gamification work locally. But there is **no path from `git push` to a working URL**, and the moment there is one, it **ships the billable Gemini key to every browser**. An unauthenticated, wildcard-CORS, rate-limit-free `/start-session` turns the Gemini bill into an open faucet.

A second, quieter truth: even after deploy, the product is **structurally trapped on one browser profile** — no accounts, no export, no cross-device, silent quota-overflow data loss — which caps retention regardless of lesson quality. Honest sequencing: **secure-deploy first → data-durability second → loop-completion polish third.**

---

## 2. 🚨 Launch blockers (must fix before real users)

### B1. The Gemini key reaches the browser + the token endpoint is wide open *(security + unbounded cost)*
`/start-session` mints a Gemini-backed token to *any* anonymous caller (no auth, no rate limit, wildcard CORS `*`), and the redeemed WS URL carries the **raw key**. Anyone with devtools or a `curl` loop runs unlimited Gemini Live minutes on your bill until you rotate.
**Fix:** (a) mint **ephemeral** Gemini tokens server-side, default-on, fail *closed* (never fall back to the raw key); (b) per-IP + per-device rate limits + daily session cap on `/start-session`, `/recap`, `/placement`; (c) env-driven CORS allowlist (not `*`); (d) hard input caps (max turns/chars) on transcript endpoints.

### B2. No deployable backend serves the paths the app calls *(can't ship at all)*
The app calls `/start-session`, `/redeem-session`, `/recap`, `/placement`. Only the local Express `server/index.mjs` ("tiny stand-in… not meant to deploy", in-memory token Map) implements `/recap` + `/placement` — **no edge function exists for them**. Off localhost, recap + placement scoring (the payoff of every session) break.
**Fix:** port `/recap` + `/placement` to a hosted function/service, replace the in-memory token Map with a real store, drop the sibling-repo `.env` scanning. **Buildable now — it's code, not your accounts.**

### B3. A prod build with no env points every user at their own laptop *(silent total failure)*
`FUNCTIONS_URL = env.VITE_FUNCTIONS_URL ?? 'http://localhost:8787'`. A prod build without `VITE_FUNCTIONS_URL` makes every client fetch `localhost` → voice, recap, placement all fail silently.
**Fix:** fail the build if it's unset in production (or default to a relative `/api`); add a "backend unreachable" state instead of a white screen.

### B4. Not actually an installable PWA *(kills the growth loop's install step)*
No manifest, no icons, no service worker, no apple-touch-icon (`public/` holds only `audio-processor.js`). For an India-first, mobile-first, WhatsApp-share product there is **no Add-to-Home-Screen, no app icon, no install** — the share/invite loop assumes an install that physically can't happen.
**Fix:** `vite-plugin-pwa` — manifest (`standalone`, name/theme), 192/512/maskable icons + apple-touch-icon, app-shell service worker. Buildable now.

### B5. Data can be destroyed with no backup, no export, no cross-device, *silently* on quota overflow *(retention-killing)*
(a) mastery grows **one entry per word/phrase ever spoken, no cap/eviction**, re-serialized on every change; (b) `setItem` is wrapped in a **bare `catch {}`** — at the ~5 MB quota *all* writes silently stop (XP, streak, lessons); (c) no export/import, only wipe; (d) `navigator.storage.persist()` never called → iOS/Safari can evict. A 60-day streak can vanish on a cache clear, a browser switch, or just from *using the app too much*.
**Fix (buildable now, no accounts):** cap + evict `MasteryState` and the `days` array; catch `QuotaExceededError` + trim + surface it; Export/Import in Settings; `storage.persist()` on first launch.

### B6. The voice-first coach never speaks her feedback *(the core promise visibly breaks)*
`RecapScreen` never calls `speak()`. For a *voice-first* coach whose users read English less fluently than they want to speak, the most important screen — the feedback — is **silent text**. The blueprint's "Sunny SPEAKS '3 nailed, 2 to fix'" is absent.
**Fix:** a "🔊 Hear Sunny's feedback" control reading the summary + top fix via the existing `tts.speak()` (L1 explanation in the L1 voice). One screen, existing helper.

### B7. First-run user can get trapped before reaching the course *(onboarding dead-end)*
"Skip — start at Foundation" exists only on the placement **intro**; once the live placement conversation opens, the only exit is Back→intro. A placement that errors or exhausts the (shared) daily live-voice cap strands a first-run user.
**Fix:** exempt the one-time placement from the COGS cap **and** render "Skip — start at Foundation" inside the live screen.

### B8. The daily loop never chains, and mid-session Back silently discards work *(leaky loop)*
Finishing a lesson dumps the user to Today; "Keep going →" over-promises (returns to the recap, doesn't start the next lesson). Tapping "← Back" mid-conversation throws away transcript, recording, XP, and streak credit with no confirmation.
**Fix:** thread the next lesson into recap completion so "Complete & continue →" launches it; guard Back with a confirm when `transcript.length>0`.

> **Fast win — the "we'll nudge you" promise is dead:** onboarding collects `reminderTime` and promises a nudge, but it's **only ever written, never read** — no `Notification.requestPermission`, no scheduler anywhere. Either wire a real local notification or **soften the copy now** so it stops promising what never comes.

---

## 3. Needs your accounts / deploy (E8 / E9)

| Item | Needs you | I can prep now |
|---|---|---|
| **Supabase + auth (E8)** | Create project, enable auth, give me `VITE_SUPABASE_*` | Wire the `@supabase/supabase-js` client (a dep but **never imported**); add a client `userId`/`deviceId` + `version` now; make localStorage a write-through cache so sync is a *merge* |
| **Cloud sync** | Approve schema, provide DB | The local→cloud bridge; Export/Import (B5) doubles as the interim manual bridge |
| **Server-side COGS** | Confirm budget caps | Move metering server-side (per-user seconds, refuse over budget, heartbeat debiting) |
| **Vercel + domain (E9)** | Register `speakwell.app`, connect Vercel, set secrets, flip `APP_SHARE_URL` | `vercel.json` (build/output/SPA rewrites), `.env.production` template, CI deploy, origin-allowlist CORS |
| **Analytics provider** | Pick PostHog/Amplitude/Firebase + key | Wire `track()` — **all call sites already exist**; one-function change. Until then your activation/D1/D7/K metrics are unmeasurable |
| **Error monitoring** | Pick Sentry + DSN | SDK + forward `ErrorBoundary` + global `unhandledrejection`; I can wire the local capture hook even before you pick one |

**Privacy correction (buildable now, do it first):** the UI says *"Runs on your device. Nothing is shared."* — **already false**: every transcript is POSTed to your server → Google Gemini for recap/placement. Speech leaves the device today, with no policy or consent. Fix the copy + add a privacy policy/consent before any sync or analytics lands.

---

## 4. Important gaps (buildable now, not strictly blocking)

1. **Voice robustness on flaky Indian networks** — no fresh-start reconnect before the first resumption handle; flat 800 ms backoff, no jitter; no `navigator.onLine`; the error tells users to run `npm run dev:api` (a *developer* message). Add fresh reconnect, exp-backoff+jitter, online auto-resume, human copy.
2. **Web Speech API silently unsupported** on Firefox + WhatsApp/IG/FB in-app WebViews + many OEM browsers — the Phase-1 hero drill becomes a "Continue" skip there. Detect in-app WebView → "open in Chrome"; handle `network`/`no-speech` codes; longer-term a server-STT fallback.
3. **Recap throws away the drill's word-level scores + the recording** — the traffic-light replay (the "signature feedback moment") exists only in the drill; the recap falls back to flat bars. Recordings + transcript aren't persisted → "hear yourself" is single-use. Thread `UtteranceScore[]` into the recap; persist recordings in IndexedDB (last-N); store transcript on `SavedRecap`.
4. **No warm-up review in the daily session** — mastery memory is siloed in a tab. Add a dismissible "re-say 3 weak phrases" beat (reuse `SayItDrill`).
5. **No schema migration/versioning** despite a `-v1` key — `{...DEFAULT, ...parsed}` with no `version`. Add `version` + ordered migrations + nested validation now (also the foundation E8 needs).
6. **Audio capture fragile on low-end hardware** — 24 kHz → naive JS decimation to 16 kHz (no anti-alias), resample+encode on the main thread; mic not re-acquired after reconnect (a revoked track leaves the user silently muted). Move to the worklet, low-pass before decimation, `audioContext.resume()` on the gesture.
7. **Mother-tongue scaffolding (the wedge) is thin** — only 21/64 lessons have an `l1Note`, and those are in *English*, not native script. Author the rest; localize the Learn "why".
8. **No tests on `apps/web` + audio pipeline + `parsePlacement`** — the riskiest code has zero coverage. Add Vitest + testing-library; unit-test extracted `audioBridge` pure fns; mirror `parseRecap` tests for `parsePlacement`.
9. **A11y on the voice-first core is absent** — no `aria-live`/`role=status` for the listening/score/error states; no `prefers-reduced-motion`. Small, buildable now.

---

## 5. Polish / later

- **CI doesn't build the web app or lint** — add `build -w @fluentmap/web` (a Vite break ships undetected); ESLint is referenced via `eslint-disable` but **not installed/configured**.
- **5-skill radar, speaking certificate, "sounds over time" chart** — unbuilt, feasible on existing local data (Phase 4, not E8-blocked).
- **Outcome-framed Path + mastery-gated unlock** — the redesign's headline diagnosis; unit relabeling + gating are buildable now on the local store.
- **LEARN repeat-aloud not required; scenario "3 tasks + a place" not in the schema** — add optional `tasks: string[]` + a live checklist during Speak.
- **Placement emits only level + one sentence** — no encouraging score, no L1 sounds-to-watch, no starter plan.
- **Audio send backpressure** — no `bufferedAmount` check, no guard against sending on CONNECTING/CLOSING.
- **Dev-server hygiene** — token Map never sweeps; raw upstream Gemini error bodies returned to the client.
- **Recap/placement fetches have no timeout/retry/offline queue** — a drop at session end loses the whole payoff; queue the transcript for when connectivity returns.

---

## 6. Recommended next 3 moves

**Move 1 — "Make it safe to exist on the internet"** (1 sprint; mostly my code + a little of you).
Ephemeral Gemini tokens default-on (fail closed); rate-limits + input caps + CORS allowlist; port `/recap` + `/placement` to deployable functions; make `VITE_FUNCTIONS_URL` build-required; write the Vercel + Supabase deploy config. **(B1, B2, B3 + E9 prep.)** *The gate — nothing downstream matters until the key is safe and it can deploy.* You provide: Supabase, domain, secrets.

**Move 2 — "Don't lose the user's progress or their first session"** (a few days, no accounts).
Cap+evict mastery + catch `QuotaExceededError`; Export/Import + `storage.persist()`; `version` + migration scaffold (pre-stages E8); placement un-trappable (skip-in-live + cap-exempt); guard mid-session Back. **(B5, B7, B8 + #5.)**

**Move 3 — "Make Sunny sound like a coach, and ship the install"** (a few days, no accounts).
Voiced recap feedback (`tts.speak()`); thread the drill's `UtteranceScore[]` into the recap for traffic-light replay; chain "Complete & continue →" to the next lesson; PWA manifest + icons + service worker. **(B4, B6 + #3 + loop-chaining.)**

Fix the privacy copy inside Move 1 (one string + a policy page). Then network robustness (#1, #2) and accounts/sync (E8).
