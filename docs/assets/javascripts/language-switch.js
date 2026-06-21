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

  const themeModes = ["system", "dark", "light"];

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function currentThemeMode() {
    const mode = document.documentElement.dataset.biyingThemeMode;
    if (themeModes.includes(mode)) return mode;
    try {
      const storedTheme = localStorage.getItem("biying-theme");
      if (themeModes.includes(storedTheme)) return storedTheme;
    } catch (error) {
      return "system";
    }
    return "system";
  }

  function currentTheme() {
    const mode = currentThemeMode();
    if (mode === "system") return systemTheme();
    const theme = document.documentElement.dataset.biyingTheme;
    if (theme === "light" || theme === "dark") return theme;
    return mode;
  }

  function themeLabel(mode = currentThemeMode()) {
    const lang = currentLang();
    if (mode === "system") return lang === "en" ? "Theme follows system; click for dark mode" : "主题跟随系统；点击切换到深色模式";
    if (mode === "dark") return lang === "en" ? "Dark mode; click for light mode" : "深色模式；点击切换到浅色模式";
    return lang === "en" ? "Light mode; click to follow system" : "浅色模式；点击跟随系统";
  }

  function applyThemeMode(mode) {
    const nextMode = themeModes.includes(mode) ? mode : "system";
    const resolved = nextMode === "system" ? systemTheme() : nextMode;
    document.documentElement.dataset.biyingThemeMode = nextMode;
    document.documentElement.dataset.biyingTheme = resolved;
    const button = document.querySelector("[data-theme-switcher]");
    if (button) {
      button.dataset.themeMode = nextMode;
      button.dataset.resolvedTheme = resolved;
      button.setAttribute("aria-label", themeLabel(nextMode));
      button.setAttribute("title", themeLabel(nextMode));
      button.setAttribute("aria-pressed", nextMode === "system" ? "mixed" : resolved === "light" ? "true" : "false");
      const label = button.querySelector("[data-theme-switcher-label]");
      if (label) {
        label.textContent = nextMode === "system" ? "SYS" : resolved === "light" ? "LIT" : "DRK";
      }
    }
  }

  function setThemeMode(mode) {
    const nextMode = themeModes.includes(mode) ? mode : "system";
    try {
      localStorage.setItem("biying-theme", nextMode);
    } catch (error) {
      // Storage can be blocked in private contexts. The current page still updates.
    }
    applyThemeMode(nextMode);
  }

  function setTheme(theme) {
    document.documentElement.dataset.biyingTheme = theme;
    try {
      localStorage.setItem("biying-theme", theme);
    } catch (error) {
      // Storage can be blocked in private contexts. The current page still updates.
    }
    const button = document.querySelector("[data-theme-switcher]");
    if (button) {
      button.setAttribute("aria-label", themeLabel(theme));
      button.setAttribute("title", themeLabel(theme));
      button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
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

  function makeThemeSwitcher() {
    const activeMode = currentThemeMode();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-switcher";
    button.dataset.themeSwitcher = "";
    button.innerHTML = '<span aria-hidden="true"></span><b data-theme-switcher-label></b>';
    button.addEventListener("click", () => {
      const index = themeModes.indexOf(currentThemeMode());
      setThemeMode(themeModes[(index + 1) % themeModes.length]);
    });
    applyThemeMode(activeMode);
    return button;
  }

  function mountSwitcher() {
    if (document.querySelector(".lang-switcher")) return;
    if (!document.querySelector("[data-theme-switcher]")) {
      const themeSwitcher = makeThemeSwitcher();
      const header = document.querySelector(".md-header__inner");
      if (header) {
        header.appendChild(themeSwitcher);
      } else {
        document.body.appendChild(themeSwitcher);
      }
    }
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
    applyThemeMode(currentThemeMode());
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
        if (currentThemeMode() === "system") applyThemeMode("system");
      });
    }
  });
})();

