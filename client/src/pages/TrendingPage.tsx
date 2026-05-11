import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, ArrowDown, MessageSquare, Tag,
  TrendingUp, Loader2, LogIn, Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { DiscussionWithAuthor } from "@/types/database";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

function authorName(d: DiscussionWithAuthor): string {
  const p = d.profiles;
  if (!p) return "Anonymous";
  return p.full_name ?? p.name ?? p.username ?? "Anonymous";
}

function authorInitials(d: DiscussionWithAuthor): string {
  const n = authorName(d);
  return n
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const TAG_COLOURS: Record<string, string> = {
  react:       "bg-blue-100 text-blue-700",
  nextjs:      "bg-gray-100 text-gray-700",
  career:      "bg-purple-100 text-purple-700",
  faang:       "bg-orange-100 text-orange-700",
  freelance:   "bg-teal-100 text-teal-700",
  javascript:  "bg-yellow-100 text-yellow-700",
  typescript:  "bg-blue-100 text-blue-800",
  india:       "bg-green-100 text-green-700",
  salary:      "bg-pink-100 text-pink-700",
};

function tagClass(tag: string): string {
  return (
    TAG_COLOURS[tag.toLowerCase()] ??
    "bg-gray-100 text-gray-600"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type VoteState = Record<string, number | null>;

// ─────────────────────────────────────────────────────────────────────────────
// TrendingPage
// ─────────────────────────────────────────────────────────────────────────────

export default function TrendingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discussions, setDiscussions] = useState<DiscussionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteState, setVoteState] = useState<VoteState>({});
  const [votingId, setVotingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user, openAuthModal } = useAuth();
  const mountedRef = useRef(true);

  // ── Fetch discussions ──────────────────────────────────────────────────────
  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from("discussions")
      .select(`
        id, user_id, title, content, tags, career_mode_context,
        is_pinned, upvotes, downvotes, score, created_at, updated_at,
        profiles(name, full_name, username, avatar_url)
      `)
      .order("score", { ascending: false })
      .limit(20);

    if (!mountedRef.current) return;

    if (fetchErr || !data) {
      setError("Could not load discussions. Please try again.");
      setLoading(false);
      return;
    }

    let items: DiscussionWithAuthor[] = (data as any[]).map((d) => ({
      ...d,
      userVote: null,
    }));

    // Load the current user's votes in a second query
    if (user && items.length > 0) {
      const ids = items.map((d) => d.id);
      const { data: voteData } = await supabase
        .from("discussion_votes")
        .select("discussion_id, vote_type")
        .eq("user_id", user.id)
        .in("discussion_id", ids);

      if (voteData) {
        const map: VoteState = Object.fromEntries(
          (voteData as any[]).map((v) => [v.discussion_id, v.vote_type as number])
        );
        items = items.map((d) => ({ ...d, userVote: map[d.id] ?? null }));
        setVoteState(map);
      }
    }

    setDiscussions(items);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    fetchDiscussions();
    return () => { mountedRef.current = false; };
  }, [fetchDiscussions]);

  // ── Vote handler with optimistic UI ───────────────────────────────────────
  const handleVote = async (discussionId: string, voteType: 1 | -1) => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (votingId) return; // prevent double-tap

    const prev = voteState[discussionId] ?? null;
    const isSameVote = prev === voteType;
    const nextVote: number | null = isSameVote ? null : voteType;

    // Optimistic update
    const deltaUp = (v: number, old: number | null, next: number | null) => {
      let d = 0;
      if (old === 1) d--;
      if (next === 1) d++;
      return v + d;
    };
    const deltaDown = (v: number, old: number | null, next: number | null) => {
      let d = 0;
      if (old === -1) d--;
      if (next === -1) d++;
      return v + d;
    };

    const snapshot = [...discussions];
    const snapshotVotes = { ...voteState };

    setVoteState((s) => ({ ...s, [discussionId]: nextVote }));
    setDiscussions((ds) =>
      ds.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              userVote: nextVote,
              upvotes: deltaUp(d.upvotes, prev, nextVote),
              downvotes: deltaDown(d.downvotes, prev, nextVote),
            }
          : d
      )
    );

    setVotingId(discussionId);
    const { error: rpcErr } = await supabase.rpc("upsert_vote", {
      p_discussion_id: discussionId,
      p_vote_type: voteType,
    });
    setVotingId(null);

    if (rpcErr) {
      // Rollback
      setDiscussions(snapshot);
      setVoteState(snapshotVotes);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/40">
      <SEO
        title="Trending Discussions — LearnChain"
        description="See what the LearnChain community is discussing — career paths, salary negotiations, learning resources, and more."
        keywords="developer community india, trending tech discussions, software engineer career india"
        path="/trending"
      />

      <Header onMenuToggle={setSidebarOpen} />
      <Sidebar
        items={[]}
        onSelect={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#1a7f4b]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#1a7f4b]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Trending Discussions
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Top 20 posts ranked by community votes + freshness
            </p>
          </div>
        </div>

        {/* Anonymous prompt */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1a7f4b]/20 bg-[#1a7f4b]/5"
          >
            <LogIn className="w-4 h-4 text-[#1a7f4b] shrink-0" />
            <p className="text-sm text-gray-700">
              <button
                onClick={openAuthModal}
                className="font-semibold text-[#1a7f4b] underline underline-offset-2 hover:no-underline"
              >
                Sign in
              </button>{" "}
              to vote and join the conversation.
            </p>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 text-[#1a7f4b] animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-500">{error}</p>
            <button
              onClick={fetchDiscussions}
              className="text-sm text-[#1a7f4b] font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && discussions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              No discussions yet — be the first to start one.
            </p>
          </div>
        )}

        {/* Discussion cards */}
        <AnimatePresence>
          {!loading && !error && (
            <ul className="space-y-4">
              {discussions.map((d, i) => (
                <DiscussionCard
                  key={d.id}
                  discussion={d}
                  rank={i + 1}
                  userVote={voteState[d.id] ?? d.userVote}
                  isVoting={votingId === d.id}
                  isAuthenticated={!!user}
                  onVote={handleVote}
                  onSignIn={openAuthModal}
                />
              ))}
            </ul>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DiscussionCard
// ─────────────────────────────────────────────────────────────────────────────

interface DiscussionCardProps {
  discussion: DiscussionWithAuthor;
  rank: number;
  userVote: number | null;
  isVoting: boolean;
  isAuthenticated: boolean;
  onVote: (id: string, type: 1 | -1) => void;
  onSignIn: () => void;
}

function DiscussionCard({
  discussion: d,
  rank,
  userVote,
  isVoting,
  isAuthenticated,
  onVote,
  onSignIn,
}: DiscussionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LENGTH = 180;
  const needsExpand = d.content.length > PREVIEW_LENGTH;
  const displayContent =
    expanded || !needsExpand
      ? d.content
      : d.content.slice(0, PREVIEW_LENGTH).trimEnd() + "…";

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: rank * 0.04 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm
                 hover:shadow-md hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex gap-4 p-5">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
          <VoteButton
            direction="up"
            active={userVote === 1}
            disabled={isVoting}
            count={d.upvotes}
            onClick={() => isAuthenticated ? onVote(d.id, 1) : onSignIn()}
            title={isAuthenticated ? "Upvote" : "Sign in to vote"}
          />
          <VoteButton
            direction="down"
            active={userVote === -1}
            disabled={isVoting}
            count={d.downvotes}
            onClick={() => isAuthenticated ? onVote(d.id, -1) : onSignIn()}
            title={isAuthenticated ? "Downvote" : "Sign in to vote"}
          />
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          {/* Header: rank + pinned */}
          <div className="flex items-center gap-2 mb-1.5">
            {d.is_pinned && (
              <span className="text-[10px] font-semibold text-[#1a7f4b] bg-[#1a7f4b]/10
                               px-1.5 py-0.5 rounded-full tracking-wide uppercase">
                Pinned
              </span>
            )}
            <span className="text-xs text-gray-300 font-medium">#{rank}</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold text-gray-900 leading-snug mb-2">
            {d.title}
          </h2>

          {/* Content preview */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {displayContent}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-[#1a7f4b] font-medium mt-1 hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {/* Tags */}
          {d.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {d.tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium
                              px-2 py-0.5 rounded-full ${tagClass(tag)}`}
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            {/* Avatar */}
            <div className="w-5 h-5 rounded-full bg-[#1a7f4b]/20 flex items-center
                            justify-center text-[10px] font-bold text-[#1a7f4b] shrink-0">
              {d.profiles?.avatar_url ? (
                <img
                  src={d.profiles.avatar_url}
                  alt={authorName(d)}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                authorInitials(d)
              )}
            </div>

            <span className="font-medium text-gray-500">{authorName(d)}</span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {relativeTime(d.created_at)}
            </span>

            {d.career_mode_context && (
              <>
                <span className="text-gray-300">·</span>
                <span className="capitalize bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                  {d.career_mode_context}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VoteButton
// ─────────────────────────────────────────────────────────────────────────────

interface VoteButtonProps {
  direction: "up" | "down";
  active: boolean;
  disabled: boolean;
  count: number;
  onClick: () => void;
  title: string;
}

function VoteButton({ direction, active, disabled, count, onClick, title }: VoteButtonProps) {
  const isUp = direction === "up";
  const Icon = isUp ? ArrowUp : ArrowDown;

  const activeClass = isUp
    ? "text-blue-600 bg-blue-50"
    : "text-red-500 bg-red-50";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex flex-col items-center gap-0.5 w-9 py-1 rounded-lg
                  transition-all duration-150 select-none
                  ${active ? activeClass : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[11px] font-semibold tabular-nums leading-none">
        {count}
      </span>
    </button>
  );
}
