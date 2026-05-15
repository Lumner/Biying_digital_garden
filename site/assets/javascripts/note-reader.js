(function () {
  function locale() {
    return window.location.pathname.includes("/en/") ? "en" : "zh";
  }

  function text(key) {
    const zh = locale() === "zh";
    return {
      progress: zh ? "阅读进度" : "Reading progress",
      previous: zh ? "上一章" : "Previous chapter",
      next: zh ? "下一章" : "Next chapter"
    }[key];
  }

  function mount() {
    if (!window.location.pathname.includes("/notes/")) return;
    const article = document.querySelector(".md-content__inner");
    if (!article) return;
    const chapters = [...article.querySelectorAll("h2[id]")];
    if (chapters.length < 4) return;

    const shell = document.createElement("nav");
    shell.className = "note-reader";
    shell.innerHTML = `
      <div class="note-reader__meter">
        <span>${text("progress")}</span>
        <strong data-note-reader-label></strong>
      </div>
      <div class="note-reader__track"><span data-note-reader-bar></span></div>
      <div class="note-reader__actions">
        <a data-note-reader-prev>${text("previous")}</a>
        <a data-note-reader-next>${text("next")}</a>
      </div>
    `;
    chapters[0].before(shell);

    const label = shell.querySelector("[data-note-reader-label]");
    const bar = shell.querySelector("[data-note-reader-bar]");
    const prev = shell.querySelector("[data-note-reader-prev]");
    const next = shell.querySelector("[data-note-reader-next]");
    let active = 0;

    function render(index) {
      active = Math.max(0, Math.min(chapters.length - 1, index));
      const current = chapters[active];
      label.textContent = `${active + 1}/${chapters.length} · ${current.textContent}`;
      bar.style.width = `${((active + 1) / chapters.length) * 100}%`;
      prev.href = `#${chapters[Math.max(0, active - 1)].id}`;
      next.href = `#${chapters[Math.min(chapters.length - 1, active + 1)].id}`;
      prev.classList.toggle("disabled", active === 0);
      next.classList.toggle("disabled", active === chapters.length - 1);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = chapters.indexOf(entry.target);
        if (index >= 0) render(index);
      });
    }, { rootMargin: "-18% 0px -68% 0px", threshold: 0 });

    chapters.forEach((chapter) => observer.observe(chapter));
    render(0);
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
