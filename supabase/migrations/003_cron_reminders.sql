-- =====================================================================
-- Migration 003 — Schedule reminder emails via pg_cron
--
-- Prerequisites (Dashboard → Database → Extensions):
--   • pg_cron  — enable before running this
--   • pg_net   — enable before running this
--
-- Before running this SQL:
--   1. Generate a CRON_SECRET:
--        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
--   2. Register it with your Edge Function:
--        npx supabase secrets set CRON_SECRET=<your_generated_secret>
--   3. Replace PASTE_YOUR_CRON_SECRET_HERE below with that same secret.
--
-- The secret is stored server-side in the cron job definition only.
-- It is never exposed to the browser or frontend clients.
-- =====================================================================

-- Enable pg_cron (safe to re-run)
create extension if not exists pg_cron;

-- Remove old job if it exists (idempotent redeploy)
select cron.unschedule('learnchain-send-reminders')
where exists (
  select 1 from cron.job where jobname = 'learnchain-send-reminders'
);

-- Schedule: every 30 minutes, 24/7
select cron.schedule(
  'learnchain-send-reminders',
  '*/30 * * * *',
  $$
    select net.http_post(
      url     := 'https://qkggayyteclockulbtmh.supabase.co/functions/v1/send-reminders',
      headers := jsonb_build_object(
        'Authorization', 'Bearer PASTE_YOUR_CRON_SECRET_HERE',
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);
