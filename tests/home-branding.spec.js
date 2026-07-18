import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

const locales = [
  {
    code: "zh",
    title: "碧影数字花园",
    phrases: [
      "向下扎根，也向光生长。",
      "把每一次认真，慢慢写成答案。",
      "愿好奇心不熄，愿行动有回声。",
      "在热爱里长期主义，在日常里保持明亮。"
    ],
    actions: ["和碧影对话", "查看项目", "进入笔记"],
    routes: ["此刻", "笔记", "碧影"],
    nav: ["首页", "现在", "关于", "笔记", "项目", "碧影", "留言", "友链", "注册/登录", "模块更新"]
  },
  {
    code: "en",
    title: "Biying Digital Garden",
    phrases: [
      "Root the work, keep moving toward light.",
      "Let small honest steps become a visible path.",
      "Stay curious. Build gently. Keep going.",
      "Make ordinary days bright enough to remember."
    ],
    actions: ["Talk to Biying", "View Projects", "Read Notes"],
    routes: ["Now", "Notes", "Biying"],
    nav: ["Home", "Now", "About", "Notes", "Projects", "Biying", "Guestbook", "Friends", "Account", "Updates"]
  }
];

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

for (const locale of locales) {
  test(`${locale.code} homepage preserves the original immersive hero contract`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    const hero = page.locator(".home-immersive-hero");
    await expect(hero.locator(".home-title")).toHaveText(locale.title);
    await expect(hero.locator("[data-home-phrase]")).toHaveText(locale.phrases);
    await expect(hero.locator(".cyber-actions .cyber-button")).toHaveText(locale.actions);
    await expect(hero.locator(".cyber-actions .cyber-button:not(.secondary)")).toHaveCount(1);
    await expect(hero.locator(".cyber-actions .cyber-button.secondary")).toHaveCount(2);
    await expect(hero.locator(".home-flow-ribbon")).toHaveCount(2);
    await expect(hero.locator(".home-hero-grid")).toHaveCount(1);
    await expect(hero.locator(".home-hero-scan")).toHaveCount(1);
  });

  test(`${locale.code} homepage preserves the original layered content routes`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    await expect(page.locator(".home-below-fold__routes a")).toHaveCount(3);
    await expect(page.locator(".home-below-fold__routes a > span")).toHaveText(locale.routes);
    await expect(page.locator(".home-pulse__item")).toHaveCount(3);
    await expect(page.locator(".module-update-preview a")).toHaveCount(3);
    await expect(page.locator(".home-section--signals .cyber-card")).toHaveCount(5);
    await expect(page.locator(".home-section--paths .signal-item")).toHaveCount(3);
  });

  test(`${locale.code} top navigation preserves the original direct destinations`, async ({ page }) => {
    await page.goto(`${site.url}/${locale.code}/`, { waitUntil: "networkidle" });

    const visibleTabs = (await page.locator(".md-tabs__item:visible").allTextContents())
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    for (const item of locale.nav) {
      expect(visibleTabs).toContain(item);
    }
    expect(visibleTabs).not.toContain(locale.code === "zh" ? "更多" : "More");
  });
}

test("English public identity keeps the verified 2025 cohort wording", async ({ page }) => {
  await page.goto(`${site.url}/en/about/`, { waitUntil: "networkidle" });

  const mainText = await page.locator("main").textContent();
  expect(mainText).toContain("2025 cohort");
  expect(mainText).not.toContain("Class of 2025");
});
