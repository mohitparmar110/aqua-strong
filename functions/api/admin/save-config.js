function isAuthed(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

export async function onRequestPost({ request, env }) {
  const KV = env.KV || env.kv; // supports both binding names

  if (!isAuthed(request, env)) return new Response("Unauthorized", { status: 401 });
  if (!KV) return new Response("KV binding missing (set KV or kv)", { status: 500 });

  try {
    const cfg = await request.json();
    await KV.put("site_config", JSON.stringify(cfg));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response("Save error: " + e.message, { status: 500 });
  }
}
