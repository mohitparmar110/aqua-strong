export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // ---- AUTH ----
    const auth = request.headers.get("Authorization") || "";
    if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // ---- READ BODY ----
    const data = await request.json();

    // ---- SAVE TO KV ----
    await env.SITE_CONFIG.put("config", JSON.stringify(data));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(err.toString(), { status: 500 });
  }
}
