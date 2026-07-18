const DEFAULT_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const OFFICIAL_ORIGIN = "https://www.biying.site";
export const SESSION_COOKIE_NAME = "biying_session";
export const ADMIN_SESSION_COOKIE_NAME = "biying_admin_session";
const DEFAULT_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-headers": "content-type, authorization"
};
const AUTH_MODES = new Set(["bearer", "dual", "cookie"]);
const ADMIN_AUTH_MODES = new Set(["token", "dual", "cookie"]);
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(value) {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.origin;
  } catch (error) {
    return "";
  }
}

function configuredOrigins(env) {
  const configured = String(envValue(env, "BIYING_ALLOWED_ORIGINS", ""))
    .split(/[,\s]+/)
    .map(normalizeOrigin)
    .filter(Boolean);
  return new Set([OFFICIAL_ORIGIN, ...configured]);
}

function appendVary(headers, value) {
  const existing = String(headers.get("vary") || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!existing.some((part) => part.toLowerCase() === value.toLowerCase())) {
    existing.push(value);
  }
  headers.set("vary", existing.join(", "));
}

function allowedOrigin(request, env) {
  const origin = normalizeOrigin(request?.headers?.get("origin"));
  if (!origin) return "";

  const ownOrigin = normalizeOrigin(request?.url);
  if (origin === ownOrigin || configuredOrigins(env).has(origin)) {
    return origin;
  }
  return "";
}

export function responseHeaders(
  request,
  env,
  methods = DEFAULT_METHODS,
  extraHeaders = {}
) {
  const headers = new Headers(DEFAULT_HEADERS);
  new Headers(extraHeaders).forEach((value, key) => {
    headers.set(key, value);
  });
  headers.set("access-control-allow-methods", methods);
  appendVary(headers, "Origin");

  const origin = allowedOrigin(request, env);
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-credentials", "true");
  } else {
    headers.delete("access-control-allow-origin");
    headers.delete("access-control-allow-credentials");
  }
  return headers;
}

export function json(data, init = {}, methods = DEFAULT_METHODS, context = {}) {
  const headers = responseHeaders(
    context.request,
    context.env,
    methods,
    init.headers || {}
  );
  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

export function cors(methods = DEFAULT_METHODS, context = {}) {
  return new Response(null, {
    status: 204,
    headers: responseHeaders(context.request, context.env, methods)
  });
}

export function apiResponder(request, env, methods = DEFAULT_METHODS) {
  const context = { request, env };
  return {
    cors: () => cors(methods, context),
    error: (error, fallbackCode = "server_error") => (
      serverError(error, fallbackCode, undefined, context, methods)
    ),
    headers: (extraHeaders = {}) => responseHeaders(
      request,
      env,
      methods,
      extraHeaders
    ),
    json: (data, init = {}) => json(data, init, methods, context),
    rateLimited: (result) => rateLimitResponse(result, undefined, context, methods)
  };
}

export function getKv(env) {
  if (env && env.BIYING_KV) return env.BIYING_KV;
  if (typeof globalThis.BIYING_KV !== "undefined") return globalThis.BIYING_KV;
  return undefined;
}

export function envValue(env, key, fallback = "") {
  return env && env[key] ? env[key] : fallback;
}

export function codedError(code, message, status = 500) {
  const error = new Error(message || code);
  error.code = code;
  error.status = status;
  return error;
}

export function readBearer(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim().slice(0, 256) : "";
}

export function readCookie(request, name = SESSION_COOKIE_NAME) {
  const header = request?.headers?.get("cookie") || "";
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    const value = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(value).slice(0, 256);
    } catch (error) {
      return value.slice(0, 256);
    }
  }
  return "";
}

export function authenticationMode(env) {
  const configured = String(envValue(env, "BIYING_AUTH_MODE", "bearer"))
    .trim()
    .toLowerCase();
  return AUTH_MODES.has(configured) ? configured : "bearer";
}

