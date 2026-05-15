const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, authorization"
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: HEADERS });
}

function key(id) {
  return `guestbook_${id}`;
}

function sessionKey(token) {
  return `session_${token}`;
}

function clean(value, max) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function getKv(env) {
  if (env && env.BIYING_KV) return env.BIYING_KV;
  if (typeof globalThis.BIYING_KV !== "undefined") return globalThis.BIYING_KV;
  return undefined;
}

function readBearer(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function isAdmin(request, env) {
  const token = env && env.BIYING_ADMIN_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
}

async function currentSession(request, kv) {
  const token = readBearer(request);
  if (!token || !kv || !kv.get) return undefined;
  const raw = await kv.get(sessionKey(token), { type: "text" });
  if (!raw) return undefined;
  const session = JSON.parse(raw);
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await kv.delete(sessionKey(token));
    return undefined;
  }
  return session;
}

function canEdit(message, session, admin) {
  return Boolean(admin || (session && message.userId && message.userId === session.userId));
}

function publicMessage(message, session, admin) {
  return {
    id: message.id,
    name: message.name,
    content: message.content,
    locale: message.locale,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt || "",
    canEdit: canEdit(message, session, admin)
  };
}

async function listMessages(kv, session, admin) {
  if (!kv || !kv.list) return [];
  const result = await kv.list({ prefix: "guestbook_", limit: 100 });
  const messages = [];
  for (const entry of result.keys || []) {
    const raw = await kv.get(entry.key, { type: "text" });
    if (!raw) continue;
    try {
      messages.push(publicMessage(JSON.parse(raw), session, admin));
    } catch (error) {
      // Ignore malformed records so one bad message does not break the page.
    }
  }
  return messages.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: HEADERS });
}

export async function onRequestGet({ request, env }) {
  try {
    const kv = getKv(env);
    const admin = isAdmin(request, env);
    const session = await currentSession(request, kv);
    return json({ messages: await listMessages(kv, session, admin) });
  } catch (error) {
    return json({ error: "messages_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, clientIp }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.put) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }

    const session = await currentSession(request, kv);
    if (!session) {
      return json({ error: "auth_required" }, { status: 401 });
    }

    const body = await readJson(request);
    if (body.website) {
      return json({ ok: true, ignored: true });
    }

    const content = clean(body.content, 800);
    if (!content) {
      return json({ error: "content_required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const message = {
      id,
      userId: session.userId,
      username: session.username,
      name: clean(session.displayName || session.username, 40),
      content,
      locale: body.locale === "en" ? "en" : "zh",
      createdAt: now,
      updatedAt: "",
      ipHint: clientIp ? String(clientIp).split(".").slice(0, 2).join(".") : ""
    };

    await kv.put(key(id), JSON.stringify(message));
    return json({ ok: true, message: publicMessage(message, session, false) }, { status: 201 });
  } catch (error) {
    return json({ error: "post_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestPut({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.put) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }

    const admin = isAdmin(request, env);
    const session = await currentSession(request, kv);
    if (!admin && !session) {
      return json({ error: "auth_required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id_required" }, { status: 400 });

    const raw = await kv.get(key(id), { type: "text" });
    if (!raw) return json({ error: "not_found" }, { status: 404 });
    const message = JSON.parse(raw);
    if (!canEdit(message, session, admin)) {
      return json({ error: "forbidden" }, { status: 403 });
    }

    const body = await readJson(request);
    const content = clean(body.content, 800);
    if (!content) return json({ error: "content_required" }, { status: 400 });

    message.content = content;
    message.updatedAt = new Date().toISOString();
    await kv.put(key(id), JSON.stringify(message));
    return json({ ok: true, message: publicMessage(message, session, admin) });
  } catch (error) {
    return json({ error: "edit_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.delete) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }

    const admin = isAdmin(request, env);
    const session = await currentSession(request, kv);
    if (!admin && !session) {
      return json({ error: "auth_required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id_required" }, { status: 400 });

    const raw = await kv.get(key(id), { type: "text" });
    if (!raw) return json({ error: "not_found" }, { status: 404 });
    const message = JSON.parse(raw);
    if (!canEdit(message, session, admin)) {
      return json({ error: "forbidden" }, { status: 403 });
    }

    await kv.delete(key(id));
    return json({ ok: true });
  } catch (error) {
    return json({ error: "delete_failed", detail: String(error.message || error) }, { status: 500 });
  }
}
