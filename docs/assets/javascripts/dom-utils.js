(function () {
  function isChinesePage() {
    return window.location.pathname.includes("/zh/");
  }

  function locale() {
    return isChinesePage() ? "zh" : "en";
  }

  function accountUrl() {
    return isChinesePage() ? "/zh/register/" : "/en/register/";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value, fallback = "") {
    return value ? new Date(value).toLocaleString() : fallback;
  }

  function normalizePath(value) {
    return String(value || "").replace(/\/+$/, "") || "/";
  }

  function setLiveStatus(element, message, state = "idle") {
    if (!element) return;
    element.textContent = message || "";
    element.dataset.state = state;
    const isError = state === "error";
    element.setAttribute("role", isError ? "alert" : "status");
    element.setAttribute("aria-live", isError ? "assertive" : "polite");
  }

  function setBusy(root, busy, selector = "button[type='submit']") {
    if (!root) return;
    root.setAttribute("aria-busy", String(busy));
    root.querySelectorAll(selector).forEach((button) => {
      button.disabled = busy;
    });
  }

  window.BiyingDom = {
    accountUrl,
    escapeHtml,
    formatDate,
    isChinesePage,
    locale,
    normalizePath,
    setBusy,
    setLiveStatus
  };
})();
