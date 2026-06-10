# Edge functions

Deno functions that keep `GEMINI_API_KEY` server-side and run the scoring passes.
The hard logic (prompts, Gemini REST shaping, validation/assembly) lives in
`@fluentmap/core/scoring` and is unit-tested in Node — these functions are thin
HTTP wrappers. `deno.json` maps `@fluentmap/core/*` to the built `packages/core/dist`.

| Function | Method | Purpose |
|---|---|---|
| `start-session` | POST | Mint a single-use token → Live WebSocket URL (stored in `live_tokens`). |
| `redeem-session` | GET | Exchange the token for the WSS URL (single-use, 30-min TTL). |
| `score-assessment` | POST | Score the 5-min assessment (verbatim CEFR prompt, temp 0.2). |
| `score-session` | POST | Score a lesson → summary + skill/L1 evidence (`ScoredSession`). |

## Run locally

```bash
# 0. Build core first — the functions import packages/core/dist
npm run build -w @fluentmap/core

# 1. One-time, if you haven't already:
supabase init            # keeps existing migrations/ + functions/

# 2. Start local stack + apply schema & seeds (needs Docker)
supabase start
supabase db reset        # runs migrations (incl. live_tokens) + seed.sql

# 3. Provide the Gemini key to the functions
supabase secrets set GEMINI_API_KEY=your-key   # or add to supabase/.env for local

# 4. Serve the functions (skip JWT for easy curl testing)
supabase functions serve --no-verify-jwt --env-file supabase/.env
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — you
only set `GEMINI_API_KEY`.

## Smoke tests

```bash
BASE=http://localhost:54321/functions/v1

# token proxy
TOKEN=$(curl -s -XPOST $BASE/start-session | jq -r .token)
curl -s "$BASE/redeem-session?token=$TOKEN" | jq      # → { wsUrl }
curl -s "$BASE/redeem-session?token=$TOKEN" | jq      # → 401 (single-use)

# assessment scoring
curl -s -XPOST $BASE/score-assessment -H 'content-type: application/json' -d '{
  "supportLanguage":"Hindi",
  "transcript":[{"speaker":"ai","text":"Tell me about your job."},
                {"speaker":"learner","text":"I am working in a bank since two years."}]
}' | jq

# session scoring → ScoredSession evidence
curl -s -XPOST $BASE/score-session -H 'content-type: application/json' -d '{
  "sessionId":"s1","userId":"u1","l1":"Hindi","lessonTitle":"Interview intro",
  "transcript":[{"speaker":"ai","text":"Introduce yourself."},
                {"speaker":"learner","text":"I am knowing English. I am doctor."}]
}' | jq
```

The client then runs `science.ingestSessionEvidence(scored, priorStates, { now })`
(pure) and persists the updated `skill_states` + `review_items` — that's Sprint 1F.

## 🔒 Security (token proxy)

By default `redeem-session` returns a WSS URL containing the raw `GEMINI_API_KEY`
(the verified Live path). Set **`GEMINI_USE_EPHEMERAL_TOKENS=true`** to instead
mint a single-use, short-lived **ephemeral token** in `start-session`, so the key
never reaches the browser. It falls back to the key path if minting fails, so
enabling it can't break voice. ⚠️ The ephemeral path is **unverified against a
live key in this build** — confirm the `auth_tokens` endpoint, the `v1alpha`
model availability, and the connect param for your project before relying on it.
