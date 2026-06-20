import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("friend links render clickable cards with auto favicon avatars", async ({ page }) => {
  await page.route("**/assets/data/friend-links.json", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            name: "Ada Notes",
            url: "https://ada.example/",
            intro: {
              zh: "喜欢写工程笔记和小工具的朋友。",
              en: "A friend who writes engineering notes and tiny tools."
            },
            tags: ["notes", "tools"]
          }
        ]
      })
    });
  });
  await page.route("**/favicon.ico", async (route) => {
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#55ffe2"/></svg>'
    });
  });

  await page.goto(`${site.url}/zh/friends/`, { waitUntil: "networkidle" });

  const card = page.locator(".friend-card").first();
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("href", "https://ada.example/");
  await expect(card.locator("strong")).toHaveText("Ada Notes");
  await expect(card.locator(".friend-card__intro")).toContainText("工程笔记");
  await expect(card.locator("[data-friend-avatar]")).toHaveAttribute("src", "https://ada.example/favicon.ico");
});

test("friend links support self-hosted avatar paths", async ({ page }) => {
  const avatarPath = "/assets/images/friends/lin.svg";
  await page.route("**/assets/data/friend-links.json", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            name: "Lin Lab",
            url: "https://lin.example/",
            avatar: avatarPath,
            intro: {
              zh: "喜欢做实验和记录灵感的朋友。",
              en: "A friend who experiments and records ideas."
            }
          }
        ]
      })
    });
  });
  await page.route("**/assets/images/friends/lin.svg", async (route) => {
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#f4c983"/></svg>'
    });
  });

  await page.goto(`${site.url}/zh/friends/`, { waitUntil: "networkidle" });

  const card = page.locator(".friend-card").first();
  await expect(card.locator("strong")).toHaveText("Lin Lab");
  await expect(card.locator("[data-friend-avatar]")).toHaveAttribute("src", new URL(avatarPath, site.url).href);
});
