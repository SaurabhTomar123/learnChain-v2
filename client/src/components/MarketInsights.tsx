import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Info, AlertCircle } from "lucide-react";

/*
 * Salary data based on publicly available reports:
 * Levels.fyi India data, LinkedIn Salary Insights, Glassdoor India,
 * NASSCOM Annual Tech Report, Stack Overflow Developer Survey.
 * Ranges reflect base CTC in INR LPA at Indian product & service companies.
 * 2026–2030 are projections using CAGR derived from 2018–2025 observed data.
 * All figures are approximate. Actual salaries vary by company, city,
 * and individual negotiation.
 */

const TREND_DATA = [
  { year: "2018", junior: 4.5, mid: 10, senior: 22 },
  { year: "2019", junior: 5,   mid: 11, senior: 24 },
  { year: "2020", junior: 5,   mid: 11, senior: 24 },
  { year: "2021", junior: 7,   mid: 16, senior: 35 },
  { year: "2022", junior: 9,   mid: 20, senior: 45 },
  { year: "2023", junior: 7,   mid: 17, senior: 38 },
  { year: "2024", junior: 7.5, mid: 18, senior: 40 },
  { year: "2025*", junior: 8,  mid: 20, senior: 44 },
  { year: "2026*", junior: 9,  mid: 22, senior: 48 },
  { year: "2027*", junior: 9.5,mid: 24, senior: 53 },
  { year: "2028*", junior: 10, mid: 26, senior: 58 },
];

const DOMAIN_DATA = [
  { domain: "AI / ML",           junior: 12, mid: 28, senior: 55, growth: 28, skills: ["Python", "PyTorch / TF", "MLOps"],       color: "#1a7f4b" },
  { domain: "Cloud / DevOps",    junior: 9,  mid: 22, senior: 45, growth: 22, skills: ["AWS/GCP/Azure", "Kubernetes", "Terraform"], color: "#2563eb" },
  { domain: "Data Engineering",  junior: 9,  mid: 20, senior: 42, growth: 20, skills: ["Spark", "Kafka", "dbt"],                  color: "#7c3aed" },
  { domain: "Backend (Java)",    junior: 7,  mid: 16, senior: 35, growth: 14, skills: ["Spring Boot", "Microservices", "SQL"],     color: "#d97706" },
  { domain: "Backend (Node.js)", junior: 6,  mid: 15, senior: 32, growth: 16, skills: ["Node / Express", "REST/GraphQL", "Redis"], color: "#ea580c" },
  { domain: "Full-Stack (MERN)", junior: 6,  mid: 14, senior: 30, growth: 15, skills: ["React", "Node.js", "MongoDB"],            color: "#0891b2" },
  { domain: "Frontend (React)",  junior: 5,  mid: 13, senior: 28, growth: 14, skills: ["React", "TypeScript", "Performance"],     color: "#db2777" },
  { domain: "Mobile (RN/Flutter)",junior: 6, mid: 14, senior: 30, growth: 18, skills: ["Flutter/RN", "Native APIs", "CI/CD"],    color: "#9333ea" },
  { domain: "Cybersecurity",     junior: 8,  mid: 18, senior: 38, growth: 19, skills: ["Pentest", "Cloud Sec", "Zero-Trust"],    color: "#dc2626" },
];

/* Java vs Node.js */
const JAVA_NODE_DATA = [
  { year: "2020", java: 11, node: 10 },
  { year: "2021", java: 16, node: 15 },
  { year: "2022", java: 20, node: 19 },
  { year: "2023", java: 17, node: 16 },
  { year: "2024", java: 18, node: 17 },
  { year: "2025*", java: 20, node: 19 },
  { year: "2026*", java: 22, node: 21 },
];

/* React vs Vue */
const REACT_VUE_DATA = [
  { year: "2021", react: 12, vue: 10 },
  { year: "2022", react: 15, vue: 11 },
  { year: "2023", react: 13, vue: 10 },
  { year: "2024", react: 14, vue: 10.5 },
  { year: "2025*", react: 16, vue: 11 },
  { year: "2026*", react: 18, vue: 12 },
];

/* .NET vs Go */
const DOTNET_GO_DATA = [
  { year: "2021", dotnet: 14, go: 16 },
  { year: "2022", dotnet: 17, go: 20 },
  { year: "2023", dotnet: 15, go: 18 },
  { year: "2024", dotnet: 16, go: 20 },
  { year: "2025*", dotnet: 18, go: 23 },
  { year: "2026*", dotnet: 20, go: 26 },
];

