import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, RefreshCw, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import roadmapsData from "@/data/roadmaps.json";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface LeaderboardEntry {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
}

const WEEKLY_QUESTS = [
  {
    id: "consistency",
    title: "7-Day Consistency",
    description: "Complete at least 1 roadmap item every day for 7 days",
    icon: "🔥",
    target: 7,
  },
  {
    id: "react-explorer",
    title: "React Explorer",
    description: "Complete 5 React-related roadmap items",
    icon: "⚛️",
    target: 5,
  },
  {
    id: "system-design",
    title: "System Design Warrior",
    description: "Complete 3 system design roadmap items",
    icon: "🏗️",
    target: 3,
  },
  {
    id: "century",
    title: "100 Problems Solved",
    description: "Complete 100 roadmap items in total",
    icon: "💯",
    target: 100,
  },
];

function getRankEmoji(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function getRankRowClass(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) return "bg-[#1a7f4b]/5 border-[#1a7f4b]/20";
  if (rank === 1) return "bg-amber-50 border-amber-100";
  if (rank === 2) return "bg-gray-50 border-gray-100";
  if (rank === 3) return "bg-orange-50 border-orange-100";
  return "bg-white border-gray-100";
}

function getAvatarRingClass(rank: number) {
  if (rank === 1) return "ring-2 ring-amber-400";
  if (rank === 2) return "ring-2 ring-gray-400";
  if (rank === 3) return "ring-2 ring-orange-400";
  return "";
}

function getDisplayName(entry: LeaderboardEntry) {
  return entry.full_name || entry.username || "Anonymous";
}

