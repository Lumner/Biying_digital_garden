(function () {
  const api = window.BiyingApi;
  const dom = window.BiyingDom;
  const i18n = window.BiyingI18n;
  const state = {
    messages: []
  };

  function isChinesePage() {
    return i18n.isChinesePage();
  }

  function copy(key) {
    const zh = isChinesePage();
    return {
      message: zh ? "想留下一句什么？" : "Leave a message",
      submit: zh ? "留下这句话" : "Post publicly",
      empty: zh ? "请填写留言内容。" : "Please enter a message.",
      intro: zh ? "留言会公开展示，请不要填写隐私信息。" : "Messages are public. Please do not include private information.",
      loginRequired: zh ? "注册或登录后，就可以留言、修改自己的留言，也可以继续和碧影聊。" : "Register or sign in to post messages, edit your own messages, and talk to Biying.",
      account: zh ? "注册 / 登录" : "Register / Sign in",
      signedIn: zh ? "当前以" : "Signed in as",
      edit: zh ? "编辑" : "Edit",
      delete: zh ? "删除" : "Delete",
      edited: zh ? "已编辑" : "Edited",
      editPrompt: zh ? "修改你的留言：" : "Edit your message:",
      deleteConfirm: zh ? "确定删除这条留言吗？" : "Delete this message?",
      saved: zh ? "已保存。" : "Saved.",
      deleted: zh ? "已删除。" : "Deleted.",
      count: zh ? "公开留言" : "Public messages",
      writingAs: zh ? "以此身份留言" : "Posting as",
      characters: zh ? "字" : "characters",
      privacyHint: zh ? "这段内容像是带有联系方式或隐私信息。若你仍想公开，请再确认一次。" : "This looks like it may contain contact details or private information. Please double-check before posting publicly.",
      tooFrequent: zh ? "留言有点太快了，请稍等片刻再试。" : "You are posting a little too quickly. Please wait a moment and try again.",
      authExpired: zh ? "登录状态已过期，请重新登录。" : "Your session expired. Please sign in again.",
      kv: zh ? "留言存储还没接好，等站点配置完成后就能正常使用。" : "Guestbook requires BIYING_KV to be bound in EdgeOne.",
      apiNotFound: zh ? "暂时没有找到留言入口，可能是这次只发布了静态页面。" : "/api/messages was not found. EdgeOne Functions may not be deployed, or the project is only serving the static site directory.",
      apiUnavailable: zh ? "留言服务暂时没有回应，请稍后再试。" : "The guestbook API did not return a usable response. Please check whether EdgeOne Functions are active for this deployment.",
      error: zh ? "这次没有成功，请稍后再试。" : "The action failed. Please try again later."
    }[key];
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

  function authHeaders() {
    return auth() ? auth().authHeaders() : {};
  }

  function escapeHtml(value) {
    return dom.escapeHtml(value);
  }

  function formatDate(value) {
    return dom.formatDate(value);
  }

  function friendlyError(error) {
    return api.friendlyError(error, {
      "401": copy("authExpired"),
      "429": copy("tooFrequent"),
      auth_required: copy("authExpired"),
      too_frequent: copy("tooFrequent"),
      kv_not_configured: copy("kv"),
      api_not_found: copy("apiNotFound"),
      fetch_failed: copy("apiUnavailable")
    }, copy("error"));
  }

  function notify(message, type = "info") {
    if (window.BiyingToast && window.BiyingToast.show) {
      window.BiyingToast.show(message, { type });
    }
    return message;
  }

  async function fetchMessages() {
    const data = await api.request("/api/messages", {
      cache: "no-store",
      headers: authHeaders()
    });
    return Array.isArray(data.messages) ? data.messages : [];
  }

  async function postMessage(message) {
    return api.request("/api/messages", {
      method: "POST",
      headers: authHeaders(),
      json: message
    });
  }

  async function editMessage(id, content) {
    return api.request(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: authHeaders(),
      json: { content }
    });
  }

  async function deleteMessage(id) {
    return api.request(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authHeaders()
    });
  }

  function renderList(list, messages, highlightId = "") {
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
      if (message.id === highlightId) item.classList.add("is-new");
      item.dataset.id = message.id;
      const date = formatDate(message.createdAt);
      const editDate = message.updatedAt ? ` · ${copy("edited")} ${formatDate(message.updatedAt)}` : "";
      const actions = message.canEdit
        ? `<div class="message-actions">
            <button type="button" data-edit-message="${escapeHtml(message.id)}">${copy("edit")}</button>
            <button type="button" data-delete-message="${escapeHtml(message.id)}">${copy("delete")}</button>
          </div>`
        : "";
      item.innerHTML = `
        <div class="guestbook-message__head">
          <strong>${escapeHtml(message.name)}</strong>
          <span>${escapeHtml(date)}</span>
        </div>
        <p>${escapeHtml(message.content)}</p>
        ${editDate ? `<div class="meta-line">${editDate.replace(/^ · /, "")}</div>` : ""}
        ${actions}
      `;
      list.appendChild(item);
    });
  }

  function renderForm(slot) {
    const user = currentUser();
    if (!user) {
      slot.innerHTML = `
        <div class="guestbook__form">
          <p class="meta-line">${copy("loginRequired")}</p>
          <a class="cyber-button" href="${accountUrl()}">${copy("account")}</a>
        </div>
      `;
      return;
    }
    slot.innerHTML = `
      <form class="guestbook__form">
        <div class="guestbook__composer-meta">
          <p class="meta-line">${copy("writingAs")} ${escapeHtml(user.displayName)} (@${escapeHtml(user.username)})</p>
          <span data-guestbook-counter>0 / 800 ${copy("characters")}</span>
        </div>
        <textarea name="content" rows="4" maxlength="800" placeholder="${copy("message")}"></textarea>
        <p class="meta-line guestbook__privacy-hint" data-guestbook-privacy hidden>${copy("privacyHint")}</p>
        <input class="hp-field" name="website" tabindex="-1" autocomplete="off" />
        <button type="submit">${copy("submit")}</button>
      </form>
    `;
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <div class="guestbook__summary">
        <strong>${copy("count")}</strong>
        <span data-guestbook-count>0</span>
      </div>
      <div class="guestbook__list"></div>
      <div data-guestbook-form></div>
      <p class="meta-line" data-guestbook-message></p>
    `;

    const list = root.querySelector(".guestbook__list");
    const formSlot = root.querySelector("[data-guestbook-form]");
    const status = root.querySelector("[data-guestbook-message]");
    const count = root.querySelector("[data-guestbook-count]");

    async function refresh(highlightId = "") {
      renderForm(formSlot);
      try {
        state.messages = await fetchMessages();
      } catch (error) {
        status.textContent = notify(friendlyError(error), "error");
        state.messages = [];
      }
      renderList(list, state.messages, highlightId);
      count.textContent = String(state.messages.length);
    }

    refresh();
    if (auth()) {
      auth().refresh().finally(refresh);
    }
    window.addEventListener("biying-auth-change", refresh);

    formSlot.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target.closest("form");
      if (!form) return;
      const formData = new FormData(form);
      const message = {
        content: String(formData.get("content") || "").trim(),
        website: String(formData.get("website") || ""),
        locale: dom.locale()
      };
      if (!message.content) {
        status.textContent = notify(copy("empty"), "warning");
        return;
      }
      if (message.website) return;
      try {
        const result = await postMessage(message);
        form.reset();
        status.textContent = notify(copy("saved"), "success");
        await refresh(result && result.message ? result.message.id : "");
      } catch (error) {
        status.textContent = notify(friendlyError(error), "error");
      }
    });

    formSlot.addEventListener("input", (event) => {
      const textarea = event.target.closest("textarea[name='content']");
      if (!textarea) return;
      const counter = formSlot.querySelector("[data-guestbook-counter]");
      const hint = formSlot.querySelector("[data-guestbook-privacy]");
      if (counter) counter.textContent = `${textarea.value.length} / 800 ${copy("characters")}`;
      if (hint) {
        const looksPrivate = /(?:1[3-9]\d{9}|[\w.+-]+@[\w-]+\.[\w.-]+|微信|QQ|手机号|邮箱|wechat)/i.test(textarea.value);
        hint.hidden = !looksPrivate;
      }
    });

    list.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-edit-message]");
      const deleteButton = event.target.closest("[data-delete-message]");
      if (!editButton && !deleteButton) return;
      const id = (editButton || deleteButton).getAttribute(editButton ? "data-edit-message" : "data-delete-message");
      const message = state.messages.find((item) => item.id === id);
      if (!message) return;

      try {
        if (editButton) {
          const next = window.prompt(copy("editPrompt"), message.content);
          if (next === null) return;
          const content = next.trim();
          if (!content) {
            status.textContent = notify(copy("empty"), "warning");
            return;
          }
          await editMessage(id, content);
          status.textContent = notify(copy("saved"), "success");
        } else if (window.confirm(copy("deleteConfirm"))) {
          const card = list.querySelector(`[data-id="${CSS.escape(id)}"]`);
          if (card) card.classList.add("is-removing");
          await deleteMessage(id);
          status.textContent = notify(copy("deleted"), "success");
        }
        await refresh();
      } catch (error) {
        status.textContent = notify(friendlyError(error), "error");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-guestbook]").forEach(mount);
  });
})();
