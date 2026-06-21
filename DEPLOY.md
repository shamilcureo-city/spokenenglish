# Deploying Speakwell

Two pieces: the **web app** (static PWA) and the **API** (token-proxy + recap/placement
scoring). They deploy separately. Everything below is wired and ready — you supply the
host accounts + secrets.

> ⚠️ **Before public launch:** turn on ephemeral Gemini tokens and a CORS allowlist
> (steps below). The local dev server sends the raw key to the browser — fine on
> `localhost`, **never** in production.

---

## 1. API (the backend) — deploy first

It's a plain Node/Express app (`server/index.mjs`) that imports the built `@fluentmap/core`.
Host it anywhere that runs Node (Render, Railway, Fly, a small VPS).

- **Build:** `npm install && npm run build -w packages/core`
- **Start:** `npm start`  (→ `node server/index.mjs`)
- **Env vars (set in the host dashboard, never commit):**
  | var | value | notes |
  |---|---|---|
  | `GEMINI_API_KEY` | your Google Gemini key | required |
  | `GEMINI_EPHEMERAL` | `true` | **mints short-lived tokens so the raw key never reaches the browser.** Verify it works against your Gemini project first (see below); it fails *closed*. |
  | `ALLOWED_ORIGINS` | `https://speakwell.app` | comma-separated CORS allowlist. Unset = allow all (dev only). |
  | `PORT` | host-provided | optional |

  Built-in protections (already on): per-IP rate limits on `/start-session`, `/recap`,
  `/placement`; transcript size caps; expired-token sweep; upstream errors kept server-side.

**Verify ephemeral tokens** before flipping `GEMINI_EPHEMERAL=true` in prod:
```
curl -X POST "https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=$GEMINI_API_KEY" \
  -H 'content-type: application/json' -d '{"uses":1}'
```
If that returns a token `name`, you're good. (The exact API can change — adjust
`mintEphemeralToken()` in `server/index.mjs` if needed, then keep it default-on.)

---

## 2. Web app — deploy on Vercel (or any static host)

`vercel.json` is configured (build + SPA rewrites). 

- Import the repo in Vercel; it uses `vercel.json` automatically.
- **Env var:** `VITE_FUNCTIONS_URL = https://<your-api-host>`  (without it the build defaults
  to a same-origin `/api`). See `apps/web/.env.production.example`.
- After the first deploy, set `APP_SHARE_URL` in `apps/web/src/lib/constants.ts` to your real
  domain so the WhatsApp share card + invite point somewhere real.

---

## 3. Domain + final checks

- Point `speakwell.app` (and an `api.` subdomain for the backend) at the hosts.
- Confirm: a real session connects, recap + placement score, the share card opens,
  "Add to Home Screen" appears on Android Chrome.
- iOS home-screen icon needs a PNG `apple-touch-icon` (the current SVG covers Android);
  add `apple-touch-icon-180.png` to `apps/web/public/` as a polish step.

---

## Still to come (needs your accounts)
- **Accounts + cloud sync (E8)** — Supabase, so progress follows users across devices.
  Until then, Settings → Export/Restore is the manual backup.
- **Analytics** — `track()` call sites exist; wire to PostHog/Firebase to measure D1/D7/K.
- **Error monitoring** — add Sentry to `ErrorBoundary` + a global handler.
