import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

let site;

test.use({
  hasTouch: false,
  isMobile: false,
  viewport: { width: 1440, height: 900 }
});

test.beforeAll(async () => {
  site = await startStaticSiteServer();
});

test.afterAll(async () => {
  await site?.close();
});

test("right table of contents can be revealed after scrolling into an article", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await page.waitForTimeout(120);

  const sidebar = page.locator(".md-sidebar--secondary");
  const before = await sidebar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      bottom: rect.bottom,
      height: rect.height,
      opacity: getComputedStyle(el).opacity,
      top: rect.top,
      width: rect.width,
      x: rect.x
    };
  });

  expect(before.top).toBeGreaterThanOrEqual(0);
  expect(before.bottom).toBeLessThanOrEqual(900);
  expect(before.height).toBeGreaterThan(600);
  expect(before.opacity).toBe("0");

  await page.mouse.click(before.x + before.width - 16, before.bottom - 24);
  await expect(page.locator("body")).toHaveClass(/sidebar-secondary-peek/);
  await expect(sidebar).toHaveCSS("opacity", "1");
});

test("left navigation reveals on hover and hides after pointer leaves", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "networkidle" });

  const sidebar = page.locator(".md-sidebar--primary");
  const before = await sidebar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const styles = getComputedStyle(el);
    return {
      height: rect.height,
      opacity: styles.opacity,
      transform: styles.transform,
      width: rect.width,
      x: rect.x,
      y: rect.y
    };
  });

  expect(before.height).toBeGreaterThan(600);
  expect(before.opacity).toBe("0");
  expect(before.transform).toBe("none");

  await page.mouse.move(before.x + Math.min(36, before.width / 2), before.y + 72);
  await expect(page.locator("body")).toHaveClass(/sidebar-primary-peek/);
  await expect(sidebar).toHaveCSS("opacity", "1");

  await page.mouse.move(720, 460);
  await expect(sidebar).toHaveCSS("opacity", "0", { timeout: 2000 });
});

test("light left navigation uses the same soft surface as the right sidebar", async ({ page }) => {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("biying-theme", "light"));
  await page.reload({ waitUntil: "networkidle" });

  const sidebar = page.locator(".md-sidebar--primary");
  const before = await sidebar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width
    };
  });

  await page.mouse.move(before.x + Math.min(24, before.width / 2), before.y + 72);
  await expect(page.locator("body")).toHaveClass(/sidebar-primary-peek/);
  await expect(sidebar).toHaveCSS("opacity", "1");

  const styles = await sidebar.evaluate((el) => {
    const title = el.querySelector(".md-nav__title");
    const wrap = el.querySelector(".md-sidebar__scrollwrap");
    const nested = el.querySelector(".md-nav__item .md-nav");
    const titleStyle = getComputedStyle(title);
    const wrapStyle = getComputedStyle(wrap);
    const headerStyle = getComputedStyle(wrap, "::before");
    const nestedStyle = getComputedStyle(nested);
    return {
      headerColor: headerStyle.color,
      headerContent: headerStyle.content,
      nestedBorderLeft: nestedStyle.borderLeftWidth,
      titleDisplay: titleStyle.display,
      wrapBackground: wrapStyle.backgroundColor,
      wrapBoxShadow: wrapStyle.boxShadow
    };
  });

  expect(styles.headerContent).not.toBe("none");
  expect(styles.headerColor).toBe("rgb(31, 102, 90)");
  expect(styles.nestedBorderLeft).toBe("0px");
  expect(styles.titleDisplay).toBe("none");
  expect(styles.wrapBackground).toContain("rgba(250, 254, 251");
  expect(styles.wrapBoxShadow).not.toContain("0.35rem");
});
