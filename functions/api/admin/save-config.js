function isAuthed(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

export async function onRequestPost({ request, env }) {
  try {
    if (!isAuthed(request, env)) return new Response("Unauthorized", { status: 401 });

    const cfg = await request.json();
    await env.KV.put("site_config", JSON.stringify(cfg));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(`Save error: ${e?.message || e}`, { status: 500 });
  }
}
