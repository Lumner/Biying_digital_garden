---
title: Personal Digital Garden + Biying
summary: A bilingual personal website project that brings public notes, project records, a guestbook, and the Biying digital persona into one long-term entrance.
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
  <h1 class="garden-pagehead__title">Personal Digital Garden + Biying</h1>
  <p class="garden-pagehead__lead">A long-term entrance that brings public notes, project records, a guestbook, and Biying into one growing system.</p>
  <div class="garden-pagehead__meta">
    <span class="status-pill">MkDocs</span>
    <span class="status-pill leaf">EdgeOne</span>
    <span class="status-pill warm">Digital Persona</span>
  </div>
</section>

<div class="project-brief">
  <div>
    <strong>Positioning</strong>
    <span>A personal digital garden, not a one-off portfolio.</span>
  </div>
  <div>
    <strong>Core</strong>
    <span>Public content, bilingual notes, Biying chat, and guestbook.</span>
  </div>
  <div>
    <strong>Status</strong>
    <span>The static site can deploy; backend abilities keep improving.</span>
  </div>
</div>

This is the long-term personal website I am building for myself. It is not just a portfolio, and it is not only a chat demo. It brings public notes, project records, current status, a guestbook, and the digital persona "Biying" into one entrance.

I want it to grow with my learning and building. Right now it may be a few course notes and a conversational entrance; later it can hold more real projects, debugging records, temporary thoughts, and a steadier deployment setup.

## Why I Built It

I wanted a space that feels more stable than a social profile and more relaxed than a formal profile. Friends can see what I have been working on recently. People who are also interested in AI and engineering can follow the notes and projects into the actual process.

Biying is the unusual part of this project. He is not an all-knowing substitute for me, just a gentle guide to public content: he reads what has already been published on the site, helps visitors find useful signals, and says he does not know when the material is not there.

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
    <p>Public knowledge generation, persona design, EdgeOne Functions style APIs, and DeepSeek/OpenAI-compatible model access.</p>
  </section>
  <section class="cyber-card">
    <h3>Interaction and Deployment</h3>
    <p>Vanilla JavaScript, cyber-style CSS, public guestbook, EdgeOne Pages/Functions/KV deployment path, and GitHub CI.</p>
  </section>
</div>

## What I Did

- Built the MkDocs Material site structure and planned pages for home, about, now, notes, projects, Biying, and guestbook.
- Designed the `/zh/` and `/en/` bilingual content structure so Chinese and English navigation and pages stay paired.
- Imported and organized three course notes: discrete mathematics, computer systems fundamentals, and FDS data structures.
- Fixed math rendering in course notes so LaTeX can display correctly through MathJax.
- Reworked headings in long notes so the right sidebar can serve as a chapter index.
- Wrote `build_knowledge.py` to generate the public knowledge base that Biying can read.
- Designed Biying's persona, tone, readable scope, and refusal boundaries.
- Implemented the chat frontend, guestbook frontend, and EdgeOne Functions style API skeletons.
- Added deployment, architecture, and collaboration notes so the project can keep being maintained.

## Current Results

- The site can be built and previewed locally, and `mkdocs build --strict` passes.
- Chinese and English pages now have a clear structure for future content.
- Three course notes have become readable website pages with math rendering and chapter navigation.
- Biying can answer questions related to site content from the public knowledge base.
- The guestbook and EdgeOne deployment route have a working foundation for a real online setup.

## What I Want to Improve

- English course notes still need fuller translation and human review.
- Before Biying goes fully online, the backend needs real model keys, KV bindings, and rate limiting.
- The guestbook needs moderation, deletion, anti-spam, and a smoother admin flow.
- Mobile reading, long-note experience, and visual details can still be refined.
- Project pages need more real work, reflections, and progress notes over time.
