---
title: 笔记
summary: 公开笔记入口，包含公开边界和数学公式测试。
public: true
avatar_readable: true
tags:
  - notes
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">NOTES</div>
  <h1 class="garden-pagehead__title">笔记</h1>
  <p class="garden-pagehead__lead">这里收着我愿意公开留下的笔记。课程讲义、公式测试和公开边界都会在这里慢慢排好位置。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">中文主源</span>
    <span class="status-pill leaf">可被碧影读取</span>
    <span class="status-pill warm">持续整理</span>
  </div>
</section>

这里的笔记以中文为主源，也会尽量同步英文版本。哪些内容能被碧影读取，由 `public` 与 `avatar_readable` 共同决定。

<div class="note-library">
  <section class="note-tile">
    <h3>离散数学讲义</h3>
    <p>覆盖逻辑与证明、集合与函数、算法、归纳递归、计数、关系等主题。</p>
    <div class="note-tile__meta">
      <span class="cyber-tag">数学</span>
      <span class="cyber-tag">证明</span>
      <span class="cyber-tag">计数</span>
    </div>
    <a href="./discrete-math-lecture/">阅读</a>
  </section>
  <section class="note-tile">
    <h3>计算机系统基础讲义</h3>
    <p>覆盖信息表示、布尔代数、组合逻辑、运算部件、时序逻辑、ISA 与 RISC-V。</p>
    <div class="note-tile__meta">
      <span class="cyber-tag">系统</span>
      <span class="cyber-tag">逻辑</span>
      <span class="cyber-tag">RISC-V</span>
    </div>
    <a href="./computer-systems-lecture/">阅读</a>
  </section>
  <section class="note-tile">
    <h3>FDS 数据结构基础讲义</h3>
    <p>覆盖算法分析、线性表、栈队列、树、堆、并查集、线段树、图与拓扑排序。</p>
    <div class="note-tile__meta">
      <span class="cyber-tag">算法</span>
      <span class="cyber-tag">数据结构</span>
      <span class="cyber-tag">图</span>
    </div>
    <a href="./fds-data-structures-lecture/">阅读</a>
  </section>
  <section class="note-tile">
    <h3>公开边界</h3>
    <p>说明哪些内容会进入碧影的回答范围，哪些不会。</p>
    <div class="note-tile__meta">
      <span class="cyber-tag">公开范围</span>
      <span class="cyber-tag">碧影</span>
    </div>
    <a href="./public-scope/">阅读</a>
  </section>
  <section class="note-tile">
    <h3>数学实验</h3>
    <p>用来确认 Markdown 里的数学公式能正常显示。</p>
    <div class="note-tile__meta">
      <span class="cyber-tag">MathJax</span>
      <span class="cyber-tag">公式</span>
    </div>
    <a href="./math-lab/">阅读</a>
  </section>
</div>

## 笔记模板

```yaml
---
title: 标题
summary: 一句话摘要
public: true
avatar_readable: true
tags:
  - tag
---
```
