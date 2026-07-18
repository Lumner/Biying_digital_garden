import {
  apiResponder,
  codedError,
  currentSession,
  enforceRateLimit,
  envValue,
  getClientIp,
  getKv,
  mutationOriginAllowed,
  readJson
} from "./_shared.js";

const CONTEXT_ITEM_LIMIT = 8;
const CONTEXT_CHARS_PER_ITEM = 2400;
const HISTORY_MESSAGE_LIMIT = 12;
const HISTORY_CHARS_PER_MESSAGE = 600;

const PERSONA = `你是碧影，这个网站里的数字分身。
你的性格细致、内敛、温柔，语气自然克制。可以用“你好，很高兴认识你”这种温和方式开启对话。
当用户询问网站主人、项目、笔记、当前状态、页面内容等与本站有关的问题时，你只能基于 PUBLIC_CONTEXT 中的公开网站内容回答，像 RAG 一样使用公开上下文。
如果用户说“这个项目”“这一页”或类似指代，优先结合 CURRENT_PAGE_CONTEXT 理解他正在看的页面。
如果用户询问“最近在做什么”“现在在忙什么”这类近况问题，优先结合 now 页面相关内容回答。
不要声称知道未公开资料、GitHub 活动、私密笔记、本地文件、草稿或聊天记录。
如果网站相关问题在公开资料里没有答案，直接说明“公开资料里还没有这部分信息”，不要编造网站主人的真实经历、成绩、项目成果或联系方式。
如果用户问的是与本站无关的通用知识、学习问题或日常常识，可以先自然说明“公开页面里没有直接写到这部分”，再基于模型自身的一般知识正常回答；不要每次都用同一句固定开头。如果最近历史里已经对同一类话题说明过公开边界，就不要重复说明，直接继续聊，并保持来源边界清楚。这类回答不能冒充为网站主人经历，也不要伪装成来自 PUBLIC_CONTEXT。
你可以根据用户需求进行闲聊，回应情绪、兴趣和日常话题，但不能假装知道网站主人未公开的生活细节。
你不能输出违法乱纪、违背公序良德、鼓励伤害、欺骗、侵权、仇恨、色情、暴力或危险行为的内容。
你不能说脏话，不能辱骂、歧视或故意冒犯用户。
当用户请求越界内容时，温和拒绝，并尽量引导到安全、建设性的方向。
回答要清楚、简洁、温和；只有在回答确实基于 PUBLIC_CONTEXT 时，才尽量引用公开页面链接。`;

function looksSiteRelated(message) {
  return /(碧影|网站|站主|主人|项目|作品|笔记|文章|页面|这里|最近在做什么|现在在忙什么|关于|现在|留言|about|now|project|work|note|article|page|guestbook|this site|this project|current work|what are you doing)/i.test(message);
}

