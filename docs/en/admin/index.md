---
title: Site Admin
summary: Private owner dashboard for the site.
public: false
avatar_readable: false
tags:
  - admin
---

<section class="garden-pagehead">
  <div class="garden-pagehead__eyebrow">ADMIN</div>
  <h1 class="garden-pagehead__title">Site Admin</h1>
  <p class="garden-pagehead__lead">Review registered users, handle private messages, moderate public guestbook notes, and issue one-time recovery codes.</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill warm">Owner Only</span>
    <span class="status-pill">Admin Token Required</span>
  </div>
</section>

Passwords, password hashes, and non-public site content are not shown here. Recovery codes are displayed once, then expire or become invalid after one use. Public guestbook notes can be hidden, restored, or deleted here. The owner can also remove user accounts; that clears the account and active sessions without silently erasing public messages already posted.

<div class="admin-panel" data-admin-dashboard></div>