/* AWS vs Azure */
const AWS_AZURE_DATA = [
  { year: "2021", aws: 16, azure: 14 },
  { year: "2022", aws: 22, azure: 19 },
  { year: "2023", aws: 20, azure: 18 },
  { year: "2024", aws: 22, azure: 20 },
  { year: "2025*", aws: 25, azure: 23 },
  { year: "2026*", aws: 28, azure: 26 },
];

/* Product vs Startup vs Service */
const COMPANY_TYPE_DATA = [
  { type: "Service (TCS/Infosys)", junior: 4.5, mid: 9, senior: 20 },
  { type: "Startup (Series A-B)", junior: 7,   mid: 16, senior: 35 },
  { type: "Unicorn (Swiggy/CRED)", junior: 10,  mid: 22, senior: 50 },
  { type: "MAANG / Tier-1 Product",junior: 15,  mid: 35, senior: 80 },
];

/* 2026–2030 forecast */
const FORECAST_DATA = [
  { domain: "AI / ML",         salary2024: 28, salary2026: 36, salary2028: 48, salary2030: 62, cagr: "17%" },
  { domain: "Cloud / DevOps",  salary2024: 22, salary2026: 28, salary2028: 35, salary2030: 44, cagr: "14%" },
  { domain: "Data Engineering",salary2024: 20, salary2026: 25, salary2028: 31, salary2030: 39, cagr: "14%" },
  { domain: "Backend (Java)",  salary2024: 16, salary2026: 20, salary2028: 24, salary2030: 29, cagr: "11%" },
  { domain: "Backend (Node)",  salary2024: 15, salary2026: 19, salary2028: 23, salary2030: 27, cagr: "12%" },
  { domain: "Frontend (React)",salary2024: 13, salary2026: 16, salary2028: 19, salary2030: 23, cagr: "12%" },
];

const FOREST = "#1a7f4b";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-sm">
      <p className="font-bold text-gray-900 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>₹{p.value} LPA</strong>
        </p>
      ))}
      {label?.includes("*") && (
        <p className="text-[10px] text-gray-400 mt-2">* projected estimate</p>
      )}
    </div>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-3 editorial-border pb-6">
      <span className="text-[#1a7f4b] font-bold text-xs tracking-widest uppercase mb-2 block">{label}</span>
      <h3 className="heading-editorial text-2xl">{title}</h3>
    </div>
  );
}