function getInitials(entry: LeaderboardEntry) {
  return getDisplayName(entry).slice(0, 2).toUpperCase();
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("all-time");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User's stats for weekly quest progress
  const [userStreak, setUserStreak] = useState(0);
  const [userCompletedCount, setUserCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserStreak((data as any).current_streak ?? 0);
      });
    supabase
      .from("roadmap_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setUserCompletedCount(count ?? 0));
  }, [user]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (tab === "all-time") {
        const { data, error: err } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, xp, level, current_streak")
          .order("xp", { ascending: false })
          .limit(100);
        if (err) throw err;
        setEntries((data as LeaderboardEntry[]) ?? []);
      } else {
        // Time-filtered: aggregate xp_earned from roadmap_progress
        const now = new Date();
        let periodStart: Date;
        if (tab === "this-month") {
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        } else {
          // this-week: Monday
          const day = now.getDay();
          const diff = day === 0 ? -6 : 1 - day;
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() + diff);
          periodStart.setHours(0, 0, 0, 0);
        }

        const { data: progressData, error: progressErr } = await supabase
          .from("roadmap_progress")
          .select("user_id, xp_earned")
          .gte("completed_at", periodStart.toISOString());
        if (progressErr) throw progressErr;

        // Aggregate XP per user
        const xpByUser = new Map<string, number>();
        for (const row of (progressData as any[]) ?? []) {
          xpByUser.set(row.user_id, (xpByUser.get(row.user_id) ?? 0) + (row.xp_earned ?? 0));
        }

        if (xpByUser.size === 0) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const userIds = Array.from(xpByUser.keys());
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, xp, level, current_streak")
          .in("id", userIds);
        if (profileErr) throw profileErr;

        const merged = ((profiles as LeaderboardEntry[]) ?? [])
          .map((p) => ({ ...p, xp: xpByUser.get(p.id) ?? 0 }))
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 100);
        setEntries(merged);
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to load leaderboard");
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const questProgress = (questId: string): number => {
    switch (questId) {
      case "consistency": return userStreak;
      case "century": return userCompletedCount;
      default: return 0;
    }
  };

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
          <div className="max-w-4xl mx-auto space-y-10">

            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-sm text-gray-400 mt-0.5">Top learners ranked by XP earned</p>
              </div>
            </motion.div>

            {/* ── XP Leaderboard with tabs ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Tabs value={tab} onValueChange={setTab}>
                <div className="border-b border-gray-100 px-6 pt-4">
                  <TabsList className="bg-transparent p-0 h-auto gap-0 rounded-none">
                    {[
                      { value: "all-time", label: "All Time" },
                      { value: "this-month", label: "This Month" },
                      { value: "this-week", label: "This Week" },
                    ].map(({ value, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a7f4b] data-[state=active]:text-[#1a7f4b] data-[state=active]:bg-transparent px-4 py-2.5 text-sm font-medium"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {["all-time", "this-month", "this-week"].map((tabValue) => (
                  <TabsContent key={tabValue} value={tabValue} className="mt-0">
                    {loading ? (
                      <div className="p-6 space-y-3">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="w-8 h-4 rounded" />
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="h-4 w-40 rounded" />
                            <Skeleton className="h-4 w-20 rounded ml-auto" />
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-red-500 mb-3">{error}</p>
                        <button
                          onClick={fetchEntries}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mx-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Try again
                        </button>
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="p-12 text-center">
                        <Trophy className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">
                          {tabValue === "all-time"
                            ? "No learners yet."
                            : "No activity this period — start a roadmap!"}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {entries.map((entry, i) => {
                          const rank = i + 1;
                          const isCurrentUser = user?.id === entry.id;
                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: i * 0.03 }}
                              className={`flex items-center gap-4 px-6 py-4 border-l-2 ${getRankRowClass(rank, isCurrentUser)} ${isCurrentUser ? "border-l-[#1a7f4b]" : "border-l-transparent"}`}
                            >
                              {/* Rank */}
                              <span className={`text-sm font-bold w-8 shrink-0 text-center ${rank <= 3 ? "text-lg" : "text-gray-400"}`}>
                                {getRankEmoji(rank)}
                              </span>

                              {/* Avatar */}
                              <Avatar className={`w-9 h-9 shrink-0 ${getAvatarRingClass(rank)}`}>
                                {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
                                <AvatarFallback className="bg-[#1a7f4b] text-white text-xs font-black">
                                  {getInitials(entry)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Name */}
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={() => navigate(`/u/${entry.username ?? entry.id}`)}
                                  className={`text-sm font-semibold truncate max-w-full block text-left hover:underline underline-offset-2 ${isCurrentUser ? "text-[#1a7f4b]" : "text-gray-900 hover:text-[#1a7f4b]"}`}
                                >
                                  {getDisplayName(entry)}
                                  {isCurrentUser && <span className="ml-1.5 text-[10px] font-bold bg-[#1a7f4b]/10 text-[#1a7f4b] px-1.5 rounded-full">You</span>}
                                </button>
                                <p className="text-xs text-gray-400">Level {entry.level}</p>
                              </div>

                              {/* Streak */}
                              {entry.current_streak > 0 && (
                                <span className="hidden sm:flex items-center gap-1 text-xs text-orange-500 font-semibold shrink-0">
                                  <Flame className="w-3.5 h-3.5" />
                                  {entry.current_streak}
                                </span>
                              )}

                              {/* XP */}
                              <span className="text-sm font-bold text-gray-900 shrink-0 tabular-nums">
                                {entry.xp.toLocaleString()} XP
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ── Weekly Quests (Coming Soon) ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Weekly Quests</h2>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WEEKLY_QUESTS.map((quest) => {
                  const current = questProgress(quest.id);
                  const pct = Math.min((current / quest.target) * 100, 100);
                  return (
                    <div key={quest.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{quest.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{quest.title}</p>
                          <p className="text-xs text-gray-500">{quest.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Progress value={pct} className="flex-1 h-1.5" />
                        <span className="text-xs text-gray-500 font-semibold shrink-0 tabular-nums">
                          {Math.min(current, quest.target)}/{quest.target}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Quest tracking and rewards are in development. Progress shown is live where available.
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
