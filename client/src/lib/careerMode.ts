// ─────────────────────────────────────────────────────────────────────────────
// careerMode.ts
// Utility for filtering and prioritising roadmap modules based on the user's
// chosen career mode (product / startup / service / faang / freelance / indie / gamedev).
//
// Usage:
//   import { getPrioritisedRoadmap } from '@/lib/careerMode'
//   const sorted = getPrioritisedRoadmap(roadmap, 'startup')
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CareerMode,
  CareerModeWeight,
  RoadmapModuleV2,
  RoadmapV2,
} from "@/types/database";

// ── Constants ────────────────────────────────────────────────────────────────

export const CAREER_MODE_LABELS: Record<CareerMode, string> = {
  product:   "Product Company",
  startup:   "Startup",
  service:   "Service / IT",
  faang:     "FAANG / MAANG",
  freelance: "Freelancer",
  indie:     "Indie / Solopreneur",
  gamedev:   "Game Development",
};

export const CAREER_MODE_DESCRIPTIONS: Record<CareerMode, string> = {
  product:   "Build products at companies like Flipkart, Razorpay, CRED, Swiggy. Focus on feature work, system design, and code quality.",
  startup:   "Move fast at seed-to-Series B companies. Wear multiple hats — fullstack, infra, product thinking.",
  service:   "Work at TCS, Infosys, Wipro, Accenture. Client projects, enterprise Java/Python, SDLC processes.",
  faang:     "Target Google, Meta, Amazon, Microsoft India. Deep CS fundamentals, system design, LeetCode.",
  freelance: "Client projects on Upwork / Toptal / direct. React, Next.js, full-stack delivery, communication skills.",
  indie:     "Ship your own SaaS or tools. Full-stack ownership, marketing, payments, distribution.",
  gamedev:   "Unity / Unreal / Web games. C#, C++, maths (linear algebra, physics), game loops.",
};

export const CAREER_MODE_ICONS: Record<CareerMode, string> = {
  product:   "🏢",
  startup:   "🚀",
  service:   "🤝",
  faang:     "🏆",
  freelance: "💼",
  indie:     "⚡",
  gamedev:   "🎮",
};

// ── Priority tier thresholds ──────────────────────────────────────────────────
const TIER_HIGH   = 0.8;   // weight >= 0.8  → must-do
const TIER_MEDIUM = 0.5;   // weight >= 0.5  → recommended
                            // weight <  0.5  → optional / skip

export type PriorityTier = "required" | "high" | "recommended" | "optional";

// ── Module with computed priority ────────────────────────────────────────────

export interface PrioritisedModule extends RoadmapModuleV2 {
  priorityTier: PriorityTier;
  effectiveWeight: number;
  isRequired: boolean;
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Returns the roadmap's modules sorted and annotated by priority for the
 * given career mode.
 *
 * Sort order:
 *   1. required = true modules first (any weight)
 *   2. within required: descending weight
 *   3. non-required modules: descending weight
 *   4. modules with no careerModeWeights entry: appended at the end
 *
 * Modules with effectiveWeight === 0 are still included so the user sees
 * the full curriculum — but they're clearly marked "optional".
 */
export function getPrioritisedRoadmap(
  roadmap: RoadmapV2,
  mode: CareerMode
): PrioritisedModule[] {
  return roadmap.modules
    .map((module): PrioritisedModule => {
      const modeWeight: CareerModeWeight | undefined =
        module.careerModeWeights?.[mode];

      const effectiveWeight = modeWeight?.weight ?? 0.5; // default: neutral
      const isRequired = modeWeight?.required ?? false;

      let priorityTier: PriorityTier;
      if (isRequired)                          priorityTier = "required";
      else if (effectiveWeight >= TIER_HIGH)   priorityTier = "high";
      else if (effectiveWeight >= TIER_MEDIUM) priorityTier = "recommended";
      else                                      priorityTier = "optional";

      return { ...module, priorityTier, effectiveWeight, isRequired };
    })
    .sort((a, b) => {
      // Required items always float to top
      if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
      // Within same required status: higher weight first
      return b.effectiveWeight - a.effectiveWeight;
    });
}

// ── Filter helpers ────────────────────────────────────────────────────────────

/**
 * Returns only the modules that are required or high-priority for the mode.
 * Useful for "fast track" or onboarding views.
 */
export function getEssentialModules(
  roadmap: RoadmapV2,
  mode: CareerMode
): PrioritisedModule[] {
  return getPrioritisedRoadmap(roadmap, mode).filter(
    (m) => m.priorityTier === "required" || m.priorityTier === "high"
  );
}

/**
 * Returns a 0–100 relevance score for an entire roadmap track given the mode.
 * Computed as the weighted average of all module weights.
 */
export function roadmapRelevanceScore(
  roadmap: RoadmapV2,
  mode: CareerMode
): number {
  const modules = roadmap.modules;
  if (modules.length === 0) return 0;

  const totalWeight = modules.reduce((sum, m) => {
    return sum + (m.careerModeWeights?.[mode]?.weight ?? 0.5);
  }, 0);

  return Math.round((totalWeight / modules.length) * 100);
}

// ── Tier metadata for UI rendering ───────────────────────────────────────────

export const TIER_META: Record<
  PriorityTier,
  { label: string; badge: string; colour: string }
> = {
  required: {
    label:  "Required",
    badge:  "Must-do",
    colour: "text-red-700 bg-red-50 border-red-200",
  },
  high: {
    label:  "High Priority",
    badge:  "High",
    colour: "text-[#1a7f4b] bg-[#1a7f4b]/10 border-[#1a7f4b]/20",
  },
  recommended: {
    label:  "Recommended",
    badge:  "Good to have",
    colour: "text-blue-700 bg-blue-50 border-blue-200",
  },
  optional: {
    label:  "Optional",
    badge:  "Skip if short on time",
    colour: "text-gray-500 bg-gray-50 border-gray-200",
  },
};

// ── Career mode onboarding prompt ────────────────────────────────────────────

export interface CareerModeOption {
  mode: CareerMode;
  label: string;
  description: string;
  icon: string;
}

export function getAllCareerModeOptions(): CareerModeOption[] {
  return (Object.keys(CAREER_MODE_LABELS) as CareerMode[]).map((mode) => ({
    mode,
    label:       CAREER_MODE_LABELS[mode],
    description: CAREER_MODE_DESCRIPTIONS[mode],
    icon:        CAREER_MODE_ICONS[mode],
  }));
}
