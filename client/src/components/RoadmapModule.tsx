import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, PlayCircle, BookOpen, Globe, Award,
  Info, Clock, Zap, Bookmark,
} from "lucide-react";

interface Material {
  name: string;
  platform: string;
  link: string;
  type: "free" | "paid" | "doc" | "paid/free";
  whyBest?: string;
}

interface HowToCover {
  free: string;
  paid: string;
}

interface RoadmapModuleProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  index: number;
  recommendedMaterials?: Material[];
  subtopics?: string[];
  effort?: string;
  insight?: string;
  howToCover?: HowToCover;
  roadmapId?: string;
  savedResourceUrls?: Set<string>;
  onSaveResource?: (material: Material, moduleId: string) => void;
}

/* Cycle through six distinct palettes — step badge + accents */
const PALETTE = [
  { color: "#3b82f6", bg: "#eff6ff",   border: "#bfdbfe" }, // blue
  { color: "#f97316", bg: "#fff7ed",   border: "#fed7aa" }, // orange
  { color: "#8b5cf6", bg: "#f5f3ff",   border: "#ddd6fe" }, // violet
  { color: "#14b8a6", bg: "#f0fdfa",   border: "#99f6e4" }, // teal
  { color: "#ec4899", bg: "#fdf2f8",   border: "#f9a8d4" }, // pink
  { color: "#f59e0b", bg: "#fffbeb",   border: "#fde68a" }, // amber
] as const;

/* Extract "~40h" from "~40 hours over 4 weeks" */
function shortEffort(effort?: string): string | null {
  if (!effort) return null;
  const m = effort.match(/~?(\d+)\s*hours?/i);
  return m ? `~${m[1]}h` : effort.split(" ").slice(0, 2).join(" ");
}

