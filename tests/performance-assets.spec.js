import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

async function scriptSources(page, route) {
  await page.goto(`${site.url}${route}`, { waitUntil: "networkidle" });
  return page.locator("script[src]").evaluateAll((scripts) =>
    scripts.map((script) => script.getAttribute("src") || "")
  );
}

test("original Noto Sans SC and JetBrains Mono typography is restored", async ({ page }) => {
  const fontRequests = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
      fontRequests.push(url);
    }
  });

  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  expect(fontRequests.some((url) =>
    url.includes("fonts.googleapis.com") &&
    url.includes("Noto+Sans+SC") &&
    url.includes("JetBrains+Mono")
  )).toBe(true);
  await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(1);
});

test("feature scripts load only on relevant pages", async ({ page }) => {
  const home = await scriptSources(page, "/zh/");
  expect(home.some((src) => src.includes("site-stats.js"))).toBe(true);
  expect(home.some((src) => src.includes("random-note-cover.js"))).toBe(true);
  expect(home.some((src) => src.includes("guestbook.js"))).toBe(false);
  expect(home.some((src) => src.includes("admin-dashboard.js"))).toBe(false);
  expect(home.some((src) => src.includes("notes-hub.js"))).toBe(false);
  expect(home.some((src) => src.includes("friend-links.js"))).toBe(false);

  const notes = await scriptSources(page, "/zh/notes/");
  expect(notes.some((src) => src.includes("tex-mml-chtml.chunk-01.js"))).toBe(true);
  expect(notes.some((src) => src.includes("tex-mml-chtml-loader.js"))).toBe(true);
  expect(notes.some((src) => src.includes("notes-hub.js"))).toBe(true);
  expect(notes.some((src) => src.includes("note-reader.js"))).toBe(true);
  expect(notes.some((src) => src.includes("guestbook.js"))).toBe(false);
  expect(notes.some((src) => src.includes("admin-dashboard.js"))).toBe(false);

  const guestbook = await scriptSources(page, "/zh/guestbook/");
  expect(guestbook.some((src) => src.includes("toast.js"))).toBe(true);
  expect(guestbook.some((src) => src.includes("guestbook.js"))).toBe(true);
  expect(guestbook.some((src) => src.includes("admin-dashboard.js"))).toBe(false);

  const admin = await scriptSources(page, "/zh/admin/");
  expect(admin.some((src) => src.includes("toast.js"))).toBe(true);
  expect(admin.some((src) => src.includes("admin-dashboard.js"))).toBe(true);
  expect(admin.some((src) => src.includes("guestbook.js"))).toBe(false);

  const friends = await scriptSources(page, "/zh/friends/");
  expect(friends.some((src) => src.includes("friend-links.js"))).toBe(true);
  expect(friends.some((src) => src.includes("guestbook.js"))).toBe(false);
  expect(friends.some((src) => src.includes("admin-dashboard.js"))).toBe(false);
});

test("hero artwork uses the original rain and light illustrations", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  const darkBackground = await page.locator(".home-immersive-hero").evaluate((node) =>
    getComputedStyle(node).backgroundImage
  );
  expect(darkBackground).toContain("home-hero-rain-1440.webp");

  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload({ waitUntil: "networkidle" });
  const lightBackground = await page.locator(".home-immersive-hero").evaluate((node) =>
    getComputedStyle(node).backgroundImage
  );
  expect(lightBackground).toContain("home-hero-light-1440.webp");
});

test("math pages initialize the chunked MathJax bundle", async ({ page }) => {
  const mathErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("MathJax")) {
      mathErrors.push(message.text());
    }
  });

  await page.goto(`${site.url}/zh/notes/fds-data-structures-lecture/`, { waitUntil: "networkidle" });

  await expect(page.locator("html")).toHaveClass(/math-ready/);
  await expect(page.locator("mjx-container").first()).toBeVisible();
  expect(mathErrors).toEqual([]);
});

test("key pages do not emit missing static asset responses", async ({ page }) => {
  const failures = [];
  page.on("response", (response) => {
    const url = new URL(response.url());
    const staticAsset = /\.(?:css|js|json|png|jpe?g|svg|webp|woff)$/i.test(url.pathname);
    if (url.origin === site.url && staticAsset && response.status() >= 400) {
      failures.push(`${response.status()} ${url.pathname}`);
    }
  });

  for (const route of ["/zh/", "/zh/notes/", "/zh/guestbook/", "/zh/admin/", "/zh/friends/"]) {
    await page.goto(`${site.url}${route}`, { waitUntil: "networkidle" });
  }

  expect(failures).toEqual([]);
});

test("shared frontend utilities preserve live status and busy-state behavior", async ({ page }) => {
  await page.goto(`${site.url}/zh/register/`, { waitUntil: "networkidle" });

  const state = await page.evaluate(() => {
    const status = document.createElement("p");
    const form = document.createElement("form");
    const button = document.createElement("button");
    button.type = "submit";
    form.appendChild(button);

    window.BiyingDom.setLiveStatus(status, "请求失败", "error");
    window.BiyingDom.setBusy(form, true);
    const busy = {
      text: status.textContent,
      state: status.dataset.state,
      role: status.getAttribute("role"),
      live: status.getAttribute("aria-live"),
      ariaBusy: form.getAttribute("aria-busy"),
      disabled: button.disabled
    };
    window.BiyingDom.setBusy(form, false);
    return {
      ...busy,
      restoredBusy: form.getAttribute("aria-busy"),
      restoredDisabled: button.disabled
    };
  });

  expect(state).toEqual({
    text: "请求失败",
    state: "error",
    role: "alert",
    live: "assertive",
    ariaBusy: "true",
    disabled: true,
    restoredBusy: "false",
    restoredDisabled: false
  });
});

test("site statistics use the shared JSON API client", async ({ page }) => {
  const requests = [];
  await page.route("**/api/stats", async (route) => {
    requests.push({
      method: route.request().method(),
      contentType: route.request().headers()["content-type"] || "",
      body: route.request().postDataJSON()
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ totalVisitors: 12, pageViews: 34 })
    });
  });

  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  await expect(page.locator("[data-site-stat='totalVisitors']")).toHaveText("12");
  await expect(page.locator("[data-site-stat='pageViews']")).toHaveText("34");
  await expect(page.locator("[data-site-stat-status]")).toHaveText("来访脚印已更新");
  expect(requests).toHaveLength(1);
  expect(requests[0].method).toBe("POST");
  expect(requests[0].contentType).toContain("application/json");
  expect(requests[0].body).toMatchObject({ locale: "zh" });
  expect(requests[0].body.visitorId).toBeTruthy();
});
