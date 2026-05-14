(function () {
  const storageKey = "biying-guestbook-local";

  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
  }

  function copy(key) {
    const zh = isChinesePage();
    return {
      name: zh ? "你的称呼" : "Your name",
      message: zh ? "想留下什么？" : "Leave a message",
      submit: zh ? "公开留言" : "Post publicly",
      empty: zh ? "请填写称呼和留言。" : "Please enter a name and message.",
      fallback: zh ? "API 暂未连接，留言已保存到本机预览。" : "The API is not connected, so this message is saved locally for preview.",
      intro: zh ? "留言会公开展示，请不要填写隐私信息。" : "Messages are public. Please do not include private information."
    }[key];
  }

  function localMessages() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveLocal(message) {
    const list = localMessages();
    list.unshift(message);
    localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 50)));
  }

  function render(list, messages) {
    list.innerHTML = "";
    if (!messages.length) {
      const empty = document.createElement("div");
      empty.className = "guestbook-message";
      empty.textContent = copy("intro");
      list.appendChild(empty);
      return;
    }
    messages.forEach((message) => {
      const item = document.createElement("article");
      item.className = "guestbook-message";
      const date = message.createdAt ? new Date(message.createdAt).toLocaleString() : "";
      item.innerHTML = `<strong>${escapeHtml(message.name)}</strong><p>${escapeHtml(message.content)}</p><div class="meta-line">${date}</div>`;
      list.appendChild(item);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function fetchMessages() {
    const response = await fetch("/api/messages", { cache: "no-store" });
    if (!response.ok) throw new Error("messages api failed");
    const data = await response.json();
    return Array.isArray(data.messages) ? data.messages : [];
  }

  async function postMessage(message) {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error("post message failed");
    return response.json();
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <div class="guestbook__list"></div>
      <form class="guestbook__form">
        <input name="name" maxlength="40" placeholder="${copy("name")}" autocomplete="name" />
        <textarea name="content" rows="4" maxlength="800" placeholder="${copy("message")}"></textarea>
        <input class="hp-field" name="website" tabindex="-1" autocomplete="off" />
        <button type="submit">${copy("submit")}</button>
      </form>
    `;

    const list = root.querySelector(".guestbook__list");
    const form = root.querySelector("form");

    fetchMessages()
      .then((messages) => render(list, messages.concat(localMessages())))
      .catch(() => render(list, localMessages()));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const message = {
        name: String(formData.get("name") || "").trim(),
        content: String(formData.get("content") || "").trim(),
        website: String(formData.get("website") || ""),
        locale: isChinesePage() ? "zh" : "en",
        createdAt: new Date().toISOString()
      };
      if (!message.name || !message.content) {
        alert(copy("empty"));
        return;
      }
      if (message.website) return;
      try {
        await postMessage(message);
      } catch (error) {
        message.localOnly = true;
        saveLocal(message);
        alert(copy("fallback"));
      }
      form.reset();
      render(list, [message].concat(localMessages()));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-guestbook]").forEach(mount);
  });
})();

