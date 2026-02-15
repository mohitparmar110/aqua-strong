function isAuthed(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

function extFromFile(fileName, mime) {
  const fromName = (fileName || "").split(".").pop()?.toLowerCase();
  if (fromName && ["png", "jpg", "jpeg", "webp"].includes(fromName)) return fromName === "jpeg" ? "jpg" : fromName;
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}

export async function onRequestPost({ request, env }) {
  try {
    if (!isAuthed(request, env)) return new Response("Unauthorized", { status: 401 });
    if (!env.R2) return new Response("Missing R2 binding (env.R2)", { status: 500 });

    const urlObj = new URL(request.url);
    const slot = (urlObj.searchParams.get("slot") || "").trim();

    if (!slot) return new Response("Missing slot", { status: 400 });
    if (!["terrace", "toilet", "heat"].includes(slot)) return new Response("Invalid slot", { status: 400 });

    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) return new Response("Missing file", { status: 400 });

    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(file.type)) return new Response("Only PNG/JPG/WEBP allowed", { status: 400 });

    const ext = extFromFile(file.name, file.type);
    const key = `banners/hero-${slot}.${ext}`;

    await env.R2.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const base = (env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
    const publicUrl = base ? `${base}/${key}` : key;

    return new Response(JSON.stringify({ ok: true, key, publicUrl }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(`Upload error: ${e?.message || e}`, { status: 500 });
  }
}
