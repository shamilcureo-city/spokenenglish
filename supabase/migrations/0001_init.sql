-- FluentMap initial schema
-- Postgres / Supabase. User-owned tables are protected by RLS keyed on auth.uid();
-- reference tables (skills, l1_transfer_rules, lessons, scenarios, languages) are
-- public-read and written only by the service role (which bypasses RLS).

create extension if not exists pgcrypto;

-- ════════════════════════════ Identity ════════════════════════════

create table if not exists profiles (
  id              uuid primary key references auth.users on delete cascade,
  name            text,
  l1              text not null default 'Hindi',      -- mother tongue / support language
  goal            text default 'Daily English',
  target_cefr     text not null default 'B1',
  correction_mode text not null default 'gentle',     -- gentle | realtime | fluency
  streak          int  not null default 0,
  last_active_date date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists languages (
  code            text primary key,                   -- 'Hindi', 'Tamil', ...
  native_name     text not null,
  greeting        text,
  encouragement   text,
  correction_label text
);

-- ════════════════════════════ Taxonomy (reference) ════════════════════════════

create table if not exists skills (
  id            text primary key,                     -- 'gr.present_perfect'
  family        text not null check (family in ('grammar','function','lexis','phoneme')),
  label         text not null,
  cefr          text not null,
  cluster       text,
  difficulty    real not null default 0.5,
  prerequisites text[] not null default '{}',
  exemplar      text,
  detectors     jsonb not null default '[]'
);
create index if not exists skills_family_idx on skills (family);
create index if not exists skills_cefr_idx on skills (cefr);

create table if not exists l1_transfer_rules (
  id            text primary key,                     -- 'hi.article_omission'
  l1            text not null,
  category      text not null check (category in ('grammar','phonetic','lexical','pragmatic')),
  skill_id      text references skills(id),
  title         text not null,
  cause         text not null,
  triggers      jsonb not null default '[]',
  explanations  jsonb not null default '{}',          -- { "Hindi": "...", "Tamil": "..." }
  contrast      jsonb not null default '{}',          -- { "l1Form": "...", "l2Form": "..." }
  example_errors text[] not null default '{}'
);
create index if not exists l1_rules_l1_idx on l1_transfer_rules (l1);
create index if not exists l1_rules_skill_idx on l1_transfer_rules (skill_id);

-- ════════════════════════════ Per-user science ════════════════════════════

create table if not exists skill_states (
  user_id        uuid not null references profiles(id) on delete cascade,
  skill_id       text not null references skills(id),
  mastery        real not null default 0,
  stability      real not null default 0,             -- FSRS S
  difficulty     real not null default 0,             -- FSRS D (1..10; 0 = unseen)
  reps           int  not null default 0,
  lapses         int  not null default 0,
  exposures      int  not null default 0,
  correct_count  int  not null default 0,
  error_count    int  not null default 0,
  last_reviewed_at timestamptz,
  due_at         timestamptz,
  state          text not null default 'new',         -- new | learning | review | mastered
  updated_at     timestamptz not null default now(),
  primary key (user_id, skill_id)
);
create index if not exists skill_states_due_idx on skill_states (user_id, due_at);
create index if not exists skill_states_mastery_idx on skill_states (user_id, mastery);

create table if not exists review_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  skill_id      text not null references skills(id),
  correction_id uuid,
  prompt        text,
  expected      text,
  l1_rule_id    text references l1_transfer_rules(id),
  due_at        timestamptz not null default now(),
  interval_days int  not null default 0,
  reps          int  not null default 0,
  lapses        int  not null default 0,
  suspended     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists review_items_due_idx on review_items (user_id, due_at) where suspended = false;

-- ════════════════════════════ Content (reference) ════════════════════════════

create table if not exists lessons (
  id                     text primary key,
  track_id               text,
  module_index           int,
  lesson_index           int,
  title                  text not null,
  scenario               text,
  cefr                   text,
  structures             text[] not null default '{}',
  pass_score             int not null default 60,
  target_minutes         int not null default 12,
  system_prompt_template text
);
create index if not exists lessons_track_idx on lessons (track_id, module_index, lesson_index);

create table if not exists lesson_target_skills (
  lesson_id text not null references lessons(id) on delete cascade,
  skill_id  text not null references skills(id),
  weight    real not null default 1,
  primary key (lesson_id, skill_id)
);

create table if not exists scenarios (
  id       text primary key,
  title    text not null,
  category text,
  prompt   text
);

-- ════════════════════════════ Sessions & evidence (user-owned) ════════════════════════════

create table if not exists sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  kind             text not null check (kind in ('lesson','assessment','review')),
  lesson_id        text references lessons(id),
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_seconds int,
  status           text not null default 'in_progress'
);
create index if not exists sessions_user_idx on sessions (user_id, started_at desc);

