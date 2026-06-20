(function () {
  function locale() {
    return window.location.pathname.startsWith("/en/") ? "en" : "zh";
  }

  function copy(key) {
    const zh = locale() === "zh";
    return {
      empty: zh ? "友链正在整理中。" : "Friend links are being gathered.",
      visit: zh ? "访问网站" : "Visit site",
      untitled: zh ? "未命名友链" : "Untitled friend"
    }[key];
  }

  function esc(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeUrl(value) {
    try {
      const parsed = new URL(String(value || ""));
      if (!["http:", "https:"].includes(parsed.protocol)) return "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function safeAvatarUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw, window.location.origin);
      if (!["http:", "https:"].includes(parsed.protocol)) return "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function hostLabel(value) {
    try {
      return new URL(value).hostname.replace(/^www\./, "");
    } catch (error) {
      return value;
    }
  }

  function localized(value) {
    if (!value || typeof value !== "object") return String(value || "");
    return String(value[locale()] || value.zh || value.en || "");
  }

  function avatarCandidates(item, url) {
    const candidates = [];
    const explicit = safeAvatarUrl(item.avatar);
    if (explicit) candidates.push(explicit);
    try {
      const origin = new URL(url).origin;
      candidates.push(
        `${origin}/favicon.ico`,
        `${origin}/favicon.png`,
        `${origin}/favicon.svg`,
        `${origin}/apple-touch-icon.png`,
        `${origin}/favicon/favicon.ico`,
        `${origin}/favicon/favicon.png`,
        `${origin}/favicon/favicon.svg`,
        `${origin}/favicon/favicon-32x32.png`,
        `${origin}/favicon/favicon-16x16.png`,
        `${origin}/favicon/apple-touch-icon.png`
      );
    } catch (error) {
      // A friend card without a valid URL falls back to initials.
    }
    return [...new Set(candidates)];
  }

  function initialFor(name, url) {
    const base = String(name || hostLabel(url) || "?").trim();
    return [...base][0]?.toUpperCase() || "?";
  }

  async function loadFriends() {
    const response = await fetch(`/assets/data/friend-links.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  function mountAvatarFallback(img) {
    const avatar = img.closest(".friend-card__avatar");
    let remaining = [];
    try {
      remaining = JSON.parse(img.dataset.avatarCandidates || "[]");
    } catch (error) {
      remaining = [];
    }
    if (remaining.length) {
      img.dataset.avatarCandidates = JSON.stringify(remaining.slice(1));
      img.src = remaining[0];
      return;
    }
    avatar?.classList.add("is-fallback");
    img.removeAttribute("src");
  }

  function card(item) {
    const url = safeUrl(item.url);
    if (!url) return "";
    const name = String(item.name || copy("untitled"));
    const intro = localized(item.intro);
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 4) : [];
    const avatars = avatarCandidates(item, url);
    const initial = initialFor(name, url);
    return `
      <a class="friend-card" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
        <span class="friend-card__top">
          <span class="friend-card__avatar${avatars.length ? "" : " is-fallback"}">
            ${avatars.length ? `<img src="${esc(avatars[0])}" alt="" loading="lazy" referrerpolicy="no-referrer" data-friend-avatar data-avatar-candidates="${esc(JSON.stringify(avatars.slice(1)))}">` : ""}
            <span>${esc(initial)}</span>
          </span>
          <span class="friend-card__identity">
            <strong>${esc(name)}</strong>
            <span>${esc(hostLabel(url))}</span>
          </span>
        </span>
        ${intro ? `<span class="friend-card__intro">${esc(intro)}</span>` : ""}
        ${tags.length ? `<span class="friend-card__tags">${tags.map((tag) => `<em>${esc(tag)}</em>`).join("")}</span>` : ""}
        <span class="friend-card__visit">${copy("visit")}</span>
      </a>
    `;
  }

  function render(root, items) {
    const cards = items.map(card).filter(Boolean);
    if (!cards.length) {
      root.innerHTML = `<p class="friend-empty">${copy("empty")}</p>`;
      return;
    }
    root.innerHTML = cards.join("");
    root.querySelectorAll("[data-friend-avatar]").forEach((img) => {
      img.addEventListener("error", () => mountAvatarFallback(img));
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const roots = document.querySelectorAll("[data-friend-links]");
    if (!roots.length) return;
    try {
      const items = await loadFriends();
      roots.forEach((root) => render(root, items));
    } catch (error) {
      roots.forEach((root) => render(root, []));
    }
  });
})();
