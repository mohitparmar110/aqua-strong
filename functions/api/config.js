export async function onRequestGet({ env }) {
  const raw = await env.KV.get("site_config");
  const cfg = raw ? JSON.parse(raw) : defaultConfig();
  return new Response(JSON.stringify(cfg), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}

function defaultConfig() {
  return {
    hero: {
      active: "terrace",
      slides: {
        terrace: {
          bg: "assets/images/hero/terrace.jpg",
          title: "Terrace Waterproofing",
          sub: "Leak protection + crack repair for roof slabs.",
          bullets: ["Crack filling included", "Long life coating system", "Monsoon-ready protection"],
          ctaText: "Get Quote",
          ctaLink: "https://wa.me/919769531112?text=Hi!%20I%20need%20terrace%20waterproofing"
        },
        toilet: {
          bg: "assets/images/hero/toilet.jpg",
          title: "Toilet Waterproofing",
          sub: "Stop bathroom leakage without major demolition.",
          bullets: ["Tile joint sealing", "Pipe area treatment", "Fast turnaround"],
          ctaText: "Get Quote",
          ctaLink: "https://wa.me/919769531112?text=Hi!%20I%20need%20toilet%20waterproofing"
        },
        heat: {
          bg: "assets/images/hero/heat.jpg",
          title: "Heat Reflection Coating",
          sub: "Reduce roof heat and keep rooms cooler.",
          bullets: ["Heat-reflective coating", "Lower indoor temperature", "UV protection layer"],
          ctaText: "Get Quote",
          ctaLink: "https://wa.me/919769531112?text=Hi!%20I%20need%20heat%20reflection%20coating"
        }
      }
    }
  };
}
