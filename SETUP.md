# Running FluentMap locally

Three tiers — start at Tier 1 (1 minute, no config), add backend only when you
want the real voice loop or accounts.

## Prerequisites
- **Node ≥ 20** (everything)
- A **Google Gemini API key** (Tier 2+ — the real voice)
- **Docker** + **Supabase CLI** — only for Tier 2b / Tier 3 (the Supabase paths)

---

## Tier 1 — Demo (no backend, ~1 min)

The whole app on engine-generated demo data. Every screen works — map, lessons,
reviews, sounds, progress, science, pricing, settings — **except** real two-way
voice and cloud persistence.

```bash
npm run setup     # installs deps + builds the engine (packages/core)
npm run dev       # → http://localhost:5173
```

That's it. No keys, no accounts.

---

## Tier 2 — Real voice (local API server, **no Docker, no Supabase**) ⭐ recommended

Adds the **real Gemini Live voice loop** and AI scoring with a tiny local server
(`server/index.mjs`) that does the Gemini token-proxy + scoring — reusing the
exact same `packages/core` logic the edge functions use. **No Docker, no Supabase,
nothing to install beyond `npm`.** The app stays in demo mode (no login); only the
voice + scoring become real. This is the experience to try first.

```bash
npm run setup

# 1. Put your Gemini key where the server can find it (any one of these):
#    - export GEMINI_API_KEY=...      (env)
#    - fluentmap/supabase/.env        (GEMINI_API_KEY=...)
#    It also auto-detects ../spokenenglish/.env if you have the old prototype.

# 2. Start the API server (terminal 1)
npm run dev:api             # → http://localhost:8787  (prints "Gemini key ✅ loaded")

# 3. Start the web app (terminal 2)
npm run dev                 # → http://localhost:5173 (or next free port)
```

`apps/web/.env` already points the app at `http://localhost:8787`, so **Practice →
speak with the coach → Finish → report** and the **5-minute assessment** work end
to end. (Allow microphone access when the browser asks.) The token proxy is
in-memory and the skill list comes from `core` — no database needed.

---

## Tier 2b — Real voice via local Supabase (Docker)

Same result as Tier 2, but running the actual edge functions on a local Supabase
stack. Heavier (Docker images are ~several GB) — only do this to exercise the
Supabase path itself.

```bash
npm run setup
supabase start
supabase db reset           # applies migrations + supabase/seed.sql
echo "GEMINI_API_KEY=your-gemini-key" > supabase/.env
supabase functions serve --no-verify-jwt --env-file supabase/.env
# set apps/web/.env → VITE_FUNCTIONS_URL=http://localhost:54321/functions/v1
npm run dev
```

---

## Tier 3 — Cloud (accounts + persistence)

Do Tier 2, then point the web app at Supabase so it requires sign-in and saves
your profile, skill map, reviews, and corrections to Postgres.

Create `apps/web/.env`:

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon key printed by `supabase start`>
VITE_FUNCTIONS_URL=http://localhost:54321/functions/v1
```

Restart `npm run dev`. The app now shows the **sign-in screen**.

> ⚠️ Auth uses **phone OTP**, which needs an SMS provider (Twilio) — local
> Supabase can't send SMS out of the box. For local testing either configure an
> SMS provider in `supabase/config.toml`, or switch `useAuth` to email OTP
> (Supabase local captures emails in **Inbucket** at http://localhost:54324).
> Tier 2 is the friction-free way to try the real voice.

---

## Deploy to a hosted Supabase project

```bash
supabase login && supabase link --project-ref <ref>
supabase db push                                   # schema
psql "$DATABASE_URL" -f supabase/seed.sql          # seed data
supabase secrets set GEMINI_API_KEY=...            # functions key
supabase functions deploy                          # edge functions
# build apps/web with VITE_SUPABASE_* + VITE_FUNCTIONS_URL set to your project
```

---

## Handy scripts
| Command | What |
|---|---|
| `npm run setup` | install + build the engine |
| `npm run dev` | run the web app (Vite) |
| `npm run dev:api` | run the local API server (real voice, no Docker) |
| `npm run build:core` | rebuild `packages/core` (do this after editing it) |
| `npm run build:core:watch` | rebuild core on change |
| `npm test` | run the 128 unit tests |
| `npm run typecheck` | typecheck all packages |
| `npm run seeds` | regenerate the Supabase seed SQL from `core` |

**Mode is automatic:** with `VITE_SUPABASE_*` set → cloud (auth + persistence);
unset → local/demo. After editing `packages/core`, re-run `npm run build:core`.
