import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

async function seedHttpOnlySession(page, value = "test-token") {
  await page.context().addCookies([{
    name: "biying_session",
    value,
    url: site.url,
    httpOnly: true,
    sameSite: "Lax"
  }]);
}

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

test("Light mobile sidebars use light navigation surfaces", async ({ page }) => {
  await page.goto(`${site.url}/zh/now/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const drawerToggle = page.locator("label.md-header__button[for='__drawer']");
  await expect(drawerToggle).toBeVisible();
  await drawerToggle.click();

  const primarySidebar = page.locator(".md-sidebar--primary");
  const drawerTitle = primarySidebar.locator(".md-nav__title[for='__drawer']");
  await expect(drawerTitle).toBeVisible();

  const styles = await drawerTitle.evaluate((node) => {
    const computed = getComputedStyle(node);
    return {
      background: computed.backgroundImage,
      color: computed.color,
      boxShadow: computed.boxShadow
    };
  });

  expect(styles.background).toContain("rgba(255, 255, 255");
  expect(styles.color).toBe("rgb(31, 102, 90)");
  expect(styles.boxShadow).not.toContain("0px 8px 24px");
});

test("Theme switcher supports system, dark, and light modes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${site.url}/zh/`);

  const html = page.locator("html");
  const tools = page.locator("[data-mobile-tools-toggle]");
  const switcher = page.locator("[data-mobile-theme]");

  await tools.click();
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

  await tools.click();
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

  await seedHttpOnlySession(page);
  await page.goto(`${site.url}/zh/register/`);

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

test("Account login keeps credentials out of Web Storage and script-visible cookies", async ({ page }) => {
  let loginAuthorization = "";
  await page.route(`${site.url}/api/auth`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ user: null })
      });
      return;
    }
    loginAuthorization = route.request().headers().authorization || "";
    await route.fulfill({
      contentType: "application/json",
      headers: {
        "set-cookie": "biying_session=new-cookie-session; Path=/; HttpOnly; SameSite=Lax"
      },
      body: JSON.stringify({
        ok: true,
        user: {
          username: "cookie_reader",
          displayName: "Cookie Reader"
        }
      })
    });
  });

  await page.goto(`${site.url}/zh/register/`);
  const login = page.locator("[data-auth-login]");
  await login.getByLabel(/用户名/).fill("cookie_reader");
  await login.getByLabel(/密码/).fill("a secure password");
  await login.getByRole("button", { name: "登录", exact: true }).click();

  await expect(page.locator("[data-auth-signed-in]")).toContainText("Cookie Reader");
  expect(loginAuthorization).toBe("");
  expect(await page.evaluate(() => localStorage.getItem("biying-auth-session"))).toBeNull();
  expect(await page.evaluate(() => document.cookie)).not.toContain("biying_session");
  const cookie = (await page.context().cookies(site.url))
    .find((item) => item.name === "biying_session");
  expect(cookie?.httpOnly).toBe(true);
});

test("Legacy Web Storage session migrates once and is then removed", async ({ page }) => {
  let migrations = 0;
  await page.route(`${site.url}/api/auth`, async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      if (payload.action === "migrate_session") {
        migrations += 1;
        expect(route.request().headers().authorization).toBe("Bearer legacy-token");
        await route.fulfill({
          contentType: "application/json",
          headers: {
            "set-cookie": "biying_session=migrated-cookie; Path=/; HttpOnly; SameSite=Lax"
          },
          body: JSON.stringify({
            ok: true,
            migrated: true,
            user: {
              username: "legacy_reader",
              displayName: "Legacy Reader"
            }
          })
        });
        return;
      }
    }
    const user = migrations
      ? { username: "legacy_reader", displayName: "Legacy Reader" }
      : null;
    await route.fulfill({
      status: user ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify({ user })
    });
  });

  await page.goto(`${site.url}/zh/register/`);
  await page.evaluate(() => {
    localStorage.setItem("biying-auth-session", JSON.stringify({
      token: "legacy-token",
      user: {
        username: "legacy_reader",
        displayName: "Legacy Reader"
      }
    }));
  });
  await page.reload();

  await expect(page.locator("[data-auth-signed-in]")).toContainText("Legacy Reader");
  expect(migrations).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("biying-auth-session"))).toBeNull();
  expect(await page.evaluate(() => document.cookie)).not.toContain("biying_session");

  await page.reload();
  await expect(page.locator("[data-auth-signed-in]")).toContainText("Legacy Reader");
  expect(migrations).toBe(1);
});

