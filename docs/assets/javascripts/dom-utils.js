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

  function formText(formData, name) {
    return String(formData.get(name) || "").trim();
  }

  window.BiyingDom = {
    accountUrl,
    escapeHtml,
    formatDate,
    formText,
    isChinesePage,
    locale,
    normalizePath
  };
})();
