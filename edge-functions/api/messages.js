const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization"
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: HEADERS });
}

function key(id) {
  return `guestbook_${id}`;
}

function clean(value, max) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

async function listMessages(kv) {
  if (!kv || !kv.list) return [];
  const result = await kv.list({ prefix: "guestbook_", limit: 100 });
  const messages = [];
  for (const entry of result.keys || []) {
    const raw = await kv.get(entry.key, { type: "text" });
    if (!raw) continue;
    try {
      messages.push(JSON.parse(raw));
    } catch (error) {
      // Ignore malformed records so one bad message does not break the page.
    }
  }
  return messages.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: HEADERS });
}

export async function onRequestGet({ env }) {
  try {
    const kv = env && env.BIYING_KV ? env.BIYING_KV : globalThis.BIYING_KV;
    return json({ messages: await listMessages(kv) });
  } catch (error) {
    return json({ error: "messages_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, clientIp }) {
  try {
    const kv = env && env.BIYING_KV ? env.BIYING_KV : globalThis.BIYING_KV;
    if (!kv || !kv.put) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }

    const body = await request.json();
    if (body.website) {
      return json({ ok: true, ignored: true });
    }

    const name = clean(body.name, 40);
    const content = clean(body.content, 800);
    if (!name || !content) {
      return json({ error: "name_and_content_required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const message = {
      id,
      name,
      content,
      locale: body.locale === "en" ? "en" : "zh",
      createdAt: now,
      ipHint: clientIp ? String(clientIp).split(".").slice(0, 2).join(".") : ""
    };

    await kv.put(key(id), JSON.stringify(message));
    return json({ ok: true, message }, { status: 201 });
  } catch (error) {
    return json({ error: "post_failed", detail: String(error.message || error) }, { status: 500 });
  }
}