test("Interactive controls keep usable cursor semantics", async ({ page }) => {
  await page.goto(`${site.url}/zh/avatar/`);
  const cursors = await page.evaluate(() => ({
    button: getComputedStyle(document.querySelector("button")).cursor,
    textarea: getComputedStyle(document.querySelector("textarea")).cursor
  }));
  expect(cursors.button).toMatch(/pointer|auto/);
  expect(cursors.textarea).toMatch(/text|auto/);
});

test("Light homepage keeps hero artwork and readable companion chat", async ({ page }) => {
  await page.goto(`${site.url}/zh/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const heroBackground = await page.locator(".home-immersive-hero").evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(heroBackground).not.toBe("none");
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

test("Light article code and Biying code blocks stay readable", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/discrete-math-lecture/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const table = page.locator(".md-typeset table:not([class])").first();
  const inlineCode = page.locator(".md-typeset code").first();
  await expect(table).toBeVisible();
  await expect(inlineCode).toBeVisible();

  const articleStyles = await page.evaluate(() => {
    const tableNode = document.querySelector(".md-typeset table:not([class])");
    const th = tableNode?.querySelector("th");
    const td = tableNode?.querySelector("td");
    const code = document.querySelector(".md-typeset code");
    return {
      tableBackground: getComputedStyle(tableNode).backgroundColor,
      thBackground: getComputedStyle(th).backgroundColor,
      thColor: getComputedStyle(th).color,
      tdColor: getComputedStyle(td).color,
      codeBackground: getComputedStyle(code).backgroundColor,
      codeColor: getComputedStyle(code).color
    };
  });

  expect(articleStyles.tableBackground).toContain("rgba(250, 254, 251");
  expect(articleStyles.thBackground).toContain("rgba(31, 125, 109");
  expect(articleStyles.thColor).toBe("rgb(23, 58, 51)");
  expect(articleStyles.tdColor).toBe("rgb(36, 69, 61)");
  expect(articleStyles.codeBackground).toContain("rgba(229, 246, 240");
  expect(articleStyles.codeColor).toBe("rgb(23, 58, 51)");

  await page.goto(`${site.url}/zh/avatar/`);
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload();

  const chatStyles = await page.evaluate(() => {
    const log = document.querySelector(".interaction-shell--page-chat .biying-chat__log");
    const injected = document.createElement("div");
    injected.className = "biying-message biying";
    injected.innerHTML = "<pre><code>const answer = 42;</code></pre>";
    log.appendChild(injected);
    const pre = injected.querySelector("pre");
    const code = injected.querySelector("code");
    return {
      preBackground: getComputedStyle(pre).backgroundImage,
      preColor: getComputedStyle(pre).color,
      codeColor: getComputedStyle(code).color
    };
  });

  expect(chatStyles.preBackground).toContain("rgba(31, 125, 109");
  expect(chatStyles.preColor).toBe("rgb(23, 58, 51)");
  expect(chatStyles.codeColor).toBe("rgb(23, 58, 51)");
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

test("Top navigation exposes the core personal-site destinations", async ({ page }) => {
  await page.goto(`${site.url}/zh/`);
  const nav = page.locator(".md-tabs");
  await expect(nav).toContainText("首页");
  await expect(nav).toContainText("笔记");
  await expect(nav).toContainText("项目");
  await expect(nav).toContainText("关于");
  await expect(nav).toContainText("碧影");
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

test("Biying chat reveals answers progressively", async ({ page }) => {
  const answer = [
    "This answer is intentionally long enough to verify the visible streaming state.",
    "Biying should reveal it in a steady rhythm before the final markdown render happens.",
    "The saved transcript should still receive the complete response after the animation."
  ].join(" ").repeat(4);

  await page.route(`${site.url}/api/auth`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          username: "biying",
          displayName: "biying"
        }
      })
    });
  });

  await page.route(`${site.url}/api/chat`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ answer, sources: [] })
    });
  });

  await seedHttpOnlySession(page);
  await page.goto(`${site.url}/zh/avatar/`);

  const chat = page.locator(".interaction-shell--page-chat .biying-chat");
  await chat.locator("textarea").fill("Please stream the response.");
  await chat.locator("button[type='submit']").click();

  const streaming = chat.locator(".biying-message.biying.is-streaming");
  await expect(streaming).toBeVisible();
  await page.waitForTimeout(90);
  const partialText = await streaming.textContent();
  expect(partialText || "").not.toHaveLength(0);
  expect((partialText || "").length).toBeLessThan(answer.length);

  await expect(streaming).toBeHidden({ timeout: 6000 });
  await expect(chat.locator(".biying-message.biying").last()).toContainText("complete response");
});

test("Biying markdown keeps ordered list numbering across blank lines", async ({ page }) => {
  const answer = [
    "1. First step",
    "",
    "2. Second step",
    "",
    "3. Third step"
  ].join("\n");

  await page.route(`${site.url}/api/auth`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          username: "biying",
          displayName: "biying"
        }
      })
    });
  });

  await page.route(`${site.url}/api/chat`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ answer, sources: [] })
    });
  });

  await seedHttpOnlySession(page);
  await page.goto(`${site.url}/zh/avatar/`);

  const chat = page.locator(".interaction-shell--page-chat .biying-chat");
  await chat.locator("textarea").fill("Please return a numbered list.");
  await chat.locator("button[type='submit']").click();
  await expect(chat.locator(".biying-message.biying").last()).toContainText("Third step");

  const starts = await chat.locator(".biying-message.biying").last().evaluate((node) =>
    Array.from(node.querySelectorAll("ol"), (list) => list.getAttribute("start"))
  );

  expect(starts).toEqual(["1", "2", "3"]);
});

test("Biying chat requests and parses event-stream answers", async ({ page }) => {
  let requestedStreaming = false;
  let requestAuthorization = "";
  let requestCookie = "";
  let resolveChatRequest;
  const chatRequested = new Promise((resolve) => {
    resolveChatRequest = resolve;
  });
  const answer = "First streamed piece, second streamed piece.";

  await page.route(`${site.url}/api/auth`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          username: "biying",
          displayName: "biying"
        }
      })
    });
  });

  await page.route(`${site.url}/api/chat`, async (route) => {
    requestedStreaming = route.request().postDataJSON().stream === true;
    requestAuthorization = route.request().headers().authorization || "";
    requestCookie = route.request().headers().cookie || "";
    resolveChatRequest();
    await new Promise((resolve) => setTimeout(resolve, 180));
    await route.fulfill({
      contentType: "text/event-stream; charset=utf-8",
      body: [
        "event: meta",
        "data: {\"sources\":[{\"title\":\"Source note\",\"url\":\"/zh/notes/\"}]}",
        "",
        "event: delta",
        "data: {\"delta\":\"First streamed piece, \"}",
        "",
        "event: delta",
        "data: {\"delta\":\"second streamed piece.\"}",
        "",
        "event: done",
        `data: ${JSON.stringify({ answer })}`,
        "",
        ""
      ].join("\n")
    });
  });

  await seedHttpOnlySession(page);
  await page.goto(`${site.url}/zh/avatar/`);

  const chat = page.locator(".interaction-shell--page-chat .biying-chat");
  await chat.locator("textarea").fill("Use real stream mode.");
  await chat.locator("button[type='submit']").click();

  await chatRequested;
  const pending = chat.locator(".biying-message.biying.is-typing").last();
  await expect(pending.locator(".typing-dots")).toBeVisible();

  await expect(chat.locator(".biying-message.biying").last()).toContainText("second streamed piece");
  await expect(chat.locator(".biying-sources a")).toHaveAttribute("href", "/zh/notes/");
  expect(requestedStreaming).toBe(true);
  expect(requestAuthorization).toBe("");
  expect(requestCookie).toContain("biying_session=test-token");
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
