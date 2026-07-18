---
title: 数学实验
summary: 用于验证 MkDocs 中的行内公式和块级公式渲染。
description: 用于验证 MkDocs 中的行内公式和块级公式渲染。
public: true
avatar_readable: true
category: math
recommended: false
updated: 2026-05-13
reading_order: 40
tags:
  - math
  - mkdocs
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">MATH LAB</div>
  <h1 class="garden-pagehead__title">数学实验</h1>
  <p class="garden-pagehead__lead">一个小型渲染实验室，用来确认行内公式、块级公式和矩阵在网站里都能被稳定排版。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MathJax</span>
    <span class="status-pill leaf">Markdown</span>
  </div>
</section>

这页用于测试 `.md` 文件中的数学公式渲染。

行内公式示例：$E = mc^2$，以及 $\alpha + \beta = \gamma$。

块级公式示例：

$$
\nabla \cdot \vec{E} = \frac{\rho}{\epsilon_0}
$$

再来一个矩阵：

$$
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
,\quad
\det(A) = -2
$$

如果你看到的是排版后的公式，而不是原始 LaTeX 文本，说明 `mathjax.js` 正常工作。

