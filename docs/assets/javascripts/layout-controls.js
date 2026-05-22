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
      target.style.opacity = "1";
      target.style.transform = "translateX(0)";
      window.clearTimeout(timer);
    }

    function closePrimary(target) {
      if (!target) return;
      document.body.classList.remove("sidebar-primary-peek");
      target.style.opacity = "";
      target.style.transform = "";
    }

    function closePrimarySoon(target) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (target.matches(":hover") || target.contains(document.activeElement)) return;
        closePrimary(target);
      }, 520);
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
      if (event.clientX <= 54 || pointerInsideOpenSidebar(event, target)) {
        openPrimary(target);
      } else {
        closePrimarySoon(target);
      }
    }, { passive: true });

    document.addEventListener("pointerdown", (event) => {
      if (!enabled()) return;
      const target = sidebar();
      if (!target) return;
      if (event.clientX <= 54 || target.contains(event.target)) {
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
    mountPrimaryEdgePeek();
    mountSecondaryTouchPeek();
  });
})();
