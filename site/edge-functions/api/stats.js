import {
  cleanText,
  cors,
  getKv,
  json,
  readJson,
  serverError
} from "./_shared.js";

const STATS_KEY = "site_stats_global";
const VISITOR_PREFIX = "site_visitor_";

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
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/[^\w.-]+/g, "")
    .slice(0, 80);
}

function cleanPath(value) {
  const cleaned = cleanText(value, 180);
  if (!cleaned || cleaned.includes("://")) return "/";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
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

export function onRequestOptions() {
  return cors("GET, POST, OPTIONS");
}

export async function onRequestGet({ env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get) {
      return json(publicStats(emptyStats(), false), {
        headers: { "cache-control": "no-store" }
      }, "GET, POST, OPTIONS");
    }

    return json(publicStats(await readStats(kv)), {
      headers: { "cache-control": "no-store" }
    }, "GET, POST, OPTIONS");
  } catch (error) {
    return serverError(error, "stats_failed");
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get || !kv.put) {
      return json({ error: "kv_not_configured", ...publicStats(emptyStats(), false) }, {
        status: 503,
        headers: { "cache-control": "no-store" }
      }, "GET, POST, OPTIONS");
    }

    const body = await readJson(request);
    const visitorId = cleanVisitorId(body.visitorId);
    if (!visitorId) {
      return json({ error: "visitor_id_required" }, { status: 400 }, "GET, POST, OPTIONS");
    }

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
      lastPath: cleanPath(body.path),
      locale: cleanLocale(body.locale)
    }));

    return json(publicStats(stats), {
      headers: { "cache-control": "no-store" }
    }, "GET, POST, OPTIONS");
  } catch (error) {
    return serverError(error, "stats_update_failed");
  }
}
