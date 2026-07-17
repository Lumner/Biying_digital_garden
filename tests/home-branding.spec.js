import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

const locales = [
  {
    code: "zh",
    title: "Lumner 的碧影数字花园",
    primary: "查看项目",
    secondary: "和碧影对话",
    nav: ["首页", "笔记", "项目", "关于", "碧影", "更多"],
    auxiliary: ["现在", "留言", "友链", "注册/登录", "隐私", "模块更新"],
    repeatedHeadings: ["从这里继续向下走", "可以从哪里逛起", "从哪里开始"],
    emptyCategories: ["AI", "随笔"]
  },
  {
    code: "en",
    title: "Lumner's Biying Digital Garden",
    primary: "View Projects",
    secondary: "Talk to Biying",
    nav: ["Home", "Notes", "Projects", "About", "Biying", "More"],
    auxiliary: ["Now", "Guestbook", "Friends", "Account", "Privacy", "Updates"],
    repeatedHeadings: ["Keep walking from here", "Public Signals", "Ways In"],
    emptyCategories: ["AI", "Essays"]
  }
];

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

for (const locale of locales) {
  test(`${locale.code} homepage clarifies identity and keeps a single hero CTA pair`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    const hero = page.locator(".home-immersive-hero");
    await expect(hero.locator(".home-title")).toHaveText(locale.title);
    await expect(hero.locator(".cyber-actions .cyber-button:not(.secondary)")).toHaveCount(1);
    await expect(hero.locator(".cyber-actions .cyber-button.secondary")).toHaveCount(1);
    await expect(hero.locator(".cyber-actions .cyber-button:not(.secondary)")).toHaveText(locale.primary);
    await expect(hero.locator(".cyber-actions .cyber-button.secondary")).toHaveText(locale.secondary);
  });

  test(`${locale.code} homepage removes repeated route lists and avoids empty category cards`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    await expect(page.locator(".home-below-fold__routes")).toHaveCount(0);
    await expect(page.locator(".home-section--evidence .cyber-card")).toHaveCount(3);

    const mainText = await page.locator("main").textContent();
    for (const heading of locale.repeatedHeadings) {
      expect(mainText).not.toContain(heading);
    }
    expect(mainText).not.toMatch(/待补充|占位|TBD|placeholder|lorem/i);

    const evidenceTitles = await page.locator(".home-section--evidence .cyber-card h3").allTextContents();
    for (const category of locale.emptyCategories) {
      expect(evidenceTitles.map((title) => title.trim())).not.toContain(category);
    }
  });

  test(`${locale.code} top navigation exposes core destinations and moves utilities into more`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    const visibleTabs = (await page.locator(".md-tabs__item:visible").allTextContents())
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    for (const item of locale.nav) {
      expect(visibleTabs).toContain(item);
    }
    for (const item of locale.auxiliary) {
      expect(visibleTabs).not.toContain(item);
    }
  });
}

test("English public identity uses 2025 cohort wording", async ({ page }) => {
  await page.goto(`${site.url}/en/about/`, { waitUntil: "networkidle" });

  const mainText = await page.locator("main").textContent();
  expect(mainText).toContain("2025 cohort");
  expect(mainText).not.toContain("Class of 2025");
});
