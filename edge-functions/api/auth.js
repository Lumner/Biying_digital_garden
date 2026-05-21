import {
  cors,
  currentSession,
  enforceRateLimit,
  envValue,
  getClientIp,
  getKv,
  json,
  normalizeUsername,
  readBearer,
  readJson,
  serverError,
  sessionKey
} from "./_shared.js";

const SESSION_DAYS = 30;
const encoder = new TextEncoder();

function userKey(username) {
  return `user_${username}`;
}

function recoveryKey(username) {
  return `recovery_${username}`;
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

async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
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

  const submittedCode = String(body.recoveryToken || "").trim();
  const rawRecovery = await kv.get(recoveryKey(username), { type: "text" });
  let matchedTimedCode = false;
  if (rawRecovery) {
    const recovery = JSON.parse(rawRecovery);
    if (Date.parse(recovery.expiresAt) <= Date.now()) {
      await kv.delete(recoveryKey(username));
      return json({ error: "recovery_expired" }, { status: 410 });
    }
    matchedTimedCode = await hashText(submittedCode) === recovery.codeHash;
  }

  const fallbackRecoveryToken = envValue(env, "BIYING_RECOVERY_TOKEN", envValue(env, "BIYING_ADMIN_TOKEN"));
  const matchedFallbackCode = Boolean(fallbackRecoveryToken && submittedCode === fallbackRecoveryToken);
  if (!rawRecovery && !fallbackRecoveryToken) {
    return json({ error: "recovery_not_configured" }, { status: 503 });
  }
  if (!matchedTimedCode && !matchedFallbackCode) {
    return json({ error: "invalid_recovery_code" }, { status: 401 });
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
  if (matchedTimedCode) {
    await kv.delete(recoveryKey(username));
  }
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

async function limitAuthRequest(kv, request, clientIp, body) {
  const action = body.action === "login"
    ? "login"
    : body.action === "reset_password"
      ? "reset_password"
      : "register";
  const ip = getClientIp(request, clientIp);
  const username = normalizeUsername(body.username);
  const settings = {
    login: { limit: 8, windowMs: 60 * 1000, identifier: `${username || "unknown"}_${ip}` },
    reset_password: { limit: 5, windowMs: 10 * 60 * 1000, identifier: `${username || "unknown"}_${ip}` },
    register: { limit: 5, windowMs: 60 * 60 * 1000, identifier: ip }
  }[action];

  return enforceRateLimit(kv, {
    action: `auth_${action}`,
    ...settings
  });
}

export function onRequestOptions() {
  return cors();
}

export async function onRequestGet({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get) return json({ error: "kv_not_configured" }, { status: 503 });
    const session = await currentSession(request, kv);
    if (!session) return json({ user: null }, { status: 401 });
    return json({ user: publicUser(session) });
  } catch (error) {
    return serverError(error, "auth_failed");
  }
}

export async function onRequestPost({ request, env, clientIp }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.put || !kv.get) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    const body = await readJson(request);
    const limited = await limitAuthRequest(kv, request, clientIp, body);
    if (limited) return limited;
    if (body.action === "login") return login(kv, body);
    if (body.action === "reset_password") return resetPassword(kv, body, env);
    return register(kv, body);
  } catch (error) {
    return serverError(error, "auth_failed");
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
    return serverError(error, "logout_failed");
  }
}
