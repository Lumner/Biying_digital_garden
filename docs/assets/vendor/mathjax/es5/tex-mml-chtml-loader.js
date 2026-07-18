(function () {
  const chunks = window.__BIYING_MATHJAX_CHUNKS || [];
  const ready = chunks.length >= 4 && chunks.every((chunk) => typeof chunk === "string");

  if (!ready) {
    console.error("MathJax chunks are missing or incomplete.");
    document.documentElement.classList.add("math-ready");
    return;
  }

  try {
    (0, eval)(`${chunks.join("")}\n//# sourceURL=biying-mathjax-tex-mml-chtml.js`);
  } catch (error) {
    console.error("MathJax failed to initialize from chunks.", error);
    document.documentElement.classList.add("math-ready");
  }
})();