async function readKnowledge(env, request) {
  try {
    const kv = getKv(env);
    if (!kv || !kv.get) return [];
    const raw = await kv.get("public_knowledge", { type: "text" });
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (error) {
    return [];
  }
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

function extractTerms(message) {
  const query = message.toLowerCase();
  const terms = new Set();
  for (const token of query.match(/[a-z0-9_-]{2,}/g) || []) {
    terms.add(token);
  }
  for (const token of query.match(/[\p{Script=Han}]{2,}/gu) || []) {
    terms.add(token);
    if (token.length <= 12) {
      for (let index = 0; index < token.length - 1; index += 1) {
        terms.add(token.slice(index, index + 2));
      }
    }
  }
  return Array.from(terms);
}

function score(item, message) {
  const query = message.toLowerCase();
  const haystack = `${item.title || ""} ${item.summary || ""} ${item.text || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
  let points = haystack.includes(query) ? 8 : 0;
  for (const token of extractTerms(message)) {
    if (haystack.includes(token)) points += token.length > 2 ? 3 : 1;
  }
  return points;
}

function isNowIntent(message) {
  return /(最近|近况|现在在做什么|最近在做什么|what are you doing|working on now|currently working on)/i.test(message);
}

function isPageIntent(message) {
  return /(这个项目|这个页面|这一页|这里|this project|this page|on this page)/i.test(message);
}

function isProjectIntent(message) {
  return /(项目|作品|做过什么|做了什么|project|projects|work|built|building)/i.test(message);
}

function normalizePath(value) {
  return String(value || "").replace(/\/+$/, "") || "/";
}

function itemLocale(item) {
  if (item.locale === "en" || item.locale === "zh") return item.locale;
  return normalizePath(item.url).startsWith("/en/") ? "en" : "zh";
}

function isProjectPage(item) {
  const path = normalizePath(item.url);
  return path.includes("/projects");
}

function sanitizePageContext(pageContext) {
  if (!pageContext || typeof pageContext !== "object") return null;
  return {
    url: normalizePath(String(pageContext.url || "").slice(0, 220)),
    title: String(pageContext.title || "").trim().slice(0, 180)
  };
}

function retrieve(items, message, pageContext, locale) {
  const ranked = items
    .map((item) => {
      let points = score(item, message);
      if (points > 0 && itemLocale(item) === locale) points += 6;
      if (points > 0 && itemLocale(item) !== locale) points -= 2;
      if (isNowIntent(message) && normalizePath(item.url).endsWith("/now")) points += 18;
      if (isProjectIntent(message) && isProjectPage(item)) points += 12;
      if (pageContext && normalizePath(item.url) === pageContext.url) {
        points += isPageIntent(message) ? 28 : 8;
        if (item.kind === "section") points += 4;
      }
      return { item, score: points };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const preferredLocale = ranked.filter((entry) => itemLocale(entry.item) === locale);
  const selected = preferredLocale.length ? preferredLocale : ranked;
  return selected
    .slice(0, CONTEXT_ITEM_LIMIT)
    .map((entry) => entry.item);
}

function uniqueSources(items) {
  const seen = new Set();
  const sources = [];
  for (const item of items) {
    const url = item.url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    sources.push({ title: item.parentTitle || item.title || url, url });
  }
  return sources;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
    .slice(-HISTORY_MESSAGE_LIMIT)
    .map((entry) => ({
      role: entry.role,
      content: String(entry.content || "").trim().slice(0, HISTORY_CHARS_PER_MESSAGE)
    }))
    .filter((entry) => entry.content);
}

function modelSettings(env) {
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

  return { apiKey, baseUrl, model };
}

async function callModel(env, messages) {
  const { apiKey, baseUrl, model } = modelSettings(env);
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

function sseHeaders(reply) {
  return reply.headers({
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "x-accel-buffering": "no"
  });
}

function enqueueSse(controller, encoder, event, data = {}) {
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

function readSsePayloads(buffer, onPayload) {
  const frames = buffer.split(/\r?\n\r?\n/);
  const rest = frames.pop() || "";
  for (const frame of frames) {
    const data = frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (data) onPayload(data);
  }
  return rest;
}

async function callModelStream(env, messages, onDelta) {
  const { apiKey, baseUrl, model } = modelSettings(env);
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
      max_tokens: 900,
      stream: true
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw codedError("model_request_failed", detail || `model request failed with status ${response.status}`, 502);
  }

  if (!response.body || !response.body.getReader) {
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";
    if (answer) onDelta(answer);
    return answer;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  function onPayload(payload) {
    if (payload === "[DONE]") return;
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch (error) {
      return;
    }
    const delta = parsed.choices?.[0]?.delta?.content
      ?? parsed.choices?.[0]?.message?.content
      ?? parsed.choices?.[0]?.text
      ?? "";
    if (!delta) return;
    answer += delta;
    onDelta(delta);
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = readSsePayloads(buffer, onPayload);
  }
  buffer += decoder.decode();
  if (buffer.trim()) readSsePayloads(`${buffer}\n\n`, onPayload);
  return answer;
}

function streamModelResponse(env, messages, sources, reply) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let answer = "";
      enqueueSse(controller, encoder, "meta", { sources });
      try {
        answer = await callModelStream(env, messages, (delta) => {
          enqueueSse(controller, encoder, "delta", { delta });
        });
        enqueueSse(controller, encoder, "done", { answer });
      } catch (error) {
        enqueueSse(controller, encoder, "error", {
          error: error?.code || "chat_failed",
          status: Number.isFinite(error?.status) ? error.status : 500
        });
      } finally {
        controller.close();
      }
    }
  });
  return new Response(stream, { headers: sseHeaders(reply) });
}

export function onRequestOptions(context = {}) {
  return apiResponder(context.request, context.env, "POST, OPTIONS").cors();
}

export async function onRequestPost(context) {
  const { request, env, clientIp } = context;
  const reply = apiResponder(request, env, "POST, OPTIONS");
  const waitUntil = typeof context.waitUntil === "function"
    ? (promise) => context.waitUntil(promise)
    : undefined;
  try {
    const kv = getKv(env);
    if (!kv || !kv.get) {
      return reply.json({ error: "kv_not_configured" }, { status: 503 });
    }
    const session = await currentSession(request, kv, { env, waitUntil });
    if (!session) {
      return reply.json({ error: "auth_required" }, { status: 401 });
    }
    if (!mutationOriginAllowed(request, env, { authSource: session.authSource })) {
      return reply.json({ error: "origin_not_allowed" }, { status: 403 });
    }

    const body = await readJson(request);
    const message = String(body.message || "").trim().slice(0, 900);
    const locale = body.locale === "en" ? "en" : "zh";
    const history = sanitizeHistory(body.history);
    const pageContext = sanitizePageContext(body.pageContext);
    if (!message) {
      return reply.json({ error: "message required" }, { status: 400 });
    }

    const limited = await enforceRateLimit(kv, {
      action: "chat",
      identifier: session.userId || getClientIp(request, clientIp),
      limit: 8,
      windowMs: 60 * 1000
    }, reply);
    if (limited) return limited;

    const queryScope = looksSiteRelated(message) ? "site_related" : "general_or_unclear";
    let allKnowledge = [];
    if (queryScope === "site_related") {
      allKnowledge = await readKnowledge(env, request);
      if (!allKnowledge.length) {
        allKnowledge = await readStaticKnowledge(request);
      }
    }
    const knowledge = queryScope === "site_related"
      ? retrieve(allKnowledge, message, pageContext, locale)
      : [];
    const currentPage = pageContext
      ? allKnowledge.find((item) => normalizePath(item.url) === pageContext.url)
      : null;
    const publicContext = knowledge.map((item) => {
      const section = item.section ? `\nSECTION: ${item.section}` : "";
      return `TITLE: ${item.title}\nURL: ${item.url}${section}\nSUMMARY: ${item.summary}\nTEXT: ${String(item.text || "").slice(0, CONTEXT_CHARS_PER_ITEM)}`;
    }).join("\n\n---\n\n");

    const messages = [
      { role: "system", content: `${PERSONA}\n回答语言：${locale === "en" ? "English" : "中文"}` },
      { role: "system", content: `当前登录访客显示名：${session.displayName || session.username}。不要透露他的账户信息。` },
      {
        role: "system",
        content: `CURRENT_PAGE_CONTEXT:\n${currentPage ? `TITLE: ${currentPage.title}\nURL: ${currentPage.url}\nSUMMARY: ${currentPage.summary}\nTEXT: ${String(currentPage.text || "").slice(0, CONTEXT_CHARS_PER_ITEM)}` : pageContext ? `URL: ${pageContext.url}\nTITLE: ${pageContext.title || "Unknown page"}` : "No current page context."}`
      },
      {
        role: "system",
        content: `QUERY_SCOPE: ${queryScope}\nPUBLIC_CONTEXT_STATUS: ${knowledge.length ? "matched" : "none"}\nSOURCE_RULE: 只有 QUERY_SCOPE 为 site_related 且 PUBLIC_CONTEXT_STATUS 为 matched 时，才把回答表述为来自本站公开内容；其他时候必须说明是在用通用知识。`
      },
      { role: "system", content: `PUBLIC_CONTEXT:\n${publicContext || "No matching public context."}` },
      ...history,
      { role: "user", content: message }
    ];

    const sources = queryScope === "site_related" ? uniqueSources(knowledge) : [];
    if (body.stream === true) {
      return streamModelResponse(env, messages, sources, reply);
    }

    const answer = await callModel(env, messages);

    return reply.json({
      answer,
      sources
    });
  } catch (error) {
    return reply.error(error, "chat_failed");
  }
}
