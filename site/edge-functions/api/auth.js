import {
  apiResponder,
  currentSession,
  deleteKvKey,
  enforceRateLimit,
  envValue,
  getClientIp,
  getKv,
  normalizeUsername,
  readBearer,
  readJson,
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

function sessionVersion(user) {
  const value = Number(user?.sessionVersion);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

async function createSession(kv, user) {
  const token = randomHex(32);
  const now = Date.now();
  const session = {
    token,
    userId: user.id || user.userId,
    username: user.username,
    displayName: user.displayName,
    sessionVersion: sessionVersion(user),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  };
  await kv.put(sessionKey(token), JSON.stringify(session));
  return session;
}

async function register(kv, body, reply) {
  const username = normalizeUsername(body.username);
  const displayName = cleanDisplayName(username);
  const password = String(body.password || "");

  if (!isValidUsername(username)) {
    return reply.json({ error: "invalid_username" }, { status: 400 });
  }
  if (displayName.length < 2) {
    return reply.json({ error: "invalid_display_name" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 80) {
    return reply.json({ error: "invalid_password" }, { status: 400 });
  }

  const existing = await kv.get(userKey(username), { type: "text" });
  if (existing) {
    return reply.json({ error: "username_taken" }, { status: 409 });
  }

  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const user = {
    id: randomHex(12),
    username,
    displayName,
    salt,
    passwordHash,
    sessionVersion: 0,
    createdAt: new Date().toISOString()
  };
  await kv.put(userKey(username), JSON.stringify(user));
  const session = await createSession(kv, user);
  return reply.json(
    { ok: true, token: session.token, user: publicUser(user) },
    { status: 201 }
  );
}

async function resetPassword(kv, body, env, reply, waitUntil) {
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  if (!isValidUsername(username)) {
    return reply.json({ error: "invalid_username" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 80) {
    return reply.json({ error: "invalid_password" }, { status: 400 });
  }

  const raw = await kv.get(userKey(username), { type: "text" });
  if (!raw) {
    return reply.json({ error: "invalid_credentials" }, { status: 404 });
  }

  const submittedCode = String(body.recoveryToken || "").trim();
  const recoveryStorageKey = recoveryKey(username);
  const rawRecovery = await kv.get(recoveryStorageKey, { type: "text" });
  let matchedTimedCode = false;
  let timedCodeAvailable = false;
  let timedCodeExpired = false;
  if (rawRecovery) {
    let recovery;
    try {
      recovery = JSON.parse(rawRecovery);
    } catch (error) {
      await deleteKvKey(kv, recoveryStorageKey, waitUntil);
    }
    const expiresAt = Date.parse(recovery?.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      timedCodeExpired = Boolean(recovery);
      await deleteKvKey(kv, recoveryStorageKey, waitUntil);
    } else if (recovery?.codeHash) {
      timedCodeAvailable = true;
      matchedTimedCode = await hashText(submittedCode) === recovery.codeHash;
    }
  }

  const fallbackRecoveryToken = envValue(env, "BIYING_RECOVERY_TOKEN");
  const matchedFallbackCode = Boolean(fallbackRecoveryToken && submittedCode === fallbackRecoveryToken);
  if (!timedCodeAvailable && !fallbackRecoveryToken) {
    return reply.json(
      { error: timedCodeExpired ? "recovery_expired" : "recovery_not_configured" },
      { status: timedCodeExpired ? 410 : 503 }
    );
  }
  if (!matchedTimedCode && !matchedFallbackCode) {
    return reply.json({ error: "invalid_recovery_code" }, { status: 401 });
  }

  const user = JSON.parse(raw);
  const salt = randomHex(16);
  const passwordHash = await hashPassword(password, salt);
  const updatedUser = {
    ...user,
    salt,
    passwordHash,
    sessionVersion: sessionVersion(user) + 1,
    passwordUpdatedAt: new Date().toISOString()
  };
  await kv.put(userKey(username), JSON.stringify(updatedUser));
  if (matchedTimedCode) {
    await deleteKvKey(kv, recoveryStorageKey, waitUntil);
  }
  const session = await createSession(kv, updatedUser);
  return reply.json({ ok: true, token: session.token, user: publicUser(updatedUser) });
}

async function login(kv, body, reply) {
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const raw = await kv.get(userKey(username), { type: "text" });
  if (!raw) {
    return reply.json({ error: "invalid_credentials" }, { status: 401 });
  }
  const user = JSON.parse(raw);
  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return reply.json({ error: "invalid_credentials" }, { status: 401 });
  }
  const session = await createSession(kv, user);
  return reply.json({ ok: true, token: session.token, user: publicUser(user) });
}

async function limitAuthRequest(kv, request, clientIp, body, reply) {
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
  }, reply);
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
    if (!kv || !kv.get) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }
    const session = await currentSession(request, kv, { waitUntil });
    if (!session) return reply.json({ user: null }, { status: 401 });
    return reply.json({ user: publicUser(session) });
  } catch (error) {
    return reply.error(error, "auth_failed");
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
    if (!kv || !kv.put || !kv.get) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }
    const body = await readJson(request);
    const limited = await limitAuthRequest(kv, request, clientIp, body, reply);
    if (limited) return limited;
    if (body.action === "login") return login(kv, body, reply);
    if (body.action === "reset_password") {
      return resetPassword(kv, body, env, reply, waitUntil);
    }
    return register(kv, body, reply);
  } catch (error) {
    return reply.error(error, "auth_failed");
  }
}

export async function onRequestDelete({ request, env }) {
  const reply = apiResponder(request, env);
  try {
    const kv = getKv(env);
    if (!kv || !kv.delete) return reply.json({ ok: true });
    const token = readBearer(request);
    if (token) await kv.delete(sessionKey(token));
    return reply.json({ ok: true });
  } catch (error) {
    return reply.error(error, "logout_failed");
  }
}
