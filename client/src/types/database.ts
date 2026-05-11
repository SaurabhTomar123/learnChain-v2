// ─────────────────────────────────────────────────────────────────────────────
// LearnChain — Supabase Database Types
// Mirrors the schema in supabase/migrations/001_learnchain_schema.sql.
// The Database generic is typed to satisfy GenericSchema from @supabase/supabase-js
// so the typed client, table queries, and RPC calls are all inferred correctly.
// ─────────────────────────────────────────────────────────────────────────────

export type CareerMode =
  | 'product'
  | 'startup'
  | 'service'
  | 'faang'
  | 'freelance'
  | 'indie'
  | 'gamedev';

// ── Row types ────────────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  dob: string | null;
  subscribed: boolean;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  career_mode: CareerMode;
  created_at: string;
}

export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface RoadmapProgressRow {
  id: string;
  user_id: string;
  roadmap_item_id: string;
  completed_at: string;
  xp_earned: number;
  notes: string | null;
}

export interface UserProjectRow {
  id: string;
  user_id: string;
  project_id: string;
  roadmap_item_id: string;
  submission_url: string | null;
  completed_at: string;
  rating: number | null;
}

export interface DiscussionRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  career_mode_context: string | null;
  is_pinned: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface DiscussionVoteRow {
  id: string;
  discussion_id: string;
  user_id: string;
  vote_type: number;
  created_at: string;
}

