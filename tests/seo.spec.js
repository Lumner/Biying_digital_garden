import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


const routes = [
  "/",
  "/zh/",
  "/en/",
  "/zh/notes/",
  "/zh/projects/",
  "/zh/avatar/",
  "/zh/privacy/",
  "/en/privacy/"
];
const requiredOg = [
  "og:title",
  "og:description",
  "og:type",
  "og:url",
  "og:site_name",
  "og:locale",
  "og:locale:alternate",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:image:alt"
];
const requiredTwitter = [
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:image:alt"
];
let site;


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


for (const route of routes) {
  test(`${route} exposes complete indexable and share metadata`, async ({ page, request }) => {
    await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("head title")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    for (const property of requiredOg) {
      await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
    }
    for (const name of requiredTwitter) {
      await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
    }

    const values = await page.evaluate(() => ({
      alternates: Object.fromEntries(
        [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
          .map((link) => [link.hreflang, link.href])
      ),
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      description: document.querySelector('meta[name="description"]')?.content || "",
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((script) => JSON.parse(script.textContent)),
      ogDescription: document.querySelector('meta[property="og:description"]')?.content || "",
      ogImage: document.querySelector('meta[property="og:image"]')?.content || "",
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || "",
      ogUrl: document.querySelector('meta[property="og:url"]')?.content || "",
      title: document.title,
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.content || ""
    }));
    expect(values.title.trim()).not.toBe("");
    expect(values.description.trim()).not.toBe("");
    expect(values.canonical).toMatch(/^https:\/\/www\.biying\.site\//);
    expect(values.description).not.toBe("一个双语、赛博风格、可对话的个人数字网站。");
    expect(values.ogTitle).toBe(values.title);
    expect(values.ogDescription).toBe(values.description);
    expect(values.ogUrl).toBe(values.canonical);
    expect(values.ogImage).toBe("https://www.biying.site/assets/images/og-biying.jpg");
    expect(values.twitterCard).toBe("summary_large_image");
    expect(Object.keys(values.alternates).sort()).toEqual(["en", "x-default", "zh-CN"]);
    expect(values.alternates["x-default"]).toBe("https://www.biying.site/");
    expect(values.jsonLd.length).toBeGreaterThan(0);
    for (const item of values.jsonLd) {
      expect(item["@context"]).toBe("https://schema.org");
    }

    for (const href of Object.values(values.alternates)) {
      const alternate = new URL(href);
      const response = await request.get(`${site.url}${alternate.pathname}`);
      expect(response.ok(), `${href} should resolve in the published site`).toBe(true);
    }
  });
}

test("localized homepages expose Person and WebSite structured data", async ({ page }) => {
  for (const route of ["/zh/", "/en/"]) {
    await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    const types = await page.locator('script[type="application/ld+json"]').evaluateAll(
      (scripts) => scripts.map((script) => JSON.parse(script.textContent)["@type"])
    );
    expect(types).toEqual(expect.arrayContaining(["Person", "WebSite"]));
  }
});


test("notes and project pages expose specific structured data", async ({ page }) => {
  const cases = [
    ["/zh/notes/public-scope/", "TechArticle"],
    ["/en/projects/personal-site-avatar/", "CreativeWork"]
  ];
  for (const [route, expectedType] of cases) {
    await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    const types = await page.locator('script[type="application/ld+json"]').evaluateAll(
      (scripts) => scripts.map((script) => JSON.parse(script.textContent)["@type"])
    );
    expect(types).toEqual(expect.arrayContaining([expectedType, "BreadcrumbList"]));
  }
});


test("social card is a 1200 by 630 image", async ({ page }) => {
  await page.goto(`${site.url}/zh/`, { waitUntil: "domcontentloaded" });
  const socialPath = await page.locator('meta[property="og:image"]').getAttribute("content");
  const pathname = new URL(socialPath).pathname;
  const dimensions = await page.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, `${site.url}${pathname}`);
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});


test("root language entry never forces a JavaScript redirect", async ({ page, request }) => {
  await page.goto(`${site.url}/`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(`${site.url}/`);
  await expect(page.locator(".language-gateway")).toBeVisible();
  await expect(page.locator('.language-gateway a[href$="/zh/"]')).toBeVisible();
  await expect(page.locator('.language-gateway a[href$="/en/"]')).toBeVisible();

  const response = await request.get(`${site.url}/`);
  const html = await response.text();
  expect(html).not.toContain("location.replace");
  expect(html).not.toContain("location.assign");
});


for (const [route, locale, otherLocale] of [
  ["/zh/", "zh", "en"],
  ["/en/", "en", "zh"]
]) {
  test(`${route} search only shows ${locale} results`, async ({ page }) => {
    await page.goto(`${site.url}${route}`, { waitUntil: "networkidle" });
    await page.locator("#__search").evaluate((toggle) => {
      toggle.checked = true;
      toggle.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const query = page.locator('[data-md-component="search-query"]');
    await expect(query).toBeVisible();
    const result = page.locator('[data-md-component="search-result"]');
    await expect(result.locator(".md-search-result__meta")).toHaveText("键入以开始搜索");
    await query.pressSequentially("AI");

    await expect(result).toHaveAttribute("data-biying-search-locale", locale);
    await expect.poll(async () =>
      result.locator(`.md-search-result__item[data-biying-search-locale="${locale}"]`).count()
    ).toBeGreaterThan(0);
    await expect(result.locator('.md-search-result__item[data-biying-search-locale="other"]')).toHaveCount(0);

    const visiblePaths = await result
      .locator('.md-search-result__item:not([hidden]) a[href]')
      .evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
    expect(visiblePaths.length).toBeGreaterThan(0);
    expect(visiblePaths.every((path) => path.startsWith(`/${locale}/`))).toBe(true);
    expect(visiblePaths.some((path) => path.startsWith(`/${otherLocale}/`))).toBe(false);
    await expect(result.locator(".biying-search-locale-note")).toBeVisible();
  });
}


test("sitemap includes both language roots", async ({ request }) => {
  const response = await request.get(`${site.url}/sitemap.xml`);
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  expect(sitemap).toContain("<loc>https://www.biying.site/zh/</loc>");
  expect(sitemap).toContain("<loc>https://www.biying.site/en/</loc>");
});
