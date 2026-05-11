import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense, useEffect, useRef, useState, useCallback } from "react";
import { RoadmapModule } from "@/components/RoadmapModule";
import { RoadmapIntro } from "@/components/RoadmapIntro";
import { SEO } from "@/components/SEO";
import roadmapsData from "@/data/roadmaps.json";
import {
  AlertCircle, MessageSquare, Info, ChevronRight, ThumbsUp, ThumbsDown,
  Loader2, CheckCircle, Clock, ChevronLeft, ChevronDown,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useLearningOS } from "@/hooks/useLearningOS";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const RoadmapChart = lazy(() =>
  import("@/components/RoadmapChart").then((mod) => ({ default: mod.RoadmapChart }))
);

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

const NAV_PALETTE = [
  "#3b82f6", "#f97316", "#8b5cf6",
  "#14b8a6", "#ec4899", "#f59e0b",
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Service-Based":  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
  "Product-Based":  { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  "Specialized":    { bg: "bg-green-50",  text: "text-[#1a7f4b]",  dot: "bg-[#1a7f4b]" },
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Projects Tab ─────────────────────────────────────────────────────────────

function ProjectsTab({
  roadmap,
  user,
  openAuthModal,
}: {
  roadmap: any;
  user: any;
  openAuthModal: () => void;
}) {
  const allProjects = (roadmap.modules as any[]).flatMap((m) =>
    ((m.realWorldProjects ?? []) as any[]).map((p: any) => ({
      ...p,
      moduleId: m.id,
      moduleTitle: m.title,
    }))
  );
  const [diffFilter, setDiffFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [submitProject, setSubmitProject] = useState<any>(null);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_projects")
      .select("project_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setCompletedIds(new Set((data as any[])?.map((p: any) => p.project_id) ?? []));
      });
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !submitProject) return;
    setSubmitting(true);
    const projectId = slugify(submitProject.title);
    const { error } = await supabase.from("user_projects").insert({
      user_id: user.id,
      project_id: projectId,
      roadmap_item_id: submitProject.moduleId,
      submission_url: submitUrl.trim() || null,
    });
    if (!error) {
      setCompletedIds((prev) => new Set(Array.from(prev).concat(projectId)));
      toast.success("Project marked as complete!");
      setSubmitProject(null);
      setSubmitUrl("");
    } else {
      toast.error("Failed to save — you may have already submitted this project.");
    }
    setSubmitting(false);
  };

  const filtered = diffFilter === "all"
    ? allProjects
    : allProjects.filter((p: any) => p.difficulty === diffFilter);

  const DIFF_COLORS: Record<string, string> = {
    beginner:     "bg-green-50 text-green-700 border-green-200",
    intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    advanced:     "bg-red-50   text-red-700   border-red-200",
  };
  const TYPE_COLORS: Record<string, string> = {
    feature:    "bg-blue-50   text-blue-700",
    clone:      "bg-purple-50 text-purple-700",
    ticket:     "bg-orange-50 text-orange-700",
    simulation: "bg-teal-50   text-teal-700",
  };

  if (allProjects.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 text-sm">No real-world projects added for this roadmap yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Difficulty filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "beginner", "intermediate", "advanced"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              diffFilter === d ? "bg-[#1a7f4b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d === "all" ? "All" : d}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((project: any, i: number) => {
          const projectId = slugify(project.title);
          const done = completedIds.has(projectId);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-3 ${
                done ? "border-[#1a7f4b]/20 bg-[#1a7f4b]/5" : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-2">
                {done && <CheckCircle className="w-4 h-4 text-[#1a7f4b] mt-0.5 shrink-0" />}
                <h4 className="font-bold text-gray-900">{project.title}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${DIFF_COLORS[project.difficulty] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {project.difficulty}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[project.type] ?? "bg-gray-100 text-gray-600"}`}>
                  {project.type}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {project.estimatedTime}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{project.deliverable}</p>
              {!done ? (
                <button
                  onClick={() => user ? setSubmitProject(project) : openAuthModal()}
                  className="mt-auto w-full py-2 border border-[#1a7f4b] text-[#1a7f4b] rounded-xl text-sm font-semibold hover:bg-[#1a7f4b]/5 transition-colors"
                >
                  {user ? "Submit Project" : "Sign in to Start"}
                </button>
              ) : (
                <div className="mt-auto py-2 bg-[#1a7f4b]/10 text-[#1a7f4b] rounded-xl text-sm font-semibold text-center">
                  ✓ Completed
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!submitProject} onOpenChange={(o) => !o && setSubmitProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit: {submitProject?.title}</DialogTitle>
            <DialogDescription>Mark this project as complete and optionally share your work.</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Project URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
              placeholder="https://github.com/yourname/project"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none"
            />
          </div>
          <DialogFooter>
            <button onClick={() => setSubmitProject(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-[#1a7f4b] text-white rounded-xl text-sm font-semibold hover:bg-[#15653d] disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Mark Complete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Revision Tab ──────────────────────────────────────────────────────────────

function RevisionTab({ roadmap }: { roadmap: any }) {
  const allFlashcards = (roadmap.modules as any[]).flatMap(
    (m) => ((m.revisionContent?.flashcards ?? []) as any[]).map((f: any) => ({ ...f, moduleTitle: m.title }))
  );
  const allQuizzes = (roadmap.modules as any[]).flatMap(
    (m) => ((m.revisionContent?.quiz ?? []) as any[]).map((q: any) => ({ ...q, moduleTitle: m.title }))
  );
  const summaries = (roadmap.modules as any[])
    .filter((m) => m.revisionContent?.summary)
    .map((m) => ({ summary: m.revisionContent.summary as string, moduleTitle: m.title as string }));

  const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const goNext = () => { setCardIdx((i) => Math.min(i + 1, allFlashcards.length - 1)); setFlipped(false); };
  const goPrev = () => { setCardIdx((i) => Math.max(i - 1, 0)); setFlipped(false); };
  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (allQuizzes[quizIdx].correctIndex === idx) setScore((s) => s + 1);
  };
  const nextQuestion = () => {
    if (quizIdx + 1 >= allQuizzes.length) { setQuizDone(true); return; }
    setQuizIdx((i) => i + 1);
    setSelected(null);
  };

  if (allFlashcards.length === 0 && allQuizzes.length === 0 && summaries.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 text-sm">No revision content for this roadmap yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summaries */}
      {summaries.length > 0 && (
        <div className="space-y-4">
          {summaries.map(({ summary, moduleTitle }, i) => (
            <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">{moduleTitle} — Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mode toggle */}
      {(allFlashcards.length > 0 || allQuizzes.length > 0) && (
        <>
          <div className="flex gap-2">
            {allFlashcards.length > 0 && (
              <button
                onClick={() => setMode("flashcards")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mode === "flashcards" ? "bg-[#1a7f4b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🃏 Flashcards ({allFlashcards.length})
              </button>
            )}
            {allQuizzes.length > 0 && (
              <button
                onClick={() => { setMode("quiz"); setQuizIdx(0); setSelected(null); setScore(0); setQuizDone(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mode === "quiz" ? "bg-[#1a7f4b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🧠 Quiz ({allQuizzes.length} Qs)
              </button>
            )}
          </div>

          {/* Flashcard view */}
          {mode === "flashcards" && allFlashcards.length > 0 && (
            <div>
              {/* Flip card */}
              <div
                className="relative h-48 cursor-pointer mb-4"
                style={{ perspective: "1000px" }}
                onClick={() => setFlipped(!flipped)}
              >
                <div
                  className="absolute inset-0 transition-transform duration-500"
                  style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center gap-2"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Question</p>
                    <p className="text-center font-semibold text-gray-900 text-lg leading-snug">
                      {allFlashcards[cardIdx]?.question}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Click to reveal answer</p>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 bg-[#1a7f4b]/5 rounded-2xl border border-[#1a7f4b]/20 shadow-sm p-8 flex flex-col items-center justify-center gap-2"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <p className="text-xs text-[#1a7f4b] uppercase tracking-wider font-bold">Answer</p>
                    <p className="text-center text-gray-900 leading-relaxed">
                      {allFlashcards[cardIdx]?.answer}
                    </p>
                  </div>
                </div>
              </div>
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goPrev}
                  disabled={cardIdx === 0}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm text-gray-400 font-medium tabular-nums">
                  {cardIdx + 1} / {allFlashcards.length}
                </span>
                <button
                  onClick={goNext}
                  disabled={cardIdx === allFlashcards.length - 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quiz view */}
          {mode === "quiz" && allQuizzes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              {quizDone ? (
                <div className="text-center space-y-4">
                  <p className="text-4xl">🎉</p>
                  <p className="text-xl font-bold text-gray-900">Quiz Complete!</p>
                  <p className="text-gray-500">
                    You scored <span className="font-bold text-[#1a7f4b]">{score}</span> / {allQuizzes.length}
                  </p>
                  <button
                    onClick={() => { setQuizIdx(0); setSelected(null); setScore(0); setQuizDone(false); }}
                    className="px-5 py-2.5 bg-[#1a7f4b] text-white rounded-xl text-sm font-semibold hover:bg-[#15653d] transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Question {quizIdx + 1} of {allQuizzes.length}
                    </span>
                    <span className="text-xs font-bold text-[#1a7f4b]">Score: {score}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-6 leading-snug">
                    {allQuizzes[quizIdx]?.question}
                  </p>
                  <div className="space-y-3">
                    {(allQuizzes[quizIdx]?.options ?? []).map((opt: string, i: number) => {
                      const isCorrect = i === allQuizzes[quizIdx].correctIndex;
                      const isSelected = selected === i;
                      let cls = "border-gray-200 text-gray-700 hover:border-gray-300";
                      if (selected !== null) {
                        if (isCorrect) cls = "border-[#1a7f4b] bg-[#1a7f4b]/5 text-[#1a7f4b] font-semibold";
                        else if (isSelected) cls = "border-red-300 bg-red-50 text-red-700";
                        else cls = "border-gray-100 text-gray-400";
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== null && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={nextQuestion}
                        className="px-5 py-2 bg-[#1a7f4b] text-white rounded-xl text-sm font-semibold hover:bg-[#15653d] transition-colors"
                      >
                        {quizIdx + 1 >= allQuizzes.length ? "See Results" : "Next →"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Reality Check Tab ─────────────────────────────────────────────────────────

function RealityCheckTab({ roadmap }: { roadmap: any }) {
  const modules = (roadmap.modules as any[]).filter((m) => m.realityCheck);

  if (modules.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 text-sm">No reality check content for this roadmap yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((m: any) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-5"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full shrink-0" />
            <h3 className="font-bold text-gray-900">{m.title}</h3>
          </div>

          {/* Market relevance */}
          <blockquote className="border-l-4 border-amber-400 pl-5">
            <p className="text-gray-700 italic leading-relaxed">{m.realityCheck.marketRelevance}</p>
          </blockquote>

          {/* Timeline */}
          <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
            <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Real Timeline</p>
              <p className="text-sm text-gray-700 leading-relaxed">{m.realityCheck.realTimeline}</p>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Prerequisites</p>
            <ul className="space-y-2">
              {m.realityCheck.prerequisiteHint
                .split(/\.\s+/)
                .filter((s: string) => s.trim().length > 0)
                .map((hint: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#1a7f4b] shrink-0 mt-0.5" />
                    {hint.trim().replace(/\.$/, "")}
                  </li>
                ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Squad Tab ─────────────────────────────────────────────────────────────────

function SquadTab({
  roadmap,
  user,
  openAuthModal,
}: {
  roadmap: any;
  user: any;
  openAuthModal: () => void;
}) {
  const [, navigate] = useLocation();
  const [postingCheckIn, setPostingCheckIn] = useState<string | null>(null);
  const modules = (roadmap.modules as any[]).filter((m) => m.collaborationHooks);

  const handleCheckIn = async (question: string) => {
    if (!user) { openAuthModal(); return; }
    setPostingCheckIn(question);
    const { error } = await supabase.from("discussions").insert({
      user_id: user.id,
      title: question.slice(0, 100),
      content: `Accountability check-in for roadmap: ${roadmap.title as string}`,
      tags: ["accountability", "check-in"],
    });
    if (!error) toast.success("Check-in posted to Trending Discussions!");
    else toast.error("Failed to post check-in");
    setPostingCheckIn(null);
  };

  if (modules.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 text-sm">No squad collaboration content for this roadmap yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {modules.map((m: any) => (
        <div key={m.id}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{m.title}</p>
          <div className="space-y-4">
            {/* Squad challenge */}
            {m.collaborationHooks.squadChallenge && (
              <div className="bg-gradient-to-br from-[#1a7f4b]/10 to-blue-50 rounded-2xl p-6 border border-[#1a7f4b]/20">
                <h4 className="font-bold text-gray-900 mb-2">
                  🏆 {m.collaborationHooks.squadChallenge.title}
                </h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {m.collaborationHooks.squadChallenge.description}
                </p>
                <button
                  onClick={() => navigate("/squads")}
                  className="px-5 py-2 bg-[#1a7f4b] text-white rounded-xl text-sm font-semibold hover:bg-[#15653d] transition-colors"
                >
                  Find Partners →
                </button>
              </div>
            )}

            {/* Pair programming prompts */}
            {(m.collaborationHooks.pairProgrammingPrompts?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-base">👥</span> Pair Programming Prompts
                </h4>
                <ul className="space-y-2.5">
                  {(m.collaborationHooks.pairProgrammingPrompts as string[]).map((prompt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#1a7f4b] font-bold shrink-0 mt-0.5">{i + 1}.</span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accountability questions */}
            {(m.collaborationHooks.accountabilityQuestions?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-base">✅</span> Accountability Questions
                </h4>
                <div className="space-y-3">
                  {(m.collaborationHooks.accountabilityQuestions as string[]).map((q, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                      <p className="text-sm text-gray-600">{q}</p>
                      <button
                        onClick={() => handleCheckIn(q)}
                        disabled={postingCheckIn === q}
                        className="shrink-0 px-3 py-1 text-xs font-semibold text-[#1a7f4b] border border-[#1a7f4b]/30 rounded-lg hover:bg-[#1a7f4b]/5 transition-colors disabled:opacity-50"
                      >
                        {postingCheckIn === q ? "Posting…" : "Check In"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main RoadmapPage ──────────────────────────────────────────────────────────

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

  // Tab state — persisted via URL hash
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    return ["overview", "projects", "revision", "reality", "squad"].includes(hash) ? hash : "overview";
  });

  const { user, openAuthModal } = useAuth();
  const learning = useLearningOS(user?.id);

  useEffect(() => {
    const found = roadmapsData.roadmaps.find((r) => r.id === roadmapId);
    setRoadmap(found ?? null);
    setActiveStep(0);
    window.scrollTo(0, 0);
  }, [roadmapId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  /* ── Fetch comments ── */
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

  /* ── Post comment ── */
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

  /* ── Vote on comment ── */
  const handleVote = async (commentId: string, value: 1 | -1) => {
    if (!user) { openAuthModal(); return; }
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    if (comment.userVote === value) {
      await supabase.from("votes").delete().eq("user_id", user.id).eq("comment_id", commentId);
    } else if (comment.userVote !== null) {
      await supabase.from("votes").update({ value }).eq("user_id", user.id).eq("comment_id", commentId);
    } else {
      await supabase.from("votes").insert({ user_id: user.id, comment_id: commentId, value });
    }
    await fetchComments();
  };

  const handleSaveResource = async (material: any, moduleId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      if (learning.savedUrlSet.has(material.link)) {
        await learning.removeSavedResource(material.link);
        toast.success("Removed from saved resources");
      } else {
        await learning.saveResource({
          roadmap_id: roadmapId,
          module_id: moduleId,
          resource_url: material.link,
          resource_title: material.name,
          resource_type: material.type,
        });
        toast.success("Saved to your dashboard");
      }
    } catch (error: any) {
      toast.error(error.message ?? "Could not update saved resource");
    }
  };

  /* ── Track active step on scroll ── */
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

  /* ── Derived tab counts ── */
  const totalProjects = (roadmap.modules as any[]).reduce(
    (sum: number, m: any) => sum + (m.realWorldProjects?.length ?? 0), 0
  );
  const totalFlashcards = (roadmap.modules as any[]).reduce(
    (sum: number, m: any) => sum + (m.revisionContent?.flashcards?.length ?? 0), 0
  );
  const hasRealityCheck = (roadmap.modules as any[]).some((m: any) => m.realityCheck);
  const hasSquadContent = (roadmap.modules as any[]).some((m: any) => m.collaborationHooks);

  /* ── SEO ── */
  const topicKeywords = roadmap.modules.flatMap((m: any) => m.topics as string[]).slice(0, 10).join(", ");
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
          items={roadmapsData.roadmaps.map((r) => ({ id: r.id, title: r.title, role: r.company || r.title }))}
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
              <div className="mb-5">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${catStyle.bg} ${catStyle.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                  {roadmap.category} Track
                </span>
              </div>

              <h1 className="heading-editorial text-3xl md:text-5xl text-gray-900 mb-5 leading-[1.05]">
                {roadmap.title}
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl leading-relaxed">{roadmap.description}</p>

              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Fresher Entry", value: roadmap.salaryFresher, color: "#1a7f4b" },
                  { label: "Senior Roles",  value: roadmap.salarySenior,  color: "#3b82f6" },
                  { label: "Mastery",       value: roadmap.timeline,      color: "#8b5cf6" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
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

          {/* ── Tabs ── */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Sticky tab bar */}
            <div className="sticky top-[57px] z-30 bg-white border-b border-gray-100 px-6 md:px-10">
              <TabsList className="bg-transparent p-0 h-auto rounded-none gap-0 w-full justify-start overflow-x-auto">
                {[
                  { value: "overview",  label: "Overview" },
                  { value: "projects",  label: "Projects",     badge: totalProjects > 0 ? totalProjects : undefined },
                  { value: "revision",  label: "Revision",     badge: totalFlashcards > 0 ? totalFlashcards : undefined },
                  { value: "reality",   label: "Reality Check", show: hasRealityCheck },
                  { value: "squad",     label: "Squad",         show: hasSquadContent  },
                ].filter((t) => t.show !== false).map(({ value, label, badge }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1a7f4b] data-[state=active]:text-[#1a7f4b] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium whitespace-nowrap shrink-0"
                  >
                    {label}
                    {badge !== undefined && (
                      <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="px-6 md:px-10 py-10">
              <div className="max-w-4xl space-y-16">

                {/* ── Overview tab (existing content) ── */}
                <TabsContent value="overview" className="mt-0 space-y-16">
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
                        <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1.5">Risk &amp; Tradeoffs</p>
                        <p className="text-sm text-amber-900/80 leading-relaxed">{roadmap.riskTradeoff}</p>
                      </div>
                    </motion.div>
                  )}

                  {roadmap.graphData?.length > 0 && (
                    <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-teal-400 via-blue-500 to-orange-400" />
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Financial Progression</h2>
                      </div>
                      <Suspense fallback={<div className="h-72 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" aria-label="Loading salary chart" />}>
                        <RoadmapChart data={roadmap.graphData} title={roadmap.title} />
                      </Suspense>
                    </motion.section>
                  )}

                  <RoadmapIntro roadmapId={roadmapId} />

                  <section>
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

                    {/* Quick-nav strip */}
                    <div className="flex gap-2 mb-10 overflow-x-auto pb-2 -mx-1 px-1">
                      {roadmap.modules.map((module: any, idx: number) => {
                        const color = NAV_PALETTE[idx % NAV_PALETTE.length];
                        const isActive = activeStep === idx;
                        return (
                          <motion.button
                            key={module.id}
                            onClick={() => stepRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" })}
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

                    <div>
                      {roadmap.modules.map((module: any, idx: number) => (
                        <div key={module.id} ref={(el) => { stepRefs.current[idx] = el; }} id={`step-${idx}`}>
                          <RoadmapModule
                            id={module.id}
                            roadmapId={roadmapId}
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
                            savedResourceUrls={learning.savedUrlSet}
                            onSaveResource={handleSaveResource}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {roadmap.communityInsights?.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="py-12 px-8 bg-gray-900 text-white rounded-3xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-2 relative z-10">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Industry Perspectives</h2>
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
                              <div className="w-4 h-0.5 rounded-full mb-3 transition-all group-hover:w-8" style={{ background: accent }} />
                              <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">{text}</p>
                              {source && (
                                <p className="mt-3 text-[10px] font-black tracking-widest uppercase" style={{ color: accent }}>— {source}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.section>
                  )}

                  {/* Community Log */}
                  <section className="pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gray-100 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Community Log</h2>
                    </div>
                    <p className="text-sm text-gray-400 mb-8 max-w-lg">
                      Share real questions or experiences about this path. 3–4 sentences max. No promotional content.
                    </p>

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "Share a real question or experience…" : "Sign in to post a comment…"}
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
                                    <div className="flex items-center gap-3 mt-3">
                                      <button
                                        onClick={() => handleVote(comment.id, 1)}
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                          comment.userVote === 1 ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600"
                                        }`}
                                      >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {comment.upvote_count}
                                      </button>
                                      <button
                                        onClick={() => handleVote(comment.id, -1)}
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                          comment.userVote === -1 ? "bg-red-100 text-red-600" : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
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
                </TabsContent>

                {/* ── Projects tab ── */}
                <TabsContent value="projects" className="mt-0">
                  <ProjectsTab roadmap={roadmap} user={user} openAuthModal={openAuthModal} />
                </TabsContent>

                {/* ── Revision tab ── */}
                <TabsContent value="revision" className="mt-0">
                  <RevisionTab roadmap={roadmap} />
                </TabsContent>

                {/* ── Reality Check tab ── */}
                <TabsContent value="reality" className="mt-0">
                  <RealityCheckTab roadmap={roadmap} />
                </TabsContent>

                {/* ── Squad tab ── */}
                <TabsContent value="squad" className="mt-0">
                  <SquadTab roadmap={roadmap} user={user} openAuthModal={openAuthModal} />
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
