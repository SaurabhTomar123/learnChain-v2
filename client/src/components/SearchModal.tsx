import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, X, ArrowRight, Clock } from "lucide-react";
import roadmapsData from "@/data/roadmaps.json";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  company?: string;
  description: string;
  matchReason: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Service-Based": "bg-blue-50 text-blue-700",
  "Product-Based": "bg-purple-50 text-purple-700",
  Specialized: "bg-green-50 text-[#1a7f4b]",
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = normalize(query);
  const tokens = q.split(" ").filter(Boolean);

  return roadmapsData.roadmaps
    .map((r) => {
      const fields = [
        r.title,
        r.company ?? "",
        r.category,
        r.description,
        ...r.modules.flatMap((m) => [...m.topics, m.title]),
      ].map(normalize);

      let score = 0;
      let matchReason = "";

      for (const token of tokens) {
        for (const field of fields) {
          if (field.includes(token)) {
            score += field === normalize(r.title) ? 4 : 2;
          }
        }
      }

      if (normalize(r.title).includes(q)) score += 10;
      if (normalize(r.company ?? "").includes(q)) score += 8;
      if (normalize(r.category).includes(q)) score += 5;

      if (score > 0) {
        if (normalize(r.title).includes(q) || normalize(r.company ?? "").includes(q)) {
          matchReason = r.company ? `${r.company} · ${r.category}` : r.category;
        } else {
          const matchedTopic = r.modules
            .flatMap((m) => m.topics)
            .find((t) => normalize(t).includes(tokens[0]));
          matchReason = matchedTopic
            ? `Covers: ${matchedTopic}`
            : r.category;
        }
      }

      return { ...r, score, matchReason };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ id, title, category, company, description, matchReason }) => ({
      id,
      title,
      category,
      company,
      description,
      matchReason,
    }));
}

interface Props {
  isOpen: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
}

export function SearchDropdown({ isOpen, query, onQueryChange, onClose }: Props) {
  const [, navigate] = useLocation();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(search(query));
    setActiveIndex(0);
  }, [query]);

  const go = useCallback(
    (id: string) => {
      navigate(`/roadmap/${id}`);
      onClose();
    },
    [navigate, onClose]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[activeIndex]) {
        go(results[activeIndex].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, results, activeIndex, go, onClose]);

  if (!isOpen || !query.trim()) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      {results.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">
          No roadmaps found for <strong>"{query}"</strong>
          <p className="mt-1 text-xs">Try: java, devops, amazon, frontend, ml…</p>
        </div>
      ) : (
        <ul>
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                onClick={() => go(r.id)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                  i === activeIndex ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {r.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        CATEGORY_COLORS[r.category] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{r.matchReason}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </button>
            </li>
          ))}
          <li className="px-5 py-2.5 border-t border-gray-50 flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-300" />
            <span className="text-[11px] text-gray-400">
              {results.length} result{results.length !== 1 ? "s" : ""} · press{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">↑↓</kbd>{" "}
              to navigate,{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">↵</kbd>{" "}
              to open,{" "}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Esc</kbd>{" "}
              to close
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}
