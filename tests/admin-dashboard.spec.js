import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("admin token becomes an HttpOnly session that survives reload and clears on logout", async ({
  context,
  page
}) => {
  let sessionActive = false;
  let exchangeCount = 0;
  let dashboardCount = 0;

  await page.route("**/api/admin**", async (route) => {
    const request = route.request();
    const body = request.method() === "POST"
      ? request.postDataJSON()
      : {};
    const json = (payload, options = {}) => route.fulfill({
      status: options.status || 200,
      contentType: "application/json",
      headers: options.headers,
      body: JSON.stringify(payload)
    });

    if (body.action === "create_session") {
      expect(request.headers().authorization).toBe("Bearer browser-admin-token");
      exchangeCount += 1;
      sessionActive = true;
      return json({
        ok: true,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString()
      }, {
        headers: {
          "set-cookie": "biying_admin_session=browser-session; Path=/api; HttpOnly; SameSite=Strict; Max-Age=1200"
        }
      });
    }

    if (body.action === "logout") {
      expect(request.headers().cookie || "").toContain(
        "biying_admin_session=browser-session"
      );
      sessionActive = false;
      return json({ ok: true }, {
        headers: {
          "set-cookie": "biying_admin_session=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0"
        }
      });
    }

    if (request.method() === "GET" && sessionActive) {
      expect(request.headers().cookie || "").toContain(
        "biying_admin_session=browser-session"
      );
      dashboardCount += 1;
      return json({
        users: [{
          id: "admin-test-user",
          username: "admin_test",
          displayName: "Admin Test",
          createdAt: "2026-07-18T00:00:00.000Z",
          passwordUpdatedAt: ""
        }],
        privateMessages: [],
        guestbookMessages: [],
        pageInfo: {}
      });
    }

    return json({ error: "unauthorized" }, { status: 401 });
  });

  await page.goto(`${site.url}/en/admin/`);
  const tokenInput = page.locator("#admin-token");
  await tokenInput.fill("browser-admin-token");
  await page.getByRole("button", { name: "Open dashboard" }).click();

  await expect(page.getByText("Admin Test (@admin_test)")).toBeVisible();
  await expect(tokenInput).toHaveValue("");
  expect(exchangeCount).toBe(1);
  expect(dashboardCount).toBe(1);

  const browserState = await page.evaluate(() => ({
    cookies: document.cookie,
    local: Object.entries(localStorage),
    session: Object.entries(sessionStorage)
  }));
  expect(browserState.cookies).not.toContain("biying_admin_session");
  expect(JSON.stringify(browserState.local)).not.toContain("browser-admin-token");
  expect(JSON.stringify(browserState.session)).not.toContain("browser-admin-token");

  await page.reload();
  await expect(page.getByText("Admin Test (@admin_test)")).toBeVisible();
  expect(exchangeCount).toBe(1);
  expect(dashboardCount).toBe(2);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("Admin Test (@admin_test)")).toHaveCount(0);
  expect(
    (await context.cookies()).some((cookie) => cookie.name === "biying_admin_session")
  ).toBe(false);
});
