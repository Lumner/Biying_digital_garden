(function () {
  const storageKey = "biying-auth-session";
  let cachedSession;

  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
  }

  function accountUrl() {
    return isChinesePage() ? "/zh/register/" : "/en/register/";
  }

  function text(key) {
    const zh = isChinesePage();
    const copy = {
      title: zh ? "账户" : "Account",
      registerTitle: zh ? "注册" : "Register",
      loginTitle: zh ? "登录" : "Sign In",
      username: zh ? "用户名（字母、数字、下划线）" : "Username (letters, numbers, underscore)",
      displayName: zh ? "显示名称" : "Display name",
      password: zh ? "密码（至少 8 位）" : "Password (at least 8 characters)",
      register: zh ? "创建账户" : "Create account",
      login: zh ? "登录" : "Sign in",
      logout: zh ? "退出登录" : "Sign out",
      current: zh ? "当前登录" : "Signed in as",
      required: zh ? "请先注册或登录。" : "Please register or sign in first.",
      kv: zh ? "账户功能需要先在 EdgeOne 中绑定 BIYING_KV。" : "Accounts require BIYING_KV to be bound in EdgeOne.",
      badCredentials: zh ? "用户名或密码不正确。" : "The username or password is incorrect.",
      taken: zh ? "这个用户名已经被使用。" : "This username is already taken.",
      invalidUsername: zh ? "用户名只能使用 3-24 位小写字母、数字和下划线。" : "Use 3-24 lowercase letters, numbers, or underscores.",
      invalidPassword: zh ? "密码至少需要 8 位。" : "Password must be at least 8 characters.",
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
    const code = error && error.code;
    return {
      kv_not_configured: text("kv"),
      invalid_credentials: text("badCredentials"),
      username_taken: text("taken"),
      invalid_username: text("invalidUsername"),
      invalid_password: text("invalidPassword")
    }[code] || text("network");
  }

  async function requestAuth(payload) {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "auth_failed");
      error.code = data.error;
      throw error;
    }
    saveSession({ token: data.token, user: data.user });
    return data;
  }

  async function refresh() {
    const token = getToken();
    if (!token) return null;
    const response = await fetch("/api/auth", {
      headers: authHeaders(),
      cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user) {
      saveSession(null);
      return null;
    }
    saveSession({ token, user: data.user });
    return data.user;
  }

  async function logout() {
    const token = getToken();
    saveSession(null);
    if (token) {
      await fetch("/api/auth", { method: "DELETE", headers: { authorization: `Bearer ${token}` } }).catch(() => {});
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
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mount(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    root.innerHTML = `
      <div data-auth-status></div>
      <div class="auth-grid">
        <form class="auth-card" data-auth-register>
          <h2>${text("registerTitle")}</h2>
          <input name="username" maxlength="24" autocomplete="username" placeholder="${text("username")}" />
          <input name="displayName" maxlength="40" autocomplete="name" placeholder="${text("displayName")}" />
          <input name="password" type="password" maxlength="80" autocomplete="new-password" placeholder="${text("password")}" />
          <button type="submit">${text("register")}</button>
          <p class="meta-line" data-auth-register-message></p>
        </form>
        <form class="auth-card" data-auth-login>
          <h2>${text("loginTitle")}</h2>
          <input name="username" maxlength="24" autocomplete="username" placeholder="${text("username")}" />
          <input name="password" type="password" maxlength="80" autocomplete="current-password" placeholder="${text("password")}" />
          <button type="submit">${text("login")}</button>
          <p class="meta-line" data-auth-login-message></p>
        </form>
      </div>
    `;

    renderStatus(root);
    refresh().finally(() => renderStatus(root));

    root.addEventListener("click", async (event) => {
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
          displayName: data.get("displayName"),
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
