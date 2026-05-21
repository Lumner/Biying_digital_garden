(function () {
  const root = document.querySelector("[data-random-note-cover]");
  if (!root) return;

  const isEnglish = /(^|\/)en(\/|$)/.test(window.location.pathname);
  const covers = [
    {
      href: "./notes/discrete-math-lecture/",
      code: "NOTE 01",
      pattern: "orbit",
      accent: "#70f4db",
      soft: "rgba(112, 244, 219, 0.18)",
      zh: {
        kicker: "DISCRETE MATH",
        title: "离散数学讲义",
        subtitle: "组合、关系、图论与证明的慢速索引",
        aria: "打开离散数学讲义"
      },
      en: {
        kicker: "DISCRETE MATH",
        title: "Discrete Math",
        subtitle: "Combinatorics, relations, graphs, and proof notes",
        aria: "Open discrete mathematics lecture notes"
      }
    },
    {
      href: "./notes/computer-systems-lecture/",
      code: "SYS 02",
      pattern: "matrix",
      accent: "#62b6ff",
      soft: "rgba(98, 182, 255, 0.18)",
      zh: {
        kicker: "COMPUTER SYSTEMS",
        title: "计算机系统基础",
        subtitle: "从数据表示到汇编、存储与系统边界",
        aria: "打开计算机系统基础讲义"
      },
      en: {
        kicker: "COMPUTER SYSTEMS",
        title: "Computer Systems",
        subtitle: "Data, assembly, memory, and system boundaries",
        aria: "Open computer systems fundamentals lecture notes"
      }
    },
    {
      href: "./notes/fds-data-structures-lecture/",
      code: "FDS 03",
      pattern: "stairs",
      accent: "#9be28f",
      soft: "rgba(155, 226, 143, 0.18)",
      zh: {
        kicker: "DATA STRUCTURES",
        title: "FDS 数据结构",
        subtitle: "树、图、堆、复杂度与工程化思考",
        aria: "打开 FDS 数据结构基础讲义"
      },
      en: {
        kicker: "DATA STRUCTURES",
        title: "FDS Data Structures",
        subtitle: "Trees, graphs, heaps, complexity, and practice",
        aria: "Open FDS data structures fundamentals lecture notes"
      }
    },
    {
      href: "./notes/math-lab/",
      code: "MATH 04",
      pattern: "wave",
      accent: "#f4c983",
      soft: "rgba(244, 201, 131, 0.18)",
      zh: {
        kicker: "MATH LAB",
        title: "数学实验",
        subtitle: "用于检查公式、矩阵与排版细节的小实验室",
        aria: "打开数学实验"
      },
      en: {
        kicker: "MATH LAB",
        title: "Math Lab",
        subtitle: "A small lab for formulas, matrices, and layout checks",
        aria: "Open Math Lab"
      }
    },
    {
      href: "./notes/public-scope/",
      code: "PUBLIC 05",
      pattern: "field",
      accent: "#ff8bdc",
      soft: "rgba(255, 139, 220, 0.16)",
      zh: {
        kicker: "PUBLIC SCOPE",
        title: "公开边界",
        subtitle: "哪些内容能被碧影读取，哪些应该留在门外",
        aria: "打开公开边界说明"
      },
      en: {
        kicker: "PUBLIC SCOPE",
        title: "Public Scope",
        subtitle: "What Biying can read, and what stays outside",
        aria: "Open public scope notes"
      }
    }
  ];

  const choice = covers[Math.floor(Math.random() * covers.length)];
  const copy = isEnglish ? choice.en : choice.zh;
  const cover = root.querySelector("[data-cover-link]");

  root.style.setProperty("--cover-accent", choice.accent);
  root.style.setProperty("--cover-accent-soft", choice.soft);

  if (cover) {
    cover.href = choice.href;
    cover.dataset.coverPattern = choice.pattern;
    cover.setAttribute("aria-label", copy.aria);
  }

  const fields = {
    "[data-cover-kicker]": copy.kicker,
    "[data-cover-title]": copy.title,
    "[data-cover-subtitle]": copy.subtitle,
    "[data-cover-code]": choice.code
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const target = root.querySelector(selector);
    if (target) target.textContent = value;
  });

  if (!cover) return;
  root.classList.add("note-cover-stage--ready");

  const canTilt = window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resetTilt() {
    cover.style.setProperty("--cover-tilt-x", "0deg");
    cover.style.setProperty("--cover-tilt-y", "0deg");
  }

  if (canTilt) {
    cover.addEventListener("pointermove", (event) => {
      const rect = cover.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cover.style.setProperty("--cover-tilt-x", `${(-y * 7).toFixed(2)}deg`);
      cover.style.setProperty("--cover-tilt-y", `${(x * 8).toFixed(2)}deg`);
    });
    cover.addEventListener("pointerleave", resetTilt);
  }

  resetTilt();
})();
