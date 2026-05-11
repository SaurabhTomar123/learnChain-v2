import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Info, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

const FOREST = "#1a7f4b";
const BLUE = "#2563eb";
const AMBER = "#b45309";
const MUTED = "#64748b";

const TREND_DATA = [
  { year: "2018", junior: 4.5, mid: 10, senior: 22 },
  { year: "2019", junior: 5, mid: 11, senior: 24 },
  { year: "2020", junior: 5, mid: 11, senior: 24 },
  { year: "2021", junior: 7, mid: 16, senior: 35 },
  { year: "2022", junior: 9, mid: 20, senior: 45 },
  { year: "2023", junior: 7, mid: 17, senior: 38 },
  { year: "2024", junior: 7.5, mid: 18, senior: 40 },
  { year: "2025*", junior: 8, mid: 20, senior: 44 },
  { year: "2026*", junior: 9, mid: 22, senior: 48 },
  { year: "2027*", junior: 9.5, mid: 24, senior: 53 },
  { year: "2028*", junior: 10, mid: 26, senior: 58 },
];

const DOMAIN_DATA = [
  { domain: "AI / ML", junior: 12, mid: 28, senior: 55, growth: 28, color: FOREST },
  { domain: "Cloud / DevOps", junior: 9, mid: 22, senior: 45, growth: 22, color: BLUE },
  { domain: "Data Engineering", junior: 9, mid: 20, senior: 42, growth: 20, color: "#7c3aed" },
  { domain: "Cybersecurity", junior: 8, mid: 18, senior: 38, growth: 19, color: "#dc2626" },
  { domain: "Backend Java", junior: 7, mid: 16, senior: 35, growth: 14, color: AMBER },
  { domain: "Backend Node.js", junior: 6, mid: 15, senior: 32, growth: 16, color: "#ea580c" },
  { domain: "Full-Stack MERN", junior: 6, mid: 14, senior: 30, growth: 15, color: "#0891b2" },
  { domain: "Mobile", junior: 6, mid: 14, senior: 30, growth: 18, color: "#9333ea" },
  { domain: "Frontend React", junior: 5, mid: 13, senior: 28, growth: 14, color: "#db2777" },
];

const COMPANY_TYPE_DATA = [
  { type: "Service", label: "TCS / Infosys", junior: 4.5, mid: 9, senior: 20 },
  { type: "Startup", label: "Series A-B", junior: 7, mid: 16, senior: 35 },
  { type: "Unicorn", label: "Swiggy / CRED", junior: 10, mid: 22, senior: 50 },
  { type: "Tier-1 Product", label: "MAANG", junior: 15, mid: 35, senior: 80 },
];

const FORECAST_DATA = [
  { domain: "AI / ML", salary2024: 28, salary2026: 36, salary2028: 48, salary2030: 62 },
  { domain: "Cloud / DevOps", salary2024: 22, salary2026: 28, salary2028: 35, salary2030: 44 },
  { domain: "Data Engineering", salary2024: 20, salary2026: 25, salary2028: 31, salary2030: 39 },
  { domain: "Backend Java", salary2024: 16, salary2026: 20, salary2028: 24, salary2030: 29 },
  { domain: "Backend Node", salary2024: 15, salary2026: 19, salary2028: 23, salary2030: 27 },
  { domain: "Frontend React", salary2024: 13, salary2026: 16, salary2028: 19, salary2030: 23 },
];

function formatLpa(value: number) {
  return `Rs ${value}L`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl">
      <p className="mb-2 font-black text-gray-900">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="mb-1.5 flex items-center justify-between gap-8 last:mb-0">
          <span className="text-xs font-medium text-gray-600">{p.name}</span>
          <span className="text-xs font-black" style={{ color: p.color }}>
            {formatLpa(p.value)}
          </span>
        </div>
      ))}
      {String(label).includes("*") && <p className="mt-2 text-[10px] text-gray-500">Projected estimate</p>}
    </div>
  );
}

function SectionHeader({ label, title, reading }: { label: string; title: string; reading: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b-2 border-gray-900 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#1a7f4b]">{label}</span>
        <h3 className="heading-editorial text-2xl text-gray-900">{title}</h3>
      </div>
      <p className="max-w-md text-sm font-medium text-gray-600">{reading}</p>
    </div>
  );
}

function ChartPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 ${className}`}
      style={{ boxShadow: "0 10px 28px -20px rgba(17,24,39,0.45)" }}
    >
      {children}
    </div>
  );
}

export function MarketInsights() {
  const seniorLift = Math.round(((TREND_DATA[10].senior - TREND_DATA[0].senior) / TREND_DATA[0].senior) * 100);
  const topDomain = DOMAIN_DATA[0];

  return (
    <section id="market-insights" className="border-t border-gray-100 bg-white px-8 py-20 md:px-16">
      <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-2 block text-sm font-bold uppercase tracking-widest text-[#1a7f4b]">Market Intelligence</span>
          <h2 className="heading-editorial text-4xl text-gray-900">Salary & Demand Dashboard</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
            Indian base CTC estimates in LPA. Use this to compare market direction, not as a guaranteed offer number.
          </p>
        </div>
        <div className="text-left text-[11px] text-gray-500 lg:text-right">
          <div className="mb-1 flex items-center gap-1.5 lg:justify-end">
            <Info className="h-3.5 w-3.5" />
            Levels.fyi · LinkedIn Salary · NASSCOM · Stack Overflow Survey
          </div>
          <a className="font-semibold text-[#1a7f4b] hover:underline" href="mailto:hello@learnchain.in?subject=Salary%20data%20correction">
            Report outdated data
          </a>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Senior market lift</p>
          <p className="mt-1 text-3xl font-black text-gray-900">+{seniorLift}%</p>
          <p className="mt-1 text-xs text-gray-600">2018 to 2028 projected senior median</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Highest domain band</p>
          <p className="mt-1 text-3xl font-black text-gray-900">{formatLpa(topDomain.senior)}</p>
          <p className="mt-1 text-xs text-gray-600">{topDomain.domain} senior estimate</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Best reading</p>
          <p className="mt-1 text-lg font-black text-gray-900">Depth beats breadth</p>
          <p className="mt-1 text-xs text-gray-600">AI, cloud, data, and security carry the strongest premiums.</p>
        </div>
      </div>

      <div className="mb-16">
        <SectionHeader
          label="Trend"
          title="Salary progression by experience"
          reading="The 2021-2022 spike cools down in 2023, then senior compensation resumes a steadier climb."
        />
        <ChartPanel>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={TREND_DATA} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} dy={8} tick={{ fill: "#4b5563" }} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs ${v}L`} width={52} tick={{ fill: "#4b5563" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Line type="monotone" dataKey="junior" name="Junior" stroke={MUTED} strokeWidth={2.25} dot={false} activeDot={{ r: 4 }} animationDuration={650} />
              <Line type="monotone" dataKey="mid" name="Mid-level" stroke={BLUE} strokeWidth={2.75} dot={false} activeDot={{ r: 4 }} animationDuration={800} />
              <Line type="monotone" dataKey="senior" name="Senior" stroke={FOREST} strokeWidth={3.25} dot={false} activeDot={{ r: 5 }} animationDuration={950} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="mb-16">
        <SectionHeader
          label="Role ranking"
          title="2026 domain opportunity map"
          reading="Read left to right: mid-level salary sets the practical switching target; senior salary shows upside."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <ChartPanel className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={390}>
              <BarChart data={DOMAIN_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `Rs ${v}L`} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="domain" type="category" width={116} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "#374151", fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mid" name="Mid-level" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {DOMAIN_DATA.map((entry) => <Cell key={entry.domain} fill={entry.color} />)}
                </Bar>
                <Bar dataKey="senior" name="Senior" fill="#94a3b8" radius={[0, 4, 4, 0]} animationDuration={950} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <div className="space-y-3 lg:col-span-2">
            {DOMAIN_DATA.slice(0, 5).map((d, index) => (
              <div key={d.domain} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Rank {index + 1}</p>
                    <h4 className="font-black text-gray-900">{d.domain}</h4>
                  </div>
                  <span className="rounded-md px-2 py-1 text-xs font-black" style={{ background: `${d.color}15`, color: d.color }}>
                    +{d.growth}% est.
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Mid {formatLpa(d.mid)} · Senior {formatLpa(d.senior)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-16">
        <SectionHeader
          label="Company type"
          title="Compensation changes with company tier"
          reading="The biggest jump is not junior salary; it is the senior ceiling at product and Tier-1 companies."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartPanel>
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={COMPANY_TYPE_DATA} margin={{ top: 12, right: 16, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="type" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs ${v}L`} width={52} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="junior" name="Junior" fill={MUTED} radius={[4, 4, 0, 0]} animationDuration={650} />
                <Bar dataKey="mid" name="Mid-level" fill={BLUE} radius={[4, 4, 0, 0]} animationDuration={800} />
                <Bar dataKey="senior" name="Senior" fill={FOREST} radius={[4, 4, 0, 0]} animationDuration={950} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <div className="overflow-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Tier</th>
                  <th className="px-4 py-3 text-right font-bold">Junior</th>
                  <th className="px-4 py-3 text-right font-bold">Mid</th>
                  <th className="px-4 py-3 text-right font-bold">Senior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPANY_TYPE_DATA.map((row) => (
                  <tr key={row.type} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{row.type}</p>
                      <p className="text-xs text-gray-500">{row.label}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">{formatLpa(row.junior)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">{formatLpa(row.mid)}</td>
                    <td className="px-4 py-3 text-right font-black text-[#1a7f4b]">{formatLpa(row.senior)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader
          label="Forecast"
          title="2026-2030 salary projection"
          reading="Forecasts are directional. Use them to choose skills, not to assume a fixed compensation outcome."
        />
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-900">
            These are CAGR-based projections from historical salary movement. Real outcomes depend on hiring cycle,
            city, company tier, interview performance, and negotiation.
          </p>
        </div>
        <ChartPanel>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={FORECAST_DATA} margin={{ top: 12, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="domain" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" dy={10} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs ${v}L`} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="salary2024" name="2024 actual" fill="#cbd5e1" radius={[4, 4, 0, 0]} animationDuration={600} />
              <Bar dataKey="salary2026" name="2026 forecast" fill="#93c5fd" radius={[4, 4, 0, 0]} animationDuration={750} />
              <Bar dataKey="salary2028" name="2028 forecast" fill="#60a5fa" radius={[4, 4, 0, 0]} animationDuration={900} />
              <Bar dataKey="salary2030" name="2030 forecast" fill={FOREST} radius={[4, 4, 0, 0]} animationDuration={1050} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </section>
  );
}
