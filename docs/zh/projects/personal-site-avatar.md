---
title: 个人数字花园与碧影
summary: 一个双语个人网站项目，把公开笔记、项目记录、留言板、公开知识库和数字分身碧影放在同一个长期入口里。
public: true
avatar_readable: true
updated: 2026-06-21
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
  <p class="garden-pagehead__lead">把公开笔记、项目记录、留言、友链、公开知识库和碧影放进同一个长期入口里，让这个网站能随着学习和项目一起更新。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MkDocs</span>
    <span class="status-pill leaf">EdgeOne</span>
    <span class="status-pill warm">更新：2026-06-21</span>
  </div>
</section>

<div class="project-brief">
  <div>
    <strong>定位</strong>
    <span>个人数字花园，不是一次性作品集。</span>
  </div>
  <div>
    <strong>核心</strong>
    <span>公开内容、双语笔记、RAG 检索、碧影对话、留言。</span>
  </div>
  <div>
    <strong>状态</strong>
    <span>站点已上线，首页视觉、主题切换、账号入口、友链、统计与 CI 安装流程正在持续收紧。</span>
  </div>
</div>

这是我为自己搭建的长期个人网站。它不是单独的作品集，也不只是一个聊天 demo，而是把公开笔记、项目记录、当前状态、留言、友链、公开知识库和碧影放进同一个入口里。

我希望它能随着我学习和做项目一起长大：现在它已经有了双语页面、课程笔记、公开知识检索、留言与后台管理接口、友链模块、访客统计、移动端基础测试和自托管数学公式资源；之后会继续加入更多真实项目、调试记录、阶段性的想法，以及更稳定的线上运行细节。

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
    <span>设计碧影的语气、读取范围和拒答边界，实现聊天前端、留言板前端、后台入口和 EdgeOne Functions 风格 API，并保留本地聊天记录。</span>
  </div>
  <div class="timeline-item">
    <strong>知识库与检索</strong>
    <span>把公开页面构建成可读取的知识库，按章节切块，并为当前页、Now 页和项目页设置更高检索权重。</span>
  </div>
  <div class="timeline-item">
    <strong>稳定性与验证</strong>
    <span>补齐共享前端工具、API 错误处理、限流返回、公开范围校验、站点同步检查、依赖锁定和移动端 Playwright 测试。</span>
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
    <p>公开知识库构建脚本、章节级切块、来源边界、对话设定、EdgeOne Functions 风格 API，以及 DeepSeek/OpenAI 兼容模型接口。</p>
  </section>
  <section class="cyber-card">
    <h3>交互与部署</h3>
    <p>原生 JavaScript、共享前端工具、赛博风格 CSS、公开留言板、EdgeOne Pages/Functions/KV 部署路线、GitHub CI 和 Playwright 移动端测试。</p>
  </section>
  <section class="cyber-card">
    <h3>资源与公式</h3>
    <p>MathJax 以本地自托管资源随仓库和站点发布，减少外部 CDN 依赖；构建脚本会同步处理静态站点输出。</p>
  </section>
</div>

## 成果

- 网站可以本地构建和预览，`python scripts/build_site.py` 能完成知识库、MkDocs 构建和站点同步。
- 中文和英文页面已经有了清晰结构，后续新增内容知道该往哪里放。
- 三篇课程讲义已经变成可阅读的网站页面，支持数学公式和章节目录。
- 碧影可以基于公开知识库回答与网站内容相关的问题，并在公开范围外保持拒答边界。
- 留言板、后台消息管理、认证辅助接口和 EdgeOne 部署路线已经有基础闭环。
- 友链支持头像配置和 favicon 回退，首页能显示访客数与浏览量。
- 主题切换支持浅色、深色和跟随系统，首次访问默认跟随系统偏好。
- 公开范围校验、移动端 smoke test、站点同步检查和自托管 MathJax 已纳入维护流程。

## 不足

- 英文课程笔记还需要更完整的翻译和人工校对。
- 线上环境仍需要确认真实模型密钥、KV 绑定和 EdgeOne 平台配置。
- 留言板还需要更细的审核、删除、反垃圾和更顺手的管理界面。
- 移动端阅读、长笔记体验和视觉细节还可以继续打磨。
- `edgeone` 已固定版本以保证 `npm ci` 稳定，但它的开发依赖链仍有 audit 风险，适合后续单独评估升级或替换方案。

## 下一步

- 项目页需要持续补充更真实的作品、复盘和阶段性总结。
- 继续把 EdgeOne Functions、KV、模型密钥和公开来源引用流程接成更稳定的真实线上能力。
- 单独处理依赖审计，不把工具链升级混进内容维护任务里。
- 继续把首页视觉、移动端阅读和碧影聊天体验打磨到更稳定的日常可用状态。
- 为新增项目保留同样的结构：背景、我做了什么、技术栈、成果、不足、下一步。
