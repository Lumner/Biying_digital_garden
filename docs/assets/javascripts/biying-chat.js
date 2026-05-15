(function () {
  const state = {
    knowledge: [],
    busy: false,
    history: []
  };

  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
  }

  function text(key) {
    const zh = isChinesePage();
    const copy = {
      placeholder: zh ? "和碧影说点什么..." : "Say something to Biying...",
      send: zh ? "发送" : "Send",
      headerTitle: zh ? "你好，很高兴认识你。" : "Hello, it is nice to meet you.",
      headerScope: zh
        ? "我会从这个网站已经公开的内容里陪你慢慢聊。"
        : "I answer from what has already been shared on this site.",
      sources: zh ? "想继续往下看，可以从这些页接着走" : "You can keep reading from",
      initial: zh
        ? "你好，很高兴认识你。我是碧影。你可以和我聊聊这里已经写下的内容，也可以只是随便说说话。"
        : "Hello, it is nice to meet you. I am Biying. You can ask about what has already been shared here, or simply stay for a chat.",
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
    if (options.key) item.dataset.messageKey = options.key;
    item.innerHTML = renderMessageContent(content, options);
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
    return item;
  }

  function upsertMessage(log, key, role, content, options = {}) {
    const existing = log.querySelector(`[data-message-key="${key}"]`);
    if (existing) {
      existing.innerHTML = renderMessageContent(content, options);
      log.scrollTop = log.scrollHeight;
      return existing;
    }
    return addMessage(log, role, content, { ...options, key });
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

  function isNowIntent(query) {
    return /(最近|近况|现在在做什么|最近在做什么|what are you doing|working on now|currently working on)/i.test(query);
  }

  function isPageIntent(query) {
    return /(这个项目|这个页面|这一页|这里|this project|this page|on this page)/i.test(query);
  }

  function normalizePath(value) {
    return String(value || "").replace(/\/+$/, "") || "/";
  }

  function currentPageContext() {
    return {
      url: normalizePath(window.location.pathname),
      title: document.title
    };
  }

  function scoreItem(item, query, pageContext = null) {
    const q = query.toLowerCase();
    const haystack = `${item.title || ""} ${item.summary || ""} ${item.text || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
    let score = 0;
    for (const token of q.split(/\s+/).filter(Boolean)) {
      if (haystack.includes(token)) score += token.length > 2 ? 3 : 1;
    }
    if (haystack.includes(q)) score += 8;
    if (isNowIntent(query) && normalizePath(item.url).endsWith("/now")) score += 18;
    if (pageContext && normalizePath(item.url) === normalizePath(pageContext.url)) {
      score += isPageIntent(query) ? 20 : 4;
    }
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
    const pageContext = currentPageContext();
    const ranked = knowledge
      .map((item) => ({ item, score: scoreItem(item, query, pageContext) }))
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

  async function askApi(query, history) {
    let response;
    try {
      response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          message: query,
          locale: isChinesePage() ? "zh" : "en",
          history,
          pageContext: currentPageContext()
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
        upsertMessage(log, "auth-required", "biying", accountPrompt(), { html: true });
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
        const previousHistory = state.history.slice(-12);
        try {
          response = await askApi(query, previousHistory);
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
        state.history.push({ role: "user", content: query });
        if (response.answer) {
          state.history.push({ role: "assistant", content: response.answer });
        }
      } catch (error) {
        pending.textContent = text("error");
      } finally {
        state.busy = false;
      }
    });
  }

  function shouldMountCompanion() {
    const path = window.location.pathname;
    return (
      (path.startsWith("/zh/") || path.startsWith("/en/")) &&
      !path.includes("/avatar/") &&
      !path.includes("/admin/") &&
      !path.includes("/register/")
    );
  }

  function mountCompanion() {
    if (!shouldMountCompanion() || document.querySelector("[data-biying-companion]")) return;
    const shell = document.createElement("aside");
    shell.className = "biying-companion";
    shell.dataset.biyingCompanion = "true";
    shell.innerHTML = `
      <section class="biying-chat biying-chat--companion biying-companion__panel" hidden>
        <button
          class="biying-companion__close"
          type="button"
          aria-label="${isChinesePage() ? "关闭聊天" : "Close chat"}"
          title="${isChinesePage() ? "关闭聊天" : "Close chat"}"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div data-biying-chat></div>
      </section>
      <button
        class="biying-companion__toggle"
        type="button"
        aria-expanded="false"
        aria-label="${isChinesePage() ? "和碧影聊聊" : "Talk with Biying"}"
        title="${isChinesePage() ? "和碧影聊聊" : "Talk with Biying"}"
      >
        <svg class="biying-companion__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.75 17.25 4 20l4.12-1.48A8.5 8.5 0 1 0 5.75 17.25Z"></path>
          <circle cx="9" cy="12" r="1.15"></circle>
          <circle cx="15" cy="12" r="1.15"></circle>
        </svg>
        <span class="sr-only">${isChinesePage() ? "和碧影聊聊" : "Talk with Biying"}</span>
      </button>
    `;
    document.body.appendChild(shell);
    const panel = shell.querySelector(".biying-companion__panel");
    const toggle = shell.querySelector(".biying-companion__toggle");
    const close = shell.querySelector(".biying-companion__close");
    const root = shell.querySelector("[data-biying-chat]");
    mount(root);
    function setOpen(open) {
      panel.toggleAttribute("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("biying-companion-open", open);
    }
    toggle.addEventListener("click", () => setOpen(panel.hasAttribute("hidden")));
    close.addEventListener("click", () => setOpen(false));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-biying-chat]").forEach(mount);
    mountCompanion();
  });
})();
