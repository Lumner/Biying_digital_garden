(function () {
  const hero = document.querySelector("[data-home-hero]");
  if (!hero) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  let frame = 0;
  let nextX = 0.5;
  let nextY = 0.5;

  function commitPointer() {
    frame = 0;
    hero.style.setProperty("--home-pointer-x", nextX.toFixed(3));
    hero.style.setProperty("--home-pointer-y", nextY.toFixed(3));
  }

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const rect = hero.getBoundingClientRect();
    nextX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    nextY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    if (!frame) frame = window.requestAnimationFrame(commitPointer);
  });

  hero.addEventListener("pointerleave", () => {
    nextX = 0.5;
    nextY = 0.45;
    if (!frame) frame = window.requestAnimationFrame(commitPointer);
  });
})();
