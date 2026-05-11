import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  LearningReminderRow,
  RoadmapV2,
  SavedResourceRow,
  StudyPlanRow,
  StudyPlanWeek,
  UserLearningPreferencesRow,
} from "@/types/database";

export type LearningPreferencesInput = Omit<
  UserLearningPreferencesRow,
  "created_at" | "updated_at"
>;

export type SaveResourceInput = Omit<
  SavedResourceRow,
  "id" | "created_at" | "user_id"
>;

export type ReminderInput = Omit<
  LearningReminderRow,
  "id" | "user_id" | "created_at" | "updated_at"
>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function buildStudyPlan(
  roadmap: RoadmapV2,
  weeklyHours: number,
  startDate = todayISO()
): StudyPlanWeek[] {
  const hours = Math.max(1, Math.min(80, weeklyHours || 6));
  const modules = roadmap.modules ?? [];
  const weeks: StudyPlanWeek[] = [];
  let week = 1;
  let current: StudyPlanWeek = {
    week,
    title: `Week ${week}: ${roadmap.title}`,
    moduleIds: [],
    focus: "",
    estimatedHours: 0,
  };

  for (const mod of modules) {
    const effortMatch = mod.effort?.match(/(\d+)\s*hours?/i);
    const estimated = effortMatch ? Number(effortMatch[1]) : Math.max(2, Math.round(hours / 2));

    if (current.moduleIds.length > 0 && current.estimatedHours + estimated > hours) {
      current.focus = current.moduleIds
        .map((id) => modules.find((m) => m.id === id)?.title)
        .filter(Boolean)
        .join(", ");
      weeks.push(current);
      week += 1;
      current = {
        week,
        title: `Week ${week}: ${mod.title}`,
        moduleIds: [],
        focus: "",
        estimatedHours: 0,
      };
    }

    current.moduleIds.push(mod.id);
    current.estimatedHours += estimated;
  }

  if (current.moduleIds.length > 0) {
    current.focus = current.moduleIds
      .map((id) => modules.find((m) => m.id === id)?.title)
      .filter(Boolean)
      .join(", ");
    weeks.push(current);
  }

  return weeks.map((item, idx) => ({
    ...item,
    week: idx + 1,
    title: `Week ${idx + 1}`,
    focus: item.focus || "Start with the next roadmap milestone",
    estimatedHours: Math.max(1, item.estimatedHours),
  }));
}

export function useLearningOS(userId?: string) {
  const [preferences, setPreferences] = useState<UserLearningPreferencesRow | null>(null);
  const [savedResources, setSavedResources] = useState<SavedResourceRow[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlanRow | null>(null);
  const [reminder, setReminder] = useState<LearningReminderRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPreferences(null);
      setSavedResources([]);
      setActivePlan(null);
      setReminder(null);
      return;
    }

    setLoading(true);
    setError(null);

    const [prefRes, savedRes, planRes, reminderRes] = await Promise.all([
      supabase.from("user_learning_preferences").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("saved_resources").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("learning_reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const firstError = prefRes.error ?? savedRes.error ?? planRes.error ?? reminderRes.error;
    if (firstError) setError(firstError.message);

    setPreferences(prefRes.data ?? null);
    setSavedResources(savedRes.data ?? []);
    setActivePlan((planRes.data as StudyPlanRow | null) ?? null);
    setReminder(reminderRes.data ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsertPreferences = useCallback(
    async (input: LearningPreferencesInput) => {
      const { error: err } = await supabase
        .from("user_learning_preferences")
        .upsert(input, { onConflict: "user_id" });
      if (err) throw err;
      await refresh();
    },
    [refresh]
  );

  const saveResource = useCallback(
    async (input: SaveResourceInput) => {
      if (!userId) throw new Error("Sign in to save resources");
      const { error: err } = await supabase
        .from("saved_resources")
        .upsert({ ...input, user_id: userId }, { onConflict: "user_id,resource_url" });
      if (err) throw err;
      await refresh();
    },
    [refresh, userId]
  );

  const removeSavedResource = useCallback(
    async (resourceUrl: string) => {
      if (!userId) throw new Error("Sign in to manage saved resources");
      const { error: err } = await supabase
        .from("saved_resources")
        .delete()
        .eq("user_id", userId)
        .eq("resource_url", resourceUrl);
      if (err) throw err;
      await refresh();
    },
    [refresh, userId]
  );

  const createStudyPlan = useCallback(
    async (roadmap: RoadmapV2, weeklyHours: number, startDate = todayISO()) => {
      if (!userId) throw new Error("Sign in to create a study plan");
      const plan = buildStudyPlan(roadmap, weeklyHours, startDate);
      await supabase.from("study_plans").update({ active: false }).eq("user_id", userId).eq("active", true);
      const { error: err } = await supabase.from("study_plans").insert({
        user_id: userId,
        roadmap_id: roadmap.id,
        weekly_hours: weeklyHours,
        start_date: startDate,
        plan_json: plan,
        active: true,
      });
      if (err) throw err;
      await refresh();
      return plan;
    },
    [refresh, userId]
  );

  const upsertReminder = useCallback(
    async (input: ReminderInput) => {
      if (!userId) throw new Error("Sign in to set reminders");
      const { error: err } = await supabase.from("learning_reminders").insert({
        ...input,
        user_id: userId,
      });
      if (err) throw err;
      await refresh();
    },
    [refresh, userId]
  );

  const savedUrlSet = useMemo(
    () => new Set(savedResources.map((resource) => resource.resource_url)),
    [savedResources]
  );

  return {
    preferences,
    savedResources,
    savedUrlSet,
    activePlan,
    reminder,
    loading,
    error,
    refresh,
    upsertPreferences,
    saveResource,
    removeSavedResource,
    createStudyPlan,
    upsertReminder,
  };
}
