---
title: 站点后台
summary: 只有站主本人使用的后台入口。
public: false
avatar_readable: false
tags:
  - admin
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">ADMIN</div>
  <h1 class="garden-pagehead__title">站点后台</h1>
  <p class="garden-pagehead__lead">这里用来查看注册用户、处理私信、管理公开留言，也能给忘记密码的人生成一次性恢复码。</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill warm">仅站主使用</span>
    <span class="status-pill">需要管理员 token</span>
  </div>
</section>

这里不会展示密码、密码哈希或公开以外的内容。恢复码只在生成时显示一次，过期或使用一次后失效。公开留言可以在这里隐藏、恢复显示或删除；站主也可以注销用户账号，这会清除账号与当前登录状态，但不会自动抹掉它已经公开发表过的留言。

<div class="admin-panel" data-admin-dashboard></div>
