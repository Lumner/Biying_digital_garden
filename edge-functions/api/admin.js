import {
  ADMIN_SESSION_COOKIE_NAME,
  adminSessionKey,
  apiResponder,
  currentAdmin,
  deleteKvKey,
  enforceRateLimit,
  envValue,
  getClientIp,
  getKv,
  isAdminToken,
  mutationOriginAllowed,
  normalizeUsername,
  readJson
} from "./_shared.js";
import { benchmarkPasswordHash } from "./auth.js";

const encoder = new TextEncoder();
const DEFAULT_PAGE_SIZE = 200;
const MAX_PAGE_SIZE = 200;
const DEFAULT_ADMIN_SESSION_MINUTES = 20;
const MIN_ADMIN_SESSION_MINUTES = 15;
const MAX_ADMIN_SESSION_MINUTES = 30;

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return bytesToHex(data);
}

function adminSessionMinutes(env) {
  const configured = Number(envValue(
    env,
    "BIYING_ADMIN_SESSION_MINUTES",
    DEFAULT_ADMIN_SESSION_MINUTES
  ));
  return Number.isSafeInteger(configured)
    && configured >= MIN_ADMIN_SESSION_MINUTES
    && configured <= MAX_ADMIN_SESSION_MINUTES
    ? configured
    : DEFAULT_ADMIN_SESSION_MINUTES;
}

function adminSessionCookie(token, maxAge) {
  const value = token ? encodeURIComponent(token) : "";
  const expires = maxAge === 0 ? "; Expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  return `${ADMIN_SESSION_COOKIE_NAME}=${value}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}${expires}`;
}

async function createAdminSession(kv, env) {
  const minutes = adminSessionMinutes(env);
  const maxAge = minutes * 60;
  const now = Date.now();
  const session = {
    token: randomHex(32),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + maxAge * 1000).toISOString()
  };
  await kv.put(adminSessionKey(session.token), JSON.stringify(session));
  return { session, maxAge };
}

async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function listRecords(kv, prefix, map, options = {}) {
  if (!kv || !kv.list || !kv.get) {
    return { records: [], cursor: "", complete: true };
  }
  const request = {
    prefix,
    limit: Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(options.limit) || DEFAULT_PAGE_SIZE)
    )
  };
  if (options.cursor) request.cursor = options.cursor;

  const result = await kv.list(request);
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
  const cursor = String(result.cursor || "");
  return {
    records,
    cursor,
    complete: result.complete === true || result.list_complete === true || !cursor
  };
}

async function listUsers(kv, options) {
  const page = await listRecords(kv, "user_", (user) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt || "",
    passwordUpdatedAt: user.passwordUpdatedAt || ""
  }), options);
  page.records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return page;
}

async function listPrivateMessages(kv, options) {
  const page = await listRecords(kv, "private_message_", (message) => ({
    id: message.id,
    name: message.name,
    contact: message.contact,
    accountUsername: message.accountUsername || "",
    content: message.content,
    locale: message.locale,
    status: message.status || "unread",
    createdAt: message.createdAt,
    updatedAt: message.updatedAt || ""
  }), options);
  page.records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return page;
}

async function listGuestbookMessages(kv, options) {
  const page = await listRecords(kv, "guestbook_", (message) => ({
    id: message.id,
    userId: message.userId || "",
    username: message.username || "",
    name: message.name,
    content: message.content,
    locale: message.locale,
    moderationStatus: message.moderationStatus || "visible",
    createdAt: message.createdAt,
    updatedAt: message.updatedAt || ""
  }), options);
  page.records = page.records
    .filter((message) => message.id && message.name && typeof message.content === "string")
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return page;
}

function pageOptions(request) {
  const url = new URL(request.url);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(url.searchParams.get("limit")) || DEFAULT_PAGE_SIZE)
  );
  const cursor = (name) => String(url.searchParams.get(name) || "").slice(0, 512);
  return {
    users: { limit, cursor: cursor("usersCursor") },
    privateMessages: { limit, cursor: cursor("privateMessagesCursor") },
    guestbookMessages: { limit, cursor: cursor("guestbookMessagesCursor") }
  };
}

function pageInfo(page) {
  return {
    cursor: page.cursor,
    complete: page.complete
  };
}

async function allRecords(kv, prefix, map) {
  const records = [];
  let cursor = "";
  const seenCursors = new Set();
  do {
    if (cursor && seenCursors.has(cursor)) break;
    if (cursor) seenCursors.add(cursor);
    const page = await listRecords(kv, prefix, map, {
      cursor,
      limit: MAX_PAGE_SIZE
    });
    records.push(...page.records);
    if (page.complete || !page.cursor) break;
    cursor = page.cursor;
  } while (true);
  return records;
}

async function deleteUserArtifacts(kv, username) {
  const sessions = await allRecords(kv, "session_", (session) => session);
  for (const session of sessions) {
    if (session.username === username && session.token) {
      await kv.delete(`session_${session.token}`);
    }
  }
  await kv.delete(`recovery_${username}`);
}

async function limitAdminWrite(kv, request, clientIp, action, reply) {
  return enforceRateLimit(kv, {
    action: `admin_${action}`,
    identifier: getClientIp(request, clientIp),
    limit: 30,
    windowMs: 60 * 1000
  }, reply);
}

export function onRequestOptions(context = {}) {
  return apiResponder(context.request, context.env).cors();
}

