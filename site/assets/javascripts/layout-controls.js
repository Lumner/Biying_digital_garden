(function () {
  const storageKey = "biying-sidebar-preferences-v1";
  const desktop = window.matchMedia("(min-width: 960px)");
  const controls = new Map();
  let preferences = readPreferences();

  const definitions = [
    {
      bodyClass: "sidebar-primary-open",
      id: "biying-sidebar-primary",
      kind: "primary",
      selector: ".md-sidebar--primary"
    },
    {
      bodyClass: "sidebar-secondary-open",
      id: "biying-sidebar-secondary",
      kind: "secondary",
      selector: ".md-sidebar--secondary"
    }
  ];

  function currentLang() {
    return window.location.pathname.includes("/en/") ? "en" : "zh";
  }

  function copy(kind, expanded) {
    const english = currentLang() === "en";
    if (kind === "primary") {
      return {
        label: english ? "Navigation" : "导航",
        name: expanded
          ? (english ? "Close site navigation" : "收起主导航")
          : (english ? "Open site navigation" : "展开主导航")
      };
    }
    return {
      label: english ? "On this page" : "目录",
      name: expanded
        ? (english ? "Close table of contents" : "收起本页目录")
        : (english ? "Open table of contents" : "展开本页目录")
    };
  }

  function readPreferences() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        primary: stored.primary === true,
        secondary: stored.secondary === true
      };
    } catch (error) {
      return { primary: false, secondary: false };
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      // Device storage may be unavailable. The current page state still works.
    }
  }

  function setExpanded(control, expanded, persist = true) {
    const next = Boolean(expanded);
    const text = copy(control.kind, next);
    control.expanded = next;
    control.button.setAttribute("aria-expanded", String(next));
    control.button.setAttribute("aria-label", text.name);
    control.button.setAttribute("title", text.name);
    control.button.querySelector("[data-sidebar-handle-label]").textContent = text.label;
    control.button.querySelector("[data-sidebar-handle-icon]").textContent =
      control.kind === "primary"
        ? (next ? "‹" : "›")
        : (next ? "›" : "‹");
    document.body.classList.toggle(control.bodyClass, next);

    if (desktop.matches) {
      control.sidebar.toggleAttribute("inert", !next);
    } else {
      control.sidebar.removeAttribute("inert");
    }

    preferences = { ...preferences, [control.kind]: next };
    if (persist) savePreferences();
  }

  function makeHandle(definition, sidebar) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sidebar-handle sidebar-handle--${definition.kind}`;
    button.dataset.sidebarHandle = definition.kind;
    button.setAttribute("aria-controls", sidebar.id);
    button.innerHTML = [
      '<span class="sidebar-handle__label" data-sidebar-handle-label></span>',
      '<span class="sidebar-handle__icon" data-sidebar-handle-icon aria-hidden="true"></span>'
    ].join("");
    return button;
  }

  function hasNavigation(sidebar) {
    return Boolean(sidebar.querySelector(".md-nav a[href]"));
  }

  function mountSidebarControls() {
    definitions.forEach((definition) => {
      const sidebar = document.querySelector(definition.selector);
      if (!sidebar || !hasNavigation(sidebar)) return;
      if (desktop.matches && window.getComputedStyle(sidebar).display === "none") return;

      if (!sidebar.id) sidebar.id = definition.id;
      const button = makeHandle(definition, sidebar);
      const control = {
        ...definition,
        button,
        expanded: false,
        sidebar
      };
      button.addEventListener("click", () => setExpanded(control, !control.expanded));
      document.body.appendChild(button);
      controls.set(definition.kind, control);
    });

    if (!controls.size) return;
    document.body.classList.add("sidebar-controls-ready");
    controls.forEach((control) => {
      setExpanded(control, preferences[control.kind] === true, false);
    });

    desktop.addEventListener?.("change", () => {
      controls.forEach((control) => setExpanded(control, control.expanded, false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !desktop.matches) return;
      controls.forEach((control) => {
        if (control.expanded) setExpanded(control, false);
      });
    });

    window.addEventListener("beforeprint", () => {
      controls.forEach((control) => control.sidebar.removeAttribute("inert"));
    });
    window.addEventListener("afterprint", () => {
      controls.forEach((control) => setExpanded(control, control.expanded, false));
    });
  }

  function mountKeyboardScrollableRegions() {
    const candidates = document.querySelectorAll(
      ".md-typeset__scrollwrap, .highlight code, pre > code"
    );
    candidates.forEach((element) => {
      const horizontallyScrollable = element.scrollWidth > element.clientWidth + 1;
      const verticallyScrollable = element.scrollHeight > element.clientHeight + 1;
      if (!horizontallyScrollable && !verticallyScrollable) return;
      if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "0");
      element.dataset.keyboardScroll = "true";
    });
  }

  function mount() {
    mountSidebarControls();
    mountKeyboardScrollableRegions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
