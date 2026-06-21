(function () {
  const storageKey = "biying-auth-session";
  const api = window.BiyingApi;
  const dom = window.BiyingDom;
  const i18n = window.BiyingI18n;
  let cachedSession;

  function isChinesePage() {
    return i18n.isChinesePage();
  }

  function accountUrl() {
    return dom.accountUrl();
  }

  function text(key) {
    const zh = isChinesePage();
    const copy = {
      title: zh ? "账户" : "Account",
      registerTitle: zh ? "注册" : "Register",
      loginTitle: zh ? "登录" : "Sign In",
      resetTitle: zh ? "忘记密码" : "Forgot Password",
      loginHint: zh ? "已有账户时从这里进入。" : "Use this if you already have an account.",
      registerHint: zh ? "第一次留言或对话时创建账户。" : "Create an account before your first message or chat.",
      resetHint: zh ? "拿到恢复码后在这里设置新密码。" : "Use this after receiving a recovery code.",
      privateTitle: zh ? "私信站点主人" : "Private message the site owner",
      username: zh ? "用户名（中文、字母、数字、下划线）" : "Username (Chinese, letters, numbers, underscore)",
      password: zh ? "密码（至少 8 位）" : "Password (at least 8 characters)",
      newPassword: zh ? "新密码（至少 8 位）" : "New password (at least 8 characters)",
      recoveryCode: zh ? "恢复码" : "Recovery code",
      recoveryHint: zh
        ? "如果忘记密码，请先通过下方私信联系站点主人，再使用收到的恢复码重设密码。"
        : "If you forgot your password, contact the site owner below first, then use the recovery code you receive here.",
      privateHint: zh
        ? "这条消息不会公开展示。若用于找回密码，请写清注册用户名和你希望收到回复的联系方式。"
        : "This message is not public. For password recovery, include your account username and a contact method for the reply.",
      privateName: zh ? "你的称呼" : "Your name",
      privateAccount: zh ? "注册用户名（找回密码时填写）" : "Account username (for password recovery)",
      privateContact: zh ? "联系方式（邮箱、QQ、微信等）" : "Contact method (email, chat handle, etc.)",
      privateMessage: zh ? "想私下告诉站点主人的内容" : "What you want to tell the site owner privately",
      register: zh ? "创建账户" : "Create account",
      login: zh ? "登录" : "Sign in",
      reset: zh ? "重设密码" : "Reset password",
      sendPrivate: zh ? "发送私信" : "Send private message",
      logout: zh ? "退出登录" : "Sign out",
      current: zh ? "当前登录" : "Signed in as",
      required: zh ? "请先注册或登录。" : "Please register or sign in first.",
      kv: zh ? "账户功能需要先在 EdgeOne 中绑定 BIYING_KV。" : "Accounts require BIYING_KV to be bound in EdgeOne.",
      badCredentials: zh ? "用户名或密码不正确。" : "The username or password is incorrect.",
      taken: zh ? "这个用户名已经被使用。" : "This username is already taken.",
      invalidUsername: zh ? "用户名只能使用 2-24 位中文、字母、数字和下划线。" : "Use 2-24 Chinese characters, letters, numbers, or underscores.",
      invalidPassword: zh ? "密码至少需要 8 位。" : "Password must be at least 8 characters.",
      invalidRecovery: zh ? "恢复码不正确。" : "The recovery code is incorrect.",
      recoveryExpired: zh ? "恢复码已过期，请重新联系站点主人获取新的恢复码。" : "The recovery code has expired. Ask the site owner for a new one.",
      recoveryMissing: zh ? "站点还没有配置密码恢复码。" : "Password recovery is not configured yet.",
      tooFrequent: zh ? "操作有点太频繁了，请稍等片刻再试。" : "That was a little too frequent. Please wait a moment and try again.",
      resetSaved: zh ? "密码已重设，并已登录。" : "Password reset complete. You are signed in.",
      privateSaved: zh ? "私信已发送。" : "Private message sent.",
      privateRequired: zh ? "请把称呼、联系方式和私信内容都填写完整。" : "Please complete your name, contact method, and message.",
      saved: zh ? "已登录。" : "Signed in.",
      network: zh ? "连接失败，请稍后再试。" : "Connection failed. Please try again later."
    };
    return copy[key];
  }

  function readSession() {
    if (cachedSession) return cachedSession;
    try {
      cachedSession = JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch (error) {
      cachedSession = null;
    }
    return cachedSession;
  }

  function saveSession(session) {
    cachedSession = session || null;
    if (cachedSession) {
      localStorage.setItem(storageKey, JSON.stringify(cachedSession));
    } else {
      localStorage.removeItem(storageKey);
    }
    window.dispatchEvent(new CustomEvent("biying-auth-change", { detail: cachedSession }));
  }

  function getToken() {
    return readSession()?.token || "";
  }

  function authHeaders() {
    const token = getToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }

  function user() {
    return readSession()?.user || null;
  }

  function friendlyError(error) {
    return api.friendlyError(error, {
      kv_not_configured: text("kv"),
      invalid_credentials: text("badCredentials"),
      username_taken: text("taken"),
      invalid_username: text("invalidUsername"),
      invalid_password: text("invalidPassword"),
      invalid_recovery_code: text("invalidRecovery"),
      recovery_expired: text("recoveryExpired"),
      recovery_not_configured: text("recoveryMissing"),
      too_frequent: text("tooFrequent")
    }, text("network"));
  }

  async function requestAuth(payload) {
    const data = await api.request("/api/auth", {
      method: "POST",
      json: payload
    });
    saveSession({ token: data.token, user: data.user });
    return data;
  }

  async function refresh() {
    const token = getToken();
    if (!token) return null;
    try {
      const data = await api.request("/api/auth", {
        headers: authHeaders(),
        cache: "no-store"
      });
      if (!data.user) {
        saveSession(null);
        return null;
      }
      saveSession({ token, user: data.user });
      return data.user;
    } catch (error) {
      saveSession(null);
      return null;
    }
  }

  async function logout() {
    const token = getToken();
    saveSession(null);
    if (token) {
      await api.request("/api/auth", { method: "DELETE", headers: { authorization: `Bearer ${token}` } }).catch(() => {});
    }
  }

  function renderStatus(root) {
    const current = user();
    const status = root.querySelector("[data-auth-status]");
    if (!status) return;
    if (current) {
      status.innerHTML = `
        <div class="auth-card signed-in">
          <strong>${text("current")}</strong>
          <span>${escapeHtml(current.displayName)} (@${escapeHtml(current.username)})</span>
          <button type="button" data-auth-logout>${text("logout")}</button>
        </div>
      `;
    } else {
      status.innerHTML = `<div class="auth-card">${text("required")}</div>`;
    }
  }

  function escapeHtml(value) {
    return dom.escapeHtml(value);
  }

  const accountModes = ["login", "register", "reset"];

  function switchAccountMode(root, mode) {
    const nextMode = accountModes.includes(mode) ? mode : "login";
    root.dataset.authMode = nextMode;
    root.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      const active = tab.dataset.authTab === nextMode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
    root.querySelectorAll("[data-auth-mode-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.authModePanel !== nextMode;
    });
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <div data-auth-status></div>
      <div class="auth-shell">
        <div class="auth-tabs" role="tablist" aria-label="${text("title")}">
          <button type="button" role="tab" data-auth-tab="login" aria-controls="auth-panel-login">${text("loginTitle")}</button>
          <button type="button" role="tab" data-auth-tab="register" aria-controls="auth-panel-register">${text("registerTitle")}</button>
          <button type="button" role="tab" data-auth-tab="reset" aria-controls="auth-panel-reset">${text("resetTitle")}</button>
        </div>
        <div class="auth-account-forms">
          <form class="auth-card auth-card--primary" data-auth-login data-auth-mode-panel="login" id="auth-panel-login" role="tabpanel">
            <h2>${text("loginTitle")}</h2>
            <p class="meta-line">${text("loginHint")}</p>
            <input name="username" maxlength="24" autocomplete="username" placeholder="${text("username")}" />
            <input name="password" type="password" maxlength="80" autocomplete="current-password" placeholder="${text("password")}" />
            <button type="submit">${text("login")}</button>
            <p class="meta-line" data-auth-login-message></p>
          </form>
          <form class="auth-card auth-card--primary" data-auth-register data-auth-mode-panel="register" id="auth-panel-register" role="tabpanel">
            <h2>${text("registerTitle")}</h2>
            <p class="meta-line">${text("registerHint")}</p>
            <input name="username" maxlength="24" autocomplete="username" placeholder="${text("username")}" />
            <input name="password" type="password" maxlength="80" autocomplete="new-password" placeholder="${text("password")}" />
            <button type="submit">${text("register")}</button>
            <p class="meta-line" data-auth-register-message></p>
          </form>
          <form class="auth-card auth-card--primary" data-auth-reset data-auth-mode-panel="reset" id="auth-panel-reset" role="tabpanel">
            <h2>${text("resetTitle")}</h2>
            <p class="meta-line">${text("resetHint")}</p>
            <p class="meta-line">${text("recoveryHint")}</p>
            <input name="username" maxlength="24" autocomplete="username" placeholder="${text("username")}" />
            <input name="recoveryToken" type="password" maxlength="120" autocomplete="one-time-code" placeholder="${text("recoveryCode")}" />
            <input name="password" type="password" maxlength="80" autocomplete="new-password" placeholder="${text("newPassword")}" />
            <button type="submit">${text("reset")}</button>
            <p class="meta-line" data-auth-reset-message></p>
          </form>
        </div>
        <form class="auth-card auth-card--private" data-auth-private>
          <h2>${text("privateTitle")}</h2>
          <p class="meta-line">${text("privateHint")}</p>
          <input name="name" maxlength="40" placeholder="${text("privateName")}" />
          <input name="accountUsername" maxlength="40" placeholder="${text("privateAccount")}" />
          <input name="contact" maxlength="120" placeholder="${text("privateContact")}" />
          <textarea name="content" rows="4" maxlength="800" placeholder="${text("privateMessage")}"></textarea>
          <input class="hp-field" name="website" tabindex="-1" autocomplete="off" />
          <button type="submit">${text("sendPrivate")}</button>
          <p class="meta-line" data-auth-private-message></p>
        </form>
      </div>
    `;

    renderStatus(root);
    switchAccountMode(root, "login");
    refresh().finally(() => renderStatus(root));

    root.addEventListener("click", async (event) => {
      const tab = event.target.closest("[data-auth-tab]");
      if (tab) {
        switchAccountMode(root, tab.dataset.authTab);
        return;
      }
      if (!event.target.closest("[data-auth-logout]")) return;
      await logout();
      renderStatus(root);
    });

    root.querySelector("[data-auth-register]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const message = root.querySelector("[data-auth-register-message]");
      const data = new FormData(form);
      try {
        await requestAuth({
          action: "register",
          username: data.get("username"),
          password: data.get("password")
        });
        form.reset();
        message.textContent = text("saved");
      } catch (error) {
        message.textContent = friendlyError(error);
      }
      renderStatus(root);
    });

    root.querySelector("[data-auth-login]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const message = root.querySelector("[data-auth-login-message]");
      const data = new FormData(form);
      try {
        await requestAuth({
          action: "login",
          username: data.get("username"),
          password: data.get("password")
        });
        form.reset();
        message.textContent = text("saved");
      } catch (error) {
        message.textContent = friendlyError(error);
      }
      renderStatus(root);
    });

    root.querySelector("[data-auth-reset]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const message = root.querySelector("[data-auth-reset-message]");
      const data = new FormData(form);
      try {
        await requestAuth({
          action: "reset_password",
          username: data.get("username"),
          recoveryToken: data.get("recoveryToken"),
          password: data.get("password")
        });
        form.reset();
        message.textContent = text("resetSaved");
      } catch (error) {
        message.textContent = friendlyError(error);
      }
      renderStatus(root);
    });

    root.querySelector("[data-auth-private]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const message = root.querySelector("[data-auth-private-message]");
      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        accountUsername: String(data.get("accountUsername") || "").trim(),
        contact: String(data.get("contact") || "").trim(),
        content: String(data.get("content") || "").trim(),
        website: String(data.get("website") || ""),
        locale: dom.locale()
      };
      if (!payload.name || !payload.contact || !payload.content) {
        message.textContent = text("privateRequired");
        return;
      }
      if (payload.website) return;
      try {
        await api.request("/api/private-messages", {
          method: "POST",
          json: payload
        });
        form.reset();
        message.textContent = text("privateSaved");
      } catch (error) {
        message.textContent = friendlyError(error);
      }
    });
  }

  window.BiyingAuth = {
    accountUrl,
    authHeaders,
    friendlyError,
    getToken,
    isChinesePage,
    logout,
    refresh,
    requiredText: () => text("required"),
    user
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-auth]").forEach(mount);
  });
})();
