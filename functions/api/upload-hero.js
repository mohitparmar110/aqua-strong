export async function onRequestPost({ request, env }) {
  try {
    assertAuth(request, env);

    const url = new URL(request.url);
    const slideId = (url.searchParams.get("id") || "").trim();
    const field = (url.searchParams.get("field") || "").trim(); // "bg" or "banner"

    if (!slideId) return json({ error: "Missing ?id=" }, 400);
    if (!["bg", "banner"].includes(field)) return json({ error: "Missing/invalid ?field=bg|banner" }, 400);

    const form = await request.formData();
    const file = form.get("file");
    if (!file) return json({ error: "Missing file field" }, 400);

    const contentType = file.type || "application/octet-stream";
    const ext = pickExt(contentType) || guessExt(file.name) || "webp";

    const objectKey = `hero/${slideId}-${field}.${ext}`;
    const bytes = await file.arrayBuffer();

    await env.SITE_R2.put(objectKey, bytes, { httpMetadata: { contentType } });

    const base = (env.PUBLIC_R2_BASE || "").replace(/\/+$/, "");
    if (!base) return json({ error: "PUBLIC_R2_BASE not set", objectKey }, 500);

    const publicUrl = `${base}/${objectKey}?v=${Date.now()}`;

    // update KV config
    const cfg = await getConfig(env);
    if (!cfg.hero) cfg.hero = {};
    if (!Array.isArray(cfg.hero.slides)) cfg.hero.slides = [];

    const idx = cfg.hero.slides.findIndex(s => s?.id === slideId);
    if (idx === -1) return json({ error: `Slide id not found: ${slideId}` }, 400);

    cfg.hero.slides[idx][field] = publicUrl;

    await env.SITE_KV.put("site_config", JSON.stringify(cfg));
    return json({ ok: true, publicUrl, objectKey }, 200);
  } catch (e) {
    const msg = String(e?.message || e);
    return json({ error: msg }, msg.toLowerCase().includes("unauthorized") ? 401 : 500);
  }
}

async function getConfig(env) {
  try {
    const raw = await env.SITE_KV.get("site_config");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function assertAuth(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== (env.ADMIN_TOKEN || "")) throw new Error("Unauthorized");
}

function pickExt(ct = "") {
  const s = ct.toLowerCase();
  if (s.includes("png")) return "png";
  if (s.includes("jpeg") || s.includes("jpg")) return "jpg";
  if (s.includes("webp")) return "webp";
  return "";
}

function guessExt(name = "") {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!m) return "";
  const ext = m[1];
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "";
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
