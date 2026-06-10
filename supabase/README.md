# FluentMap — Supabase

The data model for accounts, the learning-science state, content, and analytics.

```
supabase/
├─ migrations/0001_init.sql   # full schema + indexes + RLS
├─ seeds/                     # topical, human-readable (auto-generated)
│  ├─ languages.sql
│  ├─ skills.sql              # the ~120-skill taxonomy
│  └─ l1_transfer_rules.sql   # the contrastive KB
└─ seed.sql                   # combined seed Supabase runs on db reset (auto-generated)
```

## Seeds are generated from code

The taxonomy, transfer-rule KB, and language profiles are the type-checked,
unit-tested source of truth in `packages/core`. **Never edit the `.sql` seeds by
hand** — regenerate them:

```bash
npx tsx scripts/gen-seeds.ts
```

## Local setup

```bash
# one-time, if supabase/config.toml doesn't exist yet:
supabase init          # keep the existing migrations/ and seed.sql

supabase start         # boots local Postgres + Auth + Studio
supabase db reset      # applies migrations/0001_init.sql, then seed.sql
```

`db reset` re-runs migrations and the combined seed; the seed uses idempotent
upserts, so it's safe to re-run after `npx tsx scripts/gen-seeds.ts`.

## Deploy to a hosted project

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push                       # apply migrations to the remote
psql "$DATABASE_URL" -f supabase/seed.sql   # seed reference data (or run via Studio)
```

## Security model

- **User-owned tables** (`profiles`, `skill_states`, `review_items`, `sessions`,
  `utterances`, `corrections`, `assessments`, `reports`, `subscriptions`,
  `usage_daily`) have RLS `using (auth.uid() = user_id)` — a learner can only ever
  read/write their own rows.
- **Reference tables** (`languages`, `skills`, `l1_transfer_rules`, `lessons`,
  `lesson_target_skills`, `scenarios`) are public-read; writes go through the
  service role (used by `gen-seeds` / admin), which bypasses RLS.
- Hot paths are indexed on `(user_id, due_at)` because the sequencer constantly
  queries "skills/reviews due now".

## Edge functions

`supabase/functions/` holds the token proxy + scoring functions (the only place
`GEMINI_API_KEY` is used). Migration `0002_live_tokens.sql` adds their token
store. See `supabase/functions/README.md` for local serve + curl tests.

## Next (later phases)

- `lessons` / `lesson_target_skills` / `scenarios` seeds (Phase 4 content move).
