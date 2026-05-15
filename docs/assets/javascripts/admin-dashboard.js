(function () {
  const storageKey = "biying-admin-token";

  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
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
      emptyUsers: zh ? "还没有注册用户。" : "No registered users yet.",
      emptyMessages: zh ? "还没有私信。" : "No private messages yet.",
      createdAt: zh ? "注册时间" : "Registered",
      passwordUpdatedAt: zh ? "最近改密" : "Password updated",
      issueCode: zh ? "签发恢复码" : "Issue recovery code",
      unread: zh ? "未读" : "Unread",
      read: zh ? "已读" : "Read",
      markRead: zh ? "标为已读" : "Mark read",
      markUnread: zh ? "标为未读" : "Mark unread",
      delete: zh ? "删除" : "Delete",
      contact: zh ? "联系方式" : "Contact",
      accountUsername: zh ? "关联用户名" : "Account username",
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
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : "-";
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

  async function parseResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "request_failed");
      error.code = data.error;
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function friendlyError(error) {
    if (error.status === 401 || error.code === "unauthorized") return text("unauthorized");
    if (error.code === "kv_not_configured") return text("kv");
    if (error.code === "user_not_found") return text("userNotFound");
    return text("failed");
  }

  async function loadDashboard() {
    return parseResponse(await fetch("/api/admin", {
      cache: "no-store",
      headers: headers()
    }));
  }

  async function issueCode(username, minutes) {
    return parseResponse(await fetch("/api/admin", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        action: "issue_recovery_code",
        username,
        minutes
      })
    }));
  }

  async function updateMessage(id, status) {
    return parseResponse(await fetch(`/api/admin?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ status })
    }));
  }

  async function deleteMessage(id) {
    return parseResponse(await fetch(`/api/admin?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers()
    }));
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
        <button type="button" data-issue-code="${escapeHtml(user.username)}">${text("issueCode")}</button>
      </article>
    `).join("");
  }

  function renderMessages(slot, messages) {
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
          <button type="button" data-delete-private="${escapeHtml(message.id)}">${text("delete")}</button>
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
        <div class="admin-list" data-admin-messages></div>
      </section>
    `;

    const form = root.querySelector("form");
    const tokenInput = root.querySelector("[name='token']");
    const status = root.querySelector("[data-admin-status]");
    const recovery = root.querySelector("[data-admin-recovery]");
    const usersSlot = root.querySelector("[data-admin-users]");
    const messagesSlot = root.querySelector("[data-admin-messages]");
    tokenInput.value = readToken();

    async function refresh() {
      if (!readToken()) return;
      try {
        const data = await loadDashboard();
        status.textContent = "";
        renderUsers(usersSlot, data.users || []);
        renderMessages(messagesSlot, data.privateMessages || []);
      } catch (error) {
        status.textContent = friendlyError(error);
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      saveToken(tokenInput.value.trim());
      await refresh();
    });

    root.addEventListener("click", async (event) => {
      const refreshButton = event.target.closest("[data-admin-refresh]");
      const forgetButton = event.target.closest("[data-admin-forget]");
      const issueButton = event.target.closest("[data-issue-code]");
      const toggleButton = event.target.closest("[data-toggle-message]");
      const deleteButton = event.target.closest("[data-delete-private]");

      if (refreshButton) {
        await refresh();
      } else if (forgetButton) {
        saveToken("");
        tokenInput.value = "";
        usersSlot.innerHTML = "";
        messagesSlot.innerHTML = "";
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
      } else if (deleteButton) {
        try {
          await deleteMessage(deleteButton.dataset.deletePrivate);
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
