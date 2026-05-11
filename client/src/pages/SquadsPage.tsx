import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Users, Plus, Search, Send, RefreshCw, Loader2,
  ArrowLeft, UserPlus, UserMinus, MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import roadmapsData from "@/data/roadmaps.json";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

interface Squad {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  created_at: string;
  memberCount: number;
}

interface SquadMember {
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface SquadsPageProps {
  squadId?: string;
}

// ─────────────────────────────────────────────
// Discovery view
// ─────────────────────────────────────────────

function DiscoveryView() {
  const { user, openAuthModal } = useAuth();
  const [, navigate] = useLocation();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchSquads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("squads")
      .select("id, name, description, leader_id, created_at")
      .order("created_at", { ascending: false });
    if (err || !data) { setError(err?.message ?? "Failed to load"); setLoading(false); return; }

    const ids = (data as any[]).map((s) => s.id);
    const { data: memberData } = await supabase
      .from("squad_members")
      .select("squad_id")
      .in("squad_id", ids.length > 0 ? ids : ["__none__"]);

    const countMap: Record<string, number> = {};
    for (const row of (memberData as any[]) ?? []) {
      countMap[row.squad_id] = (countMap[row.squad_id] ?? 0) + 1;
    }

    setSquads((data as any[]).map((s) => ({ ...s, memberCount: countMap[s.id] ?? 0 })));
    setLoading(false);
  }, []);

  const fetchJoined = useCallback(async () => {
    if (!user) { setJoinedIds(new Set()); return; }
    const { data } = await supabase
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", user.id);
    setJoinedIds(new Set((data as any[])?.map((r: any) => r.squad_id) ?? []));
  }, [user]);

  useEffect(() => { fetchSquads(); }, [fetchSquads]);
  useEffect(() => { fetchJoined(); }, [fetchJoined]);

  const handleJoinLeave = async (squadId: string, alreadyJoined: boolean) => {
    if (!user) { openAuthModal(); return; }
    setJoiningId(squadId);
    const prevJoined = new Set(joinedIds);
    const nextJoined = new Set(joinedIds);
    if (alreadyJoined) nextJoined.delete(squadId); else nextJoined.add(squadId);
    setJoinedIds(nextJoined);
    setSquads((prev) =>
      prev.map((s) =>
        s.id === squadId
          ? { ...s, memberCount: s.memberCount + (alreadyJoined ? -1 : 1) }
          : s
      )
    );

    const { error } = alreadyJoined
      ? await supabase.from("squad_members").delete().eq("squad_id", squadId).eq("user_id", user.id)
      : await supabase.from("squad_members").insert({ squad_id: squadId, user_id: user.id });

    if (error) {
      setJoinedIds(prevJoined);
      await fetchSquads();
      toast.error(alreadyJoined ? "Failed to leave squad" : "Failed to join squad");
    } else {
      toast.success(alreadyJoined ? "Left squad" : "Joined squad!");
    }
    setJoiningId(null);
  };

  const handleCreate = async () => {
    if (!user) { openAuthModal(); return; }
    if (!newName.trim()) return;
    setCreating(true);
    const { data: newSquad, error: squadErr } = await supabase
      .from("squads")
      .insert({ name: newName.trim(), description: newDesc.trim() || null, leader_id: user.id })
      .select()
      .single();
    if (squadErr || !newSquad) {
      toast.error("Failed to create squad");
      setCreating(false);
      return;
    }
    await supabase.from("squad_members").insert({ squad_id: (newSquad as any).id, user_id: user.id });
    toast.success("Squad created!");
    setCreateOpen(false);
    setNewName("");
    setNewDesc("");
    setCreating(false);
    navigate(`/squads/${(newSquad as any).id}`);
  };

  const filtered = squads.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const mySquads = filtered.filter((s) => joinedIds.has(s.id));
  const otherSquads = filtered.filter((s) => !joinedIds.has(s.id));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Squads</h1>
            <p className="text-sm text-gray-400 mt-0.5">Study together, grow faster</p>
          </div>
        </div>
        <button
          onClick={() => user ? setCreateOpen(true) : openAuthModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a7f4b] text-white rounded-xl text-sm font-semibold hover:bg-[#15653d] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Squad</span>
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search squads…"
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none transition-all shadow-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={fetchSquads} className="flex items-center gap-1 font-semibold">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* My squads */}
          {user && mySquads.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">My Squads</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySquads.map((squad) => (
                  <SquadCard
                    key={squad.id}
                    squad={squad}
                    joined={true}
                    isJoining={joiningId === squad.id}
                    onJoinLeave={() => handleJoinLeave(squad.id, true)}
                    onOpen={() => navigate(`/squads/${squad.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All squads */}
          <div>
            {user && mySquads.length > 0 && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Discover</p>
            )}
            {otherSquads.length === 0 && mySquads.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-3">
                  {search ? "No squads match your search." : "No squads yet — be the first to create one!"}
                </p>
                {!search && (
                  <button
                    onClick={() => user ? setCreateOpen(true) : openAuthModal()}
                    className="text-sm font-semibold text-[#1a7f4b] hover:underline"
                  >
                    Create a squad →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherSquads.map((squad) => (
                  <SquadCard
                    key={squad.id}
                    squad={squad}
                    joined={false}
                    isJoining={joiningId === squad.id}
                    onJoinLeave={() => handleJoinLeave(squad.id, false)}
                    onOpen={() => navigate(`/squads/${squad.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Squad Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Squad</DialogTitle>
            <DialogDescription>
              Form a study group with other LearnChain developers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. React Study Crew"
                maxLength={60}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What will this squad focus on?"
                maxLength={200}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-5 py-2 bg-[#1a7f4b] text-white rounded-xl text-sm font-semibold hover:bg-[#15653d] disabled:opacity-50 flex items-center gap-2"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Squad
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SquadCard({
  squad,
  joined,
  isJoining,
  onJoinLeave,
  onOpen,
}: {
  squad: Squad;
  joined: boolean;
  isJoining: boolean;
  onJoinLeave: () => void;
  onOpen: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900">{squad.name}</h3>
          {squad.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{squad.description}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {squad.memberCount}
        </span>
      </div>
      <div className="flex gap-2 mt-auto">
        <button
          onClick={onOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Open
        </button>
        <button
          onClick={onJoinLeave}
          disabled={isJoining}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
            joined
              ? "text-red-600 border border-red-100 hover:bg-red-50"
              : "text-[#1a7f4b] border border-[#1a7f4b]/30 hover:bg-[#1a7f4b]/5"
          }`}
        >
          {isJoining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : joined ? (
            <UserMinus className="w-3.5 h-3.5" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          {joined ? "Leave" : "Join"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Squad detail / chat view
// ─────────────────────────────────────────────

function DetailView({ squadId }: { squadId: string }) {
  const { user, openAuthModal } = useAuth();
  const [, navigate] = useLocation();
  const [squad, setSquad] = useState<Omit<Squad, "memberCount"> | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [squadRes, membersRes, messagesRes] = await Promise.all([
      supabase.from("squads").select("id, name, description, leader_id, created_at").eq("id", squadId).maybeSingle(),
      supabase.from("squad_members").select("user_id, profiles(username, full_name, avatar_url)").eq("squad_id", squadId),
      supabase
        .from("chat_messages")
        .select("id, sender_id, content, created_at, profiles(username, full_name, avatar_url)")
        .eq("squad_id", squadId)
        .order("created_at", { ascending: true })
        .limit(50),
    ]);

    if (squadRes.error || !squadRes.data) {
      setError("Squad not found");
      setLoading(false);
      return;
    }
    setSquad(squadRes.data as any);
    setMembers((membersRes.data as any[]) ?? []);
    setMessages((messagesRes.data as any[]) ?? []);
    setLoading(false);
  }, [squadId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`squad-chat-${squadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `squad_id=eq.${squadId}` },
        (payload) => {
          // Fetch the full row with profile join
          supabase
            .from("chat_messages")
            .select("id, sender_id, content, created_at, profiles(username, full_name, avatar_url)")
            .eq("id", (payload.new as any).id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) setMessages((prev) => [...prev, data as unknown as ChatMessage]);
            });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [squadId]);

  const sendMessage = async () => {
    if (!user) { openAuthModal(); return; }
    const text = messageText.trim();
    if (!text || sending) return;
    setMessageText("");
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      sender_id: user.id,
      squad_id: squadId,
      content: text,
    });
    if (error) {
      setMessageText(text);
      toast.error("Failed to send message");
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStandup = () => {
    setMessageText("Yesterday I...\nToday I'll...\nBlockers: None");
    textareaRef.current?.focus();
  };

  function getMemberName(m: SquadMember) {
    return m.profiles?.full_name || m.profiles?.username || "Member";
  }

  function getMsgName(msg: ChatMessage) {
    return msg.profiles?.full_name || msg.profiles?.username || "User";
  }

  function getMsgInitials(msg: ChatMessage) {
    return getMsgName(msg).slice(0, 2).toUpperCase();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !squad) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-red-500 text-sm mb-3">{error ?? "Squad not found"}</p>
        <button onClick={() => navigate("/squads")} className="text-sm font-semibold text-[#1a7f4b] hover:underline">
          ← Back to Squads
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate("/squads")}
          aria-label="Back to squads"
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{squad.name}</h1>
          {squad.description && (
            <p className="text-sm text-gray-400 truncate mt-0.5">{squad.description}</p>
          )}
        </div>
        <button
          onClick={handleStandup}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
        >
          📋 Daily Standup
        </button>
      </motion.div>

      {/* Members bar */}
      {members.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-gray-400 shrink-0">{members.length} member{members.length !== 1 ? "s" : ""}:</span>
          {members.slice(0, 8).map((m) => (
            <Tooltip key={m.user_id}>
              <TooltipTrigger asChild>
                <a
                  href={`/u/${m.profiles?.username ?? m.user_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${getMemberName(m)}'s profile`}
                >
                  <Avatar className="w-7 h-7 shrink-0 hover:ring-2 hover:ring-[#1a7f4b]/40 transition-all">
                    {m.profiles?.avatar_url && <AvatarImage src={m.profiles.avatar_url} />}
                    <AvatarFallback className="bg-[#1a7f4b] text-white text-[9px] font-black">
                      {getMemberName(m).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </a>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>{getMemberName(m)}</TooltipContent>
            </Tooltip>
          ))}
          {members.length > 8 && (
            <span className="text-xs text-gray-400">+{members.length - 8} more</span>
          )}
        </div>
      )}

      {/* Chat area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: "500px" }}>
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isMe = user?.id === msg.sender_id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-7 h-7 shrink-0">
                        {msg.profiles?.avatar_url && <AvatarImage src={msg.profiles.avatar_url} />}
                        <AvatarFallback className="bg-[#1a7f4b] text-white text-[9px] font-black">
                          {getMsgInitials(msg)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          {!isMe && (
                            <span className="text-xs font-semibold text-gray-700">{getMsgName(msg)}</span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                            isMe
                              ? "bg-[#1a7f4b] text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-800 rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          {!user ? (
            <button
              onClick={openAuthModal}
              className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
            >
              Sign in to join the conversation
            </button>
          ) : (
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none resize-none transition-all"
                style={{ minHeight: "42px", maxHeight: "100px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim() || sending}
                aria-label="Send message"
                className="p-2.5 bg-[#1a7f4b] text-white rounded-xl hover:bg-[#15653d] disabled:opacity-40 transition-colors shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tooltip import (inline to avoid re-export)
// ─────────────────────────────────────────────
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function SquadsPage({ squadId }: SquadsPageProps) {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          {squadId ? <DetailView squadId={squadId} /> : <DiscoveryView />}
        </main>
      </div>
    </div>
  );
}
