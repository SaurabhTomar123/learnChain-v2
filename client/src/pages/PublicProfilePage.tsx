import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Award, BookOpen, ExternalLink, Loader2, UserCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import roadmapsData from "@/data/roadmaps.json";
import type { ProfileRow, RoadmapProgressRow, UserProjectRow } from "@/types/database";

export default function PublicProfilePage({ username }: { username: string }) {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [progress, setProgress] = useState<RoadmapProgressRow[]>([]);
  const [projects, setProjects] = useState<UserProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .or(`username.eq.${username},id.eq.${username}`)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!mounted) return;
        if (!data) {
          setProfile(null);
          setLoading(false);
          return;
        }
        setProfile(data);
        const [progressRes, projectsRes] = await Promise.all([
          supabase.from("roadmap_progress").select("*").eq("user_id", data.id).order("completed_at", { ascending: false }),
          supabase.from("user_projects").select("*").eq("user_id", data.id).order("completed_at", { ascending: false }),
        ]);
        if (!mounted) return;
        setProgress(progressRes.data ?? []);
        setProjects(projectsRes.data ?? []);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [username]);

  const displayName = profile?.full_name || profile?.username || profile?.name || "LearnChain learner";

  return (
    <div className="min-h-screen bg-gray-50/40">
      <SEO
        title={`${displayName} - LearnChain Profile`}
        description={`Public LearnChain profile for ${displayName}.`}
        path={`/u/${username}`}
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
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-[#1a7f4b]" />
              </div>
            ) : !profile ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                <UserCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">This public profile was not found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#1a7f4b] text-white flex items-center justify-center text-2xl font-black">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#1a7f4b] mb-2">Public profile</p>
                      <h1 className="text-3xl font-black text-gray-900">{displayName}</h1>
                      <p className="text-sm text-gray-500 mt-2">
                        Level {profile.level} · {profile.xp.toLocaleString()} XP · {profile.career_mode} mode
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <BookOpen className="w-5 h-5 text-[#1a7f4b] mb-3" />
                    <p className="text-3xl font-black text-gray-900">{progress.length}</p>
                    <p className="text-sm text-gray-500">Modules completed</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <ExternalLink className="w-5 h-5 text-[#1a7f4b] mb-3" />
                    <p className="text-3xl font-black text-gray-900">{projects.length}</p>
                    <p className="text-sm text-gray-500">Projects shipped</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <Award className="w-5 h-5 text-[#1a7f4b] mb-3" />
                    <p className="text-3xl font-black text-gray-900">{profile.longest_streak}</p>
                    <p className="text-sm text-gray-500">Best streak</p>
                  </div>
                </div>

                <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-4">Recent completions</h2>
                  {progress.length === 0 ? (
                    <p className="text-sm text-gray-500">No public learning progress yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {progress.slice(0, 8).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
                          <span className="text-sm font-medium text-gray-700">{item.roadmap_item_id}</span>
                          <span className="text-xs text-gray-500">{new Date(item.completed_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
