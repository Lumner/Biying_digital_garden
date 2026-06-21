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

test("Theme switcher supports system, dark, and light modes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${site.url}/zh/`);

  const html = page.locator("html");
  const switcher = page.locator("[data-theme-switcher]");

  await expect(switcher).toBeVisible();
  await expect(html).toHaveAttribute("data-biying-theme-mode", "system");
  await expect(html).toHaveAttribute("data-biying-theme", "dark");
  await expect(switcher).toHaveAttribute("aria-pressed", "mixed");

  await switcher.click();
  await expect(html).toHaveAttribute("data-biying-theme-mode", "dark");
  await expect(html).toHaveAttribute("data-biying-theme", "dark");
  await expect(switcher).toHaveAttribute("data-theme-mode", "dark");

  await switcher.click();
  await expect(html).toHaveAttribute("data-biying-theme-mode", "light");
  await expect(html).toHaveAttribute("data-biying-theme", "light");
  await expect(switcher).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(html).toHaveAttribute("data-biying-theme-mode", "light");
  await expect(html).toHaveAttribute("data-biying-theme", "light");

  await switcher.click();
  await expect(html).toHaveAttribute("data-biying-theme-mode", "system");
  await expect(html).toHaveAttribute("data-biying-theme", "dark");
});

test("Account page uses sign in, register, and recovery panels", async ({ page }) => {
  await page.goto(`${site.url}/zh/register/`);

  const access = page.locator("[data-auth-access]");
  const signedIn = page.locator("[data-auth-signed-in]");
  const login = page.locator("[data-auth-login]");
  const register = page.locator("[data-auth-register]");
  const reset = page.locator("[data-auth-reset]");
  const privateMessage = page.locator("[data-auth-private]");

  await expect(access).toBeVisible();
  await expect(signedIn).toBeHidden();
  await expect(login).toBeVisible();
  await expect(register).toBeHidden();
  await expect(reset).toBeHidden();
  await expect(privateMessage).toBeVisible();
  await expect(page.getByRole("tab", { name: "登录" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("tab", { name: "注册" }).click();
  await expect(register).toBeVisible();
  await expect(login).toBeHidden();

  await page.getByRole("tab", { name: "登录" }).click();
  await page.getByRole("button", { name: "忘记密码？" }).click();
  await expect(reset).toBeVisible();
  await expect(login).toBeHidden();
  await expect(register).toBeHidden();
  await expect(privateMessage).toBeVisible();

  await page.getByRole("button", { name: "返回登录" }).click();
  await expect(login).toBeVisible();
  await expect(reset).toBeHidden();
});

test("Account page hides auth forms after sign in and supports sign out", async ({ page }) => {
  await page.route(`${site.url}/api/auth`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            username: "biying",
            displayName: "biying"
          }
        })
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto(`${site.url}/zh/register/`);
  await page.evaluate(() => {
    localStorage.setItem("biying-auth-session", JSON.stringify({
      token: "test-token",
      user: {
        username: "biying",
        displayName: "biying"
      }
    }));
  });
  await page.reload();

  await expect(page.locator("[data-auth-signed-in]")).toBeVisible();
  await expect(page.locator("[data-auth-access]")).toBeHidden();
  await expect(page.locator("[data-auth-login]")).toBeHidden();
  await expect(page.locator("[data-auth-register]")).toBeHidden();
  await expect(page.getByRole("button", { name: "退出登录" })).toBeVisible();

  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page.locator("[data-auth-access]")).toBeVisible();
  await expect(page.locator("[data-auth-login]")).toBeVisible();
  await expect(page.locator("[data-auth-signed-in]")).toBeHidden();
});

test("Custom cursor assets are packaged in site CSS", async ({ page }) => {
  const css = await page.request.get(`${site.url}/assets/styles/cyber.css`);
  expect(css.ok()).toBe(true);
  const cssText = await css.text();
  expect(cssText).toContain("pikachu-cursor.svg");
  expect(cssText).toContain("pikachu-pointer.svg");
  expect(cssText).toContain("body *");
  expect(cssText).toContain("button *");
  expect(cssText).toContain("button:active");
  expect(cssText).toContain(".md-search__form");

  const cursor = await page.request.get(`${site.url}/assets/images/cursors/pikachu-cursor.svg`);
  const pointer = await page.request.get(`${site.url}/assets/images/cursors/pikachu-pointer.svg`);
  expect(cursor.ok()).toBe(true);
  expect(pointer.ok()).toBe(true);
});