export function adminAuthenticationMode(env) {
  const configured = String(envValue(env, "BIYING_ADMIN_AUTH_MODE", "dual"))
    .trim()
    .toLowerCase();
  return ADMIN_AUTH_MODES.has(configured) ? configured : "dual";
}

export function sessionCredentials(request, env, mode = authenticationMode(env)) {
  const bearer = readBearer(request);
  const cookie = readCookie(request);
  const credentials = mode === "cookie"
    ? [{ source: "cookie", token: cookie }]
    : mode === "dual"
      ? [
          { source: "cookie", token: cookie },
          { source: "bearer", token: bearer }
        ]
      : [{ source: "bearer", token: bearer }];
  const seen = new Set();
  return credentials.filter((credential) => {
    if (!credential.token || seen.has(credential.token)) return false;
    seen.add(credential.token);
    return true;
  });
}

export function mutationOriginAllowed(request, env, options = {}) {
  const method = String(request?.method || "GET").toUpperCase();
  if (SAFE_METHODS.has(method)) return true;
  const required = (
    envValue(env, "BIYING_STRICT_ORIGIN_CHECK", "0") === "1"
    || options.required === true
    || options.authSource === "cookie"
    || (options.setsSessionCookie && authenticationMode(env) !== "bearer")
  );
  return !required || Boolean(allowedOrigin(request, env));
}

export function sessionKey(token) {
  return `session_${token}`;
}

export function adminSessionKey(token) {
  return `admin_session_${token}`;
}

export async function deleteKvKey(kv, key, waitUntil) {
  if (!kv || !kv.delete || !key) return;
  const deletion = Promise.resolve()
    .then(() => kv.delete(key))
    .catch(() => undefined);
  if (typeof waitUntil === "function") {
    waitUntil(deletion);
    return;
  }
  await deletion;
}

function recordVersion(value) {
  const version = Number(value);
  return Number.isSafeInteger(version) && version >= 0 ? version : 0;
}

async function sessionForCredential(credential, kv, options) {
  const { source, token } = credential;
  const key = sessionKey(token);
  const raw = await kv.get(key, { type: "text" });
  if (!raw) return undefined;
  let session;
  try {
    session = JSON.parse(raw);
  } catch (error) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }
  if (!session || !session.userId || !session.username || !session.expiresAt) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }
  const expiresAt = Date.parse(session.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }

  const rawUser = await kv.get(`user_${normalizeUsername(session.username)}`, { type: "text" });
  if (!rawUser) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch (error) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }

  const userId = user.id || user.userId;
  if (
    !userId
    || userId !== session.userId
    || recordVersion(user.sessionVersion) !== recordVersion(session.sessionVersion)
  ) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }

  return {
    ...session,
    authSource: source,
    displayName: user.displayName || session.displayName,
    sessionVersion: recordVersion(user.sessionVersion)
  };
}

export async function currentSession(request, kv, options = {}) {
  if (!kv || !kv.get) return undefined;
  const credentials = sessionCredentials(
    request,
    options.env,
    options.mode || authenticationMode(options.env)
  );
  for (const credential of credentials) {
    const session = await sessionForCredential(credential, kv, options);
    if (session) return session;
  }
  return undefined;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

export function cleanText(value, max) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

export function normalizeUsername(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

export function isAdminToken(request, env) {
  const token = env && env.BIYING_ADMIN_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
}

async function adminCookieSession(request, kv, options = {}) {
  if (!kv || !kv.get) return undefined;
  const token = readCookie(request, ADMIN_SESSION_COOKIE_NAME);
  if (!token) return undefined;
  const key = adminSessionKey(token);
  const raw = await kv.get(key, { type: "text" });
  if (!raw) return undefined;

  let session;
  try {
    session = JSON.parse(raw);
  } catch (error) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }
  const expiresAt = Date.parse(session?.expiresAt);
  if (
    !session
    || session.token !== token
    || !Number.isFinite(expiresAt)
    || expiresAt <= Date.now()
  ) {
    await deleteKvKey(kv, key, options.waitUntil);
    return undefined;
  }
  return {
    ...session,
    authSource: "cookie"
  };
}

export async function currentAdmin(request, env, options = {}) {
  const mode = options.mode || adminAuthenticationMode(env);
  const kv = options.kv || getKv(env);
  if (mode !== "token") {
    const session = await adminCookieSession(request, kv, options);
    if (session) return session;
  }
  if (mode !== "cookie" && isAdminToken(request, env)) {
    return {
      authSource: "bearer",
      createdAt: "",
      expiresAt: ""
    };
  }
  return undefined;
}

export function getClientIp(request, clientIp) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const headerIp = forwarded.split(",")[0]
    || request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || "";
  return String(clientIp || headerIp || "unknown").trim().slice(0, 80);
}

