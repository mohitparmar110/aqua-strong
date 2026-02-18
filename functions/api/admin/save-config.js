export async function onRequestPost({ request, env }) {
  try {
    // Auth
    assertAuth(request, env);

    // Body
    const cfg = await request.json();
    if (!cfg || typeof cfg !== "object") {
      return json({ error: "Invalid JSON body" }, 400);
    }

    // Store
    await env.KV.put("site_config", JSON.stringify(cfg));

    return json({ ok: true }, 200);
  } catch (e) {
    const msg = String(e && e.message ? e.message : e);
    const isAuth = msg.toLowerCase().includes("unauthorized");
    return json({ error: msg }, isAuth ? 401 : 500);
  }
}

function assertAuth(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== (env.ADMIN_TOKEN || "")) {
    throw new Error("Unauthorized");
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
