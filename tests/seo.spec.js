import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


const routes = [
  "/",
  "/zh/",
  "/en/",
  "/zh/notes/",
  "/zh/projects/",
  "/zh/avatar/"
];
let site;


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


for (const route of routes) {
  test(`${route} exposes basic indexable metadata`, async ({ page }) => {
    await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("head title")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

    const values = await page.evaluate(() => ({
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      description: document.querySelector('meta[name="description"]')?.content || "",
      title: document.title
    }));
    expect(values.title.trim()).not.toBe("");
    expect(values.description.trim()).not.toBe("");
    expect(values.canonical).toMatch(/^https:\/\/www\.biying\.site\//);
  });
}


test("sitemap includes both language roots", async ({ request }) => {
  const response = await request.get(`${site.url}/sitemap.xml`);
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  expect(sitemap).toContain("<loc>https://www.biying.site/zh/</loc>");
  expect(sitemap).toContain("<loc>https://www.biying.site/en/</loc>");
});
