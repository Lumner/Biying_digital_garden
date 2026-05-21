window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  chtml: {
    fontURL: "/assets/vendor/mathjax/es5/output/chtml/fonts/tex-woff-v2"
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex|mathjax-process"
  },
  startup: {
    typeset: false,
    pageReady: () => {
      const root = document.querySelector(".md-content");
      return window.MathJax.typesetPromise(root ? [root] : undefined)
        .finally(() => document.documentElement.classList.add("math-ready"));
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise()
      .finally(() => document.documentElement.classList.add("math-ready"));
  } else {
    document.documentElement.classList.add("math-ready");
  }
});
