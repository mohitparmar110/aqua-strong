export async function onRequestGet({ env }) {
  try {
    const raw = await env.SITE_KV.get("site_config");
    const data = raw ? JSON.parse(raw) : defaultConfig(env);
    return json(data, 200);
  } catch (e) {
    return json({ error: "Failed to load config", details: String(e) }, 500);
  }
}
cfg.header = { links: [] };
cfg.footer = {
  columns: [
    { title: "Services", links: [] },
    { title: "Company", links: [] },
    { title: "Legal", links: [] }
  ],
  trust: { warranty: true, years: 10, phone: "", whatsapp: "" },
  seoBlocks: {
    address: "",
    businessHours: "",
    serviceAreas: [],
    socialLinks: []
  }
};


function defaultConfig(env) {
  return {
    company: {
      name: "AquaShield",
      phone: "+91 97695 31112",
      whatsapp: "919769531112"
    },
    hero: {
      // ✅ dynamic array
      slides: [
        {
          id: "home",
          title: "Stop Water Damage Before It Starts",
          sub: "Professional waterproofing solutions with 10-year warranty. Protect your home from leaks, seepage & dampness forever.",
          bullets: ["10 Year Warranty", "Free Inspection", "24/7 Support"],
          ctaText: "Get Free Inspection",
          ctaLink: "#contact",
          bg: "",       // optional (left bg)
          banner: "",   // optional (right image)
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
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
