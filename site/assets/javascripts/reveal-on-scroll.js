(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selector = [
    ".garden-pagehead",
    ".home-pulse__item",
    ".biying-presence",
    ".module-update-preview a",
    ".module-update-card",
    ".note-entry-grid a",
    ".topic-card",
    ".note-tile",
    ".cyber-card",
    ".friend-card",
    ".surface-tile",
    ".project-framework div",
    ".project-brief div",
    ".work-card",
    ".timeline-item",
    ".signal-item",
    ".guestbook-message",
    ".admin-card"
  ].join(",");

  let intersectionObserver;
  let mutationObserver;
  let mounted = false;

  function candidates(root) {
    if (!(root instanceof Element)) return [];
    const elements = Array.from(root.querySelectorAll(selector));
    if (root.matches(selector)) elements.unshift(root);
    return elements;
  }

  function clean(element) {
    element.classList.remove("reveal", "is-visible");
    element.style.removeProperty("--reveal-delay");
  }

  function reveal(element) {
    element.classList.add("is-visible");
    intersectionObserver?.unobserve(element);
    window.setTimeout(() => clean(element), 660);
  }

  function prepare(element, index = 0) {
    if (element.classList.contains("reveal")) return;
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 34, 180)}ms`);
    intersectionObserver.observe(element);
  }

  function disableEnhancement() {
    intersectionObserver?.disconnect();
    mutationObserver?.disconnect();
    intersectionObserver = undefined;
    mutationObserver = undefined;
    mounted = false;
    document.documentElement.classList.remove("reveal-enhanced");
    document.querySelectorAll(".reveal").forEach(clean);
  }

  function mount() {
    if (mounted || reducedMotion.matches) return;
    const content = document.querySelector(".md-content");
    if (!content || typeof window.IntersectionObserver !== "function") return;

    try {
      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      candidates(content).forEach(prepare);

      if (typeof window.MutationObserver === "function") {
        mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (!(node instanceof Element)) return;
              candidates(node).forEach(prepare);
            });
          });
        });
        mutationObserver.observe(content, { childList: true, subtree: true });
      }

      document.documentElement.classList.add("reveal-enhanced");
      mounted = true;
    } catch (error) {
      disableEnhancement();
    }
  }

  reducedMotion.addEventListener?.("change", (event) => {
    if (event.matches) {
      disableEnhancement();
    } else {
      mount();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
