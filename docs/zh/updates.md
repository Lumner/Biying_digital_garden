---
title: 模块更新
summary: 记录站点各个公开模块最近的维护状态，方便快速了解哪里刚刚有变化。
public: true
avatar_readable: true
tags:
  - updates
  - status
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">UPDATES</div>
  <h1 class="garden-pagehead__title">模块更新</h1>
  <p class="garden-pagehead__lead">这里不写宏大路线图，只留下每个公开模块最近一次真正发生的变化。以后继续加内容时，优先更新这一页，就能让整个站点的近况更容易被看见。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill leaf">公开维护记录</span>
    <span class="status-pill" data-latest-page-updated>更新：自动同步中</span>
  </div>
</section>

<h2>最近更新页面</h2>

<div class="module-update-preview" data-recent-page-updates data-limit="8">
  <p class="meta-line">正在读取最近更新...</p>
</div>

<h2>模块维护记录</h2>

<div class="module-update-grid">
  <article class="module-update-card">
    <span>首页</span>
    <strong>压缩入口层级并接入亮色封面</strong>
    <p>统计信息并入首页入口区，亮色模式使用新的书房人物封面，首屏和下方内容之间更紧凑。</p>
  </article>
  <article class="module-update-card">
    <span>笔记</span>
    <strong>公开知识库重新生成</strong>
    <p>课程页面继续保留章节索引和公式，公开知识库按页面与章节切块，方便碧影检索。</p>
  </article>
  <article class="module-update-card">
    <span>项目</span>
    <strong>刷新项目当前状态</strong>
    <p>项目页补充主题三态、友链、站点统计、登录入口和 CI 依赖锁等最新维护情况。</p>
  </article>
  <article class="module-update-card">
    <span>碧影</span>
    <strong>改善聊天阅读与键盘操作</strong>
    <p>聊天记录继续保存在本地，输入框支持 Enter 发送、Shift+Enter 换行，浮动聊天框的文字层级更清楚。</p>
  </article>
  <article class="module-update-card">
    <span>留言</span>
    <strong>补上轻量治理能力</strong>
    <p>访客侧有隐私提醒与节流，站主侧可以筛选、隐藏或删除公开留言，API 错误返回也更稳定。</p>
  </article>
  <article class="module-update-card">
    <span>后台</span>
    <strong>构建与依赖流程收紧</strong>
    <p>站点构建、公开范围校验、site 同步检查、Playwright 移动端测试和 `npm ci` 依赖锁已纳入维护流程。</p>
  </article>
</div>
