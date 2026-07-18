(function () {
  function locale() {
    return window.BiyingDom ? window.BiyingDom.locale() : (window.location.pathname.includes("/zh/") ? "zh" : "en");
  }

  function isChinesePage() {
    return locale() === "zh";
  }

  window.BiyingI18n = {
    isChinesePage,
    locale
  };
})();