export async function onRequestGet({ request, env }) {
  const reply = apiResponder(request, env);
  try {
    const kv = getKv(env);
    const admin = await currentAdmin(request, env, { kv });
    if (!admin) {
      return reply.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!kv || !kv.get || !kv.list) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }
    const options = pageOptions(request);
    const [users, privateMessages, guestbookMessages] = await Promise.all([
      listUsers(kv, options.users),
      listPrivateMessages(kv, options.privateMessages),
      listGuestbookMessages(kv, options.guestbookMessages)
    ]);
    return reply.json({
      users: users.records,
      privateMessages: privateMessages.records,
      guestbookMessages: guestbookMessages.records,
      pageInfo: {
        users: pageInfo(users),
        privateMessages: pageInfo(privateMessages),
        guestbookMessages: pageInfo(guestbookMessages)
      }
    });
  } catch (error) {
    return reply.error(error, "admin_failed");
  }
}

export async function onRequestPost(context) {
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
    const body = await readJson(request);
    if (body.action === "create_session") {
      if (!isAdminToken(request, env)) {
        return reply.json({ error: "unauthorized" }, { status: 401 });
      }
      if (!mutationOriginAllowed(request, env, { required: true })) {
        return reply.json({ error: "origin_not_allowed" }, { status: 403 });
      }
      const limited = await limitAdminWrite(kv, request, clientIp, "session", reply);
      if (limited) return limited;
      const { session, maxAge } = await createAdminSession(kv, env);
      return reply.json({
        ok: true,
        expiresAt: session.expiresAt
      }, {
        headers: {
          "cache-control": "no-store",
          "set-cookie": adminSessionCookie(session.token, maxAge)
        }
      });
    }

    const admin = await currentAdmin(request, env, { kv, waitUntil });
    if (!admin) {
      return reply.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: admin.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }
    if (body.action === "logout") {
      if (admin.authSource === "cookie" && admin.token) {
        await deleteKvKey(kv, adminSessionKey(admin.token), waitUntil);
      }
      return reply.json({ ok: true }, {
        headers: {
          "cache-control": "no-store",
          "set-cookie": adminSessionCookie("", 0)
        }
      });
    }
    if (body.action === "benchmark_password_hash") {
      if (
        envValue(env, "BIYING_PASSWORD_BENCHMARK_ENABLED", "0") !== "1"
        || admin.authSource !== "cookie"
      ) {
        return reply.json({ error: "benchmark_disabled" }, { status: 403 });
      }
      const limited = await enforceRateLimit(kv, {
        action: "admin_password_benchmark",
        identifier: getClientIp(request, clientIp),
        limit: 3,
        windowMs: 60 * 60 * 1000
      }, reply);
      if (limited) return limited;
      return reply.json({
        ok: true,
        benchmark: await benchmarkPasswordHash(env, body.runs)
      }, {
        headers: { "cache-control": "no-store" }
      });
    }
    if (body.action !== "issue_recovery_code") {
      return reply.json({ error: "unsupported_action" }, { status: 400 });
    }

    const limited = await limitAdminWrite(kv, request, clientIp, "recovery", reply);
    if (limited) return limited;

    const username = normalizeUsername(body.username);
    const rawUser = await kv.get(`user_${username}`, { type: "text" });
    if (!rawUser) {
      return reply.json({ error: "user_not_found" }, { status: 404 });
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

    return reply.json({
      ok: true,
      username,
      code,
      expiresAt: expiresAt.toISOString(),
      minutes
    });
  } catch (error) {
    return reply.error(error, "admin_issue_failed");
  }
}

export async function onRequestPut({ request, env, clientIp }) {
  const reply = apiResponder(request, env);
  try {
    const kv = getKv(env);
    const admin = await currentAdmin(request, env, { kv });
    if (!admin) {
      return reply.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!kv || !kv.get || !kv.put) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: admin.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const kind = url.searchParams.get("kind") || "private";
    if (!id) return reply.json({ error: "id_required" }, { status: 400 });

    const prefix = kind === "guestbook" ? "guestbook_" : "private_message_";
    const raw = await kv.get(`${prefix}${id}`, { type: "text" });
    if (!raw) return reply.json({ error: "not_found" }, { status: 404 });

    const limited = await limitAdminWrite(kv, request, clientIp, "update", reply);
    if (limited) return limited;

    const message = JSON.parse(raw);
    const body = await readJson(request);
    if (kind === "guestbook") {
      message.moderationStatus = body.status === "hidden" ? "hidden" : "visible";
    } else {
      message.status = body.status === "unread" ? "unread" : "read";
    }
    message.updatedAt = new Date().toISOString();
    await kv.put(`${prefix}${id}`, JSON.stringify(message));
    return reply.json({ ok: true });
  } catch (error) {
    return reply.error(error, "admin_update_failed");
  }
}

export async function onRequestDelete({ request, env, clientIp }) {
  const reply = apiResponder(request, env);
  try {
    const kv = getKv(env);
    const admin = await currentAdmin(request, env, { kv });
    if (!admin) {
      return reply.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!kv || !kv.get || !kv.delete) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: admin.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const kind = url.searchParams.get("kind") || "private";
    if (!id) return reply.json({ error: "id_required" }, { status: 400 });

    const limited = await limitAdminWrite(kv, request, clientIp, "delete", reply);
    if (limited) return limited;

    if (kind === "user") {
      const username = normalizeUsername(id);
      const rawUser = await kv.get(`user_${username}`, { type: "text" });
      if (!rawUser) return reply.json({ error: "user_not_found" }, { status: 404 });
      await kv.delete(`user_${username}`);
      await deleteUserArtifacts(kv, username);
      return reply.json({ ok: true });
    }
    await kv.delete(`${kind === "guestbook" ? "guestbook_" : "private_message_"}${id}`);
    return reply.json({ ok: true });
  } catch (error) {
    return reply.error(error, "admin_delete_failed");
  }
}
