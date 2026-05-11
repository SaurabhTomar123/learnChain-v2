import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);
const roadmapsData = _require("../client/src/data/roadmaps.json") as {
  roadmaps: Array<{
    id: string;
    title: string;
    description: string;
    category?: string;
    salaryFresher?: string;
    salarySenior?: string;
    timeline?: string;
    modules?: Array<{ id: string; title: string; description?: string; topics?: string[] }>;
  }>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE = "https://learnchain.in";
// Update this when roadmap content changes (keeps sitemap lastmod stable between deploys)
const CONTENT_DATE = "2025-05-06";

const KNOWN_IDS = new Set(roadmapsData.roadmaps.map((r) => r.id));

/* Safe attribute escaping for HTML injection */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Build page-specific meta for a roadmap ID */
function roadmapMeta(id: string) {
  const r = roadmapsData.roadmaps.find((x) => x.id === id);
  if (!r) return null;

  const desc =
    r.description +
    (r.salaryFresher ? ` Fresher salary: ${r.salaryFresher}.` : "") +
    (r.salarySenior ? ` Senior salary: ${r.salarySenior}.` : "") +
    " Step-by-step roadmap with curated resources for Indian engineers.";

  const canonical = `${SITE}/roadmap/${id}`;
  const ogImage = `${SITE}/og/${id}.png`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE },
          { "@type": "ListItem", "position": 2, "name": "Roadmaps", "item": `${SITE}/#roadmaps` },
          { "@type": "ListItem", "position": 3, "name": r.title, "item": canonical },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${canonical}#howto`,
        "name": r.title,
        "description": r.description,
        "url": canonical,
        "inLanguage": "en-IN",
        "step": (r.modules ?? []).map((m, i) => ({
          "@type": "HowToStep",
          "position": i + 1,
          "name": m.title,
          "text": m.description ?? m.topics?.join(", ") ?? "",
        })),
      },
    ],
  });

  return { title: `${r.title} — LearnChain`, desc, canonical, ogImage, jsonLd };
}

/* Replace meta tags in the HTML template (pure string ops, no DOM) */
function injectMeta(
  html: string,
  meta: NonNullable<ReturnType<typeof roadmapMeta>>,
  noscript: string
): string {
  const t = esc(meta.title);
  const d = esc(meta.desc);
  const c = esc(meta.canonical);
  const img = esc(meta.ogImage);

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*"/, `$1${d}"`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*"/, `$1${d}"`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*"/, `$1${c}"`)
    .replace(/(<meta\s+property="og:image"\s+content=")[^"]*"/, `$1${img}"`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*"/, `$1${d}"`)
    .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*"/, `$1${img}"`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*"/, `$1${c}"`)
    .replace("</head>", `<script type="application/ld+json">${meta.jsonLd}</script>\n</head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>${noscript}`);
}

/* Dynamic sitemap */
function buildSitemap(): string {
  const publicRoutes = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/compare", priority: "0.8", changefreq: "weekly" },
    { path: "/trending", priority: "0.7", changefreq: "daily" },
    { path: "/leaderboard", priority: "0.6", changefreq: "daily" },
    { path: "/squads", priority: "0.5", changefreq: "weekly" },
  ];
  const urls = [
    ...publicRoutes.map(
      (route) =>
        `  <url><loc>${SITE}${route.path}</loc><lastmod>${CONTENT_DATE}</lastmod><changefreq>${route.changefreq}</changefreq><priority>${route.priority}</priority></url>`
    ),
    ...roadmapsData.roadmaps.map(
      (r) =>
        `  <url><loc>${SITE}/roadmap/${r.id}</loc><lastmod>${CONTENT_DATE}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`
    ),
  ].join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  /* 301 redirect for trailing slashes (canonical URLs) */
  app.use((req, res, next) => {
    if (req.path !== "/" && req.path.endsWith("/")) {
      const clean = req.path.slice(0, -1) + (req.url.slice(req.path.length) || "");
      return res.redirect(301, clean);
    }
    next();
  });

  /* Static assets — immutable cache for hashed files, no-cache for index.html */
  app.use(
    express.static(staticPath, {
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (/\.(js|css|woff2?|png|jpg|webp|svg|ico)$/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  /* Sitemap */
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buildSitemap());
  });

  /* Roadmap pages: server-side meta injection for social crawlers */
  app.get("/roadmap/:roadmapId", (req, res) => {
    const id = req.params.roadmapId;

    // Unknown roadmap ID → 404 with noindex so crawlers don't index it
    if (!KNOWN_IDS.has(id)) {
      try {
        const html = readFileSync(path.join(staticPath, "index.html"), "utf-8").replace(
          '<meta name="robots" content="index, follow" />',
          '<meta name="robots" content="noindex, nofollow" />'
        );
        res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.send(html);
      } catch {
        res.status(404).send("Not found");
      }
      return;
    }

    try {
      const template = readFileSync(path.join(staticPath, "index.html"), "utf-8");
      const meta = roadmapMeta(id)!;
      const shortTitle = meta.title.replace(" — LearnChain", "");
      const noscript = `<noscript><h1>${esc(shortTitle)}</h1><p>${esc(meta.desc)}</p></noscript>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.send(injectMeta(template, meta, noscript));
    } catch {
      res.redirect("/");
    }
  });

  /* SPA fallback */
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`LearnChain server → http://localhost:${port}`);
  });
}

startServer().catch(console.error);
