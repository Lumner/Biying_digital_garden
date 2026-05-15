const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, authorization"
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: HEADERS });
}

function authorized(request, env) {
  const token = env && env.BIYING_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: HEADERS });
}

export async function onRequestDelete({ request, env }) {
  if (!authorized(request, env)) {
    return json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return json({ error: "id_required" }, { status: 400 });
  }
  const kv = env && env.BIYING_KV ? env.BIYING_KV : globalThis.BIYING_KV;
  if (!kv || !kv.delete) {
    return json({ error: "kv_not_configured" }, { status: 503 });
  }
  await kv.delete(`guestbook_${id}`);
  return json({ ok: true });
}
