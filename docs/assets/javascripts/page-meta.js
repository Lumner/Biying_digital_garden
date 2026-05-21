(function () {
  function normalizePath(value) {
    return String(value || "").replace(/\/+$/, "") || "/";
  }

  function isChinesePage() {
    return !normalizePath(window.location.pathname).startsWith("/en");
  }

  function copy(key) {
    const zh = isChinesePage();
    return {
      updated: zh ? "最近更新" : "Last updated"
    }[key];
  }

  async function loadMeta() {
    const response = await fetch("/assets/knowledge/page-meta.json", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  function pageAlreadyShowsDate() {
    return [...document.querySelectorAll(".garden-pagehead__meta .status-pill")]
      .some((node) => /更新|Updated|Last updated/i.test(node.textContent || ""));
  }

  function mountMeta(item) {
    if (!item || !item.updated || document.querySelector("[data-page-updated]") || pageAlreadyShowsDate()) return;
    const title = document.querySelector(".md-typeset h1");
    if (!title) return;
    const strip = document.createElement("p");
    strip.className = "page-updated-strip";
    strip.dataset.pageUpdated = "true";
    strip.innerHTML = `<span>${copy("updated")}</span><time datetime="${item.updated}">${item.updated}</time>`;
    title.insertAdjacentElement("afterend", strip);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const current = normalizePath(window.location.pathname);
      const items = await loadMeta();
      mountMeta(items.find((item) => normalizePath(item.url) === current));
    } catch (error) {
      // Metadata is decorative; the page should stay readable if it is unavailable.
    }
  });
})();
