import {
  apiResponder,
  authenticationMode,
  currentSession,
  deleteKvKey,
  enforceRateLimit,
  envValue,
  getClientIp,
  getKv,
  mutationOriginAllowed,
  normalizeUsername,
  readJson,
  SESSION_COOKIE_NAME,
  sessionCredentials,
  sessionKey
} from "./_shared.js";

const SESSION_DAYS = 30;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;
const PASSWORD_ALGORITHM = "pbkdf2-sha256";
const PASSWORD_VERSION = 2;
const LEGACY_PASSWORD_ITERATIONS = 100000;
const DEFAULT_PASSWORD_ITERATIONS = LEGACY_PASSWORD_ITERATIONS;
const MIN_PASSWORD_ITERATIONS = LEGACY_PASSWORD_ITERATIONS;
const MAX_PASSWORD_ITERATIONS = 1000000;
const DUMMY_PASSWORD_SALT = "9f4d7a2c65183eb0d6a947c135f28b0e";
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

function passwordIterations(env) {
  const configured = Number(envValue(
    env,
    "BIYING_PASSWORD_ITERATIONS",
    DEFAULT_PASSWORD_ITERATIONS
  ));
  return Number.isSafeInteger(configured)
    && configured >= MIN_PASSWORD_ITERATIONS
    && configured <= MAX_PASSWORD_ITERATIONS
    ? configured
    : DEFAULT_PASSWORD_ITERATIONS;
}

async function hashPassword(password, salt, iterations) {
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
      iterations,
      hash: "SHA-256"
    },
    key,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function passwordRecordIsValid(user) {
  const algorithm = user?.passwordAlgorithm || PASSWORD_ALGORITHM;
  const iterations = user?.passwordIterations === undefined
    ? LEGACY_PASSWORD_ITERATIONS
    : Number(user.passwordIterations);
  const version = user?.passwordVersion === undefined
    ? 1
    : Number(user.passwordVersion);
  return Boolean(
    algorithm === PASSWORD_ALGORITHM
    && Number.isSafeInteger(iterations)
    && iterations >= MIN_PASSWORD_ITERATIONS
    && iterations <= MAX_PASSWORD_ITERATIONS
    && Number.isSafeInteger(version)
    && version >= 1
    && version <= PASSWORD_VERSION
    && /^[a-f0-9]{32}$/i.test(String(user?.salt || ""))
    && /^[a-f0-9]{64}$/i.test(String(user?.passwordHash || ""))
  );
}

function storedPasswordIterations(user) {
  return user.passwordIterations === undefined
    ? LEGACY_PASSWORD_ITERATIONS
    : Number(user.passwordIterations);
}

function constantTimeHexEqual(left, right) {
  const first = String(left || "");
  const second = String(right || "");
  let difference = first.length ^ second.length;
  const length = Math.max(first.length, second.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (first.charCodeAt(index) || 0) ^ (second.charCodeAt(index) || 0);
  }
  return difference === 0;
}

async function newPasswordRecord(password, env) {
  const iterations = passwordIterations(env);
  const salt = randomHex(16);
  return {
    salt,
    passwordHash: await hashPassword(password, salt, iterations),
    passwordAlgorithm: PASSWORD_ALGORITHM,
    passwordIterations: iterations,
    passwordVersion: PASSWORD_VERSION
  };
}

async function verifyPassword(raw, password, env) {
  const currentIterations = passwordIterations(env);
  let user;
  try {
    user = raw ? JSON.parse(raw) : undefined;
  } catch (error) {
    user = undefined;
  }
  if (!user || !passwordRecordIsValid(user)) {
    await hashPassword(password, DUMMY_PASSWORD_SALT, currentIterations);
    return { valid: false };
  }

  const iterations = storedPasswordIterations(user);
  const candidate = await hashPassword(password, user.salt, iterations);
  const valid = constantTimeHexEqual(candidate, user.passwordHash);
  if (!valid && iterations < currentIterations) {
    await hashPassword(
      password,
      DUMMY_PASSWORD_SALT,
      currentIterations - iterations
    );
  }
  return { valid, user, iterations };
}

function passwordNeedsUpgrade(user, iterations, env) {
  return (
    user.passwordAlgorithm !== PASSWORD_ALGORITHM
    || Number(user.passwordVersion || 1) < PASSWORD_VERSION
    || user.passwordIterations === undefined
    || iterations < passwordIterations(env)
  );
}

export async function benchmarkPasswordHash(env, requestedRuns = 3) {
  const runs = Math.min(7, Math.max(3, Number(requestedRuns) || 3));
  const iterations = passwordIterations(env);
  const samplesMs = [];
  const now = () => globalThis.performance?.now?.() || Date.now();
  await hashPassword("benchmark-only-password", randomHex(16), iterations);
  for (let run = 0; run < runs; run += 1) {
    const startedAt = now();
    await hashPassword("benchmark-only-password", randomHex(16), iterations);
    samplesMs.push(now() - startedAt);
  }
  const sorted = [...samplesMs].sort((left, right) => left - right);
  const medianMs = sorted[Math.floor(sorted.length / 2)];
  const p95Ms = sorted[Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * 0.95) - 1
  )];
  return {
    iterations,
    runs,
    medianMs: Number(medianMs.toFixed(2)),
    p95Ms: Number(p95Ms.toFixed(2)),
    targetMinMs: 100,
    targetMaxMs: 250,
    withinTarget: medianMs >= 100 && medianMs <= 250
  };
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

