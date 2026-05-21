import {
  cleanText,
  cors,
  enforceRateLimit,
  getClientIp,
  getKv,
  json,
  readJson,
  serverError
} from "./_shared.js";

function clean(value, max) {
  return cleanText(value, max);
}

function randomId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function onRequestOptions() {
  return cors("POST, OPTIONS");
}

export async function onRequestPost({ request, env, clientIp }) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.put) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }

    const body = await readJson(request);
    if (body.website) {
      return json({ ok: true, ignored: true });
    }

    const name = clean(body.name, 40);
    const contact = clean(body.contact, 120);
    const accountUsername = clean(body.accountUsername, 40);
    const content = clean(body.content, 800);
    if (!name) return json({ error: "name_required" }, { status: 400 });
    if (!contact) return json({ error: "contact_required" }, { status: 400 });
    if (!content) return json({ error: "content_required" }, { status: 400 });

    const limited = await enforceRateLimit(kv, {
      action: "private_message",
      identifier: getClientIp(request, clientIp),
      limit: 3,
      windowMs: 10 * 60 * 1000
    });
    if (limited) return limited;

    const now = new Date().toISOString();
    const id = `${Date.now()}_${randomId()}`;
    const message = {
      id,
      name,
      contact,
      accountUsername,
      content,
      locale: body.locale === "en" ? "en" : "zh",
      status: "unread",
      createdAt: now,
      updatedAt: ""
    };

    await kv.put(`private_message_${id}`, JSON.stringify(message));
    return json({ ok: true }, { status: 201 });
  } catch (error) {
    return serverError(error, "private_message_failed");
  }
}
