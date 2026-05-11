# LearnChain — Developer Career Platform for India

Structured learning roadmaps, XP gamification, squads, and a personal Learning OS for software engineers in India.

## What this is

LearnChain is a full-stack learning platform built on **React + Supabase**. It started as a static roadmap site and has grown into a gamified platform with auth, real-time squad chat, a weekly study planner, a leaderboard, and personalised email reminders.

**Not** ad-supported. **Not** affiliate-driven. Everything is free.

---

## Product

| Feature | Route | Status |
|---|---|---|
| Home — roadmap discovery | `/` | ✅ |
| Roadmap detail (tabs: Overview, Projects, Revision, Reality Check, Squad) | `/roadmap/:id` | ✅ |
| Trending discussions + voting | `/trending` | ✅ |
| Leaderboard (all-time, monthly, weekly) | `/leaderboard` | ✅ |
| Squads — create, join, real-time chat | `/squads`, `/squads/:id` | ✅ |
| Personal profile + career mode switcher | `/profile` | ✅ |
| Public profile | `/u/:username` | ✅ |
| Learning OS — weekly study plan | `/dashboard` | ✅ |
| Onboarding wizard | `/onboarding` | ✅ |
| Compare roadmaps side-by-side | `/compare` | ✅ |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| Routing | Wouter |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Email | Resend (reminder Edge Function) |
| Charts | Recharts |
| Build | pnpm, esbuild |

---

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm check      # TypeScript
pnpm build      # Production build
```

### Required env vars

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable_key>
```

Both values are found in your Supabase project under **Settings → API**.
- `VITE_SUPABASE_URL` → "Project URL"
- `VITE_SUPABASE_PUBLISHABLE_KEY` → "Publishable key" (formerly "anon key")

### Optional (for email reminders)

```
# Not needed for local dev — only needed when deploying the Edge Function
RESEND_API_KEY=re_...
APP_URL=https://learnchain.in
```

---

## Database setup

Run both migrations in order in your Supabase SQL editor:

1. `supabase/migrations/001_learnchain_schema.sql` — core tables + RLS + triggers
2. `supabase/migrations/002_learning_os_schema.sql` — Learning OS tables
3. `supabase/migrations/003_cron_reminders.sql` — pg_cron job for email reminders (optional)

All tables have Row Level Security enabled. See the migration files for full policy details.

---

## Email reminders setup (step-by-step)

The reminder system works as follows:
1. Users enable a reminder in `/dashboard`
2. Their `preferred_time` and `timezone` are stored in the `learning_reminders` table
3. A Supabase Edge Function (`send-reminders`) runs every 30 minutes via pg_cron and sends emails via Resend

### Step 1 — Get a Resend API key

1. Go to [resend.com](https://resend.com) and create a free account
2. In the Resend dashboard, go to **API Keys → Create API Key**
3. Name it `learnchain-reminders`, scope it to "Sending access"
4. Copy the key (starts with `re_`)

### Step 2 — Add a sending domain in Resend

1. In Resend, go to **Domains → Add Domain**
2. Add your domain (e.g., `learnchain.in`)
3. Add the DNS records Resend shows you to your DNS provider
4. Wait for verification (usually under 5 minutes)
5. Update the `from` address in `supabase/functions/send-reminders/index.ts` from `reminders@learnchain.in` to your verified domain

> For testing without a domain: use `onboarding@resend.dev` as the from address — it works without domain setup but only delivers to your own Resend-verified email.

### Step 3 — Deploy the Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <project-ref>

# Set the Resend secret
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set APP_URL=https://learnchain.in

# Deploy
supabase functions deploy send-reminders --no-verify-jwt
```

### Step 4 — Enable pg_cron and pg_net in Supabase

1. Go to **Supabase Dashboard → Database → Extensions**
2. Enable `pg_cron`
3. Enable `pg_net`

### Step 5 — Configure the cron job

Run this in the Supabase SQL editor (replace values with your actual credentials):

```sql
-- Store your app settings (server-side only, never exposed to clients)
alter database postgres set app.supabase_url = 'https://<project>.supabase.co';
alter database postgres set app.secret_key = '<your_secret_key>';

-- Then run migration 003
\i supabase/migrations/003_cron_reminders.sql
```

The `secret_key` is in **Supabase Dashboard → Settings → API → Secret key** (formerly "service_role").

### Step 6 — Test it

Send a test email immediately (doesn't wait for cron):

```bash
curl -X POST https://<project>.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer <secret_key>"
```

---

## Adding a new roadmap

1. Add an entry to `client/src/data/roadmaps.json` following the existing schema
2. For v2 features (Projects tab, Revision, Reality Check), populate the optional module fields:
   - `realWorldProjects[]` — 5 projects per roadmap, one per module
   - `revisionContent` — flashcards + quiz questions
   - `realityCheck` — market relevance, realistic timeline, prerequisites
   - `gamification` — XP reward + badges

See `client/src/types/database.ts` for the full TypeScript types.

---

## Public profiles

Every user gets a public profile at `/u/:username` (or `/u/:id` if no username is set).

- Linked from: leaderboard entries, squad member chips, ProfilePage's "Share" banner
- Shows: level, XP, roadmap progress count, projects count
- No sensitive data is exposed (RLS only lets the public see what's in the `profiles` table)

---

## Project structure

```
client/src/
  components/       shadcn/ui + custom components
  context/          AuthContext (Supabase Auth)
  hooks/            useProfile, useLearningOS, useComposition
  lib/              supabase client, careerMode util
  pages/            All route components
  data/             roadmaps.json
  types/            database.ts — all row types

supabase/
  functions/
    handle-progress/   Awards XP + badges on module completion
    send-reminders/    Sends email nudges via Resend
  migrations/
    001_learnchain_schema.sql
    002_learning_os_schema.sql
    003_cron_reminders.sql
```

---

## Contributing

1. Create a feature branch off `main`
2. Run `pnpm check` before opening a PR
3. For content-only changes (roadmaps.json), no code review needed

---

## License

Proprietary. All rights reserved.
