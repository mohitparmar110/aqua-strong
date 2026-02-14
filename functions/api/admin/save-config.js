function isAuthed(req, env) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token && token === env.ADMIN_TOKEN;
}

export async function onRequestPost({ request, env }) {
  if (!isAuthed(request, env)) return new Response("Unauthorized", { status: 401 });

  const cfg = await request.json();
  await env.KV.put("site_config", JSON.stringify(cfg));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}
