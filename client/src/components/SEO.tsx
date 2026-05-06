import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  /** Canonical path, e.g. "/roadmap/java-backend" */
  path?: string;
  /** Optional JSON-LD structured data object injected as <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown>;
}

function setMeta(nameOrProp: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(
    `meta[${attr}="${nameOrProp}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

const JSON_LD_ID = "learnchain-page-jsonld";

function setJsonLd(data: Record<string, unknown>) {
  let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = JSON_LD_ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  document.getElementById(JSON_LD_ID)?.remove();
}

export function SEO({ title, description, keywords, path, jsonLd }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("LearnChain")
      ? title
      : `${title} | LearnChain`;
    document.title = fullTitle;

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "LearnChain", true);

    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", description, true);

    if (path) {
      const url = `https://learnchain.in${path}`;
      setLink("canonical", url);
      setMeta("og:url", url, true);
    }

    if (jsonLd) {
      setJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }

    return () => {
      // Clean up page-level JSON-LD when component unmounts (route change)
      removeJsonLd();
    };
  }, [title, description, keywords, path, jsonLd]);

  return null;
}
