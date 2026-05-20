window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex|mathjax-process"
  },
  startup: {
    typeset: false,
    pageReady: () => {
      const root = document.querySelector(".md-content");
      return window.MathJax.typesetPromise(root ? [root] : undefined);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise();
  }
});
