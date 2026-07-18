---
title: Personal Digital Garden + Biying
summary: A bilingual personal website project that brings public notes, project records, a guestbook, public knowledge, and the Biying digital assistant into one long-term entrance.
description: A bilingual personal website project that brings public notes, project records, a guestbook, public knowledge, and the Biying digital assistant into one long-term entrance.
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
  <h1 class="garden-pagehead__title">Personal Digital Garden + Biying</h1>
  <p class="garden-pagehead__lead">A long-term bilingual personal site for public notes, project records, current status, guestbook messages, and Biying, so visitors can enter the public content through pages or chat.</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MkDocs</span>
    <span class="status-pill leaf">EdgeOne</span>
    <span class="status-pill warm">Updated: 2026-07-18</span>
  </div>
</section>

## Project Summary

<div class="project-brief">
  <div>
    <strong>Type</strong>
    <span>A long-term personal website and public-content guide, not a one-off portfolio.</span>
  </div>
  <div>
    <strong>Current Status</strong>
    <span>The site, bilingual content, public knowledge, Biying entry, guestbook, admin flow, and automated checks have a working baseline.</span>
  </div>
  <div>
    <strong>Evidence</strong>
    <span>Source pages, scripts, tests, and generated site output are in the repository; production configuration still needs separate confirmation.</span>
  </div>
</div>

## Background and Problem

I needed an entrance that is more stable than a social profile and better at preserving process than a formal resume. It has to hold learning notes, project reflection, current status, visitor messages, and public boundary notes without scattering them across unrelated tools.

The second problem is navigation. Visitors may not know whether to start from notes, projects, or current status, so Biying acts as a guide to the public content. He is not an all-knowing substitute for me; he only reads what has already been published on this site and says so when the material is missing.

## My Role

<div class="timeline-list">
  <div class="timeline-item">
    <strong>Information Architecture</strong>
    <span>Planned the home, about, now, notes, projects, Biying, guestbook, privacy, and update pages while keeping Chinese and English routes paired.</span>
  </div>
  <div class="timeline-item">
    <strong>Frontend Experience</strong>
    <span>Implemented the homepage, theme modes, language switcher, mobile header, sidebar handles, chat UI, guestbook, and basic admin surfaces.</span>
  </div>
  <div class="timeline-item">
    <strong>Public Knowledge and Chat</strong>
    <span>Built the public knowledge flow and designed Biying's readable scope, source boundaries, refusal boundaries, and chat states.</span>
  </div>
  <div class="timeline-item">
    <strong>Validation and Release Preparation</strong>
    <span>Added public-scope validation, site-sync checks, API tests, responsive tests, accessibility tests, site budget checks, and release verification scripts.</span>
  </div>
</div>

## Constraints

- Biying can only read public, verifiable content. Drafts, local files, account activity, and private information stay outside the answer scope.
- Chinese and English pages need paired structure, but English course notes are currently overviews and must not be presented as full translations.
- The site needs to keep its visual character while staying readable and operable at 320px, 393px, 768px, and 1440px viewports.
- Online KV bindings, model keys, and platform configuration belong to deployment and cannot be described as fully stable production capability here.
- Dependency audit, asset slimming, and long-note splitting need separate passes so they do not get mixed into project storytelling.

## Key Decisions

<div class="cyber-grid">
  <section class="cyber-card">
    <h3>Chinese as the Source</h3>
    <p>Chinese pages carry the fuller content. English pages prioritize clear entrances, overviews, and boundaries until full translation is available.</p>
  </section>
  <section class="cyber-card">
    <h3>Public Boundary First</h3>
    <p>Biying's answers depend on the public knowledge base. The `public` and `avatar_readable` frontmatter fields decide what can enter that source.</p>
  </section>
  <section class="cyber-card">
    <h3>Progressive Enhancement</h3>
    <p>Content must stay readable without JavaScript, in print, with reduced motion, and on mobile. Interaction effects are enhancement, not the foundation.</p>
  </section>
  <section class="cyber-card">
    <h3>Tests as Rollback Anchors</h3>
    <p>Each phase gets automated checks and separate commits, so a broken phase can be reverted without unpacking one large mixed change.</p>
  </section>
</div>

## Implementation Process

1. Created the MkDocs Material bilingual site structure with `/zh/` and `/en/` routes.
2. Imported and organized public course notes, project pages, Now pages, privacy notes, and public boundary pages.
3. Built the public knowledge generation scripts, splitting allowed pages into retrievable entries with source paths.
4. Implemented Biying chat, guestbook, admin message handling, authentication helper APIs, stats APIs, and local transcript restore.
5. Added automated tests for mobile layout, forms, sidebars, no-JS behavior, SEO, APIs, public scope, and site budget.
6. Refactored homepage, navigation, brand positioning, and Now staleness in separate phases so the homepage only shows confirmed facts.

## Results and Evidence

- `npm run verify:release` now runs site build, public-scope validation, JS syntax checks, API tests, metadata validation, site budget checks, and browser regression in one release gate.
- The project includes 21 API tests and browser checks across mobile, tablet, and desktop viewports.
- Home, project, public boundary, Now, privacy, and Biying pages now form a bilingual public entrance.
- The public knowledge base is generated from marked pages, and Biying only reads pages that are public and avatar-readable.
- The site includes privacy notes, guestbook privacy nudges, public-scope notes, and a Now staleness notice.

This evidence comes from repository pages, scripts, and tests. No private traffic metrics or unverified production claims are included.

## Limitations and Next Steps

- This is currently the only real public project case; at least 1–2 more confirmed projects are needed before the projects page can become a fuller portfolio.
- English course notes are still overviews and need human review or full translation before being labeled as complete.
- Production model keys, KV bindings, EdgeOne configuration, and read-only online smoke tests still need release-stage confirmation.
- Long lecture notes still need course-by-course splitting into stable subpaths while keeping old URLs and chapter entrances.
- Asset weight, source maps, fonts, and page-level script loading belong to the later performance phase.

## Links and Screenshots

<div class="project-framework" aria-label="Project links">
  <div>
    <strong>Source Repository</strong>
    <span><a href="https://github.com/Lumner/Biying_digital_garden">GitHub repository</a></span>
  </div>
  <div>
    <strong>Public Boundary</strong>
    <span><a href="../../notes/public-scope/">Biying readable content and public scope</a></span>
  </div>
  <div>
    <strong>Current Status</strong>
    <span>The <a href="../../now/">Now page</a> records current attention and site status.</span>
  </div>
</div>

<p class="quiet-panel">No formal project screenshot is included yet. Future screenshots should come from real pages or deployments, not invented interfaces.</p>
