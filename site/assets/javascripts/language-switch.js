(function () {
  function currentLang() {
    return window.location.pathname.includes("/en/") ? "en" : "zh";
  }

  function localizedPath(lang) {
    const path = window.location.pathname;
    if (lang === "en") {
      return path.includes("/zh/") ? path.replace("/zh/", "/en/") : "/en/";
    }
    return path.includes("/en/") ? path.replace("/en/", "/zh/") : "/zh/";
  }

  function hrefLang(href) {
    if (!href) return "";
    try {
      const url = new URL(href, window.location.href);
      if (url.pathname.includes("/zh/")) return "zh";
      if (url.pathname.includes("/en/")) return "en";
    } catch (error) {
      return "";
    }
    return "";
  }

  function filterLanguageNavigation(lang) {
    document.documentElement.dataset.biyingLang = lang;
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.querySelectorAll(".md-nav__item, .md-tabs__item").forEach((item) => {
      const links = Array.from(item.querySelectorAll("a[href]"));
      const langs = links.map((link) => hrefLang(link.getAttribute("href"))).filter(Boolean);
      if (!langs.length) return;
      item.hidden = !langs.includes(lang);
    });
  }

  function makeOption(label, lang) {
    const active = currentLang() === lang;
    const link = document.createElement("a");
    link.href = localizedPath(lang);
    link.textContent = label;
    link.className = active ? "active" : "";
    link.setAttribute("aria-current", active ? "true" : "false");
    link.setAttribute("aria-label", lang === "zh" ? "切换到中文" : "Switch to English");
    return link;
  }

  function mountSwitcher() {
    if (document.querySelector(".lang-switcher")) return;
    const switcher = document.createElement("nav");
    switcher.className = "lang-switcher";
    switcher.setAttribute("aria-label", currentLang() === "en" ? "Language" : "语言");
    switcher.append(makeOption("中文", "zh"), makeOption("EN", "en"));

    const header = document.querySelector(".md-header__inner");
    if (header) {
      header.appendChild(switcher);
    } else {
      document.body.appendChild(switcher);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    filterLanguageNavigation(currentLang());
    mountSwitcher();
  });
})();

