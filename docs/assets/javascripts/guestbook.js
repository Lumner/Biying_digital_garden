(function () {
  const state = {
    messages: []
  };

  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
  }

  function copy(key) {
    const zh = isChinesePage();
    return {
      message: zh ? "想留下什么？" : "Leave a message",
      submit: zh ? "公开留言" : "Post publicly",
      empty: zh ? "请填写留言内容。" : "Please enter a message.",
      intro: zh ? "留言会公开展示，请不要填写隐私信息。" : "Messages are public. Please do not include private information.",
      loginRequired: zh ? "注册或登录后可以留言、编辑自己的留言，也可以和碧影对话。" : "Register or sign in to post messages, edit your own messages, and talk to Biying.",
      account: zh ? "注册 / 登录" : "Register / Sign in",
      signedIn: zh ? "当前以" : "Signed in as",
      edit: zh ? "编辑" : "Edit",
      delete: zh ? "删除" : "Delete",
      edited: zh ? "已编辑" : "Edited",
      editPrompt: zh ? "修改你的留言：" : "Edit your message:",
      deleteConfirm: zh ? "确定删除这条留言吗？" : "Delete this message?",
      saved: zh ? "已保存。" : "Saved.",
      deleted: zh ? "已删除。" : "Deleted.",
      authExpired: zh ? "登录状态已过期，请重新登录。" : "Your session expired. Please sign in again.",
      kv: zh ? "留言需要先在 EdgeOne 中绑定 BIYING_KV。" : "Guestbook requires BIYING_KV to be bound in EdgeOne.",
      apiNotFound: zh ? "没有找到 /api/messages。通常是 EdgeOne Functions 没有部署成功，或当前项目只发布了静态 site 目录。" : "/api/messages was not found. EdgeOne Functions may not be deployed, or the project is only serving the static site directory.",
      apiUnavailable: zh ? "留言 API 没有返回可用响应。请检查 EdgeOne Functions 是否已经随本次部署生效。" : "The guestbook API did not return a usable response. Please check whether EdgeOne Functions are active for this deployment.",
      error: zh ? "操作失败，请稍后再试。" : "The action failed. Please try again later."
    }[key];
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
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : "";
  }

  async function parseResponse(response) {
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { detail: await response.text().catch(() => "") };
    if (!response.ok) {
      const error = new Error(data.error || "request_failed");
      error.code = response.status === 404 ? "api_not_found" : data.error;
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function friendlyError(error) {
    if (error.status === 401 || error.code === "auth_required") return copy("authExpired");
    if (error.code === "kv_not_configured") return copy("kv");
    if (error.code === "api_not_found" || error.status === 404) return copy("apiNotFound");
    if (error.code === "fetch_failed") return copy("apiUnavailable");
    return copy("error");
  }

  async function fetchMessages() {
    try {
      const response = await fetch("/api/messages", {
        cache: "no-store",
        headers: authHeaders()
      });
      const data = await parseResponse(response);
      return Array.isArray(data.messages) ? data.messages : [];
    } catch (error) {
      if (error && error.status) throw error;
      const wrapped = new Error("fetch_failed");
      wrapped.code = "fetch_failed";
      throw wrapped;
    }
  }

  async function postMessage(message) {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders() },
      body: JSON.stringify(message)
    });
    return parseResponse(response);
  }

  async function editMessage(id, content) {
    const response = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "content-type": "application/json", ...authHeaders() },
      body: JSON.stringify({ content })
    });
    return parseResponse(response);
  }

  async function deleteMessage(id) {
    const response = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    return parseResponse(response);
  }

  function renderList(list, messages) {
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
        <strong>${escapeHtml(message.name)}</strong>
        <p>${escapeHtml(message.content)}</p>
        <div class="meta-line">${date}${editDate}</div>
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
        <p class="meta-line">${copy("signedIn")} ${escapeHtml(user.displayName)} (@${escapeHtml(user.username)})</p>
        <textarea name="content" rows="4" maxlength="800" placeholder="${copy("message")}"></textarea>
        <input class="hp-field" name="website" tabindex="-1" autocomplete="off" />
        <button type="submit">${copy("submit")}</button>
      </form>
    `;
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <div class="guestbook__list"></div>
      <div data-guestbook-form></div>
      <p class="meta-line" data-guestbook-message></p>
    `;

    const list = root.querySelector(".guestbook__list");
    const formSlot = root.querySelector("[data-guestbook-form]");
    const status = root.querySelector("[data-guestbook-message]");

    async function refresh() {
      renderForm(formSlot);
      try {
        state.messages = await fetchMessages();
      } catch (error) {
        status.textContent = friendlyError(error);
        state.messages = [];
      }
      renderList(list, state.messages);
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
        locale: isChinesePage() ? "zh" : "en"
      };
      if (!message.content) {
        status.textContent = copy("empty");
        return;
      }
      if (message.website) return;
      try {
        await postMessage(message);
        form.reset();
        status.textContent = copy("saved");
        await refresh();
      } catch (error) {
        status.textContent = friendlyError(error);
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
            status.textContent = copy("empty");
            return;
          }
          await editMessage(id, content);
          status.textContent = copy("saved");
        } else if (window.confirm(copy("deleteConfirm"))) {
          await deleteMessage(id);
          status.textContent = copy("deleted");
        }
        await refresh();
      } catch (error) {
        status.textContent = friendlyError(error);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-guestbook]").forEach(mount);
  });
})();
