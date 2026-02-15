function isAuthed(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

function safeKey(key) {
  return (key || "")
    .toString()
    .trim()
    .replace(/^\/+/, "")
    .replace(/\.\.+/g, ".")
    .replace(/[^a-zA-Z0-9\-_.\/]/g, "");
}

export async function onRequestPost({ request, env }) {
  if (!isAuthed(request, env)) return new Response("Unauthorized", { status: 401 });
  if (!env.R2) return new Response("R2 binding missing", { status: 500 });

  try {
    const url = new URL(request.url);
    const slot = (url.searchParams.get("slot") || "banner").toLowerCase();

    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) return new Response("Missing file", { status: 400 });

    const ext = (file.name.split(".").pop() || "webp").toLowerCase();
    const keyFromForm = safeKey(form.get("key"));
    const key =
      keyFromForm ||
      `banners/${slot}-${Date.now()}.${ext}`;

    await env.R2.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    const base = (env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
    const publicUrl = base ? `${base}/${key}` : key;

    return new Response(JSON.stringify({ ok: true, key, publicUrl }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response("Upload error: " + e.message, { status: 500 });
  }
}
