import { motion } from "framer-motion";
import { BookOpen, PlayCircle, Clock, AlertCircle } from "lucide-react";
import { roadmapIntros } from "@/data/roadmapIntros";

interface RoadmapIntroProps {
  roadmapId: string;
}

export function RoadmapIntro({ roadmapId }: RoadmapIntroProps) {
  const intro = roadmapIntros[roadmapId];
  if (!intro) return null;

  const paragraphs = intro.summary.trim().split("\n\n");
  const hasVideo = !!intro.videoId;
  const isLongVideo = intro.videoNote != null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* Section label */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-linear-to-b from-violet-500 via-blue-500 to-teal-400" />
        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">About This Path</h2>
      </div>

      {/* Summary card */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)" }}
      >
        {/* Card header strip */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-linear-to-r from-violet-50/60 via-blue-50/40 to-transparent">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">Path Overview</p>
            <p className="text-xs text-gray-400 mt-0.5">What this role is and how to master it</p>
          </div>
        </div>

        {/* Summary body */}
        <div className="px-6 py-5 space-y-4">
          {paragraphs.map((para, idx) => (
            <p key={idx} className="text-sm text-gray-600 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* YouTube embed — only if videoId present */}
      {hasVideo && (
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)" }}
        >
          {/* Video card header */}
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-50 bg-linear-to-r from-red-50/60 via-orange-50/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <PlayCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-red-600">Quick Watch</p>
                {intro.videoCaption && (
                  <p className="text-xs text-gray-500 mt-0.5">{intro.videoCaption}</p>
                )}
              </div>
            </div>

            {/* Duration badge */}
            {intro.videoDuration && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold shrink-0 mt-0.5">
                <Clock className="w-3 h-3" />
                {intro.videoDuration}
              </span>
            )}
          </div>

          {/* Long-video disclaimer */}
          {isLongVideo && (
            <div className="flex items-start gap-2.5 mx-6 mt-4 px-3.5 py-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed">{intro.videoNote}</p>
            </div>
          )}

          {/* Responsive 16:9 embed */}
          <div
            className={`relative w-full ${isLongVideo ? "mt-4" : ""}`}
            style={{ paddingBottom: "56.25%" }}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${intro.videoId}?rel=0&modestbranding=1`}
              title={intro.videoCaption ?? "Path overview video"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </motion.section>
  );
}
