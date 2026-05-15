const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization"
};

const PERSONA = `你是碧影，一个男性虚构赛博数字分身。
你的性格细致、内敛、温柔，语气自然克制。可以用“你好，很高兴认识你”这种温和方式开启对话。
你只能基于 PUBLIC_CONTEXT 中的公开网站内容回答与网站主人、项目、笔记、当前状态有关的问题，像 RAG 一样使用公开上下文。
不要声称知道未公开资料、GitHub 活动、私密笔记、本地文件、草稿或聊天记录。
如果公开资料没有答案，直接说明“公开资料里还没有这部分信息”，不要编造网站主人的真实经历、成绩、项目成果或联系方式。
你可以根据用户需求进行闲聊，回应情绪、兴趣和日常话题，但不能假装知道网站主人未公开的生活细节。
你不能输出违法乱纪、违背公序良德、鼓励伤害、欺骗、侵权、仇恨、色情、暴力或危险行为的内容。
你不能说脏话，不能辱骂、歧视或故意冒犯用户。
当用户请求越界内容时，温和拒绝，并尽量引导到安全、建设性的方向。
回答要清楚、简洁、温和，并尽量引用公开页面链接。`;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), { ...init, headers: HEADERS });
}

function cors() {
  return new Response(null, { status: 204, headers: HEADERS });
}

function envValue(env, key, fallback = "") {
  return env && env[key] ? env[key] : fallback;
}

function codedError(code, message, status = 500) {
  const error = new Error(message || code);
  error.code = code;
  error.status = status;
  return error;
}

function getKv(env) {
  if (env && env.BIYING_KV) return env.BIYING_KV;
  if (typeof globalThis.BIYING_KV !== "undefined") return globalThis.BIYING_KV;
  return undefined;
}

function sessionKey(token) {
  return `session_${token}`;
}

function readBearer(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

async function currentSession(request, kv) {
  const token = readBearer(request);
  if (!token || !kv || !kv.get) return undefined;
  const raw = await kv.get(sessionKey(token), { type: "text" });
  if (!raw) return undefined;
  const session = JSON.parse(raw);
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await kv.delete(sessionKey(token));
    return undefined;
  }
  return session;
}

async function readKnowledge(env, request) {
  const kv = getKv(env);
  if (!kv || !kv.get) return [];
  const raw = await kv.get("public_knowledge", { type: "text" });
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.items) ? parsed.items : [];
}

async function readStaticKnowledge(request) {
  try {
    const url = new URL("/assets/knowledge/public-knowledge.json", request.url);
    const response = await fetch(url.toString());
    if (!response.ok) return [];
    const parsed = await response.json();
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (error) {
    return [];
  }
}

function score(item, message) {
  const query = message.toLowerCase();
  const haystack = `${item.title || ""} ${item.summary || ""} ${item.text || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
  let points = haystack.includes(query) ? 8 : 0;
  for (const token of query.split(/\s+/).filter(Boolean)) {
    if (haystack.includes(token)) points += token.length > 2 ? 3 : 1;
  }
  return points;
}

function retrieve(items, message) {
  return items
    .map((item) => ({ item, score: score(item, message) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((entry) => entry.item);
}

async function callModel(env, messages) {
  const provider = envValue(env, "AI_PROVIDER", "deepseek");
  const baseUrl = provider === "openai"
    ? envValue(env, "OPENAI_BASE_URL", "https://api.openai.com")
    : envValue(env, "DEEPSEEK_BASE_URL", "https://api.deepseek.com");
  const apiKey = provider === "openai"
    ? envValue(env, "OPENAI_API_KEY")
    : envValue(env, "DEEPSEEK_API_KEY");
  const model = provider === "openai"
    ? envValue(env, "OPENAI_MODEL", "gpt-4.1-mini")
    : envValue(env, "DEEPSEEK_MODEL", "deepseek-v4-flash");

  if (!apiKey) {
    throw codedError(
      "model_key_missing",
      provider === "openai" ? "OPENAI_API_KEY is not configured" : "DEEPSEEK_API_KEY is not configured",
      503
    );
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.45,
      max_tokens: 900
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw codedError("model_request_failed", detail || `model request failed with status ${response.status}`, 502);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export function onRequestOptions() {
  return cors();
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const kv = getKv(env);
    if (!kv || !kv.get) {
      return json({ error: "kv_not_configured" }, { status: 503 });
    }
    const session = await currentSession(request, kv);
    if (!session) {
      return json({ error: "auth_required" }, { status: 401 });
    }

    const body = await request.json();
    const message = String(body.message || "").trim().slice(0, 900);
    const locale = body.locale === "en" ? "en" : "zh";
    if (!message) {
      return json({ error: "message required" }, { status: 400 });
    }

    let allKnowledge = await readKnowledge(env, request);
    if (!allKnowledge.length) {
      allKnowledge = await readStaticKnowledge(request);
    }
    const knowledge = retrieve(allKnowledge, message);
    const publicContext = knowledge.map((item) => {
      return `TITLE: ${item.title}\nURL: ${item.url}\nSUMMARY: ${item.summary}\nTEXT: ${String(item.text || "").slice(0, 1600)}`;
    }).join("\n\n---\n\n");

    const answer = await callModel(env, [
      { role: "system", content: `${PERSONA}\n回答语言：${locale === "en" ? "English" : "中文"}` },
      { role: "system", content: `当前登录访客显示名：${session.displayName || session.username}。不要透露他的账户信息。` },
      { role: "system", content: `PUBLIC_CONTEXT:\n${publicContext || "No matching public context."}` },
      { role: "user", content: message }
    ]);

    return json({ answer, sources: knowledge.map((item) => ({ title: item.title, url: item.url })) });
  } catch (error) {
    return json(
      { error: error.code || "chat_failed", detail: String(error.message || error) },
      { status: error.status || 500 }
    );
  }
}
