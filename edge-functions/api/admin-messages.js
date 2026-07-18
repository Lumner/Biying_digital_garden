import {
  apiResponder,
  currentAdmin,
  enforceRateLimit,
  getClientIp,
  getKv,
  mutationOriginAllowed
} from "./_shared.js";

export function onRequestOptions(context = {}) {
  return apiResponder(context.request, context.env, "DELETE, OPTIONS").cors();
}

export async function onRequestDelete({ request, env, clientIp }) {
  const reply = apiResponder(request, env, "DELETE, OPTIONS");
  try {
    const kv = getKv(env);
    const admin = await currentAdmin(request, env, { kv });
    if (!admin) {
      return reply.json({ error: "unauthorized" }, { status: 401 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: admin.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return reply.json({ error: "id_required" }, { status: 400 });
    }
    if (!kv || !kv.delete) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }

    const limited = await enforceRateLimit(kv, {
      action: "admin_message_delete",
      identifier: getClientIp(request, clientIp),
      limit: 30,
      windowMs: 60 * 1000
    }, reply);
    if (limited) return limited;

    await kv.delete(`guestbook_${id}`);
    return reply.json({ ok: true });
  } catch (error) {
    return reply.error(error, "admin_message_delete_failed");
  }
}
