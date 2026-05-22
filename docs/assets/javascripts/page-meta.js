(function () {
  function normalizePath(value) {
    return String(value || "").replace(/\/+$/, "") || "/";
  }

  function locale() {
    return normalizePath(window.location.pathname).startsWith("/en") ? "en" : "zh";
  }

  function copy(key) {
    const zh = locale() === "zh";
    return {
      updated: zh ? "最近更新" : "Last updated",
      updatedPrefix: zh ? "更新：" : "Updated: ",
      empty: zh ? "还没有可显示的更新记录。" : "No update records yet."
    }[key];
  }

  async function loadMeta() {
    const response = await fetch("/assets/knowledge/page-meta.json", { cache: "no-store" });
    if (!response.ok) return { items: [] };
    const data = await response.json();
    return {
      generatedAt: data.generatedAt || "",
      items: Array.isArray(data.items) ? data.items : []
    };
  }

  function esc(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function localizedItems(items) {
    const currentLocale = locale();
    return items
      .filter((item) => {
        if (item.locale) return item.locale === currentLocale;
        return currentLocale === "en"
          ? normalizePath(item.url).startsWith("/en")
          : normalizePath(item.url).startsWith("/zh");
      })
      .filter((item) => item.updated && item.url && item.title)
      .sort((a, b) => String(b.updated).localeCompare(String(a.updated)) || String(a.title).localeCompare(String(b.title)));
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

  function mountLatestUpdatedPill(items) {
    const latest = localizedItems(items)[0];
    document.querySelectorAll("[data-latest-page-updated]").forEach((root) => {
      if (!latest) {
        root.textContent = copy("empty");
        return;
      }
      root.innerHTML = `${copy("updatedPrefix")}<time datetime="${esc(latest.updated)}">${esc(latest.updated)}</time>`;
    });
  }

  function mountRecentUpdates(items) {
    const recent = localizedItems(items);
    document.querySelectorAll("[data-recent-page-updates]").forEach((root) => {
      const limit = Number(root.dataset.limit || 8);
      const rows = recent.slice(0, limit);
      if (!rows.length) {
        root.innerHTML = `<p class="meta-line">${copy("empty")}</p>`;
        return;
      }
      root.innerHTML = rows.map((item) => `
        <a href="${esc(item.url)}">
          <span>${esc(item.updated)}</span>
          <strong>${esc(item.title)}</strong>
        </a>
      `).join("");
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const current = normalizePath(window.location.pathname);
      const { items } = await loadMeta();
      mountLatestUpdatedPill(items);
      mountRecentUpdates(items);
      mountMeta(items.find((item) => normalizePath(item.url) === current));
    } catch (error) {
      // Metadata is decorative; the page should stay readable if it is unavailable.
    }
  });
})();
