export async function onRequestPost(context) {
  const { request, env } = context;

  const auth = request.headers.get("Authorization") || "";
  if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const slot = url.searchParams.get("slot");
  const variant = url.searchParams.get("variant") || "desktop";

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return new Response("No file", { status: 400 });
  }

  const key = `banners/${slot}-${variant}-${Date.now()}.png`;

  await env.ASSETS_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  });

  const publicUrl = `https://pub-${env.ACCOUNT_ID}.r2.dev/${key}`;

  return new Response(JSON.stringify({ publicUrl }), {
    headers: { "Content-Type": "application/json" }
  });
}
