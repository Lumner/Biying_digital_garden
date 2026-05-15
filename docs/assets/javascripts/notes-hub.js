(function () {
  const state = { catalog: null };

  function locale() {
    return window.location.pathname.includes("/en/") ? "en" : "zh";
  }

  function copy(key) {
    const zh = locale() === "zh";
    return {
      read: zh ? "阅读" : "Read",
      empty: zh ? "这里还在等第一篇笔记。" : "This shelf is waiting for its first note.",
      updated: zh ? "更新" : "Updated",
      chapters: zh ? "章" : "chapters",
      allTags: zh ? "全部标签" : "All tags",
      related: zh ? "相关笔记" : "Related notes"
    }[key];
  }

  function notesRoot() {
    return `/${locale()}/notes/`;
  }

  function esc(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadCatalog() {
    if (state.catalog) return state.catalog;
    const response = await fetch("/assets/knowledge/note-catalog.json", { cache: "no-store" });
    state.catalog = await response.json();
    return state.catalog;
  }

  function noteCard(item) {
    const tags = (item.tags || []).slice(0, 4).map((tag) => `<span class="cyber-tag">${esc(tag)}</span>`).join("");
    const meta = [
      item.updated ? `${copy("updated")} ${esc(item.updated)}` : "",
      item.chapterCount ? `${esc(item.chapterCount)} ${copy("chapters")}` : ""
    ].filter(Boolean).join(" · ");
    return `
      <article class="note-tile note-tile--catalog">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.summary)}</p>
        <div class="note-tile__meta">${tags}</div>
        ${meta ? `<span class="note-catalog-meta">${meta}</span>` : ""}
        <a href="${esc(item.url)}">${copy("read")}</a>
      </article>
    `;
  }

  function mountTopics(root, catalog, items) {
    root.innerHTML = catalog.categories[locale()].map((category) => {
      const count = items.filter((item) => item.category === category.key).length;
      return `
        <a class="topic-card" href="./${esc(category.key)}/">
          <span>${esc(category.label)}</span>
          <strong>${count}</strong>
          <p>${esc(category.description)}</p>
        </a>
      `;
    }).join("");
  }

  function mountList(root, items) {
    root.innerHTML = items.length ? items.map(noteCard).join("") : `<p class="meta-line">${copy("empty")}</p>`;
  }

  function mountTags(root, items) {
    const counts = new Map();
    items.forEach((item) => (item.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    root.innerHTML = tags.map(([tag, count]) => `<a class="tag-chip" href="${notesRoot()}tags/?tag=${encodeURIComponent(tag)}">${esc(tag)}<span>${count}</span></a>`).join("");
  }

  function mountCategory(root, catalog, items) {
    const category = root.dataset.noteCategory;
    const matched = items.filter((item) => item.category === category);
    const info = catalog.categories[locale()].find((entry) => entry.key === category);
    const heading = root.closest(".note-topic-page")?.querySelector("[data-note-category-title]");
    if (heading && info) heading.textContent = info.label;
    mountList(root, matched);
  }

  function mountTagResults(root, items) {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    const title = root.closest(".note-tag-page")?.querySelector("[data-note-tag-title]");
    if (title) title.textContent = tag ? `${copy("related")} · ${tag}` : copy("allTags");
    mountList(root, tag ? items.filter((item) => (item.tags || []).includes(tag)) : items);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const roots = document.querySelectorAll("[data-note-topics], [data-note-recent], [data-note-recommended], [data-note-tags], [data-note-category], [data-note-tag-results]");
    if (!roots.length) return;
    const catalog = await loadCatalog();
    const items = catalog.items[locale()] || [];
    document.querySelectorAll("[data-note-topics]").forEach((root) => mountTopics(root, catalog, items));
    document.querySelectorAll("[data-note-recent]").forEach((root) => mountList(root, [...items].sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 4)));
    document.querySelectorAll("[data-note-recommended]").forEach((root) => mountList(root, items.filter((item) => item.recommended).sort((a, b) => a.readingOrder - b.readingOrder)));
    document.querySelectorAll("[data-note-tags]").forEach((root) => mountTags(root, items));
    document.querySelectorAll("[data-note-category]").forEach((root) => mountCategory(root, catalog, items));
    document.querySelectorAll("[data-note-tag-results]").forEach((root) => mountTagResults(root, items));
  });
})();
