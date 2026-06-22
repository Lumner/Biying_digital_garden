import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("Floating companion closes on outside click without clearing chat", async ({ page }) => {
  const storedMessage = "Companion history should remain after closing.";
  await page.setViewportSize({ width: 1024, height: 820 });
  await page.goto(`${site.url}/zh/`);
  await page.evaluate((message) => {
    localStorage.setItem("biying-chat-v1:zh:guest", JSON.stringify({
      transcript: [
        {
          role: "biying",
          content: message,
          markdown: true,
          html: false,
          sources: []
        }
      ],
      history: [
        { role: "assistant", content: message }
      ],
      savedAt: new Date().toISOString()
    }));
  }, storedMessage);
  await page.reload();

  const toggle = page.locator(".biying-companion__toggle");
  const panel = page.locator(".biying-companion__panel");
  await toggle.click();
  await expect(panel).toBeVisible();
  await expect(panel.locator(".biying-message")).toContainText(storedMessage);

  await page.mouse.click(24, 24);
  await expect(panel).toBeHidden();

  await toggle.click();
  await expect(panel.locator(".biying-message")).toContainText(storedMessage);
});
