// ─────────────────────────────────────────────────────────────────────────────
// handle-progress — Supabase Edge Function
//
// Triggered when a new roadmap_progress row is inserted (via Supabase
// Database Webhook or called directly from the frontend after inserting).
//
// Responsibilities:
//   1. Award XP (with streak multiplier) via update_streak_and_xp RPC
//   2. Check for level-up and surface it to the caller
//   3. Evaluate badge criteria and award any newly earned badges
//
// Deploy: supabase functions deploy handle-progress
//
// Frontend call:
//   const { data } = await supabase.functions.invoke('handle-progress', {
//     body: {
//       roadmap_item_id: 'react-basics',
//       xp_earned: 500,
//       streak_mult: true,
//     }
//   })
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Badge definitions ─────────────────────────────────────────────────────────
//
// Each badge has an `evaluate` function that receives the current profile
// state (post-XP-update) and the full list of already-completed module IDs.
// Returns true if the badge should be awarded.
//
// Add new badges here without touching any other code.

interface BadgeCriteria {
  id: string;
  name: string;
  evaluate: (args: {
    completedCount: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    completedItemIds: string[];
  }) => boolean;
}

const BADGE_DEFINITIONS: BadgeCriteria[] = [
  {
    id: "first-step",
    name: "First Step",
    evaluate: ({ completedCount }) => completedCount === 1,
  },
  {
    id: "five-modules",
    name: "Five Down",
    evaluate: ({ completedCount }) => completedCount >= 5,
  },
  {
    id: "ten-modules",
    name: "Decade Learner",
    evaluate: ({ completedCount }) => completedCount >= 10,
  },
  {
    id: "streak-3",
    name: "Hat Trick",
    evaluate: ({ currentStreak }) => currentStreak >= 3,
  },
  {
    id: "streak-7",
    name: "7-Day Consistency",
    evaluate: ({ currentStreak }) => currentStreak >= 7,
  },
  {
    id: "streak-30",
    name: "Iron Discipline",
    evaluate: ({ currentStreak }) => currentStreak >= 30,
  },
  {
    id: "level-5",
    name: "Rising Engineer",
    evaluate: ({ level }) => level >= 5,
  },
  {
    id: "level-10",
    name: "Senior Learner",
    evaluate: ({ level }) => level >= 10,
  },
  {
    id: "react-explorer",
    name: "React Explorer",
    evaluate: ({ completedItemIds }) =>
      completedItemIds.includes("react-basics"),
  },
  {
    id: "fullstack-builder",
    name: "Full-Stack Builder",
    evaluate: ({ completedItemIds }) =>
      completedItemIds.includes("react-basics") &&
      completedItemIds.includes("nextjs-fundamentals"),
  },
  {
    id: "hook-master",
    name: "Hook Master",
    // Awarded separately via the quiz-pass endpoint — skipped here
    evaluate: () => false,
  },
];

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  // Parse and validate the JWT so we know which user is calling
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Use the secret key (service role) for writes that bypass RLS (badge inserts, etc.)
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return json({ error: "Unauthenticated" }, 401);
  }

  // ── Parse request body ──────────────────────────────────────────────────────
  let body: {
    roadmap_item_id: string;
    xp_earned: number;
    streak_mult: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { roadmap_item_id, xp_earned, streak_mult } = body;

  if (!roadmap_item_id || typeof xp_earned !== "number") {
    return json({ error: "roadmap_item_id and xp_earned are required" }, 400);
  }

  // ── Step 1: Insert the roadmap_progress row ─────────────────────────────────
  //
  // The ON CONFLICT DO NOTHING means re-completing an item is a no-op for
  // the progress table, but we still proceed to check XP / badges in case
  // this is the first call after a partial failure.

  const { error: progressErr } = await adminClient
    .from("roadmap_progress")
    .insert({ user_id: user.id, roadmap_item_id, xp_earned })
    .select()
    .maybeSingle();

  // Unique constraint violation = already completed; treat as success
  if (progressErr && progressErr.code !== "23505") {
    return json({ error: `Progress insert failed: ${progressErr.message}` }, 500);
  }

  // ── Step 2: Update XP, streak, and level via the database RPC ──────────────

  const { data: xpResult, error: xpErr } = await adminClient.rpc(
    "update_streak_and_xp",
    {
      p_user_id:          user.id,
      p_xp_earned:        xp_earned,
      p_streak_mult_item: streak_mult,
    }
  );

  if (xpErr || !xpResult) {
    return json({ error: `XP update failed: ${xpErr?.message}` }, 500);
  }

  // ── Step 3: Evaluate badge criteria ────────────────────────────────────────

  // Load all completed module IDs for this user
  const { data: progressRows } = await adminClient
    .from("roadmap_progress")
    .select("roadmap_item_id")
    .eq("user_id", user.id);

  const completedItemIds =
    (progressRows ?? []).map((r: { roadmap_item_id: string }) => r.roadmap_item_id);

  // Load already-earned badge IDs (so we don't re-award)
  const { data: earnedBadges } = await adminClient
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  const alreadyEarned = new Set(
    (earnedBadges ?? []).map((b: { badge_id: string }) => b.badge_id)
  );

  // Evaluate each badge
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (alreadyEarned.has(badge.id)) continue;

    const earned = badge.evaluate({
      completedCount: completedItemIds.length,
      currentStreak:  xpResult.current_streak,
      longestStreak:  xpResult.longest_streak,
      level:          xpResult.new_level,
      completedItemIds,
    });

    if (earned) {
      const { error: badgeErr } = await adminClient
        .from("user_badges")
        .insert({ user_id: user.id, badge_id: badge.id });

      if (!badgeErr) {
        newBadges.push(badge.id);
      }
    }
  }

  // ── Step 4: Return the summary to the frontend ──────────────────────────────

  return json({
    success: true,
    xp: {
      earned:         xpResult.xp_earned,
      total:          xpResult.new_xp,
      level:          xpResult.new_level,
      leveled_up:     xpResult.leveled_up,
    },
    streak: {
      current: xpResult.current_streak,
      longest: xpResult.longest_streak,
    },
    new_badges: newBadges,
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