test("Light homepage keeps hero artwork and readable companion chat", async ({ page }) => {
  await page.goto(`${site.url}/zh/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const heroBackground = await page.locator(".home-immersive-hero").evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(heroBackground).toContain("home-hero-light.png");
  await expect(page.locator(".home-below-fold [data-site-stats]")).toBeVisible();

  await page.getByRole("button", { name: "和碧影聊聊" }).click();
  const companion = page.locator(".biying-chat--companion");
  await expect(companion).toBeVisible();

  const styles = await companion.evaluate((node) => {
    const panel = getComputedStyle(node);
    const message = getComputedStyle(node.querySelector(".biying-message"));
    const textarea = getComputedStyle(node.querySelector("textarea"));
    return {
      panelBackground: panel.backgroundImage,
      messageColor: message.color,
      textareaColor: textarea.color
    };
  });

  expect(styles.panelBackground).toContain("rgba(255, 255, 255");
  expect(styles.messageColor).toBe("rgb(49, 83, 75)");
  expect(styles.textareaColor).toBe("rgb(16, 40, 34)");
});

test("Light notes page keeps cards readable", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const topic = page.locator(".topic-card").filter({ hasText: "数学" });
  await expect(topic).toBeVisible();
  await expect(page.locator(".note-tile--catalog").first()).toBeVisible();

  const styles = await topic.evaluate((node) => {
    const label = getComputedStyle(node.querySelector("span"));
    const count = getComputedStyle(node.querySelector("strong"));
    const description = getComputedStyle(node.querySelector("p"));
    return {
      background: getComputedStyle(node).backgroundImage,
      labelColor: label.color,
      countColor: count.color,
      descriptionColor: description.color
    };
  });

  expect(styles.background).toContain("rgba(31, 125, 109");
  expect(styles.labelColor).toBe("rgb(8, 127, 111)");
  expect(styles.countColor).toBe("rgb(16, 40, 34)");
  expect(styles.descriptionColor).toBe("rgb(82, 110, 103)");
});

test("Light Biying page keeps chat controls readable", async ({ page }) => {
  await page.goto(`${site.url}/zh/avatar/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const chat = page.locator(".interaction-shell--page-chat .biying-chat");
  const send = chat.getByRole("button", { name: "发送" });
  await expect(chat.locator("textarea")).toBeVisible();
  await expect(send).toBeVisible();

  const styles = await chat.evaluate((node) => {
    const textarea = node.querySelector("textarea");
    const button = node.querySelector("button[type='submit']");
    const message = node.querySelector(".biying-message");
    return {
      textareaFontSize: getComputedStyle(textarea).fontSize,
      buttonColor: getComputedStyle(button).color,
      buttonBackground: getComputedStyle(button).backgroundImage,
      buttonFontSize: getComputedStyle(button).fontSize,
      messageFontSize: getComputedStyle(message).fontSize
    };
  });

  expect(styles.buttonColor).toBe("rgb(6, 78, 69)");
  expect(styles.buttonBackground).toContain("rgba(31, 125, 109");
  expect(parseFloat(styles.buttonFontSize)).toBeGreaterThanOrEqual(15);
  expect(parseFloat(styles.textareaFontSize)).toBeGreaterThanOrEqual(15);
  expect(parseFloat(styles.messageFontSize)).toBeGreaterThanOrEqual(15);
});

test("Top navigation puts account between friends and updates", async ({ page }) => {
  await page.goto(`${site.url}/zh/`);
  const nav = page.locator(".md-tabs");
  await expect(nav).toContainText("友链");
  await expect(nav).toContainText("注册/登录");
  await expect(nav).toContainText("模块更新");
  const order = await nav.evaluate((node) => node.textContent || "");
  expect(order.indexOf("友链")).toBeLessThan(order.indexOf("注册/登录"));
  expect(order.indexOf("注册/登录")).toBeLessThan(order.indexOf("模块更新"));
  expect(order).not.toContain("站点统计");
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
  await chat.locator("textarea").press("Enter");
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
