import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("project index stays honest while only one real case is public", async ({ page }) => {
  const locales = [
    {
      route: "/zh/projects/",
      caseTitle: "个人数字花园与碧影",
      pendingText: "至少有 2–3 个真实案例"
    },
    {
      route: "/en/projects/",
      caseTitle: "Personal Digital Garden + Biying",
      pendingText: "at least 2–3 real public cases"
    }
  ];

  for (const locale of locales) {
    const response = await page.goto(`${site.url}${locale.route}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.locator(".work-card")).toHaveCount(1);
    await expect(page.locator(".work-card h3")).toHaveText(locale.caseTitle);
    await expect(page.locator("main")).toContainText(locale.pendingText);
  }
});

test("public project case uses the required case-study structure", async ({ page }) => {
  const cases = [
    {
      route: "/zh/projects/personal-site-avatar/",
      headings: [
        "项目摘要",
        "背景与问题",
        "我的职责",
        "约束条件",
        "关键决策",
        "实现过程",
        "结果与证据",
        "不足与下一步",
        "链接与截图"
      ]
    },
    {
      route: "/en/projects/personal-site-avatar/",
      headings: [
        "Project Summary",
        "Background and Problem",
        "My Role",
        "Constraints",
        "Key Decisions",
        "Implementation Process",
        "Results and Evidence",
        "Limitations and Next Steps",
        "Links and Screenshots"
      ]
    }
  ];

  for (const item of cases) {
    const response = await page.goto(`${site.url}${item.route}`, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const headings = await page.locator("article h2").allTextContents();
    for (const heading of item.headings) {
      expect(headings.map((text) => text.replace(/\s*¶$/, "").trim())).toContain(heading);
    }
    await expect(page.locator("main")).not.toContainText(/虚构指标|invented metrics/i);
  }
});