export interface DiscussionCommentRow {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface SquadRow {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  created_at: string;
}

export interface SquadMemberRow {
  squad_id: string;
  user_id: string;
  joined_at: string;
}

export interface ChatMessageRow {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  squad_id: string | null;
  content: string;
  created_at: string;
}

export interface UserLearningPreferencesRow {
  user_id: string;
  goal: string;
  experience_level: string;
  weekly_hours: number;
  preferred_stack: string | null;
  target_company_type: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface SavedResourceRow {
  id: string;
  user_id: string;
  roadmap_id: string;
  module_id: string;
  resource_url: string;
  resource_title: string;
  resource_type: string;
  created_at: string;
}

export interface StudyPlanRow {
  id: string;
  user_id: string;
  roadmap_id: string;
  weekly_hours: number;
  start_date: string;
  plan_json: StudyPlanWeek[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningReminderRow {
  id: string;
  user_id: string;
  frequency: 'daily' | 'weekly' | 'weekdays' | 'off';
  preferred_time: string;
  timezone: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy tables (existing schema, kept for backward compat)
export interface CommentRow {
  id: string;
  user_id: string;
  roadmap_id: string;
  content: string;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
}

export interface VoteRow {
  user_id: string;
  comment_id: string;
  value: number;
}

// ── RPC return types ─────────────────────────────────────────────────────────

export interface UpsertVoteResult {
  action: 'inserted' | 'removed' | 'switched';
  upvotes: number;
  downvotes: number;
  score: number;
  user_vote: number | null;
}

export interface UpdateStreakXpResult {
  new_xp: number;
  new_level: number;
  xp_earned: number;
  current_streak: number;
  longest_streak: number;
  leveled_up: boolean;
}

export interface StudyPlanWeek {
  week: number;
  title: string;
  moduleIds: string[];
  focus: string;
  estimatedHours: number;
}

// ── Discussion with joined profile (used in TrendingPage) ────────────────────

export interface DiscussionWithAuthor extends DiscussionRow {
  profiles: Pick<ProfileRow, 'name' | 'full_name' | 'username' | 'avatar_url'> | null;
  userVote: number | null;
}

// ── Supabase Database generic ─────────────────────────────────────────────────
//
// Must satisfy GenericSchema from @supabase/supabase-js:
//   { Tables: Record<string, GenericTable>, Views: Record<string, GenericView>, Functions: Record<string, GenericFunction> }
//
// Each Table must include: Row, Insert, Update, Relationships: []
// Each Function must include: Args, Returns

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      user_badges: {
        Row: UserBadgeRow;
        Insert: Omit<UserBadgeRow, 'id' | 'earned_at'>;
        Update: Record<string, never>;
        Relationships: [];
      };
      roadmap_progress: {
        Row: RoadmapProgressRow;
        Insert: Omit<RoadmapProgressRow, 'id' | 'completed_at'> & { notes?: string | null };
        Update: Partial<Omit<RoadmapProgressRow, 'id' | 'user_id' | 'roadmap_item_id'>>;
        Relationships: [];
      };
      user_projects: {
        Row: UserProjectRow;
        Insert: Omit<UserProjectRow, 'id' | 'completed_at'> & { submission_url?: string | null; rating?: number | null };
        Update: Partial<Omit<UserProjectRow, 'id' | 'user_id'>>;
        Relationships: [];
      };
      discussions: {
        Row: DiscussionRow;
        Insert: Pick<DiscussionRow, 'user_id' | 'title' | 'content'> & {
          tags?: string[];
          career_mode_context?: string | null;
        };
        Update: Partial<Pick<DiscussionRow, 'title' | 'content' | 'tags'>>;
        Relationships: [];
      };
      discussion_votes: {
        Row: DiscussionVoteRow;
        Insert: Omit<DiscussionVoteRow, 'id' | 'created_at'>;
        Update: Pick<DiscussionVoteRow, 'vote_type'>;
        Relationships: [];
      };
      discussion_comments: {
        Row: DiscussionCommentRow;
        Insert: Omit<DiscussionCommentRow, 'id' | 'created_at'>;
        Update: Record<string, never>;
        Relationships: [];
      };
      squads: {
        Row: SquadRow;
        Insert: Omit<SquadRow, 'id' | 'created_at'>;
        Update: Partial<Pick<SquadRow, 'name' | 'description'>>;
        Relationships: [];
      };
      squad_members: {
        Row: SquadMemberRow;
        Insert: Omit<SquadMemberRow, 'joined_at'>;
        Update: Record<string, never>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: Omit<ChatMessageRow, 'id' | 'created_at'>;
        Update: Record<string, never>;
        Relationships: [];
      };
      user_learning_preferences: {
        Row: UserLearningPreferencesRow;
        Insert: Omit<UserLearningPreferencesRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserLearningPreferencesRow, 'user_id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      saved_resources: {
        Row: SavedResourceRow;
        Insert: Omit<SavedResourceRow, 'id' | 'created_at'>;
        Update: Record<string, never>;
        Relationships: [];
      };
      study_plans: {
        Row: StudyPlanRow;
        Insert: Omit<StudyPlanRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StudyPlanRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      learning_reminders: {
        Row: LearningReminderRow;
        Insert: Omit<LearningReminderRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LearningReminderRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      // Legacy tables
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, 'id' | 'created_at' | 'upvote_count' | 'downvote_count'>;
        Update: Partial<Pick<CommentRow, 'content' | 'upvote_count' | 'downvote_count'>>;
        Relationships: [];
      };
      votes: {
        Row: VoteRow;
        Insert: VoteRow;
        Update: Pick<VoteRow, 'value'>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_vote: {
        Args: { p_discussion_id: string; p_vote_type: number };
        Returns: UpsertVoteResult;
      };
      update_streak_and_xp: {
        Args: {
          p_user_id: string;
          p_xp_earned: number;
          p_streak_mult_item: boolean;
        };
        Returns: UpdateStreakXpResult;
      };
    };
  };
};

// ── roadmaps.json v2 types ────────────────────────────────────────────────────

export interface CareerModeWeight {
  weight: number;
  required: boolean;
}

export interface ProjectResource {
  title: string;
  url: string;
  type: 'video' | 'docs' | 'article';
}

export interface RealWorldProject {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'feature' | 'clone' | 'ticket' | 'simulation';
  requiredSkills: string[];
  estimatedTime: string;
  deliverable: string;
  resource: ProjectResource[];
}

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  criteria: string;
}

export interface Gamification {
  xpReward: number;
  streakMult: boolean;
  badges: Badge[];
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface RevisionContent {
  summary: string;
  spacedRepetitionSchedule: number[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface RealityCheck {
  marketRelevance: string;
  realTimeline: string;
  prerequisiteHint: string;
}

export interface CollaborationHooks {
  squadChallenge: { title: string; description: string };
  pairProgrammingPrompts: string[];
  accountabilityQuestions: string[];
}

export interface RoadmapModuleV2 {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  recommendedMaterials: Array<{
    name: string;
    platform: string;
    link: string;
    type: 'free' | 'paid' | 'doc' | 'paid/free';
    whyBest?: string;
  }>;
  effort?: string;
  insight?: string;
  howToCover?: { free: string; paid: string };
  subtopics?: string[];
  // v2 fields
  gamification?: Gamification;
  careerModeWeights?: Record<CareerMode, CareerModeWeight>;
  realWorldProjects?: RealWorldProject[];
  revisionContent?: RevisionContent;
  realityCheck?: RealityCheck;
  collaborationHooks?: CollaborationHooks;
}

export interface RoadmapV2 {
  id: string;
  category: string;
  company: string | null;
  title: string;
  description: string;
  salaryFresher?: string;
  salarySenior?: string;
  timeline?: string;
  schemaVersion?: string;
  modules: RoadmapModuleV2[];
  graphData?: Array<{ year: string; salary: number }>;
  riskTradeoff?: string;
  communityInsights?: string[];
}