create table if not exists utterances (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references sessions(id) on delete cascade,
  user_id            uuid not null references profiles(id) on delete cascade,
  speaker            text not null check (speaker in ('learner','ai')),
  text               text,
  ts                 timestamptz not null default now(),
  detected_skill_ids text[] not null default '{}'
);
create index if not exists utterances_session_idx on utterances (session_id, ts);

create table if not exists corrections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  session_id   uuid references sessions(id) on delete cascade,
  utterance_id uuid references utterances(id),
  skill_id     text references skills(id),
  l1_rule_id   text references l1_transfer_rules(id),
  mistake_type text,
  original     text,
  corrected    text,
  explanation  text,                                  -- resolved in the learner's L1
  resolved     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists corrections_user_idx on corrections (user_id, created_at desc);

-- ════════════════════════════ Assessment & reports (user-owned) ════════════════════════════

create table if not exists assessments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  version          text not null default 'speakscore-v1',
  speak_score      int,
  band             text,
  sub_scores       jsonb,                             -- {fluency,pronunciation,grammar,vocabulary,interaction}
  placement        jsonb,
  summary          text,
  strengths        text[] not null default '{}',
  focus_areas      text[] not null default '{}',
  duration_seconds int,
  taken_at         timestamptz not null default now()
);
create index if not exists assessments_user_idx on assessments (user_id, taken_at desc);

create table if not exists reports (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  score      int,
  payload    jsonb,
  created_at timestamptz not null default now()
);
create index if not exists reports_user_idx on reports (user_id, created_at desc);

-- ════════════════════════════ Commerce (user-owned) ════════════════════════════

create table if not exists subscriptions (
  user_id            uuid primary key references profiles(id) on delete cascade,
  plan               text not null default 'Free',
  status             text,
  daily_minutes      int not null default 5,
  provider           text,
  current_period_end timestamptz,
  updated_at         timestamptz not null default now()
);

create table if not exists usage_daily (
  user_id      uuid not null references profiles(id) on delete cascade,
  date         date not null,
  used_minutes real not null default 0,
  primary key (user_id, date)
);

-- ════════════════════════════ B2B (Phase 4+) ════════════════════════════

create table if not exists organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists org_members (
  org_id  uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role    text not null default 'learner',
  primary key (org_id, user_id)
);

-- ════════════════════════════ Row-Level Security ════════════════════════════

alter table profiles        enable row level security;
alter table skill_states    enable row level security;
alter table review_items    enable row level security;
alter table sessions        enable row level security;
alter table utterances      enable row level security;
alter table corrections     enable row level security;
alter table assessments     enable row level security;
alter table reports         enable row level security;
alter table subscriptions   enable row level security;
alter table usage_daily     enable row level security;
alter table org_members     enable row level security;

-- Reference tables: readable by everyone, writable only by the service role.
alter table languages          enable row level security;
alter table skills             enable row level security;
alter table l1_transfer_rules  enable row level security;
alter table lessons            enable row level security;
alter table lesson_target_skills enable row level security;
alter table scenarios          enable row level security;
alter table organizations      enable row level security;

create policy "profiles_own" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "skill_states_own" on skill_states for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "review_items_own" on review_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_own" on sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "utterances_own" on utterances for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "corrections_own" on corrections for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessments_own" on assessments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports_own" on reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions_own" on subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "usage_daily_own" on usage_daily for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reference tables: public read.
create policy "languages_read"  on languages         for select using (true);
create policy "skills_read"     on skills            for select using (true);
create policy "l1_rules_read"   on l1_transfer_rules for select using (true);
create policy "lessons_read"    on lessons           for select using (true);
create policy "lts_read"        on lesson_target_skills for select using (true);
create policy "scenarios_read"  on scenarios         for select using (true);

-- Org membership: a learner can see their own memberships and orgs they belong to.
create policy "org_members_self" on org_members for select
  using (auth.uid() = user_id);
create policy "organizations_member_read" on organizations for select
  using (exists (select 1 from org_members m where m.org_id = organizations.id and m.user_id = auth.uid()));
