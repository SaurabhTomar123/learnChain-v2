-- =====================================================================
-- LearnChain Database Schema Migration v1
-- Applies to a Supabase (PostgreSQL 15+) project.
-- Safe to run on a fresh project OR an existing one that already has
-- the legacy tables: profiles, comments, votes.
-- =====================================================================

-- ───────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ───────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- full-text similarity search


-- ───────────────────────────────────────────────────────────────────
-- 1. PROFILES  (extends / creates auth.users mirror)
-- ───────────────────────────────────────────────────────────────────
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    create table public.profiles (
      id                 uuid primary key references auth.users(id) on delete cascade,
      username           text unique,
      full_name          text,
      name               text,          -- backward compat with existing code
      email              text,          -- backward compat
      avatar_url         text,
      dob                date,
      subscribed         boolean default false,
      -- gamification columns
      xp                 int     default 0   not null,
      level              int     default 1   not null,
      current_streak     int     default 0   not null,
      longest_streak     int     default 0   not null,
      last_activity_date date,
      career_mode        text    default 'product' not null
                           check (career_mode in
                             ('product','startup','service','faang','freelance','indie','gamedev')),
      created_at         timestamptz default now()
    );
  else
    -- Extend existing table without losing data
    alter table public.profiles
      add column if not exists username           text unique,
      add column if not exists full_name          text,
      add column if not exists avatar_url         text,
      add column if not exists xp                 int     default 0,
      add column if not exists level              int     default 1,
      add column if not exists current_streak     int     default 0,
      add column if not exists longest_streak     int     default 0,
      add column if not exists last_activity_date date,
      add column if not exists career_mode        text    default 'product';

    -- Add constraint only if it doesn't exist
    do $inner$ begin
      if not exists (
        select 1 from pg_constraint
        where conname = 'profiles_career_mode_check' and conrelid = 'public.profiles'::regclass
      ) then
        alter table public.profiles
          add constraint profiles_career_mode_check
          check (career_mode in ('product','startup','service','faang','freelance','indie','gamedev'));
      end if;
    end $inner$;
  end if;
end $$;


