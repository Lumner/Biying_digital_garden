---
title: 站点后台
summary: 站点主人的私有后台入口。
public: false
avatar_readable: false
tags:
  - admin
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">ADMIN</div>
  <h1 class="garden-pagehead__title">站点后台</h1>
  <p class="garden-pagehead__lead">查看注册用户、处理私信，并为忘记密码的用户签发一次性恢复码。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill warm">仅站点主人使用</span>
    <span class="status-pill">需要管理员 token</span>
  </div>
</section>

这里不会展示密码、密码哈希或公开以外的内容。恢复码只在生成时显示一次，过期或使用一次后失效。

<div class="admin-panel" data-admin-dashboard></div>