export function MarketInsights() {
  return (
    <section id="market-insights" className="py-20 px-8 md:px-16 border-t border-gray-100 bg-white">

      {/* Header */}
      <div className="flex items-end justify-between mb-3 editorial-border pb-6">
        <div>
          <span className="text-[#1a7f4b] font-bold text-sm tracking-widest uppercase mb-2 block">Data-Driven</span>
          <h2 className="heading-editorial text-4xl">Market & Salary Insights</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
          <Info className="w-3.5 h-3.5" />
          Sources: Levels.fyi · LinkedIn Salary · NASSCOM · Stack Overflow Survey
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-16 max-w-2xl">
        Salaries below are <strong>Indian base CTC in LPA (₹ lakhs per annum)</strong> for software engineers
        at product &amp; service companies. Ranges vary by city, company tier, and negotiation.
        Projections (marked *) are estimates based on observed CAGR.
      </p>

      {/* ── 1. Salary Trends 2018–2028 ── */}
      <div className="mb-20">
        <SectionHeader label="Historical + Projected" title="Salary Trends 2018 – 2028" />
        <p className="text-gray-400 text-xs mb-6">Median base CTC (₹ LPA) · Junior = 0–2 yrs · Mid = 3–6 yrs · Senior = 7+ yrs</p>
        <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={TREND_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} formatter={(v) => <span className="text-gray-600 font-medium">{v}</span>} />
              <Line type="monotone" dataKey="junior" name="Junior"     stroke="#9ca3af" strokeWidth={2}   dot={false} />
              <Line type="monotone" dataKey="mid"    name="Mid-level"  stroke="#2563eb" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="senior" name="Senior"     stroke={FOREST}  strokeWidth={3}   dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 2. 2024 Salary by Domain ── */}
      <div className="mb-20">
        <SectionHeader label="By Role" title="2024 Salary by Domain" />
        <p className="text-gray-400 text-xs mb-6">Median CTC at 3–5 years experience · Growth = estimated CAGR 2025–2030</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOMAIN_DATA.map((d) => (
            <div key={d.domain} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03)" }}>
              <div className="flex items-start justify-between mb-3">
                <span className="font-bold text-sm text-gray-900">{d.domain}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${d.color}15`, color: d.color }}>
                  +{d.growth}% est.
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[["Junior", d.junior], ["Mid", d.mid], ["Senior", d.senior]].map(([label, val]) => (
                  <div key={label as string} className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-900">₹{val}L</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {d.skills.map((s) => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded border" style={{ borderColor: `${d.color}40`, color: d.color, background: `${d.color}08` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Company Type Comparison ── */}
      <div className="mb-20">
        <SectionHeader label="Where you work matters" title="Service vs Startup vs Product — Salary by Company Type" />
        <p className="text-gray-400 text-xs mb-6">Mid-level median CTC (₹ LPA) · 3–5 years experience · varies by role and location</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={COMPANY_TYPE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="type" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" dy={10} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="junior" name="Junior"  fill="#9ca3af" radius={[4,4,0,0]} />
                <Bar dataKey="mid"    name="Mid"     fill="#2563eb" radius={[4,4,0,0]} />
                <Bar dataKey="senior" name="Senior"  fill={FOREST}  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Factor</th>
                  <th className="px-4 py-3 text-center font-bold">Service</th>
                  <th className="px-4 py-3 text-center font-bold text-orange-600">Startup</th>
                  <th className="px-4 py-3 text-center font-bold text-[#1a7f4b]">Unicorn / MAANG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {[
                  ["Mid salary (2024)",     "₹9 LPA avg",   "₹16 LPA avg",  "₹22–35 LPA"],
                  ["Job security",          "High ↑",       "Moderate →",   "High ↑"],
                  ["Learning pace",         "Slow →",       "Fast ↑",       "Intense ↑↑"],
                  ["Work-life balance",     "Good ✓",       "Variable",     "Challenging"],
                  ["ESOPs / equity",        "Rare",         "Common",       "Significant"],
                  ["Interview difficulty",  "Low–Medium",   "Medium–High",  "Very High"],
                  ["Best for",              "First job",    "Growth phase", "Peak earnings"],
                ].map(([factor, svc, startup, product]) => (
                  <tr key={factor as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">{factor}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{svc}</td>
                    <td className="px-4 py-3 text-center text-orange-700">{startup}</td>
                    <td className="px-4 py-3 text-center text-[#1a7f4b]">{product}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-gray-400 px-4 py-2 border-t border-gray-50">
              Sources: Glassdoor India · LinkedIn Salary Insights · AngelList India · Levels.fyi 2024
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Domain Comparison Pairs ── */}
      <div className="mb-20">
        <SectionHeader label="Head to Head" title="Domain Comparisons" />
        <p className="text-gray-400 text-xs mb-8">Mid-level median CTC (₹ LPA) · 3–5 years experience</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Java vs Node.js */}
          <div>
            <p className="font-bold text-sm text-gray-700 mb-3">Java / Spring vs Node.js</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={JAVA_NODE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} dy={6} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="java" name="Java/Spring" stroke="#d97706" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="node" name="Node.js"     stroke="#ea580c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* React vs Vue */}
          <div>
            <p className="font-bold text-sm text-gray-700 mb-3">React vs Vue (Frontend)</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={REACT_VUE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} dy={6} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="react" name="React"  stroke="#0891b2" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="vue"   name="Vue.js" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AWS vs Azure */}
          <div>
            <p className="font-bold text-sm text-gray-700 mb-3">AWS vs Azure (Cloud)</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={AWS_AZURE_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} dy={6} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="aws"   name="AWS"   stroke="#ea580c" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="azure" name="Azure" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Comparison tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Java vs Node table */}
          <ComparisonTable
            leftLabel="Java / Spring" rightLabel="Node.js"
            leftColor="#d97706" rightColor="#ea580c"
            rows={[
              ["2024 Mid salary",    "₹18 LPA",      "₹17 LPA"],
              ["2026 forecast",      "₹22 LPA",      "₹21 LPA"],
              ["Learning curve",     "Steeper",       "Moderate"],
              ["Job openings",       "Very High",     "High"],
              ["Best for",           "Enterprise/Banks","Startups/APIs"],
              ["2030 demand",        "Stable ↔",     "Growing ↑"],
            ]}
          />

          {/* React vs Vue table */}
          <ComparisonTable
            leftLabel="React" rightLabel="Vue.js"
            leftColor="#0891b2" rightColor="#16a34a"
            rows={[
              ["2024 Mid salary",    "₹14 LPA",       "₹11 LPA"],
              ["2026 forecast",      "₹18 LPA",       "₹12 LPA"],
              ["Learning curve",     "Moderate",      "Easy"],
              ["India job openings", "Very High (78%)", "Low (8%)"],
              ["Best for",           "Startups / SaaS","Vue-specific roles"],
              ["2030 demand",        "Dominant ↑↑",   "Niche →"],
            ]}
          />

          {/* AWS vs Azure table */}
          <ComparisonTable
            leftLabel="AWS" rightLabel="Azure"
            leftColor="#ea580c" rightColor="#2563eb"
            rows={[
              ["2024 Mid salary",    "₹22 LPA",        "₹20 LPA"],
              ["2026 forecast",      "₹28 LPA",        "₹26 LPA"],
              ["Market share (India)","~60%",          "~25%"],
              ["Best for",           "Startups/Unicorns","Enterprise/Banks"],
              ["Cert value (India)", "SAA-C03 ★★★★",   "AZ-900/104 ★★★"],
              ["2030 demand",        "Very Strong ↑",   "Growing ↑"],
            ]}
          />
        </div>

        {/* .NET vs Go — wider row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="font-bold text-sm text-gray-700 mb-3">.NET Core vs Go (Backend)</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={DOTNET_GO_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" fontSize={10} tickLine={false} axisLine={false} dy={6} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={32} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="dotnet" name=".NET Core" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="go"     name="Go (Golang)" stroke="#0891b2" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ComparisonTable
            leftLabel=".NET Core" rightLabel="Go (Golang)"
            leftColor="#7c3aed" rightColor="#0891b2"
            rows={[
              ["2024 Mid salary",    "₹16 LPA",        "₹20 LPA"],
              ["2026 forecast",      "₹20 LPA",        "₹26 LPA"],
              ["Learning curve",     "Moderate",        "Moderate-Hard"],
              ["India job openings", "Medium (banks/MNCs)", "Low but growing"],
              ["Best for",           "Microsoft stack", "High-perf services"],
              ["2030 demand",        "Stable ↔",       "Strong growth ↑"],
            ]}
          />
        </div>
      </div>

      {/* ── 5. Future Predictions 2026–2030 ── */}
      <div className="mb-8">
        <SectionHeader label="Forecast" title="Salary Projections 2026–2030" />
        <div className="flex items-center gap-2 mb-6">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="text-xs text-gray-400">
            All figures below are <strong>forecasts</strong> based on 2018–2025 CAGR. Actual salaries depend on
            hiring climate, company tier, and individual skills. Not a guarantee.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={FORECAST_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="domain" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" dy={10} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="salary2024" name="2024 (actual)"  fill="#e5e7eb" radius={[4,4,0,0]} />
              <Bar dataKey="salary2026" name="2026 (forecast)" fill="#86efac" radius={[4,4,0,0]} />
              <Bar dataKey="salary2028" name="2028 (forecast)" fill="#4ade80" radius={[4,4,0,0]} />
              <Bar dataKey="salary2030" name="2030 (forecast)" fill={FOREST}  radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🤖", title: "AI/ML & Data roles",   cagr: "~17%", body: "Expected +17% CAGR through 2030. Highest-paying domain for mid-level engineers in India — demand significantly outpaces supply." },
            { icon: "☁️", title: "Cloud & DevOps",       cagr: "~14%", body: "Multi-cloud certifications (AWS + GCP) add ₹3–6 LPA premium at senior level. Demand outpacing supply in most Indian cities." },
            { icon: "🔒", title: "Cybersecurity",        cagr: "~15%", body: "Projected shortage of 3.5M professionals globally by 2025 (ISC²). India under-indexed — persistent upside for early movers." },
          ].map(({ icon, title, cagr, body }) => (
            <div key={title} className="border border-gray-100 rounded-xl p-5 bg-[#fcfcfc]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-[#1a7f4b] bg-green-50 px-2 py-0.5 rounded-full">{cagr} CAGR*</span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-2">{title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

function ComparisonTable({ leftLabel, rightLabel, leftColor, rightColor, rows }: {
  leftLabel: string; rightLabel: string;
  leftColor: string; rightColor: string;
  rows: [string, string, string][];
}) {
  return (
    <div className="overflow-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase tracking-widest">
          <tr>
            <th className="px-3 py-2.5 text-left font-bold">Factor</th>
            <th className="px-3 py-2.5 text-center font-bold" style={{ color: leftColor }}>{leftLabel}</th>
            <th className="px-3 py-2.5 text-center font-bold" style={{ color: rightColor }}>{rightLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(([factor, left, right]) => (
            <tr key={factor} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5 font-medium text-gray-700">{factor}</td>
              <td className="px-3 py-2.5 text-center" style={{ color: leftColor }}>{left}</td>
              <td className="px-3 py-2.5 text-center" style={{ color: rightColor }}>{right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
