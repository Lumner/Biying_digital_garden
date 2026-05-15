---
title: 个人数字花园与碧影
summary: 一个双语个人网站项目，把公开笔记、项目记录、留言板和数字分身碧影放在同一个长期入口里。
public: true
avatar_readable: true
tags:
  - personal-site
  - digital-avatar
  - mkdocs
  - rag
  - edgeone
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">PROJECT CASE</div>
  <h1 class="garden-pagehead__title">个人数字花园与碧影</h1>
  <p class="garden-pagehead__lead">把公开笔记、项目记录、留言和碧影放进同一个长期入口里，让内容、交互和部署一起慢慢长出来。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MkDocs</span>
    <span class="status-pill leaf">EdgeOne</span>
    <span class="status-pill warm">数字分身</span>
  </div>
</section>

<div class="project-brief">
  <div>
    <strong>定位</strong>
    <span>个人数字花园，不是一次性作品集。</span>
  </div>
  <div>
    <strong>核心</strong>
    <span>公开内容、双语笔记、碧影对话、留言。</span>
  </div>
  <div>
    <strong>状态</strong>
    <span>静态站点已上线，后端能力继续完善。</span>
  </div>
</div>

这是我为自己搭建的长期个人网站。它不是单独的作品集，也不只是一个聊天 demo，而是把公开笔记、项目记录、当前状态、留言和碧影放进同一个入口里。

我希望它能随着我学习和做项目一起长大：今天也许只是几篇课程笔记和一个能对话的入口，之后会慢慢加入更多真实项目、调试记录、阶段性的想法，以及更稳定的部署。

## 背景

我想要一个比社交主页更稳定、又比正式介绍更松弛的地方。朋友可以从这里知道我最近在折腾什么；同样对 AI 和工程感兴趣的人，也能顺着笔记和项目看到更具体的过程。

碧影是这个项目里比较特别的一部分。他不是“全知”的替身，只是一个温和的公开内容向导：读取网站里已经发布的内容，帮访客快速找到线索，也在没有资料时坦白说不知道。

## 我做了什么

<div class="timeline-list">
  <div class="timeline-item">
    <strong>站点结构</strong>
    <span>搭建 MkDocs Material 站点，规划首页、关于、现在、笔记、项目、碧影和留言等页面。</span>
  </div>
  <div class="timeline-item">
    <strong>双语内容</strong>
    <span>设计 `/zh/` 与 `/en/` 双语结构，让导航、页面和公开知识库成对维护。</span>
  </div>
  <div class="timeline-item">
    <strong>笔记导入</strong>
    <span>导入并整理离散数学、计算机系统基础和 FDS 数据结构基础三篇课程讲义，修复公式渲染和章节目录。</span>
  </div>
  <div class="timeline-item">
    <strong>碧影与留言</strong>
    <span>设计碧影的语气、读取范围和拒答边界，实现聊天前端、留言板前端和 EdgeOne Functions 风格 API 雏形。</span>
  </div>
</div>

## 技术栈

<div class="cyber-grid">
  <section class="cyber-card">
    <h3>内容站点</h3>
    <p>MkDocs Material、Markdown、Pymdown Extensions 和 MathJax，用来维护笔记、页面结构和数学公式。</p>
  </section>
  <section class="cyber-card">
    <h3>双语内容</h3>
    <p>中文作为主源，英文同步维护；导航、页面和公开知识库都按中英文成对组织。</p>
  </section>
  <section class="cyber-card">
    <h3>碧影对话</h3>
    <p>公开知识库构建脚本、对话设定、EdgeOne Functions 风格 API，以及 DeepSeek/OpenAI 兼容模型接口。</p>
  </section>
  <section class="cyber-card">
    <h3>交互与部署</h3>
    <p>原生 JavaScript、赛博风格 CSS、公开留言板、EdgeOne Pages/Functions/KV 部署路线和 GitHub CI。</p>
  </section>
</div>

## 成果

- 网站可以本地构建和预览，`mkdocs build --strict` 能通过。
- 中文和英文页面已经有了清晰结构，后续新增内容知道该往哪里放。
- 三篇课程讲义已经变成可阅读的网站页面，支持数学公式和章节目录。
- 碧影可以基于公开知识库回答与网站内容相关的问题。
- 留言板和 EdgeOne 部署路线已经有了基础实现，可以继续往真实线上环境推进。

## 不足

- 英文课程笔记还需要更完整的翻译和人工校对。
- 碧影后端上线前，还需要配置真实模型密钥、KV 绑定和限流策略。
- 留言板还需要审核、删除、反垃圾和更顺手的管理界面。
- 移动端阅读、长笔记体验和视觉细节还可以继续打磨。

## 下一步

- 项目页需要持续补充更真实的作品、复盘和阶段性总结。
- 继续把 EdgeOne Functions、KV、模型密钥和公开来源引用流程接成真实线上能力。
- 为新增项目保留同样的结构：背景、我做了什么、技术栈、成果、不足、下一步。
