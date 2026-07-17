import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


const routes = [
  "/zh/",
  "/en/",
  "/zh/notes/",
  "/zh/notes/computer-systems-lecture/",
  "/zh/projects/",
  "/zh/avatar/",
  "/zh/register/",
  "/zh/privacy/"
];
let site;


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


for (const route of routes) {
  test(`${route} fits the configured viewport`, async ({ page }) => {
    const response = await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  });
}
