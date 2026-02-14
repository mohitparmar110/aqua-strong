export async function onRequestPost({ request, env }) {
  try {
    // ---- 1) Admin auth (same pattern as your save-config.js usually uses)
    const auth = request.headers.get("Authorization") || "";
    if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // ---- 2) Read multipart form-data
    const form = await request.formData();

    // file
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return new Response("Missing file", { status: 400 });
    }

    // key (the path/filename you want in R2)
    // examples:
    //  banners/terrace.webp
    //  banners/home-hero-1.jpg
    //  services/roof/hero.png
    let key = form.get("key");

    // Backward compatibility:
    // if your old UI sends "service" or "name", we build a key automatically
    const service = (form.get("service") || form.get("name") || "").toString().trim();
    if (!key || typeof key !== "string" || !key.trim()) {
      // auto-generate a safe filename if key not provided
      const ext = (file.name.split(".").pop() || "webp").toLowerCase();
      const safeService = (service || "banner")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
      key = `banners/${safeService}-${Date.now()}.${ext}`;
    }

    // ---- 3) Sanitize key (avoid ../ etc)
    const cleanKey = key
      .toString()
      .trim()
      .replace(/^\/+/, "")                 // no leading /
      .replace(/\.\.+/g, ".")              // stop ../ tricks
      .replace(/[^a-zA-Z0-9\-_.\/]/g, ""); // safe chars only

    if (!cleanKey || cleanKey.length > 180) {
      return new Response("Invalid key", { status: 400 });
    }

    // ---- 4) Upload to R2 (your binding name is R2)
    await env.R2.put(cleanKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    // ---- 5) Build public URL
    const base = (env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
    const url = base ? `${base}/${cleanKey}` : cleanKey;

    // ---- 6) OPTIONAL: save URL into KV (if frontend sends kvKey)
    // Example kvKey: hero.terrace or banners.home
    const kvKey = form.get("kvKey");
    if (kvKey && typeof kvKey === "string" && kvKey.trim()) {
      await env.KV.put(kvKey.trim(), url);
    }

    return Response.json({ ok: true, key: cleanKey, url });
  } catch (e) {
    return new Response(`Upload error: ${e.message}`, { status: 500 });
  }
}
