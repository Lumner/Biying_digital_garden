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
  "/zh/privacy/",
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
  test(`${route} renders without uncaught exceptions or console errors`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    const siteOrigin = new URL(site.url).origin;
    await page.route(/^https?:\/\//, (externalRoute) => {
      const requestOrigin = new URL(externalRoute.request().url()).origin;
      if (requestOrigin === siteOrigin) return externalRoute.continue();
      return externalRoute.fulfill({ status: 204, body: "" });
    });
    await page.route("**/api/**", (apiRoute) => apiRoute.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        available: false,
        messages: [],
        users: [],
        privateMessages: [],
        guestbookMessages: []
      })
    }));
    const response = await page.goto(`${site.url}${route}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
