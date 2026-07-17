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

  const contentStyles = await page.locator(".home-section").evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        opacity: style.opacity,
        visibility: style.visibility
      };
    })
  );
  expect(contentStyles.length).toBeGreaterThan(1);
  expect(contentStyles.every((style) => style.opacity === "1")).toBe(true);
  expect(contentStyles.every((style) => style.visibility === "visible")).toBe(true);
});

test("long article and table of contents remain visible without JavaScript", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "domcontentloaded" });

  await expect(page.locator("article.md-content__inner")).toBeVisible();
  await expect(page.locator(".md-sidebar--secondary")).toBeVisible();
  await expect(page.locator(".md-sidebar--secondary a[href]").first()).toBeVisible();
});

test("print mode keeps article content and table of contents visible", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "domcontentloaded" });

  const printState = await page.evaluate(() => {
    const article = document.querySelector("article.md-content__inner");
    const toc = document.querySelector(".md-sidebar--secondary");
    const articleStyle = getComputedStyle(article);
    const tocStyle = getComputedStyle(toc);
    return {
      articleDisplay: articleStyle.display,
      articleOpacity: articleStyle.opacity,
      articleVisibility: articleStyle.visibility,
      tocDisplay: tocStyle.display,
      tocOpacity: tocStyle.opacity,
      tocVisibility: tocStyle.visibility
    };
  });

  expect(printState.articleDisplay).not.toBe("none");
  expect(printState.articleOpacity).toBe("1");
  expect(printState.articleVisibility).toBe("visible");
  expect(printState.tocDisplay).not.toBe("none");
  expect(printState.tocOpacity).toBe("1");
  expect(printState.tocVisibility).toBe("visible");
});


test("root entry keeps manual language links without JavaScript", async ({ page }) => {
  await page.goto(`${site.url}/`, { waitUntil: "domcontentloaded" });
  const article = page.locator("article");
  await expect(article.locator('a[href$="zh/"]')).toBeVisible();
  await expect(article.locator('a[href$="en/"]')).toBeVisible();
});
