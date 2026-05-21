import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("Biying page chat stays readable on mobile", async ({ page }, testInfo) => {
  await page.goto(`${site.url}/zh/avatar/`);

  const chat = page.locator(".interaction-shell--page-chat .biying-chat");
  const message = chat.locator(".biying-message.biying").first();
  const textarea = chat.locator("textarea");

  await expect(chat).toBeVisible();
  await expect(message).toBeVisible();
  await expect(textarea).toBeVisible();

  const chatBox = await chat.boundingBox();
  const messageBox = await message.boundingBox();
  expect(chatBox).not.toBeNull();
  expect(messageBox).not.toBeNull();
  expect(messageBox.width).toBeGreaterThan(260);
  expect(messageBox.height).toBeLessThan(180);
  expect(messageBox.x).toBeGreaterThanOrEqual(chatBox.x - 1);
  expect(messageBox.x + messageBox.width).toBeLessThanOrEqual(chatBox.x + chatBox.width + 1);

  await page.evaluate(() => {
    const log = document.querySelector(".interaction-shell--page-chat .biying-chat__log");
    const injected = document.createElement("div");
    injected.className = "biying-message biying mathjax-process";
    injected.textContent = "长公式检查：$$\\sum_{i=1}^{n}\\frac{\\alpha_i\\beta_i}{1+\\gamma_i^2}=\\nabla\\cdot\\vec{E}$$";
    log.appendChild(injected);
  });

  const overflows = await chat.evaluate((node) => node.scrollWidth > node.clientWidth + 1);
  expect(overflows).toBe(false);

  await page.screenshot({
    path: testInfo.outputPath("zh-avatar-mobile.png"),
    fullPage: true
  });
});

test("Floating companion opens full-screen and closes on mobile", async ({ page }, testInfo) => {
  await page.goto(`${site.url}/zh/`);

  const toggle = page.getByRole("button", { name: "和碧影聊聊" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  const panel = page.locator(".biying-companion__panel");
  await expect(panel).toBeVisible();

  const viewport = page.viewportSize();
  const panelBox = await panel.boundingBox();
  expect(viewport).not.toBeNull();
  expect(panelBox).not.toBeNull();
  expect(panelBox.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(panelBox.height).toBeLessThanOrEqual(viewport.height + 1);

  await page.screenshot({
    path: testInfo.outputPath("zh-home-companion-mobile.png"),
    fullPage: true
  });

  await page.getByRole("button", { name: "关闭聊天" }).click();
  await expect(panel).toBeHidden();
});
