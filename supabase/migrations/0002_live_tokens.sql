-- Ephemeral token store for the Gemini Live token proxy.
-- Written and read ONLY by edge functions via the service role. RLS is enabled
-- with no policies, so it is unreachable from anon/authenticated clients.

create table if not exists live_tokens (
  token      text primary key,
  ws_url     text not null,
  created_at timestamptz not null default now()
);
create index if not exists live_tokens_created_idx on live_tokens (created_at);

alter table live_tokens enable row level security;
-- (intentionally no policies — service role bypasses RLS; nobody else can read)
