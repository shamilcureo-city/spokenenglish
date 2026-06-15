# Speakwell

**A spoken-English communication course you finish by talking.** Foundation →
Intermediate → Advanced, organised around real communication skills (not grammar
drills). Every lesson is **Learn → Speak → Feedback**: learn a few real phrases,
practise them live with a warm AI voice partner, then get calm, confidence-first
feedback (in your mother tongue when it helps). A quick spoken **placement** starts
you at the right level; a 5-minute **daily free-talk** keeps the habit; **progress**
fills in as you go.

> **Run it (no Docker, no Supabase):**
> ```bash
> npm run setup            # install + build the engine
> npm run dev:api          # terminal 1 — Gemini token-proxy + recap/placement (port 8787)
> npm run dev              # terminal 2 — the web app
> ```
> Put a Google **Gemini API key** where the server can find it (`export GEMINI_API_KEY=…`,
> or a `.env` file). Then open the app, allow the mic, and talk.
>
> Full product spec & PRDs: `~/.claude/plans/i-want-to-make-federated-waterfall.md`

## Why

Most learners can already read and write English — they **freeze when they open their
mouth**. Speakwell makes you *speak in every lesson*: short, communicative units you
practise out loud, with feedback that builds confidence instead of shame. For general
learners, India-first (mother-tongue scaffolding built in).

## The loop

```
Placement (2-min spoken check) → your level
  └─ Course path (Foundation → Intermediate → Advanced)
       └─ Lesson: Learn (phrases) → Speak (live AI partner) → Feedback (recap) → next unlocks
  └─ Daily free-talk (5-min warm-up)        └─ Progress (levels, streak, how you're improving)
```

## Layout

```
speakwell/  (folder still named fluentmap)
├─ packages/core/src/
│  ├─ voice/orchestrator.ts     # ⭐ frozen Gemini Live config + session orchestration (+ barge-in)
│  └─ conversation/             # ⭐ curriculum · persona · recap · placement · warm-ups (pure TS)
├─ apps/web/src/
│  ├─ screens/                  # Onboarding · Placement · Home · Course · Lesson · Recap · Progress · Settings
│  ├─ voice/                    # web AudioBridge + the useGeminiLive hook
│  ├─ store.tsx                 # tiny local-only store (localStorage)
│  └─ lib/api.ts                # client for the local server
└─ server/index.mjs             # local dev API: token proxy + /recap + /placement (no Supabase)
```

| Core module | Responsibility |
|---|---|
| `voice/orchestrator.ts` | The preserved Gemini Live setup (model, voice "Puck", PCM formats, activity detection), the session state machine, and barge-in. Frozen — a test asserts it byte-for-byte. |
| `conversation/curriculum.ts` | The course as **data**: 3 levels · 16 units · ~37 lessons + path helpers (`nextLesson`, `isLessonUnlocked`, `levelProgress`). New lessons ship without code. |
| `conversation/persona.ts` | `buildPartnerPrompt` — the warm partner; in `lesson` mode it runs a lesson's scenario and draws out the target moves. Never corrects mid-talk. |
| `conversation/recap.ts` | `buildRecapPrompt` + `parseRecap` — the confidence-first, lesson-aware feedback (wins, fixes, mother-tongue explanations). |
| `conversation/placement.ts` | `buildPlacementPrompt` + `parsePlacement` — map a short spoken check to a starting level + unit. |
| `conversation/warmups.ts` | The daily 5-minute free-talk topics. |

## Develop

```bash
npm test          # core unit tests (curriculum/persona/recap/placement + frozen voice config)
npm run typecheck # tsc --noEmit across core + web
npm run build:core
```

MVP is **local-only** — no accounts, no cloud. Your profile, placement, completed lessons,
and history live in `localStorage`. Accounts + sync are a later phase (see the plan).
