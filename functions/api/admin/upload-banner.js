export async function onRequestPost({ request, env }) {
  try {
    assertAuth(request, env);

    const url = new URL(request.url);
    const slot = (url.searchParams.get("slot") || "").trim().toLowerCase();
    if (!slot) return json({ error: "Missing ?slot=" }, 400);

    // Only allow these slots (matches your HERO_SLOTS)
    const allowed = new Set(["terrace", "toilet", "heat"]);
    if (!allowed.has(slot)) return json({ error: "Invalid slot" }, 400);

    const form = await request.formData();
    const file = form.get("file");
    if (!file) return json({ error: "Missing file field" }, 400);

    const contentType = file.type || "application/octet-stream";
    const ext = pickExt(contentType) || guessExt(file.name) || "webp";

    const objectKey = `hero/${slot}.${ext}`;
    const bytes = await file.arrayBuffer();

    // ✅ Use your actual R2 binding name: env.R2
    await env.R2.put(objectKey, bytes, {
      httpMetadata: { contentType }
    });

    // ✅ Use your actual Pages variable name: env.R2_PUBLIC_BASE
    const base = (env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
    if (!base) {
      return json(
        {
          error: "R2_PUBLIC_BASE is not set. Set it to your R2 public base URL.",
          objectKey
        },
        500
      );
    }

    // Cache busting so old banner doesn’t stick
    const publicUrl = `${base}/${objectKey}?v=${Date.now()}`;

    // ✅ Use your actual KV binding name: env.KV
    const cfg = await getConfig(env);
    if (!cfg.hero) cfg.hero = {};
    if (!cfg.hero.slides) cfg.hero.slides = {};
    if (!cfg.hero.slides[slot]) cfg.hero.slides[slot] = {};
    cfg.hero.slides[slot].bg = publicUrl;

    await env.KV.put("site_config", JSON.stringify(cfg));

    return json({ ok: true, publicUrl, objectKey }, 200);
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);
    const isAuth = msg.toLowerCase().includes("unauthorized");
    return json({ error: msg }, isAuth ? 401 : 500);
  }
}

async function getConfig(env) {
  try {
    const raw = await env.KV.get("site_config");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function assertAuth(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== (env.ADMIN_TOKEN || "")) {
    throw new Error("Unauthorized");
  }
}

function pickExt(contentType) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("webp")) return "webp";
  return "";
}

function guessExt(name) {
  const n = (name || "").toLowerCase();
  const m = n.match(/\.([a-z0-9]+)$/);
  if (!m) return "";
  const ext = m[1];
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "";
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
