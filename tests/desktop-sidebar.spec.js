import { expect, test } from "@playwright/test";

import { startStaticSiteServer } from "./static-site-server.js";

const preferencesKey = "biying-sidebar-preferences-v1";
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

async function openLecture(page) {
  await page.goto(`${site.url}/zh/notes/computer-systems-lecture/`, { waitUntil: "networkidle" });
}

test("sidebar handles have accessible names and support keyboard toggling", async ({ page }) => {
  await openLecture(page);

  const primaryHandle = page.locator('[data-sidebar-handle="primary"]');
  const secondaryHandle = page.locator('[data-sidebar-handle="secondary"]');
  const primarySidebar = page.locator(".md-sidebar--primary");
  const secondarySidebar = page.locator(".md-sidebar--secondary");

  await expect(primaryHandle).toBeVisible();
  await expect(primaryHandle).toHaveAccessibleName("展开主导航");
  await expect(primaryHandle).toHaveAttribute("aria-controls", "biying-sidebar-primary");
  await expect(primaryHandle).toHaveAttribute("aria-expanded", "false");
  await expect(secondaryHandle).toBeVisible();
  await expect(secondaryHandle).toHaveAccessibleName("展开本页目录");
  await expect(secondaryHandle).toHaveAttribute("aria-controls", "biying-sidebar-secondary");
  await expect(secondaryHandle).toHaveAttribute("aria-expanded", "false");
  await expect(primarySidebar).toHaveAttribute("inert", "");
  await expect(secondarySidebar).toHaveAttribute("inert", "");

  await primaryHandle.focus();
  await page.keyboard.press("Enter");
  await expect(primaryHandle).toHaveAttribute("aria-expanded", "true");
  await expect(primaryHandle).toHaveAccessibleName("收起主导航");
  await expect(primarySidebar).not.toHaveAttribute("inert", "");
  await expect(primarySidebar).toHaveCSS("opacity", "1");
  await expect(primarySidebar.locator("a:visible").first()).toBeVisible();

  await page.keyboard.press("Space");
  await expect(primaryHandle).toHaveAttribute("aria-expanded", "false");
  await expect(primarySidebar).toHaveAttribute("inert", "");
  await expect(primarySidebar).toHaveCSS("opacity", "0");
});

test("long lecture keeps a visible table-of-contents entry while scrolling", async ({ page }) => {
  await openLecture(page);

  const handle = page.locator('[data-sidebar-handle="secondary"]');
  const sidebar = page.locator(".md-sidebar--secondary");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));

  const bounds = await handle.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
  await expect(handle).toHaveAccessibleName("展开本页目录");

  await handle.focus();
  await page.keyboard.press("Enter");
  await expect(handle).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar).toHaveCSS("opacity", "1");
  await expect(sidebar.locator("a:visible").first()).toBeVisible();
});

test("sidebar preference is restored from device-local storage", async ({ page }) => {
  await openLecture(page);
  await page.evaluate((key) => localStorage.removeItem(key), preferencesKey);
  await page.reload({ waitUntil: "networkidle" });

  const handle = page.locator('[data-sidebar-handle="primary"]');
  await handle.click();
  await expect(handle).toHaveAttribute("aria-expanded", "true");

  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), preferencesKey);
  expect(stored).toEqual({ primary: true, secondary: false });

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('[data-sidebar-handle="primary"]')).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".md-sidebar--primary")).toHaveCSS("opacity", "1");
});

test("light navigation uses the same readable soft surface as the table of contents", async ({ page }) => {
  await openLecture(page);
  await page.evaluate((key) => {
    localStorage.setItem("biying-theme", "light");
    localStorage.setItem(key, JSON.stringify({ primary: true, secondary: false }));
  }, preferencesKey);
  await page.reload({ waitUntil: "networkidle" });

  const sidebar = page.locator(".md-sidebar--primary");
  await expect(page.locator('[data-sidebar-handle="primary"]')).toHaveAccessibleName("收起主导航");
  await expect(sidebar).toHaveCSS("opacity", "1");

  const styles = await sidebar.evaluate((element) => {
    const wrap = element.querySelector(".md-sidebar__scrollwrap");
    const wrapStyle = getComputedStyle(wrap);
    return {
      wrapBackground: wrapStyle.backgroundColor,
      wrapColor: wrapStyle.color
    };
  });

  expect(styles.wrapBackground).not.toBe("rgba(0, 0, 0, 0)");
  expect(styles.wrapColor).not.toBe(styles.wrapBackground);
  await expect(sidebar.locator("a:visible").first()).toBeVisible();
});

test("unscrolled homepage sections remain fully opaque after enhancement starts", async ({ page }) => {
  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  const state = await page.locator(".home-section").last().evaluate((element) => {
    const style = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return {
      opacity: style.opacity,
      top: bounds.top,
      visibility: style.visibility,
      viewportHeight: window.innerHeight
    };
  });

  expect(state.top).toBeGreaterThan(state.viewportHeight);
  expect(state.opacity).toBe("1");
  expect(state.visibility).toBe("visible");
});

test("reduced-motion mode disables continuous animation and reveal preparation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${site.url}/zh/`, { waitUntil: "networkidle" });

  await expect(page.locator("html")).not.toHaveClass(/reveal-enhanced/);
  const continuousAnimations = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*")).filter((element) => {
      const style = getComputedStyle(element);
      if (style.animationName === "none") return false;
      return style.animationIterationCount
        .split(",")
        .some((iteration) => iteration.trim() === "infinite");
    }).length
  );
  expect(continuousAnimations).toBe(0);
});

test("system cursor semantics are preserved for text and controls", async ({ page }) => {
  await page.goto(`${site.url}/zh/avatar/`, { waitUntil: "networkidle" });

  const cursors = await page.evaluate(() => {
    const disabled = document.createElement("button");
    disabled.disabled = true;
    disabled.textContent = "disabled";
    document.body.appendChild(disabled);
    return {
      body: getComputedStyle(document.body).cursor,
      button: getComputedStyle(document.querySelector("button:not(:disabled)")).cursor,
      disabled: getComputedStyle(disabled).cursor,
      textarea: getComputedStyle(document.querySelector("textarea")).cursor
    };
  });

  expect(cursors.body).not.toContain("url(");
  expect(cursors.button).toMatch(/pointer|auto/);
  expect(cursors.disabled).toBe("not-allowed");
  expect(cursors.textarea).toBe("text");
});
