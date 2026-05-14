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
      initial: zh
        ? "你好，很高兴认识你。我是碧影，只读取这个网站公开发布的内容。你可以问我关于主人、项目、笔记和当前状态的问题，也可以和我闲聊。"
        : "Hello, it is nice to meet you. I am Biying. I only read public content from this site, and I can talk about the owner, projects, notes, current status, or simply chat.",
      offline: zh
        ? "API 暂未连接，我先用本地公开知识库回答。"
        : "The API is not connected yet, so I will answer from the local public knowledge base.",
      empty: zh ? "先输入一个问题。" : "Type a question first.",
      error: zh ? "连接失败。你可以部署 EdgeOne Functions 后再试。" : "Connection failed. Try again after deploying EdgeOne Functions."
    };
    return copy[key];
  }

  function addMessage(log, role, content) {
    const item = document.createElement("div");
    item.className = `biying-message ${role}`;
    item.innerHTML = content.replace(/\n/g, "<br>");
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

  async function localAnswer(query) {
    const knowledge = await loadKnowledge();
    const ranked = knowledge
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (!ranked.length) {
      return isChinesePage()
        ? `${text("offline")}\n\n公开资料里还没有直接相关内容。你可以试着问：项目、笔记、现在在做什么、数学公式。`
        : `${text("offline")}\n\nI did not find a direct match in the public materials. Try asking about projects, notes, current work, or math formulas.`;
    }

    const intro = isChinesePage()
      ? `${text("offline")}\n\n我找到这些公开线索：`
      : `${text("offline")}\n\nI found these public signals:`;
    const lines = ranked.map(({ item }) => {
      const title = item.title || item.url;
      const summary = item.summary || (item.text || "").slice(0, 180);
      return `- <a href="${item.url}">${title}</a>：${summary}`;
    });
    return `${intro}\n${lines.join("\n")}`;
  }

  async function askApi(query) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: query,
        locale: isChinesePage() ? "zh" : "en"
      })
    });
    if (!response.ok) throw new Error("chat api failed");
    const data = await response.json();
    return data.answer || "";
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";

    root.innerHTML = `
      <div class="biying-chat__log" aria-live="polite"></div>
      <form class="biying-chat__form">
        <textarea rows="3" maxlength="900" placeholder="${text("placeholder")}"></textarea>
        <button type="submit">${text("send")}</button>
      </form>
    `;

    const log = root.querySelector(".biying-chat__log");
    const form = root.querySelector("form");
    const input = root.querySelector("textarea");
    addMessage(log, "biying", text("initial"));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (state.busy) return;
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
        let answer;
        try {
          answer = await askApi(query);
        } catch (error) {
          answer = await localAnswer(query);
        }
        pending.innerHTML = answer.replace(/\n/g, "<br>");
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
