import sharp from "sharp";
import { createRequire } from "module";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const _require = createRequire(import.meta.url);
const { roadmaps } = _require("../client/src/data/roadmaps.json") as {
  roadmaps: Array<{
    id: string;
    title: string;
    description: string;
    category?: string;
    salaryFresher?: string;
    salarySenior?: string;
  }>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../client/public/og");
mkdirSync(outDir, { recursive: true });

interface Theme {
  bg: string;
  bg2: string;
  accent: string;
  badge: string;
}

const themes: Record<string, Theme> = {
  service:  { bg: "#0f172a", bg2: "#0f1923", accent: "#3b82f6", badge: "#1e3a5f" },
  product:  { bg: "#1a0533", bg2: "#0f0f1a", accent: "#a855f7", badge: "#3b0764" },
  frontend: { bg: "#1c0a00", bg2: "#0f1000", accent: "#f97316", badge: "#7c2d12" },
  devops:   { bg: "#1c1000", bg2: "#0f0f00", accent: "#f59e0b", badge: "#451a03" },
  ai:       { bg: "#0c0a1e", bg2: "#0f0f1f", accent: "#818cf8", badge: "#1e1b4b" },
  default:  { bg: "#0a1628", bg2: "#0f1923", accent: "#10b981", badge: "#064e3b" },
};

function getTheme(id: string, category?: string): Theme {
  if (category?.toLowerCase().includes("service")) return themes.service;
  if (id.startsWith("product-")) return themes.product;
  if (id.startsWith("frontend-")) return themes.frontend;
  if (id.startsWith("devops-")) return themes.devops;
  if (id === "ai-ml") return themes.ai;
  return themes.default;
}

function escSvg(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text: string, maxLen = 28): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLen) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function dots(accent: string): string {
  const rows = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) =>
      `<circle cx="${c * 80 + 40}" cy="${r * 80 + 40}" r="2" fill="${accent}"/>`
    ).join("")
  ).join("");
  return `<g opacity="0.07">${rows}</g>`;
}

function buildSvg(r: (typeof roadmaps)[0]): string {
  const theme = getTheme(r.id, r.category);
  const titleLines = wrapText(r.title, 30);
  const baseY = 260;
  const lineH = 68;
  const titleY = baseY - ((titleLines.length - 1) * lineH) / 2;

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleY + i * lineH}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="60" fill="#ffffff">${escSvg(line)}</text>`
    )
    .join("\n  ");

  const salary = r.salaryFresher
    ? `${r.salaryFresher} fresher  •  ${r.salarySenior} senior`
    : "Step-by-step learning roadmap";

  const badgeW = (r.category ?? "Technology").length * 10 + 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.bg}"/>
      <stop offset="100%" style="stop-color:${theme.bg2}"/>
    </linearGradient>
    <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${theme.accent}"/>
      <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:0.5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="5" fill="url(#ac)"/>
  ${dots(theme.accent)}
  <circle cx="1080" cy="315" r="300" fill="${theme.accent}" opacity="0.05"/>
  <circle cx="1080" cy="315" r="180" fill="${theme.accent}" opacity="0.05"/>
  <text x="80" y="95" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" fill="${theme.accent}" letter-spacing="3">LEARNCHAIN</text>
  <rect x="78" y="112" width="${badgeW}" height="30" rx="6" fill="${theme.badge}"/>
  <text x="94" y="132" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="${theme.accent}" font-weight="600">${escSvg(r.category ?? "Technology")}</text>
  ${titleSvg}
  <text x="80" y="${titleY + titleLines.length * lineH + 14}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#94a3b8">${escSvg(salary)}</text>
  <rect x="0" y="590" width="1200" height="40" fill="${theme.accent}" opacity="0.10"/>
  <text x="80" y="617" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#64748b">learnchain.in</text>
  <text x="1120" y="617" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="${theme.accent}" text-anchor="end">Developer Roadmaps for India</text>
</svg>`;
}

async function main() {
  console.log(`Generating OG images → ${outDir}`);

  for (const r of roadmaps) {
    const svg = buildSvg(r);
    const outPath = path.join(outDir, `${r.id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    process.stdout.write(`  ✓ ${r.id}.png\n`);
  }

  // Homepage OG cover
  const homeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a1628"/>
      <stop offset="100%" style="stop-color:#0f1923"/>
    </linearGradient>
    <linearGradient id="ac" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="5" fill="url(#ac)"/>
  ${dots("#10b981")}
  <circle cx="1080" cy="315" r="300" fill="#10b981" opacity="0.05"/>
  <circle cx="1080" cy="315" r="180" fill="#10b981" opacity="0.05"/>
  <text x="80" y="95" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" fill="#10b981" letter-spacing="3">LEARNCHAIN</text>
  <text x="80" y="230" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="72" fill="#ffffff">Developer Career</text>
  <text x="80" y="310" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="72" fill="#ffffff">Roadmaps</text>
  <text x="80" y="385" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="60" fill="#10b981">for India</text>
  <text x="80" y="455" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#94a3b8">Step-by-step paths with real salary data for Indian engineers</text>
  <rect x="0" y="590" width="1200" height="40" fill="#10b981" opacity="0.10"/>
  <text x="80" y="617" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#64748b">learnchain.in</text>
  <text x="1120" y="617" font-family="Arial, Helvetica, sans-serif" font-size="19" fill="#10b981" text-anchor="end">20+ Developer Roadmaps</text>
</svg>`;

  const coverPath = path.resolve(outDir, "../og-cover.png");
  await sharp(Buffer.from(homeSvg)).png().toFile(coverPath);
  process.stdout.write("  ✓ og-cover.png\n");
  console.log("Done!");
}

main().catch(console.error);
