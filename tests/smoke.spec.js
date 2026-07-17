import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


const routes = [
  "/",
  "/zh/",
  "/en/",
  "/zh/notes/",
  "/zh/projects/",
  "/zh/avatar/",
  "/zh/register/",
  "/zh/guestbook/",
  "/zh/admin/"
];
let site;


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


for (const route of routes) {
  test(`${route} renders without an uncaught page exception`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}
