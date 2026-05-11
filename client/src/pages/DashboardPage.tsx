import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Bookmark, CalendarClock, CheckCircle, Clock, Compass, RefreshCw, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { useLearningOS } from "@/hooks/useLearningOS";
import { useProfile } from "@/hooks/useProfile";
import roadmapsData from "@/data/roadmaps.json";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, openAuthModal } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const learning = useLearningOS(user?.id);
  const { profile } = useProfile(user?.id);

  const activeRoadmap = useMemo(() => {
    const id = learning.activePlan?.roadmap_id ?? learning.preferences?.preferred_stack;
    return roadmapsData.roadmaps.find((r) => r.id === id) ?? roadmapsData.roadmaps[0];
  }, [learning.activePlan?.roadmap_id, learning.preferences?.preferred_stack]);

  const nextWeek = learning.activePlan?.plan_json?.[0];
  const nextModules = nextWeek?.moduleIds
    ?.map((id) => activeRoadmap?.modules.find((m) => m.id === id))
    .filter(Boolean) ?? [];

  async function setWeeklyReminder() {
    if (!user) {
      openAuthModal();
      return;
    }
    setSavingReminder(true);
    try {
      await learning.upsertReminder({
        frequency: "weekly",
        preferred_time: "19:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        enabled: true,
      });
      toast.success("Weekly learning reminder saved");
    } catch (error: any) {
      toast.error(error.message ?? "Could not save reminder");
    } finally {
      setSavingReminder(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      <SEO
        title="Dashboard - LearnChain"
        description="Your LearnChain Learning OS dashboard with weekly plan, saved resources, progress, and reminders."
        path="/dashboard"
      />
      <Header onMenuToggle={setSidebarOpen} />
      <div className="flex min-h-screen">
        <Sidebar
          items={roadmapsData.roadmaps.map((r) => ({ id: r.id, title: r.title, role: r.company || r.title }))}
          onSelect={(id) => navigate(`/roadmap/${id}`)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 px-6 md:px-10 py-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#1a7f4b] mb-2">Learning OS</p>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  {user ? "Your weekly command center" : "Plan your developer journey"}
                </h1>
                <p className="text-gray-500 mt-2 max-w-2xl">
                  Keep your next module, saved resources, reminders, and progress in one place.
                </p>
              </div>
              <button
                onClick={() => user ? navigate("/onboarding") : openAuthModal()}
                className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a7f4b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15653d] focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
              >
                <Sparkles className="w-4 h-4" />
                {learning.preferences ? "Update plan" : "Set up plan"}
              </button>
            </div>

            {learning.error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <span className="flex-1">{learning.error}</span>
                <button onClick={learning.refresh} className="inline-flex items-center gap-1 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Compass className="w-4 h-4 text-[#1a7f4b]" />
                  <h2 className="font-bold text-gray-900">This week</h2>
                </div>
                {nextWeek ? (
                  <div className="space-y-5">
                    <div className="rounded-xl bg-[#1a7f4b]/5 border border-[#1a7f4b]/15 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#1a7f4b] mb-1">
                        {activeRoadmap?.title}
                      </p>
                      <h3 className="text-xl font-black text-gray-900">{nextWeek.focus}</h3>
                      <p className="text-sm text-gray-500 mt-2">{nextWeek.estimatedHours} planned hours</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {nextModules.map((mod) => (
                        <button
                          key={mod!.id}
                          onClick={() => navigate(`/roadmap/${activeRoadmap.id}`)}
                          className="min-h-11 rounded-xl border border-gray-100 p-4 text-left hover:border-[#1a7f4b]/30 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30"
                        >
                          <p className="font-semibold text-gray-900">{mod!.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{mod!.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No active study plan yet.</p>
                    <button onClick={() => navigate("/onboarding")} className="text-sm font-bold text-[#1a7f4b] hover:underline">
                      Create your first plan
                    </button>
                  </div>
                )}
              </section>

              <aside className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-[#1a7f4b]" />
                    <h2 className="font-bold text-gray-900">Progress</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Level</p>
                      <p className="text-2xl font-black text-gray-900">{profile?.level ?? 1}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">XP</p>
                      <p className="text-2xl font-black text-gray-900">{(profile?.xp ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarClock className="w-4 h-4 text-[#1a7f4b]" />
                    <h2 className="font-bold text-gray-900">Email Reminder</h2>
                  </div>
                  {learning.reminder ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 font-semibold">
                        ✅ {learning.reminder.frequency === "weekly" ? "Weekly" : "Daily"} at {learning.reminder.preferred_time.slice(0, 5)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Emails are sent to your account address.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">
                      Get a weekly email nudge so you never forget to learn.
                    </p>
                  )}
                  <button
                    onClick={setWeeklyReminder}
                    disabled={savingReminder}
                    className="min-h-11 w-full rounded-xl border border-[#1a7f4b]/30 px-4 py-2 text-sm font-bold text-[#1a7f4b] hover:bg-[#1a7f4b]/5 disabled:opacity-50"
                  >
                    {savingReminder ? "Saving..." : learning.reminder ? "Update reminder" : "Enable weekly reminder"}
                  </button>
                </div>
              </aside>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Bookmark className="w-4 h-4 text-[#1a7f4b]" />
                <h2 className="font-bold text-gray-900">Saved resources</h2>
              </div>
              {learning.savedResources.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-xl">
                  Saved resources from roadmap modules will appear here.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learning.savedResources.slice(0, 8).map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.resource_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-gray-100 p-4 hover:border-[#1a7f4b]/30 hover:bg-gray-50"
                    >
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{resource.resource_title}</p>
                      <p className="text-xs text-gray-500 mt-1">{resource.roadmap_id} / {resource.module_id}</p>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
