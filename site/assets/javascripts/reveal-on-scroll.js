(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const selectors = [
    ".garden-pagehead",
    ".home-pulse__item",
    ".biying-presence",
    ".module-update-preview a",
    ".module-update-card",
    ".note-entry-grid a",
    ".topic-card",
    ".note-tile",
    ".cyber-card",
    ".surface-tile",
    ".project-framework div",
    ".project-brief div",
    ".work-card",
    ".timeline-item",
    ".signal-item",
    ".guestbook-message",
    ".admin-card"
  ];

  function candidates(root) {
    const scope = root && root.querySelectorAll ? root : document;
    return Array.from(scope.querySelectorAll(selectors.join(",")));
  }

  function mark(element, index = 0) {
    if (element.classList.contains("reveal")) return;
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index * 34, 180)}ms`);
    if (reduceMotion) element.classList.add("is-visible");
  }

  function reveal(element) {
    element.classList.add("is-visible");
    window.setTimeout(() => {
      element.classList.remove("reveal", "is-visible");
      element.style.removeProperty("--reveal-delay");
    }, 720);
  }

  function mount() {
    const elements = candidates();
    elements.forEach(mark);
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    elements.forEach((element) => observer.observe(element));

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          const added = node.matches(selectors.join(",")) ? [node, ...candidates(node)] : candidates(node);
          added.forEach((element, index) => {
            mark(element, index);
            observer.observe(element);
          });
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
