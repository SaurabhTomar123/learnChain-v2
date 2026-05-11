-- =====================================================================
-- LearnChain Learning OS Schema Migration v2
-- Adds learner preferences, saved resources, study plans, and reminders.
-- =====================================================================

create table if not exists public.user_learning_preferences (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  goal                text not null default 'get_first_job',
  experience_level    text not null default 'beginner',
  weekly_hours        int  not null default 6 check (weekly_hours between 1 and 80),
  preferred_stack     text,
  target_company_type text not null default 'product',
  start_date          date not null default current_date,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create table if not exists public.saved_resources (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  roadmap_id     text not null,
  module_id      text not null,
  resource_url   text not null,
  resource_title text not null,
  resource_type  text not null default 'resource',
  created_at     timestamptz default now(),
  unique(user_id, resource_url)
);

create index if not exists saved_resources_user_idx on public.saved_resources(user_id, created_at desc);
create index if not exists saved_resources_module_idx on public.saved_resources(roadmap_id, module_id);

create table if not exists public.study_plans (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  roadmap_id   text not null,
  weekly_hours int  not null default 6 check (weekly_hours between 1 and 80),
  start_date   date not null default current_date,
  plan_json    jsonb not null default '[]'::jsonb,
  active       boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists study_plans_user_idx on public.study_plans(user_id, active, created_at desc);

create table if not exists public.learning_reminders (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  frequency      text not null default 'weekly' check (frequency in ('daily', 'weekly', 'weekdays', 'off')),
  preferred_time time not null default '19:00',
  timezone       text not null default 'Asia/Kolkata',
  enabled        boolean not null default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists learning_reminders_user_idx on public.learning_reminders(user_id, enabled);

alter table public.user_learning_preferences enable row level security;
alter table public.saved_resources           enable row level security;
alter table public.study_plans               enable row level security;
alter table public.learning_reminders        enable row level security;

drop policy if exists "learning_preferences_select_own" on public.user_learning_preferences;
create policy "learning_preferences_select_own"
  on public.user_learning_preferences for select using (auth.uid() = user_id);

drop policy if exists "learning_preferences_insert_own" on public.user_learning_preferences;
create policy "learning_preferences_insert_own"
  on public.user_learning_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "learning_preferences_update_own" on public.user_learning_preferences;
create policy "learning_preferences_update_own"
  on public.user_learning_preferences for update using (auth.uid() = user_id);

drop policy if exists "saved_resources_select_own" on public.saved_resources;
create policy "saved_resources_select_own"
  on public.saved_resources for select using (auth.uid() = user_id);

drop policy if exists "saved_resources_insert_own" on public.saved_resources;
create policy "saved_resources_insert_own"
  on public.saved_resources for insert with check (auth.uid() = user_id);

drop policy if exists "saved_resources_delete_own" on public.saved_resources;
create policy "saved_resources_delete_own"
  on public.saved_resources for delete using (auth.uid() = user_id);

drop policy if exists "study_plans_select_own" on public.study_plans;
create policy "study_plans_select_own"
  on public.study_plans for select using (auth.uid() = user_id);

drop policy if exists "study_plans_insert_own" on public.study_plans;
create policy "study_plans_insert_own"
  on public.study_plans for insert with check (auth.uid() = user_id);

drop policy if exists "study_plans_update_own" on public.study_plans;
create policy "study_plans_update_own"
  on public.study_plans for update using (auth.uid() = user_id);

drop policy if exists "learning_reminders_select_own" on public.learning_reminders;
create policy "learning_reminders_select_own"
  on public.learning_reminders for select using (auth.uid() = user_id);

drop policy if exists "learning_reminders_insert_own" on public.learning_reminders;
create policy "learning_reminders_insert_own"
  on public.learning_reminders for insert with check (auth.uid() = user_id);

drop policy if exists "learning_reminders_update_own" on public.learning_reminders;
create policy "learning_reminders_update_own"
  on public.learning_reminders for update using (auth.uid() = user_id);
