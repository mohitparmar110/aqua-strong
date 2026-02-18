export async function onRequestGet({ env }) {
  try {
    const raw = await env.SITE_KV.get("site_config");
    const data = raw ? JSON.parse(raw) : defaultConfig(env);

    return json(data, 200);
  } catch (e) {
    return json({ error: "Failed to load config", details: String(e) }, 500);
  }
}

function defaultConfig(env) {
  // Minimal safe default (matches your admin shape expectations)
  return {
    hero: {
      slides: {
        terrace: { bg: "", title: "", sub: "", bullets: [], ctaText: "", ctaLink: "" },
        toilet: { bg: "", title: "", sub: "", bullets: [], ctaText: "", ctaLink: "" },
        heat: { bg: "", title: "", sub: "", bullets: [], ctaText: "", ctaLink: "" }
      }
    },
    menu: [],
    seo: {
      siteName: "",
      defaultTitle: "",
      defaultDescription: "",
      defaultOgImage: "",
      robots: "index,follow",
      canonicalBase: "",
      tags: [],
      h1Defaults: "",
      h2Defaults: ""
    },
    pages: {},
    faq: [],
    reviews: [],
    images: { map: [] },
    services: []
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