export function RoadmapModule({
  title,
  description,
  duration,
  topics,
  index,
  recommendedMaterials,
  subtopics,
  effort,
  insight,
  howToCover,
  id,
  roadmapId,
  savedResourceUrls,
  onSaveResource,
}: RoadmapModuleProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  const palette = PALETTE[index % PALETTE.length];
  const hasInfo = !!(subtopics?.length || effort || insight || howToCover);
  const effortShort = shortEffort(effort);
  const hasFree = recommendedMaterials?.some((m) => m.type === "free" || m.type === "doc");
  const hasPaid = recommendedMaterials?.some((m) => m.type === "paid" || m.type === "paid/free");

  return (
    <div className="relative flex gap-4 md:gap-5 pb-5 last:pb-0">
      {/* ── Left column: step badge + connector ── */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 48 }}>
        <motion.div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md shrink-0 z-10"
          style={{ background: palette.color }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.div>
        {/* Connector */}
        <div
          className="w-0.5 flex-1 mt-2 rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${palette.color}55, transparent)`,
            minHeight: "1.5rem",
          }}
        />
      </div>

      {/* ── Right: card ── */}
      <motion.div
        className="flex-1 bg-white rounded-2xl overflow-hidden mb-3"
        style={{
          border: `1px solid ${palette.border}`,
          borderLeft: `3px solid ${palette.color}`,
          boxShadow: "0 2px 12px -3px rgba(0,0,0,0.07)",
        }}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.28, delay: Math.min(index * 0.06, 0.3) }}
        whileHover={{ boxShadow: "0 8px 24px -6px rgba(0,0,0,0.12)" }}
      >
        {/* ── Card header ── */}
        <div className="px-5 pt-5 pb-4">

          {/* Title + ⓘ */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-base md:text-lg font-black text-gray-900 leading-tight flex-1">
              {title}
            </h3>
            {hasInfo && (
              <motion.button
                onClick={() => setInfoOpen((o) => !o)}
                aria-label={infoOpen ? "Hide details" : "Show learning details"}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors mt-0.5"
                style={{
                  background: infoOpen ? palette.color : palette.bg,
                  color: infoOpen ? "#fff" : palette.color,
                  border: `1px solid ${palette.border}`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Info className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          {/* ── Quick stats row — ALWAYS VISIBLE ── */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {effortShort && (
              <span
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}
              >
                <Clock className="w-3 h-3" />
                {effortShort}
              </span>
            )}
            {/* Top 2 topics as quick preview */}
            {topics.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] font-semibold px-2 py-1 rounded-full border bg-gray-50 border-gray-100 text-gray-600"
              >
                {t}
              </span>
            ))}
            {topics.length > 2 && (
              <span className="text-[10px] font-medium text-gray-400">+{topics.length - 2} more</span>
            )}
            {/* Resource type indicators */}
            {hasFree && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                Free ✓
              </span>
            )}
            {hasPaid && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                Paid
              </span>
            )}
          </div>

          {/* ── Insight — ALWAYS VISIBLE ── */}
          {insight && (
            <div
              className="flex gap-2.5 items-start px-3 py-2.5 rounded-xl mb-4"
              style={{ background: palette.bg, border: `1px solid ${palette.border}` }}
            >
              <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: palette.color }} />
              <p className="text-xs leading-relaxed font-medium" style={{ color: palette.color }}>
                {insight}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-4">{description}</p>

          {/* All topics */}
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <span
                key={topic}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: palette.bg,
                  color: palette.color,
                  border: `1px solid ${palette.border}`,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* ── Expandable details panel (ⓘ) ── */}
        <AnimatePresence>
          {infoOpen && hasInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div
                className="mx-5 mb-4 rounded-xl p-4 space-y-4"
                style={{ background: palette.bg, border: `1px solid ${palette.border}` }}
              >
                {/* Subtopics */}
                {subtopics && subtopics.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: palette.color }}>
                      What to learn inside this step
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subtopics.map((s, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2.5 py-1 bg-white rounded-lg border border-gray-100 text-gray-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* How to cover */}
                {howToCover && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-green-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-1.5">
                        Free Path
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{howToCover.free}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-1.5">
                        Paid (Faster)
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{howToCover.paid}</p>
                    </div>
                  </div>
                )}

                {/* Full effort */}
                {effort && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: palette.color }} />
                    <span>
                      <strong className="text-gray-700">Full effort: </strong>
                      {effort}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Resources ── */}
        {recommendedMaterials && recommendedMaterials.length > 0 && (
          <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: `${palette.border}` }}>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3">
              Curated Resources
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {recommendedMaterials.map((material, mIdx) => {
                const isFree = material.type === "free" || material.type === "doc";
                return (
                  <motion.div
                    key={mIdx}
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="group flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md transition-colors"
                  >
                    {/* Platform icon */}
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 transition-colors group-hover:scale-105"
                      style={{ background: palette.bg, color: palette.color }}
                    >
                      {material.platform.toLowerCase().includes("youtube") ? (
                        <PlayCircle className="w-5 h-5" />
                      ) : material.type === "doc" ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className="text-[9px] font-black uppercase tracking-tight"
                          style={{ color: palette.color }}
                        >
                          {material.platform}
                        </span>
                        <div className="flex items-center gap-1">
                          {onSaveResource && roadmapId && (
                            <button
                              type="button"
                              onClick={() => onSaveResource(material, id)}
                              aria-label={`${savedResourceUrls?.has(material.link) ? "Saved" : "Save"} ${material.name}`}
                              className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30 ${
                                savedResourceUrls?.has(material.link)
                                  ? "bg-[#1a7f4b]/10 text-[#1a7f4b]"
                                  : "text-gray-400 hover:bg-white hover:text-[#1a7f4b]"
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <a
                        href={material.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-xs text-gray-800 leading-snug group-hover:text-gray-900 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30 rounded"
                      >
                        {material.name}
                      </a>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded"
                          style={
                            isFree
                              ? { background: "#dcfce7", color: "#15803d" }
                              : { background: "#fef3c7", color: "#92400e" }
                          }
                        >
                          {material.type === "doc" ? "DOCS" : isFree ? "FREE" : "PAID"}
                        </span>
                        {material.whyBest && (
                          <p className="text-[10px] text-gray-400 truncate leading-tight">
                            {material.whyBest}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
