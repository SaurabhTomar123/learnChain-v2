import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Info, TrendingUp } from "lucide-react";

interface ChartData {
  name: string;
  min: number;
  avg: number;
  max: number;
}

const COLORS = {
  min: { fill: "#0f766e", label: "Conservative", bg: "#f0fdfa" },
  avg: { fill: "#2563eb", label: "Typical", bg: "#eff6ff" },
  max: { fill: "#b45309", label: "Top-end", bg: "#fffbeb" },
};

const STAGE_META: Record<string, { xp: string; note: string }> = {
  "Core Base": { xp: "0-2 yrs", note: "entry market band" },
  Intermediate: { xp: "3-5 yrs", note: "execution and ownership" },
  Specialized: { xp: "6+ yrs", note: "depth premium" },
};

function formatLpa(value: number) {
  return `Rs ${value}L`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const meta = STAGE_META[label] ?? { xp: "", note: "" };

  return (
    <div className="min-w-[220px] rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl">
      <p className="font-black text-gray-900">{label}</p>
      <p className="mb-3 text-[11px] text-gray-500">
        {meta.xp} experience · {meta.note}
      </p>
      {payload.map((p: any) => {
        const key = p.dataKey as keyof typeof COLORS;
        const c = COLORS[key];
        return (
          <div key={p.name} className="mb-1.5 flex items-center justify-between gap-8 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ background: c.fill }} />
              <span className="text-[11px] font-medium text-gray-600">{c.label}</span>
            </div>
            <span className="text-xs font-black" style={{ color: c.fill }}>
              {formatLpa(p.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RoadmapChart({ data, title }: { data: ChartData[]; title: string }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.max)) + 5;
  const first = data[0];
  const last = data[data.length - 1];
  const typicalGrowth =
    first?.avg && last?.avg ? Math.round(((last.avg - first.avg) / first.avg) * 100) : 0;
  const topEnd = Math.max(...data.map((d) => d.max));

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
      style={{ boxShadow: "0 10px 28px -18px rgba(17,24,39,0.35)" }}
    >
      <div className="border-b border-gray-100 bg-white px-6 pb-5 pt-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
                Salary Progression
              </span>
            </div>
            <p className="text-base font-black text-gray-900">{title}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Base CTC · INR LPA · Indian market estimate
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {(Object.entries(COLORS) as [keyof typeof COLORS, (typeof COLORS)[keyof typeof COLORS]][]).map(
              ([key, c]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold"
                  style={{ background: c.bg, color: c.fill, borderColor: `${c.fill}30` }}
                >
                  <div className="h-2 w-2 rounded-sm" style={{ background: c.fill }} />
                  {c.label}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/70">
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Typical lift</p>
          <p className="text-lg font-black text-gray-900">{typicalGrowth > 0 ? `+${typicalGrowth}%` : "N/A"}</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Top-end band</p>
          <p className="text-lg font-black text-gray-900">{formatLpa(topEnd)}</p>
        </div>
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reading</p>
          <p className="text-sm font-bold text-gray-800">Depth pays most</p>
        </div>
      </div>

      <div className="px-2 pb-2 pt-6" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="28%" barGap={5} margin={{ top: 18, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{ fill: "#4b5563" }}
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `Rs ${v}L`}
              tick={{ fill: "#6b7280" }}
              width={48}
              domain={[0, maxVal]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249,250,251,0.85)" }} />
            <Bar dataKey="min" name="Conservative" fill={COLORS.min.fill} radius={[4, 4, 0, 0]} maxBarSize={46} animationDuration={650}>
              <LabelList dataKey="min" position="top" formatter={(value: any) => `Rs ${value}L`} className="fill-gray-600 text-[10px] font-semibold" />
            </Bar>
            <Bar dataKey="avg" name="Typical" fill={COLORS.avg.fill} radius={[4, 4, 0, 0]} maxBarSize={46} animationDuration={800}>
              <LabelList dataKey="avg" position="top" formatter={(value: any) => `Rs ${value}L`} className="fill-gray-700 text-[10px] font-bold" />
            </Bar>
            <Bar dataKey="max" name="Top-end" fill={COLORS.max.fill} radius={[4, 4, 0, 0]} maxBarSize={46} animationDuration={950}>
              <LabelList dataKey="max" position="top" formatter={(value: any) => `Rs ${value}L`} className="fill-gray-700 text-[10px] font-bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid px-6 pb-2" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map((d) => {
          const meta = STAGE_META[d.name] ?? { xp: "", note: "" };
          return (
            <div key={d.name} className="text-center">
              <span className="text-[10px] font-medium text-gray-500">{meta.xp}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-3">
        <p className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Info className="h-3 w-3 shrink-0 text-gray-400" />
          Data based on industry surveys from 2024-2025: Glassdoor, Levels.fyi, LinkedIn Salary Insights.
          Ranges vary by company, city, and experience.
        </p>
      </div>
    </div>
  );
}
