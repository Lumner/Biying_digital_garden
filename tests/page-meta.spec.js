import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("Updates page renders recent page metadata automatically", async ({ page }) => {
  await page.goto(`${site.url}/zh/updates/`);

  const latest = page.locator("[data-latest-page-updated] time");
  await expect(latest).toBeVisible();
  const latestDate = await latest.getAttribute("datetime");
  expect(latestDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  const links = page.locator("[data-recent-page-updates] a");
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeGreaterThan(1);

  const dates = await links.locator("span").allTextContents();
  expect(dates[0]).toBe(latestDate);
  expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));

  const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href") || ""));
  expect(hrefs.every((href) => href.startsWith("/zh/"))).toBe(true);
});
