(function () {
  function mountPrimaryEdgePeek() {
    let timer = 0;

    function enabled() {
      return !window.matchMedia("(max-width: 959px)").matches;
    }

    function sidebar() {
      return document.querySelector(".md-sidebar--primary");
    }

    function openPrimary(target) {
      if (!target) return;
      document.body.classList.add("sidebar-primary-peek");
      window.clearTimeout(timer);
    }

    function closePrimary(target) {
      if (!target) return;
      document.body.classList.remove("sidebar-primary-peek");
    }

    function closePrimarySoon(target) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (target.matches(":hover") || target.contains(document.activeElement)) return;
        closePrimary(target);
      }, 140);
    }

    function pointerInsideOpenSidebar(event, target) {
      if (!document.body.classList.contains("sidebar-primary-peek")) return false;
      const rect = target.getBoundingClientRect();
      return (
        event.clientX >= Math.max(0, rect.left - 8) &&
        event.clientX <= rect.right + 18 &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    }

    document.addEventListener("pointermove", (event) => {
      if (!enabled()) return;
      const target = sidebar();
      if (!target) return;
      if (event.clientX <= 34 || pointerInsideOpenSidebar(event, target)) {
        openPrimary(target);
      } else {
        closePrimarySoon(target);
      }
    }, { passive: true });

    document.addEventListener("pointerdown", (event) => {
      if (!enabled()) return;
      const target = sidebar();
      if (!target) return;
      if (event.clientX <= 34 || target.contains(event.target)) {
        openPrimary(target);
        timer = window.setTimeout(() => closePrimary(target), 4200);
      } else {
        closePrimary(target);
      }
    }, { passive: true });

    const target = sidebar();
    if (target) {
      target.addEventListener("mouseenter", () => openPrimary(target));
      target.addEventListener("mouseleave", () => closePrimarySoon(target));
    }
  }

  function mountSecondaryDirectPeek() {
    let timer = 0;
    document.addEventListener("pointerdown", (event) => {
      if (window.matchMedia("(max-width: 959px)").matches) return;
      const sidebar = document.querySelector(".md-sidebar--secondary");
      if (!sidebar) return;
      if (sidebar.contains(event.target)) {
        document.body.classList.add("sidebar-secondary-peek");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => document.body.classList.remove("sidebar-secondary-peek"), 4200);
      } else {
        document.body.classList.remove("sidebar-secondary-peek");
      }
    }, { passive: true });
  }

  function mountKeyboardScrollableRegions() {
    document.querySelectorAll(
      ".md-typeset__scrollwrap, .highlight code, pre > code"
    ).forEach((element) => {
      const horizontallyScrollable = element.scrollWidth > element.clientWidth + 1;
      const verticallyScrollable = element.scrollHeight > element.clientHeight + 1;
      if (!horizontallyScrollable && !verticallyScrollable) return;
      if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "0");
      element.dataset.keyboardScroll = "true";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountPrimaryEdgePeek();
    mountSecondaryDirectPeek();
    mountKeyboardScrollableRegions();
  });
})();
