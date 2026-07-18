import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.use({
  hasTouch: false,
  isMobile: false,
  viewport: { width: 1440, height: 900 }
});

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

async function openLecture(page) {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "networkidle" });
}

test("desktop navigation preserves the original edge-peek interaction", async ({ page }) => {
  await openLecture(page);

  const sidebar = page.locator(".md-sidebar--primary");
  await expect(page.locator("[data-sidebar-handle]")).toHaveCount(0);
  await expect(sidebar).toHaveCSS("opacity", "0");

  await page.mouse.move(1, 300);
  await expect(page.locator("body")).toHaveClass(/sidebar-primary-peek/);
  await expect(sidebar).toHaveCSS("opacity", "1");
  await expect(sidebar.locator("a:visible").first()).toBeVisible();

  await page.mouse.move(720, 300);
  await expect.poll(async () => page.locator("body").evaluate((body) =>
    body.classList.contains("sidebar-primary-peek")
  )).toBe(false);
  await expect(sidebar).toHaveCSS("opacity", "0");
});

test("secondary navigation preserves the original direct-peek interaction", async ({ page }) => {
  await openLecture(page);

  const secondary = page.locator(".md-sidebar--secondary");
  await expect(secondary).toHaveCSS("opacity", "0");
  await secondary.click({ force: true, position: { x: 12, y: 100 } });
  await expect(page.locator("body")).toHaveClass(/sidebar-secondary-peek/);
  await expect(secondary).toHaveCSS("opacity", "1");
  await expect(secondary.locator("a:visible").first()).toBeVisible();
});

test("long lecture scroll regions remain keyboard reachable", async ({ page }) => {
  await openLecture(page);

  await page.evaluate(() => {
    const region = document.createElement("div");
    region.className = "md-typeset__scrollwrap";
    region.style.width = "100px";
    region.style.overflow = "auto";
    const wide = document.createElement("div");
    wide.style.width = "500px";
    wide.textContent = "keyboard scroll probe";
    region.appendChild(wide);
    document.body.appendChild(region);
    document.dispatchEvent(new Event("DOMContentLoaded"));
  });

  const regions = page.locator('[data-keyboard-scroll="true"]');
  expect(await regions.count()).toBeGreaterThan(0);
  const first = regions.first();
  await first.focus();
  await expect(first).toBeFocused();
});

test("original reveal motion prepares cards and reveals them on entry", async ({ page }) => {
  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  const card = page.locator(".home-section--signals .cyber-card").last();
  await expect(card).toHaveClass(/reveal/);
  await expect(card).toHaveCSS("opacity", "0");
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveCSS("opacity", "1");
});

test("reduced-motion mode disables continuous animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  const continuousAnimations = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*")).filter((element) => {
      const style = getComputedStyle(element);
      if (style.animationName === "none") return false;
      return style.animationIterationCount
        .split(",")
        .some((iteration) => iteration.trim() === "infinite");
    }).length
  );
  expect(continuousAnimations).toBe(0);
});

test("desktop restores the original Pikachu cursor system", async ({ page }) => {
  await page.goto(`${site.url}/zh/avatar/`, { waitUntil: "networkidle" });

  const cursors = await page.evaluate(() => {
    const disabled = document.createElement("button");
    disabled.disabled = true;
    disabled.textContent = "disabled";
    document.body.appendChild(disabled);
    return {
      body: getComputedStyle(document.body).cursor,
      button: getComputedStyle(document.querySelector("button:not(:disabled)")).cursor,
      disabled: getComputedStyle(disabled).cursor,
      textarea: getComputedStyle(document.querySelector("textarea")).cursor
    };
  });

  expect(cursors.body).toContain("pikachu-cursor.svg");
  expect(cursors.button).toContain("pikachu-pointer.svg");
  expect(cursors.disabled).toContain("pikachu-cursor.svg");
  expect(cursors.disabled).toContain("not-allowed");
  expect(cursors.textarea).toContain("pikachu-cursor.svg");
  expect(cursors.textarea).toContain("text");
});
