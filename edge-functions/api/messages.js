import {
  apiResponder,
  cleanText,
  currentSession,
  enforceRateLimit,
  getClientIp,
  getKv,
  isAdmin,
  mutationOriginAllowed,
  readJson
} from "./_shared.js";

function key(id) {
  return `guestbook_${id}`;
}

function lastPostKey(userId) {
  return `rate_guestbook_last_post_${userId}`;
}

function clean(value, max) {
  return cleanText(value, max);
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
    moderationStatus: message.moderationStatus || "visible",
    canEdit: canEdit(message, session, admin)
  };
}

function isGuestbookMessage(message) {
  return Boolean(message && message.id && message.name && typeof message.content === "string");
}

async function listMessages(kv, session, admin) {
  if (!kv || !kv.list) return [];
  const result = await kv.list({ prefix: "guestbook_", limit: 100 });
  const messages = [];
  for (const entry of result.keys || []) {
    const raw = await kv.get(entry.key, { type: "text" });
    if (!raw) continue;
    try {
      const message = JSON.parse(raw);
      if (!isGuestbookMessage(message)) continue;
      if (!admin && message.moderationStatus === "hidden") continue;
      messages.push(publicMessage(message, session, admin));
    } catch (error) {
      // Ignore malformed records so one bad message does not break the page.
    }
  }
  return messages.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function onRequestOptions(context = {}) {
  return apiResponder(context.request, context.env).cors();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const reply = apiResponder(request, env);
  const waitUntil = typeof context.waitUntil === "function"
    ? (promise) => context.waitUntil(promise)
    : undefined;
  try {
    const kv = getKv(env);
    const admin = isAdmin(request, env);
    const session = await currentSession(request, kv, { env, waitUntil });
    return reply.json({ messages: await listMessages(kv, session, admin) });
  } catch (error) {
    return reply.error(error, "messages_failed");
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const reply = apiResponder(request, env);
  const waitUntil = typeof context.waitUntil === "function"
    ? (promise) => context.waitUntil(promise)
    : undefined;
  try {
    const kv = getKv(env);
    if (!kv || !kv.put) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }

    const session = await currentSession(request, kv, { env, waitUntil });
    if (!session) {
      return reply.json({ error: "auth_required" }, { status: 401 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: session.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }

    const body = await readJson(request);
    if (body.website) {
      return reply.json({ ok: true, ignored: true });
    }

    const content = clean(body.content, 800);
    if (!content) {
      return reply.json({ error: "content_required" }, { status: 400 });
    }

    const limited = await enforceRateLimit(kv, {
      key: lastPostKey(session.userId),
      action: "guestbook_post",
      identifier: session.userId,
      limit: 1,
      windowMs: 20 * 1000
    }, reply);
    if (limited) return limited;

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
      moderationStatus: "visible"
    };

    await kv.put(key(id), JSON.stringify(message));
    return reply.json(
      { ok: true, message: publicMessage(message, session, false) },
      { status: 201 }
    );
  } catch (error) {
    return reply.error(error, "post_failed");
  }
}

export async function onRequestPut(context) {
  const { request, env, clientIp } = context;
  const reply = apiResponder(request, env);
  const waitUntil = typeof context.waitUntil === "function"
    ? (promise) => context.waitUntil(promise)
    : undefined;
  try {
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.put) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }

    const admin = isAdmin(request, env);
    const session = await currentSession(request, kv, { env, waitUntil });
    if (!admin && !session) {
      return reply.json({ error: "auth_required" }, { status: 401 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: session?.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return reply.json({ error: "id_required" }, { status: 400 });

    const raw = await kv.get(key(id), { type: "text" });
    if (!raw) return reply.json({ error: "not_found" }, { status: 404 });
    const message = JSON.parse(raw);
    if (!canEdit(message, session, admin)) {
      return reply.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await readJson(request);
    const content = clean(body.content, 800);
    if (!content) return reply.json({ error: "content_required" }, { status: 400 });

    const limited = await enforceRateLimit(kv, {
      action: "guestbook_edit",
      identifier: session?.userId || getClientIp(request, clientIp),
      limit: 20,
      windowMs: 60 * 1000
    }, reply);
    if (limited) return limited;

    message.content = content;
    message.updatedAt = new Date().toISOString();
    await kv.put(key(id), JSON.stringify(message));
    return reply.json({ ok: true, message: publicMessage(message, session, admin) });
  } catch (error) {
    return reply.error(error, "edit_failed");
  }
}

export async function onRequestDelete(context) {
  const { request, env, clientIp } = context;
  const reply = apiResponder(request, env);
  const waitUntil = typeof context.waitUntil === "function"
    ? (promise) => context.waitUntil(promise)
    : undefined;
  try {
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.delete) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }

    const admin = isAdmin(request, env);
    const session = await currentSession(request, kv, { env, waitUntil });
    if (!admin && !session) {
      return reply.json({ error: "auth_required" }, { status: 401 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: session?.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return reply.json({ error: "id_required" }, { status: 400 });

    const raw = await kv.get(key(id), { type: "text" });
    if (!raw) return reply.json({ error: "not_found" }, { status: 404 });
    const message = JSON.parse(raw);
    if (!canEdit(message, session, admin)) {
      return reply.json({ error: "forbidden" }, { status: 403 });
    }

    const limited = await enforceRateLimit(kv, {
      action: "guestbook_delete",
      identifier: session?.userId || getClientIp(request, clientIp),
      limit: 20,
      windowMs: 60 * 1000
    }, reply);
    if (limited) return limited;

    await kv.delete(key(id));
    return reply.json({ ok: true });
  } catch (error) {
    return reply.error(error, "delete_failed");
  }
}
