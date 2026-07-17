import fs from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


const baseline = JSON.parse(
  fs.readFileSync(
    new URL("../.quality/accessibility-baseline.json", import.meta.url),
    "utf8"
  )
);
const routes = [
  "/zh/",
  "/en/",
  "/zh/notes/computer-systems-lecture/",
  "/zh/avatar/",
  "/zh/register/",
  "/zh/guestbook/",
  "/zh/admin/"
];
let site;

test.describe.configure({ timeout: 60000 });


function violationSummary(violations) {
  return violations
    .map((violation) => `${violation.id}: ${violation.nodes.length} nodes`)
    .join("\n");
}


function compactViolations(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length
  }));
}


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


for (const route of routes) {
  test(`${route} does not exceed the accessibility baseline`, async ({ page }, testInfo) => {
    await page.goto(`${site.url}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const critical = results.violations.filter((violation) => violation.impact === "critical");
    expect(
      compactViolations(critical),
      `Critical accessibility violations:\n${violationSummary(critical)}`
    ).toEqual([]);

    const key = `${testInfo.project.name}:${route}`;
    const allowed = baseline.allowedSerious[key] || {};
    const serious = results.violations.filter((violation) => violation.impact === "serious");
    const unexpected = serious.filter(
      (violation) => violation.nodes.length > Number(allowed[violation.id] || 0)
    );
    expect(
      compactViolations(unexpected),
      `Serious accessibility violations above baseline for ${key}:\n${violationSummary(serious)}`
    ).toEqual([]);
  });
}
