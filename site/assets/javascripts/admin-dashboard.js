(function () {
  const storageKey = "biying-admin-token";
  const api = window.BiyingApi;
  const dom = window.BiyingDom;
  const i18n = window.BiyingI18n;

  function isChinesePage() {
    return i18n.isChinesePage();
  }

  function text(key) {
    const zh = isChinesePage();
    return {
      token: zh ? "管理员 token" : "Admin token",
      connect: zh ? "进入后台" : "Open dashboard",
      refresh: zh ? "刷新" : "Refresh",
      forget: zh ? "忘记此设备上的 token" : "Forget token on this device",
      users: zh ? "注册用户" : "Registered Users",
      inbox: zh ? "私信收件箱" : "Private Inbox",
      guestbook: zh ? "公开留言管理" : "Guestbook Moderation",
      emptyUsers: zh ? "还没有注册用户。" : "No registered users yet.",
      emptyMessages: zh ? "还没有私信。" : "No private messages yet.",
      emptyGuestbook: zh ? "还没有公开留言。" : "No public guestbook messages yet.",
      createdAt: zh ? "注册时间" : "Registered",
      passwordUpdatedAt: zh ? "最近改密" : "Password updated",
      issueCode: zh ? "签发恢复码" : "Issue recovery code",
      unregister: zh ? "注销用户" : "Delete user",
      unregisterConfirm: zh ? "确定注销这个用户吗？这会让该账号失效，并清除它当前的登录状态；公开留言会保留，之后可单独隐藏或删除。" : "Delete this user? The account and active sessions will be removed. Public guestbook messages stay until you hide or delete them separately.",
      unread: zh ? "未读" : "Unread",
      read: zh ? "已读" : "Read",
      visible: zh ? "显示中" : "Visible",
      hidden: zh ? "已隐藏" : "Hidden",
      markRead: zh ? "标为已读" : "Mark read",
      markUnread: zh ? "标为未读" : "Mark unread",
      hide: zh ? "隐藏" : "Hide",
      show: zh ? "恢复显示" : "Show",
      delete: zh ? "删除" : "Delete",
      deleteConfirm: zh ? "确定删除这条内容吗？" : "Delete this item?",
      contact: zh ? "联系方式" : "Contact",
      accountUsername: zh ? "关联用户名" : "Account username",
      filterAll: zh ? "全部" : "All",
      filterUnread: zh ? "只看未读" : "Unread only",
      filterVisible: zh ? "只看显示中" : "Visible only",
      filterHidden: zh ? "只看已隐藏" : "Hidden only",
      searchPrivate: zh ? "搜索私信、用户名或联系方式" : "Search messages, usernames, or contacts",
      searchGuestbook: zh ? "搜索留言、用户名或内容" : "Search names, usernames, or content",
      copyContact: zh ? "复制联系方式" : "Copy contact",
      copied: zh ? "已复制联系方式。" : "Contact copied.",
      codeReady: zh ? "恢复码已生成" : "Recovery code ready",
      expiresAt: zh ? "过期时间" : "Expires",
      codeHint: zh ? "把它私下发给用户；过期后或使用一次后就会失效。" : "Send it privately; it expires or becomes invalid after one use.",
      minutesPrompt: zh ? "恢复码有效分钟数（5-1440）" : "Recovery-code validity in minutes (5-1440)",
      unauthorized: zh ? "管理员 token 不正确。" : "The admin token is incorrect.",
      kv: zh ? "后台需要先绑定 BIYING_KV。" : "The dashboard requires BIYING_KV.",
      failed: zh ? "后台请求失败，请稍后再试。" : "Dashboard request failed. Please try again later.",
      userNotFound: zh ? "找不到这个用户。" : "User not found."
    }[key];
  }

  function escapeHtml(value) {
    return dom.escapeHtml(value);
  }

  function formatDate(value) {
    return dom.formatDate(value, "-");
  }

  function readToken() {
    return sessionStorage.getItem(storageKey) || "";
  }

  function saveToken(token) {
    if (token) sessionStorage.setItem(storageKey, token);
    else sessionStorage.removeItem(storageKey);
  }

  function headers() {
    return {
      "content-type": "application/json",
      authorization: `Bearer ${readToken()}`
    };
  }

  function friendlyError(error) {
    return api.friendlyError(error, {
      "401": text("unauthorized"),
      unauthorized: text("unauthorized"),
      kv_not_configured: text("kv"),
      user_not_found: text("userNotFound")
    }, text("failed"));
  }

  async function loadDashboard() {
    return api.request("/api/admin", {
      cache: "no-store",
      headers: headers()
    });
  }

  async function issueCode(username, minutes) {
    return api.request("/api/admin", {
      method: "POST",
      headers: headers(),
      json: {
        action: "issue_recovery_code",
        username,
        minutes
      }
    });
  }

  async function updateMessage(id, status, kind = "private") {
    return api.request(`/api/admin?id=${encodeURIComponent(id)}&kind=${encodeURIComponent(kind)}`, {
      method: "PUT",
      headers: headers(),
      json: { status }
    });
  }

  async function deleteMessage(id, kind = "private") {
    return api.request(`/api/admin?id=${encodeURIComponent(id)}&kind=${encodeURIComponent(kind)}`, {
      method: "DELETE",
      headers: headers()
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function renderUsers(slot, users) {
    if (!users.length) {
      slot.innerHTML = `<p class="meta-line">${text("emptyUsers")}</p>`;
      return;
    }
    slot.innerHTML = users.map((user) => `
      <article class="admin-card">
        <strong>${escapeHtml(user.displayName)} (@${escapeHtml(user.username)})</strong>
        <span>${text("createdAt")}: ${escapeHtml(formatDate(user.createdAt))}</span>
        <span>${text("passwordUpdatedAt")}: ${escapeHtml(formatDate(user.passwordUpdatedAt))}</span>
        <div class="message-actions">
          <button type="button" data-issue-code="${escapeHtml(user.username)}">${text("issueCode")}</button>
          <button type="button" data-delete-user="${escapeHtml(user.username)}">${text("unregister")}</button>
        </div>
      </article>
    `).join("");
  }

  function renderPrivateMessages(slot, messages) {
    if (!messages.length) {
      slot.innerHTML = `<p class="meta-line">${text("emptyMessages")}</p>`;
      return;
    }
    slot.innerHTML = messages.map((message) => `
      <article class="admin-card ${message.status === "unread" ? "unread" : ""}">
        <div class="admin-card__top">
          <strong>${escapeHtml(message.name)}</strong>
          <span class="status-pill ${message.status === "unread" ? "warm" : "leaf"}">${text(message.status === "unread" ? "unread" : "read")}</span>
        </div>
        <span>${text("contact")}: ${escapeHtml(message.contact)}</span>
        <span>${text("accountUsername")}: ${escapeHtml(message.accountUsername || "-")}</span>
        <span>${escapeHtml(formatDate(message.createdAt))}</span>
        <p>${escapeHtml(message.content)}</p>
        <div class="message-actions">
          <button type="button" data-toggle-message="${escapeHtml(message.id)}" data-next-status="${message.status === "unread" ? "read" : "unread"}">
            ${text(message.status === "unread" ? "markRead" : "markUnread")}
          </button>
          <button type="button" data-copy-contact="${escapeHtml(message.contact)}">${text("copyContact")}</button>
          <button type="button" data-delete-private="${escapeHtml(message.id)}">${text("delete")}</button>
        </div>
      </article>
    `).join("");
  }

  function renderGuestbookMessages(slot, messages) {
    if (!messages.length) {
      slot.innerHTML = `<p class="meta-line">${text("emptyGuestbook")}</p>`;
      return;
    }
    slot.innerHTML = messages.map((message) => `
      <article class="admin-card ${message.moderationStatus === "hidden" ? "hidden" : ""}">
        <div class="admin-card__top">
          <strong>${escapeHtml(message.name)}${message.username ? ` (@${escapeHtml(message.username)})` : ""}</strong>
          <span class="status-pill ${message.moderationStatus === "hidden" ? "warm" : "leaf"}">${text(message.moderationStatus === "hidden" ? "hidden" : "visible")}</span>
        </div>
        <span>${escapeHtml(formatDate(message.createdAt))}</span>
        <p>${escapeHtml(message.content)}</p>
        <div class="message-actions">
          <button type="button" data-toggle-guestbook="${escapeHtml(message.id)}" data-next-status="${message.moderationStatus === "hidden" ? "visible" : "hidden"}">
            ${text(message.moderationStatus === "hidden" ? "show" : "hide")}
          </button>
          <button type="button" data-delete-guestbook="${escapeHtml(message.id)}">${text("delete")}</button>
        </div>
      </article>
    `).join("");
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <form class="admin-token-form">
        <input name="token" type="password" autocomplete="one-time-code" placeholder="${text("token")}" />
        <button type="submit">${text("connect")}</button>
        <button type="button" data-admin-refresh>${text("refresh")}</button>
        <button type="button" data-admin-forget>${text("forget")}</button>
      </form>
      <p class="meta-line" data-admin-status></p>
      <div class="admin-recovery" data-admin-recovery hidden></div>
      <section class="admin-section">
        <h2>${text("users")}</h2>
        <div class="admin-list" data-admin-users></div>
      </section>
      <section class="admin-section">
        <h2>${text("inbox")}</h2>
        <div class="admin-toolbar">
          <input data-admin-private-search placeholder="${text("searchPrivate")}" />
          <button type="button" class="active" data-admin-private-filter="all">${text("filterAll")}</button>
          <button type="button" data-admin-private-filter="unread">${text("filterUnread")}</button>
        </div>
        <div class="admin-list" data-admin-messages></div>
      </section>
      <section class="admin-section">
        <h2>${text("guestbook")}</h2>
        <div class="admin-toolbar">
          <input data-admin-guestbook-search placeholder="${text("searchGuestbook")}" />
          <button type="button" class="active" data-admin-guestbook-filter="all">${text("filterAll")}</button>
          <button type="button" data-admin-guestbook-filter="visible">${text("filterVisible")}</button>
          <button type="button" data-admin-guestbook-filter="hidden">${text("filterHidden")}</button>
        </div>
        <div class="admin-list" data-admin-guestbook></div>
      </section>
    `;

    const form = root.querySelector("form");
    const tokenInput = root.querySelector("[name='token']");
    const status = root.querySelector("[data-admin-status]");
    const recovery = root.querySelector("[data-admin-recovery]");
    const usersSlot = root.querySelector("[data-admin-users]");
    const privateSlot = root.querySelector("[data-admin-messages]");
    const guestbookSlot = root.querySelector("[data-admin-guestbook]");
    const privateSearch = root.querySelector("[data-admin-private-search]");
    const guestbookSearch = root.querySelector("[data-admin-guestbook-search]");
    let privateMessages = [];
    let guestbookMessages = [];
    let privateFilter = "all";
    let guestbookFilter = "all";
    tokenInput.value = readToken();

    function applyPrivateFilters() {
      const query = normalize(privateSearch.value);
      renderPrivateMessages(privateSlot, privateMessages.filter((message) => {
        if (privateFilter === "unread" && message.status !== "unread") return false;
        return [message.name, message.contact, message.accountUsername, message.content]
          .some((value) => normalize(value).includes(query));
      }));
    }

    function applyGuestbookFilters() {
      const query = normalize(guestbookSearch.value);
      renderGuestbookMessages(guestbookSlot, guestbookMessages.filter((message) => {
        if (guestbookFilter !== "all" && message.moderationStatus !== guestbookFilter) return false;
        return [message.name, message.username, message.content]
          .some((value) => normalize(value).includes(query));
      }));
    }

    async function refresh() {
      if (!readToken()) return;
      try {
        const data = await loadDashboard();
        status.textContent = "";
        renderUsers(usersSlot, data.users || []);
        privateMessages = data.privateMessages || [];
        guestbookMessages = data.guestbookMessages || [];
        applyPrivateFilters();
        applyGuestbookFilters();
      } catch (error) {
        status.textContent = friendlyError(error);
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      saveToken(tokenInput.value.trim());
      await refresh();
    });

    privateSearch.addEventListener("input", applyPrivateFilters);
    guestbookSearch.addEventListener("input", applyGuestbookFilters);

    root.addEventListener("click", async (event) => {
      const refreshButton = event.target.closest("[data-admin-refresh]");
      const forgetButton = event.target.closest("[data-admin-forget]");
      const issueButton = event.target.closest("[data-issue-code]");
      const toggleButton = event.target.closest("[data-toggle-message]");
      const deleteButton = event.target.closest("[data-delete-private]");
      const copyButton = event.target.closest("[data-copy-contact]");
      const privateFilterButton = event.target.closest("[data-admin-private-filter]");
      const guestbookFilterButton = event.target.closest("[data-admin-guestbook-filter]");
      const toggleGuestbookButton = event.target.closest("[data-toggle-guestbook]");
      const deleteGuestbookButton = event.target.closest("[data-delete-guestbook]");
      const deleteUserButton = event.target.closest("[data-delete-user]");

      if (refreshButton) {
        await refresh();
      } else if (forgetButton) {
        saveToken("");
        tokenInput.value = "";
        usersSlot.innerHTML = "";
        privateSlot.innerHTML = "";
        guestbookSlot.innerHTML = "";
        recovery.hidden = true;
      } else if (issueButton) {
        const minutes = Number(window.prompt(text("minutesPrompt"), "30"));
        if (!minutes) return;
        try {
          const result = await issueCode(issueButton.dataset.issueCode, minutes);
          recovery.hidden = false;
          recovery.innerHTML = `
            <strong>${text("codeReady")}: ${escapeHtml(result.code)}</strong>
            <span>${text("expiresAt")}: ${escapeHtml(formatDate(result.expiresAt))}</span>
            <p>${text("codeHint")}</p>
          `;
        } catch (error) {
          status.textContent = friendlyError(error);
        }
      } else if (toggleButton) {
        try {
          await updateMessage(toggleButton.dataset.toggleMessage, toggleButton.dataset.nextStatus);
          await refresh();
        } catch (error) {
          status.textContent = friendlyError(error);
        }
      } else if (copyButton) {
        try {
          await navigator.clipboard.writeText(copyButton.dataset.copyContact || "");
          status.textContent = text("copied");
        } catch (error) {
          status.textContent = text("failed");
        }
      } else if (deleteButton && window.confirm(text("deleteConfirm"))) {
        try {
          await deleteMessage(deleteButton.dataset.deletePrivate);
          await refresh();
        } catch (error) {
          status.textContent = friendlyError(error);
        }
      } else if (privateFilterButton) {
        privateFilter = privateFilterButton.dataset.adminPrivateFilter;
        root.querySelectorAll("[data-admin-private-filter]").forEach((button) => button.classList.toggle("active", button === privateFilterButton));
        applyPrivateFilters();
      } else if (guestbookFilterButton) {
        guestbookFilter = guestbookFilterButton.dataset.adminGuestbookFilter;
        root.querySelectorAll("[data-admin-guestbook-filter]").forEach((button) => button.classList.toggle("active", button === guestbookFilterButton));
        applyGuestbookFilters();
      } else if (toggleGuestbookButton) {
        try {
          await updateMessage(toggleGuestbookButton.dataset.toggleGuestbook, toggleGuestbookButton.dataset.nextStatus, "guestbook");
          await refresh();
        } catch (error) {
          status.textContent = friendlyError(error);
        }
      } else if (deleteGuestbookButton && window.confirm(text("deleteConfirm"))) {
        try {
          await deleteMessage(deleteGuestbookButton.dataset.deleteGuestbook, "guestbook");
          await refresh();
        } catch (error) {
          status.textContent = friendlyError(error);
        }
      } else if (deleteUserButton && window.confirm(text("unregisterConfirm"))) {
        try {
          await deleteMessage(deleteUserButton.dataset.deleteUser, "user");
          await refresh();
        } catch (error) {
          status.textContent = friendlyError(error);
        }
      }
    });

    if (readToken()) {
      refresh();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-admin-dashboard]").forEach(mount);
  });
})();
