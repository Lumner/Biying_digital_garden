const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, authorization"
};

const encoder = new TextEncoder();

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: HEADERS });
}

function getKv(env) {
  if (env && env.BIYING_KV) return env.BIYING_KV;
  if (typeof globalThis.BIYING_KV !== "undefined") return globalThis.BIYING_KV;
  return undefined;
}

function authorized(request, env) {
  const token = env && env.BIYING_ADMIN_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
}

function normalizeUsername(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

async function listRecords(kv, prefix, map) {
  if (!kv || !kv.list || !kv.get) return [];
  const result = await kv.list({ prefix, limit: 200 });
  const records = [];
  for (const entry of result.keys || []) {
    const raw = await kv.get(entry.key, { type: "text" });
    if (!raw) continue;
    try {
      records.push(map(JSON.parse(raw)));
    } catch (error) {
      // Ignore malformed records so one bad entry does not block the admin view.
    }
  }
  return records;
}

async function listUsers(kv) {
  const users = await listRecords(kv, "user_", (user) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt || "",
    passwordUpdatedAt: user.passwordUpdatedAt || ""
  }));
  return users.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function listPrivateMessages(kv) {
  const messages = await listRecords(kv, "private_message_", (message) => ({
    id: message.id,
    name: message.name,
    contact: message.contact,
    accountUsername: message.accountUsername || "",
    content: message.content,
    locale: message.locale,
    status: message.status || "unread",
    createdAt: message.createdAt,
    updatedAt: message.updatedAt || ""
  }));
  return messages.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function listGuestbookMessages(kv) {
  const messages = await listRecords(kv, "guestbook_", (message) => ({
    id: message.id,
    userId: message.userId || "",
    username: message.username || "",
    name: message.name,
    content: message.content,
    locale: message.locale,
    moderationStatus: message.moderationStatus || "visible",
    createdAt: message.createdAt,
    updatedAt: message.updatedAt || ""
  }));
  return messages
    .filter((message) => message.id && message.name && typeof message.content === "string")
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function deleteUserArtifacts(kv, username) {
  const sessions = await listRecords(kv, "session_", (session) => session);
  for (const session of sessions) {
    if (session.username === username && session.token) {
      await kv.delete(`session_${session.token}`);
    }
  }
  await kv.delete(`recovery_${username}`);
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: HEADERS });
}

export async function onRequestGet({ request, env }) {
  try {
    if (!authorized(request, env)) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.list) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    return json({
      users: await listUsers(kv),
      privateMessages: await listPrivateMessages(kv),
      guestbookMessages: await listGuestbookMessages(kv)
    });
  } catch (error) {
    return json({ error: "admin_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!authorized(request, env)) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.put) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    const body = await readJson(request);
    if (body.action !== "issue_recovery_code") {
      return json({ error: "unsupported_action" }, { status: 400 });
    }

    const username = normalizeUsername(body.username);
    const rawUser = await kv.get(`user_${username}`, { type: "text" });
    if (!rawUser) {
      return json({ error: "user_not_found" }, { status: 404 });
    }

    const minutes = Math.min(1440, Math.max(5, Number(body.minutes) || 30));
    const code = randomCode();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + minutes * 60 * 1000);
    await kv.put(`recovery_${username}`, JSON.stringify({
      username,
      codeHash: await hashText(code),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    }));

    return json({
      ok: true,
      username,
      code,
      expiresAt: expiresAt.toISOString(),
      minutes
    });
  } catch (error) {
    return json({ error: "admin_issue_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestPut({ request, env }) {
  try {
    if (!authorized(request, env)) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.put) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const kind = url.searchParams.get("kind") || "private";
    if (!id) return json({ error: "id_required" }, { status: 400 });

    const prefix = kind === "guestbook" ? "guestbook_" : "private_message_";
    const raw = await kv.get(`${prefix}${id}`, { type: "text" });
    if (!raw) return json({ error: "not_found" }, { status: 404 });
    const message = JSON.parse(raw);
    const body = await readJson(request);
    if (kind === "guestbook") {
      message.moderationStatus = body.status === "hidden" ? "hidden" : "visible";
    } else {
      message.status = body.status === "unread" ? "unread" : "read";
    }
    message.updatedAt = new Date().toISOString();
    await kv.put(`${prefix}${id}`, JSON.stringify(message));
    return json({ ok: true });
  } catch (error) {
    return json({ error: "admin_update_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    if (!authorized(request, env)) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
    const kv = getKv(env);
    if (!kv || !kv.delete) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const kind = url.searchParams.get("kind") || "private";
    if (!id) return json({ error: "id_required" }, { status: 400 });
    if (kind === "user") {
      const username = normalizeUsername(id);
      const rawUser = await kv.get(`user_${username}`, { type: "text" });
      if (!rawUser) return json({ error: "user_not_found" }, { status: 404 });
      await kv.delete(`user_${username}`);
      await deleteUserArtifacts(kv, username);
      return json({ ok: true });
    }
    await kv.delete(`${kind === "guestbook" ? "guestbook_" : "private_message_"}${id}`);
    return json({ ok: true });
  } catch (error) {
    return json({ error: "admin_delete_failed", detail: String(error.message || error) }, { status: 500 });
  }
}
