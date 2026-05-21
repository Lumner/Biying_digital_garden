import { cors, getKv, isAdmin, json, serverError } from "./_shared.js";

export function onRequestOptions() {
  return cors("DELETE, OPTIONS");
}

export async function onRequestDelete({ request, env }) {
  try {
    if (!isAdmin(request, env)) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return json({ error: "id_required" }, { status: 400 });
    }
    const kv = getKv(env);
    if (!kv || !kv.delete) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    await kv.delete(`guestbook_${id}`);
    return json({ ok: true });
  } catch (error) {
    return serverError(error, "admin_message_delete_failed");
  }
}
