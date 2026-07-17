import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


const routes = [
  "/zh/",
  "/en/",
  "/zh/notes/",
  "/en/notes/",
  "/zh/notes/computer-systems-lecture/",
  "/en/notes/computer-systems-lecture/",
  "/zh/projects/",
  "/en/projects/",
  "/zh/avatar/",
  "/en/avatar/",
  "/zh/register/",
  "/en/register/",
  "/zh/privacy/",
  "/en/privacy/"
];
const locales = [
  {
    code: "zh",
    brand: "碧影",
    notes: /笔记/,
    search: "搜索",
    theme: /主题/,
    language: /English/
  },
  {
    code: "en",
    brand: "Biying",
    notes: /Notes/,
    search: "Search",
    theme: /Theme/,
    language: /中文/
  }
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


for (const locale of locales) {
  test(`${locale.code} homepage title is fully visible`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    const viewport = page.viewportSize();
    const title = page.locator(".home-title");
    const box = await title.boundingBox();

    expect(viewport).not.toBeNull();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(-1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  });

  test(`${locale.code} header keeps navigation and tools operable`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    if (viewport.width <= 896) {
      const menu = page.locator("label.md-header__button[for='__drawer']");
      const title = page.locator(".md-header__title");
      const tools = page.locator("[data-mobile-tools-toggle]");

      await expect(menu).toBeVisible();
      await expect(title).toContainText(locale.brand);
      await expect(tools).toBeVisible();
      await expect(page.locator("label.md-header__button[for='__search']")).toBeHidden();
      await expect(page.locator(".md-header__inner > .theme-switcher")).toBeHidden();
      await expect(page.locator(".md-header__inner > .lang-switcher")).toBeHidden();

      const boxes = await Promise.all([menu, title, tools].map((locator) => locator.boundingBox()));
      expect(boxes.every(Boolean)).toBe(true);
      expect(boxes[0].width).toBeGreaterThanOrEqual(44);
      expect(boxes[0].height).toBeGreaterThanOrEqual(44);
      expect(boxes[2].width).toBeGreaterThanOrEqual(44);
      expect(boxes[2].height).toBeGreaterThanOrEqual(44);
      expect(boxes[0].x + boxes[0].width).toBeLessThanOrEqual(boxes[1].x + 1);
      expect(boxes[1].x + boxes[1].width).toBeLessThanOrEqual(boxes[2].x + 1);

      await tools.click();
      const toolMenu = page.locator("[data-mobile-tools-menu]");
      await expect(toolMenu).toBeVisible();

      const search = page.locator("[data-mobile-search]");
      const theme = page.locator("[data-mobile-theme]");
      const language = page.locator("[data-mobile-language]");
      await expect(search).toHaveAccessibleName(locale.search);
      await expect(theme).toHaveAccessibleName(locale.theme);
      await expect(language).toHaveAccessibleName(locale.language);
      for (const target of [search, theme, language]) {
        const targetBox = await target.boundingBox();
        expect(targetBox).not.toBeNull();
        expect(targetBox.height).toBeGreaterThanOrEqual(44);
      }

      await search.click();
      await expect(page.locator("#__search")).toBeChecked();
      await expect(page.locator(".md-search__input")).toBeVisible();

      await page.keyboard.press("Escape");
      await menu.click();
      await expect(page.locator("#__drawer")).toBeChecked();
      await expect(page.locator(".md-sidebar--primary").getByText(locale.notes).first()).toBeVisible();
      return;
    }

    await expect(page.locator(".md-tabs")).toBeVisible();
    await expect(page.locator(".md-tabs").getByText(locale.notes).first()).toBeVisible();
    await expect(page.locator(".md-header__inner > .theme-switcher")).toBeVisible();
    await expect(page.locator(".md-header__inner > .lang-switcher")).toBeVisible();
    await expect(page.locator("[data-mobile-tools-toggle]")).toBeHidden();
  });

  test(`${locale.code} announcement stays within two lines`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/now/`, { waitUntil: "networkidle" });

    const announcement = page.locator(".cyber-announce");
    await expect(announcement).toBeVisible();
    const metrics = await announcement.evaluate((node) => {
      const styles = getComputedStyle(node);
      return {
        height: node.getBoundingClientRect().height,
        lineHeight: parseFloat(styles.lineHeight)
      };
    });

    expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 2 + 1);
  });

  test(`${locale.code} chat input appears in the initial viewport`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/avatar/`, { waitUntil: "networkidle" });

    const viewport = page.viewportSize();
    const input = page.locator(".interaction-shell--page-chat textarea");
    const box = await input.boundingBox();

    expect(viewport).not.toBeNull();
    expect(box).not.toBeNull();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  });
}


test("system, dark, and light themes resolve on key pages", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-biying-theme-mode", "system");
  await expect(page.locator("html")).toHaveAttribute("data-biying-theme", "dark");

  await page.evaluate(() => localStorage.setItem("biying-theme", "dark"));
  await page.goto(`${site.url}/en/`, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-biying-theme-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-biying-theme", "dark");

  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.goto(`${site.url}/zh/avatar/`, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-biying-theme-mode", "light");
  await expect(page.locator("html")).toHaveAttribute("data-biying-theme", "light");
});