-- ───────────────────────────────────────────────────────────────────
-- 2. USER_BADGES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.user_badges (
  id        uuid        primary key default uuid_generate_v4(),
  user_id   uuid        not null references public.profiles(id) on delete cascade,
  badge_id  text        not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

create index if not exists user_badges_user_idx on public.user_badges(user_id);


-- ───────────────────────────────────────────────────────────────────
-- 3. ROADMAP_PROGRESS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.roadmap_progress (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  roadmap_item_id text        not null,   -- module id from roadmaps.json
  completed_at    timestamptz default now(),
  xp_earned       int         not null default 0,
  notes           text,
  unique(user_id, roadmap_item_id)
);

create index if not exists roadmap_progress_user_idx on public.roadmap_progress(user_id);


-- ───────────────────────────────────────────────────────────────────
-- 4. USER_PROJECTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.user_projects (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  project_id      text        not null,   -- slugified realWorldProjects[n].title
  roadmap_item_id text        not null,   -- parent module id
  submission_url  text,
  completed_at    timestamptz default now(),
  rating          smallint    check (rating between 1 and 5)
);

create index if not exists user_projects_user_idx on public.user_projects(user_id);


-- ───────────────────────────────────────────────────────────────────
-- 5. DISCUSSIONS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.discussions (
  id                  uuid        primary key default uuid_generate_v4(),
  user_id             uuid        not null references public.profiles(id) on delete cascade,
  title               text        not null,
  content             text        not null,
  tags                text[]      default '{}',
  career_mode_context text,
  is_pinned           boolean     default false,
  upvotes             int         default 0 not null,
  downvotes           int         default 0 not null,
  score               float       default 0 not null,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists discussions_score_idx on public.discussions(score desc);
create index if not exists discussions_tags_gin  on public.discussions using gin(tags);
create index if not exists discussions_user_idx  on public.discussions(user_id);


-- ───────────────────────────────────────────────────────────────────
-- 6. DISCUSSION_VOTES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.discussion_votes (
  id            uuid        primary key default uuid_generate_v4(),
  discussion_id uuid        not null references public.discussions(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  vote_type     smallint    not null check (vote_type in (-1, 1)),
  created_at    timestamptz default now(),
  unique(discussion_id, user_id)
);

create index if not exists disc_votes_discussion_idx on public.discussion_votes(discussion_id);


-- ───────────────────────────────────────────────────────────────────
-- 7. DISCUSSION_COMMENTS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.discussion_comments (
  id            uuid        primary key default uuid_generate_v4(),
  discussion_id uuid        not null references public.discussions(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  content       text        not null,
  created_at    timestamptz default now()
);

create index if not exists disc_comments_discussion_idx on public.discussion_comments(discussion_id);


-- ───────────────────────────────────────────────────────────────────
-- 8. SQUADS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.squads (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  description text,
  leader_id   uuid        not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now()
);


-- ───────────────────────────────────────────────────────────────────
-- 9. SQUAD_MEMBERS
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.squad_members (
  squad_id  uuid        not null references public.squads(id) on delete cascade,
  user_id   uuid        not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (squad_id, user_id)
);

create index if not exists squad_members_user_idx on public.squad_members(user_id);


-- ───────────────────────────────────────────────────────────────────
-- 10. CHAT_MESSAGES
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id          uuid        primary key default uuid_generate_v4(),
  sender_id   uuid        not null references public.profiles(id) on delete cascade,
  receiver_id uuid        references public.profiles(id) on delete set null,  -- null = squad message
  squad_id    uuid        references public.squads(id)   on delete cascade,   -- null = direct message
  content     text        not null,
  created_at  timestamptz default now(),
  constraint chat_messages_target_check check (
    (receiver_id is not null and squad_id is null) or
    (receiver_id is null     and squad_id is not null)
  )
);

create index if not exists chat_squad_idx on public.chat_messages(squad_id,    created_at desc);
create index if not exists chat_dm_idx    on public.chat_messages(sender_id, receiver_id, created_at desc);


-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================

-- ───────────────────────────────────────────────────────────────────
-- 11. Recalculate discussion score
--
-- score = (upvotes - downvotes)
--       + EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 * 0.1
--
-- Fresh posts get a small age bonus so they surface before they have
-- votes, then pure vote signal takes over as the post ages.
-- ───────────────────────────────────────────────────────────────────
create or replace function public.recalculate_discussion_score(p_discussion_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_upvotes   int;
  v_downvotes int;
  v_age_hours float;
begin
  select
    coalesce(sum(case when vote_type =  1 then 1 else 0 end), 0),
    coalesce(sum(case when vote_type = -1 then 1 else 0 end), 0)
  into v_upvotes, v_downvotes
  from public.discussion_votes
  where discussion_id = p_discussion_id;

  select extract(epoch from (now() - created_at)) / 3600.0
  into v_age_hours
  from public.discussions
  where id = p_discussion_id;

  update public.discussions
  set
    upvotes   = v_upvotes,
    downvotes = v_downvotes,
    score     = (v_upvotes - v_downvotes) + v_age_hours * 0.1
  where id = p_discussion_id;
end;
$$;


create or replace function public.trg_sync_discussion_score()
returns trigger
language plpgsql
security definer
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recalculate_discussion_score(old.discussion_id);
  else
    perform public.recalculate_discussion_score(new.discussion_id);
  end if;
  return null;
end;
$$;

drop trigger if exists sync_discussion_score on public.discussion_votes;
create trigger sync_discussion_score
  after insert or update or delete on public.discussion_votes
  for each row execute function public.trg_sync_discussion_score();


-- ───────────────────────────────────────────────────────────────────
-- 12. RPC: upsert_vote
--
-- Called from the TrendingPage component via supabase.rpc('upsert_vote', {...})
-- Toggle semantics:
--   • No prior vote        → insert vote
--   • Same vote again      → remove vote (toggle off)
--   • Opposite vote        → switch to new vote
--
-- The score trigger fires automatically after each mutation.
-- Returns updated counts for optimistic UI confirmation/rollback.
-- ───────────────────────────────────────────────────────────────────
create or replace function public.upsert_vote(
  p_discussion_id uuid,
  p_vote_type     smallint   -- 1 (upvote) or -1 (downvote)
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id      uuid := auth.uid();
  v_existing_row public.discussion_votes%rowtype;
  v_action       text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_existing_row
  from public.discussion_votes
  where discussion_id = p_discussion_id and user_id = v_user_id;

  if not found then
    insert into public.discussion_votes(discussion_id, user_id, vote_type)
    values (p_discussion_id, v_user_id, p_vote_type);
    v_action := 'inserted';

  elsif v_existing_row.vote_type = p_vote_type then
    -- Same vote: toggle off
    delete from public.discussion_votes
    where discussion_id = p_discussion_id and user_id = v_user_id;
    v_action := 'removed';

  else
    -- Opposite vote: switch
    update public.discussion_votes
    set vote_type = p_vote_type
    where discussion_id = p_discussion_id and user_id = v_user_id;
    v_action := 'switched';
  end if;

  -- Trigger on discussion_votes handles score recalculation automatically.
  return (
    select json_build_object(
      'action',    v_action,
      'upvotes',   upvotes,
      'downvotes', downvotes,
      'score',     score,
      'user_vote', case
                     when v_action = 'removed' then null
                     else p_vote_type
                   end
    )
    from public.discussions
    where id = p_discussion_id
  );
end;
$$;


-- ───────────────────────────────────────────────────────────────────
-- 13. RPC: update_streak_and_xp
--
-- Called from the frontend via supabase.rpc('update_streak_and_xp', {...})
-- when a roadmap_progress row is inserted.
--
-- Streak rules:
--   • Active today already       → streak unchanged
--   • Active yesterday           → streak + 1
--   • Gap > 1 day (or first use) → streak resets to 1
--
-- XP multiplier (only when item has streakMult = true):
--   +10% per consecutive day of streak, capped at +100% (10-day streak).
--
-- Level: 1 level per 500 XP, floors at 1.
-- ───────────────────────────────────────────────────────────────────
create or replace function public.update_streak_and_xp(
  p_user_id          uuid,
  p_xp_earned        int,
  p_streak_mult_item boolean
)
returns json
language plpgsql
security definer
as $$
declare
  v_profile       public.profiles%rowtype;
  v_today         date    := current_date;
  v_yesterday     date    := current_date - interval '1 day';
  v_new_streak    int;
  v_xp_final      int;
  v_new_xp        int;
  v_new_level     int;
  v_xp_per_level  int := 500;
begin
  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;   -- row lock prevents race condition on concurrent requests

  if not found then
    raise exception 'Profile not found for user %', p_user_id;
  end if;

  -- Streak calculation
  if v_profile.last_activity_date = v_today then
    v_new_streak := v_profile.current_streak;
  elsif v_profile.last_activity_date = v_yesterday then
    v_new_streak := v_profile.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  -- XP with optional streak multiplier (+10% per day, cap at 2×)
  if p_streak_mult_item and v_new_streak > 1 then
    v_xp_final := floor(p_xp_earned * (1.0 + least(v_new_streak - 1, 10) * 0.1));
  else
    v_xp_final := p_xp_earned;
  end if;

  v_new_xp    := v_profile.xp + v_xp_final;
  v_new_level := greatest(1, floor(v_new_xp::float / v_xp_per_level) + 1);

  update public.profiles set
    xp                 = v_new_xp,
    level              = v_new_level,
    current_streak     = v_new_streak,
    longest_streak     = greatest(v_profile.longest_streak, v_new_streak),
    last_activity_date = v_today
  where id = p_user_id;

  return json_build_object(
    'new_xp',         v_new_xp,
    'new_level',      v_new_level,
    'xp_earned',      v_xp_final,
    'current_streak', v_new_streak,
    'longest_streak', greatest(v_profile.longest_streak, v_new_streak),
    'leveled_up',     v_new_level > v_profile.level
  );
end;
$$;


-- ───────────────────────────────────────────────────────────────────
-- 14. Trigger: auto-create profile on Supabase Auth sign-up
-- ───────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, email, full_name, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.profiles            enable row level security;
alter table public.user_badges         enable row level security;
alter table public.roadmap_progress    enable row level security;
alter table public.user_projects       enable row level security;
alter table public.discussions         enable row level security;
alter table public.discussion_votes    enable row level security;
alter table public.discussion_comments enable row level security;
alter table public.squads              enable row level security;
alter table public.squad_members       enable row level security;
alter table public.chat_messages       enable row level security;


-- ── profiles ──────────────────────────────────────────────────────
create policy "profiles_select_all"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);


-- ── user_badges ───────────────────────────────────────────────────
create policy "badges_select_all"
  on public.user_badges for select using (true);

-- Badges are awarded server-side (Edge Function / security definer RPC).
-- Direct client inserts are blocked; add service-role insert policy if needed.


-- ── roadmap_progress ──────────────────────────────────────────────
create policy "progress_select_own"
  on public.roadmap_progress for select using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.roadmap_progress for insert with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.roadmap_progress for update using (auth.uid() = user_id);


-- ── user_projects ─────────────────────────────────────────────────
create policy "projects_select_own"
  on public.user_projects for select using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.user_projects for insert with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.user_projects for update using (auth.uid() = user_id);


-- ── discussions ───────────────────────────────────────────────────
create policy "discussions_select_all"
  on public.discussions for select using (true);

create policy "discussions_insert_auth"
  on public.discussions for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "discussions_update_own"
  on public.discussions for update using (auth.uid() = user_id);

create policy "discussions_delete_own"
  on public.discussions for delete using (auth.uid() = user_id);


-- ── discussion_votes ──────────────────────────────────────────────
-- Mutations are handled by the upsert_vote RPC (security definer).
-- Read policy lets the frontend load the current user's vote state.
create policy "disc_votes_select_own"
  on public.discussion_votes for select using (auth.uid() = user_id);


-- ── discussion_comments ───────────────────────────────────────────
create policy "disc_comments_select_all"
  on public.discussion_comments for select using (true);

create policy "disc_comments_insert_auth"
  on public.discussion_comments for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "disc_comments_delete_own"
  on public.discussion_comments for delete using (auth.uid() = user_id);


-- ── squads ────────────────────────────────────────────────────────
create policy "squads_select_all"
  on public.squads for select using (true);

create policy "squads_insert_auth"
  on public.squads for insert
  with check (auth.uid() is not null and auth.uid() = leader_id);

create policy "squads_update_leader"
  on public.squads for update using (auth.uid() = leader_id);


-- ── squad_members ─────────────────────────────────────────────────
create policy "squad_members_select_all"
  on public.squad_members for select using (true);

create policy "squad_members_insert_own"
  on public.squad_members for insert with check (auth.uid() = user_id);

create policy "squad_members_delete_own"
  on public.squad_members for delete using (auth.uid() = user_id);


-- ── chat_messages ─────────────────────────────────────────────────
-- Visible to: sender, direct message receiver, or members of the squad.
create policy "chat_select_participant"
  on public.chat_messages for select
  using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
    or exists (
      select 1 from public.squad_members sm
      where sm.squad_id = chat_messages.squad_id
        and sm.user_id  = auth.uid()
    )
  );

create policy "chat_insert_sender"
  on public.chat_messages for insert
  with check (auth.uid() = sender_id);