function sessionCookie(token, maxAge = SESSION_SECONDS) {
  const value = token ? encodeURIComponent(token) : "";
  const expires = maxAge === 0 ? "; Expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}${expires}`;
}

function sessionResponse(reply, session, user, env, init = {}) {
  const mode = authenticationMode(env);
  const payload = {
    ok: true,
    user: publicUser(user)
  };
  if (mode !== "cookie") payload.token = session.token;
  const headers = {
    "cache-control": "no-store",
    ...(init.headers || {})
  };
  if (mode !== "bearer") headers["set-cookie"] = sessionCookie(session.token);
  return reply.json(payload, { ...init, headers });
}

function clearedSessionHeaders(env) {
  const headers = { "cache-control": "no-store" };
  if (authenticationMode(env) !== "bearer") {
    headers["set-cookie"] = sessionCookie("", 0);
  }
  return headers;
}

async function register(kv, body, env, reply) {
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

  const passwordRecord = await newPasswordRecord(password, env);
  const user = {
    id: randomHex(12),
    username,
    displayName,
    ...passwordRecord,
    sessionVersion: 0,
    createdAt: new Date().toISOString()
  };
  await kv.put(userKey(username), JSON.stringify(user));
  const session = await createSession(kv, user);
  return sessionResponse(reply, session, user, env, { status: 201 });
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
  const passwordRecord = await newPasswordRecord(password, env);
  const updatedUser = {
    ...user,
    ...passwordRecord,
    sessionVersion: sessionVersion(user) + 1,
    passwordUpdatedAt: new Date().toISOString()
  };
  await kv.put(userKey(username), JSON.stringify(updatedUser));
  if (matchedTimedCode) {
    await deleteKvKey(kv, recoveryStorageKey, waitUntil);
  }
  const session = await createSession(kv, updatedUser);
  return sessionResponse(reply, session, updatedUser, env);
}

async function login(kv, body, env, reply) {
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const raw = await kv.get(userKey(username), { type: "text" });
  const verification = await verifyPassword(raw, password, env);
  if (!verification.valid) {
    return reply.json({ error: "invalid_credentials" }, { status: 401 });
  }
  let user = verification.user;
  if (passwordNeedsUpgrade(user, verification.iterations, env)) {
    user = {
      ...user,
      ...await newPasswordRecord(password, env),
      passwordRehashedAt: new Date().toISOString()
    };
    await kv.put(userKey(username), JSON.stringify(user));
  }
  const session = await createSession(kv, user);
  return sessionResponse(reply, session, user, env);
}

async function migrateSession(kv, request, env, reply, waitUntil) {
  if (authenticationMode(env) !== "dual") {
    return reply.json({ error: "migration_unavailable" }, { status: 409 });
  }
  const session = await currentSession(request, kv, {
    env,
    mode: "bearer",
    waitUntil
  });
  if (!session) {
    return reply.json({ error: "auth_required" }, { status: 401 });
  }
  return reply.json({
    ok: true,
    migrated: true,
    user: publicUser(session)
  }, {
    headers: {
      "cache-control": "no-store",
      "set-cookie": sessionCookie(session.token)
    }
  });
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
    const session = await currentSession(request, kv, { env, waitUntil });
    if (!session) return reply.json({ user: null }, { status: 401 });
    return reply.json(
      { user: publicUser(session) },
      { headers: { "cache-control": "no-store" } }
    );
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
    if (!mutationOriginAllowed(request, env, { setsSessionCookie: true })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }
    if (body.action === "migrate_session") {
      return migrateSession(kv, request, env, reply, waitUntil);
    }
    const limited = await limitAuthRequest(kv, request, clientIp, body, reply);
    if (limited) return limited;
    if (body.action === "login") return login(kv, body, env, reply);
    if (body.action === "reset_password") {
      return resetPassword(kv, body, env, reply, waitUntil);
    }
    return register(kv, body, env, reply);
  } catch (error) {
    return reply.error(error, "auth_failed");
  }
}

export async function onRequestDelete({ request, env }) {
  const reply = apiResponder(request, env);
  try {
    const kv = getKv(env);
    const credentials = sessionCredentials(request, env);
    const authSource = credentials.some(({ source }) => source === "cookie")
      ? "cookie"
      : credentials[0]?.source || "";
    if (!mutationOriginAllowed(request, env, {
      authSource,
      setsSessionCookie: true
    })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }
    if (kv && kv.delete) {
      await Promise.all(
        credentials.map(({ token }) => kv.delete(sessionKey(token)))
      );
    }
    return reply.json({ ok: true }, { headers: clearedSessionHeaders(env) });
  } catch (error) {
    return reply.error(error, "logout_failed");
  }
}
