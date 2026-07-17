import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


let site;

test.use({ javaScriptEnabled: false });


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


test("homepage content remains readable without JavaScript", async ({ page }) => {
  await page.goto(`${site.url}/zh/`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator(".home-below-fold")).toBeVisible();
  await expect(page.locator(".home-section").first()).toBeVisible();
});


test("root entry keeps manual language links without JavaScript", async ({ page }) => {
  await page.goto(`${site.url}/`, { waitUntil: "domcontentloaded" });
  const article = page.locator("article");
  await expect(article.locator('a[href$="zh/"]')).toBeVisible();
  await expect(article.locator('a[href$="en/"]')).toBeVisible();
});
