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

  function themeName(mode = currentThemeMode()) {
    const lang = currentLang();
    if (mode === "system") return lang === "en" ? "System" : "跟随系统";
    if (mode === "dark") return lang === "en" ? "Dark" : "深色";
    return lang === "en" ? "Light" : "浅色";
  }

  function applyThemeMode(mode) {
    const nextMode = themeModes.includes(mode) ? mode : "system";
    const resolved = nextMode === "system" ? systemTheme() : nextMode;
    document.documentElement.dataset.biyingThemeMode = nextMode;
    document.documentElement.dataset.biyingTheme = resolved;
    document.querySelectorAll("[data-theme-switcher], [data-mobile-theme]").forEach((button) => {
      button.dataset.themeMode = nextMode;
      button.dataset.resolvedTheme = resolved;
      button.setAttribute("aria-label", themeLabel(nextMode));
      button.setAttribute("title", themeLabel(nextMode));
      button.setAttribute("aria-pressed", nextMode === "system" ? "mixed" : resolved === "light" ? "true" : "false");
      const label = button.querySelector("[data-theme-switcher-label]");
      if (label) {
        label.textContent = nextMode === "system" ? "SYS" : resolved === "light" ? "LIT" : "DRK";
      }
      const mobileLabel = button.querySelector("[data-mobile-theme-label]");
      if (mobileLabel) {
        mobileLabel.textContent = currentLang() === "en"
          ? `Theme: ${themeName(nextMode)}`
          : `主题：${themeName(nextMode)}`;
      }
    });
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

  function makeMobileTools() {
    const lang = currentLang();
    const otherLang = lang === "en" ? "zh" : "en";
    const shell = document.createElement("div");
    shell.className = "mobile-tools";
    shell.dataset.mobileTools = "";
    shell.innerHTML = `
      <button
        class="mobile-tools__toggle"
        type="button"
        aria-expanded="false"
        aria-haspopup="menu"
        aria-controls="mobile-site-tools"
        aria-label="${lang === "en" ? "Open site tools" : "打开站点工具"}"
        data-mobile-tools-toggle
      ><span aria-hidden="true">⋯</span></button>
      <div class="mobile-tools__menu" id="mobile-site-tools" role="menu" data-mobile-tools-menu hidden>
        <button class="mobile-tools__item" type="button" role="menuitem" data-mobile-search>
          <span aria-hidden="true">⌕</span>
          <span>${lang === "en" ? "Search" : "搜索"}</span>
        </button>
        <button class="mobile-tools__item" type="button" role="menuitem" data-mobile-theme>
          <span aria-hidden="true">◐</span>
          <span data-mobile-theme-label></span>
        </button>
        <a
          class="mobile-tools__item"
          href="${localizedPath(otherLang)}"
          role="menuitem"
          aria-label="${otherLang === "en" ? "Switch to English" : "切换到中文"}"
          data-mobile-language
        >
          <span aria-hidden="true">文</span>
          <span>${otherLang === "en" ? "English" : "中文"}</span>
        </a>
      </div>
    `;

    const toggle = shell.querySelector("[data-mobile-tools-toggle]");
    const menu = shell.querySelector("[data-mobile-tools-menu]");
    const search = shell.querySelector("[data-mobile-search]");
    const theme = shell.querySelector("[data-mobile-theme]");

    function setOpen(open, restoreFocus = false) {
      menu.toggleAttribute("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      shell.classList.toggle("is-open", open);
      if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener("click", () => {
      setOpen(menu.hasAttribute("hidden"));
    });

    search.addEventListener("click", () => {
      setOpen(false);
      const searchState = document.querySelector("#__search");
      if (!searchState) return;
      searchState.checked = true;
      searchState.dispatchEvent(new Event("change", { bubbles: true }));
      window.requestAnimationFrame(() => document.querySelector(".md-search__input")?.focus());
    });

    theme.addEventListener("click", () => {
      const index = themeModes.indexOf(currentThemeMode());
      setThemeMode(themeModes[(index + 1) % themeModes.length]);
    });

    document.addEventListener("pointerdown", (event) => {
      if (!shell.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hasAttribute("hidden")) {
        setOpen(false, true);
      }
    });

    applyThemeMode(currentThemeMode());
    return shell;
  }

  function mountMobileBrand(header) {
    const title = header?.querySelector(".md-header__title");
    if (!title || title.querySelector(".mobile-header-brand")) return;
    const brand = document.createElement("span");
    brand.className = "mobile-header-brand";
    brand.textContent = currentLang() === "en" ? "Biying" : "碧影";
    title.prepend(brand);
  }

  function mountSwitcher() {
    const header = document.querySelector(".md-header__inner");
    mountMobileBrand(header);

    if (!document.querySelector("[data-theme-switcher]")) {
      const themeSwitcher = makeThemeSwitcher();
      if (header) {
        header.appendChild(themeSwitcher);
      } else {
        document.body.appendChild(themeSwitcher);
      }
    }

    if (!document.querySelector(".lang-switcher")) {
      const switcher = document.createElement("nav");
      switcher.className = "lang-switcher";
      switcher.setAttribute("aria-label", currentLang() === "en" ? "Language" : "语言");
      switcher.append(makeOption("中文", "zh"), makeOption("EN", "en"));
      if (header) {
        header.appendChild(switcher);
      } else {
        document.body.appendChild(switcher);
      }
    }

    if (!document.querySelector("[data-mobile-tools]")) {
      const tools = makeMobileTools();
      if (header) {
        header.appendChild(tools);
      } else {
        document.body.appendChild(tools);
      }
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

