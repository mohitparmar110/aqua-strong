export async function onRequestGet({ env }) {
  try {
    const raw = await env.KV.get("site_config"); // ✅ KV binding
    let data = raw ? JSON.parse(raw) : defaultConfig(env);

    // ✅ ensure header/footer always exist
    data = ensureShape(data, env);

    return json(data, 200);
  } catch (e) {
    return json({ error: "Failed to load config", details: String(e?.message || e) }, 500);
  }
}

function ensureShape(cfg, env) {
  if (!cfg || typeof cfg !== "object") cfg = defaultConfig(env);

  // keep your existing defaults too
  if (!cfg.company) cfg.company = { name: "AquaShield", phone: "+91 97695 31112", whatsapp: "919769531112" };
  if (!cfg.hero) cfg.hero = { slides: [] };
  if (!Array.isArray(cfg.hero.slides)) cfg.hero.slides = [];
  if (!Array.isArray(cfg.menu)) cfg.menu = [];
  if (!Array.isArray(cfg.services)) cfg.services = [];
  if (!Array.isArray(cfg.faq)) cfg.faq = [];
  if (!Array.isArray(cfg.reviews)) cfg.reviews = [];
  if (!cfg.pages || typeof cfg.pages !== "object") cfg.pages = {};
  if (!cfg.seo) cfg.seo = {};

  // ✅ header/footer you want
  if (!cfg.header) cfg.header = { links: [] };

  if (!cfg.footer) {
    cfg.footer = {
      columns: [
        { title: "Services", links: [] },
        { title: "Company", links: [] },
        { title: "Legal", links: [] }
      ],
      trust: { warranty: true, years: 10, phone: cfg.company?.phone || "", whatsapp: cfg.company?.whatsapp || "" },
      seoBlocks: {
        address: "",
        businessHours: "",
        serviceAreas: [],
        socialLinks: []
      }
    };
  }

  return cfg;
}

function defaultConfig(env) {
  return {
    company: {
      name: "AquaShield",
      phone: "+91 97695 31112",
      whatsapp: "919769531112"
    },
    header: { links: [] },
    footer: {
      columns: [
        { title: "Services", links: [] },
        { title: "Company", links: [] },
        { title: "Legal", links: [] }
      ],
      trust: { warranty: true, years: 10, phone: "+91 97695 31112", whatsapp: "919769531112" },
      seoBlocks: { address: "", businessHours: "", serviceAreas: [], socialLinks: [] }
    },
    hero: {
      slides: [
        {
          id: "home",
          title: "Stop Water Damage Before It Starts",
          sub: "Professional waterproofing solutions with 10-year warranty. Protect your home from leaks, seepage & dampness forever.",
          bullets: ["10 Year Warranty", "Free Inspection", "24/7 Support"],
          ctaText: "Get Free Inspection",
          ctaLink: "#contact",
          bg: "",
          banner: "",
          gradFrom: "#0c4a6e",
          gradMid: "#075985",
          gradTo: "#0369a1",
          waText: "Hi! I need complete home waterproofing inspection"
        }
      ]
    },
    menu: [],
    services: [],
    faq: [],
    reviews: [],
    seo: {
      siteName: "AquaShield Waterproofing",
      defaultTitle: "AquaShield Waterproofing",
      defaultDescription: "",
      defaultOgImage: "",
      robots: "index,follow",
      canonicalBase: "",
      tags: [],
      h1Defaults: "",
      h2Defaults: ""
    },
    pages: {}
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
