---
title: 个人数字花园与碧影
summary: 一个双语个人网站项目，把公开笔记、项目记录、留言板、公开知识库和数字助手碧影放在同一个长期入口里。
public: true
avatar_readable: true
updated: 2026-07-18
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
  <p class="garden-pagehead__lead">一个会长期生长的双语个人网站：收纳公开笔记、项目记录、近况、留言和碧影，让来访者能从页面或对话进入公开内容。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MkDocs</span>
    <span class="status-pill leaf">EdgeOne</span>
    <span class="status-pill warm">更新：2026-07-18</span>
  </div>
</section>

## 项目摘要

<div class="project-brief">
  <div>
    <strong>类型</strong>
    <span>长期个人网站与公开内容向导，不是一次性交付的作品集。</span>
  </div>
  <div>
    <strong>当前状态</strong>
    <span>站点、双语内容、公开知识库、碧影入口、留言、后台和自动验证已有基础闭环。</span>
  </div>
  <div>
    <strong>证据位置</strong>
    <span>源页面、脚本、测试和生成站点都保留在仓库中；线上配置仍需单独确认。</span>
  </div>
</div>

## 背景与问题

我需要一个比社交主页更稳定、又比正式简历更能保留过程的入口。它需要同时承载学习笔记、项目复盘、当前状态、留言交流和公开边界说明，而不是把这些内容散在不同工具里。

另一个问题是访问路径：来访者不一定知道该先看笔记、项目还是近况，所以我加入了“碧影”作为公开内容向导。碧影不是全知替身，只能读取这个网站已经公开的内容，并在资料不足时说明不知道。

## 我的职责

<div class="timeline-list">
  <div class="timeline-item">
    <strong>信息架构</strong>
    <span>规划首页、关于、现在、笔记、项目、碧影、留言、隐私和模块更新等入口，并维护中英文对应关系。</span>
  </div>
  <div class="timeline-item">
    <strong>前端体验</strong>
    <span>实现首页视觉、主题切换、语言切换、移动端头部、侧栏把手、聊天界面、留言和后台基础界面。</span>
  </div>
  <div class="timeline-item">
    <strong>公开知识与对话</strong>
    <span>构建公开知识库，设计碧影的读取范围、来源边界、拒答边界和聊天前端状态。</span>
  </div>
  <div class="timeline-item">
    <strong>验证与发布准备</strong>
    <span>补齐公开范围校验、站点同步检查、API 单测、响应式测试、无障碍测试、资源预算和发布验证脚本。</span>
  </div>
</div>

## 约束条件

- 只能把已经公开、可验证的内容交给碧影读取；草稿、本地文件、账号活动和私密信息不能进入回答范围。
- 中英文页面需要保持结构对应，但英文课程讲义目前只是概要，不应暗示为完整翻译。
- 站点既要保留个性化视觉，又要在 320px、393px、768px、1440px 等视口保持可读和可操作。
- 线上 KV、模型密钥和平台绑定属于部署环境配置，不能在项目页写成已经完全稳定的生产能力。
- 依赖审计、资源瘦身和长篇讲义拆分需要独立处理，避免和项目叙述混在一起。

## 关键决策

<div class="cyber-grid">
  <section class="cyber-card">
    <h3>中文作为主源</h3>
    <p>中文页面承载更完整内容，英文页面优先保证入口、概要和边界清楚，避免把未完整翻译的页面包装成全文。</p>
  </section>
  <section class="cyber-card">
    <h3>公开边界先行</h3>
    <p>碧影回答依赖公开知识库，页面 frontmatter 中的 `public` 与 `avatar_readable` 一起决定是否进入知识源。</p>
  </section>
  <section class="cyber-card">
    <h3>渐进增强</h3>
    <p>无 JavaScript、打印模式、低动态偏好和移动端都需要保留可读内容，交互效果只作为增强层。</p>
  </section>
  <section class="cyber-card">
    <h3>测试绑定回滚</h3>
    <p>每一阶段都配套自动测试和独立提交，出问题时可以回滚单个阶段，而不是拆一个巨大的混合提交。</p>
  </section>
</div>

## 实现过程

1. 建立 MkDocs Material 双语站点，规划 `/zh/` 与 `/en/` 页面结构。
2. 导入并整理公开课程讲义、项目页、Now 页、隐私说明和公开边界说明。
3. 构建公开知识库生成脚本，把允许公开的页面切成可检索条目，并保留来源路径。
4. 实现碧影聊天、留言、后台消息管理、认证辅助接口、统计接口和本地 transcript 恢复。
5. 为移动端、表单、侧栏、无 JS、SEO、API、公开范围和资源预算补自动测试。
6. 分阶段重构首页、导航、品牌定位和 Now 陈旧提示，确保首页只展示已确认事实。

## 结果与证据

- `npm run verify:release` 已能统一执行站点构建、公开范围校验、JS 语法、API 单测、页面元数据、资源预算和浏览器回归。
- 项目包含 21 项 API 单测，并在发布验证中覆盖移动端、平板和桌面浏览器回归。
- 首页、项目页、公开边界、Now、隐私页和碧影入口已经形成中英文公开入口。
- 公开知识库由构建脚本生成，碧影只读取被标记为公开且可读的页面。
- 站点包含隐私说明、留言隐私提醒、公开范围说明和 Now 陈旧提示。

这些证据来自当前仓库中的页面、脚本和测试；没有写入未公开的访问指标或线上业务数据。

## 不足与下一步

- 当前项目页只有这一个真实案例，后续至少需要再补 1–2 个经过确认的项目，才能把项目首页升级成完整作品集。
- 英文课程讲义仍是 Overview，需要人工校对或完整翻译后再改成全文。
- 线上模型密钥、KV 绑定、EdgeOne 平台配置和只读冒烟仍需要发布阶段确认。
- 长篇讲义还需要按课程拆成稳定子路径，并保留旧 URL 与章节入口。
- 资源体积、Source Map、字体和脚本按页加载会在后续性能阶段单独处理。

## 链接与截图

<div class="project-framework" aria-label="项目链接">
  <div>
    <strong>站点源码</strong>
    <span><a href="https://github.com/Lumner/Biying_digital_garden">GitHub 仓库</a></span>
  </div>
  <div>
    <strong>公开边界</strong>
    <span><a href="../../notes/public-scope/">碧影可读取内容与公开范围</a></span>
  </div>
  <div>
    <strong>近期状态</strong>
    <span><a href="../../now/">Now 页面</a> 记录当前注意力和站点状态。</span>
  </div>
</div>

<p class="quiet-panel">暂未放置正式项目截图。后续补截图时会使用真实页面或部署结果，不使用虚构界面。</p>
