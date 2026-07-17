import {
  apiResponder,
  enforceRateLimit,
  envValue,
  getClientIp,
  getKv,
  readJson
} from "./_shared.js";

const STATS_KEY = "site_stats_global";
const VISITOR_PREFIX = "site_visitor_";
const METHODS = "GET, POST, OPTIONS";

function emptyStats() {
  return {
    pageViews: 0,
    totalVisitors: 0,
    updatedAt: ""
  };
}

function publicStats(stats, available = true) {
  return {
    available,
    pageViews: Math.max(0, Number(stats.pageViews) || 0),
    totalVisitors: Math.max(0, Number(stats.totalVisitors) || 0),
    updatedAt: stats.updatedAt || ""
  };
}

function cleanVisitorId(value) {
  const visitorId = String(value || "")
    .normalize("NFKC")
    .trim();
  if (visitorId.length < 8 || visitorId.length > 80) return "";
  return /^[A-Za-z0-9._-]+$/.test(visitorId) ? visitorId : "";
}

function cleanLocale(value) {
  return value === "en" ? "en" : "zh";
}

async function readStats(kv) {
  const raw = await kv.get(STATS_KEY, { type: "text" });
  if (!raw) return emptyStats();
  try {
    return { ...emptyStats(), ...JSON.parse(raw) };
  } catch (error) {
    return emptyStats();
  }
}

function readVisitor(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch (error) {
    return {};
  }
}

function statsWriteEnabled(env) {
  return String(envValue(env, "BIYING_STATS_WRITE_ENABLED", "1")).trim() !== "0";
}

export function onRequestOptions(context = {}) {
  return apiResponder(context.request, context.env, METHODS).cors();
}

export async function onRequestGet({ request, env }) {
  const reply = apiResponder(request, env, METHODS);
  try {
    const kv = getKv(env);
    if (!kv || !kv.get) {
      return reply.json(publicStats(emptyStats(), false), {
        headers: { "cache-control": "no-store" }
      });
    }

    return reply.json(publicStats(await readStats(kv)), {
      headers: { "cache-control": "no-store" }
    });
  } catch (error) {
    return reply.error(error, "stats_failed");
  }
}

export async function onRequestPost({ request, env, clientIp }) {
  const reply = apiResponder(request, env, METHODS);
  try {
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.put) {
      return reply.json({ error: "kv_not_configured", ...publicStats(emptyStats(), false) }, {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
    }

    if (!statsWriteEnabled(env)) {
      return reply.json(publicStats(await readStats(kv)), {
        headers: { "cache-control": "no-store" }
      });
    }

    const body = await readJson(request);
    const visitorId = cleanVisitorId(body.visitorId);
    if (!visitorId) {
      return reply.json({ error: "visitor_id_required" }, { status: 400 });
    }

    const ip = getClientIp(request, clientIp);
    const ipLimited = await enforceRateLimit(kv, {
      action: "stats_write_ip",
      identifier: ip,
      limit: 60,
      windowMs: 60 * 1000
    }, reply);
    if (ipLimited) return ipLimited;

    const visitorLimited = await enforceRateLimit(kv, {
      action: "stats_write_visitor",
      identifier: visitorId,
      limit: 30,
      windowMs: 60 * 1000
    }, reply);
    if (visitorLimited) return visitorLimited;

    const now = new Date().toISOString();
    const visitorKey = `${VISITOR_PREFIX}${visitorId}`;
    const previousVisitorRaw = await kv.get(visitorKey, { type: "text" });
    const previousVisitor = readVisitor(previousVisitorRaw);
    const stats = await readStats(kv);

    stats.pageViews = (Number(stats.pageViews) || 0) + 1;
    if (!previousVisitorRaw) {
      stats.totalVisitors = (Number(stats.totalVisitors) || 0) + 1;
    }
    stats.updatedAt = now;

    await kv.put(STATS_KEY, JSON.stringify(stats));
    await kv.put(visitorKey, JSON.stringify({
      firstSeenAt: previousVisitor.firstSeenAt || now,
      lastSeenAt: now,
      locale: cleanLocale(body.locale)
    }));

    return reply.json(publicStats(stats), {
      headers: { "cache-control": "no-store" }
    });
  } catch (error) {
    return reply.error(error, "stats_update_failed");
  }
}
