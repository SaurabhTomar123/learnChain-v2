import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  CheckCircle, Clock, BookOpen, Folder, Star, Zap, Loader2, RefreshCw, Link2, Copy, Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { getAllCareerModeOptions, CAREER_MODE_LABELS } from "@/lib/careerMode";
import roadmapsData from "@/data/roadmaps.json";
import type { Badge, CareerMode } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge as UiBadge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function PublicProfileLink({ profile, userId }: { profile: any; userId: string }) {
  const [copied, setCopied] = useState(false);
  const handle = profile?.username ?? userId;
  const url = `${window.location.origin}/u/${handle}`;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <Link2 className="w-4 h-4 text-[#1a7f4b]" />
        <span className="text-sm font-semibold text-gray-900">Your public profile</span>
      </div>
      <code className="flex-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 truncate min-w-0">
        {url}
      </code>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={copy}
          aria-label="Copy profile URL"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#1a7f4b]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <a
          href={`/u/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#1a7f4b] hover:underline"
        >
          Preview →
        </a>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile(user?.id);

  const [progress, setProgress] = useState<{ roadmap_item_id: string; completed_at: string }[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Sign in to view your profile");
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  // Fetch roadmap progress
  useEffect(() => {
    if (!user) return;
    setProgressLoading(true);
    supabase
      .from("roadmap_progress")
      .select("roadmap_item_id, completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setDataError(error.message);
        else setProgress((data as any[]) ?? []);
        setProgressLoading(false);
      });
  }, [user]);

  // Fetch project count
  useEffect(() => {
    if (!user) return;
    setProjectsLoading(true);
    supabase
      .from("user_projects")
      .select("id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setProjectCount((data as any[])?.length ?? 0);
        setProjectsLoading(false);
      });
  }, [user]);

  // Fetch earned badges
  useEffect(() => {
    if (!user) return;
    setBadgesLoading(true);
    supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setEarnedBadgeIds(new Set((data as any[])?.map((b: any) => b.badge_id) ?? []));
        setBadgesLoading(false);
      });
  }, [user]);

  // Collect all badges from roadmaps.json (deduplicated by id)
  const allBadges = useMemo(() => {
    const map = new Map<string, Badge>();
    for (const roadmap of roadmapsData.roadmaps) {
      for (const mod of roadmap.modules) {
        for (const badge of ((mod as any).gamification?.badges ?? []) as Badge[]) {
          map.set(badge.id, badge);
        }
      }
    }
    return Array.from(map.values());
  }, []);

  const totalModules = useMemo(
    () => roadmapsData.roadmaps.reduce((sum, r) => sum + r.modules.length, 0),
    []
  );

  const careerModeOptions = getAllCareerModeOptions();

  const handleCareerModeUpdate = async (newMode: CareerMode) => {
    if (!user || !profile || updatingMode || profile.career_mode === newMode) return;
    setUpdatingMode(true);
    const { error } = await supabase
      .from("profiles")
      .update({ career_mode: newMode })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to update career mode");
    } else {
      toast.success(`Switched to ${CAREER_MODE_LABELS[newMode]}`);
      await refetchProfile();
    }
    setUpdatingMode(false);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[#1a7f4b]" />
      </div>
    );
  }

  if (!user) return null;

  const xpInLevel = (profile?.xp ?? 0) % 500;
  const xpProgress = xpInLevel / 5;

  return (
    <div className="min-h-screen bg-gray-50/40">
      <Header onMenuToggle={setSidebarOpen} />
      <div className="flex min-h-screen">
        <Sidebar
          items={roadmapsData.roadmaps.map((r) => ({ id: r.id, title: r.title, role: r.company || r.title }))}
          onSelect={(id) => navigate(`/roadmap/${id}`)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 px-6 md:px-10 pt-10 pb-20">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-400 mt-1">Track your progress, badges, and career focus.</p>
            </motion.div>

            {/* Error banner */}
            {dataError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <span className="flex-1">{dataError}</span>
                <button onClick={() => window.location.reload()} className="flex items-center gap-1 font-semibold hover:underline">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {/* ── Stats Hero Card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {profileLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-5 shrink-0">
                    <Avatar className="w-16 h-16">
                      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                      <AvatarFallback className="bg-[#1a7f4b] text-white text-xl font-black w-16 h-16">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {profile?.full_name || profile?.username || displayName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <UiBadge variant="secondary" className="text-xs capitalize">
                          {profile?.career_mode
                            ? CAREER_MODE_LABELS[profile.career_mode as CareerMode]
                            : "Explorer"}
                        </UiBadge>
                        {(profile?.current_streak ?? 0) > 0 && (
                          <span className="text-xs font-semibold text-orange-600">
                            🔥 {profile?.current_streak} day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Level + XP bar */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#1a7f4b]/10 border-2 border-[#1a7f4b] flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-[#1a7f4b]">Lv.{profile?.level ?? 1}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">XP to next level</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {xpInLevel}
                            <span className="text-gray-400 font-normal"> / 500</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Best Streak</p>
                        <p className="text-sm font-semibold text-gray-900">
                          🏅 {profile?.longest_streak ?? 0} days
                        </p>
                      </div>
                    </div>
                    <Progress value={xpProgress} className="h-2.5" />
                    <p className="text-xs text-gray-400 mt-1.5 text-right">
                      {(profile?.xp ?? 0).toLocaleString()} total XP
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Public Profile Link ── */}
            <PublicProfileLink profile={profile} userId={user.id} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* ── Left column: Badges + Progress ── */}
              <div className="md:col-span-2 space-y-6">

                {/* Badges showcase */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Star className="w-4 h-4 text-[#1a7f4b]" />
                    <h3 className="font-bold text-gray-900">Badges</h3>
                    <span className="ml-auto text-xs text-gray-400">
                      {earnedBadgeIds.size} / {allBadges.length} earned
                    </span>
                  </div>
                  {badgesLoading ? (
                    <div className="flex gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="w-16 h-20 rounded-xl" />
                      ))}
                    </div>
                  ) : allBadges.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">
                      Complete roadmaps to earn badges
                    </p>
                  ) : (
                    <ScrollArea>
                      <div className="flex gap-3 pb-2">
                        {allBadges.map((badge) => {
                          const earned = earnedBadgeIds.has(badge.id);
                          if (!earned) {
                            return (
                              <Tooltip key={badge.id}>
                                <TooltipTrigger asChild>
                                  <div className="flex-shrink-0 w-16 flex flex-col items-center gap-2 p-2 rounded-xl border border-gray-100 bg-gray-50 grayscale opacity-50 cursor-help">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                                      🔒
                                    </div>
                                    <span className="text-[9px] font-semibold text-center text-gray-500 leading-tight line-clamp-2">
                                      {badge.name}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs" sideOffset={4}>
                                  <p className="font-semibold">{badge.name}</p>
                                  <p className="text-xs opacity-80 mt-0.5">{badge.criteria}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          }
                          return (
                            <div
                              key={badge.id}
                              className="flex-shrink-0 w-16 flex flex-col items-center gap-2 p-2 rounded-xl border border-[#1a7f4b]/20 bg-[#1a7f4b]/5"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#1a7f4b]/10 flex items-center justify-center text-lg">
                                🏅
                              </div>
                              <span className="text-[9px] font-semibold text-center text-gray-700 leading-tight line-clamp-2">
                                {badge.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Learning progress */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <BookOpen className="w-4 h-4 text-[#1a7f4b]" />
                    <h3 className="font-bold text-gray-900">Learning Progress</h3>
                  </div>
                  {progressLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2.5 w-full rounded-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">Roadmap items completed</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {progress.length} / {totalModules}
                        </span>
                      </div>
                      <Progress
                        value={totalModules > 0 ? (progress.length / totalModules) * 100 : 0}
                        className="mb-5"
                      />

                      <div className="flex items-center justify-between mb-5 py-3 border-t border-gray-50">
                        <span className="text-sm text-gray-600">Projects shipped</span>
                        {projectsLoading ? (
                          <Skeleton className="h-4 w-10" />
                        ) : (
                          <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-blue-500" />
                            {projectCount}
                          </span>
                        )}
                      </div>

                      {progress.length > 0 ? (
                        <>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                            Recently Completed
                          </p>
                          <ul className="space-y-2.5">
                            {progress.slice(0, 5).map((p) => (
                              <li key={p.roadmap_item_id} className="flex items-center justify-between text-sm gap-3">
                                <span className="flex items-center gap-2 text-gray-700 min-w-0">
                                  <CheckCircle className="w-3.5 h-3.5 text-[#1a7f4b] shrink-0" />
                                  <span className="truncate font-medium">{p.roadmap_item_id}</span>
                                </span>
                                <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(p.completed_at), { addSuffix: true })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-xl">
                          No roadmap items completed yet.
                          <br />
                          <button
                            onClick={() => navigate("/")}
                            className="text-[#1a7f4b] font-semibold mt-1 hover:underline"
                          >
                            Start a roadmap →
                          </button>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Right column: Career Mode Switcher ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-4 h-4 text-[#1a7f4b]" />
                  <h3 className="font-bold text-gray-900">Career Mode</h3>
                </div>
                {profileLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {careerModeOptions.map(({ mode, label, description, icon }) => {
                      const isCurrentMode = profile?.career_mode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => handleCareerModeUpdate(mode)}
                          disabled={updatingMode}
                          className={`w-full text-left p-3 rounded-xl border transition-all disabled:cursor-not-allowed ${
                            isCurrentMode
                              ? "border-[#1a7f4b] bg-[#1a7f4b]/5 ring-1 ring-[#1a7f4b]/20"
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-base leading-none">{icon}</span>
                            <span className={`text-sm font-semibold ${isCurrentMode ? "text-[#1a7f4b]" : "text-gray-800"}`}>
                              {label}
                            </span>
                            {isCurrentMode && (
                              <span className="ml-auto text-[10px] font-bold text-[#1a7f4b] bg-[#1a7f4b]/10 px-1.5 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{description}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
