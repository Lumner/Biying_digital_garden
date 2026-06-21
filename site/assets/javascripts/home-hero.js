(function () {
  const hero = document.querySelector("[data-home-hero]");
  if (!hero) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const saveData = Boolean(navigator.connection?.saveData);
  const typewriter = document.querySelector("[data-home-typewriter]");
  const typewriterText = typewriter?.querySelector("[data-home-typewriter-text]");
  const phrases = typewriter
    ? Array.from(typewriter.querySelectorAll("[data-home-phrase]"), (item) => item.textContent.trim()).filter(Boolean)
    : [];

  if (typewriterText && phrases.length) {
    typewriterText.textContent = phrases[0];
  }

  if (reducedMotion.matches || saveData) return;

  let frame = 0;
  let typingTimer = 0;
  let nextX = 0.5;
  let nextY = 0.5;
  let phraseIndex = 0;
  let letterIndex = phrases[0]?.length || 0;
  let deleting = false;

  function commitPointer() {
    frame = 0;
    hero.style.setProperty("--home-pointer-x", nextX.toFixed(3));
    hero.style.setProperty("--home-pointer-y", nextY.toFixed(3));
  }

  function scheduleTypewriter(delay) {
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(tickTypewriter, delay);
  }

  function tickTypewriter() {
    if (!typewriterText || !phrases.length) return;
    if (document.hidden) {
      scheduleTypewriter(1000);
      return;
    }
    const phrase = phrases[phraseIndex];
    typewriterText.textContent = phrase.slice(0, letterIndex);

    if (!deleting && letterIndex < phrase.length) {
      letterIndex += 1;
      scheduleTypewriter(86);
      return;
    }

    if (!deleting) {
      deleting = true;
      scheduleTypewriter(1550);
      return;
    }

    if (letterIndex > 0) {
      letterIndex -= 1;
      scheduleTypewriter(34);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    scheduleTypewriter(260);
  }

  if (finePointer.matches) {
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
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && phrases.length) {
      scheduleTypewriter(120);
    }
  });

  if (phrases.length) {
    scheduleTypewriter(520);
  }
})();
