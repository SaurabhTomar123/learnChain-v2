import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { RoadmapModule } from "@/components/RoadmapModule";
import { RoadmapChart } from "@/components/RoadmapChart";
import { RoadmapIntro } from "@/components/RoadmapIntro";
import { SEO } from "@/components/SEO";
import roadmapsData from "@/data/roadmaps.json";
import { AlertCircle, MessageSquare, Info, ChevronRight, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface DBComment {
  id: string;
  user_id: string;
  content: string;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  profiles: { name: string; email: string } | null;
  userVote: 1 | -1 | null;
}

interface RoadmapPageProps {
  roadmapId: string;
}

/* Palette matching RoadmapModule — used for the quick-nav strip */
const NAV_PALETTE = [
  "#3b82f6", "#f97316", "#8b5cf6",
  "#14b8a6", "#ec4899", "#f59e0b",
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Service-Based":  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  "Product-Based":  { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  "Specialized":    { bg: "bg-green-50",  text: "text-[#1a7f4b]",  dot: "bg-[#1a7f4b]" },
};

export function RoadmapPage({ roadmapId }: RoadmapPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [comments, setComments] = useState<DBComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [, navigate] = useLocation();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    const found = roadmapsData.roadmaps.find((r) => r.id === roadmapId);
    setRoadmap(found ?? null);
    setActiveStep(0);
    window.scrollTo(0, 0);
  }, [roadmapId]);

  /* ── Fetch comments from Supabase ── */
  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("id, user_id, content, upvote_count, downvote_count, created_at, profiles(name, email)")
      .eq("roadmap_id", roadmapId)
      .order("created_at", { ascending: false });

    if (error || !data) { setCommentsLoading(false); return; }

    let enriched: DBComment[] = (data as any[]).map((c) => ({ ...c, userVote: null }));

    if (user && enriched.length > 0) {
      const ids = enriched.map((c) => c.id);
      const { data: voteData } = await supabase
        .from("votes")
        .select("comment_id, value")
        .eq("user_id", user.id)
        .in("comment_id", ids);
      if (voteData) {
        const voteMap: Record<string, 1 | -1> = Object.fromEntries(
          (voteData as any[]).map((v) => [v.comment_id, v.value])
        );
        enriched = enriched.map((c) => ({ ...c, userVote: voteMap[c.id] ?? null }));
      }
    }
    setComments(enriched);
    setCommentsLoading(false);
  }, [roadmapId, user]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  /* ── Post a comment ── */
  const postComment = async () => {
    if (!user) { openAuthModal(); return; }
    if (!newComment.trim() || newComment.length > 400 || posting) return;
    setPosting(true);
    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      roadmap_id: roadmapId,
      content: newComment.trim(),
    });
    if (!error) { setNewComment(""); await fetchComments(); }
    setPosting(false);
  };

  /* ── Vote on a comment ── */
  const handleVote = async (commentId: string, value: 1 | -1) => {
    if (!user) { openAuthModal(); return; }
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    if (comment.userVote === value) {
      await supabase.from("votes").delete()
        .eq("user_id", user.id).eq("comment_id", commentId);
    } else if (comment.userVote !== null) {
      await supabase.from("votes").update({ value })
        .eq("user_id", user.id).eq("comment_id", commentId);
    } else {
      await supabase.from("votes").insert({ user_id: user.id, comment_id: commentId, value });
    }
    await fetchComments();
  };

  /* Track active step on scroll */
  useEffect(() => {
    if (!roadmap) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.findIndex((r) => r === entry.target);
            if (idx !== -1) setActiveStep(idx);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [roadmap]);

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1a7f4b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading roadmap…</p>
        </div>
      </div>
    );
  }

  /* ── SEO ── */
  const topicKeywords = roadmap.modules
    .flatMap((m: any) => m.topics as string[])
    .slice(0, 10)
    .join(", ");

  const pageUrl = `https://learnchain.in/roadmap/${roadmapId}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": pageUrl,
    "name": roadmap.title,
    "description": roadmap.description,
    "url": pageUrl,
    "learningResourceType": "Career Roadmap",
    "educationalLevel": "Beginner to Advanced",
    "inLanguage": "en-IN",
    "teaches": roadmap.modules.flatMap((m: any) => m.topics as string[]).slice(0, 15),
    "timeRequired": roadmap.timeline ? `PT${roadmap.timeline.replace(/\s+/g, "")}` : undefined,
    "provider": { "@type": "Organization", "name": "LearnChain", "url": "https://learnchain.in" },
    "hasPart": roadmap.modules.map((m: any, idx: number) => ({
      "@type": "LearningResource",
      "position": idx + 1,
      "name": m.title,
      "description": m.description,
      "teaches": m.topics,
      "timeRequired": m.duration,
    })),
  };

  const catStyle = CATEGORY_STYLES[roadmap.category] ?? CATEGORY_STYLES["Specialized"];

  return (
    <div className="min-h-screen bg-gray-50/40">
      <SEO
        title={`${roadmap.title} — LearnChain`}
        description={`${roadmap.description} Includes salary data (${roadmap.salaryFresher} fresher, ${roadmap.salarySenior} senior), curated resources, and step-by-step learning modules.`}
        keywords={`${roadmap.title.toLowerCase()}, ${roadmap.category.toLowerCase()} engineer, ${topicKeywords}, developer roadmap india`}
        path={`/roadmap/${roadmapId}`}
        jsonLd={jsonLd}
      />

      <Header onMenuToggle={setSidebarOpen} />

      <div className="flex min-h-screen">
        <Sidebar
          items={roadmapsData.roadmaps.map((r) => ({
            id: r.id,
            title: r.title,
            role: r.company || r.title,
          }))}
          activeId={roadmapId}
          onSelect={(id) => navigate(`/roadmap/${id}`)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">
          {/* ── Hero banner ── */}
          <div className="bg-white border-b border-gray-100 px-6 md:px-10 pt-10 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl"
            >
              {/* Category badge */}
              <div className="mb-5">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${catStyle.bg} ${catStyle.text}`}
                  style={{ borderColor: "transparent" }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                  {roadmap.category} Track
                </span>
              </div>

              <h1 className="heading-editorial text-3xl md:text-5xl text-gray-900 mb-5 leading-[1.05]">
                {roadmap.title}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl leading-relaxed">
                {roadmap.description}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Fresher Entry", value: roadmap.salaryFresher, color: "#1a7f4b" },
                  { label: "Senior Roles",  value: roadmap.salarySenior,  color: "#3b82f6" },
                  { label: "Mastery",       value: roadmap.timeline,      color: "#8b5cf6" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                    <p className="font-black text-sm" style={{ color }}>{value ?? "N/A"}</p>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Modules</p>
                  <p className="font-black text-sm text-gray-700">{roadmap.modules.length} Steps</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-4">
                <Info className="w-3 h-3" />
                Salary ranges vary by city, company tier, and experience. Sources: Glassdoor, Levels.fyi, LinkedIn.
              </p>
            </motion.div>
          </div>

          <div className="px-6 md:px-10 py-10">
            <div className="max-w-4xl space-y-16">

              {/* ── Risk & Tradeoffs ── */}
              {roadmap.riskTradeoff && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl"
                >
                  <div className="p-2 bg-amber-100 rounded-xl shrink-0 h-fit">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1.5">
                      Risk &amp; Tradeoffs
                    </p>
                    <p className="text-sm text-amber-900/80 leading-relaxed">{roadmap.riskTradeoff}</p>
                  </div>
                </motion.div>
              )}

              {/* ── Colorful salary chart ── */}
              {roadmap.graphData?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-teal-400 via-blue-500 to-orange-400" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                      Financial Progression
                    </h2>
                  </div>
                  <RoadmapChart data={roadmap.graphData} title={roadmap.title} />
                </motion.section>
              )}

              {/* ── Path Overview + optional video ── */}
              <RoadmapIntro roadmapId={roadmapId} />

              {/* ── Learning Journey ── */}
              <section>
                {/* Section header */}
                <div className="flex flex-col gap-1 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 via-violet-500 to-pink-500" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">The Journey</h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-3 pl-3">
                    {roadmap.modules.length} steps · resources at every stage · click{" "}
                    <span className="inline-flex items-center gap-0.5 text-blue-500 font-semibold">
                      <Info className="w-3 h-3" />ⓘ
                    </span>{" "}
                    for subtopics + free/paid guides
                  </p>
                </div>

                {/* ── Quick-nav strip ── */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-2 -mx-1 px-1">
                  {roadmap.modules.map((module: any, idx: number) => {
                    const color = NAV_PALETTE[idx % NAV_PALETTE.length];
                    const isActive = activeStep === idx;
                    return (
                      <motion.button
                        key={module.id}
                        onClick={() =>
                          stepRefs.current[idx]?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          })
                        }
                        animate={{ opacity: isActive ? 1 : 0.6, scale: isActive ? 1 : 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border transition-shadow shrink-0"
                        style={{
                          borderColor: isActive ? color : "#e5e7eb",
                          boxShadow: isActive ? `0 0 0 2px ${color}30, 0 2px 8px -2px ${color}30` : "none",
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded-md text-[10px] font-black text-white flex items-center justify-center shrink-0"
                          style={{ background: color }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-600 max-w-[90px] truncate leading-tight">
                          {module.title}
                        </span>
                        {isActive && <ChevronRight className="w-3 h-3 shrink-0" style={{ color }} />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* ── Step cards ── */}
                <div>
                  {roadmap.modules.map((module: any, idx: number) => (
                    <div
                      key={module.id}
                      ref={(el) => { stepRefs.current[idx] = el; }}
                      id={`step-${idx}`}
                    >
                      <RoadmapModule
                        id={module.id}
                        title={module.title}
                        description={module.description ?? ""}
                        duration={module.duration}
                        topics={module.topics}
                        index={idx}
                        recommendedMaterials={module.recommendedMaterials}
                        subtopics={module.subtopics}
                        effort={module.effort}
                        insight={module.insight}
                        howToCover={module.howToCover}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Industry Perspectives ── */}
              {roadmap.communityInsights?.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="py-12 px-8 bg-gray-900 text-white rounded-3xl relative overflow-hidden"
                >
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                      Industry Perspectives
                    </h2>
                  </div>
                  <p className="text-gray-500 text-[11px] mb-8 relative z-10">
                    Curated from public industry reports and developer surveys. Not individual user submissions.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {roadmap.communityInsights.map((insight: string, idx: number) => {
                      const parts = insight.split(" - ");
                      const source = parts.length > 1 ? parts[0] : null;
                      const text = parts.length > 1 ? parts.slice(1).join(" - ") : insight;
                      const accentColors = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f97316"];
                      const accent = accentColors[idx % accentColors.length];
                      return (
                        <div key={idx} className="group">
                          <div
                            className="w-4 h-0.5 rounded-full mb-3 transition-all group-hover:w-8"
                            style={{ background: accent }}
                          />
                          <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                            {text}
                          </p>
                          {source && (
                            <p className="mt-3 text-[10px] font-black tracking-widest uppercase" style={{ color: accent }}>
                              — {source}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* ── Community Log ── */}
              <section className="pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Community Log</h2>
                </div>
                <p className="text-sm text-gray-400 mb-8 max-w-lg">
                  Share real questions or experiences about this path. 3–4 sentences max.
                  No promotional content or fake stories.
                </p>

                {/* Comment form */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      user
                        ? "Share a real question or experience about this roadmap…"
                        : "Sign in to post a comment…"
                    }
                    className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none transition-all resize-none"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className={`text-[11px] tabular-nums ${newComment.length > 360 ? "text-red-400" : "text-gray-400"}`}>
                      {user ? `${newComment.length}/400` : ""}
                    </span>
                    <motion.button
                      onClick={postComment}
                      disabled={posting || (!!user && (!newComment.trim() || newComment.length > 400))}
                      whileTap={{ scale: 0.97 }}
                      className="bg-[#1a7f4b] text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#15653d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {posting && <Loader2 className="w-3 h-3 animate-spin" />}
                      {user ? "Post" : "Sign in to comment"}
                    </motion.button>
                  </div>
                </div>

                {/* Comments list */}
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-white">
                        <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No comments yet — be the first to share your experience.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => {
                          const name = comment.profiles?.name || comment.profiles?.email?.split("@")[0] || "User";
                          const initial = name[0]?.toUpperCase() ?? "U";
                          const net = comment.upvote_count - comment.downvote_count;
                          return (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm"
                            >
                              <div className="w-9 h-9 rounded-xl bg-[#1a7f4b] flex items-center justify-center font-black text-white text-sm shrink-0">
                                {initial}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 mb-1">{name}</p>
                                <p className="text-sm text-gray-500 leading-relaxed">{comment.content}</p>
                                {/* Vote row */}
                                <div className="flex items-center gap-3 mt-3">
                                  <button
                                    onClick={() => handleVote(comment.id, 1)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                      comment.userVote === 1
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600"
                                    }`}
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    {comment.upvote_count}
                                  </button>
                                  <button
                                    onClick={() => handleVote(comment.id, -1)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                      comment.userVote === -1
                                        ? "bg-red-100 text-red-600"
                                        : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    }`}
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    {comment.downvote_count}
                                  </button>
                                  {net !== 0 && (
                                    <span className={`text-[11px] font-bold tabular-nums ${net > 0 ? "text-green-600" : "text-red-500"}`}>
                                      {net > 0 ? `+${net}` : net}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
