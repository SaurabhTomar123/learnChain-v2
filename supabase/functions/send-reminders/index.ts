// ─────────────────────────────────────────────────────────────────────────────
// send-reminders — Supabase Edge Function
//
// Runs on a schedule via pg_cron (every 30 minutes).
// Queries learning_reminders for users whose preferred_time falls within the
// current 30-minute window (accounting for their timezone), then sends a
// personalised nudge email via Resend.
//
// Required secrets (set via Supabase Dashboard → Project Settings → Edge Functions):
//   RESEND_API_KEY  — from https://resend.com/api-keys
//   APP_URL         — your production URL, e.g. https://learnchain.in
//
// Deploy:
//   supabase functions deploy send-reminders --no-verify-jwt
//
// Manual test (after deploying):
//   curl -X POST https://<project>.supabase.co/functions/v1/send-reminders \
//     -H "Authorization: Bearer <CRON_SECRET>"
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL        = Deno.env.get("APP_URL") ?? "https://learnchain.in";

Deno.serve(async (req) => {
  // Verify the request comes from our pg_cron job or a manual admin call.
  // CRON_SECRET is set via: npx supabase secrets set CRON_SECRET=<value>
  // The same value is hardcoded in migration 003 inside the cron job SQL.
  const authHeader = req.headers.get("Authorization") ?? "";
  const authToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  if (!cronSecret || authToken !== cronSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (!RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY not configured" }, 500);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Current UTC time
  const now = new Date();
  const nowUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  // Load all enabled reminders with their owner's profile
  const { data: reminders, error: remErr } = await admin
    .from("learning_reminders")
    .select(`
      id, user_id, preferred_time, timezone, frequency,
      profiles ( email, full_name, username, current_streak )
    `)
    .eq("enabled", true)
    .neq("frequency", "off");

  if (remErr) return json({ error: remErr.message }, 500);

  const sent: string[] = [];
  const skipped: string[] = [];

  for (const reminder of (reminders ?? [])) {
    const profile = (reminder.profiles as any);
    if (!profile?.email) { skipped.push(reminder.user_id); continue; }

    // Parse preferred_time ("HH:MM") in user's timezone
    const [prefH, prefM] = (reminder.preferred_time as string).split(":").map(Number);

    // Convert user's local preferred_time to UTC minutes for comparison
    // We do this by constructing a date at today's date in their timezone.
    const userLocalMidnight = new Date(
      new Intl.DateTimeFormat("en-US", { timeZone: reminder.timezone }).format(now)
        .split(",")[0] + ", 00:00:00"
    );
    const userPreferredUTC = new Date(userLocalMidnight);
    userPreferredUTC.setHours(prefH, prefM, 0, 0);

    // Adjust to UTC equivalent
    const tzOffset = userPreferredUTC.getTime() - userLocalMidnight.getTime();
    const preferredUTCMinutes = ((prefH * 60 + prefM) * 60_000 - tzOffset / 1) / 60_000;

    // Skip if current UTC time is not within ±15 min of their preferred time
    const diff = Math.abs(nowUTCMinutes - ((preferredUTCMinutes % (24 * 60) + 24 * 60) % (24 * 60)));
    if (diff > 15 && diff < (24 * 60 - 15)) { skipped.push(reminder.user_id); continue; }

    // Send via Resend
    const name = profile.full_name?.split(" ")[0] ?? profile.username ?? "there";
    const streak = profile.current_streak ?? 0;

    const emailBody = buildEmail(name, streak, APP_URL);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "LearnChain <reminders@learnchain.in>",
        to:   [profile.email],
        subject: streak > 0
          ? `🔥 Keep your ${streak}-day streak alive — time to learn!`
          : "📚 Your daily learning reminder from LearnChain",
        html: emailBody,
      }),
    });

    if (res.ok) {
      sent.push(reminder.user_id);
    } else {
      const err = await res.text();
      console.error(`Resend failed for ${reminder.user_id}:`, err);
      skipped.push(reminder.user_id);
    }
  }

  return json({ sent: sent.length, skipped: skipped.length });
});

function buildEmail(firstName: string, streak: number, appUrl: string): string {
  const streakLine = streak > 0
    ? `<p style="margin:0 0 16px">You're on a <strong style="color:#f97316">${streak}-day streak</strong> 🔥 — don't break it now.</p>`
    : `<p style="margin:0 0 16px">Start a streak today — just one module keeps the chain alive.</p>`;

  return `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:32px 0">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#1a7f4b;padding:24px 32px">
      <p style="margin:0;color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.3px">LearnChain</p>
    </div>
    <div style="padding:32px">
      <h1 style="margin:0 0 12px;font-size:22px;color:#111827">Hey ${firstName} 👋</h1>
      ${streakLine}
      <p style="margin:0 0 24px;color:#6b7280">Your study session is waiting. Pick up where you left off.</p>
      <a href="${appUrl}/dashboard" style="display:inline-block;background:#1a7f4b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px">
        Open my Dashboard →
      </a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f3f4f6">
      <p style="margin:0;font-size:11px;color:#9ca3af">
        You're receiving this because you enabled weekly reminders on LearnChain.
        <a href="${appUrl}/dashboard" style="color:#9ca3af">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