function safeRateKeyPart(value) {
  const normalized = String(value || "anonymous")
    .normalize("NFKC")
    .trim()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}._:-]+/gu, "_")
    .slice(0, 120);
  return normalized || "anonymous";
}

function parseRateState(raw, now) {
  if (!raw) return { state: { windowStart: now, count: 0 }, stale: false };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "number" && Number.isFinite(parsed)) {
      return { state: { windowStart: parsed, count: 1 }, stale: false };
    }
    if (parsed && Number.isFinite(parsed.windowStart) && Number.isFinite(parsed.count)) {
      const expiresAt = Date.parse(parsed.expiresAt);
      return {
        state: { windowStart: parsed.windowStart, count: parsed.count },
        stale: Number.isFinite(expiresAt) && expiresAt <= now
      };
    }
  } catch (error) {
    const timestamp = Number(raw);
    if (Number.isFinite(timestamp)) {
      return { state: { windowStart: timestamp, count: 1 }, stale: false };
    }
  }
  return { state: { windowStart: now, count: 0 }, stale: true };
}

export async function rateLimit(kv, options = {}) {
  const {
    action = "default",
    identifier = "anonymous",
    key,
    limit = 10,
    windowMs = 60000
  } = options;

  if (!kv || !kv.get || !kv.put) {
    return { limited: false, remaining: limit, retryAfterMs: 0 };
  }

  const now = Date.now();
  const rateKey = key || `rate_${safeRateKeyPart(action)}_${safeRateKeyPart(identifier)}`;
  const raw = await kv.get(rateKey, { type: "text" });
  const parsed = parseRateState(raw, now);
  let state = parsed.state;

  if (parsed.stale || now - state.windowStart >= windowMs) {
    await deleteKvKey(kv, rateKey);
    state = { windowStart: now, count: 0 };
  }

  state.count += 1;
  const retryAfterMs = Math.max(0, state.windowStart + windowMs - now);
  await kv.put(rateKey, JSON.stringify({
    ...state,
    expiresAt: new Date(state.windowStart + windowMs).toISOString()
  }));

  return {
    limited: state.count > limit,
    remaining: Math.max(0, limit - state.count),
    retryAfterMs,
    key: rateKey
  };
}

export function rateLimitResponse(
  result,
  init = {},
  context = {},
  methods = DEFAULT_METHODS
) {
  return json({
    error: "too_frequent",
    retryAfterMs: result.retryAfterMs
  }, {
    ...init,
    status: 429,
    headers: {
      ...(init.headers || {}),
      "retry-after": String(Math.max(1, Math.ceil((result.retryAfterMs || 0) / 1000)))
    }
  }, methods, context);
}

export async function enforceRateLimit(kv, options = {}, response) {
  const result = await rateLimit(kv, options);
  return result.limited
    ? response?.rateLimited?.(result) || rateLimitResponse(result)
    : undefined;
}

export function serverError(
  error,
  fallbackCode = "server_error",
  init = {},
  context = {},
  methods = DEFAULT_METHODS
) {
  const status = Number.isFinite(error?.status) ? error.status : 500;
  return json(
    { error: error && error.code ? error.code : fallbackCode },
    { ...init, status },
    methods,
    context
  );
}
