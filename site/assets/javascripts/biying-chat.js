(function () {
  const state = {
    knowledge: [],
    busy: false
  };

  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
  }

  function text(key) {
    const zh = isChinesePage();
    const copy = {
      placeholder: zh ? "问问碧影：这个人最近在做什么？" : "Ask Biying: what is this person working on?",
      send: zh ? "发送" : "Send",
      headerTitle: zh ? "你好，很高兴认识你。" : "Hello, it is nice to meet you.",
      headerScope: zh
        ? "碧影只会回答网站公开内容；没有公开资料时会直接说明。"
        : "Biying only answers from public site content; when the material is missing, he says so.",
      sources: zh ? "来源" : "Sources",
      initial: zh
        ? "你好，很高兴认识你。我是碧影，只读取这个网站公开发布的内容。你可以问我关于主人、项目、笔记和当前状态的问题，也可以和我闲聊。"
        : "Hello, it is nice to meet you. I am Biying. I only read public content from this site, and I can talk about the owner, projects, notes, current status, or simply chat.",
      offline: zh
        ? "我先用本地公开知识库回答。"
        : "I will answer from the local public knowledge base for now.",
      empty: zh ? "先输入一个问题。" : "Type a question first.",
      error: zh ? "连接失败。你可以部署 EdgeOne Functions 后再试。" : "Connection failed. Try again after deploying EdgeOne Functions.",
      loginRequired: zh ? "注册或登录后就可以和碧影对话。" : "Register or sign in to talk to Biying.",
      account: zh ? "注册 / 登录" : "Register / Sign in",
      authExpired: zh ? "未登录，或登录状态已过期。请重新登录后再和碧影对话。" : "You are not signed in, or your session expired. Please sign in again before talking to Biying.",
      kv: zh ? "聊天需要先在 EdgeOne 中绑定 BIYING_KV。" : "Chat requires BIYING_KV to be bound in EdgeOne.",
      apiNotFound: zh ? "没有找到 /api/chat。通常是 EdgeOne Functions 没有部署成功，或当前项目只发布了静态 site 目录。" : "/api/chat was not found. EdgeOne Functions may not be deployed, or the project is only serving the static site directory.",
      apiUnavailable: zh ? "聊天 API 没有返回可用响应。请检查 EdgeOne Functions 是否已经随本次部署生效。" : "The chat API did not return a usable response. Please check whether EdgeOne Functions are active for this deployment.",
      modelKeyMissing: zh ? "模型密钥未配置。请在 EdgeOne 环境变量中设置 DEEPSEEK_API_KEY，并重新部署。" : "The model API key is missing. Set DEEPSEEK_API_KEY in EdgeOne environment variables and redeploy.",
      modelFailed: zh ? "模型服务请求失败。请检查 DEEPSEEK_API_KEY、DEEPSEEK_MODEL、账户余额和模型名称是否正确。" : "The model request failed. Check DEEPSEEK_API_KEY, DEEPSEEK_MODEL, balance, and the model name.",
      chatFailed: zh ? "聊天 API 运行失败。请查看 EdgeOne Functions 日志获取更具体的错误。" : "The chat API failed. Check EdgeOne Functions logs for details.",
      reason: zh ? "不能直接连接线上碧影的原因：" : "Why the live Biying API cannot be used:"
    };
    return copy[key];
  }

  function auth() {
    return window.BiyingAuth;
  }

  function currentUser() {
    return auth() ? auth().user() : null;
  }

  function accountUrl() {
    return auth() ? auth().accountUrl() : (isChinesePage() ? "/zh/register/" : "/en/register/");
  }

  function authHeaders() {
    return auth() ? auth().authHeaders() : {};
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function accountPrompt() {
    return `${text("loginRequired")} <a href="${escapeHtml(accountUrl())}">${escapeHtml(text("account"))}</a>`;
  }

  function renderSources(sources) {
    const safeSources = (sources || []).filter((source) => source && source.url).slice(0, 4);
    if (!safeSources.length) return "";
    const links = safeSources.map((source) => {
      const title = escapeHtml(source.title || source.url);
      const url = escapeHtml(source.url);
      return `<a href="${url}">${title}</a>`;
    }).join("");
    return `<div class="biying-sources"><span>${text("sources")}</span>${links}</div>`;
  }

  function renderMessageContent(content, options = {}) {
    const body = options.html ? String(content) : escapeHtml(content);
    return `${body.replace(/\n/g, "<br>")}${renderSources(options.sources)}`;
  }

  function addMessage(log, role, content, options = {}) {
    const item = document.createElement("div");
    item.className = `biying-message ${role}`;
    item.innerHTML = renderMessageContent(content, options);
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
    return item;
  }

  async function loadKnowledge() {
    if (state.knowledge.length) return state.knowledge;
    try {
      const response = await fetch("/assets/knowledge/public-knowledge.json", { cache: "no-store" });
      const data = await response.json();
      state.knowledge = Array.isArray(data.items) ? data.items : [];
    } catch (error) {
      state.knowledge = [];
    }
    return state.knowledge;
  }

  function scoreItem(item, query) {
    const q = query.toLowerCase();
    const haystack = `${item.title || ""} ${item.summary || ""} ${item.text || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
    let score = 0;
    for (const token of q.split(/\s+/).filter(Boolean)) {
      if (haystack.includes(token)) score += token.length > 2 ? 3 : 1;
    }
    if (haystack.includes(q)) score += 8;
    return score;
  }

  function reasonFromError(error) {
    if (error.status === 401 || error.code === "auth_required") return text("authExpired");
    if (error.code === "kv_not_configured") return text("kv");
    if (error.code === "api_not_found" || error.status === 404) return text("apiNotFound");
    if (error.code === "model_key_missing") return text("modelKeyMissing");
    if (error.code === "model_request_failed") return text("modelFailed");
    if (error.code === "chat_failed") return text("chatFailed");
    return text("apiUnavailable");
  }

  async function localAnswer(query, reason = "") {
    const knowledge = await loadKnowledge();
    const ranked = knowledge
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (!ranked.length) {
      return isChinesePage()
        ? { answer: `${reason ? `${text("reason")}${reason}\n\n` : ""}${text("offline")}\n\n公开资料里还没有直接相关内容。你可以试着问：项目、笔记、现在在做什么、数学公式。`, sources: [] }
        : { answer: `${reason ? `${text("reason")}${reason}\n\n` : ""}${text("offline")}\n\nI did not find a direct match in the public materials. Try asking about projects, notes, current work, or math formulas.`, sources: [] };
    }

    const intro = isChinesePage()
      ? `${reason ? `${text("reason")}${reason}\n\n` : ""}${text("offline")}\n\n我找到这些公开线索：`
      : `${reason ? `${text("reason")}${reason}\n\n` : ""}${text("offline")}\n\nI found these public signals:`;
    const lines = ranked.map(({ item }) => {
      const title = item.title || item.url;
      const summary = item.summary || (item.text || "").slice(0, 180);
      return `- ${title}：${summary}`;
    });
    return {
      answer: `${intro}\n${lines.join("\n")}`,
      sources: ranked.map(({ item }) => ({ title: item.title || item.url, url: item.url }))
    };
  }

  async function askApi(query) {
    let response;
    try {
      response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          message: query,
          locale: isChinesePage() ? "zh" : "en"
        })
      });
    } catch (error) {
      const wrapped = new Error("fetch_failed");
      wrapped.code = "fetch_failed";
      throw wrapped;
    }
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { detail: await response.text().catch(() => "") };
    if (!response.ok) {
      const error = new Error(data.error || "chat api failed");
      error.status = response.status;
      error.code = response.status === 404 ? "api_not_found" : data.error;
      error.detail = data.detail || "";
      throw error;
    }
    return {
      answer: data.answer || "",
      sources: Array.isArray(data.sources) ? data.sources : []
    };
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";

    root.innerHTML = `
      <div class="biying-chat__header">
        <strong>${text("headerTitle")}</strong>
        <span>${text("headerScope")}</span>
      </div>
      <div class="biying-chat__log" aria-live="polite"></div>
      <form class="biying-chat__form">
        <p class="meta-line" data-biying-auth-note></p>
        <textarea rows="3" maxlength="900" placeholder="${text("placeholder")}"></textarea>
        <button type="submit">${text("send")}</button>
      </form>
    `;

    const log = root.querySelector(".biying-chat__log");
    const form = root.querySelector("form");
    const input = root.querySelector("textarea");
    const authNote = root.querySelector("[data-biying-auth-note]");

    function updateAuthNote() {
      const user = currentUser();
      if (user) {
        authNote.textContent = `${user.displayName} (@${user.username})`;
        return;
      }
      authNote.innerHTML = accountPrompt();
    }

    addMessage(log, "biying", text("initial"));
    updateAuthNote();
    if (auth()) {
      auth().refresh().finally(updateAuthNote);
    }
    window.addEventListener("biying-auth-change", updateAuthNote);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (state.busy) return;
      if (!currentUser()) {
        addMessage(log, "biying", accountPrompt(), { html: true });
        return;
      }
      const query = input.value.trim();
      if (!query) {
        addMessage(log, "biying", text("empty"));
        return;
      }
      input.value = "";
      addMessage(log, "user", query);
      const pending = addMessage(log, "biying", "...");
      state.busy = true;
      try {
        let response;
        try {
          response = await askApi(query);
        } catch (error) {
          if (error.status === 401 || error.code === "auth_required") {
            response = { answer: `${text("authExpired")} <a href="${escapeHtml(accountUrl())}">${escapeHtml(text("account"))}</a>`, html: true, sources: [] };
          } else if (error.code === "kv_not_configured") {
            response = { answer: text("kv"), sources: [] };
          } else if (error.code === "model_key_missing") {
            response = { answer: text("modelKeyMissing"), sources: [] };
          } else if (error.code === "model_request_failed") {
            response = { answer: text("modelFailed"), sources: [] };
          } else {
            response = await localAnswer(query, reasonFromError(error));
          }
        }
        pending.innerHTML = renderMessageContent(response.answer || "", {
          html: response.html,
          sources: response.sources
        });
      } catch (error) {
        pending.textContent = text("error");
      } finally {
        state.busy = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-biying-chat]").forEach(mount);
  });
})();
