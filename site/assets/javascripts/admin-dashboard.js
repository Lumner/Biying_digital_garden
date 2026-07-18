(function () {
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
      forget: zh ? "退出后台" : "Sign out",
      users: zh ? "注册用户" : "Registered Users",
      inbox: zh ? "私信收件箱" : "Private Inbox",
      guestbook: zh ? "公开留言管理" : "Guestbook Moderation",
      dashboardReady: zh ? "后台数据已更新。" : "Dashboard data updated.",
      tokenForgotten: zh ? "已退出后台并清除短期会话。" : "Signed out and cleared the short-lived session.",
      updated: zh ? "已更新。" : "Updated.",
      deleted: zh ? "已删除。" : "Deleted.",
      accountDeleted: zh ? "用户已注销。" : "User deleted.",
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
      searchPrivateExample: zh ? "例如：用户名或联系方式" : "For example: a username or contact",
      searchGuestbookExample: zh ? "例如：用户名或留言关键词" : "For example: a username or message keyword",
      copyContact: zh ? "复制联系方式" : "Copy contact",
      copied: zh ? "已复制联系方式。" : "Contact copied.",
      codeReady: zh ? "恢复码已生成" : "Recovery code ready",
      expiresAt: zh ? "过期时间" : "Expires",
      codeHint: zh ? "把它私下发给用户；过期后或使用一次后就会失效。" : "Send it privately; it expires or becomes invalid after one use.",
      minutesPrompt: zh ? "恢复码有效分钟数（5-1440）" : "Recovery-code validity in minutes (5-1440)",
      unauthorized: zh ? "管理员 token 不正确，或短期会话已过期。" : "The admin token is incorrect or the short-lived session has expired.",
      tokenRequired: zh ? "请填写管理员 token。" : "Enter the admin token.",
      kv: zh ? "后台需要先绑定 BIYING_KV。" : "The dashboard requires BIYING_KV.",
      loading: zh ? "正在加载后台数据……" : "Loading dashboard data…",
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

  function friendlyError(error) {
    return api.friendlyError(error, {
      "401": text("unauthorized"),
      unauthorized: text("unauthorized"),
      kv_not_configured: text("kv"),
      user_not_found: text("userNotFound")
    }, text("failed"));
  }

  function notify(message, type = "info") {
    if (window.BiyingToast && window.BiyingToast.show) {
      window.BiyingToast.show(message, { type });
    }
    return message;
  }

  function setDashboardBusy(root, busy) {
    dom.setBusy(
      root,
      busy,
      ".admin-token-form button[type='submit'], [data-admin-refresh]"
    );
  }

  async function loadDashboard() {
    return api.request("/api/admin", {
      cache: "no-store"
    });
  }

  async function createAdminSession(token) {
    return api.request("/api/admin", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      json: { action: "create_session" }
    });
  }

  async function closeAdminSession() {
    return api.request("/api/admin", {
      method: "POST",
      json: { action: "logout" }
    });
  }

  async function issueCode(username, minutes) {
    return api.request("/api/admin", {
      method: "POST",
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
      json: { status }
    });
  }

  async function deleteMessage(id, kind = "private") {
    return api.request(`/api/admin?id=${encodeURIComponent(id)}&kind=${encodeURIComponent(kind)}`, {
      method: "DELETE"
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
          <button type="button" class="danger" data-delete-user="${escapeHtml(user.username)}">${text("unregister")}</button>
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
          <button type="button" class="danger" data-delete-private="${escapeHtml(message.id)}">${text("delete")}</button>
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
          <button type="button" class="danger" data-delete-guestbook="${escapeHtml(message.id)}">${text("delete")}</button>
        </div>
      </article>
    `).join("");
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <form class="admin-token-form" novalidate>
        <label class="form-field admin-token-field" for="admin-token">
          <span class="form-field__label">${text("token")}</span>
          <input id="admin-token" name="token" type="password" autocomplete="one-time-code" aria-describedby="admin-status" />
        </label>
        <button type="submit">${text("connect")}</button>
        <button type="button" data-admin-refresh>${text("refresh")}</button>
        <button type="button" data-admin-forget>${text("forget")}</button>
      </form>
      <p class="meta-line form-status" id="admin-status" data-admin-status role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="admin-recovery" data-admin-recovery role="status" aria-live="polite" aria-atomic="true" hidden></div>
      <div class="admin-tabs" role="tablist" aria-label="${isChinesePage() ? "后台模块" : "Dashboard modules"}" aria-orientation="horizontal">
        <button id="admin-tab-users" type="button" role="tab" class="active" data-admin-tab="users" aria-controls="admin-panel-users" aria-selected="true" tabindex="0">${text("users")}<span data-admin-count="users">0</span></button>
        <button id="admin-tab-inbox" type="button" role="tab" data-admin-tab="inbox" aria-controls="admin-panel-inbox" aria-selected="false" tabindex="-1">${text("inbox")}<span data-admin-count="inbox">0</span></button>
        <button id="admin-tab-guestbook" type="button" role="tab" data-admin-tab="guestbook" aria-controls="admin-panel-guestbook" aria-selected="false" tabindex="-1">${text("guestbook")}<span data-admin-count="guestbook">0</span></button>
      </div>
      <section class="admin-section active" id="admin-panel-users" data-admin-panel="users" role="tabpanel" aria-labelledby="admin-tab-users">
        <h2>${text("users")}</h2>
        <div class="admin-list" data-admin-users></div>
      </section>
      <section class="admin-section" id="admin-panel-inbox" data-admin-panel="inbox" role="tabpanel" aria-labelledby="admin-tab-inbox" hidden>
        <h2>${text("inbox")}</h2>
        <div class="admin-toolbar">
          <label class="form-field admin-search-field" for="admin-private-search">
            <span class="sr-only">${text("searchPrivate")}</span>
            <input id="admin-private-search" type="search" data-admin-private-search placeholder="${text("searchPrivateExample")}" />
          </label>
          <button type="button" class="active" data-admin-private-filter="all" aria-pressed="true">${text("filterAll")}</button>
          <button type="button" data-admin-private-filter="unread" aria-pressed="false">${text("filterUnread")}</button>
        </div>
        <div class="admin-list" data-admin-messages></div>
      </section>
      <section class="admin-section" id="admin-panel-guestbook" data-admin-panel="guestbook" role="tabpanel" aria-labelledby="admin-tab-guestbook" hidden>
        <h2>${text("guestbook")}</h2>
        <div class="admin-toolbar">
          <label class="form-field admin-search-field" for="admin-guestbook-search">
            <span class="sr-only">${text("searchGuestbook")}</span>
            <input id="admin-guestbook-search" type="search" data-admin-guestbook-search placeholder="${text("searchGuestbookExample")}" />
          </label>
          <button type="button" class="active" data-admin-guestbook-filter="all" aria-pressed="true">${text("filterAll")}</button>
          <button type="button" data-admin-guestbook-filter="visible" aria-pressed="false">${text("filterVisible")}</button>
          <button type="button" data-admin-guestbook-filter="hidden" aria-pressed="false">${text("filterHidden")}</button>
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
    const tabs = [...root.querySelectorAll("[data-admin-tab]")];
    const panels = [...root.querySelectorAll("[data-admin-panel]")];
    let privateMessages = [];
    let guestbookMessages = [];
    let privateFilter = "all";
    let guestbookFilter = "all";
    function setTab(name) {
      tabs.forEach((tab) => {
        const active = tab.dataset.adminTab === name;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.setAttribute("tabindex", active ? "0" : "-1");
      });
      panels.forEach((panel) => {
        const active = panel.dataset.adminPanel === name;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
      });
    }

    function setCount(name, value) {
      const slot = root.querySelector(`[data-admin-count="${name}"]`);
      if (slot) slot.textContent = String(value || 0);
    }

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

    async function refresh(options = {}) {
      setDashboardBusy(root, true);
      if (options.announce !== false) dom.setLiveStatus(status, text("loading"), "loading");
      try {
        const data = await loadDashboard();
        const users = data.users || [];
        renderUsers(usersSlot, users);
        privateMessages = data.privateMessages || [];
        guestbookMessages = data.guestbookMessages || [];
        setCount("users", users.length);
        setCount("inbox", privateMessages.length);
        setCount("guestbook", guestbookMessages.length);
        applyPrivateFilters();
        applyGuestbookFilters();
        if (options.announce) {
          dom.setLiveStatus(status, notify(text("dashboardReady"), "success"), "success");
        } else {
          dom.setLiveStatus(status, "", "idle");
        }
      } catch (error) {
        if (options.silentUnauthorized && Number(error && error.status) === 401) {
          dom.setLiveStatus(status, "", "idle");
          return;
        }
        dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
      } finally {
        setDashboardBusy(root, false);
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const token = tokenInput.value.trim();
      if (!token) {
        tokenInput.setAttribute("aria-invalid", "true");
        dom.setLiveStatus(status, text("tokenRequired"), "error");
        tokenInput.focus();
        return;
      }
      tokenInput.removeAttribute("aria-invalid");
      tokenInput.value = "";
      setDashboardBusy(root, true);
      try {
        await createAdminSession(token);
        await refresh({ announce: true });
      } catch (error) {
        dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
      } finally {
        tokenInput.value = "";
        setDashboardBusy(root, false);
      }
    });

    tokenInput.addEventListener("input", () => tokenInput.removeAttribute("aria-invalid"));
    privateSearch.addEventListener("input", applyPrivateFilters);
    guestbookSearch.addEventListener("input", applyGuestbookFilters);
    root.querySelector(".admin-tabs").addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const currentIndex = Math.max(0, tabs.indexOf(document.activeElement));
      let nextIndex = currentIndex;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      setTab(nextTab.dataset.adminTab);
      nextTab.focus();
    });

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
      const tabButton = event.target.closest("[data-admin-tab]");

      if (tabButton) {
        setTab(tabButton.dataset.adminTab);
      } else if (refreshButton) {
        await refresh({ announce: true });
      } else if (forgetButton) {
        try {
          await closeAdminSession();
          tokenInput.value = "";
          usersSlot.innerHTML = "";
          privateSlot.innerHTML = "";
          guestbookSlot.innerHTML = "";
          recovery.hidden = true;
          setCount("users", 0);
          setCount("inbox", 0);
          setCount("guestbook", 0);
          dom.setLiveStatus(status, notify(text("tokenForgotten"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
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
          dom.setLiveStatus(status, notify(text("codeReady"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
      } else if (toggleButton) {
        try {
          await updateMessage(toggleButton.dataset.toggleMessage, toggleButton.dataset.nextStatus);
          await refresh();
          dom.setLiveStatus(status, notify(text("updated"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
      } else if (copyButton) {
        try {
          await navigator.clipboard.writeText(copyButton.dataset.copyContact || "");
          dom.setLiveStatus(status, notify(text("copied"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(text("failed"), "error"), "error");
        }
      } else if (deleteButton && window.confirm(text("deleteConfirm"))) {
        try {
          await deleteMessage(deleteButton.dataset.deletePrivate);
          await refresh();
          dom.setLiveStatus(status, notify(text("deleted"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
      } else if (privateFilterButton) {
        privateFilter = privateFilterButton.dataset.adminPrivateFilter;
        root.querySelectorAll("[data-admin-private-filter]").forEach((button) => {
          const active = button === privateFilterButton;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        applyPrivateFilters();
      } else if (guestbookFilterButton) {
        guestbookFilter = guestbookFilterButton.dataset.adminGuestbookFilter;
        root.querySelectorAll("[data-admin-guestbook-filter]").forEach((button) => {
          const active = button === guestbookFilterButton;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        applyGuestbookFilters();
      } else if (toggleGuestbookButton) {
        try {
          await updateMessage(toggleGuestbookButton.dataset.toggleGuestbook, toggleGuestbookButton.dataset.nextStatus, "guestbook");
          await refresh();
          dom.setLiveStatus(status, notify(text("updated"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
      } else if (deleteGuestbookButton && window.confirm(text("deleteConfirm"))) {
        try {
          await deleteMessage(deleteGuestbookButton.dataset.deleteGuestbook, "guestbook");
          await refresh();
          dom.setLiveStatus(status, notify(text("deleted"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
      } else if (deleteUserButton && window.confirm(text("unregisterConfirm"))) {
        try {
          await deleteMessage(deleteUserButton.dataset.deleteUser, "user");
          await refresh();
          dom.setLiveStatus(status, notify(text("accountDeleted"), "success"), "success");
        } catch (error) {
          dom.setLiveStatus(status, notify(friendlyError(error), "error"), "error");
        }
      }
    });

    refresh({ silentUnauthorized: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-admin-dashboard]").forEach(mount);
  });
})();
