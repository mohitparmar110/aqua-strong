// functions/api/config.js

export async function onRequestGet({ env }) {
  try {
    const raw = await env.KV.get("site_config");
    return json(raw ? JSON.parse(raw) : {}, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    // 🔐 check admin token
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token || token !== (env.ADMIN_TOKEN || "")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const cfg = await request.json();
    if (!cfg || typeof cfg !== "object") {
      return json({ error: "Invalid JSON body" }, 400);
    }

    // 💾 save to KV
    await env.KV.put("site_config", JSON.stringify(cfg));

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
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
