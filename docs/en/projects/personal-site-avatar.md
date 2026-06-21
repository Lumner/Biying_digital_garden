---
title: Personal Digital Garden + Biying
summary: A bilingual personal website project that brings public notes, project records, a guestbook, public knowledge, and the Biying digital persona into one long-term entrance.
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
  <h1 class="garden-pagehead__title">Personal Digital Garden + Biying</h1>
  <p class="garden-pagehead__lead">A long-term entrance where public notes, project records, friends, guestbook messages, public knowledge, and Biying can keep growing with the work.</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MkDocs</span>
    <span class="status-pill leaf">EdgeOne</span>
    <span class="status-pill warm">Updated: 2026-06-21</span>
  </div>
</section>

<div class="project-brief">
  <div>
    <strong>Positioning</strong>
    <span>A personal digital garden, not a one-off portfolio.</span>
  </div>
  <div>
    <strong>Core</strong>
    <span>Public content, bilingual notes, RAG retrieval, Biying chat, and guestbook.</span>
  </div>
  <div>
    <strong>Status</strong>
    <span>The site is live, with homepage polish, theme modes, account access, friend links, stats, and CI install stability being tightened.</span>
  </div>
</div>

This is the long-term personal website I am building for myself. It is not just a portfolio, and it is not only a chat demo. It brings public notes, project records, current status, friend links, guestbook messages, public knowledge, and Biying into one entrance.

I want it to grow with my learning and building. It now has bilingual pages, course notes, public retrieval, friend links, visitor stats, guestbook and admin APIs, mobile smoke tests, and self-hosted math rendering assets. Later it can hold more real projects, debugging records, temporary thoughts, and steadier production details.

## Background

I wanted a place that feels more stable than a social profile and more relaxed than a formal introduction. Friends can see what I have been working on recently. People who are also interested in AI and engineering can follow the notes and projects into the actual process.

Biying is the unusual part of this project. He is not an all-knowing substitute for me, just a gentle guide to public content: he reads what has already been published on the site, helps visitors find useful signals, and says he does not know when the material is not there.

## What I Did

<div class="timeline-list">
  <div class="timeline-item">
    <strong>Site Structure</strong>
    <span>Built the MkDocs Material site structure and planned pages for home, about, now, notes, projects, Biying, and guestbook.</span>
  </div>
  <div class="timeline-item">
    <strong>Bilingual Content</strong>
    <span>Designed the `/zh/` and `/en/` structure so navigation, pages, and public knowledge stay paired.</span>
  </div>
  <div class="timeline-item">
    <strong>Note Import</strong>
    <span>Imported three course notes, then fixed math rendering and chapter navigation for long lecture pages.</span>
  </div>
  <div class="timeline-item">
    <strong>Biying and Guestbook</strong>
    <span>Designed Biying's tone, readable scope, and refusal boundaries, then implemented the chat frontend, guestbook frontend, admin entry, EdgeOne Functions style APIs, and local transcript restore.</span>
  </div>
  <div class="timeline-item">
    <strong>Knowledge and Retrieval</strong>
    <span>Built public pages into a readable knowledge base, split content by sections, and gave the current page, Now page, and project pages stronger retrieval weight.</span>
  </div>
  <div class="timeline-item">
    <strong>Reliability Checks</strong>
    <span>Added shared frontend utilities, API error handling, rate-limit responses, public-scope validation, site-sync checks, dependency pinning, and Playwright mobile tests.</span>
  </div>
</div>

## Tech Stack

<div class="cyber-grid">
  <section class="cyber-card">
    <h3>Content Site</h3>
    <p>MkDocs Material, Markdown, Pymdown Extensions, and MathJax for notes, page structure, and math rendering.</p>
  </section>
  <section class="cyber-card">
    <h3>Bilingual Content</h3>
    <p>Chinese is the source language, English stays in step, and navigation, pages, and public knowledge are maintained in pairs.</p>
  </section>
  <section class="cyber-card">
    <h3>Biying Chat</h3>
    <p>Public knowledge generation, section-level chunks, source boundaries, dialogue design, EdgeOne Functions style APIs, and DeepSeek/OpenAI-compatible model access.</p>
  </section>
  <section class="cyber-card">
    <h3>Interaction and Deployment</h3>
    <p>Vanilla JavaScript, shared frontend utilities, cyber-style CSS, public guestbook, EdgeOne Pages/Functions/KV deployment path, GitHub CI, and Playwright mobile tests.</p>
  </section>
  <section class="cyber-card">
    <h3>Assets and Math</h3>
    <p>MathJax is self-hosted with the repository and generated site, reducing CDN dependency; the build script keeps static output in sync.</p>
  </section>
</div>

## Results

- The site can be built and previewed locally, and `python scripts/build_site.py` now handles knowledge generation, MkDocs build, and site-sync validation.
- Chinese and English pages now have a clear structure for future additions.
- Three course notes have become readable website pages with math rendering and chapter navigation.
- Biying can answer questions related to site content from the public knowledge base while respecting the public-scope boundary.
- Guestbook, admin message management, authentication helper APIs, and the EdgeOne deployment path now have a basic loop.
- Friend links support configured avatars and favicon fallback, and the homepage can show visitor and page-view totals.
- Theme switching supports light, dark, and system mode, with system mode as the first-visit default.
- Public-scope validation, mobile smoke tests, site-sync checks, and self-hosted MathJax are part of the maintenance flow.

## Limitations

- English course notes still need fuller translation and human review.
- The production environment still needs confirmed model keys, KV bindings, and EdgeOne platform configuration.
- The guestbook still needs finer moderation, deletion, anti-spam, and a smoother admin flow.
- Mobile reading, long-note experience, and visual details can still be refined.
- `edgeone` is now pinned for stable `npm ci`, but its development dependency chain still has audit findings, so dependency cleanup deserves a separate pass.

## Next

- Project pages need more real work, reflections, and progress notes over time.
- Connect EdgeOne Functions, KV, model keys, and public source citations into steadier production behavior.
- Handle dependency audit separately instead of mixing toolchain upgrades into content maintenance.
- Keep refining homepage visuals, mobile reading, and Biying chat until they feel stable for everyday use.
- Keep future projects on the same structure: background, what I did, stack, results, limitations, and next steps.
