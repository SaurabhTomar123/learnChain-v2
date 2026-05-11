import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, ChevronRight, Clock, Target } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { useLearningOS } from "@/hooks/useLearningOS";
import roadmapsData from "@/data/roadmaps.json";
import { toast } from "sonner";

const GOALS = [
  ["get_first_job", "Get my first developer job"],
  ["switch_career", "Switch into tech"],
  ["upskill", "Upskill for promotion"],
  ["target_company", "Prepare for a target company"],
];

const EXPERIENCE = [
  ["beginner", "Beginner"],
  ["student", "Student"],
  ["junior", "Junior engineer"],
  ["mid", "Mid-level engineer"],
];

const COMPANY_TYPES = [
  ["product", "Product company"],
  ["service", "Service company"],
  ["startup", "Startup"],
  ["faang", "FAANG / Tier-1"],
  ["freelance", "Freelance"],
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function OnboardingPage() {
  const { user, openAuthModal } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { upsertPreferences, createStudyPlan } = useLearningOS(user?.id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    goal: "get_first_job",
    experience_level: "beginner",
    weekly_hours: 6,
    preferred_stack: "frontend-react",
    target_company_type: "product",
    start_date: todayISO(),
  });

  const selectedRoadmap = roadmapsData.roadmaps.find((r) => r.id === form.preferred_stack) ?? roadmapsData.roadmaps[0];

  async function submit() {
    if (!user) {
      openAuthModal();
      return;
    }
    setSaving(true);
    try {
      await upsertPreferences({ ...form, user_id: user.id });
      await createStudyPlan(selectedRoadmap as any, form.weekly_hours, form.start_date);
      toast.success("Your Learning OS is ready");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message ?? "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      <SEO
        title="Set Up Your Learning OS - LearnChain"
        description="Personalize LearnChain with your goal, weekly study time, preferred stack, and target company type."
        path="/onboarding"
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
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a7f4b] mb-2">Learning OS</p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">Build your weekly learning plan</h1>
              <p className="text-gray-500 mt-3 max-w-2xl">
                Tell LearnChain where you are headed and how much time you can invest. We will turn a roadmap into a weekly plan you can actually follow.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-[#1a7f4b]" />
                  <h2 className="font-bold text-gray-900">Goal</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setForm((f) => ({ ...f, goal: value }))}
                      className={`min-h-11 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40 ${
                        form.goal === value ? "border-[#1a7f4b] bg-[#1a7f4b]/5 text-[#1a7f4b]" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Experience</label>
                  <select
                    value={form.experience_level}
                    onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#1a7f4b] focus:outline-none focus:ring-2 focus:ring-[#1a7f4b]/20"
                  >
                    {EXPERIENCE.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Target company type</label>
                  <select
                    value={form.target_company_type}
                    onChange={(e) => setForm((f) => ({ ...f, target_company_type: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#1a7f4b] focus:outline-none focus:ring-2 focus:ring-[#1a7f4b]/20"
                  >
                    {COMPANY_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Starting roadmap</label>
                  <select
                    value={form.preferred_stack}
                    onChange={(e) => setForm((f) => ({ ...f, preferred_stack: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#1a7f4b] focus:outline-none focus:ring-2 focus:ring-[#1a7f4b]/20"
                  >
                    {roadmapsData.roadmaps.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Weekly hours</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={form.weekly_hours}
                      onChange={(e) => setForm((f) => ({ ...f, weekly_hours: Number(e.target.value) }))}
                      className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-3 text-sm focus:border-[#1a7f4b] focus:outline-none focus:ring-2 focus:ring-[#1a7f4b]/20"
                    />
                  </div>
                </div>
              </section>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Start date</label>
                <div className="relative max-w-xs">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-3 text-sm focus:border-[#1a7f4b] focus:outline-none focus:ring-2 focus:ring-[#1a7f4b]/20"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                  Plan preview: <span className="font-semibold text-gray-900">{selectedRoadmap?.title}</span> at {form.weekly_hours}h/week.
                </p>
                <button
                  onClick={submit}
                  disabled={saving}
                  className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a7f4b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15653d] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
                >
                  {saving ? "Saving..." : user ? "Create my plan" : "Sign in to continue"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
