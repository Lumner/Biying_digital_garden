const DEFAULT_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const DEFAULT_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization"
};

function apiHeaders(methods = DEFAULT_METHODS) {
  return {
    ...DEFAULT_HEADERS,
    "access-control-allow-methods": methods
  };
}

export function json(data, init = {}, methods = DEFAULT_METHODS) {
  const headers = {
    ...apiHeaders(methods),
    ...(init.headers || {})
  };
  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

export function cors(methods = DEFAULT_METHODS) {
  return new Response(null, { status: 204, headers: apiHeaders(methods) });
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

export function sessionKey(token) {
  return `session_${token}`;
}

export async function currentSession(request, kv) {
  const token = readBearer(request);
  if (!token || !kv || !kv.get) return undefined;
  const raw = await kv.get(sessionKey(token), { type: "text" });
  if (!raw) return undefined;
  let session;
  try {
    session = JSON.parse(raw);
  } catch (error) {
    if (kv.delete) await kv.delete(sessionKey(token));
    return undefined;
  }
  if (!session || !session.userId || !session.username || !session.expiresAt) return undefined;
  const expiresAt = Date.parse(session.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    if (kv.delete) await kv.delete(sessionKey(token));
    return undefined;
  }
  return session;
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

export function isAdmin(request, env) {
  const token = env && env.BIYING_ADMIN_TOKEN;
  return Boolean(token && request.headers.get("authorization") === `Bearer ${token}`);
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
  if (!raw) return { windowStart: now, count: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "number" && Number.isFinite(parsed)) {
      return { windowStart: parsed, count: 1 };
    }
    if (parsed && Number.isFinite(parsed.windowStart) && Number.isFinite(parsed.count)) {
      return { windowStart: parsed.windowStart, count: parsed.count };
    }
  } catch (error) {
    const timestamp = Number(raw);
    if (Number.isFinite(timestamp)) return { windowStart: timestamp, count: 1 };
  }
  return { windowStart: now, count: 0 };
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
  let state = parseRateState(raw, now);

  if (now - state.windowStart >= windowMs) {
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

export function rateLimitResponse(result) {
  return json({
    error: "too_frequent",
    retryAfterMs: result.retryAfterMs
  }, {
    status: 429,
    headers: {
      "retry-after": String(Math.max(1, Math.ceil((result.retryAfterMs || 0) / 1000)))
    }
  });
}

export async function enforceRateLimit(kv, options = {}) {
  const result = await rateLimit(kv, options);
  return result.limited ? rateLimitResponse(result) : undefined;
}

export function serverError(error, fallbackCode = "server_error") {
  const status = Number.isFinite(error?.status) ? error.status : 500;
  return json(
    { error: error && error.code ? error.code : fallbackCode },
    { status }
  );
}
