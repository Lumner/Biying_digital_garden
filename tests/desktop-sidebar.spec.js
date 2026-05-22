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

test("right table of contents can be revealed after scrolling into an article", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await page.waitForTimeout(120);

  const sidebar = page.locator(".md-sidebar--secondary");
  const before = await sidebar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      bottom: rect.bottom,
      height: rect.height,
      opacity: getComputedStyle(el).opacity,
      top: rect.top,
      width: rect.width,
      x: rect.x
    };
  });

  expect(before.top).toBeGreaterThanOrEqual(0);
  expect(before.bottom).toBeLessThanOrEqual(900);
  expect(before.height).toBeGreaterThan(600);
  expect(before.opacity).toBe("0");

  await page.mouse.click(before.x + before.width - 16, before.bottom - 24);
  await expect(page.locator("body")).toHaveClass(/sidebar-secondary-peek/);
  await expect(sidebar).toHaveCSS("opacity", "1");
});
