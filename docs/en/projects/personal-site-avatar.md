---
title: Personal Website + Digital Persona
summary: A bilingual personal website for course notes, project records, and current status, with Biying as a male fictional digital persona for public-content conversations.
public: true
avatar_readable: true
tags:
  - personal-site
  - digital-avatar
  - mkdocs
  - rag
  - edgeone
---

# Personal Website + Digital Persona

This project is a personal digital website built for myself. It records course notes, project experience, current learning directions, and public personal updates. It also includes "Biying", a male fictional digital persona who helps visitors understand the site's public content through conversation.

## Background

I wanted a long-term space with a stronger sense of life. It should collect my learning process, course notes, project records, and temporary thoughts. For friends, it answers "What are you working on now?" For other visitors, it shows my technical interests, communication ability, and habit of building things continuously.

I also wanted to place AI collaboration into something visitors can actually open and use, instead of leaving it as a local demo. Biying is part of that experiment: he only reads public website content, answers in a RAG-like way, and can chat casually within safe boundaries.

## Tech Stack

<div class="cyber-grid">
  <section class="cyber-card">
    <h3>Content and Site</h3>
    <p>MkDocs Material, Markdown, Pymdown Extensions, and MathJax for a maintainable note-oriented static website.</p>
  </section>
  <section class="cyber-card">
    <h3>Bilingual Content Engineering</h3>
    <p>Chinese and English page structure, language-switching navigation, course-note import scripts, and public knowledge generation.</p>
  </section>
  <section class="cyber-card">
    <h3>Digital Persona</h3>
    <p>EdgeOne Functions style chat API, public knowledge retrieval, persona prompt design, and DeepSeek/OpenAI-compatible model access.</p>
  </section>
  <section class="cyber-card">
    <h3>Interaction and Deployment</h3>
    <p>Vanilla JavaScript, cyber-style CSS, public guestbook, EdgeOne Pages deployment plan, and GitHub CI validation.</p>
  </section>
</div>

## What I Did

- Built the MkDocs Material project structure and planned pages for home, about, now, notes, projects, Biying, and guestbook.
- Designed the `/zh/` and `/en/` bilingual content structure and implemented whole-site language switching without crowding the sidebar with both languages at once.
- Imported and organized course notes for discrete mathematics, computer systems fundamentals, and FDS data structures.
- Fixed math rendering issues in course notes by converting code-styled LaTeX back into MathJax-renderable formulas.
- Reworked heading levels for long lecture notes so the right sidebar can serve as a chapter index.
- Wrote `build_knowledge.py` to turn public pages into a public knowledge base for Biying.
- Designed Biying as a male fictional persona, including his tone, knowledge scope, and safety boundaries.
- Implemented a chat API skeleton that answers from public context and leaves room for DeepSeek/OpenAI-compatible model providers.
- Implemented a public guestbook frontend and an EdgeOne KV style API skeleton.
- Wrote deployment and multi-agent collaboration documentation for future extension.

## Results

- The website can be built and previewed locally, and `mkdocs build --strict` passes.
- The bilingual personal website now includes a profile, current status, project pages, course notes, and a digital persona entrance.
- Three course notes have been organized as website pages with math rendering and right-sidebar chapter navigation.
- Biying can read the public knowledge base and answer questions related to public site content.
- The guestbook system and EdgeOne deployment route have a working foundation.
- The project structure is ready for adding more notes, projects, and bilingual pages.

## Limitations

- Some English note pages are still companion/overview versions. A translation API or manual review is needed for full English versions.
- Biying's backend still needs real EdgeOne environment variables, model keys, KV bindings, and rate limiting before production use.
- The guestbook system needs stronger moderation, deletion, anti-spam, and admin tools.
- The visual direction already has a cyber style, but mobile details, readability, and motion can still be improved.
- The project is still early and needs more real project records, learning summaries, and personal writing.

## Next Steps

- Deploy to EdgeOne Pages and configure Functions, KV, and environment variables.
- Add more real project pages.
- Build a more stable bilingual translation workflow.
- Improve Biying's retrieval quality, source citation, and refusal behavior.
- Keep refining the visual style so the site feels cyber, personal, and comfortable to read.
