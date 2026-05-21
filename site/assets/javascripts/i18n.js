(function () {
  function locale() {
    return window.BiyingDom ? window.BiyingDom.locale() : (window.location.pathname.includes("/zh/") ? "zh" : "en");
  }

  function isChinesePage() {
    return locale() === "zh";
  }

  function choose(zh, en) {
    return isChinesePage() ? zh : en;
  }

  function create(messages) {
    return function text(key) {
      const entry = messages[key];
      if (!entry) return "";
      if (typeof entry === "string") return entry;
      return choose(entry.zh, entry.en);
    };
  }

  window.BiyingI18n = {
    choose,
    create,
    isChinesePage,
    locale
  };
})();
