(function () {
  const STORAGE_KEY = "biying.sidebar.primaryCollapsed";

  function isChinesePage() {
    return !String(window.location.pathname || "").replace(/\/+$/, "").startsWith("/en");
  }

  function copy(key) {
    const zh = isChinesePage();
    return {
      collapse: zh ? "隐藏左侧导航" : "Hide navigation",
      expand: zh ? "显示左侧导航" : "Show navigation"
    }[key];
  }

  function setPrimaryCollapsed(button, collapsed) {
    document.body.classList.toggle("sidebar-primary-collapsed", collapsed);
    button.setAttribute("aria-pressed", String(collapsed));
    button.setAttribute("aria-label", collapsed ? copy("expand") : copy("collapse"));
    button.title = collapsed ? copy("expand") : copy("collapse");
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (error) {
      // Persistence is optional.
    }
  }

  function mountPrimaryToggle() {
    if (!document.querySelector(".md-sidebar--primary") || document.querySelector("[data-sidebar-primary-toggle]")) return;
    const button = document.createElement("button");
    button.className = "sidebar-dock-toggle";
    button.type = "button";
    button.dataset.sidebarPrimaryToggle = "true";
    button.innerHTML = '<span aria-hidden="true"></span>';
    document.body.appendChild(button);
    let collapsed = false;
    try {
      collapsed = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch (error) {
      collapsed = false;
    }
    setPrimaryCollapsed(button, collapsed);
    button.addEventListener("click", () => setPrimaryCollapsed(button, !document.body.classList.contains("sidebar-primary-collapsed")));
  }

  function mountSecondaryTouchPeek() {
    let timer = 0;
    document.addEventListener("pointerdown", (event) => {
      if (window.matchMedia("(max-width: 959px)").matches) return;
      const fromRight = window.innerWidth - event.clientX;
      const sidebar = document.querySelector(".md-sidebar--secondary");
      if (!sidebar) return;
      if (fromRight <= 42 || sidebar.contains(event.target)) {
        document.body.classList.add("sidebar-secondary-peek");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => document.body.classList.remove("sidebar-secondary-peek"), 4200);
      } else {
        document.body.classList.remove("sidebar-secondary-peek");
      }
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountPrimaryToggle();
    mountSecondaryTouchPeek();
  });
})();
