import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("Homepage hamburger opens the mobile navigation drawer", async ({ page }) => {
  await page.goto(`${site.url}/zh/`);

  const drawerToggle = page.locator("label.md-header__button[for='__drawer']");
  const drawer = page.locator("#__drawer");
  const primarySidebar = page.locator(".md-sidebar--primary");

  await expect(drawerToggle).toBeVisible();
  await drawerToggle.click();

  await expect(drawer).toBeChecked();
  await expect(primarySidebar).toBeVisible();
  await expect(primarySidebar.locator(".md-nav__title[for='__drawer']")).toBeVisible();
});

test("Theme switcher toggles and persists the light theme", async ({ page }) => {
  await page.goto(`${site.url}/zh/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "dark"));
  await page.reload();

  const html = page.locator("html");
  const switcher = page.locator("[data-theme-switcher]");

  await expect(switcher).toBeVisible();
  await expect(html).toHaveAttribute("data-biying-theme", "dark");

  await switcher.click();
  await expect(html).toHaveAttribute("data-biying-theme", "light");
  await expect(switcher).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(html).toHaveAttribute("data-biying-theme", "light");
});

test("Account page defaults to sign in and switches account panels", async ({ page }) => {
  await page.goto(`${site.url}/zh/register/`);

  const login = page.locator("[data-auth-login]");
  const register = page.locator("[data-auth-register]");
  const reset = page.locator("[data-auth-reset]");
  const privateMessage = page.locator("[data-auth-private]");

  await expect(login).toBeVisible();
  await expect(register).toBeHidden();
  await expect(reset).toBeHidden();
  await expect(privateMessage).toBeVisible();
  await expect(page.getByRole("tab", { name: "登录" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("tab", { name: "注册" }).click();
  await expect(register).toBeVisible();
  await expect(login).toBeHidden();

  await page.getByRole("tab", { name: "忘记密码" }).click();
  await expect(reset).toBeVisible();
  await expect(register).toBeHidden();
  await expect(privateMessage).toBeVisible();
});

test("Custom cursor assets are packaged in site CSS", async ({ page }) => {
  const css = await page.request.get(`${site.url}/assets/styles/cyber.css`);
  expect(css.ok()).toBe(true);
  const cssText = await css.text();
  expect(cssText).toContain("pikachu-cursor.svg");
  expect(cssText).toContain("pikachu-pointer.svg");

  const cursor = await page.request.get(`${site.url}/assets/images/cursors/pikachu-cursor.svg`);
  const pointer = await page.request.get(`${site.url}/assets/images/cursors/pikachu-pointer.svg`);
  expect(cursor.ok()).toBe(true);
  expect(pointer.ok()).toBe(true);
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

test("Biying chat restores local transcript and skips transient auth prompts", async ({ page }) => {
  const storedMessage = "Persisted hello from local storage.";
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

  await page.goto(`${site.url}/zh/avatar/`);

  const chat = page.locator(".interaction-shell--page-chat .biying-chat");
  await expect(chat.locator(".biying-message")).toHaveText(storedMessage);

  await chat.locator("textarea").fill("This should only show the sign-in hint.");
  await chat.locator(".biying-chat__form button[type='submit']").click();
  await expect(chat.locator(".biying-message")).toHaveCount(2);

  await page.reload();
  await expect(chat.locator(".biying-message")).toHaveText(storedMessage);

  await chat.locator(".biying-chat__clear").click();
  await expect(chat.locator(".biying-message")).toHaveCount(1);
  await expect(chat.locator(".biying-message")).not.toHaveText(storedMessage);
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
