import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";


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
const testUser = {
  username: "keyboard_reader",
  displayName: "Keyboard Reader"
};
const testSession = {
  token: "test-accessibility-token",
  user: testUser
};

test.describe.configure({ timeout: 60000 });


function violationSummary(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 8)
        .map((node) => `  - ${node.target.join(" ")}`)
        .join("\n");
      return `${violation.id}: ${violation.nodes.length} nodes\n${targets}`;
    })
    .join("\n");
}


function compactViolations(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length
  }));
}


async function seedAuthenticatedSession(page) {
  await page.context().addCookies([{
    name: "biying_session",
    value: testSession.token,
    url: site.url,
    httpOnly: true,
    sameSite: "Lax"
  }]);
}


async function mockCurrentUser(page) {
  await page.route("**/api/auth", async (route) => {
    const method = route.request().method();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(method === "GET" ? { user: testUser } : { ok: true })
    });
  });
}


async function expectCustomFieldsToHaveNames(page, selector) {
  const unnamed = await page.locator(selector).evaluateAll((elements) => elements
    .filter((element) => !element.hidden)
    .map((element) => {
      const labelText = [...(element.labels || [])]
        .map((label) => label.textContent.trim())
        .join(" ")
        .trim();
      const labelledByText = String(element.getAttribute("aria-labelledby") || "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent.trim() || "")
        .join(" ")
        .trim();
      const accessibleName = (
        labelText ||
        element.getAttribute("aria-label") ||
        labelledByText ||
        element.getAttribute("title") ||
        ""
      ).trim();
      return accessibleName ? null : element.outerHTML;
    })
    .filter(Boolean));
  expect(unnamed).toEqual([]);
}


test.beforeAll(async () => {
  site = await startStaticSiteServer();
});


test.afterAll(async () => {
  await site?.close();
});


for (const route of routes) {
  test(`${route} has no critical or serious accessibility violations`, async ({ page }) => {
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

    const serious = results.violations.filter((violation) => violation.impact === "serious");
    expect(
      compactViolations(serious),
      `Serious accessibility violations:\n${violationSummary(serious)}`
    ).toEqual([]);
  });
}


test("custom form controls have real accessible names and example-only placeholders", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the structural form audit once in desktop Chromium.");

  const cases = [
    {
      route: "/zh/register/",
      selector: "[data-auth] input:not([hidden]), [data-auth] textarea:not([hidden]), [data-auth] select:not([hidden])"
    },
    {
      route: "/zh/admin/",
      selector: "[data-admin-dashboard] input:not([hidden]), [data-admin-dashboard] textarea:not([hidden]), [data-admin-dashboard] select:not([hidden])"
    },
    {
      route: "/zh/",
      selector: "[data-biying-chat] input:not([hidden]), [data-biying-chat] textarea:not([hidden]), [data-biying-chat] select:not([hidden])"
    }
  ];
  const nonExamplePlaceholders = [];
  const honeypotStates = [];

  for (const entry of cases) {
    await page.goto(`${site.url}${entry.route}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(entry.selector).first()).toBeAttached();
    await expectCustomFieldsToHaveNames(page, entry.selector);
    nonExamplePlaceholders.push(...await page.locator(entry.selector).evaluateAll((elements) => elements
      .map((element) => element.getAttribute("placeholder"))
      .filter(Boolean)
      .filter((placeholder) => !/^(例如：|For example:)/.test(placeholder))));
    honeypotStates.push(...await page.locator(".hp-field").evaluateAll((elements) => elements.map((element) => ({
      hidden: element.hidden,
      tabIndex: element.tabIndex,
      ariaHidden: element.getAttribute("aria-hidden")
    }))));
  }

  await seedAuthenticatedSession(page);
  await mockCurrentUser(page);
  await page.route("**/api/messages", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ messages: [] })
    });
  });
  await page.goto(`${site.url}/zh/guestbook/`, { waitUntil: "domcontentloaded" });
  const guestbookFields = "[data-guestbook] input:not([hidden]), [data-guestbook] textarea:not([hidden]), [data-guestbook] select:not([hidden])";
  await expect(page.locator(guestbookFields).first()).toBeVisible();
  await expectCustomFieldsToHaveNames(page, guestbookFields);
  nonExamplePlaceholders.push(...await page.locator(guestbookFields).evaluateAll((elements) => elements
    .map((element) => element.getAttribute("placeholder"))
    .filter(Boolean)
    .filter((placeholder) => !/^(例如：|For example:)/.test(placeholder))));
  expect(nonExamplePlaceholders).toEqual([]);

  honeypotStates.push(...await page.locator(".hp-field").evaluateAll((elements) => elements.map((element) => ({
    hidden: element.hidden,
    tabIndex: element.tabIndex,
    ariaHidden: element.getAttribute("aria-hidden")
  }))));
  expect(honeypotStates).not.toEqual([]);
  expect(honeypotStates.every((field) => field.hidden && field.tabIndex === -1 && field.ariaHidden === "true")).toBe(true);
});


test("skip link becomes visible on focus and moves focus to the main content", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the skip-link keyboard check once in desktop Chromium.");
  await page.goto(`${site.url}/zh/`, { waitUntil: "domcontentloaded" });

  const skipLink = page.locator(".biying-skip-link");
  await skipLink.focus();
  const focusStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      opacity: style.opacity,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      top: element.getBoundingClientRect().top
    };
  });
  expect(focusStyle.opacity).toBe("1");
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(focusStyle.top).toBeGreaterThanOrEqual(0);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});


test("account tabs support arrows, Home, and End", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the tab keyboard contract once in desktop Chromium.");
  await page.goto(`${site.url}/zh/register/`, { waitUntil: "domcontentloaded" });

  const login = page.getByRole("tab", { name: "登录" });
  const register = page.getByRole("tab", { name: "注册" });
  await login.focus();
  await page.keyboard.press("ArrowRight");
  await expect(register).toBeFocused();
  await expect(register).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-auth-register]")).toBeVisible();

  await page.keyboard.press("Home");
  await expect(login).toBeFocused();
  await expect(login).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("End");
  await expect(register).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(login).toBeFocused();
});


test("mobile chat dialog traps focus, closes with Escape, and restores the trigger", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "This contract is specific to the mobile modal chat.");
  await page.goto(`${site.url}/zh/`, { waitUntil: "domcontentloaded" });

  const toggle = page.getByRole("button", { name: "和碧影聊聊" });
  const dialog = page.getByRole("dialog", { name: "碧影" });
  const close = dialog.getByRole("button", { name: "关闭聊天" });
  const submit = dialog.getByRole("button", { name: "发送" });

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog.getByLabel("想和碧影聊什么？")).toBeFocused();

  await submit.focus();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(submit).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});


test("login can be completed by keyboard and field errors are programmatically associated", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the keyboard form submission once in desktop Chromium.");
  let attempts = 0;
  await page.route("**/api/auth", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: null })
      });
      return;
    }
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "invalid_credentials" })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: testSession.token,
        user: testUser
      })
    });
  });

  await page.goto(`${site.url}/zh/register/`, { waitUntil: "domcontentloaded" });
  const loginForm = page.locator("[data-auth-login]");
  const username = loginForm.getByLabel(/用户名/);
  const password = loginForm.getByLabel(/密码/);
  const message = loginForm.locator("[data-auth-login-message]");

  await username.focus();
  await page.keyboard.type(testUser.username);
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await page.keyboard.type("wrong password");
  await page.keyboard.press("Enter");

  await expect(message).toHaveAttribute("role", "alert");
  await expect(username).toHaveAttribute("aria-invalid", "true");
  await expect(password).toHaveAttribute("aria-invalid", "true");
  await expect(username).toHaveAttribute("aria-describedby", /auth-login-message/);
  await expect(password).toHaveAttribute("aria-describedby", /auth-login-message/);

  await password.focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("correct horse battery staple");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-auth-signed-in]")).toBeVisible();
  await expect(page.locator("[data-auth-signed-in]")).toContainText(testUser.displayName);
  expect(await page.evaluate(() => localStorage.getItem("biying-auth-session"))).toBeNull();
});


test("guestbook message can be posted with the keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the guestbook keyboard flow once in desktop Chromium.");
  const messages = [];
  await seedAuthenticatedSession(page);
  await mockCurrentUser(page);
  await page.route("**/api/messages", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      const created = {
        id: "keyboard-message",
        name: testUser.displayName,
        username: testUser.username,
        content: payload.content,
        createdAt: "2026-07-17T00:00:00.000Z",
        canEdit: true
      };
      messages.push(created);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ message: created })
      });
      return;
    }
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ messages })
    });
  });

  await page.goto(`${site.url}/zh/guestbook/`, { waitUntil: "domcontentloaded" });
  const textarea = page.getByLabel("想留下一句什么？");
  const content = "这是一条仅使用键盘提交的测试留言。";
  await expect(textarea).toBeVisible();
  await textarea.focus();
  await page.keyboard.type(content);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "留下这句话" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.locator("[data-guestbook-message]")).toHaveText("已保存。");
  await expect(page.locator(".guestbook__list")).toContainText(content);
});


test("typewriter and streamed chat avoid per-chunk live announcements", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the live-region behavior once in desktop Chromium.");
  const finalAnswer = "这是一次完整的最终回答。";
  await seedAuthenticatedSession(page);
  await mockCurrentUser(page);
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        answer: finalAnswer,
        sources: []
      })
    });
  });

  await page.goto(`${site.url}/zh/`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-home-typewriter]")).not.toHaveAttribute("aria-live", /.+/);
  const toggle = page.getByRole("button", { name: "和碧影聊聊" });
  await toggle.click();
  const chat = page.locator(".biying-companion [data-biying-chat]");
  const log = chat.locator(".biying-chat__log");
  const status = chat.locator("[data-biying-chat-status]");
  await expect(log).not.toHaveAttribute("aria-live", /.+/);
  await expect(status).toHaveAttribute("role", "status");

  await status.evaluate((element) => {
    window.__biyingAnnouncements = [];
    const observer = new MutationObserver(() => {
      const value = element.textContent.trim();
      if (value) window.__biyingAnnouncements.push(value);
    });
    observer.observe(element, { childList: true, characterData: true, subtree: true });
  });

  const input = chat.getByLabel("想和碧影聊什么？");
  await input.fill("请给我一个完整回答");
  await input.press("Enter");
  await expect(status).toHaveText(finalAnswer);

  const announcements = await page.evaluate(() => window.__biyingAnnouncements || []);
  expect(announcements).toContain("碧影正在思考。");
  expect(announcements).toContain(finalAnswer);
  expect(
    announcements.filter((message) => finalAnswer.startsWith(message) && message !== finalAnswer)
  ).toEqual([]);
});
