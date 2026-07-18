---
title: Site Stats
summary: Visitor and page-view statistics for Biying Digital Garden.
description: Visitor and page-view statistics for Biying Digital Garden.
public: true
avatar_readable: true
tags:
  - site
  - stats
---

<section class="garden-pagehead">
  <div>
    <span class="garden-pagehead__eyebrow">SITE SIGNALS</span>
    <h1 class="garden-pagehead__title">Site Stats</h1>
    <p class="garden-pagehead__lead">This page records how often the digital garden is seen: a browser's first visit counts as one visitor, and every page load counts as one page view.</p>
  </div>
</section>

<section class="site-stats-panel site-stats-panel--page" data-site-stats aria-label="Site statistics">
  <div class="site-stats-panel__intro">
    <strong>Visit overview</strong>
    <span>The numbers are written by this site's EdgeOne Function into self-hosted KV storage for a simple public traffic signal.</span>
    <p class="site-stats-panel__status" data-site-stat-status>Loading site statistics</p>
  </div>
  <div class="site-stats-panel__metric">
    <span>Total visitors</span>
    <strong data-site-stat="totalVisitors">--</strong>
  </div>
  <div class="site-stats-panel__metric">
    <span>Page views</span>
    <strong data-site-stat="pageViews">--</strong>
  </div>
</section>

<p class="quiet-panel">Stats use only an anonymous visitor ID generated in the browser and page-load events. If `BIYING_KV` is not bound on the live site yet, the page still works, but the numbers will not accumulate.</p>
