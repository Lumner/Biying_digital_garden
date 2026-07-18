(function () {
  const api = window.BiyingApi;
  const dom = window.BiyingDom;
  const i18n = window.BiyingI18n;
  const state = {
    knowledge: [],
    busy: false,
    history: [],
    transcript: [],
    missedTopics: new Set()
  };
  const storageVersion = "biying-chat-v1";
  const transcriptLimit = 40;
  const historyLimit = 12;
  let hydratedStorageKey = "";
  let chatMountCount = 0;

  function isChinesePage() {
    return i18n.isChinesePage();
  }

  function text(key) {
    const zh = isChinesePage();
    const copy = {
      messageLabel: zh ? "想和碧影聊什么？" : "Message to Biying",
      placeholder: zh ? "例如：我可以从哪篇笔记开始？" : "For example: Which note should I read first?",
      send: zh ? "发送" : "Send",
      headerTitle: zh ? "碧影" : "Biying",
      headerScope: zh
        ? "从本站公开内容里找线索。"
        : "Guided by this site's public content.",
      sources: zh ? "想继续往下看，可以从这些页接着走" : "You can keep reading from",
      initial: zh
        ? "你好，我是碧影。想从近况、笔记还是项目开始？"
        : "Hello, I am Biying. Shall we start with current work, notes, or projects?",
      offline: zh
        ? "我先用本地公开知识库回答。"
        : "I will answer from the local public knowledge base for now.",
      empty: zh ? "先输入一个问题。" : "Type a question first.",
      error: zh ? "暂时没连上线上碧影，可以稍后再试。" : "Connection failed. Try again after deploying EdgeOne Functions.",
      noPublicFirst: zh
        ? "这部分我在这里已经公开的内容里还没找到直接线索。可以先把它当成一个普通话题聊，我会尽量说清楚哪些只是通用理解。"
        : "I do not see a direct thread for this in the public pages here. We can still treat it as a general topic, and I will keep clear about what is only general knowledge.",
      noPublicAgain: zh
        ? "这类问题公开页面里还是没有更多材料。我先不重复边界说明了，直接按通用理解陪你往下聊。"
        : "The public pages still do not add more on this thread, so I will not repeat the boundary note and will continue from general knowledge.",
      loginRequired: zh ? "注册或登录后，就可以继续和碧影聊。" : "Register or sign in to talk to Biying.",
      account: zh ? "注册 / 登录" : "Register / Sign in",
      authExpired: zh ? "登录状态好像过期了，请重新登录后再和碧影对话。" : "You are not signed in, or your session expired. Please sign in again before talking to Biying.",
      kv: zh ? "线上聊天存储还没接好，等站点配置完成后就能正常使用。" : "Chat requires BIYING_KV to be bound in EdgeOne.",
      apiNotFound: zh ? "暂时没有找到线上聊天入口，可能是这次只发布了静态页面。" : "/api/chat was not found. EdgeOne Functions may not be deployed, or the project is only serving the static site directory.",
      apiUnavailable: zh ? "线上聊天暂时没有可用响应，请稍后再试。" : "The chat API did not return a usable response. Please check whether EdgeOne Functions are active for this deployment.",
      modelKeyMissing: zh ? "模型密钥还没有配置好，线上碧影暂时不能回答。" : "The model API key is missing. Set DEEPSEEK_API_KEY in EdgeOne environment variables and redeploy.",
      modelFailed: zh ? "模型服务这次没有成功返回，请稍后再试，或检查模型配置。" : "The model request failed. Check DEEPSEEK_API_KEY, DEEPSEEK_MODEL, balance, and the model name.",
      chatFailed: zh ? "线上聊天这次运行失败了，请稍后再试。" : "The chat API failed. Check EdgeOne Functions logs for details.",
      tooFrequent: zh ? "问得有点太快了，请稍等片刻再继续。" : "That was a little too fast. Please wait a moment before continuing.",
      clear: zh ? "清空记录" : "Clear",
      cleared: zh ? "聊天记录已清空。" : "Conversation cleared.",
      thinking: zh ? "碧影正在思考。" : "Biying is thinking.",
      conversation: zh ? "与碧影的对话记录" : "Conversation with Biying",
      reason: zh ? "这次没连上线上碧影的原因：" : "Why the live Biying API cannot be used:"
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
    return auth() ? auth().accountUrl() : dom.accountUrl();
  }

  function escapeHtml(value) {
    return dom.escapeHtml(value);
  }

  function plainText(value) {
    const template = document.createElement("template");
    template.innerHTML = String(value || "");
    return template.content.textContent || "";
  }

  function accountPrompt() {
    return `${text("loginRequired")} <a href="${escapeHtml(accountUrl())}">${escapeHtml(text("account"))}</a>`;
  }

  function chatStorageKey() {
    const user = currentUser()?.username || "guest";
    return `${storageVersion}:${dom.locale()}:${user}`;
  }

  function safeStoredMessage(message) {
    if (!message || typeof message !== "object") return null;
    const role = message.role === "user" ? "user" : "biying";
    const content = String(message.content || "").slice(0, 6000);
    if (!content) return null;
    return {
      role,
      content,
      html: Boolean(message.html),
      markdown: Boolean(message.markdown),
      sources: Array.isArray(message.sources) ? message.sources.slice(0, 4) : []
    };
  }

  function trimStoredState() {
    state.transcript = state.transcript.slice(-transcriptLimit);
    state.history = state.history
      .filter((message) => message && (message.role === "user" || message.role === "assistant") && message.content)
      .slice(-historyLimit);
  }

  function hydrateChatState() {
    const key = chatStorageKey();
    if (hydratedStorageKey === key) return;
    hydratedStorageKey = key;
    state.transcript = [];
    state.history = [];
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      state.transcript = Array.isArray(saved?.transcript)
        ? saved.transcript.map(safeStoredMessage).filter(Boolean).slice(-transcriptLimit)
        : [];
      state.history = Array.isArray(saved?.history)
        ? saved.history
          .filter((message) => message && (message.role === "user" || message.role === "assistant") && message.content)
          .map((message) => ({ role: message.role, content: String(message.content).slice(0, 3000) }))
          .slice(-historyLimit)
        : [];
    } catch (error) {
      state.transcript = [];
      state.history = [];
    }
  }

  function persistChatState() {
    if (!hydratedStorageKey) hydratedStorageKey = chatStorageKey();
    trimStoredState();
    try {
      localStorage.setItem(hydratedStorageKey, JSON.stringify({
        transcript: state.transcript,
        history: state.history,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      // Local storage can be disabled or full; chat should still work in memory.
    }
  }

  function clearPersistedChat() {
    try {
      localStorage.removeItem(chatStorageKey());
    } catch (error) {
      // Ignore storage failures and keep the UI responsive.
    }
    state.history = [];
    state.transcript = [];
    state.missedTopics.clear();
    hydratedStorageKey = chatStorageKey();
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

  function renderInlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  }

  function renderMarkdown(value) {
    const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let paragraph = [];
    let listType = "";
    let listItems = [];
    let listStart = 1;
    let codeLines = null;

    function flushParagraph() {
      if (!paragraph.length) return;
      blocks.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
      paragraph = [];
    }

    function flushList() {
      if (!listItems.length) return;
      const start = listType === "ol" ? ` start="${listStart}"` : "";
      blocks.push(`<${listType}${start}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${listType}>`);
      listType = "";
      listItems = [];
      listStart = 1;
    }

    function flushCode() {
      if (!codeLines) return;
      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      codeLines = null;
    }

    lines.forEach((line) => {
      if (line.trim().startsWith("```")) {
        flushParagraph();
        flushList();
        if (codeLines) flushCode();
        else codeLines = [];
        return;
      }
      if (codeLines) {
        codeLines.push(line);
        return;
      }
      if (!line.trim()) {
        flushParagraph();
        flushList();
        return;
      }

      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
      const unordered = line.match(/^\s*[-*]\s+(.+)$/);
      const ordered = line.match(/^\s*(\d+)\.\s+(.+)$/);
      const quote = line.match(/^\s*>\s?(.+)$/);

      if (heading) {
        flushParagraph();
        flushList();
        const level = Math.min(heading[1].length + 2, 6);
        blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        return;
      }
      if (unordered || ordered) {
        flushParagraph();
        const nextType = unordered ? "ul" : "ol";
        if (listType && listType !== nextType) flushList();
        listType = nextType;
        if (ordered && !listItems.length) listStart = Number.parseInt(ordered[1], 10) || 1;
        listItems.push(unordered ? unordered[1] : ordered[2]);
        return;
      }
      if (quote) {
        flushParagraph();
        flushList();
        blocks.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
        return;
      }

      flushList();
      paragraph.push(line);
    });

    flushParagraph();
    flushList();
    flushCode();
    return blocks.join("");
  }

  function renderMessageContent(content, options = {}) {
    const body = options.html
      ? String(content)
      : options.markdown
        ? renderMarkdown(content)
        : escapeHtml(content).replace(/\n/g, "<br>");
    return `${body}${renderSources(options.sources)}`;
  }

  function typesetMath(node) {
    if (!node || !window.MathJax || !window.MathJax.typesetPromise) return;
    window.MathJax.typesetPromise([node]).catch(() => {});
  }

  function rememberMessage(role, content, options = {}) {
    if (options.remember === false) return;
    state.transcript.push({
      role,
      content,
      html: Boolean(options.html),
      markdown: Boolean(options.markdown),
      sources: Array.isArray(options.sources) ? options.sources : []
    });
    persistChatState();
  }

  function addMessage(log, role, content, options = {}) {
    const renderOptions = {
      ...options,
      markdown: options.markdown ?? (role === "biying" && !options.html)
    };
    const item = document.createElement("div");
    item.className = `biying-message ${role}`;
    item.classList.add("biying-message--enter");
    if (role === "biying" && renderOptions.markdown) item.classList.add("mathjax-process");
    if (options.key) item.dataset.messageKey = options.key;
    item.innerHTML = renderMessageContent(content, renderOptions);
    log.appendChild(item);
    window.requestAnimationFrame(() => item.classList.add("is-visible"));
    log.scrollTop = log.scrollHeight;
    rememberMessage(role, content, renderOptions);
    typesetMath(item);
    return item;
  }

  function upsertMessage(log, key, role, content, options = {}) {
    const existing = log.querySelector(`[data-message-key="${key}"]`);
    if (existing) {
      const renderOptions = {
        ...options,
        markdown: options.markdown ?? (role === "biying" && !options.html)
      };
      existing.classList.toggle("mathjax-process", role === "biying" && renderOptions.markdown);
      existing.innerHTML = renderMessageContent(content, renderOptions);
      log.scrollTop = log.scrollHeight;
      typesetMath(existing);
      return existing;
    }
    return addMessage(log, role, content, { ...options, key });
  }

  function finishMessageRender(log, item, content, options = {}) {
    item.classList.remove("is-typing", "is-streaming");
    item.classList.toggle("mathjax-process", Boolean(options.markdown));
    item.innerHTML = renderMessageContent(content, options);
    log.scrollTop = log.scrollHeight;
    typesetMath(item);
  }

  function streamMessage(log, item, content, options = {}) {
    const value = String(content || "");
    const renderOptions = {
      ...options,
      markdown: options.markdown ?? !options.html
    };
    if (!value || renderOptions.html) {
      finishMessageRender(log, item, value, renderOptions);
      return Promise.resolve();
    }

    item.classList.remove("is-typing", "mathjax-process");
    item.classList.add("is-streaming");
    item.textContent = "";

    const step = Math.max(8, Math.ceil(value.length / 34));
    const frameDelay = 8;
    let index = 0;

    return new Promise((resolve) => {
      const tick = () => {
        index = Math.min(value.length, index + step);
        item.textContent = value.slice(0, index);
        log.scrollTop = log.scrollHeight;
        if (index < value.length) {
          window.setTimeout(tick, frameDelay);
          return;
        }
        finishMessageRender(log, item, value, renderOptions);
        resolve();
      };
      window.setTimeout(tick, 18);
    });
  }

  function liveMessage(log, item) {
    let value = "";
    let active = false;
    let textNode = null;
    let scrollQueued = false;

    function queueScroll() {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(() => {
        scrollQueued = false;
        log.scrollTop = log.scrollHeight;
      });
    }

    function activate() {
      if (active) return;
      active = true;
      item.classList.remove("is-typing", "mathjax-process");
      item.classList.add("is-streaming");
      item.textContent = "";
      textNode = document.createTextNode("");
      item.appendChild(textNode);
    }

    return {
      append(delta) {
        const chunk = String(delta || "");
        if (!chunk) return;
        activate();
        value += chunk;
        textNode.appendData(chunk);
        queueScroll();
      },
      finish(content, options = {}) {
        const finalContent = String(content || value);
        if (!active && !finalContent) {
          item.classList.remove("is-typing", "is-streaming");
          return finalContent;
        }
        finishMessageRender(log, item, finalContent, {
          ...options,
          markdown: options.markdown ?? !options.html
        });
        return finalContent;
      },
      reset() {
        value = "";
        active = false;
        textNode = null;
        item.textContent = "";
        item.classList.remove("is-typing", "is-streaming");
      }
    };
  }

  function parseSseFrame(frame) {
    const event = frame.match(/^event:\s*(.+)$/m)?.[1]?.trim() || "message";
    const data = frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) return { event, data: {} };
    try {
      return { event, data: JSON.parse(data) };
    } catch (error) {
      return { event, data: {} };
    }
  }

  async function responseError(response) {
    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }
    return new api.BiyingApiError(data.error || "request_failed", {
      code: response.status === 404 ? "api_not_found" : data.error,
      status: response.status,
      data
    });
  }

  async function askApiStream(query, history, onDelta) {
    const response = await fetch("/api/chat", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        "accept": "text/event-stream"
      },
      body: JSON.stringify({
        message: query,
        locale: dom.locale(),
        history,
        pageContext: currentPageContext(),
        stream: true
      })
    });

    if (!response.ok) throw await responseError(response);

    const contentType = response.headers.get("content-type") || "";
    if (!response.body || !contentType.includes("text/event-stream")) {
      const data = await api.parseResponse(response);
      return {
        answer: data.answer || "",
        sources: Array.isArray(data.sources) ? data.sources : [],
        streamed: false
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";
    let sources = [];

    function consume(frame) {
      const { event, data } = parseSseFrame(frame);
      if (event === "meta") {
        sources = Array.isArray(data.sources) ? data.sources : [];
        return;
      }
      if (event === "delta") {
        const delta = String(data.delta || "");
        if (!delta) return;
        answer += delta;
        onDelta(delta);
        return;
      }
      if (event === "done") {
        answer = String(data.answer || answer);
        return;
      }
      if (event === "error") {
        throw new api.BiyingApiError(data.error || "chat_failed", {
          code: data.error || "chat_failed",
          status: data.status || 500,
          data
        });
      }
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() || "";
      frames.filter(Boolean).forEach(consume);
    }
    buffer += decoder.decode();
    if (buffer.trim()) consume(buffer);

    return { answer, sources, streamed: true };
  }

  async function loadKnowledge() {
    if (state.knowledge.length) return state.knowledge;
    try {
      const data = await api.request("/assets/knowledge/public-knowledge.json", { cache: "no-store" });
      state.knowledge = Array.isArray(data.items) ? data.items : [];
    } catch (error) {
      state.knowledge = [];
    }
    return state.knowledge;
  }

  function isNowIntent(query) {
    return /(最近|近况|现在在做什么|最近在做什么|what are you doing|working on now|currently working on)/i.test(query);
  }

  function looksSiteRelated(query) {
    return /(碧影|网站|站主|主人|项目|作品|笔记|文章|页面|这里|最近在做什么|现在在忙什么|关于|现在|留言|about|now|project|work|note|article|page|guestbook|this site|this project|current work|what are you doing)/i.test(query);
  }

  function isPageIntent(query) {
    return /(这个项目|这个页面|这一页|这里|this project|this page|on this page)/i.test(query);
  }

  function isProjectIntent(query) {
    return /(项目|作品|做过什么|做了什么|project|projects|work|built|building)/i.test(query);
  }

  function normalizePath(value) {
    return dom.normalizePath(value);
  }

  function itemLocale(item) {
    if (item.locale === "en" || item.locale === "zh") return item.locale;
    return normalizePath(item.url).startsWith("/en/") ? "en" : "zh";
  }

  function isProjectPage(item) {
    return normalizePath(item.url).includes("/projects");
  }

  function extractTerms(query) {
    const lower = query.toLowerCase();
    const terms = new Set();
    for (const token of lower.match(/[a-z0-9_-]{2,}/g) || []) {
      terms.add(token);
    }
    for (const token of lower.match(/[\p{Script=Han}]{2,}/gu) || []) {
      terms.add(token);
      if (token.length <= 12) {
        for (let index = 0; index < token.length - 1; index += 1) {
          terms.add(token.slice(index, index + 2));
        }
      }
    }
    return Array.from(terms);
  }

  function currentPageContext() {
    return {
      url: normalizePath(window.location.pathname),
      title: document.title
    };
  }

  function scoreItem(item, query, pageContext = null, locale = "zh") {
    const q = query.toLowerCase();
    const haystack = `${item.title || ""} ${item.summary || ""} ${item.text || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
    let score = 0;
    for (const token of extractTerms(query)) {
      if (haystack.includes(token)) score += token.length > 2 ? 3 : 1;
    }
    if (haystack.includes(q)) score += 8;
    if (score > 0 && itemLocale(item) === locale) score += 6;
    if (score > 0 && itemLocale(item) !== locale) score -= 2;
    if (isNowIntent(query) && normalizePath(item.url).endsWith("/now")) score += 18;
    if (isProjectIntent(query) && isProjectPage(item)) score += 12;
    if (pageContext && normalizePath(item.url) === normalizePath(pageContext.url)) {
      score += isPageIntent(query) ? 28 : 8;
      if (item.kind === "section") score += 4;
    }
    return score;
  }

  function uniqueSources(items) {
    const seen = new Set();
    const sources = [];
    for (const item of items) {
      if (!item.url || seen.has(item.url)) continue;
      seen.add(item.url);
      sources.push({ title: item.parentTitle || item.title || item.url, url: item.url });
    }
    return sources;
  }

  function topicKey(query) {
    const terms = extractTerms(query)
      .filter((term) => term.length >= 2)
      .slice(0, 4);
    return terms.length ? terms.join("|") : String(query || "").trim().slice(0, 24).toLowerCase();
  }

  function missedTopicCopy(query) {
    const key = topicKey(query);
    const repeated = state.missedTopics.has(key);
    state.missedTopics.add(key);
    return text(repeated ? "noPublicAgain" : "noPublicFirst");
  }

  function reasonFromError(error) {
    return api.friendlyError(error, {
      "401": text("authExpired"),
      "429": text("tooFrequent"),
      auth_required: text("authExpired"),
      kv_not_configured: text("kv"),
      api_not_found: text("apiNotFound"),
      model_key_missing: text("modelKeyMissing"),
      model_request_failed: text("modelFailed"),
      too_frequent: text("tooFrequent"),
      chat_failed: text("chatFailed")
    }, text("apiUnavailable"));
  }

  async function localAnswer(query, reason = "") {
    const knowledge = await loadKnowledge();
    const pageContext = currentPageContext();
    const locale = isChinesePage() ? "zh" : "en";
    const rankedAll = looksSiteRelated(query) ? knowledge
      .map((item) => ({ item, score: scoreItem(item, query, pageContext, locale) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score) : [];
    const preferred = rankedAll.filter((entry) => itemLocale(entry.item) === locale);
    const ranked = (preferred.length ? preferred : rankedAll).slice(0, 3);

    if (!ranked.length) {
      return isChinesePage()
        ? { answer: `${reason ? `${text("reason")}${reason}\n\n` : ""}${text("offline")}\n\n${missedTopicCopy(query)}`, sources: [] }
        : { answer: `${reason ? `${text("reason")}${reason}\n\n` : ""}${text("offline")}\n\n${missedTopicCopy(query)}`, sources: [] };
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
      sources: uniqueSources(ranked.map(({ item }) => item))
    };
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    chatMountCount += 1;
    const instanceId = `biying-chat-${chatMountCount}`;
    const inputId = `${instanceId}-message`;
    const authNoteId = `${instanceId}-auth-note`;
    const statusId = `${instanceId}-status`;
    const titleId = root.dataset.chatTitleId || `${instanceId}-title`;

    root.innerHTML = `
      <div class="biying-chat__header">
        <div>
          <strong id="${titleId}">${text("headerTitle")}</strong>
          <span>${text("headerScope")}</span>
        </div>
        <button class="biying-chat__clear" type="button">${text("clear")}</button>
      </div>
      <div class="biying-chat__log" tabindex="0" aria-label="${text("conversation")}"></div>
      <form class="biying-chat__form" novalidate>
        <p class="meta-line" id="${authNoteId}" data-biying-auth-note role="status" aria-live="polite" aria-atomic="true"></p>
        <label class="form-field" for="${inputId}">
          <span class="form-field__label biying-chat__label">${text("messageLabel")}</span>
          <textarea id="${inputId}" name="message" rows="2" maxlength="900" autocomplete="off" placeholder="${text("placeholder")}" aria-describedby="${authNoteId} ${statusId}"></textarea>
        </label>
        <button type="submit">${text("send")}</button>
        <p class="sr-only form-status" id="${statusId}" data-biying-chat-status role="status" aria-live="polite" aria-atomic="true"></p>
      </form>
    `;

    const log = root.querySelector(".biying-chat__log");
    const form = root.querySelector("form");
    const input = root.querySelector("textarea");
    const clear = root.querySelector(".biying-chat__clear");
    const authNote = root.querySelector("[data-biying-auth-note]");
    const status = root.querySelector("[data-biying-chat-status]");
    hydrateChatState();

    function updateAuthNote() {
      const user = currentUser();
      if (user) {
        authNote.textContent = `${user.displayName} (@${user.username})`;
        return;
      }
      authNote.innerHTML = accountPrompt();
    }

    if (state.transcript.length) {
      state.transcript.forEach((message) => {
        addMessage(log, message.role, message.content, {
          html: message.html,
          markdown: message.markdown,
          sources: message.sources,
          remember: false
        });
      });
    } else {
      addMessage(log, "biying", text("initial"));
    }
    updateAuthNote();
    if (auth()) {
      auth().refresh().finally(updateAuthNote);
    }
    window.addEventListener("biying-auth-change", updateAuthNote);
    clear.addEventListener("click", () => {
      clearPersistedChat();
      log.innerHTML = "";
      addMessage(log, "biying", text("initial"));
      dom.setLiveStatus(status, text("cleared"), "success");
    });

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      if (status.dataset.state === "error") dom.setLiveStatus(status, "", "idle");
    });

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      form.requestSubmit();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (state.busy) return;
      if (!currentUser()) {
        upsertMessage(log, "auth-required", "biying", accountPrompt(), { html: true, remember: false });
        dom.setLiveStatus(status, text("loginRequired"), "error");
        return;
      }
      const query = input.value.trim();
      if (!query) {
        addMessage(log, "biying", text("empty"));
        input.setAttribute("aria-invalid", "true");
        dom.setLiveStatus(status, text("empty"), "error");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      input.value = "";
      addMessage(log, "user", query);
      const pending = addMessage(log, "biying", '<span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>', { remember: false, html: true });
      pending.classList.add("is-typing");
      state.busy = true;
      dom.setBusy(form, true);
      dom.setLiveStatus(status, text("thinking"), "loading");
      try {
        let response;
        let live;
        const previousHistory = state.history.slice(-12);
        try {
          live = liveMessage(log, pending);
          response = await askApiStream(query, previousHistory, (delta) => live.append(delta));
        } catch (error) {
          if (live) live.reset();
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
        if (response.streamed && live) {
          live.finish(response.answer || "", {
            html: response.html,
            markdown: !response.html,
            sources: response.sources
          });
        } else {
          await streamMessage(log, pending, response.answer || "", {
            html: response.html,
            markdown: !response.html,
            sources: response.sources
          });
        }
        rememberMessage("biying", response.answer || "", {
          html: response.html,
          markdown: !response.html,
          sources: response.sources
        });
        state.history.push({ role: "user", content: query });
        if (response.answer) {
          state.history.push({ role: "assistant", content: response.answer });
        }
        persistChatState();
        dom.setLiveStatus(
          status,
          response.html ? plainText(response.answer).trim() : String(response.answer || "").trim(),
          "success"
        );
      } catch (error) {
        pending.classList.remove("is-typing");
        pending.textContent = text("error");
        dom.setLiveStatus(status, text("error"), "error");
      } finally {
        state.busy = false;
        dom.setBusy(form, false);
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
    const panelId = "biying-companion-dialog";
    const titleId = "biying-companion-title";
    const shell = document.createElement("aside");
    shell.className = "biying-companion";
    shell.dataset.biyingCompanion = "true";
    shell.innerHTML = `
      <section
        class="biying-chat biying-chat--companion biying-companion__panel"
        id="${panelId}"
        role="dialog"
        aria-modal="false"
        aria-labelledby="${titleId}"
        tabindex="-1"
        hidden
      >
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
        aria-controls="${panelId}"
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
    root.dataset.chatTitleId = titleId;
    mount(root);
    const mobileDialog = window.matchMedia("(max-width: 48rem)");
    let returnFocus = toggle;

    function syncDialogMode() {
      panel.setAttribute("aria-modal", String(mobileDialog.matches));
    }

    function focusableElements() {
      return [...panel.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((element) => element.getClientRects().length > 0 && !element.hidden);
    }

    function setOpen(open, options = {}) {
      if (open) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
        panel.hidden = false;
      }
      toggle.setAttribute("aria-expanded", String(open));
      toggle.classList.toggle("is-open", open);
      shell.classList.toggle("is-open", open);
      document.body.classList.toggle("biying-companion-open", open);
      syncDialogMode();
      if (open) {
        window.requestAnimationFrame(() => {
          const preferred = root.querySelector("textarea");
          (preferred || focusableElements()[0] || panel).focus();
        });
        return;
      }
      panel.hidden = true;
      if (options.restoreFocus !== false && returnFocus?.isConnected) returnFocus.focus();
    }

    syncDialogMode();
    toggle.addEventListener("click", () => setOpen(panel.hasAttribute("hidden")));
    close.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (panel.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !mobileDialog.matches) return;
      const focusable = focusableElements();
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      if (panel.hasAttribute("hidden")) return;
      if (shell.contains(event.target)) return;
      setOpen(false);
    });
    if (mobileDialog.addEventListener) mobileDialog.addEventListener("change", syncDialogMode);
    else mobileDialog.addListener?.(syncDialogMode);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-biying-chat]").forEach(mount);
    mountCompanion();
  });
})();
