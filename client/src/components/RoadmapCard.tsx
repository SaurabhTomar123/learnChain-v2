import { BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RealityCheck } from "@/types/database";

interface RoadmapCardProps {
  title: string;
  description: string;
  timeline: string;
  salaryFresher: string;
  salarySenior: string;
  tag?: string;
  realityCheck?: RealityCheck;
  onClick: () => void;
}

export function RoadmapCard({
  title,
  description,
  timeline,
  salaryFresher,
  salarySenior,
  realityCheck,
  onClick,
}: RoadmapCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl p-8 border border-gray-100 border-l-4 border-l-[#1a7f4b] cursor-pointer transition-all duration-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
      style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)" }}
    >
      {/* Icon + timeline row */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#1a7f4b]">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          {realityCheck && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 cursor-help"
                  onClick={(e) => e.stopPropagation()}
                >
                  Reality Check
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-left" sideOffset={4}>
                <p className="font-semibold mb-1">Market Reality</p>
                <p className="text-xs opacity-90">{realityCheck.marketRelevance}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <span className="text-xs font-bold text-gray-400">{timeline}</span>
        </div>
      </div>

      {/* Title + description */}
      <h3 className="text-xl font-bold mb-3 group-hover:text-[#1a7f4b] transition-colors">{title}</h3>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2">{description}</p>

      {/* Footer: salary */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Fresher</p>
          <p className="font-bold text-gray-900">{salaryFresher}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Senior</p>
          <p className="font-bold text-gray-900">{salarySenior}</p>
        </div>
      </div>
    </button>
  );
}
