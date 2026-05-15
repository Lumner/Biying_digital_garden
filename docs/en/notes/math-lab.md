---
title: Math Lab
summary: A page for verifying inline and block math rendering in MkDocs.
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
  <h1 class="garden-pagehead__title">Math Lab</h1>
  <p class="garden-pagehead__lead">A small rendering lab for checking inline formulas, block formulas, and matrices inside the site.</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MathJax</span>
    <span class="status-pill leaf">Markdown</span>
  </div>
</section>

This page tests math rendering inside `.md` files.

Inline example: $E = mc^2$, and $\alpha + \beta = \gamma$.

Block example:

$$
\nabla \cdot \vec{E} = \frac{\rho}{\epsilon_0}
$$

A matrix:

$$
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
,\quad
\det(A) = -2
$$

If you see rendered formulas instead of raw LaTeX text, `mathjax.js` is working.

