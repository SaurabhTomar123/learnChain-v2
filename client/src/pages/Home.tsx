import { motion } from "framer-motion";
import { lazy, Suspense, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { RoadmapCard } from "@/components/RoadmapCard";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import roadmapsData from "@/data/roadmaps.json";
import { ArrowRight, ArrowUpRight, Layers, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const MarketInsights = lazy(() =>
  import("@/components/MarketInsights").then((mod) => ({ default: mod.MarketInsights }))
);

// Roadmap ID → recommended next roadmap IDs
const NEXT_STEPS: Record<string, string[]> = {
  "frontend-react":              ["fullstack-mern", "devops-aws", "backend-nodejs"],
  "backend-nodejs":              ["fullstack-mern", "devops-aws", "specialized-data-engineering"],
  "backend-java":                ["devops-aws", "specialized-data-engineering", "product-amazon"],
  "fullstack-mern":              ["devops-aws", "ai-ml", "product-flipkart"],
  "devops-aws":                  ["backend-java", "specialized-data-engineering", "product-amazon"],
  "ai-ml":                       ["specialized-data-engineering", "product-google", "backend-java"],
  "specialized-mobile":          ["product-flipkart", "product-razorpay", "backend-nodejs"],
  "specialized-data-engineering":["ai-ml", "devops-aws", "backend-java"],
  "service-tcs":                 ["product-amazon", "frontend-react", "backend-java"],
  "service-infosys":             ["product-flipkart", "devops-aws", "backend-java"],
  "service-cognizant":           ["frontend-react", "backend-nodejs", "devops-aws"],
  "service-wipro":               ["devops-aws", "backend-java", "product-amazon"],
  "service-hcl":                 ["backend-java", "devops-aws", "specialized-data-engineering"],
  "service-tech-mahindra":       ["frontend-react", "backend-nodejs", "devops-aws"],
  "product-amazon":              ["product-google", "ai-ml", "specialized-data-engineering"],
  "product-microsoft":           ["ai-ml", "devops-aws", "specialized-data-engineering"],
  "product-google":              ["ai-ml", "specialized-data-engineering", "devops-aws"],
  "product-flipkart":            ["product-razorpay", "product-phonepe", "ai-ml"],
  "product-phonepe":             ["product-razorpay", "devops-aws", "backend-java"],
  "product-razorpay":            ["product-phonepe", "backend-java", "devops-aws"],
};

// Build reverse map: module id → roadmap id
const MODULE_TO_ROADMAP: Record<string, string> = {};
for (const r of roadmapsData.roadmaps) {
  for (const m of (r.modules as any[])) {
    MODULE_TO_ROADMAP[m.id] = r.id;
  }
}

const ROADMAP_MAP = new Map(roadmapsData.roadmaps.map((r) => [r.id, r]));

const WHY_LABELS: Record<string, string> = {
  "fullstack-mern":              "Natural next step after React",
  "devops-aws":                  "High-demand skill at every company",
  "backend-nodejs":              "Pair with your frontend skills",
  "backend-java":                "Required for most product interviews",
  "specialized-data-engineering":"Data roles are booming in India",
  "ai-ml":                       "AI integration is now a core skill",
  "product-amazon":              "Top target for FAANG aspirants",
  "product-google":              "Highest-paying in India",
  "product-flipkart":            "Best Indian product company to target",
  "product-razorpay":            "Fintech growth role",
  "product-phonepe":             "UPI-scale engineering experience",
  "specialized-mobile":         "Mobile demand is surging",
  "frontend-react":              "Fastest path to frontend jobs",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<typeof roadmapsData.roadmaps>([]);

  useEffect(() => {
    if (!user) { setRecommendations([]); return; }
    supabase
      .from("roadmap_progress")
      .select("roadmap_item_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) { setRecommendations([]); return; }
        const visitedRoadmapIds = new Set<string>(
          (data as any[]).map((row) => MODULE_TO_ROADMAP[row.roadmap_item_id]).filter(Boolean)
        );
        // Collect recommended IDs from NEXT_STEPS, skip already visited
        const suggested = new Set<string>();
        Array.from(visitedRoadmapIds).forEach((rid) => {
          (NEXT_STEPS[rid] ?? []).forEach((next) => {
            if (!visitedRoadmapIds.has(next)) suggested.add(next);
          });
        });
        const recs = Array.from(suggested)
          .slice(0, 4)
          .map((id) => ROADMAP_MAP.get(id))
          .filter(Boolean) as typeof roadmapsData.roadmaps;
        setRecommendations(recs);
      });
  }, [user]);

  const handleRoadmapSelect = (roadmapId: string) => navigate(`/roadmap/${roadmapId}`);

  // Company logo map — Clearbit CDN (free, no token required for common domains)
  const COMPANY_LOGOS: Record<string, string> = {
    "product-amazon":    "https://logo.clearbit.com/amazon.com",
    "product-microsoft": "https://logo.clearbit.com/microsoft.com",
    "product-google":    "https://logo.clearbit.com/google.com",
    "product-flipkart":  "https://logo.clearbit.com/flipkart.com",
    "product-phonepe":   "https://logo.clearbit.com/phonepe.com",
    "product-razorpay":  "https://logo.clearbit.com/razorpay.com",
  };
  // Branded colors for service companies (no public logo CDN coverage)
  const SERVICE_COLORS: Record<string, string> = {
    "service-tcs":           "#1a3a6c",
    "service-infosys":       "#007cc2",
    "service-cognizant":     "#0033a0",
    "service-wipro":         "#a91c8a",
    "service-hcl":           "#0076c0",
    "service-tech-mahindra": "#cc0000",
  };

  const serviceRoadmaps  = roadmapsData.roadmaps.filter((r) => r.category === "Service-Based");
  const productRoadmaps  = roadmapsData.roadmaps.filter((r) => r.category === "Product-Based");
  const specializedRoadmaps = roadmapsData.roadmaps.filter((r) => r.category === "Specialized");

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="LearnChain — Developer Career Roadmaps for India"
        description="Structured, community-driven learning roadmaps for software engineers in India. Covers product companies, service companies, and specialized tech tracks with real salary data."
        keywords="developer roadmap india, software engineer career path, SDE roadmap, TCS Infosys roadmap, backend java roadmap, fullstack mern, devops aws, salary india tech"
        path="/"
      />

      <Header onMenuToggle={setSidebarOpen} />

      <div className="flex min-h-screen">
        <Sidebar
          items={roadmapsData.roadmaps.map((r) => ({ id: r.id, title: r.title, role: r.company || r.title }))}
          onSelect={handleRoadmapSelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">

          {/* ── Hero ── */}
          <section className="hero-gradient pt-20 pb-24 px-8 md:px-16 border-b border-gray-100">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl"
            >
              <h1 className="heading-editorial text-6xl md:text-7xl text-gray-900 mb-8 leading-[1.05]">
                Find your path in tech,{" "}
                <span className="text-[#1a7f4b] underline decoration-green-200 underline-offset-8">
                  wherever you start.
                </span>
              </h1>

              <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
                Structured roadmaps for everyone — from absolute beginners to career switchers.
                Real courses, real salary data, and clear steps tailored for India's tech market.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById("specialized-tracks")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#1a7f4b] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
                >
                  Explore Roadmaps
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  How it works
                </button>
              </div>
            </motion.div>
          </section>

          {/* ── Recommendations (logged-in, has progress) ── */}
          {recommendations.length > 0 && (
            <section className="py-14 px-8 md:px-16 border-b border-gray-100 bg-gradient-to-r from-green-50/60 to-white">
              <div className="max-w-5xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#1a7f4b]" />
                  <span className="text-[#1a7f4b] font-bold text-sm tracking-widest uppercase">Recommended For You</span>
                </div>
                <h2 className="heading-editorial text-3xl mb-8">What to learn next</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {recommendations.map((roadmap, idx) => (
                    <motion.div
                      key={roadmap.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.07 }}
                    >
                      <button
                        onClick={() => handleRoadmapSelect(roadmap.id)}
                        className="w-full text-left p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#1a7f4b]/40 hover:shadow-md transition-all group"
                      >
                        <h3 className="font-bold text-base mb-1 group-hover:text-[#1a7f4b] transition-colors line-clamp-2">
                          {roadmap.title}
                        </h3>
                        <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                          {WHY_LABELS[roadmap.id] ?? roadmap.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            {roadmap.timeline}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1a7f4b] transition-colors" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Why LearnChain ── */}
          <section id="how-it-works" className="py-24 px-8 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl">
              {[
                {
                  title: "Guided Learning",
                  body: "Start from the basics. Hand-picked free and paid resources so you never feel overwhelmed or lost on your journey.",
                },
                {
                  title: "Clear Career Paths",
                  body: "See exactly what to learn for each role — from fresher to senior — with estimated timelines and salary checkpoints.",
                },
                {
                  title: "Free for Everyone",
                  body: "Community-driven knowledge should be accessible. All primary roadmaps are and will remain free.",
                },
              ].map(({ title, body }, idx) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="border-l-4 border-[#1a7f4b] pl-6"
                >
                  <h3 className="heading-editorial text-2xl mb-4">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Specialized Tracks ── */}
          {specializedRoadmaps.length > 0 && (
            <section id="specialized-tracks" className="py-20 px-8 md:px-16 bg-gray-50/50">
              <div className="flex items-end justify-between mb-12 editorial-border pb-6">
                <div>
                  <span className="text-[#1a7f4b] font-bold text-sm tracking-widest uppercase mb-2 block">Step 01</span>
                  <h2 className="heading-editorial text-4xl">Specialized Tracks</h2>
                </div>
              </div>
              <p className="text-gray-500 -mt-6 mb-12 max-w-xl">
                Deep-dive paths for specific roles and technologies. Start from zero — no prior experience needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {specializedRoadmaps.map((roadmap, idx) => (
                  <motion.div
                    key={roadmap.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                  >
                    <RoadmapCard
                      title={roadmap.title}
                      description={roadmap.description}
                      timeline={roadmap.timeline}
                      salaryFresher={roadmap.salaryFresher || "₹4–8 LPA"}
                      salarySenior={roadmap.salarySenior || "₹15–30 LPA"}
                      realityCheck={(roadmap.modules as any[])[0]?.realityCheck}
                      onClick={() => handleRoadmapSelect(roadmap.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ── Market & Salary Insights ── */}
          <Suspense
            fallback={
              <section id="market-insights" className="py-20 px-8 md:px-16 border-t border-gray-100 bg-white">
                <div className="h-80 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse" aria-label="Loading market insights" />
              </section>
            }
          >
            <MarketInsights />
          </Suspense>

          {/* ── Product-Based Companies ── */}
          {productRoadmaps.length > 0 && (
            <section className="py-20 px-8 md:px-16 bg-gray-50/50">
              <div className="flex items-end justify-between mb-12 editorial-border pb-6">
                <div>
                  <span className="text-[#1a7f4b] font-bold text-sm tracking-widest uppercase mb-2 block">Step 02</span>
                  <h2 className="heading-editorial text-4xl">Top Product Companies</h2>
                </div>
              </div>
              <p className="text-gray-500 -mt-6 mb-12 max-w-xl">
                Step-by-step guides for India's top product companies. Great for freshers and career switchers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productRoadmaps.map((roadmap, idx) => (
                  <motion.button
                    key={roadmap.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                    onClick={() => handleRoadmapSelect(roadmap.id)}
                    className="flex items-center gap-5 p-6 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors group text-left"
                  >
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                      {COMPANY_LOGOS[roadmap.id] ? (
                        <img
                          src={COMPANY_LOGOS[roadmap.id]}
                          alt={roadmap.company || roadmap.title}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="font-bold text-sm text-gray-400 group-hover:text-gray-900 transition-colors truncate px-2"
                        style={{ display: COMPANY_LOGOS[roadmap.id] ? "none" : "flex" }}
                      >
                        {(roadmap.company || roadmap.title).slice(0, 6)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg">{roadmap.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{roadmap.description}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-[#1a7f4b] shrink-0 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* ── Service-Based — dark section ── */}
          {serviceRoadmaps.length > 0 && (
            <section id="roadmaps" className="py-20 px-8 md:px-16 bg-gray-900 text-white">
              <div className="flex items-end justify-between mb-12 border-b border-gray-800 pb-6">
                <div>
                  <span className="text-[#1a7f4b] font-bold text-sm tracking-widest uppercase mb-2 block">Step 03</span>
                  <h2 className="heading-editorial text-4xl text-white">Service-Based Companies</h2>
                </div>
              </div>
              <p className="text-gray-400 -mt-6 mb-12 max-w-xl">
                Roadmaps for TCS, Infosys, Cognizant, Wipro, HCL, and more. A solid starting point for your first role.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {serviceRoadmaps.map((roadmap, idx) => (
                  <motion.button
                    key={roadmap.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                    onClick={() => handleRoadmapSelect(roadmap.id)}
                    className="p-6 rounded-2xl border border-gray-800 hover:border-[#1a7f4b] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span
                        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black text-white"
                        style={{ background: SERVICE_COLORS[roadmap.id] ?? "#4b5563" }}
                      >
                        {(roadmap.company || roadmap.title).slice(0, 1)}
                      </span>
                      <h4 className="font-bold text-base group-hover:text-green-400 transition-colors">
                        {roadmap.company || roadmap.title}
                      </h4>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{roadmap.description}</p>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* ── Community Insights ── */}
          <section id="community" className="py-24 px-8 md:px-16 border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-[#1a7f4b]" />
                <span className="text-[#1a7f4b] font-bold text-sm tracking-widest uppercase">Community Insights</span>
              </div>
              <h2 className="heading-editorial text-4xl mb-3">Real experiences from developers</h2>
              <p className="text-gray-500 mb-10 max-w-xl">
                Stories from engineers who've walked the path — honest, unfiltered, and without sponsors.
              </p>

              {/* Empty state — no fake content */}
              <div className="border border-dashed border-gray-200 rounded-2xl p-14 text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-1">Be the first to share a success story</p>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  No fabricated testimonials here. When real developers share their journeys, they'll appear in this section.
                </p>
              </div>

              <div className="border border-[#1a7f4b]/20 rounded-xl p-6 bg-green-50/30 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">Have a real story?</p>
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                  3–4 sentences about your journey. No promotional content. No referral links.
                </p>
                <button
                  onClick={() => navigate("/trending")}
                  className="bg-[#1a7f4b] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#15653d] transition-colors"
                >
                  Share on Trending
                </button>
              </div>
            </div>
          </section>

          {/* ── CTA — full forest green banner ── */}
          <section id="resources" className="px-8 md:px-16 py-12">
            <div className="bg-[#1a7f4b] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#15653d] rounded-full -mr-32 -mt-32 opacity-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#165c38] rounded-full -ml-24 -mb-24 opacity-20 pointer-events-none" />

              <h2 className="heading-editorial text-4xl md:text-5xl text-white mb-4 relative z-10">
                Your tech journey starts here.
              </h2>
              <p className="text-green-100 text-lg mb-3 max-w-xl mx-auto leading-relaxed relative z-10">
                Join a global community of ~27 million developers.
              </p>
              {/* Honest stat with source note */}
              <p className="text-green-200/70 text-xs mb-10 relative z-10">
                ~27M developers worldwide · SlashData / Evans Data Corporation · real data, not inflated numbers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button
                  onClick={() => document.getElementById("specialized-tracks")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white text-[#1a7f4b] px-10 py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
                >
                  Get Started — Free
                </button>
                <button
                  onClick={() => document.getElementById("market-insights")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#15653d]/50 backdrop-blur-md text-white border border-green-500/50 px-10 py-4 rounded-xl font-bold hover:bg-[#15653d] transition-colors"
                >
                  View Salary Data
                </button>
              </div>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="py-12 px-8 md:px-16 border-t border-gray-100 bg-white w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-[#1a7f4b] rounded flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span
                    className="font-light tracking-widest text-xl text-gray-900"
                    style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}
                  >
                    LearnChain
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Community-driven roadmaps for Indian software engineers. Built openly, updated regularly.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Service-Based</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  {serviceRoadmaps.slice(0, 4).map((r) => (
                    <li key={r.id}>
                      <button onClick={() => handleRoadmapSelect(r.id)} className="hover:text-[#1a7f4b] transition-colors text-left">
                        {r.company || r.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Product-Based</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  {productRoadmaps.slice(0, 4).map((r) => (
                    <li key={r.id}>
                      <button onClick={() => handleRoadmapSelect(r.id)} className="hover:text-[#1a7f4b] transition-colors text-left">
                        {r.company || r.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Resources</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="/#market-insights" className="hover:text-[#1a7f4b] transition-colors">Salary Data</a></li>
                  <li><a href="/#community" className="hover:text-[#1a7f4b] transition-colors">Community</a></li>
                  <li><a href="/#how-it-works" className="hover:text-[#1a7f4b] transition-colors">About</a></li>
                  <li><a href="https://github.com/anthropics/claude-code/issues" target="_blank" rel="noreferrer" className="hover:text-[#1a7f4b] transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">© 2026 LearnChain. Built for developers in India.</p>
              <p className="text-xs text-gray-400">
                Salary data sourced from Levels.fyi, LinkedIn, Glassdoor, NASSCOM &amp; Stack Overflow Survey.
                All figures are indicative.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
