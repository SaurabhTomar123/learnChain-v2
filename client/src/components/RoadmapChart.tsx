import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Info, TrendingUp } from "lucide-react";

interface ChartData {
  name: string;
  min: number;
  avg: number;
  max: number;
}

const COLORS = {
  min:  { fill: "#14b8a6", label: "Min LPA",  bg: "#f0fdfa" },
  avg:  { fill: "#3b82f6", label: "Avg LPA",  bg: "#eff6ff" },
  max:  { fill: "#f97316", label: "Max LPA",  bg: "#fff7ed" },
};

const STAGE_META: Record<string, { xp: string; icon: string }> = {
  "Core Base":    { xp: "0–2 yrs",  icon: "🌱" },
  "Intermediate": { xp: "3–5 yrs",  icon: "📈" },
  "Specialized":  { xp: "6+ yrs",   icon: "🚀" },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const meta = STAGE_META[label] ?? { xp: "", icon: "•" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 text-sm min-w-[180px]"
         style={{ boxShadow: "0 20px 40px -8px rgba(0,0,0,0.15)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{meta.icon}</span>
        <p className="font-black text-gray-900">{label}</p>
      </div>
      <p className="text-[11px] text-gray-400 mb-3 pl-6">{meta.xp} experience</p>
      {payload.map((p: any) => {
        const key = p.dataKey as keyof typeof COLORS;
        const c = COLORS[key];
        return (
          <div key={p.name} className="flex items-center justify-between gap-8 mb-1.5 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded" style={{ background: c.fill }} />
              <span className="text-[11px] text-gray-500 font-medium">{c.label}</span>
            </div>
            <span className="text-xs font-black" style={{ color: c.fill }}>₹{p.value}L</span>
          </div>
        );
      })}
    </div>
  );
}

export function RoadmapChart({ data, title }: { data: ChartData[]; title: string }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.max)) + 5;

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden"
      style={{ boxShadow: "0 8px 32px -8px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)" }}
    >
      {/* Gradient header */}
      <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                Salary Progression
              </span>
            </div>
            <p className="font-black text-gray-800 text-base">{title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Base CTC · ₹ LPA · Indian market</p>
          </div>
          {/* Legend pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {(Object.entries(COLORS) as [keyof typeof COLORS, typeof COLORS[keyof typeof COLORS]][]).map(([key, c]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: c.bg, color: c.fill }}
              >
                <div className="w-2 h-2 rounded-sm" style={{ background: c.fill }} />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="px-2 pt-6 pb-2" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap="28%"
            barGap={5}
            margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
              tick={{ fill: "#9ca3af" }}
              width={40}
              domain={[0, maxVal]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(249,250,251,0.8)", rx: 8, ry: 8 }}
            />
            <Bar dataKey="min" name="Min" fill={COLORS.min.fill} radius={[6, 6, 0, 0]} maxBarSize={52} />
            <Bar dataKey="avg" name="Avg" fill={COLORS.avg.fill} radius={[6, 6, 0, 0]} maxBarSize={52} />
            <Bar dataKey="max" name="Max" fill={COLORS.max.fill} radius={[6, 6, 0, 0]} maxBarSize={52} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* X-axis experience labels */}
      <div className="grid px-6 pb-1" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((d) => {
          const meta = STAGE_META[d.name] ?? { xp: "", icon: "" };
          return (
            <div key={d.name} className="text-center">
              <span className="text-[10px] text-gray-400 font-medium">{meta.icon} {meta.xp}</span>
            </div>
          );
        })}
      </div>

      {/* Source note */}
      <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/50">
        <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
          <Info className="w-3 h-3 shrink-0 text-gray-300" />
          Data based on real industry surveys (2024–2025) — Glassdoor, Levels.fyi, LinkedIn Salary Insights.
          Ranges vary by company, city, and experience.
        </p>
      </div>
    </div>
  );
}
