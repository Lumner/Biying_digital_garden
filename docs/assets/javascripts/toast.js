(function () {
  let tray = null;
  let seed = 0;

  function ensureTray() {
    if (tray) return tray;
    tray = document.createElement("div");
    tray.className = "toast-tray";
    tray.setAttribute("aria-live", "polite");
    tray.setAttribute("aria-atomic", "false");
    document.body.appendChild(tray);
    return tray;
  }

  function show(message, options = {}) {
    const text = String(message || "").trim();
    if (!text) return null;
    const item = document.createElement("div");
    const type = options.type || "info";
    const duration = Number(options.duration || 3200);
    item.className = `toast toast--${type}`;
    item.dataset.toastId = String(++seed);
    item.textContent = text;
    ensureTray().appendChild(item);
    window.setTimeout(() => item.classList.add("is-visible"), 20);
    window.setTimeout(() => {
      item.classList.remove("is-visible");
      item.addEventListener("transitionend", () => item.remove(), { once: true });
      window.setTimeout(() => item.remove(), 420);
    }, duration);
    return item;
  }

  window.BiyingToast = { show };
})();
