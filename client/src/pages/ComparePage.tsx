import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { BarChart3, Check, Plus, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SEO } from "@/components/SEO";
import roadmapsData from "@/data/roadmaps.json";

const DEFAULT_IDS = ["frontend-react", "backend-nodejs", "devops-aws"];

export default function ComparePage() {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_IDS);

  const selected = useMemo(
    () => selectedIds.map((id) => roadmapsData.roadmaps.find((r) => r.id === id)).filter(Boolean),
    [selectedIds]
  );

  function toggle(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return current.length >= 3 ? [current[1], current[2], id].filter(Boolean) : [...current, id];
    });
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      <SEO
        title="Compare Roadmaps - LearnChain"
        description="Compare LearnChain roadmaps by salary, timeline, module count, category, and project depth."
        path="/compare"
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
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a7f4b] mb-2">Compare</p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">Pick the right path before you commit</h1>
              <p className="text-gray-500 mt-2 max-w-2xl">
                Compare up to three roadmaps across market, time, salary, and learning load.
              </p>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-[#1a7f4b]" />
                <h2 className="font-bold text-gray-900">Choose roadmaps</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {roadmapsData.roadmaps.map((roadmap) => {
                  const active = selectedIds.includes(roadmap.id);
                  return (
                    <button
                      key={roadmap.id}
                      onClick={() => toggle(roadmap.id)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30 ${
                        active ? "border-[#1a7f4b] bg-[#1a7f4b]/5 text-[#1a7f4b]" : "border-gray-100 text-gray-600 hover:border-gray-200"
                      }`}
                    >
                      {active ? <Check className="inline w-3.5 h-3.5 mr-1" /> : null}
                      {roadmap.title}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {selected.map((roadmap: any) => {
                const projects = roadmap.modules.reduce((sum: number, mod: any) => sum + ((mod.realWorldProjects ?? []).length), 0);
                const badges = roadmap.modules.reduce((sum: number, mod: any) => sum + ((mod.gamification?.badges ?? []).length), 0);
                return (
                  <article key={roadmap.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#1a7f4b]">{roadmap.category}</p>
                        <h2 className="text-xl font-black text-gray-900 mt-1">{roadmap.title}</h2>
                      </div>
                      <button
                        onClick={() => toggle(roadmap.id)}
                        aria-label={`Remove ${roadmap.title}`}
                        className="h-10 w-10 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-5">{roadmap.description}</p>
                    <dl className="space-y-3">
                      {[
                        ["Fresher salary", roadmap.salaryFresher ?? "N/A"],
                        ["Senior salary", roadmap.salarySenior ?? "N/A"],
                        ["Timeline", roadmap.timeline ?? "N/A"],
                        ["Modules", `${roadmap.modules.length}`],
                        ["Projects", `${projects}`],
                        ["Badges", `${badges}`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-3 py-2">
                          <dt className="text-xs text-gray-500">{label}</dt>
                          <dd className="text-sm font-bold text-gray-900 text-right">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <button
                      onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                      className="mt-5 min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a7f4b] px-4 py-2 text-sm font-bold text-white hover:bg-[#15653d]"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Open roadmap
                    </button>
                  </article>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
