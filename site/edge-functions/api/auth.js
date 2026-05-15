const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, authorization"
};

const SESSION_DAYS = 30;
const encoder = new TextEncoder();

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: HEADERS });
}

function cors() {
  return new Response(null, { status: 204, headers: HEADERS });
}

function getKv(env) {
  if (env && env.BIYING_KV) return env.BIYING_KV;
  if (typeof globalThis.BIYING_KV !== "undefined") return globalThis.BIYING_KV;
  return undefined;
}

function envValue(env, key, fallback = "") {
  return env && env[key] ? env[key] : fallback;
}

function userKey(username) {
  return `user_${username}`;
}

function sessionKey(token) {
  return `session_${token}`;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let index = 0; index < out.length; index += 1) {
    out[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return out;
}

function randomHex(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return bytesToHex(data);
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function normalizeUsername(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

function cleanDisplayName(value) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, 40);
}

function isValidUsername(username) {
  return /^[\p{Script=Han}a-z0-9_]{2,24}$/u.test(username);
}

function publicUser(user) {
  return {
    id: user.id || user.userId,
    username: user.username,
    displayName: user.displayName
  };
}

function readBearer(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

async function createSession(kv, user) {
  const token = randomHex(32);
  const now = Date.now();
  const session = {
    token,
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  };
  await kv.put(sessionKey(token), JSON.stringify(session));
  return session;
}

async function requireSession(request, kv) {
  const token = readBearer(request);
  if (!token) return undefined;
  const raw = await kv.get(sessionKey(token), { type: "text" });
  if (!raw) return undefined;
  const session = JSON.parse(raw);
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await kv.delete(sessionKey(token));
    return undefined;
  }
  return session;
}

async function register(kv, body) {
  const username = normalizeUsername(body.username);
  const displayName = cleanDisplayName(username);
  const password = String(body.password || "");

  if (!isValidUsername(username)) {
    return json({ error: "invalid_username" }, { status: 400 });
  }
  if (displayName.length < 2) {
    return json({ error: "invalid_display_name" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 80) {
    return json({ error: "invalid_password" }, { status: 400 });
  }

  const existing = await kv.get(userKey(username), { type: "text" });
  if (existing) {
    return json({ error: "username_taken" }, { status: 409 });
  }

  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const user = {
    id: randomHex(12),
    username,
    displayName,
    salt,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  await kv.put(userKey(username), JSON.stringify(user));
  const session = await createSession(kv, user);
  return json({ ok: true, token: session.token, user: publicUser(user) }, { status: 201 });
}

async function resetPassword(kv, body, env) {
  const recoveryToken = envValue(env, "BIYING_RECOVERY_TOKEN", envValue(env, "BIYING_ADMIN_TOKEN"));
  if (!recoveryToken) {
    return json({ error: "recovery_not_configured" }, { status: 503 });
  }
  if (String(body.recoveryToken || "") !== recoveryToken) {
    return json({ error: "invalid_recovery_code" }, { status: 401 });
  }

  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  if (!isValidUsername(username)) {
    return json({ error: "invalid_username" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 80) {
    return json({ error: "invalid_password" }, { status: 400 });
  }

  const raw = await kv.get(userKey(username), { type: "text" });
  if (!raw) {
    return json({ error: "invalid_credentials" }, { status: 404 });
  }
  const user = JSON.parse(raw);
  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const updatedUser = {
    ...user,
    salt,
    passwordHash,
    passwordUpdatedAt: new Date().toISOString()
  };
  await kv.put(userKey(username), JSON.stringify(updatedUser));
  const session = await createSession(kv, updatedUser);
  return json({ ok: true, token: session.token, user: publicUser(updatedUser) });
}

async function login(kv, body) {
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const raw = await kv.get(userKey(username), { type: "text" });
  if (!raw) {
    return json({ error: "invalid_credentials" }, { status: 401 });
  }
  const user = JSON.parse(raw);
  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return json({ error: "invalid_credentials" }, { status: 401 });
  }
  const session = await createSession(kv, user);
  return json({ ok: true, token: session.token, user: publicUser(user) });
}

export function onRequestOptions() {
  return cors();
}

export async function onRequestGet({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get) return json({ error: "kv_not_configured" }, { status: 503 });
    const session = await requireSession(request, kv);
    if (!session) return json({ user: null }, { status: 401 });
    return json({ user: publicUser(session) });
  } catch (error) {
    return json({ error: "auth_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.put || !kv.get) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    const body = await readJson(request);
    if (body.action === "login") return login(kv, body);
    if (body.action === "reset_password") return resetPassword(kv, body, env);
    return register(kv, body);
  } catch (error) {
    return json({ error: "auth_failed", detail: String(error.message || error) }, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.delete) return json({ ok: true });
    const token = readBearer(request);
    if (token) await kv.delete(sessionKey(token));
    return json({ ok: true });
  } catch (error) {
    return json({ error: "logout_failed", detail: String(error.message || error) }, { status: 500 });
  }
}
