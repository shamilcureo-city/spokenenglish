# Running FluentMap locally

Three tiers — start at Tier 1 (1 minute, no config), add backend only when you
want the real voice loop or accounts.

## Prerequisites
- **Node ≥ 20** (everything)
- **Docker** + **Supabase CLI** + a **Google Gemini API key** (Tiers 2–3 only)

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

## Tier 2 — Real voice (Supabase local + Gemini key, still no login)

Adds the **real Gemini Live voice loop** and AI scoring. The app stays in demo
mode (no login) — only the voice + scoring become real. This is the experience
to try first.

```bash
npm run setup

# 1. Local Supabase (Postgres + the live_tokens table + the skills seed)
supabase start
supabase db reset           # applies migrations + supabase/seed.sql

# 2. Your Gemini key, then serve the edge functions
echo "GEMINI_API_KEY=your-gemini-key" > supabase/.env
supabase functions serve --no-verify-jwt --env-file supabase/.env

# 3. In another terminal, run the web app (no .env needed)
npm run dev                 # → http://localhost:5173
```

The web app calls the local functions at `http://localhost:54321/functions/v1`
by default, so **Practice → speak with the coach → Finish → report** works
end to end. (Allow microphone access when the browser asks.)

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
| `npm run build:core` | rebuild `packages/core` (do this after editing it) |
| `npm run build:core:watch` | rebuild core on change |
| `npm test` | run the 128 unit tests |
| `npm run typecheck` | typecheck all packages |
| `npm run seeds` | regenerate the Supabase seed SQL from `core` |

**Mode is automatic:** with `VITE_SUPABASE_*` set → cloud (auth + persistence);
unset → local/demo. After editing `packages/core`, re-run `npm run build:core`.
